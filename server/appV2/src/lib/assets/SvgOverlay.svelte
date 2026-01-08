<script>
  export let position = 'left';
  export let hero;
  import banned from "./img/banned.svg"
</script>

<div
  class={`absolute z-40 -bottom-6
    ${position === 'left' ? 'left-8' : 'right-8'}
    w-40 h-40`}
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
