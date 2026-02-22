<script>
    import Timer from "$lib/assets/cast/timer.svelte";
    import Header from "$lib/assets/header.svelte";
</script>

<div class="w-full h-[100vh] bg-[#2b2d30]">
<div class ="w-full h-fit">
  <div class="absolute inset-0 z-10">
    <Header/>
  </div> 

  <div class="absolute inset-0 z-20">
    <Timer/>
  </div>
</div>
</div>