<script>

    import ImgPicker from "$lib/assets/cast/ImgPicker.svelte";
      import { onMount } from "svelte";
  import { maps } from "$lib/stores/maps";
   import { playedMaps } from '$lib/stores/playedMapsUpdate';


$: entries = Object.entries($playedMaps ?? {})
    .map(([key, value]) => ({
      id: Number(key),
      ...value
    }))
    .sort((a, b) => a.id - b.id);

$: latest = entries.at(-1);


  onMount(()=>{maps.load()});


</script>


{#if $maps.length == 0}
  <p>Loading…</p>
{:else if $maps.length != 0}
<div class="h-full w-[25%] overflow-y-auto">
 <ImgPicker items={$maps} selectedItem={latest} target="map"/>
</div>
 {/if}

 <div class="w-[50%] h-[90%] ">

  <div class="w-full h-[20%] bg-blue-200"></div>
  <div class="flex w-full h-[80%]">
    <div class="w-[50%] bg-green-200"></div>
    <div class="w-[50%] bg-green-700"></div>
  </div>
</div>
<div class="w-[25%] h-[90%] bg-red-600"></div>