<script>
    export let name ="";
    export let social="";
    export let no_vid=false;
    export let img="";

    import Background from "./Background.svelte";
    import SplitRevealBox from "./animations/SplitRevealBox.svelte";

    let open = false;

 $:if(name != "") setTimeout(() => open = true, 400);
</script>

<SplitRevealBox {open} width={1213} height={720} color="#348333">
<div class="h-[720px] w-[1213px] flex justify-center">
  <!-- Shared width wrapper -->
  <div class="h-full w-fit flex flex-col">

    <!-- Cam + Sides -->
    <div class="flex h-[88%]">
      <div class="h-full w-[10px] bg-[#348333]"></div>

      <div class="h-full w-[1193px]">
        {#if no_vid === true}
          <Background Map_url={img} />
        {/if}
      </div>

      <div class="h-full w-[10px] bg-[#348333]"></div>
    </div>

    <!-- Cam Footer -->
     {#if name != ""}
    <div class="h-[12%] w-full text-center bg-[#000000ee] flex flex-col justify-center">
      <p class="text-5xl text-white tracking-wide">{name}</p>
      <p class="text-2xl text-white tracking-wide">{social}</p>
    </div>
    {/if}

  </div>
</div>
</SplitRevealBox>
