<script>
    import { playedMaps } from "$lib/stores/playedMapsUpdate";
		import { matchupData } from '$lib/stores/matchupData';
    import Button from "../Button.svelte";
  	import Score from "../map_display/Score.svelte";
		import arrow_right from "../img/arrow_right.svg";
		import arrow_left from "../img/arrow_left.svg";

let latest = $state(1);
let curr_map = $state(1);
let {selected_map} =$props();

let maps = $derived($playedMaps);

let entries = $derived(
  Object.entries(maps ?? {})
    .map(([key, value]) => ({
      id: Number(key),
      ...value
    }))
    .sort((a, b) => a.id - b.id)
);

$effect(() => {
  if (latest !== entries?.length) {
		 console.log("effect run", entries.length);
    latest = entries?.length;
    curr_map = entries?.length;
  }
});

	async function handleClick(direction) {
		if(direction=="positiv") curr_map++;
		if(direction=="negativ") curr_map>1? curr_map-- : curr_map=1;
		selected_map(curr_map-1);
		console.log(curr_map);

	}
</script>

{#if entries?.length == 0}
  <p>Loading…</p>
{:else if entries?.length != 0}
<div class="flex w-full h-full">
	<div class="flex flex-col items-start justify-center h-full w-fit">
	<button onclick={()=>handleClick("negativ")} title="MINUS" class={`px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 active:scale-95 transition`}>
		<img src={arrow_left} alt="" class="w-[70px] object-square"/>
	</button>
  <span class="font-[Rajdhani] text-7xl text-transparent [-webkit-text-stroke:2px_white] ">
    0{entries?.[curr_map-2]?.id} {entries?.[curr_map-2]?.name}
	</span>
</div>
<div class="flex items-center justify-center w-fit h-full">
	<div class="flex flex-col">
		<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/blue/add`} method={"POST"}/>
		<span class="ml-2 font-[teko] text-3xl text-white items-center justify-center">{$matchupData.blue_short}</span>
		<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/blue/sub`} method={"POST"}/>
	</div>
	<div>
	<Score mode={""} blue_score={entries?.[curr_map-1]?.score_blue} red_score={entries?.[curr_map-1]?.score_red}/>
	</div>
		<div class="flex flex-col">
		<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/red/add`} method={"POST"}/>
		<span class="ml-2 font-[teko] text-3xl text-white items-center justify-center">{$matchupData.red_short}</span>
		<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/red/sub`} method={"POST"}/>
	</div>
	{#if curr_map != latest}
	<button onclick={()=>handleClick("positiv")} title="PLUS"  class={`px-4 py-2 text-white font-medium rounded-lg shadow hover:opacity-90 active:scale-95 transition`}>
		<img src={arrow_right} alt="" class="w-[70px] object-square"/>
	</button>
	{:else}
	<Button text={"NEXT_Ph"} apiPath={`/api/api/played_maps/new`} method={"POST"}></Button>
	{/if}
</div>
</div>
{/if}