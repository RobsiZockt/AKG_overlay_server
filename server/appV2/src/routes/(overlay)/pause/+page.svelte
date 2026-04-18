<script>
    import Footer from "$lib/assets/Footer.svelte";
  import VSHeader from "$lib/assets/VSHeader.svelte";
  import { matchupData } from "$lib/stores/matchupData";
  import { stream_config_static } from "$lib/stores/stream_config";
  import { streamConfData } from "$lib/stores/streamConfData";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  let refresh = $state(false);
   let s = page.url.searchParams.get("s");
 let ico = page.url.searchParams.get("ico");
 onMount(()=>{stream_config_static.load();
        document.addEventListener("visibilitychange",()=>{
            if(document.hidden) refresh=true;
          if(!document.hidden) 
          {
            stream_config_static.refresh();
            refresh=false;
          }
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
        <Footer cd_mode={"pause"} cd_text={"PAUSE"} sponsor={s=="false"?false:true} ico={ico!=null?ico:""} time={refresh==false?$stream_config_static.pausetime!=null?$stream_config_static.pausetime:"1":"1"} override={$streamConfData.override_top!=""?$streamConfData.override_top:""} scrolltext={$streamConfData.inf_txt!=null?$streamConfData.inf_txt:""}></Footer>
    </div>
</div>

