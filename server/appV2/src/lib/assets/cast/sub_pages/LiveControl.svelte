<script>

  import ImgPicker from "$lib/assets/cast/ImgPicker.svelte";
  import { onMount } from "svelte";
  import { maps } from "$lib/stores/maps";
  import { heros } from "$lib/stores/heros";
  import { playedMaps } from '$lib/stores/playedMapsUpdate';
  import { matchupData } from "$lib/stores/matchupData";

  let blue_team, blue_name, red_team , red_name;

 $: if ($matchupData.switched == 0){
    blue_name = $matchupData.blue;
    blue_team = "1";
    red_name = $matchupData.red;
    red_team = "2";
  } else if ($matchupData.switched == 1){
    blue_name = $matchupData.red;
    blue_team = "2";
    red_name = $matchupData.blue;
    red_team = "1";
  }


$: entries = Object.entries($playedMaps ?? {})
    .map(([key, value]) => ({
      id: Number(key),
      ...value
    }))
    .sort((a, b) => a.id - b.id);

$: latest = entries.at(-1);


  onMount(()=>{maps.load(); heros.load();});



</script>


{#if $maps.length == 0}
  <p>Loading…</p>
{:else if $maps.length != 0}
<div class="h-full w-[25%] overflow-y-auto">
 <ImgPicker items={$maps} selectedItem={latest} target={"map"} mode={"mappick"}/>
</div>
 {/if}

 <div class="w-[50%] h-[90%] ">

  <div class="w-full h-[20%] bg-green-200"></div>
  <div class="flex w-full h-[80%]">
    <div class="w-[50%] bg-blue-200">
        <ImgPicker items={$heros} selectedItem={latest} target={"ban"} mode={"ban"} team={blue_team} title={blue_name}/>
    </div>
    <div class="w-[50%] bg-red-700">
       <ImgPicker items={$heros} selectedItem={latest} target={"ban"} mode={"ban"} team={red_team} title={red_name}/>
    </div>
  </div>
</div>
<div class="w-[25%] h-[90%] bg-red-600"></div>