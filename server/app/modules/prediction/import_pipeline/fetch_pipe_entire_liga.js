const { Client } = require('pg');

// 1. CONFIGURATION
let target_database = "";
let TOUNRAMENT_ID = "";
const API_BASE_URL = 'https://play.toornament.com/api/matches'; // <-- Change to actual URL
const TARGET_TABLE = 'entire_liga_flat';
const ITEMS_PER_PAGE = 128; // The max items returned per request
const EXCLUDED_PATHS=
[
    "publicnotes",
    "opponents_0_participant_type",
    "opponents_0_participant_team",
    "opponents_0_participant_lineup",
    "opponents_0_rank",
    "opponents_1_participant_type",
    "opponents_1_participant_team",
    "opponents_1_participant_lineup",
    "opponents_1_rank",
    "tournament_id",
    "tournament_discipline",
    "tournament_name",
    "tournament_status",
    "tournament_participanttype",
    "tournament_scheduleddatestart",
    "tournament_scheduleddateend",
    "tournament_public",
    "tournament_logo_id",
    "tournament_settings_paymentgateway",
    "opponents_0_participant_customfieldvalues_logo_icon_small",
    "opponents_0_participant_customfieldvalues_logo_icon_medium",
    "opponents_0_participant_customfieldvalues_logo_logo_small",
    "opponents_0_participant_customfieldvalues_logo_logo_medium",
    "opponents_1_participant_customfieldvalues_logo_icon_small",
    "opponents_1_participant_customfieldvalues_logo_icon_medium",
    "opponents_1_participant_customfieldvalues_logo_logo_small",
    "opponents_1_participant_customfieldvalues_logo_logo_medium"

];

// 2. JSON Flattening (adapted with your specific exclusions and map logic)
function flattenJSON(obj, prefix = '') {
    let flatDict = {};

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        // // IGNORE specific keys entirely (replacing the XML tagName checks)
        // if (key === 'stage' || key === 'group') {
        //     continue;
        // }



        const currentPath = prefix ? `${prefix}_${key}` : key;
        const value = obj[key];
        
        // EXCLUSION CHECK
        if (EXCLUDED_PATHS.includes(currentPath)) {
            continue;
        }

        // Group specific "map" objects into a single JSON string
        if (key === 'map' && typeof value === 'object' && value !== null) {
            flatDict[currentPath] = JSON.stringify(value);
            continue;
        }

        // If it's a nested object or array (and not null)
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    flatDict[currentPath] = "";
                } else {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            Object.assign(flatDict, flattenJSON(item, `${currentPath}_${index}`));
                        } else {
                            flatDict[`${currentPath}_${index}`] = item !== null ? String(item).trim() : "";
                        }
                    });
                }
            } else {
                Object.assign(flatDict, flattenJSON(value, currentPath));
            }
        } else {
            // Leaf node: save the value
            flatDict[currentPath] = value !== null && value !== undefined ? String(value).trim() : "";
        }
    }
    return flatDict;
}

// 3. Fetch Data with Automatic Pagination
async function fetchAllData() {
    let allRecords = [];
    let offset = 0; // Change to offset = 0 if your API uses offset-based pagination
    let hasMore = true;

    console.log(`Starting data fetch from API...`);

    while (hasMore) {
        // TODO: Adjust the query parameters (?page= or ?offset=) to match your API's pagination rules
        const requestUrl = `${API_BASE_URL}?tournament_ids=${TOUNRAMENT_ID}&statuses=completed&sort=latest_results&offset=${offset}`; //&limit=${ITEMS_PER_PAGE}
        console.log(`Fetching: ${requestUrl}`);

        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract the array of items. 
        // If API returns { "items": [...] }, use data.items. If it returns [...] directly, use data.
        const items = Array.isArray(data) ? data : (data.items || []);

        if (items.length === 0) {
            console.log("No more items found. Ending fetch loop.");
            break;
        }

        // Flatten this batch and add to our master list
        const records = items.map(item => flattenJSON(item));
        allRecords.push(...records);
        
        console.log(`offset ${offset}: Fetched ${items.length} items. Total so far: ${allRecords.length}`);

        // If we received fewer items than the max limit, we've hit the very end of the database
        if (items.length < ITEMS_PER_PAGE) {
            hasMore = false;
        } else {
            offset+=128; // Move to next page for the next loop
        }
    }

    return allRecords;
}

// 4. Main DB Execution
async function main(target_db,target_tournament) {
    target_database = target_db;
    TOUNRAMENT_ID = target_tournament;
    try {
        const allRecords = await fetchAllData();

        if (allRecords.length === 0) {
            console.log("No records fetched. Exiting.");
            return;
        }

        // Build a master schema of ALL unique columns across ALL fetched items
        const allColumns = new Set();
        allRecords.forEach(record => {
            Object.keys(record).forEach(key => allColumns.add(key));
        });
        const columns = Array.from(allColumns);

        const colDefs = columns.map(col => {
            const cleanCol = col.toLowerCase();
            return cleanCol.endsWith('map_data') ? `"${cleanCol}" JSONB` : `"${cleanCol}" TEXT`;
        });

        const createTableSql = `
            CREATE TABLE IF NOT EXISTS ${TARGET_TABLE} (
                db_id SERIAL PRIMARY KEY,
                ${colDefs.join(', ')}
            );
        `;

        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `
            INSERT INTO ${TARGET_TABLE} (${columns.map(c => `"${c.toLowerCase()}"`).join(', ')})
            VALUES (${placeholders});
        `;

        // Connect to the DB and execute
        const client = new Client({
            user: 'admin',
            password: 'secretpassword',
            host: 'db',
            port: 5432,
            database: target_database
        });

        await client.connect();
        
        console.log(`\nCreating table '${TARGET_TABLE}' with ${columns.length} columns...`);
        await client.query(createTableSql);

        //create config file for liga
        await client.query(`
            CREATE TABLE IF NOT EXISTS config (last_update TIMESTAMPTZ)`).then(async()=>{
                await client.query(`
                    INSERT INTO config (last_update) VALUES ('epoch'::TIMESTAMPTZ);`);
            });

        
        console.log(`Inserting ${allRecords.length} total records...`);
        let inserted = 0;
        for (const record of allRecords) {
            const values = columns.map(col => record[col] !== undefined ? record[col] : null);
            await client.query(insertSql, values);
            inserted++;
        }
        
        console.log(`Success! Inserted ${inserted} records into '${TARGET_TABLE}'.`);
        await client.end();
        
    } catch (err) {
        console.error("Pipeline error:", err);
    }
}

module.exports.run = main;