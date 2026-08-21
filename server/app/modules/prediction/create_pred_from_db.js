const { Client, Pool } = require("pg");
const Glicko2 = require("./glicko.js");

let target_database = "old_sose_26";
let glicko = new Glicko2();

// ---------------
// Load Ratings
// ---------------

async function fetchTeamID(host,user,password,database,team_kurz) {
  const client = new Client({
    host,
    port: 5432,
    user,
    password,
    database,
  })
  await client.connect();

  try{
    const res = await client.query(`SELECT id FROM teams WHERE '${team_kurz}' = customfieldvalues_teamkurzel`);

    return res.rows[0].id;
  } catch(err){
    return "Team Not found";
  }finally{
    client.end();
  }
  
}

async function fetchAllTeamRatings(host, user,password,database) {
  const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });

  try {
      await client.connect();
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
        stage_id: row.stage_id,
        games: Number(row.games),
        initialStageBoost: Number(row.initial_stage_boost),
      };
    }
    return ratings;
  } catch (error) {
    console.error("Error reading team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function fetchAllMapRatings(host, user,password,database) {
  const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();
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
    client.end();
  }
}

async function getTeamData(host, user,password,database) {
  const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();

  try {
    const result = await client.query(
      `SELECT DISTINCT t.id, t.name, t.customfieldvalues_teamkurzel AS kurz, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_0_participant_id = t.id 
      UNION  
      SELECT DISTINCT t.id, t.name, t.customfieldvalues_teamkurzel AS kurz, ms.stage_id FROM teams t 
      JOIN matches ms ON ms.opponents_1_participant_id = t.id 
      ;`,
      // WHERE ms.stage_id = '${Object.keys(stages)[0]}' OR ms.stage_id = '${Object.keys(stages)[1]}' OR ms.stage_id = '${Object.keys(stages)[2]}' OR ms.stage_id = '${Object.keys(stages)[3]}'
    );

    return result.rows;
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function getLogoURL(host, user,password,database,teamID) {
   const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();

  try {
    const result = await client.query(
      `SELECT logo_id FROM teams WHERE id = '${teamID}'`
    );

    let logo_id = String(result.rows[0].logo_id);
    if(logo_id!=null && logo_id!="")
      return `https://play.toornament.com/media/file/${logo_id}/logo_large`
    else 
      return "https://play.toornament.com/media/8597216805094416384/original"
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function loadToCache(host, user,password,db) {
  try {
    let teamratings = await fetchAllTeamRatings(host, user,password,db);
    const teamkeys = await Object.keys(teamratings);
    teamkeys.forEach((team) => {
      glicko.updateTeamRating(team, teamratings[team]);
    });

    let mapratings = await fetchAllMapRatings(host, user,password,db);
    const map_teamkeys = Object.keys(mapratings);
    map_teamkeys.forEach((team) => {
      const maps = mapratings[team];
      const mapkeys = Object.keys(maps);
      mapkeys.forEach((map) => {
        glicko.updateMapTeamRating(map, team, maps[map]);
      });
    });
    return 1;
  } catch (error) {
    console.log(error);
  }
}

async function predict_map_outcome(
  glicko,
  map_name,
  team1_id,
  team2_id,
  current_t1_score = 0,
  current_t2_score = 0,
  teamPickedMap = 0,
  host, user,password,db
) {
  if (current_t1_score === null || current_t2_score === null) {
    console.log("Skipping prediction due to NULL score");

    return null;
  }

  const team1 = glicko.getBlendedPredictionRating(map_name, team1_id);
  const t1_logo = await getLogoURL(host,user,password,db,team1_id);

  const team2 = glicko.getBlendedPredictionRating(map_name, team2_id);
  const t2_logo = await getLogoURL(host,user,password,db,team2_id);
  // --------------------------------------------------------
  // Calculate probability.
  // --------------------------------------------------------

  const baseWinProb = glicko.calculateWinProbability(team1, team2, teamPickedMap);

  const winProbability = glicko.calculateMomentumProbablility(
    baseWinProb,
    current_t1_score,
    current_t2_score,
  );

  const pred_confidence = glicko.calculatePredictionConfidence(team1,team2);

  const teams = await getTeamData(host, user,password,db);
  const teamLookup = new Map(teams.map((team) => [team.id, team]));


  return {
    map_name,
    team1_id,
    team1_name: teamLookup.get(team1_id).name,
    team1_kurz: teamLookup.get(team1_id).kurz,
    team1_logo: t1_logo,
    team2_id,
    team2_name: teamLookup.get(team2_id).name,
    team2_kurz: teamLookup.get(team2_id).kurz,
    team2_logo: t2_logo,
    team1_win_probability: Number((winProbability * 100).toFixed(2)),
    team2_win_probability: Number(((1 - winProbability) * 100).toFixed(2)),
    predicted_winner: winProbability >= 0.5 ? team1_id : team2_id,
    confidence: pred_confidence,

    // ----------------------------------------------------
    // Effective ratings actually used for prediction.
    // ----------------------------------------------------

    team1_rating: Number(team1.rating.toFixed(2)),
    team2_rating: Number(team2.rating.toFixed(2)),

    team1_rd: Number(team1.rd.toFixed(2)),
    team2_rd: Number(team2.rd.toFixed(2)),

    // ----------------------------------------------------
    // Useful diagnostics.
    // ----------------------------------------------------

    team1_map_games: team1.games,
    team2_map_games: team2.games,

    team1_map_weight: Number((team1.mapWeight * 100).toFixed(1)),
    team2_map_weight: Number((team2.mapWeight * 100).toFixed(1)),

    team1_overall_weight: Number((team1.overallWeight * 100).toFixed(1)),
    team2_overall_weight: Number((team2.overallWeight * 100).toFixed(1)),

    team1_map_deviation: team1.mapDeviation,
    team2_map_deviation: team2.mapDeviation,

    team1_effective_deviation: team1.effectiveDeviation,
    team2_effective_deviation: team2.effectiveDeviation,

    team1_rating_source: team1.source,
    team2_rating_source: team2.source,
  };
}

async function getAllTeamRatings(glicko = null,host, user,password,db) {
  // If the caller already processed the matches,
  // reuse that instance.
  

  const teams = await getTeamData(host, user,password,db);
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
      id:teamId,
    };
  }

  return result;
}

async function sendAllTeamRatings( host,  user, password, database) {
  const sc = await loadToCache(host,  user, password, database);

  const allTeamRatings = await getAllTeamRatings(glicko,host, user,password,database);
  return Object.values(allTeamRatings).sort((a, b) => b.rating - a.rating);
  //return console.log(Object.values(allTeamRatings).sort((a, b) => b.rating - a.rating));
  
}

async function getPrediction( host,  user, password, database, map_name, team1_id, team2_id,score_t1,score_t2,picked_by) {
    const sc = await loadToCache(host,  user, password, database);

    const prediction = await predict_map_outcome(glicko,map_name,team1_id,team2_id,score_t1,score_t2,picked_by,host, user,password,database);
    return prediction;
  
}
async function getTeamDetails(host, user, password, database, id) {
  const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();
  try {
    const result = await client.query(
      `WITH BestWorstMap AS(
            SELECT
                MAX(CASE WHEN rank_best = 1 THEN map_name END) AS best_map,
                MAX(CASE WHEN rank_worst = 1 THEN map_name END) AS worst_map
            FROM (
                SELECT
                    map_name,
                    ROW_NUMBER() OVER (
                        ORDER BY deviation * games / (games + 6.0) DESC
                    ) AS rank_best,
                    ROW_NUMBER() OVER (
                        ORDER BY deviation * games / (games + 6.0) ASC
                    ) AS rank_worst
                FROM map_rating
                WHERE team_id = '${id}'
                AND games > 0
            ) ranked
        ),
        MapStatsPerMatch AS (
                    -- Step 1: Compress the "many" side (maps) so there is only 1 row per match
                    SELECT 
                        ms.match_id,
                        COUNT(CASE WHEN msr.result = 'win' THEN 1 END) AS maps_won,
                        COUNT(CASE WHEN msr.result = 'loss' THEN 1 END) AS maps_lost,
                        ms.map AS maps_played
                    FROM match_set_results msr
                    JOIN match_sets ms ON msr.match_set_id = ms.id
                    WHERE msr.participant_id = '${id}'
                    GROUP BY ms.match_id, ms.map
                ),
        SatsCalculator AS(
                -- Step 2: Join the clean, 1-to-1 map data to the matches table
                SELECT 
                    SUM(map_data.maps_won) AS total_maps_won,
                    SUM(map_data.maps_lost) AS total_maps_lost,
                    -- Because there are no duplicated rows anymore, AVG() works perfectly here!
                    ROUND((AVG(CASE WHEN m.opponents_0_result = 'win' AND m.opponents_0_participant_id = '${id}' THEN 1.0 ELSE 0.0 END) + AVG(CASE WHEN m.opponents_1_result = 'win' AND m.opponents_1_participant_id = '${id}' THEN 1.0 ELSE 0.0 END))*100,2) AS match_winrate,
                    MODE() WITHIN GROUP (ORDER BY map_data.maps_played) AS most_played
                FROM MapStatsPerMatch map_data 
                JOIN matches m ON m.id = map_data.match_id
        )
        SELECT
        sc.total_maps_won,
        sc.total_maps_lost,
        sc.match_winrate,
        sc.most_played,
        bwm.best_map,
        bwm.worst_map
        FROM SatsCalculator sc
        CROSS JOIN BestWorstMap bwm ;`,
    );
     const data = Object.entries(result.rows[0]).map(([key,value])=>({txt:key,value:String(value)}));
     return data;
     
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function getTeamList(host,user,password,database) {
    const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();
  try {
    const result = await client.query(
      `SELECT customfieldvalues_teamkurzel FROM teams ORDER BY customfieldvalues_teamkurzel ASC;`,
    );
     const data = result.rows;
     return data;
     
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function getMapList(host,user,password,database) {
    const client = new Client({
    host: host,
    port: 5432,
    user: user,
    password: password,
    database: database,
  });
  await client.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT map FROM match_sets ORDER BY map ASC;`,
    );
     const data = result.rows;
     return data;
     
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  } finally {
    client.end();
  }
}

async function main() {
  // const prediction = await predict_map_outcome(glicko,"samoa","8250526365314572288","8250521986271281152",0,0);

  // console.log(prediction);
  //const a = await fetchTeamID("localhost","admin","secretpassword","sose_26","HSKC");
  const a = await getPrediction("localhost","admin","secretpassword","sose_26","runasapi","2453253901889753087","2453358508558624767",0,0,0);
  console.log(a);


}



module.exports.getAllTeamRatings = sendAllTeamRatings;
module.exports.getPrediction = getPrediction;
module.exports.getTeamIDbyKurz = fetchTeamID;
module.exports.getTeamDetails = getTeamDetails;
module.exports.getTeamList = getTeamList;
module.exports.getMapList = getMapList;
