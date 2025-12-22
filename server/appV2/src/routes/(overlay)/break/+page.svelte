<script>
  import { onMount } from 'svelte';

  let apiResults;

  const URL = '/api/maps';

onMount(() => {
  fetch('/api/api/maps')
    .then((response) => {
      console.log("STATUS:", response.status);
      console.log("STATUS TEXT:", response.statusText);
      return response.text();
    })
    .then((text) => {
      console.log("RAW RESPONSE:", text);
    })
    .catch(console.error);
});

</script>

<main>
  <div style="white-space: pre-wrap; margin-top: 1rem;">
    {#if apiResults}
      {JSON.stringify(apiResults, null, 2)}
    {/if}
  </div>
</main>
