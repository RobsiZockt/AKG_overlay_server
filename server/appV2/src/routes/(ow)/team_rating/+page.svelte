<script>
  

// @ts-nocheck

import ListComponent from "$lib/assets/rating_overview/ListComponent.svelte";
  import TeamDetails from "$lib/assets/rating_overview/TeamDetails.svelte";
  import TekButton from "$lib/assets/rating_overview/TekButton.svelte";
  import TutorialOverlay from "$lib/assets/rating_overview/TutorialOverlay.svelte";
  import BoxText from "$lib/assets/wrapper/BoxText.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

let sec_season = $state("wise_26");
let data = $state()
let formatedData = $state();
let openIndex = $state(-1);
let openOverlay = $state(true);
let leastGames = $state(Infinity);

    async function getData() {
    try {
      const res = await fetch(`/api/pred/power_rating/${sec_season}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const nr_data = await res.json();

      data = nr_data.map((entry, index) => ({...entry,rank: index + 1}));

      data.forEach(dat => {
        if(Number(dat.games)<leastGames) leastGames = Number(dat.games);
      });
    } catch (err) {
      console.warn(err);
    }
  }

function formatObjects(objects) {
    const keys = Object.keys(objects[0]);

    const maxLengths = Object.fromEntries(
        keys.map(key => [
            key,
            Math.max(...objects.map(obj => String(obj[key]).length))
        ])
    );

    return objects.map(obj => {
        const formatted = {};

        for (const key of keys) {
            const value = String(obj[key]);

            formatted[key] = value.padEnd(maxLengths[key], " ");
        }

        return formatted;
    });
}

  let updateData = async (newData) => {
    sec_season =newData;
    openIndex = null;
      await getData();
    data = [{name:"Team",rating:"Rating",rd:"RD",games:"Games",id:"0",rank:"Rank"},...data]
    formatedData = formatObjects(data);
  }

  function showOverlay(){
    openOverlay=true;
  }

  onMount(async()=>{ await getData();
    data = [{name:"Team",rating:"Rating",rd:"RD",games:"Games",id:"0",rank:"Rank"},...data];
    formatedData = formatObjects(data);
  })
</script>

<svelte:head>
  <title>OW Uniliga Rating - by RZ</title>
</svelte:head>

<TutorialOverlay bind:open={openOverlay}/>

<div class="w-full h-[100vh] bg-[#1e1e1e] overflow-hidden">
<div class="h-[40px] w-full flex items-center justify-end">
    <div class="w-auto h-full flex" onclick={()=>{goto('/team_prediction')}}>
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> Prediction System</span>
    </div>  
    <div class="w-auto h-full flex" onclick={()=>{showOverlay()}}>
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> How it Works</span>
    </div>
    
  </div>
  <div class="w-full h-full flex-col items-center justify-center">
    <div class="w-full h-auto flex flex-col items-center justify-center pb-12 mt-4 gap-3">
        <div class="flex items-end gap-3">
          <span class="font-mono text-white text-7xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre p-2">
            Funny Team Power Rating
          </span>
          <span class="font-mono text-gray-400 text-sm border border-gray-600 rounded px-2 py-0.5 mb-5">
            v0.3
          </span>
        </div>
        {#if leastGames <10}
          <div class="flex items-center gap-2 font-mono text-sm text-red-300 bg-red-400/10 border border-red-400/40 rounded px-3 py-1">
            <span class="font-bold tracking-widest">WARNING</span>
            <span class="text-red-200/70">– Rating is VERY inacurate for Teams with less than 10 Games</span>
          </div> 
        {/if}     
        <div class="flex items-center gap-2 font-mono text-sm text-red-300 bg-red-400/10 border border-red-400/40 rounded px-3 py-1">
          <span class="font-bold tracking-widest">WARNING</span>
          <span class="text-red-200/70">– Rating will be better after Day 3 is completed</span>
        </div>
      </div>
    <div>
      <TekButton current_tab={updateData}></TekButton>
    </div>
    <div class="w-full h-full items-start justify-center flex pt-4">
    <div class="h-[790px] w-[1330px] overflow-y-auto flex-col items-center justify-center">
    {#each formatedData as split_data,index}
        <div class="w-full h-[40px]" onclick={()=> {openIndex=(openIndex === index?null:index)}}>
        <ListComponent index={index} data={split_data}></ListComponent> 
        </div>
        {#if openIndex === index }
        <TeamDetails teamid={split_data.id} season={sec_season}/>
        {/if}
    {/each}
    </div>
    </div>
  </div>
</div>