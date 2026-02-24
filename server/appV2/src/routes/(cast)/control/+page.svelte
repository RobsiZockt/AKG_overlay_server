<script>
    import Timer from "$lib/assets/cast/timer.svelte";
    import Header from "$lib/assets/header.svelte";
    import Navbar from "$lib/assets/cast/navbar.svelte";

    import LiveControl from "$lib/assets/cast/sub_pages/LiveControl.svelte";
    
  let current_tag = "Live";
  let updateData = (newData) => {
    current_tag =newData;
  }
</script>

<div class="w-full h-[100vh] bg-[#2b2d30]">
  <div class ="w-full h-[68px] relative">
    <div class="absolute inset-0">
      <Header/>
    </div> 
    <div class="absolute inset-0 z-2">
      <Timer/>
    </div>
  </div>

<Navbar
  current_tab={updateData}
 
/>

{#if current_tag === "Live"}
<LiveControl/>
{:else if current_tag === "Setup"}
  <p>Products content</p>
{:else if current_tag ==="Teams"}
  <p>Contact content</p>
{/if}

</div>