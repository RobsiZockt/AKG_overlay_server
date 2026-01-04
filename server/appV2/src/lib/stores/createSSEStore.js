// @ts-nocheck
import { writable } from 'svelte/store';
import { sse } from '$lib/sse';
import { onMount } from 'svelte';

export function createSSEStore({ type, snapshotUrl, initial }) {
  console.log("starting Store");
  const store = writable(initial);

  let initialized = false;

  async function init() {
    if (initialized) return;
    initialized = true;

    if (typeof window === 'undefined') return;

    // 1️⃣ Fetch snapshot
    if (snapshotUrl) {
      console.log(snapshotUrl);
      try {
        console.log("snapshot fetching");
        const res = await fetch(snapshotUrl);
        if (res.ok) {
          const snapshot = await res.json();
          store.set(snapshot);
          console.log("snapshot fetched", res);
        } else {
          console.warn('Snapshot fetch failed: non-OK status', res.status);
        }
      } catch (err) {
        console.warn('Snapshot fetch failed:', err);
      }
    }

    // 2️⃣ Start SSE
    sse.on(type, payload => store.set(payload));
    sse.connect();
    

    
  }

  return {
    subscribe(run) {
      // Ensure init only runs in component context
      //onMount(() => {
        init();
     // });
      return store.subscribe(run);
    }
  };
}