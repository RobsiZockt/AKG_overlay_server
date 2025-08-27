(function(){

const { useState, useEffect } = React;
const eventSource = new EventSource("/api/played_maps/stream");

let pickedmap;
let latestKey;
let latestJson;

//listens to SEE and updates all JSON related values
  eventSource.onmessage = (event) => {
    latestJson = JSON.parse(event.data);
    console.log("Latest JSON:", latestJson);

    keys = Object.keys(latestJson).map(Number);
    latestKey = Math.max(...keys);
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



function handleImageClick(item) {
    pickedmap = { key: latestKey, name: item.name, image: item.path };
      update(pickedmap);  
  }

function ImageSearchApp() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch JSON from backend
    fetch("/api/maps") // adjust this URL to your backend
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

    setResults(fuse.search(query).map(r => r.item));
  }, [query, data]);

return h("div", { className: "p-4" }, [
    h("input", {
      type: "text",
      placeholder: "Search images...",
      value: query,
      onChange: (e) => setQuery(e.target.value),
      className: "border p-2 w-full mb-4 rounded"
    }),
    h(
      "div",
      { className: "grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto", style:{flex: "1 1 auto", maxHeight:"calc(2*10rem+2rem"} },
      results.map((item, idx) =>
        h("div", { key: idx, className: "flex flex-col items-center" }, [
          h("img", {
            src: item.path,
            alt: item.name,
            className: "w-full h-auto rounded shadow cursor-pointer",
            onClick:()=>handleImageClick(item),
          }),
          h("p", { className: "mt-2 text-sm" }, item.name)
        ])
      )
    )
  ]);
}

// Mount into existing React root
waitForContainer("mappick", (container) => {
  const root = ReactDOM.createRoot(container);
  root.render(h(ImageSearchApp));
});

})();