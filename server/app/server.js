const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 4000;

const playedmaps = path.join(__dirname, "api","played_maps.json");
const maps = path.join(__dirname, "api","maps.json");
const heros = path.join(__dirname, "api","heros.json");

//middleware for parsing json files
app.use(express.json());

//serves public files html/js/css in overlays
app.use(express.static(path.join(__dirname,"p")));

app.get("/api/played_maps/stream", (req,res) =>{
    res.setHeader("Content-Type","text/event-stream");
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Connection","keep-alive");

    let lastMtime = 0;
 const sendFile = () => {
    try {
      const stats = fs.statSync(playedmaps);
      if (stats.mtimeMs !== lastMtime && stats.size > 0) {
        const obj = JSON.parse(fs.readFileSync(playedmaps,"utf8"));
        res.write(`data: ${JSON.stringify(obj)}\n\n`);
        lastMtime = stats.mtimeMs;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const interval = setInterval(sendFile, 200);
  sendFile();

    req.on("close",() =>{
        clearInterval(interval);
    });
});



app.post('/api/played_maps', (req, res) => {
  try {
    // Read existing JSON
    const json = JSON.parse(fs.readFileSync(playedmaps, 'utf-8'));

   const entryKey = req.body.key;
    if (!entryKey || !json[entryKey]) return res.status(400).json({ error: "Invalid key" });
    json[entryKey] = { ...json[entryKey], ...req.body };
    delete json[entryKey].key;

    // Write updated JSON back to file
    fs.writeFileSync(playedmaps, JSON.stringify(json, null, 2));

    res.json({ status: 'ok', latest: json[entryKey] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update played_maps.json' });
  }
});





app.get("/api/maps", (req,res)=>{
  try{
    const data = fs.readFileSync(maps, "utf8");
    res.json(JSON.parse(data));
  }catch(err){
    res.status(500).json({error: "Could not read maps.json"});
  }
});

app.get("/api/heros", (req,res)=>{
  try{
    const data = fs.readFileSync(heros, "utf8");
    res.json(JSON.parse(data));
  }catch(err){
    res.status(500).json({error: "Could not read heros.json"});
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
