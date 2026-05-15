<script>
    import Footer from "$lib/assets/Footer.svelte";
      import { stream_config_static } from "$lib/stores/stream_config";
      import { streamConfData } from "$lib/stores/streamConfData";
  import { onMount } from "svelte";
  import { page } from "$app/state";
onMount(()=>stream_config_static.load);
 let s = page.url.searchParams.get("s");
 let ico = page.url.searchParams.get("ico");
 let liga= page.url.searchParams.get("liga");
</script>

<div class="flex w-full h-[100vh] items-end">
<Footer cd_mode={"starting"} cd_text={"STARTING IN"} sponsor={s=="false"?false:true} ico={ico!=null?ico:""} liga={liga=="false"?false:true} time={$stream_config_static.starttime!=null?$stream_config_static.starttime:""} override={$streamConfData.override_top!=""?$streamConfData.override_top:""} scrolltext={$streamConfData.inf_txt!=null?$streamConfData.inf_txt:""}></Footer>
</div> 