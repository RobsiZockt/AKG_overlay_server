const { Client } = require('pg');

// --- CONFIGURATION ---
const SOURCE_COLUMN = 'id';
const SOURCE_TABLE = 'entire_liga_flat';
const NEW_TABLE = 'matches';
let target_database ="";

// Note: Because JSON arrays use numbers natively, "item_" is removed from the path.
// e.g., "lineup_item_0_logo" becomes "lineup_0_logo".
let EXCLUDED_PATHS = [
    "oponents_0_participant_logo",
    "oponents_0_participant_type",
    "oponents_0_participant_customFieldValues",
    "oponents_0_participant_name",
    "oponents_0_participant_team",
    "oponents_0_participant_lineup",
    "oponents_0_rank",
    "oponents_0_properties",
    "oponents_1_participant_logo",
    "oponents_1_participant_type",
    "oponents_1_participant_customFieldValues",
    "oponents_1_participant_name",
    "oponents_1_participant_team",
    "oponents_1_participant_lineup",
    "oponents_1_rank",
    "oponents_1_properties",
    "tournament_discipline",
    "tournament_name",
    "tournament_status",
    "tournament_participantType",
    "tournament_scheduledDateStart",
    "tournament_scheduledDateEnd",
    "tournament_public",
    "tournament_logo",
    "tournament_settings",
    "stage_tournament",
    "stage_number",
    "stage_type",
    "stage_status",
    "stage_closed",
    "stage_settings",
    "type",
    "scoreType",
    "status",
    "scheduledDatetime",
    "reportStatus",
    "reportClosed",
    "settings",
    "group_settings"

];

function generateExcludePaths(){
    let arr;
    for(let i = 0; i<10;i++){
        arr =[`matchSets_${i}_type`,`matchSets_${i}_scoreType`,`matchSets_${i}_opponents_0_rank`,`matchSets_${i}_opponents_0_properties`,`matchSets_${i}_opponents_1_rank`,`matchSets_${i}_opponents_1_properties`];
        EXCLUDED_PATHS= EXCLUDED_PATHS.concat(arr);
    }

}

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
    const path = "https://play.toornament.com/api/matches/" + entryValue; 
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
    generateExcludePaths();
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
        const columns = Object.keys(newDataset[0]);
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

        await client.query(`
                ALTER TABLE matches
                ALTER COLUMN playedat TYPE TIMESTAMPTZ
                USING playedat::TIMESTAMPTZ;`);

    } catch (err) {
        console.error("Pipeline error:", err);
    } finally {
        await client.end();
    }
}


module.exports.run = main;