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
let container;

waitForContainer("##setup", (container) => {

    function createSetup(){
  // Find popup content container
  if (container) {
    // Clear previous content (in case script reloaded)
    container.innerHTML = "";

  container.style.display = "grid";
  container.style.gridTemplateColumns = "33% 33% 33%";
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
    const edit = {[id]: value}
  }
}

createSetup();
});

})();

