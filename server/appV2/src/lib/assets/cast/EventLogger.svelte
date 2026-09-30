<script>
let container = $state();
let items = $state([]);
let ini = false;
let lastobj = null;
import {EventLogger} from "$lib/stores/eventLogger"
  import { untrack } from "svelte";
  import Event from "./Event.svelte";

$effect(()=>{
    const v = $EventLogger;
    if(!v) return;
    
    if(Array.isArray(v)){
        if(v.length == 0) return;
        if(!ini){
            items = [...v];
            ini = true;
            console.log(v);
        }
        return;
    }
        if(v === lastobj)
            return;
        
        untrack(()=>{
            lastobj = v;
            items.push(v);
        })
          
    console.log(items);

})
$effect(()=>{
    items.length;
    if(container){
        container.scrollTop = container.scrollHeight;
    }
})

</script>

<div bind:this={container} class="w-full h-full object-contain overflow-y-auto">
    {#if items.length != 0}
        {#each items as event}
            <Event type={event.event} data={event.data}></Event>
            <div class="w-full h-[5px]"></div>
        {/each}
    {/if}
</div>
