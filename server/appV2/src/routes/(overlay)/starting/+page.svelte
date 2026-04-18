<script>
    import Footer from "$lib/assets/Footer.svelte";
    import { stream_config_static } from "$lib/stores/stream_config";
    import { streamConfData } from "$lib/stores/streamConfData";
  import { onMount } from "svelte";
  import { page } from "$app/state";
     let s = page.url.searchParams.get("s");
 let ico = page.url.searchParams.get("ico");
    onMount(()=>{stream_config_static.load();
        document.addEventListener("visibilitychange",()=>{
          if(!document.hidden) stream_config_static.refresh();
        })
      });
</script>
<div class="flex w-full h-[100vh] items-end">
<Footer cd_mode={"starting"} cd_text={"STARTING IN"} sponsor={s=="false"?false:true} ico={ico!=null?ico:""} override={$streamConfData.override_top!=""?$streamConfData.override_top:""} scrolltext={$streamConfData.inf_txt!=null?$streamConfData.inf_txt:""}></Footer>
</div>