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
<div class="w-full h-[200px] shrink-0 p-1 items-center justify-center flex">
    <Detail head_txt={data[0].txt} value={data[0].value}></Detail>
    <Detail head_txt={data[1].txt} value={data[1].value}></Detail>
    <Detail head_txt={data[2].txt} value={data[2].value}></Detail>
    <Detail head_txt={data[3].txt} value={data[3].value}></Detail>
</div>
{/if}
