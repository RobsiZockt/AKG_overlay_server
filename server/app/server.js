const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const PORT = 4000;

const playedmaps = path.join(__dirname, "api", "played_maps.json");
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
app.get("/api/played_maps/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);

  console.log(`current clients: ${clients.size}`);
  // send current cached state immediately
  res.write(`data: ${JSON.stringify(playedMapsCache)}\n\n`);

  req.on("close", () => clients.delete(res));
});

// GET endpoint just returns the cache
app.get("/api/played_maps", (req, res) => {
  res.json(playedMapsCache);
});

// POST endpoint updates cache and writes to disk
app.post("/api/played_maps", async (req, res) => {
  try {
    const entryKey = req.body.key;
    if (!entryKey || !playedMapsCache[entryKey]) return res.status(400).json({ error: "Invalid key" });

    playedMapsCache[entryKey] = { ...playedMapsCache[entryKey], ...req.body };
    delete playedMapsCache[entryKey].key;

    await fs.writeFile(playedmaps, JSON.stringify(playedMapsCache, null, 2), "utf8");

    res.json({ status: "ok", latest: playedMapsCache[entryKey] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update played_maps.json" });
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





/////////LEGACY GET / POST ////////////////////////
app.get("/api/played_maps", (req,res) =>{
try{
    const data = fs.readFileSync(playedmaps,"utf8");
    res.json(JSON.parse(data));
}catch (err){
    console.error("Error reading played_maps.json:", err);
    res.status(500).json({error: "Could not read played_maps.json"});
}
});

////////////////LEGACY END ///////////////////////////
app.listen(PORT,()=>
console.log("Server is listening on ${PORT}"));
console.log("Maps file path:", playedmaps);
