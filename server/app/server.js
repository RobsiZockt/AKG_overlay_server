const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 4000;

//middleware for parsing json files
app.use(express.json());

//serves public files html/js/css in overlays
app.use(express.static(path.join(__dirname,"overlays")));

app.get("api/played_maps", (req,res) =>{
try{
    const data = fs.readFileSync("played_maps.json","utf8");
    res.json(JSON.parse(data));
}catch (err){
    res.status(500).json({error: "Could not read played_maps.json"});
}
});

app.post("api/played_maps",(req,res) =>{
try{
    const data = fs.writeFileSync("played_maps.json",JSON.stringify(req.body,null,2));
    res.json({status: "ok"});
}catch (err){
    res.status(500).json({error: "Could not write on played_maps.json"});
}
});

app.listen(PORT,()=>
console.log("Server is listening on ${PORT}"));