<script>
    import Timer from "$lib/assets/cast/timer.svelte";
    import Header from "$lib/assets/header.svelte";
    import Navbar from "$lib/assets/cast/navbar.svelte";

    import LiveControl from "$lib/assets/cast/sub_pages/LiveControl.svelte";
    import TeamSetup from "$lib/assets/cast/sub_pages/TeamSetup.svelte";
    import Setup from "$lib/assets/cast/sub_pages/Setup.svelte";
    
  let current_tag = "Live";
  let updateData = (newData) => {
    current_tag =newData;
  }
</script>

<div class="w-full h-[100vh] bg-[#2b2d30] overflow-hidden">
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
<div class="flex h-[90%] w-full object-contain overflow-y">
<LiveControl/>
</div>
{:else if current_tag === "Setup"}
  <Setup/>
{:else if current_tag ==="Teams"}
  <TeamSetup/>
{/if}

</div>