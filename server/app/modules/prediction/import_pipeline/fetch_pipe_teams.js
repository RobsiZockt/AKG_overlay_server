const { Client } = require('pg');

// --- CONFIGURATION ---
const SOURCE_COLUMN = 'opponents_0_participant_id';
const SOURCE_COLUMN_2 = 'opponents_1_participant_id';
const SOURCE_TABLE = 'entire_liga_flat';
const NEW_TABLE = 'teams';
let target_database = "";

// Note: Because JSON arrays use numbers natively, "item_" is removed from the path.
// e.g., "lineup_item_0_logo" becomes "lineup_0_logo".
const EXCLUDED_PATHS = [
    "type",
    "team",
    "lineup_0_logo",
    "lineup_0_playerUser",
    "lineup_0_gameId",
    "lineup_1_logo",
    "lineup_1_playerUser",
    "lineup_1_gameId",
    "lineup_2_logo",
    "lineup_2_playerUser",
    "lineup_2_gameId",
    "lineup_3_logo",
    "lineup_3_playerUser",
    "lineup_3_gameId",
    "lineup_4_logo",
    "lineup_4_playerUser",
    "lineup_4_gameId",
    "lineup_5_logo",
    "lineup_5_playerUser",
    "lineup_5_gameId",
    "lineup_6_logo",
    "lineup_6_playerUser",
    "lineup_6_gameId",
    "lineup_7_logo",
    "lineup_7_playerUser",
    "lineup_7_gameId",
    "lineup_8_logo",
    "lineup_8_playerUser",
    "lineup_8_gameId",
    "lineup_9_logo",
    "lineup_9_playerUser",
    "lineup_9_gameId",
    "checkedIn",
    "tournament_dicipline",
    "tournament_name",
    "tournament_status",
    "tournament_participantType",
    "tournament_size",
    "tournament_scheduledDateStart",
    "tournament_scheduledDateEnd",
    "tournament_public",
    "tournament_logo",
    "tournament_platforms",
    "tournament_checkInEnabled",
    "tournament_checkInParticipantEnabled",
    "tournament_checkInParticipantStartDatetime",
    "tournament_checkInParticipantEndDatetime",
    "tournament_circuit",
    "tournament_circuitSeason",
    "tournament_circuitRegion",
    "tournament_circuitTier",
    "customFieldValues_logo"
];

// 1. New JSON Flattener
function flattenJSON(obj, prefix = '') {
    let flatDict = {};

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const currentPath = prefix + key;

        // EXCLUSION CHECK
        if (EXCLUDED_PATHS.includes(currentPath)) {
            continue;
        }

        const value = obj[key];

        if (key === 'logo') {
            if (value && typeof value === 'object') {
                flatDict[`${prefix}logo_id`] = value.id ? String(value.id).trim() : "";
            } else {
                flatDict[`${prefix}logo_id`] = "";
            }
            continue;
        }

        // Group specific "map" objects into a single JSON string, just like the XML version
        if (key === 'map' && typeof value === 'object' && value !== null) {
            flatDict[`${prefix}map_data`] = JSON.stringify(value);
            continue;
        }

        // If it's a nested object or array, recurse deeper
        if (typeof value === 'object' && value !== null) {
            // Check if it's an empty object/array
            if (Object.keys(value).length === 0) {
                flatDict[currentPath] = "";
            } else {
                Object.assign(flatDict, flattenJSON(value, `${currentPath}_`));
            }
        } else {
            // Leaf node: save the value
            flatDict[currentPath] = value !== null && value !== undefined ? String(value).trim() : "";
        }
    }
    return flatDict;
}

// 2. Updated Fetch for JSON
async function fetchJsonData(entryValue) {
    const path = "https://play.toornament.com/api/participants/" + entryValue; 
    const response = await fetch(path, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse natively as JSON instead of text
    return await response.json(); 
}

// 3. Updated Filter Function
function processJsonData(jsonObject, originalValue) {
    const flattenedData = flattenJSON(jsonObject);
    console.log(flattenedData);
    flattenedData.source_value = originalValue;
    return flattenedData;
}

async function main(target_db) {
    target_database = target_db;
    const client = new Client({
        user: 'admin',
        password: 'secretpassword',
        host: 'db',
        port: 5432,
        database: target_database
    });

    try {
        await client.connect();
        console.log(`Fetching unique values...`);

        // Added "AS entry_id" so JS knows what column to map to
        const queryRes = await client.query(`
            SELECT DISTINCT "${SOURCE_COLUMN}" AS entry_id
            FROM ${SOURCE_TABLE} 
            WHERE "${SOURCE_COLUMN}" IS NOT NULL

            UNION

            SELECT DISTINCT "${SOURCE_COLUMN_2}" AS entry_id
            FROM ${SOURCE_TABLE} 
            WHERE "${SOURCE_COLUMN_2}" IS NOT NULL;
        `);
        
        const uniqueEntries = queryRes.rows.map(row => row.entry_id);
        console.log(`Found ${uniqueEntries.length} unique entries.`);

        if (uniqueEntries.length === 0) return;

        const newDataset = [];
        for (const entry of uniqueEntries) {
            try {
                console.log(`Processing: ${entry}...`);
                const jsonData = await fetchJsonData(entry);
                const filteredData = processJsonData(jsonData, entry);
                newDataset.push(filteredData);
                
                // Optional: await new Promise(r => setTimeout(r, 500)); 
            } catch (err) {
                console.error(`Failed on entry ${entry}:`, err.message);
            }
        }

        if (newDataset.length === 0) {
            console.log("No data was successfully parsed.");
            return;
        }

        // Dynamically create the new table based on your filter output

        let longest_entry_id=0;
        let longest_entry_value =0;
        for(let i = 0;i<newDataset.length;i++ ){
            if(longest_entry_value<Object.keys(newDataset[i]).length){
                longest_entry_id = i;
                longest_entry_value = Object.keys(newDataset[i]).length;
            }

        }

        const columns = Object.keys(newDataset[longest_entry_id]);
        const colDefs = columns.map(col => {
            const cleanCol = col.toLowerCase();
            return cleanCol.endsWith('map_data') ? `"${cleanCol}" JSONB` : `"${cleanCol}" TEXT`;
        });

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${NEW_TABLE} (
                db_id SERIAL PRIMARY KEY,
                ${colDefs.join(', ')}
            );
        `);

        // Insert the new dataset into the database
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `
            INSERT INTO ${NEW_TABLE} (${columns.map(c => `"${c.toLowerCase()}"`).join(', ')})
            VALUES (${placeholders});
        `;

        let inserted = 0;
        for (const record of newDataset) {
            const values = columns.map(col => record[col] !== undefined ? record[col] : null);
            await client.query(insertSql, values);
            inserted++;
        }

        console.log(`Success! Inserted ${inserted} filtered rows into '${NEW_TABLE}'.`);

    } catch (err) {
        console.error("Pipeline error:", err);
    } finally {
        await client.end();
    }
}


module.exports.run = main;