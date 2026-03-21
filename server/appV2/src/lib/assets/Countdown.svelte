<script>
    import { stream_config } from "$lib/stores/stream_config";
    import { onMount } from "svelte";

    onMount(()=>stream_config.load());
    const target = $state(new Date());
    let finished = $state(false);
    let timer = $state([0,0,0]);

    $effect(()=>{
        if($stream_config.starttime==null) return;
        const time = $stream_config.starttime.split(":");
        target.setHours(parseInt(time[0]),parseInt(time[1]),0,0);
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
</script>

<div class="flex">
    {#if timer[0] !=0}
    <p>{timer[0]}</p>
    <p>:</p>
    {/if}

    {#if timer[1]<10}
    <p>0</p>
    {/if}
    <p>{timer[1]}</p>
    <p>:</p>
    {#if timer[2]<10}
    <p>0</p>
    {/if}
    <p>{timer[2]}</p>
</div>