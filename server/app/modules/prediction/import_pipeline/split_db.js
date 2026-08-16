const { Client } = require('pg');

let target_database="";
// 1. Configure your database connection
let client = new Client();

const FLAT_TABLE_NAME = 'matches';

async function runMigration(target_db) {
    target_database = target_db;
    client = new Client({
    user: 'admin',
    host: 'db',
    database: target_database,
    password: 'secretpassword',
    port: 5432,
});
    try {
        await client.connect();
        console.log('Connected to database. Starting migration...');

        // ==========================================
        // STEP 1: CREATE TABLES
        // ==========================================
        console.log('Creating normalized tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS match_sets (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                match_id TEXT NOT NULL,
                set_number INTEGER NOT NULL,
                status TEXT,
                map TEXT,
                UNIQUE(match_id, set_number)
            );

            CREATE TABLE IF NOT EXISTS match_set_results (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                match_set_id BIGINT NOT NULL REFERENCES match_sets(id) ON DELETE CASCADE,
                participant_id TEXT NOT NULL,
                opponent_index INTEGER,
                score INTEGER,
                result TEXT,
                forfeit BOOLEAN,
                position INTEGER
            );
        `);

        // ==========================================
        // STEP 2: BUILD DYNAMIC QUERY FOR MATCH SETS
        // ==========================================
        console.log('Extracting match_sets...');
        let setsSelects = [];
        for (let i = 0; i <= 6; i++) {
            setsSelects.push(`
                SELECT 
                    id AS match_id, 
                    NULLIF(matchsets_${i}_number, '')::INTEGER AS set_number, 
                    NULLIF(matchsets_${i}_status, '') AS status, 
                    NULLIF(matchsets_${i}_properties_map, '')::TEXT AS map
                FROM ${FLAT_TABLE_NAME} 
                WHERE NULLIF(matchsets_${i}_number, '') IS NOT NULL
            `);
        }

        const insertSetsQuery = `
            INSERT INTO match_sets (match_id, set_number, status, map)
            ${setsSelects.join(' UNION ALL ')}
            ON CONFLICT (match_id, set_number) DO NOTHING;
        `;
        await client.query(insertSetsQuery);

        // ==========================================
        // STEP 3: BUILD DYNAMIC QUERY FOR RESULTS
        // ==========================================
        console.log('Extracting match_set_results...');
        let resultsSelects = [];
        
        for (let i = 0; i <= 6; i++) {
            // Opponent 0 logic
            resultsSelects.push(`
                SELECT 
                    ms.id AS match_set_id, 
                    NULLIF(gt.opponents_0_participant_id, '') AS participant_id, 
                    0 AS opponent_index,
                    NULLIF(gt.matchsets_${i}_opponents_0_score, '')::INTEGER AS score, 
                    NULLIF(gt.matchsets_${i}_opponents_0_result, '') AS result, 
                    NULLIF(gt.matchsets_${i}_opponents_0_forfeit, '')::BOOLEAN AS forfeit, 
                    NULLIF(gt.matchsets_${i}_opponents_0_position, '')::INTEGER AS position
                FROM ${FLAT_TABLE_NAME} gt
                JOIN match_sets ms ON ms.match_id = gt.id AND ms.set_number = NULLIF(gt.matchsets_${i}_number, '')::INTEGER
                WHERE NULLIF(gt.matchsets_${i}_number, '') IS NOT NULL 
                  AND NULLIF(gt.opponents_0_participant_id, '') IS NOT NULL
            `);

            // Opponent 1 logic (Correctly uses index 1!)
            resultsSelects.push(`
                SELECT 
                    ms.id AS match_set_id, 
                    NULLIF(gt.opponents_1_participant_id, '') AS participant_id, 
                    1 AS opponent_index,
                    NULLIF(gt.matchsets_${i}_opponents_1_score, '')::INTEGER AS score, 
                    NULLIF(gt.matchsets_${i}_opponents_1_result, '') AS result, 
                    NULLIF(gt.matchsets_${i}_opponents_1_forfeit, '')::BOOLEAN AS forfeit, 
                    NULLIF(gt.matchsets_${i}_opponents_1_position, '')::INTEGER AS position
                FROM ${FLAT_TABLE_NAME} gt
                JOIN match_sets ms ON ms.match_id = gt.id AND ms.set_number = NULLIF(gt.matchsets_${i}_number, '')::INTEGER
                WHERE NULLIF(gt.matchsets_${i}_number, '') IS NOT NULL 
                  AND NULLIF(gt.opponents_1_participant_id, '') IS NOT NULL
            `);
        }

        const insertResultsQuery = `
            INSERT INTO match_set_results (match_set_id, participant_id, opponent_index, score, result, forfeit, position)
            ${resultsSelects.join(' UNION ALL ')};
        `;
        await client.query(insertResultsQuery);

        // ==========================================
        // STEP 4: CLEANUP BAD DATA (NULLS)
        // ==========================================
        console.log('Cleaning up empty/null string results...');
        await client.query(`
            DELETE FROM match_set_results
            WHERE result IS NULL 
               OR TRIM(result) = '' 
               OR LOWER(result) = 'null';
        `);

        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await client.end();
    }
}


module.exports.run = runMigration;