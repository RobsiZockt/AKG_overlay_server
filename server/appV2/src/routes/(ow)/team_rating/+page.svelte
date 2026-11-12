<script>
  

// @ts-nocheck

import ListComponent from "$lib/assets/rating_overview/ListComponent.svelte";
  import TeamDetails from "$lib/assets/rating_overview/TeamDetails.svelte";
  import TekButton from "$lib/assets/rating_overview/TekButton.svelte";
  import TutorialOverlay from "$lib/assets/rating_overview/TutorialOverlay.svelte";
  import BoxText from "$lib/assets/wrapper/BoxText.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import PrefireRedirect from "$lib/assets/rating_overview/Prefire_redirect.svelte";
  import Notification from "$lib/assets/Pred/Notification.svelte";

let sec_season = $state("wise_26");
let data = $state()
let formatedData = $state();
let openIndex = $state(-1);
let openOverlay = $state(true);
let openRedirect = $state(false);
let leastGames = $state(Infinity);

const now = new Date();
const showRD = now.getDay() === 0 && now.getHours() >= 18 && now.getHours() < 23;
if(showRD) openRedirect = true;

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

<PrefireRedirect bind:open={openRedirect} url="https://ow.robsizockt.de/team_rating/prefire"/>

<TutorialOverlay bind:open={openOverlay}/>

<div class="w-full bg-[#1e1e1e] overflow-x-hidden overflow-y-auto">

  <div class=" w-full h-dvh flex flex-col">
    <!-- Top nav -->
    <div class="h-10 w-full shrink-0 flex items-center justify-end">
      <div class="w-auto h-full flex" onclick={() => { goto('/team_prediction') }}>
        <span class="text-gray-300 text-lg 2xl:text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-['Cascadia_Mono'] font-mono p-2"> Prediction System</span>
      </div>
      <div class="w-auto h-full flex" onclick={() => { showOverlay() }}>
        <span class="text-gray-300 text-lg 2xl:text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-['Cascadia_Mono'] font-mono p-2"> How it Works</span>
      </div>
    </div>

    <!-- Main content: fills the remaining height -->
    <div class="w-full flex-1 min-h-0 flex flex-col items-center">
      <!-- Header -->
      <div class="w-full shrink-0 flex flex-col items-center justify-center pb-4 2xl:pb-12 mt-2 2xl:mt-4 gap-2 2xl:gap-3 px-4">
        <div class="flex items-end gap-3">
          <span class="font-mono text-white text-4xl xl:text-5xl 2xl:text-7xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] p-2 text-center">
            Funny Team Power Rating
          </span>
          <span class="font-mono text-gray-400 text-sm border border-gray-600 rounded px-2 py-0.5 mb-3 2xl:mb-5">
            v0.4
          </span>
        </div>
        {#if leastGames < 10}
        <Notification type="warning" color="yellow" text="Upcoming Rating recalculation, check patchnotes for more information"/>
        {/if}
      </div>

      <div class="shrink-0">
        <TekButton current_tab={updateData}></TekButton>
      </div>

      <!-- List: takes the remaining height, scrolls internally -->
      <div class="w-full flex-1 min-h-[300px] flex justify-center pt-4 px-4 pb-4">
        <div class="w-full max-w-[1330px] h-full overflow-y-auto">
          {#each formatedData as split_data, index}
            <div class="w-full h-10" onclick={() => { openIndex = (openIndex === index ? null : index) }}>
              <ListComponent index={index} data={split_data}></ListComponent>
            </div>
            {#if openIndex === index}
              <TeamDetails teamid={split_data.id} season={sec_season} />
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
  <footer class="w-full border-t border-gray-700 py-6 px-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
    <a href="/patchnotes" class="font-mono text-gray-400 hover:text-gray-200 text-sm underline">Patchnotes</a>
    <a href="/team_rating/prefire" class="font-mono text-gray-400 hover:text-gray-200 text-sm underline">Prefire</a>
  </footer>
</div>