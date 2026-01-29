<script>
  import { fade, fly } from 'svelte/transition';
  import SplitReveal from './animations/SplitReveal.svelte';

  let open = false;
  let visible = false;

  setInterval(() => {
    visible = false;
    open = false;

    setTimeout(() => {
         visible = true;
    }, 400);

    setTimeout(() => {
      open = true;
    }, 900);

    setTimeout(() => {
      open = false;
    }, 10000);

        setTimeout(() => {
         visible = false;
    }, 10700);
  }, 60000);
</script>

{#if visible}
  <div
    transition:fly={{ y: 20, duration: 400 }}
  >
    <SplitReveal {open}>
      <span class="font-[teko] text-3xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
        Powered by RZProdTool
      </span>
    </SplitReveal>
  </div>
{/if}
