(function (){


    function waitForContainer(id, callback) {
    const interval = setInterval(() => {
      const ex = document.getElementById(id);
      if (ex) {
        clearInterval(interval);
        callback(ex);
      }
    }, 100); //100ms pulling rate
  }


  function getH() {
    if (window.h) return window.h;
    if (window.React) {
      window.h = window.React.createElement;
      return window.h;
    }
    throw new Error("React not loaded yet");
  }

  const h = getH();


const {useState, useEffect } = React;

let setBannerDataExt;
const cleanup = window.subscribeMatchup((data)=>{

   if (data.switched === 1) {
        const swapped = {
          ...data,
          blue: data.red,
          red: data.blue,
          blue_score: data.red_score,
          red_score: data.blue_score,
          blue_logo: data.red_logo,
          red_logo: data.blue_logo,
        };
        setBannerDataExt(swapped);
      } else {
        setBannerDataExt(data);
      }
})



function TopBanner() {
  const [bannerData, setBannerData] = useState({});

useEffect(()=>{
  setBannerDataExt = setBannerData;
},[setBannerData]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/matchup");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (data.switched === 1) {
        const swapped = {
          ...data,
          blue: data.red,
          red: data.blue,
          blue_score: data.red_score,
          red_score: data.blue_score,
          blue_logo: data.red_logo,
          red_logo: data.blue_logo,
        };
        setBannerData(swapped);
      } else {
        setBannerData(data);
      }
        console.log(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }



    }
    fetchData();
      

      

  }, []);

  return h("div", { className: "w-screen h-[68px] relative flex" },
    // Left Gray Section
    h("div", { className: "flex-1 flex items-center justify-start pl-2", style: { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", backgroundColor: "#393a3e" } },
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1" },
        h("img", { src: bannerData.blue_logo, className: "h-auto aspect-square object-cover", alt: "Left" })
      ),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("span", { className: "font-arial text-white w-full text-[40px] pl-2" }, bannerData.blue)
    ),
    h("div",{ className: "w-[70px] flex items-center justify-start pl-0 pb-1 gap-2",
      style: { clipPath: "polygon(0 0, 100% 0, 60% 100%, 0 100%)", backgroundColor: "#00a2d9" }},
      h("span", { className: "ml-2 font-arial text-[50px] text-white items-center justify-center" }, bannerData.blue_score)
    ),
    h("div", {id:"h-mid-spacer", className: "w-[30%] bg-transparent flex-shrink-0" }),
    // Right Gray Section
    h("div", {className: "w-[70px] flex items-center justify-end pr-0 pb-1 gap-2",
      style: { clipPath: "polygon(0 0, 100% 0, 100% 100%, 40% 100%)", backgroundColor: "#ca4b5d" }},
      h("span", { className: "mr-2 font-arial text-[50px] text-white items-center justify-center" }, bannerData.red_score)
    ),
    h("div", { className: "flex-1 flex items-center justify-end pr-2", style: { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", backgroundColor: "#393a3e" } },
      h("span", { className: "text-white text-[40px] font-arial pr-2" }, bannerData.red),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1" },
        h("img", { src: bannerData.red_logo, className: "h-auto aspect-square object-cover", alt: "Right" })
      )
    )
  );
}

// Render
  waitForContainer("header", (container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(TopBanner));
  });


})();