<script>
    let { list=[], nulltext="", value = $bindable(0), width=100, height=50 } = $props();
</script>

<select bind:value class="flex p-3 text-base" style="width: {width}px; height: {height}px;">
  <option value={null} disabled>{nulltext}</option>

  {#each list as item}
    <option value={item.id}>
    {#if typeof(item)=="string"}
        {item}
    {:else}
        {item.name}
    {/if}
    </option>
  {/each}
</select>