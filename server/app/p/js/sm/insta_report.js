(function(){
const {useEffect, useState} = React;

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



function Report(){
  const [report, setReport] = useState([]);
  
  // get The Player lists of the teams
  useEffect(()=>{
     async function fetchData() {
      try {
        const response = await fetch("/api/reports/sm_report");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
       const arr = Object.values(data);
        setReport(arr);
      }catch(err){ console.error("Error fetching data:", err);}
    }
        fetchData();
        
  },[]);

/**
 * handels the render for the different games
 */
const displayGame=(game, liga)=>{


	return h("div",{className:"h-full w-full bg-transparent flex"},
		h("img",{ src: "../img/icons/lol.svg", className: "h-auto aspect-square object-cover p-2",}),
		h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, game),
		//h("img",{ src: "../img/icons/uniliga.png", className: "h-[50px] aspect-square object-cover", alt: "Right" }), //DO NOT USE due to unclear rules / requirements (as of 05.10.2025 18:25)
		h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, liga),
	)
	
}


/**
 * handels the render for the first named team
 */
const displayFirst=(team,winner)=>{
	let haswon= false
	if (winner === 1)haswon = true;

	return h("div",{className:"h-full w-full flex items-end filter brightness-50"},
		h("div", {className:"h-full w-[5%] bg-blue-700"}),
		h("img", { src: team.logo, className: "h-auto aspect-square object-cover", alt: "Right" }),
		h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, team.name),
		h("span",{ className: "ml-2 font-arial text-8xl text-white items-center justify-center" }, team.score),
	)


}
/**
 * handels the render for the second named team
 */
const displaySecond=(team,winner)=>{
	let haswon= false
	if (winner === 2)haswon = true;

	return h("div",{className:"h-full w-full flex items-end justify-end"},
		h("span",{ className: "ml-2 font-arial text-8xl text-white items-center justify-center" }, team.score),
		h("span",{ className: "ml-2 font-arial text-5xl text-white text-right" }, team.name),
		h("img", { src: team.logo, className: "h-auto aspect-square object-cover", alt: "Right" }),
		h("div", {className:"h-full w-[5%] bg-red-700"}),
	)
}

/**
 * handels the render for each individual matchup
 */
const renderMatchup=(id)=>{
// reads array for game, first named / seccond named, checks who won, sets flags, builds render raster
// 
let winner=0;
if(report[id]?.firstnamed?.score > report[id]?.secondnamed?.score) winner =1;
else if (report[id]?.firstnamed?.score < report[id]?.secondnamed?.score) winner =2;
else if (report[id]?.firstnamed?.score == report[id]?.secondnamed?.score) winner =0;
console.log(winner);

return h("div",{className:"w-full h-full bg-[#000000aa] flex-col items-end"},
	h("div",{className:"w-full h-[30%] bg-transparent flex items-end"},displayGame(report[id]?.game, report[id]?.liga)),
	h("div",{className:"w-full h-[70%] flex items-end bg-[#000000aa]"},
    h("div",{className:"h-full w-[49%] items-end"},displayFirst(report[id]?.firstnamed, winner)),
		h("span",{ className: "ml-2 font-arial text-8xl text-white items-end justify-end" }, ":"),
		h("div",{className:"h-full w-[49%] items-end"},displaySecond(report[id]?.secondnamed, winner)),
	)
);
}







    if (report.length === 0) {
      return h("div", null, "Waiting for backend");
    }


    return h("div",{className:"p-3 h-[1920px] w-[1080px] relative"},
        h("div",{className:"h-[14%] w-full bg-transparent relative "},
					h("span",{ className: "ml-2 font-arial text-[100px] text-white items-center justify-center flex" }, "ERGEBNISSE KW XX"),
				),
        h("div",{className: " gap-3 h-[86%] w-full bg-blue-700"},
					h("div",{className:"h-[2%] w-full bg-green-400"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(0)),
            
            h("div",{className:"h-[2%] w-full bg-green-400"}),
            h("div",{className:"h-[15%] w-full bg-red-700 flex"}),
            
                        h("div",{className:"h-[1%] w-full bg-green-400"}),
            h("div",{className:"h-[15%] w-full bg-red-700 flex"}),
                        h("div",{className:"h-[1%] w-full bg-green-400"}),
            h("div",{className:"h-[15%] w-full bg-red-700 flex"}),
                        h("div",{className:"h-[1%] w-full bg-green-400"}),
            h("div",{className:"h-[15%] w-full bg-red-700 flex"}),
                        h("div",{className:"h-[1%] w-full bg-green-400"}),

        )
    );
}

	waitForContainer("root",(container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(Report));
	})
})();