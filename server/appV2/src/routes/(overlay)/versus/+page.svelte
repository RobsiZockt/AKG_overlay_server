<script>
 import PlayerBar from "$lib/assets/PlayerBar.svelte";
 import PlayerBarMini from "$lib/assets/PlayerBarMini.svelte";
  import { playerData } from "$lib/stores/playersData";
  import { matchupData } from "$lib/stores/matchupData";

  let blue=[];
  let red=[];

  $: blue = $playerData?.blue ??[];
  $: red = $playerData?.red ??[];

  $: bluePlayers = blue.map(item => ({
    ...item,
    key: `${item.id}`
  }));

  $: redPlayers = red.map(item => ({
    ...item,
    key: `${item.id}`
  }));
</script>

<!--TEAMS RENDER-->
<div class="h-[100vh] w-full bg-gray-700/30">
<div class="h-[10%] flex w-full bg-gray-700/30 space-y-4 ">
  <div class="w-[43.5%] flex h-full items-center justify-end">
    <span class="font-arial text-white w-full text-[40px] pr-2 text-end">
      {$matchupData.blue}
    </span>
    <div class="h-full aspect-square bg-transparent flex items-center justify-center p-1">
      <img
        src="{$matchupData.blue_logo}"
        class="h-full aspect-square object-cover"
        alt=""
      />
    </div>
  </div>
  <div class="h-[full] w-[15%] space-y-4 flex items-center justify-center"></div>
  <div class="w-[43.5%] flex h-full items-center justify-end">
    <div class="h-full aspect-square bg-transparent flex items-center justify-center p-1">
      <img
        src="{$matchupData.red_logo}"
        class="h-full aspect-square object-contain"
        alt=""
      />
    </div>
    <span class="font-arial text-white w-full text-[40px] pl-2">
      {$matchupData.red}
    </span>
  </div>


</div>
<!--PLAYER RENDER-->
<div class="h-[90%] w-full flex">
  <div class="h-[full] w-[42.5%] flex-col w-flex flex flex-1  space-y-4">
    {#each bluePlayers as item (item.key)}
      {#if item.id <=5}
        <PlayerBar team="blue" name={item.name} main={item.main} extra={item.extra} role={item.role} slot={item.id} ></PlayerBar>
      {/if}
    {/each}
    <div class="flex h-[7.5vh] w-full gap-2 justify-end">
      {#each bluePlayers as item (item.key)}
        {#if item.id>5} 
          <PlayerBarMini team="blue" name={item.name} main={item.main} role={item.role} ></PlayerBarMini>
        {/if}
      {/each}
    </div>
  </div>  

<div class="h-[full] w-[15%]  space-y-4 flex items-center justify-center">
  <div class="h-[20%]">
          <span class="flex-1 font-[teko] text-white w-full text-[90px] p-0 m-0 leading-none inline-block drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">VS</span>
  </div>
</div>

<div class="h-[full] w-[42.5%] flex-col w-flex flex flex-1  space-y-4">
  {#each redPlayers as item (item.key)}
    {#if item.id <=5}
      <PlayerBar team="red" name={item.name} main={item.main} extra={item.extra} role={item.role} slot={item.id} ></PlayerBar>
    {/if}
  {/each}

  <div class="flex h-[7.5vh] w-full gap-2">
    {#each redPlayers as item (item.key)}
      {#if item.id>5} 
        <PlayerBarMini team="red" name={item.name} main={item.main} role={item.role} ></PlayerBarMini>
      {/if}
    {/each}
  </div>
</div>  

</div>
</div>