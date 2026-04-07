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


	function BanDisplay(){
    const [lastmaps, setLastMaps] = useState({});

    useEffect(() => {
      document.addEventListener("playedMapsUpdate", (e) => {
        try {
          const data = e.detail; // already a parsed JS object
					const lastKey = Math.max(...Object.keys(data).map(Number));
					console
					setLastMaps(data[lastKey]); // update state or variable
        } catch (err) {
          console.error("Error handling playedMapsUpdate:", err);
        }
      });
    }, []);


	console.log(lastmaps.ban_red);
	
		return h("div",{className: "flex h-[300px] w-[230px] flex-col"},
		h("div", { className: "flex h-[15%] items-center justify-start pl-2 shadow-2xl", style: { clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)", backgroundColor: "#35a653ff" }},
			h("div",{ className: "text-3xl items-center justify-start pl-4"},"Bans:"),
		),
		h("div", { className: "flex h-[85%] items-center justify-start pl-2", style: { clipPath: "polygon(0 0, 90% 0, 70% 100%, 0 100%)", backgroundColor: "#575757ff" } },
			h("div",{className:"flex-1 h-full flex-col items-center justify-start p-4"},
				h("div",{className:"h-[45%] w-full  flex"},
					h("div",{className:"h-full w-[5%] bg-red-700"}),
					h("div",{className:"h-full w-[5%] bg-transparent"}),
					h("img",{className:"flex h-full aspect-square object-cover bg-[#808080]", src:lastmaps.ban_blue}, ),
				),
				h("div",{className:"flex-1 h-[7%] w-full"}),
				h("div",{className:"h-[45%] w-full flex flex-1"},
					h("div",{className:" h-full w-[5%] bg-[#00a2d4]"}),
					h("div",{className:"h-full w-[5%] bg-transparent"}),
					h("img",{className:"flex h-full aspect-square object-cover bg-[#808080]", src:lastmaps.ban_red}, ),
				)

			)
		),
		)
	}
	

	waitForContainer("ban_display",(container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(BanDisplay));
	})
})();