<script>
  import { resolve } from "$app/paths";
    import Prediction from "$lib/assets/Prediction.svelte";
    import { onMount } from "svelte";
    let trig=true;

onMount(()=>{
    document.addEventListener("visibilitychange",async()=>{
        if(!document.hidden){
            await new Promise(resolve => setTimeout(resolve,5000));
            trig=true;
        }
        else if (document.hidden){
            trig=false;
        };
    })
})
  
</script>



<div class="h-[350px] w-[500px] flex">
    <Prediction trigger={trig} mode={"prod"}></Prediction>
</div>