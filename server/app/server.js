const { error } = require("console");
const e = require("express");
const express = require("express");
const { readFile, writeFile, chownSync, lstatSync } = require("fs");
const fs = require("fs").promises;
const path = require("path");
const { json } = require("stream/consumers");
const { body, validationResult } = require("express-validator");
const app = express();
const PORT = 4000;

const playedmaps = path.join(__dirname, "api", "played_maps.json");
const matchup = path.join(__dirname, "api", "matchup.json");
const maps = path.join(__dirname, "api", "maps.json");
const heros = path.join(__dirname, "api", "heros.json");
const players = path.join(__dirname, "api", "players.json");

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
      lastMtime_matchup = stats.mtimeMs;
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
app.get("/api/update/stream", (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

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

    res.status(201).json({ status: "ok", latest: playedMapsCache[entryKey] });
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
    if(op === "calc"){
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
    await fs.writeFile(matchup, JSON.stringify(data, null, 2), "utf8");

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
          score_blue: "",
          score_red: "",
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
  const teamdata = playersCache[team];
  if (!teamdata) {
    return res.status(404).json({ error: "Team not found" });
  }


  const player = teamdata.find(p => p.id === parseInt(id, 10));
  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }
  
  if(key == "main"){
    const id = update[key];
    player[key] = ban_data[id].path;
  }else{
    player[key] = update[key];
  }

await fs.writeFile(players, JSON.stringify(playersCache, null, 2), "utf8");

    


 res.status(200).json({ status: "ok", latest: update});
}catch(err){
      res.status(500).json({ error: "Could not update players.json" });
}
})


app.listen(PORT, () => console.log("Server is listening on ${PORT}"));
console.log("Maps file path:", playedmaps);
