<script>
    import { playedMaps } from "$lib/stores/playedMapsUpdate";
		import { matchupData } from '$lib/stores/matchupData';
    import Button from "../Button.svelte";
  import Score from "../map_display/Score.svelte";

	let curr_map = 2;

		 $: entries = Object.entries($playedMaps ?? {})
    .map(([key, value]) => ({
      id: Number(key),
      ...value
    }))
    .sort((a, b) => a.id - b.id);

	$:	console.log(entries);
	$:	console.log(typeof(entries?.[1]?.score_blue));
</script>

{#if entries?.length == 0}
  <p>Loading…</p>
{:else if entries?.length != 0}
<div class="flex">
	<div>
		<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/blue/add`} method={"POST"}/>
		<span>{$matchupData.blue_short}</span>
		<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/blue/sub`} method={"POST"}/>
	</div>
	<div>
	<Score blue_score={entries?.[curr_map-1]?.score_blue} red_score={entries?.[curr_map-1]?.score_red}/>
	</div>
		<div>
		<Button text={"+"} apiPath={`/api/api/played_maps/${curr_map}/red/add`} method={"POST"}/>
		<span>{$matchupData.blue_short}</span>
		<Button text={"-"} apiPath={`/api/api/played_maps/${curr_map}/red/sub`} method={"POST"}/>
	</div>
</div>
{/if}