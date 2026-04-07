<script>
//@ts-nocheck

  let items = ["Live", "Setup", "Teams"];
   let current_tag = $state(items[0]);

  function select(tag) {
    current_tag = tag;
    current_tab(tag);
  }

  let {current_tab} =$props();
</script>

<nav class="bg-[#1e1e1e] text-white">
  <div class="mx-auto px-4">
    <div class="flex h-8 items-start justify-start">
      
      <div class="text-xl font-bold pr-4 text-[#ffaa00]">RZProdTool</div>

      <div class="flex gap-4">
        {#each items as tag}
          <button
            onclick={() => select(tag)}
            class={`px-3 py-1 font-medium transition
              ${current_tag === tag
                ? "underline text-white"
                : "hover:bg-gray- hover:underline no-underline"}`}
          >
            {tag}
          </button>
        {/each}
      </div>
    </div>
  </div>
</nav>