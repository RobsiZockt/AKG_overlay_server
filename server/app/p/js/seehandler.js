(function(){

  function getH() {
    if (window.h) return window.h;
    if (window.React) {
      window.h = window.React.createElement;
      return window.h;
    }
    throw new Error("React not loaded yet");
  }

  const h = getH();

const eventSource = new EventSource("/api/update/stream");
let cachedata=null;

eventSource.onmessage = (e) => {
    try{
  const cachedata = JSON.parse(e.data);
  
  // Broadcast to all components
  document.dispatchEvent(new CustomEvent(cachedata.type, { detail: cachedata.payload }));
    }
    catch(err){
        console.error("Error parsing SEE data: ", err);
    }
};

eventSource.onerror = (err) => {
  console.error("SSE error:", err);
};

window.subscribePlayedMaps=function(handler){
    const listener = (e) => handler(e.detail);
    document.addEventListener("playedMapsUpdate",listener);

    if(cachedata !== null){
        handler(cachedata);
    }

    return () => document.removeEventListener("playedMapsUpdate",listener);
}

window.subscribeMatchup=function(handler){
    const listener = (e) => handler(e.detail);
    document.addEventListener("matchupUpdate",listener);

    if(cachedata !== null){
        handler(cachedata);
    }

    return () => document.removeEventListener("matchupUpdate",listener);
}

window.subscribePlayers=function(handler){
    const listener = (e) => handler(e.detail);
    document.addEventListener("playersUpdate",listener);

    if(cachedata !== null){
        handler(cachedata);
    }

    return () => document.removeEventListener("playersUpdate",listener);
}

})();