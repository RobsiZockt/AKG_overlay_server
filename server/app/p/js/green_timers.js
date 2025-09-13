(function(){

const { useState, useEffect } = React;

function getH() {
  if (window.h) return window.h;
  if (window.React) {
    window.h = window.React.createElement;
    return window.h;
  }
  console.error("react not loaded");
  throw new Error("React not loaded yet");
}
const h = getH();

  /**
 * Checkes for an react element until it exists and returns it
 * @param {string} id - The id name of the targeted container
 * @param {import("react").ReactElement} callback - the returned react element targeted by id
 */
function waitForContainer(id, callback) {
  const interval = setInterval(() => {
    const ex = document.getElementById(id);
    if (ex) {
      clearInterval(interval);
      callback(ex);
    }
  }, 100); //100ms pulling rate
}

const colorMap={
  live: "red-700",
  build_delay: "yellow-700",

  default: "white"
}

let color_delay;
let color_live;

function timers(){
const [slive,SetSLive] = useState(new Date());
const [sdelayed,SetSDelayed] = useState(new Date());
  
useEffect(()=>{
  const interval =setInterval(() => {
      const now = new Date();

    // Subtract 3 minutes
    const delayMinutes = 3;
    SetSLive( new Date(now.getTime()));
    SetSDelayed( new Date(now.getTime() - delayMinutes * 60 * 1000));


if(slive.getHours()>=20 && slive.getHours() < 23)color_live = colorMap["live"];
  else if(slive.getHours()===19 && slive.getMinutes() ===50)color_live = colorMap["build_delay"];
    else color_live=colorMap["default"];

if(sdelayed.getHours()>=20 && sdelayed.getHours() < 23)color_delay = colorMap["live"];
  else if(sdelayed.getHours()===19 && sdelayed.getMinutes() ===50)color_delay = colorMap["build_delay"];
    else color_delay=colorMap["default"];

    }, 300);
    return () => clearInterval(interval);
},[]);
  

  return h("div",{id:"time_container",className:"flex flex-col items-center justify-center p-1"},
    h("div",{id:"live",className:`flex text-2xl text-${color_live} font-bold bg-transparent items-center justify-center`},slive.toLocaleTimeString([], {hour: '2-digit',minute: '2-digit',second: '2-digit'})),
h("div",{id:"delayed",className:`flex text-gl text-${color_delay} font-bold bg-transparent items-center justify-center`},sdelayed.toLocaleTimeString([], {hour: '2-digit',minute: '2-digit',second: '2-digit'})),
  )
}

waitForContainer("h-mid-spacer",(container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(timers));
});
})()