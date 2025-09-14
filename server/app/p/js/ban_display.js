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
    const [maps, setMaps] = useState([]);
    useEffect(() => {
      document.addEventListener("playedMapsUpdate", (e) => {
        try {
          const data = e.detail; // already a parsed JS object
          setMaps(Object.entries(data)); // update state or variable
        } catch (err) {
          console.error("Error handling playedMapsUpdate:", err);
        }
      });
    }, []);

	
		return h("div",{className: "flex h-[300px] w-[230px] flex-col"},
			h("div", { className: "flex h-[15%] items-center justify-start pl-2", style: { clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)", backgroundColor: "#35a653ff" }}),
		h("div", { className: "flex h-[85%] items-center justify-start pl-2", style: { clipPath: "polygon(0 0, 90% 0, 70% 100%, 0 100%)", backgroundColor: "#575757ff" } },
			
		),
		)
	}
	

	waitForContainer("ban_display",(container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(BanDisplay));
	})
})();