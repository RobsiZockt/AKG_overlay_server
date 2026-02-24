<script>

import Fuse from "fuse.js"






  export let items = [];           // [{ id, name, image }]
  export let onSelect = () => {};  // callback to parent

  export let selectedItem={};
  

  let query = "";
  let selectedId = null;
  
  $: if (selectedItem.name != ""){
    selectedId= selectedItem.id;
  }

  const fuse = new Fuse(items, {
    keys: ["name"],
    threshold: 0.4
  });


  $: filteredItems =
    query.trim() === ""
      ? items
      : fuse.search(query).map(r => r.item);

  function selectItem(item) {
    selectedId = item.id;
    onSelect(item); // send to parent / backend later
  }

 
</script>

<style>
  .search {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
    gap: 1rem;
  }

  /* =======================
     CARD BASE
     ======================= */
  .card {
    cursor: pointer;
    transform-origin: left;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
  }

  .card.selected {
    border-color: #4f46e5;
  }

  /* =======================
     ANIMATION TRIGGER
     ======================= */
  .animate {
    animation-name: shutter-in-left;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }

  

  img {
    width: 100%;
    display: block;
  }


  button {
    margin-bottom: 1rem;
  }
</style>



<input
  class="search"
  placeholder="Search..."
  bind:value={query}
/>

<!-- =======================
     GRID
     ======================= -->
<div class="grid">
  {#each filteredItems as item, index}
    <button
      type="button"
      onclick={() => selectItem(item)}
     
      class="card block w-full text-left cursor-pointer bg-transparent border-0 p-1 m-0 focus:outline-none">
      <img src={item.path} alt={item.name} class="{item.id === selectedId ? 'ring-4 ring-blue-500' : ''} w-full h-auto object-cover rounded shadow "/>
      <div class="text-xl p-1 text-center text-white">{item.name}</div>
    </button>
  {/each}
</div>