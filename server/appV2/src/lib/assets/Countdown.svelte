<script>
    import { stream_config_static } from "$lib/stores/stream_config";
    import { onMount } from "svelte";

    let {mode=""} = $props();
    onMount(()=>stream_config_static.load());
    const target = $state(new Date());
    let finished = $state(false);
    let timer = $state([0,0,0]);


    $effect(()=>{
        if($stream_config_static.starttime==null) return;
        if(finished==true)return;
        if(mode=="starting"){
            const time = $stream_config_static.starttime.split(":");
            target.setHours(parseInt(time[0]),parseInt(time[1]),0,0);
        }
        else if(mode=="pause"){
            const time = $stream_config_static.pausetime;
            target.setMinutes(target.getMinutes() + parseInt(time));
        }
    })

    function update(){
        const now = new Date();
        const diff = target-now;

        if(diff<=0){
            finished=true;
            clearInterval(calc);
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timer = [hours,minutes,seconds];

    }
    const calc =setInterval(update,500);

    const classconf="text-white text-8xl";
</script>

<div class="flex">
    {#if timer[0] !=0}
    <span class={classconf}>{timer[0]}</span>
    <span class={classconf}>:</span>
    {/if}

    {#if timer[1]<10}
    <span class={classconf}>0</span>
    {/if}
    <span class={classconf}>{timer[1]}</span>
    <span class={classconf}>:</span>
    {#if timer[2]<10}
    <span class={classconf}>0</span>
    {/if}
    <span class={classconf}>{timer[2]}</span>
</div>