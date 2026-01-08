
<script>
  //@ts-nocheck
    export let Map_name;
    export let Map_type;

  import { onMount, onDestroy } from 'svelte';

  let container;
  let width = 0;
  let height = 0;
  let observer;

  onMount(() => {
    observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });

    observer.observe(container);
  });

  onDestroy(() => {
    observer?.disconnect();
  });
</script>


<div bind:this={container} class="w-full h-full">
  {#if width > 500}
  <div class="absolute bottom-0 inset-x-0 z-20 bg-[#0a0a0add] h-[116px] text-white">
    <div class="max-w-6xl mx-auto py-6 px-8 text-center">
      <p class="text-4xl tracking-wide">
          {Map_name} 
      </p>
      <p class="text-xl tracking-wide">
          {Map_type}
      </p>
    </div>
  </div>
  {:else if width >= 300}
<div class="absolute bottom-0 inset-x-0 z-20 bg-[#0a0a0add] h-[116px] text-white">
    <div class="max-w-6xl mx-auto py-6 px-6 text-center">
      <p class="text-3xl tracking-wide">
          {Map_name} 
      </p>
      <p class="text-l tracking-wide">
          {Map_type}
      </p>
    </div>
  </div>
  {:else}
  <div class="absolute bottom-0 inset-x-0 z-20 bg-[#0a0a0add] h-[116px] text-white">
      <div class="max-w-6xl mx-auto py-6 px-6 text-center">
      <p class="text-xl tracking-wide">
          {Map_name} 
      </p>
      <p class="text-xs tracking-wide">
          {Map_type}
      </p>
    </div>
  </div>
  {/if}
</div>

