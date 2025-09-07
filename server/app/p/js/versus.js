const { useEffect, useState } = React;

(function () {

function waitForContainer(id, callback) {
  const interval = setInterval(() => {
    const ex = document.getElementById(id);
    if (ex) {
      clearInterval(interval);
      callback(ex);
    }
  }, 100); //100ms pulling rate
}

const iconMap={
  Tank: "../img/icons/Tank_icon.svg",
  DPS : "../img/icons/Damage_icon.svg",
  Support: "../img/icons/Support_icon.svg",
}



function PlayerVS(){
  const [players, setPlayers] = useState({});
  const [header, setHeader] = useState({});
  
  // get The Player lists of the teams
  useEffect(()=>{
     async function fetchData() {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setPlayers(data);
      }catch(err){ console.error("Error fetching data:", err);}
    }
        fetchData();
  },[]);

  //get team names and logos
  useEffect(() => {
    async function fetchDataheader() {
      try {
        const response = await fetch("/api/matchup");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setHeader(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchDataheader();
  },[]);


  return h("div", { id:"full_container",className: "w-screen h-full absolute flex flex-col bg-[#000000aa]" },
    //header, logic is the exact same as in header.js just simplifed
    h("div", {id:"Header", className: " h-[10%] flex bg-gray-200/30"},
     //render blue team name and logo
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1" },
        h("img", { src: header.blue_logo, className: "h-auto aspect-square object-cover", alt: "Left" })
      ),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("span", { className: "font-arial text-white w-full text-[40px] pl-2" }, header.blue),

   //render red team name and logo
      h("span", { className: "text-white text-[40px] item-center font-arial pr-2" }, header.red),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1" },
        h("img", { src: header.red_logo, className: "h-auto aspect-square object-cover", alt: "Right" }),
      )
    
    ),
    //Team VS array contains both teams and the versus part in the middle
    h("div", {id:"Teams_VS_array",className: "h-[90%] flex"},
      //renderlogic for the blue team side
      h("div",{id:"Blue_team", className:"h-full flex-col w-flex flex flex-1 bg-gray-700/30 space-y-4"},[
        players.blue ? players.blue.map((p)=>{
          
          if(p.id >5){
            return null;
          }

          return h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full"},
          h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full bg-gradient-to-l from-blue-700 to-transparent"},
            h("div",{id:"text",className:" h-full flex flex-1 flex-col justify-end"},
              h("div", {id:"namebox", className:"h-[85%] flex w-full justify-end"},
                h("span", { className: "font-arial text-white text-[10vh] p-0 m-0 leading-none inline-block pr-2 " }, p.name),
              ),
              h("div",{id:"rolebox", className:"h-[15%] bg-[#000000aa] flex w-full justify-end"},
                h("span", { className: "font-arial text-white text-[20px] p-0 m-0 leading-none inline-block pr-2" }, p.role),
              ),
            ),
            h("img", { src: p.main, className: "max-h-full flex aspect-square object-contain",}),
          ),
          h("div",{id: "role", className:"max-w-[7%] h-full flex flex-1 bg-blue-700"},
            h("img",{id:"role_logo",className:"h-full w-full items-center justify-center p-2",src: iconMap[p.role]})
          )
          )
        }):null,
        //render logic for the substetudes / id > 5
        h("div",{id:"subs", className:"h-[7.5vh] flex w-full justify-end space-x-2"},[
          players.blue ? players.blue.map((p)=>{
            if(p.id >5){
              return h("div",{id: p.id, className:"h-auto flex bg-blue-700/50"},
                h("div",{id:"text",className:"flex flex-1 flex-col "},
                  h("span", { className: "flex font-arial text-white w-full text-[20px] p-0 m-0 leading-none inline-block pl-2 justify-end" }, p.name),
                  h("span", { className: "flex font-arial text-white w-full text-[10px] p-0 m-0 leading-none inline-block pl-2 justify-end" }, p.role)
                ),
                h("img", { src: p.main, className: "h-[40px] flex aspect-square object-cover",})
              )
            }
          }):null,
        ]),
        h("div",{id:"spacer",className:"h-[5%]"},null)
      ]),
      //renderlogic for the VS in the middle
      h("div",{id:"versus",className:"h-full w-[15%] bg-green-700"}, "VERSUS"),
      //renderlogic for the red team
      h("div",{id:"Red_team", className:"h-full flex-col flex w-flex flex-1 bg-gray-700/30 space-y-4"},[
         players.red ? players.red.map((p)=>{
          
          if(p.id >5){
            return null;
          }

          return h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full"},
          h("div",{id: "role", className:"max-w-[7%] h-full flex flex-1 bg-red-700"},
            h("img",{id:"role_logo",className:"h-full w-full items-center justify-center p-2",src: iconMap[p.role]})
          ),
          h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full bg-gradient-to-r from-red-700 to-transparent"},
            h("img", { src: p.main, className: "max-h-full flex aspect-square object-contain",}),
            h("div",{id:"text",className:" h-full flex flex-1 flex-col justify-start"},
              h("div", {id:"namebox", className:"h-[85%] flex w-full justify-start"},
                h("span", { className: "font-arial text-white text-[10vh] p-0 m-0 leading-none inline-block pr-2 " }, p.name),
              ),
              h("div",{id:"rolebox", className:"h-[15%] bg-[#000000aa] flex w-full justify-start"},
                h("span", { className: "font-arial text-white text-[20px] p-0 m-0 leading-none inline-block pr-2" }, p.role),
              ),
            ),
           
          ),

          )
        }):null,
        //render logic for the substetudes / id > 5
        h("div",{id:"subs", className:"h-[7.5vh] flex w-full justify-start"},[
          players.red ? players.red.map((p)=>{
            if(p.id >5){
              return h("div",{id: p.id, className:"h-auto flex bg-red-700/50"},
                h("img", { src: p.main, className: "h-[40px] flex aspect-square object-cover",}),
                h("div",{id:"text",className:"flex flex-1 flex-col "},
                  h("span", { className: "flex font-arial text-white w-full text-[20px] p-0 m-0 leading-none inline-block pl-2 justify-start"}, p.name),
                  h("span", { className: "flex font-arial text-white w-full text-[10px] p-0 m-0 leading-none inline-block pl-2 justify-start"}, p.role)
                ),
              )
            }
          }):null,
        ]),
        h("div",{id:"spacer",className:"h-[5%]"},null),
      ])
    )
  )
}

waitForContainer("versus", (container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(PlayerVS));
})

})();