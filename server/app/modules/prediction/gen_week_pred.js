
const { Client, Pool } = require("pg");
const Glicko2 = require("./glicko.js");


let glicko = new Glicko2();
let teamLookup=null;
let teamLogos=null;

let pool = new Pool();
  

function leagueState(matches) {
  const size = matches[0].group.settings.size;
  const full = Math.floor(size / 2);
  const byRound = new Map();               // round.number -> pending count
  for (const m of matches)
    byRound.set(m.round.number, (byRound.get(m.round.number) ?? 0) + 1);

  const nums = [...byRound.keys()].sort((a, b) => a - b);
  const untouched = nums.filter(n => byRound.get(n) === full);
  const partial   = nums.filter(n => byRound.get(n) < full);

  const nextDay = untouched[0] ?? null;
  const started = partial.filter(n => nextDay === null || n < nextDay);
  const current = started.length ? Math.max(...started) : nextDay;
  const overdue = partial.filter(n => n < current);

  return { current, nextDay, overdue };
}

function analyse(items) {
  // bucket by stage+group
  const buckets = new Map();
  for (const m of items) {
    const key = `${m.stage.id}:${m.group?.id ?? "none"}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(m);
  }

  const stages = [];
  for (const [key, matches] of buckets) {
    const s = matches[0].stage;
    const base = { key, stageId: s.id, name: s.name, type: s.type, stageNumber: s.number };

    if (s.type === "league" && matches[0].group) {
      stages.push({ ...base, ...leagueState(matches) });
    } else {
      // swiss + wildcard/relegation/unknown: highest round returned = current
      const nums = matches.map(m => m.round?.number).filter(n => n != null);
      stages.push({ ...base, current: nums.length ? Math.max(...nums) : null, overdue: [] });
    }
  }

  // global matchday = most common current among leagues
  const counts = new Map();
  for (const st of stages.filter(x => x.type === "league" && x.current != null))
    counts.set(st.current, (counts.get(st.current) ?? 0) + 1);
  const globalDay = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { globalDay, stages };
}

function teamIds(m) {
  const o = m.opponents ?? {};
  // works for both [a, b] and { "0": a, "1": b }
  const a = o[0] ?? o["0"];
  const b = o[1] ?? o["1"];
  return [a?.participant?.id ?? null, b?.participant?.id ?? null];
}

function run(items) {
  const open = items.filter(m => m.status !== "completed");
  const { globalDay, stages } = analyse(open); // from the previous message
    
  // matchday -> stage -> matchups
  const days = new Map();
  for (const m of open) {
    const d = m.round.number;
    if (!days.has(d)) days.set(d, new Map());
    const byStage = days.get(d);
    const sk = m.stage.id;
    if (!byStage.has(sk)) byStage.set(sk, { stage: m.stage.name, matchups: [] });
    byStage.get(sk).matchups.push(teamIds(m));
  }

  return {
    globalDay,
    stages: stages.map(({ name, type, current, overdue }) => ({ stage: name, type, current, overdue })),
    matchdays: [...days.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, byStage]) => ({ day, stages: [...byStage.values()] })),
  };
}

async function getMatchups(){
    const requestUrl = "https://play.toornament.com/api/matches?tournament_ids=2562692125320538111&statuses=pending,running&sort=structure&offset=0"
    //const requestUrl = `${API_BASE_URL}?tournament_ids=${TOUNRAMENT_ID}&statuses=completed&sort=latest_results&offset=${offset}`; //&limit=${ITEMS_PER_PAGE}
    console.log(`Fetching: ${requestUrl}`);

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return run(data.items);
}

///////////////////////////// DB

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

async function loadTeams() {
    const {rows} = await pool.query(`SELECT t.id, t.name, t.customfieldvalues_teamkurzel AS kurz FROM teams t`); 
    return new Map(rows.map(r=> [r.id,r]));
}

async function loadLogos() {
  try{
  const {rows} = await pool.query("SELECT id,logo_id FROM teams");

    const logos = new Map();
    for (const row of rows) {
      const logo_id = row.logo_id;
      if (logo_id != null && String(logo_id) != "")
        logos.set(row.id, `https://play.toornament.com/media/file/${logo_id}/logo_large`);
      else
        logos.set(row.id, "https://play.toornament.com/media/8597216805094416384/original");
    }
    return logos;
  } catch (error) {
    console.error("Error reading team logos:", error);
    throw error;
  }
}


async function fetchAllMapRatings(host, user,password,database) {

  try {
    const result = await pool.query(`SELECT * FROM map_rating;`);

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
  }
}

async function fetchAllTeamRatings(host, user,password,database) {

  try {
      
    const result = await pool.query(
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
  }
}

async function getTeamData(host, user,password,database) {


  try {
    const result = await pool.query(
      `SELECT DISTINCT t.id, t.name, t.customfieldvalues_teamkurzel AS kurz FROM teams t
      ;`,
      
    );

    return result.rows;
  } catch (error) {
    console.error("Error saving team ratings:", error);
    throw error;
  }
}

async function predict_map_outcome(
  glicko,
  map_name,
  team1_id,
  team2_id,
  current_t1_score = 0,
  current_t2_score = 0,
  teamPickedMap = 0
) {
  if (current_t1_score === null || current_t2_score === null) {
    console.log("Skipping prediction due to NULL score");

    return null;
  }

  const team1 = glicko.getBlendedPredictionRating(map_name, team1_id);
  const t1_logo = teamLogos.get(team1_id);

  const team2 = glicko.getBlendedPredictionRating(map_name, team2_id);
  const t2_logo = teamLogos.get(team2_id);
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

async function Gen_Pred(db) {
    pool = new Pool({
    host: "db",
    port: 5432,
    user: "readonly_user",
    password: "readonly_password",
    database: "wise_26",
    })
    pool.connect();
    await loadToCache();
    teamLookup = await loadTeams();
    teamLogos = await loadLogos();
    let predictions = [];
    const all_matches = await getMatchups();;
    const matches = all_matches.matchdays.find(d=> d.day == all_matches.globalDay);
    for(stage of matches.stages){
        let results=[];
        for(m of stage.matchups){
            const dat = await predict_map_outcome(glicko,"OVERALL",m[0],m[1],0,0,0);
            results.push(dat);
        };
        predictions.push({stage:stage.stage, results:results})
    }
    pool.end();
    return predictions;
} 


module.exports.Gen_Pred = Gen_Pred;
