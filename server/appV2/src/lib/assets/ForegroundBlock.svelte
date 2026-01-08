<script>
  export let position = 'left';
  export let Team_logo;
  export let Team_kurz;

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

<div bind:this={container} class="absolute flex justify-center w-full h-[172px] top-1/4 z-10">
  <div
  class={`absolute
    ${position === 'left' ? `left-[50px]` : position === 'right' ? 'right-[50px]' : `left-[${(width-200)/2}px]`}
    w-[200px]`}
>
  <!-- Content wrapper -->
  <div class="flex flex-col items-center">
    
    <!-- Logo -->
    <img
      src={Team_logo}
      alt=""
      class="w-[128px] h-[128px] object-contain"
    />

    <!-- Team short name -->
    <p class="mt-2 text-2xl text-center drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] font-[teko] text-white items-center justify-center">
      {Team_kurz}
    </p>

  </div>
</div>
</div>
