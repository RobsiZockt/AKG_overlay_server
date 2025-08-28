const { createElement: h, useState, useEffect } = React;

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
  border: '2px solid rgba(0, 0, 0, 1)',
  boxShadow: '2px 4px 12px rgba(0,0,0,0.1)',
  position: 'relative',
  justifyContent: "flex-start",
  alignItems: "stretch",
};

const topStyle = {
  height: '10%',
  backgroundColor: 'green',
  flexShrink: 0,
};

const bottomStyle = {
  height: '90%',
  backgroundColor: 'gray',
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

    const shiftContainerStyle = {
      ...containerStyle,
      position: "absolute",
      transform: `translate(-50%, -50%) translate(${index * 40}px)`,
      left: "50%",
      top: "50%",
      zIndex: index,
    };

    return h('div', { style: shiftContainerStyle }, [
      h('div', { style: topStyle }),
      h('div', { style: bottomStyle }, [
        map.ban_red && h('div', { style: redbg },[
          map.ban_red && h('img', { style: ban_red, src: map.ban_red }),
        ]),
        map.ban_blue && h('div', { style: bluebg },[
                map.ban_blue && h('img', { style: ban_blue, src: map.ban_blue }),
        ]),
        !(map.ban_blue && map.ban_red) && h('div', { style: nobans }, "No Bans"),
        (map.ban_blue && map.ban_red) && h("div",{style: bantext},"Bans:"),
      ]),
      h('div', { style: overlayTextStyle }, map.name),
      map.score_blue && h('div', { style: scoring }, map.score_blue + "-" + map.score_red),
      h('img', { style: overlayImageStyle, src: map.image }),
      

    ]);
  })
);
}

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(h(RectangleWithContent));