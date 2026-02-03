<script>
  export let position = 'left';
  export let hero;
  export let size = 160;
  import banned from "./img/banned.svg"
</script>

<div
  class={`absolute z-40 -bottom-6
    ${position === 'left' ? 'left-8' : 'right-8'}
    w-[160px] h-[160px]`}
>
{#if hero!==""}
  <!-- PNG base -->
  <img
    src={hero}
    alt=""
    class="absolute inset-0 w-full h-[75%] grayscale-50 object-contain"
  />

  <!-- SVG overlay -->
  <img
    src={banned}
    alt=""
    class="absolute inset-0 w-full h-[75%] grayscale-50 object-contain"
  />
  {:else}
  <div></div>
  {/if}
</div>
