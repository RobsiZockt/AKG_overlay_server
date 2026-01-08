<script>
  import { blocks } from '$lib/stores/createSSEStore.js';
</script>

<div class="relative w-screen h-screen overflow-hidden">
  <div class="flex h-full transition-all duration-700 ease-in-out">
    {#each $blocks as block, i (block.id)}
      <BlockLayout
        {block}
        index={i}
        active={i === $blocks.length - 1}
      />
    {/each}
  </div>
</div>
