const { error } = require("console");
const e = require("express");
const express = require("express");
const { readFileSync, writeFile, chownSync, lstatSync, copyFile } = require("fs");
const fs = require("fs").promises;
const path = require("path");
const { json } = require("stream/consumers");
const { body, validationResult, param } = require("express-validator");
const app = express();
const PORT = 4000;
const cors = require("cors");

const playedmaps = path.join(__dirname, "api", "played_maps.json");
const matchup = path.join(__dirname, "api", "matchup.json");
const maps = path.join(__dirname, "api", "maps.json");
const heros = path.join(__dirname, "api", "heros.json");
const players = path.join(__dirname, "api", "players.json");
const rot_text = path.join(__dirname,"api", "rot_text.json");
const sm_report = path.join(__dirname,"api","reports", "sm_report.json");
const team_dir = path.join(__dirname, "api", "teams");


let map_data;
let ban_data;
let matchupCache ={};
let playedMapsCache = {};
let playersCache ={};
let lastMtime_playedMaps = 0;
let lastMtime_matchup = 0;
let lastMtime_players = 0;

app.use(express.json());
app.use(express.static(path.join(__dirname, "p")));

const corsOptions={
  origin: ["https://overlay.robsizockt.de", "https://cast.robsizockt.de", "http://cast.localhost", "http://overlay.localhost"]
};

// Keep track of all connected SSE clients
const clients = new Set();

const loaddata = async () => {
  const map_raw = await fs.readFile(maps, "utf8");
  map_data = JSON.parse(map_raw);

  const ban_raw = await fs.readFile(heros, "utf8");
  ban_data = JSON.parse(ban_raw);
};

loaddata();


// Function to broadcast data to all connected clients
const broadcast = (data) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(message);
  }
};


const pollMatchup = async ()=>{
  try{
    const stats = await fs.stat(matchup);
    if(stats.mtimeMs !== lastMtime_matchup && stats.size > 0){
      const content = await fs.readFile(matchup,"utf8");
      matchupCache = JSON.parse(content);
      lastMtime_matchup = stats.mtimeMs;
      broadcast({type: "matchupUpdate", payload: matchupCache});
    }
  }catch (err){
console.error("Error reading matchup.json: ". err)
  }

};
setInterval(pollMatchup, 300);

const pollPlayers = async ()=>{
  try{
    const stats = await fs.stat(players);
    if(stats.mtimeMs !== lastMtime_players && stats.size > 0){
      const content = await fs.readFile(players,"utf8");
      playersCache = JSON.parse(content);
      lastMtime_players = stats.mtimeMs;
      broadcast({type: "playersUpdate", payload: playersCache});
    }
  }catch (err){
console.error("Error reading matchup.json: ". err)
  }

};
setInterval(pollPlayers, 300);



// Single poll interval
const pollPlayedMaps = async () => {
  try {
    const stats = await fs.stat(playedmaps);
    if (stats.mtimeMs !== lastMtime_playedMaps && stats.size > 0) {
      const content = await fs.readFile(playedmaps, "utf8");
      playedMapsCache = JSON.parse(content);
      lastMtime_playedMaps = stats.mtimeMs;
      broadcast({type: "playedMapsUpdate", payload: playedMapsCache}); // send to all SSE clients
    }
  } catch (err) {
    console.error("Error reading played_maps.json:", err);
  }
};
setInterval(pollPlayedMaps, 200);

// SSE endpoint just sends cached data
// SSE endpoint just sends cached data
app.get("/api/update/stream",cors(corsOptions), (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(":\n\n");
  clients.add(res);

  // Send initial data
  res.write(`data: ${JSON.stringify({type: "playedMapsUpdate", payload: playedMapsCache})}\n\n`);

  // --- Heartbeat / keep-alive ---
  const heartbeat = setInterval(() => {
    res.write(":\n\n"); // colon = SSE comment, no effect on client
  }, 2000); // every 2 seconds (adjust below your Nginx timeout, e.g., 4s for 5s read_timeout)

  // Clean up when client disconnects
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

// GET endpoint just returns the cache
app.get("/api/played_maps", (req, res) => {
  res.json(playedMapsCache);
});

// POST endpoint updates cache and writes to disk
//WILL FAIL IF REQUEST HAS A BODY, security reasons
app.post("/api/played_maps/new", async (req, res) => {
  try {
    if (Object.keys(req.body || {}).length > 0)
      return res
        .status(400)
        .json({ error: "Modified boddy detected, hi nick" });

    const keys = Object.keys(playedMapsCache).map(Number);
    const latestKey = Math.max(...keys);

    if(!playedMapsCache[latestKey].name) return res.status(500).json({error: "New Empty map allready exists"});

    const entryKey = latestKey + 1;
    if (!entryKey) return res.status(400).json({ error: "Missing key" });

    if (playedMapsCache[entryKey])
      return res.status(400).json({ error: "Key allready exists" });

    playedMapsCache[entryKey] = {
      key: entryKey,
      name: "",
      image: "",
      type: "",
      ban_red: "",
      ban_red_name: "",
      ban_blue: "",
      ban_blue_name: "",
      score_blue: "0",
      score_red: "0",
    };
    delete playedMapsCache[entryKey].key;

    await fs.writeFile(
      playedmaps,
      JSON.stringify(playedMapsCache, null, 2),
      "utf8"
    );

 //calculates the new score of the matchup
    let blue = 0;let red = 0;
    for (key in playedMapsCache) {

      let s1 = parseInt(playedMapsCache[key].score_blue);
      let s2 = parseInt(playedMapsCache[key].score_red);

      if (s1 == s2) {
        console.log("Map result: Draw, skippin calculation");
      }
      if (s1 > s2) {
        blue++;
      }
      if (s1 < s2) {
        red++;
      }
    }
    let update = { blue_score: blue, red_score: red };


    const data = await fs.readFile(matchup, "utf8");
    const json = JSON.parse(data);
    const updated = { ...json, ...update };

    await fs.writeFile(matchup, JSON.stringify(updated, null, 2), "utf8");

    res.status(201).json({ status: "ok", latest: playedMapsCache[entryKey] + updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update played_maps.json" });
  }
});

//PUT endpoint updates targeted Object
//will block
app.put(
  "/api/played_maps/:id",
  [
    //Test for amount of keys, returns if not 1 key
    body().custom((value) => {
      const keys = Object.keys(value);
      if (keys.length !== 1) {
        console.log(keys.length);
        throw new Error("Invalid amount of Keys");
      }
      return true;
    }),
    //checks if the entered value of a key is a number, returns if not
    body().custom((value) => {
      const [key] = Object.values(value);
      if (Number.isNaN(key)) {
        throw new Error("Entered key value is NaN", value);
      }
      return true;
    }),
    //checks if key exists in cache or is played maps
    body().custom((value) => {
      const [key] = Object.keys(value);
      if (!(key in playedMapsCache[1])) {
        if (key === "map") {
          return true;
        }
        if (key === "ban") {
          return true;
        }
        throw new Error(
          `Invalid key. '${key}' does not exist in playedMapsCache`
        );
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const entryKey = req.params.id;
      console.log(req.body);
      try {
        if (!parseInt(entryKey))
          return res.status(403).json({ error: "recived id is NaN" });
      } catch (error) {
        res.status(403).json({ error: "recived id is NaN" });
        console.error(
          "Recived key in /api/played_maps/:id was not properly escaped",
          entryKey
        );
      }
      if (!playedMapsCache[entryKey]) {
        return res
          .status(404)
          .json({ error: `Entry not found ${playedMapsCache[entryKey]}` });
      }

      const [key] = Object.keys(req.body);
      const value = req.body[key];
      //will search map by id and retruns the img path and map name
      if (key === "map") {
        const lookupdata = map_data[value];
        if (!lookupdata)
          return res.status(404).json({ error: `Map not found ${value}` });

        playedMapsCache[entryKey].name = lookupdata.name;
        playedMapsCache[entryKey].image = lookupdata.path;
        playedMapsCache[entryKey].type = lookupdata.type;
      } else if (key === "ban") {
        // checks "ban" for regex pattern, if correct and team is either 1 = blue or 2 = red it will look up the given data
        const regex = /^team:\s*(\d+)\s+hero:\s*(\d+)$/;
        const match = req.body.ban.match(regex);
        if (!match)
          return res.status(400).json({ error: "recived syntax not correct" });

        if (Number(match[1]) === 1) {
          playedMapsCache[entryKey].ban_blue = ban_data[match[2]].path;
          playedMapsCache[entryKey].ban_blue_name = ban_data[match[2]].name;
        } else if (Number(match[1]) === 2) {
          playedMapsCache[entryKey].ban_red = ban_data[match[2]].path;
          playedMapsCache[entryKey].ban_red_name = ban_data[match[2]].name;
        } else {
          return res.status(400).json({ error: "Recived invalid team id" });
        }
      } else {
        playedMapsCache[entryKey] = {
          ...playedMapsCache[entryKey],
          ...req.body,
        };
        delete playedMapsCache[entryKey].key;
      }

      await fs.writeFile(
        playedmaps,
        JSON.stringify(playedMapsCache, null, 2),
        "utf8"
      );
      res.status(201).json({ staus: "ok", latest: playedMapsCache[entryKey] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not edit played_maps.json" });
    }
  }
);

// POST: add or sustract 1 from the given team score on a given map (legacy: put played_maps:/id)
app.post("/api/played_maps/:id/:team/:action", [],async(req,res)=>{
  try{
    const entryKey = req.params.id;
    const op = req.params.action;
    const team = req.params.team;

    if (!parseInt(entryKey))
      return res.status(403).json({ error: "recived id is NaN" });

    if(op == "add"){
      if(team == "blue") {
        let tmp = parseInt(playedMapsCache[entryKey].score_blue) + 1;
        playedMapsCache[entryKey].score_blue = tmp.toString(10);
      } else if (team == "red"){
           let tmp = parseInt(playedMapsCache[entryKey].score_red) + 1;
        playedMapsCache[entryKey].score_red = tmp.toString(10);
      }
    }
        if(op == "sub"){
      if(team == "blue") {
        let tmp = parseInt(playedMapsCache[entryKey].score_blue) - 1;
         if(tmp < 0) tmp = 0;
        playedMapsCache[entryKey].score_blue = tmp.toString(10);
      } else if (team == "red"){
        let tmp = parseInt(playedMapsCache[entryKey].score_red) - 1;
        if(tmp < 0) tmp = 0;
        playedMapsCache[entryKey].score_red = tmp.toString(10);
      }
    }

    await fs.writeFile(
      playedmaps,
      JSON.stringify(playedMapsCache, null, 2),
      "utf8"
    );

    res.status(201).json({status:"ok"});
  } 
  catch(err){
      console.error(err);
      res.status(500).json({ error: "Operation Failed" });
  };
});

// GET: maps.json asynchronously
app.get("/api/maps", async (req, res) => {
  try {
    const content = await fs.readFile(maps, "utf8");
    res.json(JSON.parse(content));
  } catch (err) {
    console.error("Error reading maps.json:", err);
    res.status(500).json({ error: "Could not read maps.json" });
  }
});

// GET: heros.json asynchronously
app.get("/api/heros", async (req, res) => {
  try {
    const content = await fs.readFile(heros, "utf8");
    res.json(JSON.parse(content));
  } catch (err) {
    console.error("Error reading heros.json:", err);
    res.status(500).json({ error: "Could not read heros.json" });
  }
});

//GET matchup.json
app.get("/api/matchup", async (req, res) => {
  try {
    const content = await fs.readFile(matchup, "utf8");
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: "Could not read matchup.json" });
  }
});

//POST matchup.json
app.post("/api/matchup", [], async (req, res) => {
  try {
    const data = req.body;
    await fs.writeFile(matchup, JSON.stringify(data, null, 2), "utf8");
    res.status(200).json({ status: "ok", latest: data });
  } catch (err) {
    res.status(500).json({ error: "Could not update matchup.json" });
  }
});





//Safe Call for calculating map score, does not require any body
app.put("/api/matchup", [], async (req, res) => {
  const op = req.query.op;
  console.log(op);
  try {

    let update = {};

    if(op === "swap"){
      if(matchupCache["switched"] === 1)
    {update = {switched: 0};};
    if(matchupCache["switched"]=== 0)
    {update = {switched: 1};};
    }
    else if(op === "calc"){
    //calculates the new score of the matchup
          let blue = 0;let red = 0;
    for (key in playedMapsCache) {

      let s1 = parseInt(playedMapsCache[key].score_blue);
      let s2 = parseInt(playedMapsCache[key].score_red);


      if (s1 == s2) {
        console.log("Map result: Draw, skippin calculation");
      }
      if (s1 > s2) {
        blue++;
      }
      if (s1 < s2) {
        red++;
      }
    }
    update = { blue_score: blue, red_score: red };
    console.log(update);
  }
  else{
    update = req.body;
  }  

    const data = await fs.readFile(matchup, "utf8");
    const json = JSON.parse(data);
    const updated = { ...json, ...update };

    await fs.writeFile(matchup, JSON.stringify(updated, null, 2), "utf8");
    res.status(200).json({ status: "ok", latest: updated });
  } catch (err) {
    res.status(500).json({ error: "Could not update matchup.json" });
  }
});

//POST matchup.json + resets cards // used for new matchup
app.post("/api/new_matchup", [
  //tests if keys do exist in matchup
 body().custom((value) => {
      const [key] = Object.keys(value);
      if (!(key in matchupCache)) {
        throw new Error(
          `Invalid key. '${key}' does not exist in playedMapsCache`
        );
      }
      return true;
    }),

], async (req, res) => {
  try {
    const data = req.body;
    const update = { blue_score: 0, red_score: 0 };
    const mdata = await fs.readFile(matchup, "utf8");
    const json = JSON.parse(mdata);
    const updated = { ...json, ...update };

    await fs.writeFile(matchup, JSON.stringify(updated, null, 2), "utf8");

    //resets map cards
    try {
      const reset = JSON.stringify({
        1: {
          name: "",
          image: "",
          ban_red: "",
          ban_red_name: "",
          ban_blue: "",
          ban_blue_name: "",
          score_blue: "0",
          score_red: "0",
        },
      });
      await fs.writeFile(playedmaps, reset, null, 2);
    } catch (error) {
      console.log("could not reset");
    }
    
    res.status(200).json({ status: "ok", latest: data });
  } catch (err) {
    res.status(500).json({ error: "Could not update matchup.json" });
  }
});

app.get("/api/players", async (req,res) => {
try{
  const data = await fs.readFile(players, "utf8");
  res.json(JSON.parse(data)); 
}catch (error){
  res.status(500).json({error: "Could not read players.json"})
}
})

app.post("/api/players", [], async (req, res) => {
  try {
    const data = req.body;
    await fs.writeFile(players, JSON.stringify(data, null, 2), "utf8");
    res.status(200).json({ status: "ok", latest: data });
  } catch (err) {
    res.status(500).json({ error: "Could not update matchup.json" });
  }
});

app.put("/api/players/:team/:id", [], async (req, res) =>{
   const key = Object.keys(req.body);
  console.log(req.body);
try{
const {team,id} = req.params;
const update = req.body;
  let teamdata = playersCache[team];
  if (!teamdata) {
    return res.status(404).json({ error: "Team not found" });
  }


  const player = teamdata.find(p => p.id === parseInt(id, 10));
  if (!player) {  
    if(Object.keys(req.body).length === 0){
       teamdata[teamdata.length] = { id: parseInt(id),name: "",main: "",role: "",extra: ""};
    }else{
         return res.status(404).json({ error: "Player not found" });
    }
  }
  if(Object.keys(req.body).length !== 0)
{  if(key == "main"){
    const id = update[key];
    player[key] = ban_data[id].path;
  }else{
    player[key] = update[key];
  }}
teamdata.sort((a,b)=>a.id-b.id);
await fs.writeFile(players, JSON.stringify(playersCache, null, 2), "utf8");
 res.status(200).json({ status: "ok", latest: update});
}catch(err){
      res.status(500).json({ error: "Could not update players.json" });
}
})

app.delete("/api/players/:team/:id", [], async (req, res) =>{
try{
const {team,id} = req.params;
  let teamdata = playersCache[team];
  if (!teamdata) {
    return res.status(404).json({ error: "Team not found" });
  }

  const player = teamdata.length >= parseInt(id, 10);
  if (!player) {   
    return res.status(404).json({ error: "Player not found" });
  }

  teamdata.splice(parseInt(id, 10)-1,1);

    await fs.writeFile(players, JSON.stringify(playersCache, null, 2), "utf8");
     res.status(200).json({ status: "ok", latest: update});
}catch(err){
   res.status(500).json({ error: "Could not update players.json" });
}

})

app.get("/api/rot_text",[],async (req,res)=>{
  try{
  const data = await fs.readFile(rot_text, "utf8");
  res.json(JSON.parse(data)); 
}catch (error){
  console.log(error);
  res.status(500).json({error: "Could not read players.json"})
}
})

app.get("/api/reports/sm_report",[],async (req,res)=>{
  try{
  const data = await fs.readFile(sm_report, "utf8");
  res.json(JSON.parse(data)); 
}catch (error){
  console.log(error);
  res.status(500).json({error: "Could not read sm_report.json"})
}
})


//START TEAM API
/* 
* Returns all json files (Teams) inside of team_dir
* strips the .json file ending
*/
app.get("/teams",[],async (req,res)=>{
  try{
    const files = await fs.readdir(team_dir);
    const data = files.filter(f=>f.endsWith(".json")).map(f=> path.parse(f).name);

    res.json(data);
  } catch(error){
      res.status(500).json({error: "Something went terrible wrong, check if folder exists."});
  }
})

/**
* Tries to create a New team file
* will error if the file allready exists (which should not be possible / safeguard only)
*/
app.post("/teams/new",[],async(req,res)=>{
  try{
     const files = await fs.readdir(team_dir);
     const id = parseInt( await JSON.parse(await fs.readFile(path.join(team_dir, files.at(-1)))).id) + 1;
     const name = id + "_NewTeam.json";



    try{
      await fs.access( path.join(team_dir, name), fs.constants.F_OK, (err)=>{throw err});
    } catch (err){
      if(err.code!== "ENOENT"){ throw err}

    }
    let data = await JSON.parse(await fs.readFile(path.join(team_dir, "0_PREFAB.json")));
    data.id = id;
    
    await fs.writeFile(path.join(team_dir, name), JSON.stringify(data, null, 2),"utf8");


    

     res.status(201).json({status: "ok"});
    
  } catch(err){
    res.status(500).json({error: `could not create team`, reason:  err });
  }
})

/**
 * Replaces the given team data, does check for any not allowed params
 * does not edit 0_PREFAB
 */
app.put("/team/:id",[

param("id").isInt({min:1}),

body().custom(items=>{
  const allowedFiles = ["id", "name", "name_short", "logo", "players"];
    const invalid = Object.keys(items).filter(k=>!allowedFiles.includes(k));
    if(invalid.length) throw new Error(`Unexpected Fields ${invalid.join(", ")}`);
  return true;
}),

body("id").exists().isInt({min:1}),
body("name").exists().isString(),
body("name_short").exists().isString(),
body("logo").exists().isURL(),
body("players").isArray({min:5, max: 10}).withMessage("Amount of Players may only be between 5 and 10"),
body("players.*.id").exists().isInt({min:1}),
body("players.*.name").exists().isString(),
body("players.*.main").exists().isString(),
body("players.*.role").exists().isString(),
body("players.*.extra").exists().isString(),

body("players").custom(items=>{
  const allowedFiles = ["id", "name", "main", "role", "extra"];
  for(const item of items){
    const invalid = Object.keys(item).filter(k=>!allowedFiles.includes(k));
    if(invalid.length) throw new Error(`Unexpected Fields ${invalid.join(", ")}`);
  }
  return true;
})

],async(req,res)=>{
//error check
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json(errors.array());
  }

  async function fileExists(path) {
    try {
      await fs.access(path.join(team_dir, path));
      return true;
    } catch {
      return false;
    }
  }

  try{
    const id = parseInt(req.params.id);
    const rec_data = req.body;
    const files = await fs.readdir(team_dir);
    const filepath = path.join(team_dir, files[id]);

    if(fileExists(filepath)){
      let team_cache = await JSON.parse( await fs.readFile(filepath, "utf8"));
      console.log("a", req.body);
      
      if(team_cache.id != rec_data.id) throw {code: 409, message: "recived tampered file"};
      await fs.writeFile(filepath, JSON.stringify(rec_data, null, 2), "utf8");

    } 

    res.status(200).json({status: "ok"});
  }catch (err){
    res.status(err.code || 500).json({error: err.message || "Internal Server Error: Something went wrong"});
  }
})

//END TEAM API




app.listen(PORT, '0.0.0.0', () => console.log("Server is listening on ${PORT}"));
console.log("Maps file path:", playedmaps);
