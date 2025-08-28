// Find a container by its ID


(function(){
let keys;
let latestKey;
let latestJson = {};
let overwrite1;
let overwrite2;

function waitForContainer(id, callback) {
  const interval = setInterval(() => {
    const ex = document.getElementById(id);
    if (ex) {
      clearInterval(interval);
      callback(ex);
    }
  }, 100); //100ms pulling rate
}

/**
 * Creates a colored button
 * @param {HTMLButtonElement} target - The Buttom element tageted
 * @param {string} color - The wished color of the button
 * 
 */
function createButton(target, color){
target.style.backgroundColor = color; // blue background
target.style.color = "#fff";              // white text
target.style.border = "none";
target.style.borderRadius = "4px";
target.style.cursor = "pointer";
target.style.fontSize = "14px";
target.style.padding = "8px 16px";
}

//listens to SEE and updates all JSON related values
const cleanup = window.subscribePlayedMaps((data) => {
    latestJson = data;
  console.log("Latest JSON:", latestJson);

  keys = Object.keys(latestJson).map(Number);
  latestKey = Math.max(...keys);

  if (overwrite1) {
    overwrite1.value = latestJson[latestKey].score_blue;
  }
  if(overwrite2){overwrite2.value=latestJson[latestKey].score_red;}
  });



waitForContainer("scoresetter", (container) => {

  // Create CSS grid
  container.style.display = "grid";
  container.style.gridTemplateColums = "50% 50%";
  container.style.gridTemplateRows = "auto";

  const settergrid = document.createElement("div");
  settergrid.style.display = "grid";
  settergrid.style.gridTemplateColums = "20% 80%";
  settergrid.style.gridTemplateRows = "auto auto";
  settergrid.style.gap = "5px";
  settergrid.style.justifyItems = "start";
  settergrid.style.gridColumn ="1";
  container.appendChild(settergrid);

  const othergrid = document.createElement("div");
    othergrid.style.gridColumn ="2";
  container.appendChild(othergrid);

  // Create Button 1
  const button1 = document.createElement("button");

  button1.textContent = "Blue Team +1";

  createButton(button1, "lightblue");
  button1.addEventListener("click", () => handleButtonClick("1"));
  button1.style.gridRow ="1";
  button1.style.gridColumn ="1";
  settergrid.appendChild(button1);

  // Create Button 2
  const button2 = document.createElement("button");
  button2.textContent = "Red Team +1";
  createButton(button2,"red");
  button2.addEventListener("click", () => handleButtonClick("2"));
  button2.style.gridRow="2";
  button2.style.gridColumn="1";
  settergrid.appendChild(button2);

  // Create Texfield for overwriting Score
  overwrite1 = document.createElement("textarea");
  overwrite1.style.width = "50px";
  overwrite1.style.height = "20px";
  overwrite1.style.gridRow = "1";
  overwrite1.style.gridColumn = "2";
  overwrite1.addEventListener("keydown", (event)=>{if(event.key === "Enter"){event.preventDefault();  handleOverwrite("1",overwrite1.value)}});
  settergrid.appendChild(overwrite1);


  overwrite2 = document.createElement("textarea");
  overwrite2.style.width = "50px";
  overwrite2.style.height = "20px";
  overwrite2.style.gridRow = "2";
  overwrite2.style.gridColumn = "2";
  overwrite2.addEventListener("keydown", (event)=>{if(event.key === "Enter"){event.preventDefault();  handleOverwrite("2",overwrite2.value)}});
  settergrid.appendChild(overwrite2);

  const newmap = document.createElement("button");
  newmap.textContent = "NEXT MAP";
  createButton(newmap,"green");
  newmap.addEventListener("click", () => handleNewMap());
  othergrid.appendChild(newmap);

const showPopupButton = document.createElement("button");
  showPopupButton.textContent = "Show Setup";
  createButton(showPopupButton, "purple");
  showPopupButton.addEventListener("click",()=>showPopup());
  othergrid.appendChild(showPopupButton);




  // Function to show the popup
function showPopup() {
  // 1. Create a temporary div for the popup
  const popupDiv = document.createElement("div");
  document.body.appendChild(popupDiv);

  // 2. Create a React root on that div
  const popupRoot = ReactDOM.createRoot(popupDiv);

  // 3. Popup component
  function Popup() {
    // Load script on mount
    React.useEffect(() => {
      const script = document.createElement("script");
      script.src = "./../js/m_setup.js"; // <-- your script
      script.async = true;

      document.body.appendChild(script);

      // Cleanup when popup unmounts
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    return h(
      "div",
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
        },
      },
      h(
        "div",
        {
          style: {
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "1rem",
            minWidth: "500px",
            textAlign: "center",
          },
        },
        h("h2", null, "Test Popup"),
        h("div", {id: "##setup"}),
        h(
          "button",
          {
            style: {
              marginTop: "1rem",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            },
            onClick: () => {
              // 4. Properly unmount the popup
              popupRoot.unmount();
              document.body.removeChild(popupDiv);
            },
          },
          "Close"
        )
      )
    );
  }

  // 5. Render the popup
  popupRoot.render(h(Popup));
}


  


});






async function handleNewMap() {
if(latestJson[latestKey]?.name ){

  const matchup = await getMatchup();

  let s1=parseInt(latestJson[latestKey].score_blue);
  let s2=parseInt(latestJson[latestKey].score_red);

  if(s1 === 0 || s2 === 0) console.error("Score could not be read or is empty");
  if(s1==s2){
    console.log("Map result: Draw, skippin calculation");
  }
  if(s1>s2){
const res = matchup["blue_score"]+1;
    data = {blue_score: res};
        updatematchup(data);
  }
  if(s1<s2){
    const res = matchup["red_score"]+1;
    data = {red_score: res};
    updatematchup(data);
  }



  const newkey = String(Number(latestKey + 1));
  data = {key: newkey, name: "", image: "", ban_red: "", ban_red_name: "",ban_blue: "", ban_blue_name: "", score_blue:"0",score_red:"0"};
  addMap(data);


}
}

async function handleOverwrite(team, value) {

  let data;
  if(team==="1"){
    data ={ score_blue: value};
  }
  if(team==="2"){
    data ={score_red: value};
  }
  
  update(latestKey, data);
}

async function handleButtonClick(option) {
  var newscore;
  var data;

  //Adds +1 to the current score of the selected team
  if (option === "1") {
    newscore = String(Number(latestJson[latestKey].score_blue) + 1);
    data = {  score_blue: newscore };
  }
  if (option === "2") {
    newscore = String(Number(latestJson[latestKey].score_red) + 1);
    data = {  score_red: newscore };
  }

  update(latestKey,data);
  
}

async function getMatchup() {
  try {
    const response = await fetch("/api/matchup");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    matchup_data = await response.json();
     console.log(matchup_data);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
  return matchup_data;
  
}

async function updatematchup(data) {
   try {
    const response = await fetch(`/api/matchup`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
    console.log("JSON updated successfully:", result);
  } catch (error) {
    console.error("Error updating JSON:", error);
  }
  
}

async function addMap(data) {
  try {
    const response = await fetch("/api/played_maps",{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body:JSON.stringify(data),
    });
    if(!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
  } catch (error){
    console.error("Error adding New Map: ", error)
  }

  const iframe = document.getElementById("header_iframe");
  iframe.contentWindow.location.reload();  
  
}

async function update(id,data) {
  try {
    const response = await fetch(`/api/played_maps/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
    console.log("JSON updated successfully:", result);
  } catch (error) {
    console.error("Error updating JSON:", error);
  }
}
})();