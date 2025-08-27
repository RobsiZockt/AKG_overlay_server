const eventSource = new EventSource("/api/played_maps/stream");

eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  // Broadcast to all components
  document.dispatchEvent(new CustomEvent("playedMapsUpdate", { detail: data }));
};

eventSource.onerror = (err) => {
  console.error("SSE error:", err);
};