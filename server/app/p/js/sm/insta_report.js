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

const game_logo_lookup ={
  LOL: "../img/icons/lol.svg",
  OW: "../img/icons/overwatch_logo.svg",
  CS2: "../img/icons/counter_strike_logo.webp",
  VAL: "../img/icons/valorant_logo.png"
};

const game_name_lookup={
  LOL: "League of Legends",
  OW: "Overwatch2",
  CS2: "Counter Strike 2",
  VAL: "Valorant"
}

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
		h("img",{ src: game_logo_lookup[game], className: "h-auto aspect-square object-cover p-2",}),
		h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, game_name_lookup[game]),
		h("img",{ src: "../img/icons/uniliga_notext.png", className: "h-min-[50px] aspect-square object-cover p-2", alt: "Right" }), //DO NOT USE due to unclear rules / requirements (as of 05.10.2025 18:25)
		h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, liga),
	)
	
}


/**
 * handels the render for the first named team
 */
const displayFirst=(team,winner)=>{
	let filter ="";
	if (winner === 2)filter= "brightness-50";

	return h("div",{className:`h-full flex w-full items-center  filter ${filter}`},
    h("div",{className:"h-full flex w-[90%] justify-start items-center"},
		  h("div", {className:"h-full w-[2%] p-2 bg-blue-700"}),
		  h("img", { src: team.logo, className: "h-[50%] aspect-square object-cover", alt: "Right" }),
		  h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center" }, team.name),
    ),
    h("div",{className:"h-full w-[10%] flex flex-1 items-center justify-end"},
		  h("span",{ className: "ml-2 font-arial text-8xl text-white" }, team.score),
    ),
	)


}
/**
 * handels the render for the second named team
 */
const displaySecond=(team,winner)=>{
	let filter="";
	if (winner === 1)filter= "brightness-50";


let teamcolor="bg-red-700";
  if(team.name.startsWith("HSK")) teamcolor="bg-[#35a653]";

	return h("div",{className:`h-full flex w-full items-center filter ${filter}`},
      h("div",{className:"h-full w-[10%] flex flex-1 items-center justify-start"},
		    h("span",{ className: "ml-2 font-arial text-8xl text-white" }, team.score),
      ),
      h("div",{className:"h-full flex w-[90%] justify-end items-center"},
		    h("span",{ className: "ml-2 font-arial text-5xl text-white items-center justify-center text-right" }, team.name),		 
		    h("img", { src: team.logo, className: "h-[50%] aspect-square object-cover", alt: "Right" }),
        h("div", {className:`h-full w-[2%] p-2 ${teamcolor}`}),
      ),

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
	h("div",{className:"w-full h-[70%] flex items-center "},
    h("div",{className:"h-full w-[49%] items-end flex justify-start"},displayFirst(report[id]?.firstnamed, winner)),
		h("span",{ className: "ml-2 font-arial text-8xl text-white flex items-center justify-center" }, ":"),
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
        h("div",{className: " gap-3 h-[86%] w-full bg-transparent"},
					h("div",{className:"h-[2%] w-full bg-transparent"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(0)),
            
            h("div",{className:"h-[2%] w-full bg-transparent"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(0)),
            
            h("div",{className:"h-[2%] w-full bg-transparent"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(1)),

            h("div",{className:"h-[2%] w-full bg-transparent"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(2)),
            

            h("div",{className:"h-[2%] w-full bg-transparent"}),
            h("div",{className:"h-[12%] w-full bg-transparent flex"},renderMatchup(3)),


        )
    );
}

	waitForContainer("root",(container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(Report));
	})
})();