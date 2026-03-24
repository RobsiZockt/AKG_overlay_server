<script>
    import Footer from "$lib/assets/Footer.svelte";
  import VSHeader from "$lib/assets/VSHeader.svelte";
  import { stream_config } from "$lib/stores/stream_config";
  import { onMount } from "svelte";
 onMount(()=>{stream_config.load();
        document.addEventListener("visibilitychange",()=>{
          if(!document.hidden) stream_config.refresh();
        })
      });
</script>

<div class="flex flex-col w-full h-[100vh] items-center">
<div class="pt-[80px]">
    <VSHeader></VSHeader>
</div>
    <div class="flex items-end h-full w-full">
        <Footer cd_mode={"pause"} cd_text={"PAUSE"} scrolltext={$stream_config.inf_txt!=null?$stream_config.inf_txt:""}></Footer>
    </div>
</div>

