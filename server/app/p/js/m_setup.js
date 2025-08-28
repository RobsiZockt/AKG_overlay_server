(function () {
const { useState, useEffect } = React;

function waitForContainer(id, callback) {
  const interval = setInterval(() => {
    const ex = document.getElementById(id);
    if (ex) {
      clearInterval(interval);
      callback(ex);
    }
  }, 100); //100ms pulling rate
}


let matchup_data ={};


waitForContainer("##setup", (container) => {

(async function fetchData() {
  try {
    const response = await fetch("/api/matchup");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    matchup_data = await response.json();
     console.log(matchup_data);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
})();

    function createSetup(){
  // Find popup content container
  if (container) {
    // Clear previous content (in case script reloaded)
    container.innerHTML = "";

  container.style.display = "grid";
  container.style.gridTemplateColumns = "66% 33%";
  container.style.gridTemplateRows = "auto";

  const settergrid = document.createElement("div");
  settergrid.style.display = "grid";
  settergrid.style.gridTemplateColumns = "50% 50%";
  settergrid.style.gridTemplateRows = "auto auto";
  settergrid.style.gap = "5px";
  settergrid.style.justifyItems = "start";
  settergrid.style.gridColumn ="1";
  container.appendChild(settergrid);


const blue_name_container = createInput("blue Team", "blue",1,1);
settergrid.appendChild(blue_name_container);

const red_name_container = createInput("Red Team", "red",2,1);
settergrid.appendChild(red_name_container);

const blue_img_container = createInput("Blue Logo", "blue_logo",1,2);
settergrid.appendChild(blue_img_container);

const red_img_container = createInput("Red Logo", "red_logo",2,2);
settergrid.appendChild(red_img_container);



const save = document.createElement("button");

  save.textContent = "SAVE";
save.style.backgroundColor = "#ffee00"; // blue background
save.style.color = "#fff";              // white text
save.style.border = "none";
save.style.borderRadius = "4px";
save.style.cursor = "pointer";
save.style.fontSize = "14px";
save.style.padding = "8px 16px";
  save.addEventListener("click", () => handleSave());
  save.style.gridColumn ="2";
  container.appendChild(save);



  }


  function createInput(label_txt, handler_id, pos_x, pos_y){

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gridRow = pos_y;
    container.style.gridColumn = pos_x;

    const label = document.createElement("span");
    label.innerText = label_txt;

    const textfield = document.createElement("textarea");
    textfield.style.width = "100px";
    textfield.style.height = "20px";
    textfield.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
        event.preventDefault();
        handleEdit(handler_id, textfield.value);}
    });

    container.appendChild(label);
    container.appendChild(textfield);

    return container;
  }

  function handleEdit(id, value){
    matchup_data[id]= value;
  }

  function handleSave(){
    matchup_data["blue_score"]= 0;
    matchup_data["red_score"] = 0;

    newMatchup(matchup_data);

   

    }

async function newMatchup(data) {

      try {
    const response = await fetch("/api/new_matchup",{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body:JSON.stringify(data),
    });
    if(!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
    console.log(result);
  } catch (error){
    console.error("Error setting up new Matchup: ", error)
  }
}

}

createSetup();
});



})();

