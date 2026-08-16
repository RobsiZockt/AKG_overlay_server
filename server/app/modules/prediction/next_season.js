const { Client, Pool } = require("pg");
const Glicko2 = require("./glicko.js");

// ---------------------
// CONST VARS
// --------------------

let old_db = "";
let new_db = "";


let new_stages = {

};

// --------------------
// DATABASE CONNECTIONS
// --------------------

// Create a connection pool
let old_pool = new Pool();

// Create a connection pool
let new_pool = new Pool();

// -------------------------
// getTeam DATA and ratings
// -------------------------

async function getTeamData(db, stages) {
  const client = await db.connect();

  try {
    const result = await client.query(
      `SELECT DISTINCT t.id, t.name, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_0_participant_id = t.id 
      WHERE ms.stage_id = '${Object.keys(stages)[0]}' OR ms.stage_id = '${Object.keys(stages)[1]}' OR ms.stage_id = '${Object.keys(stages)[2]}' OR ms.stage_id = '${Object.keys(stages)[3]}' 
      UNION  
      SELECT DISTINCT t.id, t.name, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_1_participant_id = t.id 
      WHERE ms.stage_id = '${Object.keys(stages)[0]}' OR ms.stage_id = '${Object.keys(stages)[1]}' OR ms.stage_id = '${Object.keys(stages)[2]}' OR ms.stage_id = '${Object.keys(stages)[3]}'
      UNION
      SELECT DISTINCT t.id, t.name, NULL AS stage_id FROM teams t WHERE NOT EXISTS (SELECT 1 FROM matches ms WHERE ms.opponents_1_participant_id = t.id)
      ;`,
    );

    return result.rows;
  } catch (error) {
    console.error("Error reading team Data:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getSeasonRatingTeam(db) {
  if(db.options.database === "")
    return {};
  const client = await db.connect();

  try {
    const result = await client.query(
      `SELECT * FROM team_rating
      ;`,
    );

    const ratings={};
    for(const row of result.rows){
        ratings[row.team_id]={
            rating: row.rating,
            rd: row.rd,
            sigma: row.sigma,
            stageID: row.stageID,
            games: row.games,
            initialStageBoost: row.initial_stage_boost
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

async function getSeasonRatingMaps(db) {
  if(db.options.database ==="")
    return{};

  const client =  await db.connect()
  try{
    const result = await client.query(`SELECT * FROM map_rating;`);

    const ratings={};
    for(const row of result.rows){
      if(ratings[row.team_id]=== undefined)
        ratings[row.team_id]={};

      ratings[row.team_id][row.map_name]= {
        rating: row.rating,
        rd: row.rd,
        sigma: row.sigma,
        games: row.games
        }
      
    }
    return ratings;
    
  }catch (error) {
    console.error("Error reading map ratings:", error);
    throw error;
  } finally {
    client.release();
  }
  
}

// -------------------------
// Get All players 
// -------------------------
//
// formating:
// {Kurz_name: {id,name,kurz,[player1, player2, ...]}}
//
async function getTeamPlayers(db) {
  if (db.options.database ==="")
    return {};
  const client = await db.connect();

  try {
    const result = await client.query(
      `SELECT t.id, t.name, t.customfieldvalues_teamkurzel AS kurz, tp.battletag FROM teams t
      JOIN team_players tp ON t.id = tp.team_id
      GROUP BY t.id, t.name, t.customfieldvalues_teamkurzel, tp.battletag
      ORDER BY t.id
      ;`,
    );

    //add players to player list of the current team, if new team, create new entry
    const teamPlayers={};
    let current_team_id="";
    let current_index =0;
    for(const row of result.rows){
        if(current_team_id==row.id){
            teamPlayers[row.kurz].players.push(row.battletag);
        }else{
            current_team_id!=""?current_index++:null;
            
            teamPlayers[row.kurz]={
                id : row.id,
                name : row.name,
                kurz : row.kurz,
                players: [row.battletag]
            }
            current_team_id=row.id;
        }


    }
    return teamPlayers;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error reading team ratings:", error);
    throw error;
  } finally {
    client.release();
  }
}



// -----------------------------------------
// create and Save Ratings to DB
// -----------------------------------------

async function saveTeamRatings(db, glicko) {

  const client = await db.connect();

  try{

    await client.query("CREATE TABLE IF NOT EXISTS team_rating (team_id TEXT PRIMARY KEY, rating NUMERIC(40,30), rd NUMERIC(40,30), sigma NUMERIC(40,30),games INTEGER, stage_id TEXT, initial_stage_boost Numeric(10,2));");

    await client.query('BEGIN');

    // Clear existing ratings in the team_rating table
    await client.query('DELETE FROM "team_rating"');
  
        // Insert new ratings
    const allTeams = glicko.getAllTeams();
    for (const [teamId, ratingData] of allTeams) {

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

  } catch (error){
    await client.query('ROLLBACK');
    console.error("ERROR saving Team ratings: "+ error);
  } finally{
    client.release();
  }
  
}



// --------------------
// save transfered map ratings
// ---------------------

async function saveMapRatings(db, glicko) {
  const client = await db.connect();
  
  try {

    await client.query("CREATE TABLE IF NOT EXISTS map_rating (map_name TEXT, team_id TEXT, rating NUMERIC(40,30), rd NUMERIC(40,30), sigma NUMERIC(40,30),games INTEGER, PRIMARY KEY (map_name, team_id));");
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
           (map_name, team_id, rating, rd, sigma, games) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (map_name, team_id) DO UPDATE SET
             rating = EXCLUDED.rating,
             rd = EXCLUDED.rd,
             sigma = EXCLUDED.sigma,
             games = EXCLUDED.games`,
          [
            mapName,
            teamId,
            ratingData.rating,
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

// --------------------------
// Get Amount of Players Staying in ther Team
// --------------------------
//
// copares old team list against the new teams list,
// if short stayed the same check how many players stayed
// if team was not found stayed players becommes -1
// contains the old team id, the stayed players was checked on
//

async function getStayingPlayers(old_teams, new_teams) {

    let results={};
    //itterate new teams
    Object.values(new_teams).forEach(team => {
        //check if old team exists
        if(old_teams[team.kurz]==undefined){
            results[team.id]={
                old_id: null,
                amount_stayed:-1
            }
            return;
        }
        //check how many players stayed
        const prev_team=old_teams[team.kurz];
        let stayed_players=0;
        team.players.forEach(player => {
            if (prev_team.players.includes(player)){
                stayed_players++;
            }
        });
        results[team.id]={
            old_id: prev_team.id,
            amount_stayed: stayed_players
        }


    })
    return results;
    
}

// ===========================================
// Calculates New Team Ratings
// ===========================================
//
// if team existed in prev season, blend prev season results with new season base values
// if more than 5 players stayed give a slight bonus, do nut mix in base rating
//
// if team did not exists in prev season, create it based on normal base values
//
// ===========================================
async function calculateNewTeamRatings(stayedplayers) {

    const current_teams= await getTeamData(new_pool,new_stages);
    const prev_ratings = await getSeasonRatingTeam(old_pool);
    const glicko = new Glicko2();
    
    for(const team of current_teams){
        const teamID = team.id;

        // Team id lookup / link is supplied in stayed players. index is the new team id, old_id is the old team id
        if(stayedplayers[teamID].old_id != null){
            const prev_rating = prev_ratings[stayedplayers[teamID].old_id];
            const stageBoost = glicko.getStageBoost(team.stage_id, new_stages);
            const init_rating = glicko.defaultRating + stageBoost;

            //demote teams due to of time modifier
            let modifier = 0.8;
            let stayed_mod=0;
            //demote teams if players left/swaped. if 5 or more stayed, increase a bit due to potential training
            if(stayedplayers[teamID]){
                const amount_stayed = stayedplayers[teamID].amount_stayed;
                if(amount_stayed<2){
                    stayed_modifier = 0;
                    continue;
                } else if(amount_stayed>5){
                  stayed_mod = 1 + ((amount_stayed-5)/2)/10;
                } else {
                   const normalized = (amount_stayed -1)/ (5-1);
                   stayed_mod = Math.pow(normalized,0.7);
                }
            }
            modifier *=stayed_mod;

            // blend ratings
            //failsafes if mod > 1
            const blendedRating ={
                rating: (prev_rating.rating * modifier) + (init_rating * Math.max(0,1-modifier)),
                rd: (prev_rating.rd * modifier) + (glicko.defaultRD* Math.max(0,1-modifier)),
                sigma: (prev_rating.sigma * modifier) + (glicko.defaultSigma* Math.max(0,1-modifier)),
                games: Math.floor(prev_rating.games * Math.min(1,modifier)),
                stageID: team.stage_id,
                initialStageBoost: stageBoost
            };

            glicko.updateTeamRating(teamID,blendedRating);
        }else{
          // handle completely new teams.
            const stageBoost = glicko.getStageBoost(team.stage_id,new_stages);
            const init_rating = glicko.defaultRating + stageBoost;

            const rating = {
                rating: init_rating,
                rd: glicko.defaultRD,
                sigma: glicko.defaultSigma,
                games: 0,
                stageID: team.stage_id,
                initialStageBoost: stageBoost
            };

            glicko.updateTeamRating(teamID,rating);
        }

    }

    return glicko;
}


// ===========================================
// Calculates New Map Ratings
// ===========================================
//
// if team existed in prev season, decay values accordingly
// if more than 5 players stayed, keep original values
//
// if team did not exists in prev season, do nothing
//
// ===========================================

async function calculateNewMapRatings(old_maps, stayedplayers) {
  const current_teams = await getTeamData(new_pool, new_stages);
  const prev_ratings = await getSeasonRatingMaps(old_pool);
  const glicko = new Glicko2();



  // ------
  // TEST LOGIC
  // ojnly decay teams oir imporve over time?
  // ------

  for (const team of current_teams) {
    const teamID = team.id;

    // Team id lookup / link is supplied in stayed players. index is the new team id, old_id is the old team id
    if (stayedplayers[teamID].old_id != null) {
      const prev_rating = prev_ratings[stayedplayers[teamID].old_id];
      const stageBoost = glicko.getStageBoost(team.stage_id, new_stages);
      const init_rating = glicko.defaultRating + stageBoost;

      //demote teams due to of time modifier
      let modifier = 0.8;
      let stayed_mod = 0;
      //demote teams if players left/swaped. if 5 or more stayed, increase a bit due to potential training
      if (stayedplayers[teamID]) {
        const amount_stayed = stayedplayers[teamID].amount_stayed;
        if (amount_stayed < 2) {
          stayed_modifier = 0;
          continue;
        } else if (amount_stayed > 5) {
          stayed_mod = 1 + (amount_stayed - 5) / 2 / 10;
        } else {
          const normalized = (amount_stayed - 1) / (5 - 1);
          stayed_mod = Math.pow(normalized, 0.7);
        }
      }
      modifier *= stayed_mod;

      let decayedRating = {};
      const played_maps = Object.keys(prev_rating);
      played_maps.forEach((map) => {
        rating = {
          rating: prev_rating[map].rating * modifier + init_rating * Math.max(0, 1 - modifier),
          rd: prev_rating[map].rd * modifier + glicko.defaultRD * Math.max(0, 1 - modifier),
          sigma: prev_rating[map].sigma * modifier + glicko.defaultSigma * Math.max(0, 1 - modifier),
          games: Math.floor(prev_rating[map].games * Math.min(1, modifier)),
        };
        glicko.updateMapTeamRating(map,teamID,rating);
      });
    }
  }
  return glicko;
}



async function execute() {

     const old_players= await getTeamPlayers(old_pool);
     const new_players= await getTeamPlayers(new_pool);
    const old_maps = await getSeasonRatingMaps(old_pool);

    const players_stayed = await getStayingPlayers(old_players,new_players);
    const newMapratings = await calculateNewMapRatings(old_maps,players_stayed);
    const newTeamratings = await calculateNewTeamRatings(players_stayed);
    await saveMapRatings(new_pool,newMapratings);
    await saveTeamRatings(new_pool,newTeamratings);


    
}

async function main(prev_db,target_db,target_stages){
  old_db = prev_db;
  new_db = target_db;
  new_stages = target_stages;

old_pool = new Pool({
  host: "db",
  port: 5432,
  user: "admin",
  password: "secretpassword",
  database: old_db,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

new_pool = new Pool({
  host: "db",
  port: 5432,
  user: "admin",
  password: "secretpassword",
  database: new_db,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

    await execute();
}


module.exports.run = main;