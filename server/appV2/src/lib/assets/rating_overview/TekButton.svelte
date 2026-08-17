<script>
//@ts-nocheck

  let items = ["wise_24", "sose_25", "wise_25","sose_26"];
   let current_tag = $state(items[3]);

  function select(tag) {
    current_tag = tag;
    current_tab(tag);
  }

  let {current_tab} =$props();
</script>

<nav class="bg-[#1e1e1e] text-white">
  <div class="mx-auto px-4">
    <div class="flex h-8 items-center justify-center">
      
      <div class="text-xl font-[Cascadia Mono] font-bold pr-4 text-[#ffaa00]">Season</div>

      <div class="flex gap-4">
        {#each items as tag}
          <button
            onclick={() => select(tag)}
            class={`px-3 py-1 font-medium transition font-[Cascadia Mono]
              ${current_tag === tag
                ? "underline text-white"
                : "hover:bg-gray- hover:underline hover:text-white no-underline text-gray-400"}`}
          >
            {tag}
          </button>
        {/each}
      </div>
    </div>
  </div>
</nav>