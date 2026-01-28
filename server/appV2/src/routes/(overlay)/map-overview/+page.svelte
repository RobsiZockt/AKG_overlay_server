<script>
  import Background from '$lib/assets/Background.svelte';
  import ForegroundBlock from '$lib/assets/ForegroundBlock.svelte';
  import FooterBar from '$lib/assets/FooterBar.svelte';
  import SvgOverlay from '$lib/assets/SvgOverlay.svelte';
  import Score from '$lib/assets/map_display/Score.svelte';

  import { matchupData } from '$lib/stores/matchupData';
  import { playedMaps } from '$lib/stores/playedMapsUpdate';
 $: entries = Object.entries($playedMaps ?? {})
    .map(([key, value]) => ({
      id: Number(key),
      ...value
    }))
    .sort((a, b) => a.id - b.id);

  $: console.log('entries:', entries);
$: count = entries.length;
$: latestIndex = count - 1;
$: latest = entries.at(-1);

</script>

<div class=" flex h-[100vh] w-full items-center justify-center overflow-hidden">
  <div class="relative flex gap-1 w-[2000px] h-[900px] items-center justify-center">

  {#if entries && entries.length}
{#each entries as item}
  {#if item.id === latest.id }
  {#if item.name !=""}
  <div class="relative w-[1500px] h-full overflow-hidden">
  <!-- z-0 -->
  <Background Map_url={item.image} />

  <!-- z-1 -->
  <ForegroundBlock position="left" Team_logo={$matchupData.blue_logo} Team_kurz="HSKS"/>
  <!--MISSING CURRENT SCORE-->
  <ForegroundBlock position="right" Team_logo={$matchupData.red_logo} Team_kurz="HSKC" />

  <!-- z-2 -->
  <FooterBar Map_name={item.name} Map_type="Push"/>

  <!-- z-4 (optically overlaps footer) -->
  <SvgOverlay position="left" hero={item.ban_blue}/>
  <SvgOverlay position="right" hero={item.ban_red}/>
  </div>
  {/if}
  {:else}
    {#if item.name !=""}
    <!-- normal rendering -->
    <div class="relative w-[450px] h-full overflow-hidden">
      <Background Map_url={item.image}/>
      <ForegroundBlock position="" Team_logo={item.blue_score > item.red_score ? $matchupData.blue_logo : $matchupData.red_logo} Team_kurz="TEST"/>
      <Score red_score={item.score_red} blue_score={item.score_blue} />
      <FooterBar Map_name={item.name} Map_type="Push"/>
    </div>
    {/if}
  {/if}
{/each}
{:else}
  <p>Waiting for data…</p>
{/if}
</div>
</div>
