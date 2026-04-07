<script>
    let {content = [],speed=20} = $props();   
    const items = $derived(Array.isArray(content)?content:[content]);
    const loopItems = $derived([...items,...items,...items]);
</script>





<div class="overflow-hidden whitespace-nowrap w-full">
    <div class="runningtext">
        {#each loopItems as item,i }
        <span class="mx-4 shrink-0 text-white text-7xl font-light">
            {item.toUpperCase()}
            //
        </span>
        {/each}
    </div>
</div>

<style>
.runningtext{
    display: inline-flex;
    white-space: nowrap;
    animation: scroll 60s linear infinite;
}
  @keyframes scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-33.333%);
    }
  }
</style>