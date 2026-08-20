const { Client, Pool } = require("pg");
const Glicko2 = require("./glicko.js");

let target_database = "";
let last_update = new Date(0);

let stages={
    
}

// Create a connection pool
let pool = new Pool();


// ============================================================
// DATABASE
// ============================================================

async function getLastUpdateTime() {
     const client = await pool.connect();

  try {

    const result = await client.query("SELECT last_update::TEXT FROM config")

    return result.rows[0].last_update;  
    }catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateLastUpdateTime() {

         const client = await pool.connect();

  try {
    last_update = new Date();
    const isoTime = last_update.toISOString();
    await client.query(`UPDATE config SET last_update = '${isoTime}';`)

    }catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getTeamData() {
  const client = await pool.connect();

  try {

    const result = await client.query(
      `SELECT DISTINCT t.id, t.name, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_0_participant_id = t.id 
      WHERE ms.stage_id = '${Object.keys(stages)[0]}' OR ms.stage_id = '${Object.keys(stages)[1]}' OR ms.stage_id = '${Object.keys(stages)[2]}' OR ms.stage_id = '${Object.keys(stages)[3]}' 
      UNION  
      SELECT DISTINCT t.id, t.name, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_1_participant_id = t.id 
      WHERE ms.stage_id = '${Object.keys(stages)[0]}' OR ms.stage_id = '${Object.keys(stages)[1]}' OR ms.stage_id = '${Object.keys(stages)[2]}' OR ms.stage_id = '${Object.keys(stages)[3]}';`
    );

    return result.rows;
  }catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getMatchData() {
  const client = await pool.connect();

  try {
    const isoTime = last_update.toISOString();
    const result = await client.query(
      `SELECT ms.match_id, ms.set_number, o0.score AS op_a_score, o1.score AS op_b_score, o0.participant_id AS teama, o1.participant_id AS teamb, ms.map AS map, m.stage_id, ms.picked_by FROM match_sets ms
      JOIN match_set_results o0 ON ms.id = o0.match_set_id AND o0.opponent_index =0 
      JOIN match_set_results o1 ON ms.id = o1.match_set_id AND o1.opponent_index =1 
      JOIN matches m ON ms.match_id = m.id
      WHERE '${isoTime}' < m.playedat
      ORDER BY m.playedat ASC, ms.match_id ASC, ms.set_number ASC;`,
    );

    return result.rows;
  }catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}


async function fetchAllTeamRatings() {
  const client =await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM team_rating
      ;`,
    );

    const ratings = {};
    for (const row of result.rows) {
      ratings[row.team_id] = {
        rating: Number(row.rating),
        rd: Number(row.rd),
        sigma: Number(row.sigma),
        stageID: row.stage_id,
        games: Number(row.games),
        initialStageBoost: Number(row.initial_stage_boost),
      };
    }
    return ratings;
  } catch (error) {
    console.error("Error reading team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function fetchAllMapRatings() {
  const client =await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM map_rating;`);

    const ratings = {};
    for (const row of result.rows) {
      if (ratings[row.team_id] === undefined) ratings[row.team_id] = {};

      ratings[row.team_id][row.map_name] = {
        deviation: Number(row.deviation),
        rd: Number(row.rd),
        sigma: Number(row.sigma),
        games: Number(row.games),
      };
    }
    return ratings;
  } catch (error) {
    console.error("Error reading map ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}


// ============================================================
// Load Database Ratings to Cache
// ============================================================

async function loadToCache(glicko) {
  try {
    const log = await getLastUpdateTime();
    last_update = new Date(log);

    let teamratings = await fetchAllTeamRatings();

    for(const teamId of Object.keys(teamratings)){
      glicko.updateTeamRating(teamId,teamratings[teamId])
    }

    let mapratings = await fetchAllMapRatings();

    for(const teamId of Object.keys(mapratings)){
      const maps = mapratings[teamId];

      for (const mapName of Object.keys(maps)){
        glicko.updateMapTeamRating(mapName,teamId,maps[mapName]);
      };
    }

    genereatePickedBy();
    return 1;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// SAVE TEAM RATINGS TO DATABASE
// ============================================================

async function saveTeamRatings(glicko) {
  const client = await pool.connect();
  
  try {
    // Start transaction

     await client.query("CREATE TABLE IF NOT EXISTS team_rating (team_id TEXT PRIMARY KEY, rating NUMERIC(40,30), rd NUMERIC(40,30), sigma NUMERIC(40,30),games INTEGER, stage_id TEXT, initial_stage_boost Numeric(10,2));");

    await client.query('BEGIN');
    
    // Clear existing ratings in the team_rating table
    await client.query('DELETE FROM "team_rating"');
    
    // Insert new ratings
    const allTeams = glicko.getAllTeams();
    for (const [teamId, ratingData] of allTeams) {

      console.warn("calc "+ratingData.stageID + " | " + typeof(ratingData.stageID));

      await client.query(
        `INSERT INTO "team_rating" 
         (team_id, rating, rd, sigma, games, stage_id, initial_stage_boost) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (team_id) DO UPDATE SET
           rating = EXCLUDED.rating,
           rd = EXCLUDED.rd,
           sigma = EXCLUDED.sigma,
           games = EXCLUDED.games,
           stage_id = EXCLUDED.stage_id,
           initial_stage_boost = EXCLUDED.initial_stage_boost`,
        [
          teamId,
          ratingData.rating,
          ratingData.rd,
          ratingData.sigma,
          ratingData.games,
          ratingData.stageID,
          ratingData.initialStageBoost
        ]
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log("Team ratings saved successfully to database");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// SAVE MAP RATINGS TO DATABASE
// ============================================================

async function saveMapRatings(glicko) {
  const client = await pool.connect();
  
  try {

    await client.query("CREATE TABLE IF NOT EXISTS map_rating (map_name TEXT, team_id TEXT, deviation NUMERIC(40,30), rd NUMERIC(40,30), sigma NUMERIC(40,30),games INTEGER, PRIMARY KEY (map_name, team_id));");
    // Start transaction
    await client.query('BEGIN');
    
    // Clear existing ratings in the map-rating table
    await client.query('DELETE FROM "map_rating"');
    
    // Insert new ratings
    const allMapRatings = glicko.getAllMapRatings();
    for (const [mapName, teams] of Object.entries(allMapRatings)) {
      for (const [teamId, ratingData] of teams) {
        await client.query(
          `INSERT INTO "map_rating" 
           (map_name, team_id, deviation, rd, sigma, games) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (map_name, team_id) DO UPDATE SET
             deviation = EXCLUDED.deviation,
             rd = EXCLUDED.rd,
             sigma = EXCLUDED.sigma,
             games = EXCLUDED.games`,
          [
            mapName,
            teamId,
            ratingData.deviation,
            ratingData.rd,
            ratingData.sigma,
            ratingData.games
          ]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log("Map ratings saved successfully to database");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error saving map ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// Save Picked by data To matchsets
// ============================================================

async function savePickData(data){
  const client = await pool.connect();
  
  try {

    await client.query('BEGIN');
    
    for (const item of data) {
        await client.query(
          `UPDATE match_sets 
           SET picked_by = $1
           WHERE match_id = $2
            AND set_number = $3;`,
          [
            item.picked_by,
            item.match_id,
            item.set_number
          ]
        );
      
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log("Map ratings saved successfully to database");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error saving map ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}


// ============================================================
// Determine who picked map
// ============================================================

async function genereatePickedBy() {
  let mapdata =  await getMatchData();

  let prev_entry = null;

  for(let map of mapdata){
    if(prev_entry === null || map.match_id != prev_entry.match_id){
      map.picked_by = 0;
    } else{
     if(prev_entry.op_a_score>prev_entry.op_b_score){
      map.picked_by=2;
     }else if( prev_entry.op_a_score<prev_entry.op_b_score){
      map.picked_by =1;
     }else{
      map.picked_by = prev_entry.picked_by;
     }
    }
    prev_entry=map;
  }
  await savePickData(mapdata);
}

// ============================================================
// PROCESS ALL MAPS
// ============================================================

async function processAllMatches() {
  const glicko = new Glicko2();

  await loadToCache(glicko);

  const [teams, matchData] =
    await Promise.all([
      getTeamData(),
      getMatchData(),
    ]);

  const total = matchData.length;

  console.log(
    `Starting Glicko-2 processing: ${total} maps`
  );

  const startTime = Date.now();

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  const progressEvery =
    Math.max(1, Math.floor(total / 100));

  for (let index = 0; index < total; index++) {
    const match = matchData[index];

    const current = index + 1;

    // --------------------------------------------------
    // Validate map
    // --------------------------------------------------

    if (
      match.map === null ||
      match.map === undefined ||
      String(match.map).trim() === ""
    ) {
      skipped++;

      console.warn(
        `[${current}/${total}] SKIPPED: ` +
        `no map name | ` +
        `match=${match.match_id}`
      );

      continue;
    }

    // --------------------------------------------------
    // Validate scores
    // --------------------------------------------------

    if (
      match.op_a_score === null ||
      match.op_a_score === undefined ||
      match.op_b_score === null ||
      match.op_b_score === undefined
    ) {
      skipped++;
      continue;
    }

    const team1Rounds =
      Number(match.op_a_score);

    const team2Rounds =
      Number(match.op_b_score);

    if (
      !Number.isFinite(team1Rounds) ||
      !Number.isFinite(team2Rounds)
    ) {
      skipped++;
      continue;
    }

    // --------------------------------------------------
    // Ignore draws
    // --------------------------------------------------

    if (
      team1Rounds === team2Rounds
    ) {
      skipped++;
      continue;
    }

    try {
      // =================================================
      // GET CURRENT TEAM STATE
      // =================================================

      const team1 =
        glicko.getTeamRating(
          match.teama,
          match.stage_id,
          stages
        );

      const team2 =
        glicko.getTeamRating(
          match.teamb,
          match.stage_id,
          stages
        );

      // =================================================
      // MAP PICKER
      // =================================================
      //
      // For now:
      //
      // 0 = system picked
      // 1 = team1 picked
      // 2 = team2 picked
      //
      // You said this will be determined externally.
      // So until then, everything is 0.
      //
      // =================================================

      const mapPicker = match.picked_by; 

      // =================================================
      // ONE NEW GLICKO UPDATE
      // =================================================

      const updated =
        glicko.updateCompleteMatch(
          match.map,

          match.teama,
          match.teamb,

          team1Rounds,
          team2Rounds,

          mapPicker
        );

      // =================================================
      // SAVE UPDATED OVERALL RATINGS TO CACHE
      // =================================================

      glicko.updateTeamRating(
        match.teama,
        updated.team1
      );

      glicko.updateTeamRating(
        match.teamb,
        updated.team2
      );

      // =================================================
      // SAVE UPDATED MAP DEVIATIONS TO CACHE
      // =================================================

      glicko.updateMapTeamRating(
        match.map,
        match.teama,
        updated.map.team1
      );

      glicko.updateMapTeamRating(
        match.map,
        match.teamb,
        updated.map.team2
      );

      // =================================================
      // SUCCESS
      // =================================================

      processed++;

      if (
        current === 1 ||
        current === total ||
        current % progressEvery === 0
      ) {
        const elapsed =
          (Date.now() - startTime) / 1000;

        const percent =
          ((current / total) * 100)
            .toFixed(1);

        const mapsPerSecond =
          current /
          Math.max(elapsed, 0.001);

        const remaining =
          total - current;

        const eta =
          remaining /
          Math.max(
            mapsPerSecond,
            0.001
          );

        console.log(
          `[${current}/${total}] ` +
          `${percent}% | ` +
          `processed=${processed} ` +
          `skipped=${skipped} ` +
          `errors=${errors} | ` +
          `map="${match.map}" | ` +
          `score=${team1Rounds}:${team2Rounds} | ` +
          `speed=${mapsPerSecond.toFixed(1)} maps/s | ` +
          `ETA=${eta.toFixed(1)}s`
        );
      }

    } catch (error) {
      errors++;

      console.error(
        `ERROR processing map ` +
        `${current}/${total}:`,
        {
          match_id: match.match_id,
          set_number: match.set_number,
          map: match.map,

          team_a: match.teama,
          team_b: match.teamb,

          score_a: team1Rounds,
          score_b: team2Rounds,

          error:
            error?.stack ||
            error?.message ||
            error,
        }
      );
    }
  }

  const elapsed =
    (Date.now() - startTime) / 1000;

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "GLICKO-2 PROCESSING COMPLETE"
  );
  console.log(
    "========================================"
  );

  console.log(`Total maps:  ${total}`);
  console.log(`Processed:   ${processed}`);
  console.log(`Skipped:     ${skipped}`);
  console.log(`Errors:      ${errors}`);

  console.log(
    `Time:        ${elapsed.toFixed(2)} seconds`
  );

  console.log(
    `Speed:       ${
      (
        processed /
        Math.max(elapsed, 0.001)
      ).toFixed(1)
    } maps/sec`
  );

  console.log(
    "========================================"
  );

  return glicko;
}

// ============================================================
// GET ALL OVERALL TEAM RATINGS
// ============================================================

async function getAllTeamRatings(glicko = null) {
  // If the caller already processed the matches,
  // reuse that instance.
  if (!glicko) {
    glicko = await processAllMatches();
  }

  const teams = await getTeamData();
  const teamLookup = new Map(teams.map((team) => [team.id, team]));
  const result = {};

  for (const [teamId, ratingData] of glicko.getAllTeams()) {
    const teamInfo = teamLookup.get(teamId);

    if (!teamInfo) {
      continue;
    }

    result[teamId] = {
      name: teamInfo.name,
      rating: Number(ratingData.rating.toFixed(2)),
      rd: Number(ratingData.rd.toFixed(2)),
      sigma: Number(ratingData.sigma.toFixed(5)),
      games: ratingData.games,
    };
  }

  return result;
}

// ============================================================
// MAIN
// ============================================================

async function main(target_db,target_stages) {

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
});
  stages = target_stages;
  console.log("Starting Glicko-2 processing...");

  // --------------------------------------------------------
  // Process EVERYTHING exactly once.
  // --------------------------------------------------------

  const glicko = await processAllMatches();

  // --------------------------------------------------------
  // Save results to database
  // --------------------------------------------------------
  
  try {

    await saveTeamRatings(glicko);
    await saveMapRatings(glicko);
    await updateLastUpdateTime();
    console.log("Database update completed successfully");
  } catch (error) {
    console.error("Error saving to database:", error);
  }

  // --------------------------------------------------------
  // Get overall ratings.
  // --------------------------------------------------------

  const allTeamRatings = await getAllTeamRatings(glicko);

  console.log("Overall Team Ratings:");

  console.table(Object.values(allTeamRatings).sort((a,b)=>b.rating - a.rating));


  return {
    glicko,
    allTeamRatings
  };
}


// ============================================================
// RUN
// ============================================================

// main()
//   .then(() => {
//     console.log("Done.");
//   })
//   .catch((error) => {
//     console.error("Fatal error:", error);
//   });

  module.exports.run = main;