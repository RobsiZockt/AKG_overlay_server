<script>
    import Footer from "$lib/assets/Footer.svelte";
  import VSHeader from "$lib/assets/VSHeader.svelte";
  import { matchupData } from "$lib/stores/matchupData";
  import { stream_config_static } from "$lib/stores/stream_config";
  import { onMount } from "svelte";
 onMount(()=>{stream_config_static.load();
        document.addEventListener("visibilitychange",()=>{
          if(!document.hidden) stream_config_static.refresh();
        })
      });
</script>

<div class="flex flex-col w-full h-[100vh] items-center">
<div class="pt-[80px]">
{#if $matchupData.data!="0"}
    <VSHeader matchData={$matchupData}></VSHeader>
{/if}
</div>
    <div class="flex items-end h-full w-full">
        <Footer cd_mode={"pause"} cd_text={"PAUSE"} scrolltext={$stream_config_static.inf_txt!=null?$stream_config_static.inf_txt:""}></Footer>
    </div>
</div>

