<script>
import Scaled from "$lib/assets/wrapper/Scaled.svelte";
import PredDisplay from "$lib/assets/Pred/pred_display.svelte";
  import { onMount } from "svelte";

let predictData;
let entries=[];
async function get_week_Pred() {
    try {
      const res = await fetch(`/api/next_week`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      predictData = await res.json();
      entries = predictData[0].results;
    } catch (err) {
      console.warn(err);
    }
  }

  onMount(()=>{get_week_Pred();  
  })


</script>

<svelte:head>
  <title>OW Uniliga Prediction - Next Week Overview</title>
</svelte:head>

<div class="w-full h-dvh bg-[#1e1e1e] flex flex-col overflow-x-hidden overflow-y-auto">

<div class="mb-16 px-20">
  <div class="h-[40px] w-full flex items-center justify-end">
    <a class="w-auto h-full flex" href="/team_rating" >
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> Team Rating</span>
    </a>
    <a class="w-auto h-full flex" href='/team_prediction'>
      <span class="text-gray-300 text-lg 2xl:text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-['Cascadia_Mono'] font-mono p-2"> Prediction System</span>
    </a> 
  </div>
<div>
  <div class="w-full flex items-center justify-center">
    <span class="font-[Cascadia Mono] text-white text-7xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2">Next Week Prediction</span>
    <span class="font-mono text-gray-400 text-sm border border-gray-600 rounded px-2 py-0.5 mb-3 2xl:mb-5">
      v0.0.tt
    </span>
  </div>  

  <!---->
</div>
<div class="bg-[#1e1e1e] flex flex-col items-center justify-center">
  {#each predictData as stage}
  <div class="w-full py-6">
      <span class="font-[Cascadia Mono] text-white text-3xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2 underline">{stage.stage}</span>
  </div>
      {#if stage.results.length!=0}
      <div class="grid w-full grid-cols-3 gap-4">
          {#each stage.results as entry }
              <Scaled>
              <!-- your existing content, unchanged -->
              <div class="h-[500px] w-[800px]">
                  <PredDisplay predData={entry}/>
              </div>
              </Scaled>
          {/each}
      </div>
      {/if}
  {/each}
  </div>
    <footer class="w-full border-t border-gray-700 py-6 px-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
    <a href="/patchnotes" class="font-mono text-gray-400 hover:text-gray-200 text-sm underline">Patchnotes</a>
    <a href="/team_rating/prefire" class="font-mono text-gray-400 hover:text-gray-200 text-sm underline">Prefire</a>
  </footer>
</div>
</div>