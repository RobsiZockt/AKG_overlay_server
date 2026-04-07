<script>
  export let position = 'left';
  export let mode = "";
  export let hero;
  export let size = 160;
  import banned from "./img/banned.svg"
</script>
{#if mode !="header"}
<div
  class={`absolute z-40 -bottom-6
    ${position === 'left' ? 'left-8' : 'right-8'}
       w-[var(--size)] h-[var(--size)]`}
  style="--size: {size}px"
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
{:else}
<div style="--size: {size}px" 
class={`w-[var(--size)] h-[var(--size)] relative object-contain flex items-center justify-center bg-[#000000ee]`}
>
  {#if hero!==""}
  <!-- PNG base -->
  <img
    src={hero}
    alt=""
    class="absolute inset-0 w-[100%] h-[100%] grayscale-70 p-1 object-contain"
  />

  <!-- SVG overlay -->
  <img
    src={banned}
    alt=""
    class="absolute inset-0 w-[100%] h-[100%] grayscale-50 p-1 object-contain"
  />
  {:else}
  <div></div>
  {/if}
</div>
{/if}