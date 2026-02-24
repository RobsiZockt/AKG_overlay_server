import { writable } from "svelte/store";

export function createFetchStore(url) {
  const data = writable([]);
  const loading = writable(false);
  const error = writable(null);

  async function load() {
    loading.set(true);
    error.set(null);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      
      const array = Object.entries(json).map(([id, value]) => ({
        id,
        ...value
      }));

      data.set(array);
    } catch (e) {
      error.set(e);
    } finally {
      loading.set(false);
    }
  }

  // alias
  const refresh = load;

  return {
    subscribe: data.subscribe,
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    load,
    refresh
  };
}