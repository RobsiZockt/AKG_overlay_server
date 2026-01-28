<script>
    export let name;
    export let social;
    export let no_vid=false;
    export let img;

    import Background from "./Background.svelte";
</script>

<div class="h-[612px] w-[1031px] flex justify-center">
  <!-- Shared width wrapper -->
  <div class="h-full w-fit flex flex-col">

    <!-- Cam + Sides -->
    <div class="flex h-[88%] w-full">
      <div class="h-full w-[10px] bg-[#348333]"></div>

      <div class="h-full w-[1011px]">
        {#if no_vid === true}
          <Background Map_url={img} />
        {/if}
      </div>

      <div class="h-full w-[10px] bg-[#348333]"></div>
    </div>

    <!-- Cam Footer -->
    <div class="h-[12%] w-full text-center bg-[#000000ee] flex flex-col justify-center">
      <p class="text-4xl text-white tracking-wide">{name}</p>
      <p class="text-xl text-white tracking-wide">{social}</p>
    </div>

  </div>
</div>

