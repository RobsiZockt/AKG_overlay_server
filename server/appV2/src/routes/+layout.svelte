<!-- src/routes/+layout.svelte -->
<script>
  export let data
</script>

{#if data.isCaster}
  <div style="border: 3px solid red; padding: 1rem;">
    <h2>Admin Layout</h2>
    <slot />
  </div>
{:else if data.isPublic}
  <div style="border: 3px solid green; padding: 1rem;">
    <h2>Public Layout</h2>
    <slot />
  </div>
  {:else if data.isOverlay}
  <div style="border: 3px solid blue; padding: 1rem;">
    <h2>Overlay Layout</h2>
    <slot />
  </div>
{:else}
  <div style="border: 3px solid gray; padding: 1rem;">
    <h2>Unknown host</h2>
    <slot />
  </div>
{/if}
