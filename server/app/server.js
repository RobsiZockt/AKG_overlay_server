const { error } = require("console");
const e = require("express");
const express = require("express");
const { readFile, writeFile } = require("fs");
const fs = require("fs").promises;
const path = require("path");
const { json } = require("stream/consumers");
const app = express();
const PORT = 4000;

const playedmaps = path.join(__dirname, "api", "played_maps.json");
const matchup = path.join(__dirname, "api", "matchup.json");
const maps = path.join(__dirname, "api", "maps.json");
const heros = path.join(__dirname, "api", "heros.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "p")));

// Keep track of all connected SSE clients
const clients = new Set();


// Function to broadcast data to all connected clients
const broadcast = (data) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(message);
  }
};

let playedMapsCache = {};
let lastMtime = 0;

// Single poll interval
const pollPlayedMaps = async () => {
  try {
    const stats = await fs.stat(playedmaps);
    if (stats.mtimeMs !== lastMtime && stats.size > 0) {
      const content = await fs.readFile(playedmaps, "utf8");
      playedMapsCache = JSON.parse(content);
      lastMtime = stats.mtimeMs;
      broadcast(playedMapsCache); // send to all SSE clients
    }
  } catch (err) {
    console.error("Error reading played_maps.json:", err);
  }
};
setInterval(pollPlayedMaps, 200);

// SSE endpoint just sends cached data
// SSE endpoint just sends cached data
app.get("/api/played_maps/stream", (req, res) => {

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);

  // Send initial data
  res.write(`data: ${JSON.stringify(playedMapsCache)}\n\n`);

  // --- Heartbeat / keep-alive ---
  const heartbeat = setInterval(() => {
    res.write(':\n\n'); // colon = SSE comment, no effect on client
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
app.post("/api/played_maps", async (req, res) => {
  try {
    const entryKey = req.body.key;
    if (!entryKey) return res.status(400).json({ error: "Missing key" });

    if(playedMapsCache[entryKey]) return res.status(400).json({error: "Key allready exists"});
    
playedMapsCache[entryKey] = { ...req.body };
    delete playedMapsCache[entryKey].key;

    await fs.writeFile(playedmaps, JSON.stringify(playedMapsCache, null, 2), "utf8");

    res.status(201).json({ status: "ok", latest: playedMapsCache[entryKey] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update played_maps.json" });
  }
});

//PUT endpoint updates targeted Object
app.put("/api/played_maps/:id", async (req,res)=>{
try{
  const entryKey = req.params.id;
  if(!playedMapsCache[entryKey]){ return res.status(404).json({error: "Entry not found"});
}
playedMapsCache[entryKey] ={
  ...playedMapsCache[entryKey],
  ...req.body
};
delete playedMapsCache[entryKey].key;

await fs.writeFile(playedmaps, JSON.stringify(playedMapsCache,null,2),"utf8");
res.status(201).json({staus: "ok", latest: playedMapsCache[entryKey]});
}catch (err){
console.error(err);
    res.status(500).json({ error: "Could not edit played_maps.json" });
}
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
app.get("/api/matchup", async (req,res) =>{
  try{
const content = await fs.readFile(matchup,"utf8");
res.json(JSON.parse(content));
  }catch(err){
    res.status(500).json({error: "Could not read matchup.json"});
  }
});

//POST matchup.json
app.post("/api/matchup", async (req,res) =>{
  try{
    const data = req.body;
    await fs.writeFile(matchup, JSON.stringify(data, null ,2),"utf8");
    res.status(200).json({status: "ok", latest: data});
  } catch (err){
    res.status(500).json({error:"Could not update matchup.json"});
  }
})

app.put("/api/matchup", async (req,res)=>{
  try{
   const update = req.body;
   console.log("Update received:", req.body);
   const data = await fs.readFile(matchup, "utf8");
   const json = JSON.parse(data);
   const updated = {...json, ...update};

   await fs.writeFile(matchup, JSON.stringify(updated, null, 2),"utf8");
   res.status(200).json({status: "ok", latest: updated});

  }catch (err){
    res.status(500).json({error: "Could not update matchup.json"});

  }
})

//POST matchup.json + resets cards // used for new matchup
app.post("/api/new_matchup", async (req,res) =>{
  try{
    const data = req.body;
    await fs.writeFile(matchup, JSON.stringify(data, null ,2),"utf8");
    try{
    const reset = JSON.stringify({ "1":{ name: "", image: "", ban_red: "", ban_red_name: "",ban_blue: "", ban_blue_name: "", score_blue:"",score_red:""}});
    await fs.writeFile(playedmaps, reset, null, 2);
  } catch (error){
    console.log("could not reset");
  }
      res.status(200).json({status: "ok", latest: data});
  } catch (err){
    res.status(500).json({error:"Could not update matchup.json"});
  }
})



app.listen(PORT,()=>
console.log("Server is listening on ${PORT}"));
console.log("Maps file path:", playedmaps);
