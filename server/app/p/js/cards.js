  (function(){
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

const { useState, useEffect } = React;

    function RectangleWithContent() {


        const [maps, setMaps] = useState([]);
        useEffect(()=>{
           document.addEventListener("playedMapsUpdate", (e) => {
  try {
    const data = e.detail;           // already a parsed JS object
    setMaps(Object.entries(data));   // update state or variable
  } catch (err) {
    console.error("Error handling playedMapsUpdate:", err);
  }
});
            
            // fetch("/api/played_maps")
            // .then((res)=> res.json())
            // .then((data)=> {
            //     setMaps(Object.entries(data)); //convert obj json to array keeps [id, map] pair
            // })
            // .catch((err)=>console.error("Error: ",err));
        },[]);
        

        if( maps.length===0){
            return h('div', null, "Waiting for first Map");
        }
            

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  width: '300px',
  height: '420px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '2px solid rgba(87, 87, 87, 1)',
  boxShadow: '2px 4px 12px rgba(0,0,0,0.1)',
  position: 'relative',
  justifyContent: "flex-start",
  alignItems: "stretch",
};

const topStyle = {
  height: '10%',
  backgroundColor: '#008022',
  flexShrink: 0,
};

const bottomStyle = {
  height: '90%',
  backgroundColor: '#808080',
  flexShrink: 0,
  position: 'relative', // needed for absolute positioning of children
};

// Center scoring on top
const scoring = {
  position: 'absolute',
  top: '13px',
  left: '7%',
  transform: 'translateX(-50%)',
  color: 'white',
  fontWeight: 'bold',
};

// Symmetrically spaced red and blue backgrounds
const redbg = {
  position: 'absolute',
  top: '65%',
  left: '75%', // shifted to mirror blue
  transform: 'translateX(-50%)',
  width: '90px',
  height: '90px',
  backgroundColor: 'red',
};

const bluebg = {
  position: 'absolute',
  top: '65%',
  left: '25%', // symmetrical spacing
  transform: 'translateX(-50%)',
  width: '90px',
  height: '90px',
  backgroundColor: 'lightblue',
};

// "No Bans" centered horizontally at 70% of bottom
const nobans = {
  position: 'absolute',
  top: '70%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'transparent',
  backgroundImage: "repeating-linear-gradient(45deg, black 0 2px, transparent 2px 6px)",
  border: "3px solid black",
  height: "110px",
  width: "200px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "16px",
  fontWeight: "bold",
  color: "black",
  textAlign: "center",
};

const bantext={
        position: 'absolute',
        top: '58%',       // above the No Bans block at 70%
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
}


// Overlay content
const overlayTextStyle = {
  position: 'absolute',
  top: '13px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'white',
  fontWeight: 'bold',
};

const overlayImageStyle = {
  position: 'absolute',
  top: '17%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '250px',
  borderRadius: '8px',
};

const ban_red = {
  position: 'absolute',

  transform: 'translateX(-50% -50%)',
  width: '90px',
};

const ban_blue = {
  position: 'absolute',
  transform: 'translateX(-50% -50%)',
  width: '90px',
};


return h('div', null,
  maps.map(([id, map], index) => {
    if (!map?.name) return null;

    const shiftStyle = {
      transform: `translate(-50%, -50%) translate(${index * 40}px)`,
    };

    return h('div', {
      className: "absolute left-1/2 top-1/2 z-[${index}] flex flex-col w-[300px] h-[420px] rounded-xl overflow-hidden border-2 border-[#575757] shadow-md",
      style: shiftStyle
    }, [
      // Top bar
      h('div', { className: "flex-shrink-0 h-[10%] bg-[#008000]" }),

      // Bottom section (relative to allow stacking)
      h('div', { className: "flex-shrink-0 h-[90%] bg-[#808080] " }, [
        // Red Ban
        map.ban_red && h('div', { className: "absolute top-[65%] left-[75%] -translate-x-1/2 w-[90px] h-[90px] bg-red-600" }, [
          map.ban_red && h('img', { className: "absolute w-[90px] ", src: map.ban_red }),
        ]),

        // Blue Ban
        map.ban_blue && h('div', { className: "absolute top-[65%] left-[25%] -translate-x-1/2 w-[90px] h-[90px] bg-blue-300" }, [
          map.ban_blue && h('img', { className: "absolute w-[90px]", src: map.ban_blue }),
        ]),

        // No Bans
        !(map.ban_blue || map.ban_red) && h('div', {
          className: "absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[110px] flex justify-center items-center text-center font-bold text-black border-3 border-black",
          style: { backgroundImage: "repeating-linear-gradient(45deg, black 0 2px, transparent 2px 6px)" }
        }, "No Bans"),

        // Bans text
        (map.ban_blue || map.ban_red) && h("div", {
          className: "absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-black font-bold text-[20px] text-center"
        }, "Bans:"),
      ]),

      // Overlay text (map name)
      h('div', { className: "absolute top-[13px] left-1/2 -translate-x-1/2 text-white font-bold" }, map.name),

      // Score
      map.score_blue && h('div', { className: "absolute top-[13px] left-[7%] -translate-x-1/2 text-white font-bold" }, `${map.score_blue}-${map.score_red}`),

      // Overlay image
      h('img', { className: "absolute top-[17%] left-1/2 -translate-x-1/2 w-[250px] rounded-md", src: map.image }),
    ]);
  })
);
}

      const root = ReactDOM.createRoot(document.getElementById('Mapcards'));
      root.render(h(RectangleWithContent));

      })();