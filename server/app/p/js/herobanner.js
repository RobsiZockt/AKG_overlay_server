(function () {
  const { useState, useEffect } = React;
  const eventSource = new EventSource("/api/played_maps/stream");

  let ban_blue;
  let ban_red;
  let setBan;
  let latestKey;
  let latestJson;
  let setHighlight_blue_Ext;
  let setHighlight_red_Ext;

  //listens to SEE and updates all JSON related values
  eventSource.onmessage = (event) => {
    latestJson = JSON.parse(event.data);

    keys = Object.keys(latestJson).map(Number);
    latestKey = Math.max(...keys);

    ban_blue = latestJson[latestKey].ban_blue_name;
    ban_red = latestJson[latestKey].ban_red_name;
    if(setHighlight_blue_Ext)
    setHighlight_blue_Ext();
if(setHighlight_red_Ext)
    setHighlight_red_Ext();
  };


  async function update(data) {
    try {
      const response = await fetch("/api/played_maps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("JSON updated successfully:", result);
    } catch (error) {
      console.error("Error updating JSON:", error);
    }
  }

  function waitForContainer(id, callback) {
    const interval = setInterval(() => {
      const ex = document.getElementById(id);
      if (ex) {
        clearInterval(interval);
        callback(ex);
      }
    }, 100); //100ms pulling rate
  }
  
  function sel_team(){
  return "1"

  }


  function handleImageClick(item) {
    let team = sel_team();
    if (team === "1") {
      setBan = {key: latestKey, ban_blue_name: item.name, ban_blue: item.path};
    }
    if (team === "2") {
      setBan = { key: latestKey, ban_red_name: item.name, ban_red: item.path};
    }
    update(setBan);
  }

  function HeroBan() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [highlightedName_blue, setHighlight_blue] = useState(null);
    const [highlightedName_red, setHighlight_red] = useState(null);


    React.useEffect(() => {
      setHighlight_blue_Ext = setHighlight_blue;
    }, [setHighlight_blue]);
        React.useEffect(() => {
      setHighlight_red_Ext = setHighlight_red;
    }, [setHighlight_red]);

    useEffect(() => {
      // Fetch JSON from backend
      fetch("/api/heros") // adjust this URL to your backend
        .then((res) => res.json())
        .then((json) => {
          const arrayData = Object.entries(json).map(([id, value]) => ({
            id: id,
            ...value,
          }));
          setData(arrayData);
          setResults(arrayData); // show all initially
        })
        .catch((err) => console.error("Error fetching JSON:", err));
    }, []);

    useEffect(() => {
      if (!query) {
        setResults(data);
        return;
      }

      const fuse = new Fuse(data, {
        keys: ["name"], // search only by name
        threshold: 0.3, // lower = stricter match
      });

      setResults(fuse.search(query).map((r) => r.item));
    }, [query, data]);

    return h("div", { className: "p-4" }, [
      h("input", {
        type: "text",
        placeholder: "Search images...",
        value: query,
        onChange: (e) => setQuery(e.target.value),
        className: "border p-2 w-full mb-4 rounded",
      }),
      h(
        "div",
        {
          className: "grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto",
          style: { flex: "1 1 auto", maxHeight: "calc(2*10rem+2rem" },
        },
        results.map((item, idx) => {
          let ringClass="";
          if(item.name === ban_blue) ringClass= "ring-4 ring-blue-500";
          else if(item.name === ban_red) ringClass = "ring-4 ring-red-500";
          return h(
            "div",
            {
              key: idx,
              className:
                "flex flex-col items-center p-1 rounded cursor-pointer transition-shadow ",
              onClick: () => handleImageClick(item),
            },
            [
              h("img", {
                src: item.path,
                alt: item.name,
                className:
                  "w-full h-auto object-cover rounded shadow " +
                  ringClass,
              }),
              h("p", { className: "mt-2 text-sm" }, item.name),
            ]
          );
        })
      ),
    ]);
  }

  // Mount into existing React root
  waitForContainer("heroban", (container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(HeroBan));
  });
})();
