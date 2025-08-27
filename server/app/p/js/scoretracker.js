// Find a container by its ID

const eventSource = new EventSource("/api/played_maps/stream");
let keys;
let latestKey;
let latestJson = {};
let overwrite1;
let overwrite2;

function waitForContainer(id, callback) {
  const interval = setInterval(() => {
    const ex = document.getElementById("scoresetter");
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
eventSource.onmessage = (event) => {
  latestJson = JSON.parse(event.data);
  console.log("Latest JSON:", latestJson);

  keys = Object.keys(latestJson).map(Number);
  latestKey = Math.max(...keys);

  if (overwrite1) {
    overwrite1.value = latestJson[latestKey].score_blue;
  }
  if(overwrite2){overwrite2.value=latestJson[latestKey].score_red;}
};



waitForContainer("scoresetter", (container) => {

  // Create CSS grid
  container.style.display = "grid";
  container.style.gridTemplateColums = "20% 80%";
  container.style.gridTemplateRows = "auto auto";
  container.style.gap = "5px";
  container.style.justifyItems = "start";

  // Create Button 1
  const button1 = document.createElement("button");

  button1.textContent = "Blue Team +1";

  createButton(button1, "lightblue");
  button1.addEventListener("click", () => handleButtonClick("1"));
  button1.style.gridRow ="1";
  button1.style.gridColumn ="1";
  container.appendChild(button1);

  // Create Button 2
  const button2 = document.createElement("button");
  button2.textContent = "Red Team +1";
  createButton(button2,"red");
  button2.addEventListener("click", () => handleButtonClick("2"));
  button2.style.gridRow="2";
  button2.style.gridColumn="1";
  container.appendChild(button2);

  // Create Texfield for overwriting Score
  overwrite1 = document.createElement("textarea");
  overwrite1.style.width = "50px";
  overwrite1.style.height = "20px";
  overwrite1.style.gridRow = "1";
  overwrite1.style.gridColumn = "2";
  container.appendChild(overwrite1);


    overwrite2 = document.createElement("textarea");
  overwrite2.style.width = "50px";
  overwrite2.style.height = "20px";
  overwrite2.style.gridRow = "2";
  overwrite2.style.gridColumn = "2";
  container.appendChild(overwrite2);
});

async function handleButtonClick(option) {
  var newscore;
  var data;

  //Adds +1 to the current score of the selected team
  if (option === "1") {
    newscore = String(Number(latestJson[latestKey].score_blue) + 1);
    data = { key: latestKey, score_blue: newscore };
  }
  if (option === "2") {
    newscore = String(Number(latestJson[latestKey].score_red) + 1);
    data = { key: latestKey, score_red: newscore };
  }

  try {
    const response = await fetch("/api/played_maps", {
      method: "POST",
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
