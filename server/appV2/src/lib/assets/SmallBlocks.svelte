<script>
  import ForegroundBlock from './ForegroundBlock.svelte';
  import SvgOverlay from './SvgOverlay.svelte';

  export let block;
</script>

<div class="relative w-full h-full">

  <!-- Foreground (right side, smaller) -->
  <div class="absolute top-1/4 right-4 scale-75 origin-top-right">
    <ForegroundBlock
      position="right"
      Team_logo={block.team_logo}
      Team_kurz={block.team_kurz}
    />
  </div>

  <!-- SVG overlays stacked -->
  <div class="absolute bottom-6 right-4 flex flex-col gap-3 scale-75 origin-bottom-right">
    <SvgOverlay />
    <SvgOverlay />
  </div>

</div>
