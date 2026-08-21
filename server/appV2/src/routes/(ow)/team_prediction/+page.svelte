
<!-- <style>
  .iframe-container {
    height: 100vh; /* or any parent height */
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
<div class="iframe-container">
<iframe 
  src="https://www.youtube.com/embed/ODKTITUPusM?autoplay=1&mute=0&controls=0&rel=0&iv_load_policy=3" 
  title="YouTube video player" 
  style="border: none; pointer-events: none;" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
  allowfullscreen>
</iframe>
</div> -->

<script>
  import ManualPrediction from "$lib/assets/rating_overview/manual_prediction.svelte";
  import DropdownMenu from "$lib/assets/DropdownMenu.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let maps = $state();
  let teams = $state();

  let selec_t1= $state(0);
  let selec_t2= $state(0);
  let selec_map= $state(0);

  async function getLists() {
    try {
      const res1 = await fetch(`/api/pred/maplist`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const res2 = await fetch(`/api/pred/teamlist`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      let dat1 = await res1.json();
      let aDat1 = [];
      dat1.forEach(dat => {
        if(Object.values(dat)[0]!=null)
        aDat1.push(Object.values(dat)[0]);
        if(Object.values(dat)[0]==null)
        aDat1.push("Overall");
      });
      maps = aDat1;
      let dat2 = await res2.json();
      let aDat2 = [];
      dat2.forEach(dat =>{
        aDat2.push(Object.values(dat)[0]);
      });
      teams=aDat2;
    } catch (err) {
      console.warn(err);
    }
  }


onMount(()=>{getLists();});

// $effect(()=>{
//   if(selec_map==0||selec_t1==0||selec_t2==0)
//     return;
//   console.log(maps[selec_map-1],teams[selec_t1-1],teams[selec_t2-1]);
// })


</script>


<svelte:head>
  <title>OW Uniliga Prediction - by RZ</title>
</svelte:head>

<div class="w-full h-[100vh] bg-[#1e1e1e] overflow-hidden">
  <div class="h-[40px] w-full flex items-center justify-end">
    <div class="w-auto h-full flex" onclick={()=>{goto('/team_rating')}}>
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> Team Rating</span>
    </div>  
    <div class="w-auto h-full flex" onclick={()=>{showOverlay()}}>
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> How it Works</span>
    </div>
  </div>
  <div class="w-full h-full flex-col items-center justify-center">
    <div class="w-full h-auto flex items-center justify-center pb-12 bt-4">
      <span class="font-[Cascadia Mono] text-white text-7xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> Funny Prediction System V0.0</span>
    </div>
    {#if maps!= undefined && teams != undefined}
    <div class="w-full h-auto items-center justify-center flex">
      <span class="font-[teko] w-[200px] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">Team 1:</span>
      <div class="h-full w-[20px]"></div>
      <span class="font-[teko] w-[200px] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">Map</span>
      <div class="h-full w-[20px]"></div>
      <span class="font-[teko] w-[200px] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">Team: 2</span>
    </div>
        <div class="w-full h-auto items-center justify-center flex">
      <DropdownMenu list={teams} nulltext={"Team 1"} bind:value={selec_t1} mode={"alt"} width={200}></DropdownMenu>
      <div class="h-full w-[20px]"></div>
      <DropdownMenu list={maps} nulltext={"Map auswahl"} bind:value={selec_map} mode={"alt"} width={200}></DropdownMenu>
      <div class="h-full w-[20px]"></div>
      <DropdownMenu list={teams} nulltext={"Team 2"} bind:value={selec_t2} mode={"alt"} width={200}></DropdownMenu>
    </div>

    <div class="p-6 flex w-full h-full items-start justify-center">
    <div class="w-[800px] h-[500px]">
      <ManualPrediction team1={teams[selec_t1-1]} team2={teams[selec_t2-1]} select_map={maps[selec_map-1]}></ManualPrediction>
    </div>
    </div>
    {/if}
  </div>
</div>