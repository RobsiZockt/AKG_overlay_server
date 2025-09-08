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
  1: "../img/icons/Tank_icon.svg",
  2: "../img/icons/Damage_icon.svg",
  3: "../img/icons/Damage_icon.svg",
  4: "../img/icons/Support_icon.svg",
  5: "../img/icons/Support_icon.svg",
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
     //render red team name and logo
     h("div", {className:" flex h-full w-[42.5%] justify-end items-center"},
      h("span", { className: "text-white text-[40px] item-center justify-center font-arial pr-2" }, header.blue),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1"},
        h("img", { src: header.blue_logo, className: "h-auto aspect-square object-cover", alt: "Right"}),
      ),
      ),
      h("div",{className:"h-full w-[15%] bg-transparent"}),
      //render blue team name and logo
      h("div",{className:"flex h-full w-[42.5%] justify-start items-center"},
      h("div", { className: "h-full aspect-square bg-transparent flex items-center justify-center p-1" },
        h("img", { src: header.red_logo, className: "h-auto aspect-square object-cover", alt: "Left" })
      ),
      h("div",{className: "h-full w-[2px] bg-black flex"}),
      h("span", { className: "font-arial text-white w-full text-[40px] pl-2" }, header.red),
      )
    ),
    //Team VS array contains both teams and the versus part in the middle
    h("div", {id:"Teams_VS_array",className: "h-[90%] flex"},
      //renderlogic for the blue team side
      h("div",{id:"Blue_team", className:"h-full w-[42.5%] flex-col w-flex flex flex-1 bg-gray-700/30 space-y-4"},[
        players.blue ? players.blue.map((p)=>{
          
          if(p.id >5){
            return null;
          }

          return h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full"},
            h("div",{id: p.id, className:"h-[15vh] flex flex-1 flex-col w-full bg-gradient-to-l from-blue-700 to-transparent"},
              h("div",{id: "img_container", className:"h-[80%] w-full flex flex-1"},
                h("div", {id:"namebox", className:" flex w-full items-center justify-end"},
                  h("span", { className: "font-arial text-white text-[55px] p-0 m-0 leading-none inline-block pr-2 "}, p.name),
                ),
                h("img", { src: p.main, className: " flex aspect-square object-contain",}),
              ),
              h("div",{id:"rolebox", className:"h-[20%] bg-[#000000aa] flex flex-row w-full "},
                h("div", {id:"extra", className:"h-full w-[50%] flex justify-start"},
                  h("span", {className: "font-arial text-[#35a652] text-[23px] p-0 m-0 leading-none inline-block pl-4"}, p.extra),
                ),
                h("div", {id:"role", className:"h-full w-[50%] flex justify-end"},
                  h("span", { className: "font-arial text-white text-[23px] p-0 m-0 leading-none inline-block " }, p.role),
                ), 
              ),
            ),
            h("div",{id: "role", className:"max-w-[7%] h-full flex flex-1 bg-blue-700"},
              h("div", {className:"bg-[#000000aa]"},
                h("img",{id:"role_logo",className:"h-full w-full items-center justify-center p-2",src: iconMap[p.id]}),
              ),
            ),
          )
        }):null,
        //render logic for the substetudes / id > 5
        h("div",{id:"subs", className:"h-[7.5vh] flex w-full justify-end space-x-2"},[
          players.blue ? players.blue.map((p)=>{
            if(p.id >5){
              return h("div",{id: p.id, className:"max-h-[90%] max-w-[20%] flex justify-end bg-blue-700/50"},
                h("div",{id:"text",className:"flex flex-1 flex-col overflow-hidden "},
                  h("div",{className:"flex-1 flex max-w-full items-center overflow-hidden "},
                    h("span", { className: "font-arial text-white text-[30px] p-0 m-0 leading-none inline-block pl-2 justify-start overflow-hidden" }, p.name),
                  ),
                  h("div",{className:"flex max-w-full h-[18px] overflow-hidden bg-[#000000aa] pr-1"},
                    h("span", { className: "flex-1 flex font-arial text-white w-full text-[15px] p-0 m-0 leading-none inline-block pl-2 justify-start" }, p.role),
                  ),
                ),
                  
                h("div",{id: "img_container", className:"h-full"},
                h("img", { src: p.main, className: "h-full aspect-square object-contain",}),),
              )
            }
          }):null,
        ]),
      ]),
      //renderlogic for the VS in the middle
      h("div",{id:"versus",className:"h-full w-[15%] flex bg-gray-700/30 justify-center items-center"},
        h("div",{className:"h-[20%]"},
          h("span",{id:"versus_text",className:"flex-1 font-arial text-white w-full text-[90px] p-0 m-0 leading-none inline-block"}, "VS"),
          ),
      ),
      //renderlogic for the red team
      h("div",{id:"Red_team", className:"h-full w-[42.5%] flex-col flex w-flex flex-1 bg-gray-700/30 space-y-4"},[
        players.red ? players.red.map((p)=>{
          
          if(p.id >5){
            return null;
          }

          return h("div",{id: p.id, className:"h-[15vh] flex flex-1 w-full"},
            h("div",{id: "role", className:"max-w-[7%] h-full flex flex-1 bg-red-700"},
              h("div", {className:"bg-[#000000aa]"},
                h("img",{id:"role_logo",className:"h-full w-full items-center justify-center p-2",src: iconMap[p.id]}),
              ),
            ),
            h("div",{id: p.id, className:"h-[15vh] flex flex-1 flex-col w-full bg-gradient-to-r from-red-700 to-transparent"},
              h("div",{id: "img_container", className:"h-[80%] w-full flex flex-1"},
                h("img", { src: p.main, className: " flex aspect-square object-contain",}),
                h("div", {id:"namebox", className:" flex w-full justify-start items-center"},
                  h("span", { className: "font-arial text-white text-[55px] p-0 m-0 leading-none inline-block pr-2 " }, p.name),
                ),
              ),
              h("div",{id:"rolebox", className:"h-[20%] bg-[#000000aa] flex flex-row w-full "},
                h("div", {id:"role", className:"h-full w-[50%] flex justify-start"},
                  h("span", { className: "font-arial text-white text-[23px] p-0 m-0 leading-none inline-block " }, p.role),
                ),
                h("div", {id:"extra", className:"h-full w-[50%] flex justify-end"},
                  h("span", {className: "font-arial text-[#35a652] text-[23px] p-0 m-0 leading-none inline-block pr-4"}, p.extra),
                ),
              ),
            ),
          )
        }):null,
        //render logic for the substetudes red / id > 5
        h("div",{id:"subs", className:"h-[7.5vh] flex w-full justify-start"},[
          players.red ? players.red.map((p)=>{
            if(p.id >5){
              return h("div",{id: p.id, className:"max-h-[90%] max-w-[20%] flex justify-end bg-red-700/50"},
                h("div",{id: "img_container", className:"h-full"},
                  h("img", { src: p.main, className: "h-full aspect-square object-contain",}),
                ),
                h("div",{id:"text",className:"flex flex-1 flex-col overflow-hidden "},  
                  h("div",{className:"flex-1 flex max-w-full items-center overflow-hidden "},
                    h("span", { className: "font-arial text-white text-[30px] p-0 m-0 leading-none inline-block pl-2 justify-end overflow-hidden" }, p.name),
                  ),
                  h("div",{className:"flex max-w-full h-[18px] overflow-hidden bg-[#000000aa] pr-1"},
                    h("span", { className: "flex-1 flex font-arial text-white w-full text-[15px] p-0 m-0 leading-none inline-block pl-2 justify-start" }, p.role),
                  ),
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

