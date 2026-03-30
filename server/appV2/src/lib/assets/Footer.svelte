<script>
  import Countdown from "$lib/assets/Countdown.svelte";
  import InfiniteScrollText from "$lib/assets/InfiniteScrollText.svelte";
import akg_logo from "$lib/assets/logos/akgaming_logo.png"
import soloplan from "$lib/assets/logos/soloplan-square.svg"
import uniliga from "$lib/assets/logos/Uniliga-TeilnehmerLogo-weiss.png"
import { rot_text } from "$lib/stores/rottext";
  import { onDestroy, onMount } from "svelte";

  let {cd_mode ="", cd_text="", scrolltext=[]}=$props();

  let toptext=$state("BUILDING DELAY");
let end = $state(false);
let textconf = $state("w-[1700px] flex flex-col");
let rot_text_cache = $derived($rot_text);

onMount(()=>rot_text.load());

if(cd_mode=="end"){
end = true;
toptext="STREAM ENDE";
textconf="w-[2010px] flex flex-col";
}

function rmdtxt(){

    const n = Math.floor(Math.random()*(rot_text_cache.length - 1))+1;
    toptext = rot_text_cache[n].toUpperCase();
    rot_text_cache.splice(n,1);
    if(rot_text_cache.length < 5) rot_text_cache=$rot_text;
}

const rotate = setInterval(rmdtxt,13000);
if(end==true) clearInterval(rotate);
onDestroy(()=>clearInterval(rotate));

</script>


<div class="flex w-full h-[177px] bg-[#222222] p-2">
<div class="flex border-2  w-full h-full">
    <img class="pr-1 pl-1" src={akg_logo} alt=""/>
    <div class="w-[4px] h-full bg-black"></div>
    {#if !end}
    <div class="flex flex-col h-full w-[310px] items-center justify-center">
    <span class="text-white text-2xl font-thin pb-1 pr-2">{cd_text.toUpperCase()}</span>
<Countdown mode={cd_mode}></Countdown>
    </div>
    <div class="w-[4px] h-full bg-black"></div>
    {/if}
    <div class={textconf}>
        <span class="text-white text-7xl text-nowrap font-bold pb-1 pr-2">{toptext}</span>
        <div class="w-full h-[2px] bg-black"></div>
        <InfiniteScrollText content={scrolltext} speed={60}></InfiniteScrollText>
    </div>
    <div class="w-[4px] h-full bg-black"></div>
    <img class="pl-1" src={soloplan} alt=""/>
    <img class="p-[15px]" src={uniliga} alt=""/>
</div>
</div>
