<script>
  import Background from './Background.svelte';
  import ForegroundBlock from './ForegroundBlock.svelte';
  import FooterBar from './FooterBar.svelte';
  import SvgOverlay from './SvgOverlay.svelte';
  import SmallBlock from './SmallBlocks.svelte';

  export let block;
  export let active = false;
</script>

<div
  class={`
    relative h-full flex-shrink-0
    transition-all duration-700 ease-in-out
    ${active ? 'w-screen' : 'w-[230px]'}
  `}
>
  <Background image={block.background} />

  {#if active}
    <ForegroundBlock
      position="left"
      Team_logo={block.team_logo}
      Team_kurz={block.team_kurz}
    />

    <FooterBar />

    <SvgOverlay position="left" />
    <SvgOverlay position="right" />
  {:else}
    <SmallBlock {block} />
  {/if}
</div>
