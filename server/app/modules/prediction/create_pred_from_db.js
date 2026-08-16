const { Client, Pool } = require("pg");
const Glicko2 = require("./glicko.js");

let target_database = "old_sose_26";
let glicko = new Glicko2();

// ---------------
// Load Ratings
// ---------------

async function fetchAllTeamRatings(host, user,password,database) {
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
        rating: Number(row.rating),
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
  host, user,password,db
) {
  if (current_t1_score === null || current_t2_score === null) {
    console.log("Skipping prediction due to NULL score");

    return null;
  }

  const team1 = glicko.getBlendedPredictionRating(map_name, team1_id);

  const team2 = glicko.getBlendedPredictionRating(map_name, team2_id);

  // --------------------------------------------------------
  // Calculate probability.
  // --------------------------------------------------------

  const baseWinProb = glicko.calculateWinProbability(team1, team2);

  const winProbability = glicko.calculateMomentumProbablility(
    baseWinProb,
    current_t1_score,
    current_t2_score,
  );

  const teams = await getTeamData(host, user,password,db);
  const teamLookup = new Map(teams.map((team) => [team.id, team]));

  return {
    map_name,
    team1_id,
    team1_name: teamLookup.get(team1_id).name,
    team1_kurz: teamLookup.get(team1_id).kurz,
    team2_id,
    team2_name: teamLookup.get(team2_id).name,
    team2_kurz: teamLookup.get(team2_id).kurz,
    team1_win_probability: Number((winProbability * 100).toFixed(2)),
    team2_win_probability: Number(((1 - winProbability) * 100).toFixed(2)),
    predicted_winner: winProbability >= 0.5 ? team1_id : team2_id,
    confidence: Number(Math.max(winProbability, 1 - winProbability).toFixed(4)),

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

    team1_rating_source: team1.source,
    team2_rating_source: team2.source,
  };
}

async function getAllTeamRatings(glicko = null,host, user,password,db) {
  // If the caller already processed the matches,
  // reuse that instance.
  if (!glicko) {
    glicko = await processAllMatches();
  }

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

async function getPrediction( host,  user, password, database, map_name, team1_id, team2_id,score_t1,score_t2) {
    const sc = await loadToCache(host,  user, password, database);

    const prediction = await predict_map_outcome(glicko,map_name,team1_id,team2_id,score_t1,score_t2,host, user,password,database);
    return prediction;
  
}

async function main() {
  // const prediction = await predict_map_outcome(glicko,"samoa","8250526365314572288","8250521986271281152",0,0);

  // console.log(prediction);

}

module.exports.getAllTeamRatings = sendAllTeamRatings;
module.exports.getPrediction = getPrediction;