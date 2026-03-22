<script>
  import Countdown from "$lib/assets/Countdown.svelte";
  import InfiniteScrollText from "$lib/assets/InfiniteScrollText.svelte";
import akg_logo from "$lib/assets/logos/akgaming_logo.png"
import soloplan from "$lib/assets/logos/soloplan-square.svg"
import uniliga from "$lib/assets/logos/Uniliga-TeilnehmerLogo-weiss.png"
import { rot_text } from "$lib/stores/rottext";
  import { onDestroy, onMount } from "svelte";

  let {cd_mode ="", cd_text=""}=$props();

  let toptext=$state("BUILDING DELAY");

onMount(()=>rot_text.load());



function rmdtxt(){

    const n = Math.floor(Math.random()*($rot_text.length - 1))+1;
    toptext = $rot_text[n].toUpperCase();
    console.log(toptext);
}

const rotate = setInterval(rmdtxt,7000);
onDestroy(()=>clearInterval(rotate));

</script>

<div class="flex w-full h-[100vh] items-end">
<div class="flex w-full h-[177px] bg-[#222222] p-2">
<div class="flex border-2  w-full h-full">
    <img class="pr-1" src={akg_logo} alt=""/>
    <div class="w-[4px] h-full bg-black"></div>
    <div class="flex flex-col h-full w-[310px] items-center justify-center">
    <span class="text-white text-2xl font-thin pb-1 pr-2">{cd_text.toUpperCase()}</span>
<Countdown mode={cd_mode}></Countdown>
    </div>
    <div class="w-[4px] h-full bg-black"></div>
    <div class="w-[1700px] flex flex-col">
        <span class="text-white text-7xl font-bold pb-1 pr-2">{toptext}</span>
        <div class="w-full h-[2px] bg-black"></div>
        <InfiniteScrollText content={["DATA1","DATA2","DATA 3 WITH SPACES","asdsdhfafgniajsdfghijosadfhaisdfhaiosdfjioasjdfafisdjafsdihu"]} speed={60}></InfiniteScrollText>
    </div>
    <div class="w-[4px] h-full bg-black"></div>
    <img class="pl-1" src={soloplan} alt=""/>
    <img class="p-[15px]" src={uniliga} alt=""/>
</div>
</div>
</div>