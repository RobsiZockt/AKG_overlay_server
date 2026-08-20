<script>
  import { onMount } from "svelte";
  import Detail from "./Detail.svelte";
  let { teamid,season } = $props();
    let data = $state();

  async function getIDVData(id,season) {
    try {
      const res = await fetch(`/api/pred/IDV/${id}/${season}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      data = await res.json();
    } catch (err) {
      console.warn(err);
    }
  }
  $effect(()=>{
    getIDVData(teamid,season);
  })
</script>

{#if data != null}
<div class="w-full h-auto shrink-0 p-1 grid grid-cols-4 gap-1">
{#each data as item }
  <Detail head_txt={item.txt} value={item.value}></Detail>
{/each}
</div>
{/if}
