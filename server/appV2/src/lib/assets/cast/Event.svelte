<script>
  import { updated } from "$app/state";
  import { onMount } from "svelte";


    let {type, data} = $props();
    let timestamp = $state();
    let event_text="";
    let img_path="";
    let text_element = $state();
    let img_h=$state(0);
    let img_w=$state(0);
    let aspect_ratio=$state(1);

    let system_events = ["SET_MAP_SCORE","SWAP_SIDE","LOAD_TEAM"];
    let events = ["MAP_PICK","HERO_BAN","MAP_WON","MAP_DRAWN"];


        switch (type){
            case "MAP_PICK":
                event_text = `${data.team} picked ${data.map}`;
                img_path = data.img_path;
                break;
            case "HERO_BAN":
                event_text = `${data.team} banned ${data.hero}`;
                img_path = data.img_path;
                break;
            case "MAP_WON":
                event_text = `${data.team} Won`;
                break;
            case "MAP_DRAWN":
                event_text = "Map draw, skipping calculation";
                break;
            default:
                event_text = "UNKNOWN EVENT_TYPE HAPPEND";
                break;
        }

    onMount(()=>{



            if(!text_element) return;

            const img = new Image();
            img.onload = () =>{
                aspect_ratio = img.naturalWidth/img.naturalHeight;
                updateImageSize();
            }
            img.src = img_path;
            const obs = new ResizeObserver(()=>{
                updateImageSize();
            })
            if(text_element){
                obs.observe(text_element);
            }


        return ()=> obs.disconnect();
    })

        function updateImageSize(){
            if (!text_element || !aspect_ratio) return;

            const txt_h = text_element.getBoundingClientRect().height;
            const parentWidth = text_element.parentElement.getBoundingClientRect().width;

            const max_w = parentWidth *0.4;
            const max_h = txt_h;

            img_h = Math.min(max_h, max_w/aspect_ratio);
            img_w = img_h*aspect_ratio;
        }

</script>

{#if system_events.includes(type)}
    <div class=" bg-gray-300 rounded-lg w-full h-fit p-2">
        {#if type == "SET_MAP_SCORE"}
            <span class="text-xl p-1 text-center text-white">Set {data.team} Team Score to {data.score}</span>
        {:else if type == "SWAP_SIDE"}
            <span class="text-xl p-1 text-center text-white">Swaped Team Sides</span>
        {:else if type == "LOAD_TEAM"}
            <span class="text-xl p-1 text-center text-white">Loaded {data.team} on to Slot {data.slot}</span>
        {:else}
            <span class="text-xl p-1 text-center text-white">{type} | {data}</span>
        {/if}
    </div>
{:else if events.includes(type)}
<div class="bg-blue-700 rounded-lg w-full  flex items-center gap-2 overflow-hidden">
    <span bind:this={text_element} class="text-xl p-1 text-center px-2 py-6 text-white flex-1 min-w-0">{event_text}</span>

    {#if img_path != ""}
        <div
            class="shrink-0 rounded-lg overflow-hidden bg-center bg-cover bg-no-repeat"
            style="width: {img_w}px;height: {img_h}px;background-image: url('{img_path}');"
        ></div>
    {/if}
</div>
{:else}
<div>

</div>
{/if}

