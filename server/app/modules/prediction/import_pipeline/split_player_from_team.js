const { Client, Pool } = require("pg");

let target_database="";
// Database connection configuration
let pool = new Pool();

// Function to extract player data from a team record
function extractPlayers(teamData) {
  const players = [];
  const teamId = teamData.id;

  for (let i = 0; i < 10; i++) {
    const nameKey = `lineup_${i}_name`;
    const battleNetKey = `lineup_${i}_customfieldvalues_battle_net_id`;

    if (teamData[nameKey] && teamData[battleNetKey]) {
      players.push({
        team_id: teamId,
        player_name: teamData[nameKey],
        battletag: teamData[battleNetKey]
      });
    }
  }

  return players;
}

// Main function
async function main(target_db) {
  target_database = target_db;

pool = new Pool({
  host: 'db',
  port: 5432,
  user: "admin",
  password: "secretpassword",
  database: target_database,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})


  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    console.log("Connected to PostgreSQL database.");

    // Create new table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS team_players (
        id SERIAL PRIMARY KEY,
        team_id TEXT NOT NULL,
        player_name TEXT,
        battletag TEXT
      )
    `;

    await client.query(createTableQuery);
    console.log("Table 'team_players' created or already exists.");

    // Query to get all teams from your existing table
    const selectQuery = `
      SELECT 
        id,
        lineup_0_name,
        lineup_0_customfieldvalues_battle_net_id,
        lineup_1_name,
        lineup_1_customfieldvalues_battle_net_id,
        lineup_2_name,
        lineup_2_customfieldvalues_battle_net_id,
        lineup_3_name,
        lineup_3_customfieldvalues_battle_net_id,
        lineup_4_name,
        lineup_4_customfieldvalues_battle_net_id,
        lineup_5_name,
        lineup_5_customfieldvalues_battle_net_id,
        lineup_6_name,
        lineup_6_customfieldvalues_battle_net_id,
        lineup_7_name,
        lineup_7_customfieldvalues_battle_net_id,
        lineup_8_name,
        lineup_8_customfieldvalues_battle_net_id,
        lineup_9_name,
        lineup_9_customfieldvalues_battle_net_id
      FROM teams
    `;

    const result = await client.query(selectQuery);
    console.log(`Retrieved ${result.rows.length} teams from database.`);

    // Extract and insert player data
    const allPlayers = [];

    result.rows.forEach(team => {
      const players = extractPlayers(team);
      allPlayers.push(...players);
    });

    console.log(`Extracted ${allPlayers.length} players from teams.`);

    // Insert players into the new table
    if (allPlayers.length > 0) {
      const insertQuery = `
        INSERT INTO team_players (team_id, player_name, battletag)
        VALUES ($1, $2, $3)
      `;

      // Insert each player individually
      for (const player of allPlayers) {
        await client.query(insertQuery, [player.team_id, player.player_name, player.battletag]);
      }

      console.log(`Successfully inserted ${allPlayers.length} players.`);
    } else {
      console.log("No players to insert.");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
  }
}


module.exports.run = main;
