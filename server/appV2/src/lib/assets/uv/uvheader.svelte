<script>
  import { UVmatchupData } from "$lib/stores/UVmatchupData";

  //Left displayed Team
  $: l_logo = "";
  $: l_name = "";
  $: l_score = "";

  //Right displayed Team
  $: r_logo= "";
  $: r_name= "";
  $: r_score= "";




  $: if($UVmatchupData.switched == 0){
    l_logo = $UVmatchupData.blue_logo; 
    l_name = $UVmatchupData.blue;
    l_score = $UVmatchupData.blue_score;

    r_logo = $UVmatchupData.red_logo;
    r_name = $UVmatchupData.red;
    r_score = $UVmatchupData.red_score;

  } else if($UVmatchupData.switched == 1){
    r_logo = $UVmatchupData.blue_logo; 
    r_name = $UVmatchupData.blue;
    r_score = $UVmatchupData.blue_score;

    l_logo = $UVmatchupData.red_logo;
    l_name = $UVmatchupData.red;
    l_score = $UVmatchupData.red_score;
  }

</script>

<div class="w-screen h-[68px] relative flex">
  <!-- Left Gray Section -->
  <div
    class="flex-1 flex items-center justify-start pl-2"
    style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); background-color: #000000ee;"
  >
    <div class="h-full aspect-square bg-transparent flex items-center justify-center p-1">
      <img
        src="{l_logo}"
        class="h-auto aspect-square object-cover"
        alt="Left"
      />
    </div>

    <div class="h-full w-[2px] bg-black flex"></div>

    <span class="font-arial text-white w-full text-[40px] pl-2">
      {l_name}
    </span>
  </div>
 

  <!-- Blue Score -->
  <div
    class="w-[75px] flex items-center justify-start pl-0 pb-1 gap-2"
    style="clip-path: polygon(0 0, 100% 0, 60% 100%, 0 100%); background-color: #00a2d9;"
  >
    <span class="ml-2 font-arial text-[50px] text-white items-center justify-center">
      {l_score}
    </span>
  </div>

  <!-- Middle Spacer -->
  <div id="h-mid-spacer" class="w-[30%] bg-transparent flex-shrink-0"></div>

  <!-- Red Score -->
  <div
    class="w-[75px] flex items-center justify-end pr-0 pb-1 gap-2"
    style="clip-path: polygon(0 0, 100% 0, 100% 100%, 40% 100%); background-color: #ca4b5d;"
  >
    <span class="mr-2 font-arial text-[50px] text-white items-center justify-center">
      {r_score}
    </span>
  </div>

  <!-- Right Gray Section -->
  <div
    class="flex-1 flex items-center justify-end pr-2"
    style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); background-color: #000000ee;"
  >
    <span class="text-white text-[40px] font-arial pr-2">
      {r_name}
    </span>

    <div class="h-full w-[2px] bg-black flex"></div>

    <div class="h-full aspect-square bg-transparent flex items-center justify-center p-1">
      <img
        src="{r_logo}"
        class="h-auto aspect-square object-cover"
        alt="Right"
      />
    </div>
  </div>
</div>
