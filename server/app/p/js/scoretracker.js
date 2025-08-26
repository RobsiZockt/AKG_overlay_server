// Find a container by its ID
const container = document.getElementById('scoresetter');
const eventSource = new EventSource("/api/played_maps/stream");

let latestJson = {};

eventSource.onmessage = (event) => {
  latestJson = JSON.parse(event.data);
  console.log('Latest JSON:', latestJson);
};

if (container) {
  // Create Button 1
  const button1 = document.createElement('button');
  button1.textContent = 'Blue Team +1';
  button1.addEventListener('click', () => handleButtonClick('1'));
  container.appendChild(button1);

  // Create Button 2
  const button2 = document.createElement('button');
  button2.textContent = 'Red Team +1';
  button2.addEventListener('click', () => handleButtonClick('2'));
  container.appendChild(button2);
}

async function handleButtonClick(option) {

const json = latestJson;
const keys = Object.keys(json).map(Number);
const latestKey =Math.max(...keys);
var newscore;
var data;

if(option === '1'){
newscore = String(Number(json[latestKey].score_blue) + 1);
   data = { key: latestKey, score_blue: newscore };
} if(option === '2'){
newscore = String(Number(json[latestKey].score_red) + 1);
   data = { key: latestKey, score_red: newscore };
}




  try {
    const response = await fetch('/api/played_maps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();
    console.log('JSON updated successfully:', result);
  } catch (error) {
    console.error('Error updating JSON:', error);
  }
}
