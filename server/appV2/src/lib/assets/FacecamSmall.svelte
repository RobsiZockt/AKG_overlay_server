<script>
    export let name = "";
    export let social= "";
    export let no_vid=false;
    export let img;
    export let trigger=false;

    import Background from "./Background.svelte";
     import SplitRevealBox from "./animations/SplitRevealBox.svelte";

    let open = false;

 $:if(name != ""){ 
  if(trigger==true)
  setTimeout(() => open = true, 400);
 if(trigger==false) open = false;
 }
</script>
<SplitRevealBox {open} width={1031} height={612} color="#348333">
<div class="h-[612px] w-[1031px] flex justify-center">
  <!-- Shared width wrapper -->
  <div class="h-full w-fit flex flex-col">

    <!-- Cam + Sides -->
    <div class="flex h-[88%] w-full">
      <div class="h-full w-[10px] flex flex-col "> <!--bg-[#348333]-->
        <div class="w-full h-1/6 bg-[#e40303]"></div>
        <div class="w-full h-1/6 bg-[#ff8c00]"></div>
        <div class="w-full h-1/6 bg-[#ffed00]"></div>
        <div class="w-full h-1/6 bg-[#008026]"></div>
        <div class="w-full h-1/6 bg-[#004cff]"></div>
        <div class="w-full h-1/6 bg-[#732982]"></div>
      </div>

      <div class="h-full w-[1011px]">
        {#if no_vid === true}
          <Background Map_url={img} />
        {/if}
      </div>

      <div class="h-full w-[10px] flex flex-col "> <!--bg-[#348333]-->
        <div class="w-full h-1/6 bg-[#e40303]"></div>
        <div class="w-full h-1/6 bg-[#ff8c00]"></div>
        <div class="w-full h-1/6 bg-[#ffed00]"></div>
        <div class="w-full h-1/6 bg-[#008026]"></div>
        <div class="w-full h-1/6 bg-[#004cff]"></div>
        <div class="w-full h-1/6 bg-[#732982]"></div>
      </div>
    </div>

    <!-- Cam Footer -->
     {#if name != ""}
    <div class="h-[12%] w-full text-center bg-[#000000ee] flex flex-col justify-center">
      <p class="text-4xl text-white tracking-wide">{name}</p>
      <p class="text-xl text-white tracking-wide">{social}</p>
    </div>
      {/if}
  </div>
</div>
</SplitRevealBox>
