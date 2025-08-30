

(function () {
  const { useState, useEffect } = React;

  let pickedmap;
  let latestKey;
  let latestJson;
  let setHighlightedNameExt;
  let selectedmap;

  //listens to SEE and updates all JSON related values




  const cleanup = window.subscribePlayedMaps((data) => {
    latestJson = data;
        keys = Object.keys(latestJson).map(Number);
    latestKey = Math.max(...keys);

    selectedmap = latestJson[latestKey].name;
    if(setHighlightedNameExt){
    setHighlightedNameExt(selectedmap);}
})


  

 async function update(id,data) {
  try {
    const response = await fetch(`/api/played_maps/${id}`, {
      method: "PUT",
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

  function handleImageClick(idx) {
    pickedmap = { map: idx };
    update(latestKey,pickedmap);
  }

  function ImageSearchApp() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [highlightedName, setHighlightedName] = useState(null);

    React.useEffect(() => {
      setHighlightedNameExt = setHighlightedName;
    }, [setHighlightedName]);

    useEffect(() => {
      // Fetch JSON from backend
      fetch("/api/maps") 
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

    return h("div", { className: "p-4 h-full flex flex-col" }, [
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
          const isHighlighted = item.name === selectedmap;
          return h(
            "div",
            {
              key: idx,
              className:
                "flex flex-col items-center p-1 rounded cursor-pointer transition-shadow ",
              onClick: () => {handleImageClick(idx);},
            },
            [
              h("img", {
                src: item.path,
                alt: item.name,
                className:
                  "w-full h-auto object-cover rounded shadow " +
                  (isHighlighted ? "ring-4 ring-blue-500" : ""),
              }),
              h("p", { className: "mt-2 text-sm" }, item.name),
            ]
          );
        })
      ),
    ]);
  }

  // Mount into existing React root
  waitForContainer("mappick", (container) => {
    const root = ReactDOM.createRoot(container);
    root.render(h(ImageSearchApp));
  });
})();
