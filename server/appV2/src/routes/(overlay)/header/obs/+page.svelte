 <script>
    import Header from "$lib/assets/header.svelte";
    import Timer from "$lib/assets/cast/timer.svelte";
 </script>
 
 <div class ="w-full h-[68px] relative bg-[#4c4c4c] overflow-hidden">
    <div class="absolute inset-0">
      <Header/>
    </div> 
    <div class="absolute inset-0 z-2">
      <Timer/>
    </div>
  </div>