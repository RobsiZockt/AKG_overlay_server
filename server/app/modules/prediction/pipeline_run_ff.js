/*
* fetch entire liga || TournamentID, target db,
* -> fetch matches || target db
* -> fetch teams || target db
* -> split_db || target db
* -> split_player || target db
* -> next_season || old db, new / target db, old stages, new / target stages
* -> calculate ratings || target db, target stages
*
*/


// ==================================================
// ==================================================
// CREATE NEW DATABASE FIRST !!!!!!!!!!!!!!!!!!!!!!!!
// ==================================================
// ==================================================

let networkelapsed=0;

const import_entire_liga = require("./import_pipeline/fetch_pipe_entire_liga.js");
const import_matches = require("./import_pipeline/fetch_pipe_matches.js");
const import_teams = require("./import_pipeline/fetch_pipe_teams.js");
const split_matches = require("./import_pipeline/split_db.js");
const split_players = require("./import_pipeline/split_player_from_team.js");
const rate_next_season = require("./next_season.js");
const calculate_ratings = require("./calculate_ratings.js");

let tournament_id = ""; // new tournament id, corresponding to new_db
let old_db = "";
let new_db = ""; //new === target db
let new_stages={  //new === target stages
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
};

async function foo() {
   
}
 async function main(){
     const startTime = Date.now();
 await import_entire_liga.run(new_db,tournament_id).then(async()=>{
    await import_matches.run(new_db);
    await import_teams.run(new_db);
    networkelapsed = (Date.now() - startTime) / 1000;
    
 }
 ).then(async()=>{
    await split_matches.run(new_db);
    await split_players.run(new_db);
 }).then(async()=>{
    await rate_next_season.run(old_db,new_db,new_stages);
 }).then(async()=>{
    await calculate_ratings.run(new_db,new_stages);
 }).finally(()=>{
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`NETWORK Time:        ${networkelapsed.toFixed(2)} seconds`);
    console.log(`Time:        ${elapsed.toFixed(2)} seconds`);
 })

}

async function createAll() {
   
   // null -> wise 24
   tournament_id = "8089890215968571392"; // new tournament id, corresponding to new_db
   old_db = "";
   new_db = "wise_24"; //new === target db
   new_stages={  //new === target stages
   "8139463696368254976": 1,
   "8139466083215745024": 2,
   "8139467604166459392": 3,
   "8252599910484574208": 4,
   };
   await main();

// wise 24 -> sose 25
   tournament_id = "8635309642524221440"; // new tournament id, corresponding to new_db
   old_db = "wise_24";
   new_db = "sose_25"; //new === target db
   new_stages={  //new === target stages
   "8757946933006884864": 1,
   "8757949896353964032": 2,
   "8786874656094412800": 3,
   "8786877118657552384": 4,
   };
   await main();

   // sose_25 -> wise 25
   tournament_id = "2294308124744931327"; // new tournament id, corresponding to new_db
   old_db = "sose_25";
   new_db = "wise_25"; //new === target db
   new_stages={  //new === target stages
   "2321419626996613119": 1,
   "2326437978350821375": 2,
   "2326534508947574783": 3,
   "2329264600064403455": 4,
   };
   await main();

   // wise 25 -> sose 26 CONFIG 
   tournament_id = "2425613637680488447"; // new tournament id, corresponding to new_db
   old_db = "wise_25";
   new_db = "sose_26"; //new === target db
   new_stages={  //new === target stages
   "2448594630581929983": 1,
   "2448594832101539839": 2,
   "2448595024273809407": 3,
   "2448656660467945471": 4,
   };
   await main();
}

module.exports.createAll = createAll;


// wise 25 -> sose 26 CONFIG 

// let tournament_id = "2425613637680488447"; // new tournament id, corresponding to new_db
// let old_db = "wise_25";
// let new_db = "sose_26"; //new === target db
// let new_stages={  //new === target stages
//   "2448594630581929983": 1,
//   "2448594832101539839": 2,
//   "2448595024273809407": 3,
//   "2448656660467945471": 4,
// };


// sose_25 -> wise 25

// const tournament_id = "2294308124744931327"; // new tournament id, corresponding to new_db
// const old_db = "sose_25";
// const new_db = "wise_25"; //new === target db
// const new_stages={  //new === target stages
//   "2321419626996613119": 1,
//   "2326437978350821375": 2,
//   "2326534508947574783": 3,
//   "2329264600064403455": 4,
// };


// wise 24 -> sose 25

// const tournament_id = "8635309642524221440"; // new tournament id, corresponding to new_db
// const old_db = "wise_24";
// const new_db = "sose_25"; //new === target db
// const new_stages={  //new === target stages
//   "8757946933006884864": 1,
//   "8757949896353964032": 2,
//   "8786874656094412800": 3,
//   "8786877118657552384": 4,
// };


// null -> wise 24

// const tournament_id = "8089890215968571392"; // new tournament id, corresponding to new_db
// const old_db = "";
// const new_db = "wise_24"; //new === target db
// const new_stages={  //new === target stages
//   "8139463696368254976": 1,
//   "8139466083215745024": 2,
//   "8139467604166459392": 3,
//   "8252599910484574208": 4,
// };




