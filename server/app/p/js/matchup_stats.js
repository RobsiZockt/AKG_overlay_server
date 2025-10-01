(function(){

    const {useState, useEffect} =React;

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





function MatchupStats(){

	const [matchup, SetMatchup] = useState({});

	useEffect(()=>{
 async function fetchData() {
      try {
        const response = await fetch("/api/matchup");
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        SetMatchup(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
	},[]);

	return h("div",{id:"container",className:"w-[500px] h-[200px] flex flex-col space-y-2"},
		h("span",{className:"w-full text-[50px] text-white"},"Aktueller Spielstand:"),
		h("div",{id:"T1",className:"flex w-full h-[50%] justify-center"},
			h("img",{id:"t1_logo",className:"h-auto aspect-square object-cover",src:matchup.blue_logo}),
			h("span", { className: "font-arial text-white w-full text-[40px] pl-2" }, matchup.blue),
			h("span", { className: "ml-2 font-arial text-[40px] text-white items-center justify-center" }, matchup.blue_score)
		),
		h("div",{id:"T1",className:"flex w-full h-[50%]"},
			h("img",{id:"t1_logo",className:"h-auto aspect-square object-cover",src:matchup.red_logo}),
			h("span", { className: "font-arial text-white w-full text-[40px] pl-2" }, matchup.red),
			h("span", { className: "ml-2 font-arial text-[40px] text-white items-center justify-center" }, matchup.red_score)
		)
	)
}



waitForContainer("matchup_stats", (container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(MatchupStats));
});
})()