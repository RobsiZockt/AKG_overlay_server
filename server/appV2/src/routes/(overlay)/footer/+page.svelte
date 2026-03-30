<script>
    import Footer from "$lib/assets/Footer.svelte";
      import { stream_config_static } from "$lib/stores/stream_config";
  import { onMount } from "svelte";
onMount(()=>stream_config_static.load);

</script>

<div class="flex w-full h-[100vh] items-end">
<Footer cd_mode={"starting"} cd_text={"STARTING IN"} scrolltext={$stream_config_static.inf_txt!=null?$stream_config_static.inf_txt:""}></Footer>
</div> 