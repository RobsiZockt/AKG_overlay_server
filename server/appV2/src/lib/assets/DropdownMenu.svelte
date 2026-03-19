<script>
    let { list=[], nulltext="", value = $bindable(0), width=100, height=50 } = $props();
</script>

<select bind:value class="flex shrink-0 p-3 text-base" style="width: {width}px; height: {height}px;">
  <option value={0} disabled>{nulltext}</option>

  {#each list as item}

    {#if typeof(item)=="string"}
        <option value={parseInt(item)}>
        {item}
        </option>
    {:else}
        <option value={item.id}>
        {item.name}
        </option>
    {/if}
  {/each}
</select>