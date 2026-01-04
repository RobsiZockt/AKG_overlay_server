 //@ts-nocheck
class SSERouter {
  source;
  handlers = new Map();

  connect() {
    console.log("SEE connected");
    if (this.source) return;

    this.source = new EventSource('/api/api/update/stream');


    this.source.onmessage = (e) => {
  console.log('RAW SSE:', e.data);

  const parsed = JSON.parse(e.data);
  console.log('PARSED SSE:', parsed);

  const { type, payload } = parsed;
  console.log('TYPE:', type, 'HAS HANDLERS:', this.handlers.has(type));

  this.handlers.get(type)?.forEach(fn => fn(payload));
};

    // this.source.onmessage = (e) => {
    //   const { type, payload } = JSON.parse(e.data);
    //   this.handlers.get(type)?.forEach(fn => fn(payload));
    // };

    this.source.onerror = () => {
      this.source.close();
      this.source = null;
      setTimeout(() => this.connect(), 3000);
    };
  }
  on(type, fn) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type).add(fn);

    return () => this.handlers.get(type)?.delete(fn);
  }
}

export const sse = new SSERouter();
