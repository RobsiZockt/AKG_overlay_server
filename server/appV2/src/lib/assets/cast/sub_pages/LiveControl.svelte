<script>

    import ImgPicker from "$lib/assets/cast/ImgPicker.svelte";

      import { onMount } from "svelte";
  import { maps } from "$lib/stores/maps";

  onMount(()=>{maps.load()});

  $: console.log($maps);

  
</script>


{#if $maps.length == 0}
  <p>Loading…</p>
{:else if $maps.length != 0}
 <ImgPicker items={$maps} selectedItem={}/>
 {/if}