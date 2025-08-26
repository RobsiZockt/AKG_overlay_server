const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 4000;

const mapsFile = path.join(__dirname, "api","played_maps.json");

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
      const stats = fs.statSync(mapsFile);
      if (stats.mtimeMs !== lastMtime && stats.size > 0) {
        const obj = JSON.parse(fs.readFileSync(mapsFile,"utf8"));
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















/////////LEGACY GET / POST ////////////////////////
app.get("/api/played_maps", (req,res) =>{
try{
    const data = fs.readFileSync(mapsFile,"utf8");
    res.json(JSON.parse(data));
}catch (err){
    console.error("Error reading played_maps.json:", err);
    res.status(500).json({error: "Could not read played_maps.json"});
}
});

app.post("/api/played_maps",(req,res) =>{
    console.log("Received body:", req.body);
try{
    const data = fs.writeFileSync(mapsFile,JSON.stringify(req.body,null,2));
    res.json({status: "ok"});
}catch (err){
    res.status(500).json({error: "Could not write on played_maps.json"});
}
});
////////////////LEGACY END ///////////////////////////
app.listen(PORT,()=>
console.log("Server is listening on ${PORT}"));
console.log("Maps file path:", mapsFile);
