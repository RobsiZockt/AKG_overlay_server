<script>
    import { playedMaps } from "$lib/stores/playedMapsUpdate";
		import { matchupData } from '$lib/stores/matchupData';
    import Button from "../Button.svelte";
  	import Score from "../map_display/Score.svelte";
		import arrow_right from "../img/arrow_right.svg";
		import arrow_left from "../img/arrow_left.svg";
		import switch_arrow from "../img/switch_arrow.svg";

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

	async function handleClick(tag) {
		if(tag=="positiv") curr_map++;
		if(tag=="negativ") curr_map>1? curr_map-- : curr_map=1;
		if(tag=="new") {
			 try {
      	const res = await fetch("/api/api/played_maps/new", {
        	method: "POST",
        	headers: {
          	"Content-Type": "application/json"
        	}
      	});
      	const data = await res.json();
    	} catch (err) {
      	console.error("Request failed:", err);
  		}
		}
		if(tag=="swap"){
			 try {
    const res = await fetch(`/api/api/matchup?op=swap`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
      	const data = await res.json();
    	} catch (err) {
      	console.error("Request failed:", err);
  		}
		}
		selected_map(curr_map-1);
		console.log(curr_map);

	}
</script>

{#if entries?.length == 0}
  <p>Loading…</p>
{:else if entries?.length != 0}
<div class="flex w-full h-full">
	<div class="flex flex-col w-[33%] items-start justify-end h-full">
		<button onclick={()=>handleClick("negativ")} title="MINUS" class={`px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 active:scale-95 transition`}>
			<img src={arrow_left} alt="" class="w-[70px] object-square"/>
		</button>
  		<span class="font-[Rajdhani] whitespace-nowrap overflow-hidden block w-full text-7xl text-transparent [-webkit-text-stroke:2px_white] ">
    		0{entries?.[curr_map-2]?.id} {entries?.[curr_map-2]?.name}
		</span>
	</div>
	<div class="flex items-center justify-center w-[33%] h-full">
		<div class="flex flex-col h-full">
			<div class="justify-center items-center">
				<span class="font-[Rajdhani] block w-full text-center text-white text-2xl">0{entries?.[curr_map-1]?.id} {entries?.[curr_map-1]?.name}</span>
			</div>
			<div class="flex h-[95%] items-center">	
				<div class="flex flex-col">
					<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/blue/add`} method={"POST"}/>
					<span class="mx-2 font-[teko] text-5xl text-white items-center justify-center">{$matchupData.blue_short}</span>
					<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/blue/sub`} method={"POST"}/>
				</div>
				<div class="relative flex flex-col pr-2 h-full justify-end items-center"> 
  				<div class="z-0 pb-9">
    				<Score mode={""} blue_score={entries?.[curr_map-1]?.score_blue} red_score={entries?.[curr_map-1]?.score_red}/>
  				</div>
  				<div class="absolute flex justify-end z-20">
    				<button onclick={()=>handleClick("swap")} title="swap" class="rounded-lg hover:opacity-90 active:scale-95 transition">
      				<img src={switch_arrow} alt="" class="w-[50px] aspect-square"/>
    				</button>
  				</div>
				</div>
				<div class="flex flex-col">
					<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/red/add`} method={"POST"}/>
					<span class="mx-2 font-[teko] text-5xl text-white items-center justify-center">{$matchupData.red_short}</span>
					<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/red/sub`} method={"POST"}/>
				</div>
			</div>
		</div>
	</div>
<div class="flex flex-col w-[33%] items-end justify-end h-full min-w-0 object-contain">
	{#if curr_map != latest}
		<button onclick={()=>handleClick("positiv")} title="Plus" class={`px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 active:scale-95 transition`}>
			<img src={arrow_right} alt="" class="w-[70px] object-square"/>
		</button>
  		<span class="font-[Rajdhani] whitespace-nowrap overflow-hidden block w-full text-7xl text-transparent [-webkit-text-stroke:2px_white] ">
    		0{entries?.[curr_map]?.id} {entries?.[curr_map]?.name}
		</span>
	{:else}	
		<button onclick={()=>handleClick("new")} title="New Map" class={`px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 active:scale-95 transition`}>
			<img src={arrow_right} alt="" class="w-[70px] object-square"/>
		</button>
  		<span class="font-[Rajdhani] truncate text-7xl text-transparent [-webkit-text-stroke:2px_white] ">
    		NEXT MAP
		</span>
	{/if}
</div>
</div>
{/if}