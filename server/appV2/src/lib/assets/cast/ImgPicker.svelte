<script>
//@ts-nocheck
import Fuse from "fuse.js"

  export let items = [];           // [{ id, name, image }]
  export let selectedItem={};
  export let target="";
  export let mode ="";
  export let team ="";
  export let title ="";
  

  let query = "";
  let selectedId = null;
  let payload =  {};

  $: minSize = mode === "ban" ? "80px" : "170px";

  //mark current selected maps
  $: console.log(selectedItem)
  $: if (mode=="mappick"){
    if (selectedItem.name != ""){
    for(let i=0; i<items.length;i++){
      if(items[i].name == selectedItem.name) {selectedId=items[i].id; break;}
    }
  }
} else if(mode=="ban"){
  if(team== "1"){
  if (selectedItem.ban_blue_name != ""){
    for(let i=0; i<items.length;i++){
      if(items[i].name == selectedItem.ban_blue_name) {selectedId=items[i].id; break;}
    }
  }
}
  else if(team== "2"){
  if (selectedItem.ban_red_name != ""){
    for(let i=0; i<items.length;i++){
      if(items[i].name == selectedItem.ban_red_name) {selectedId=items[i].id; break;}
    }
  }
}
}
// fuse search parameters
let fuse;
$: if (items?.length) {
  fuse = new Fuse(items, {
    keys: ["name"],
    threshold: 0.4
  });
}

//fuse search
    $: filteredItems =
     query.trim() === ""
      ? items
      : fuse.search(query).map(r => r.item);


      $: if(items[0] != undefined) console.log(typeof items[0].name);

  //updates played maps
  async function update(id,data) {
  try {
    const response = await fetch(`/api/api/played_maps/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
  } catch (error) {
    console.error("Error updating JSON:", error);
  }
}



//kick item event
  function selectItem(item) {
    selectedId = item.id;
    if(mode =="ban"){
      payload={[target]: `team: ${team} hero: ${item.id}`};
    } else if(mode=="mappick"){
    payload={[target]: item.id};
    }
    update(selectedItem.id, payload);
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
    grid-template-columns: repeat(auto-fill, minmax(var(--min-col-size), 5fr));
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


  

  img {
    width: 100%;
    display: block;
  }


  button {
    margin-bottom: 1rem;
  }
</style>


<div class="flex flex-col w-full h-full">
<input
  class="search"
  placeholder="Search..."
  bind:value={query}
/>

<!-- =======================
     GRID
     ======================= -->
  <div class="flex-1 overflow-y-scroll">
    <div class="grid" style={`--min-col-size:${minSize}`}>
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
  </div>
</div>