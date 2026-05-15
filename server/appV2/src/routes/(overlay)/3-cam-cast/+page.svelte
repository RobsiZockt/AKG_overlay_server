<script>
  import FacecamSmall from "$lib/assets/FacecamSmall.svelte";
   import { casters } from "$lib/stores/casters";
  import { onMount } from "svelte";

  let trig=false;
 onMount(()=>{casters.load();
    document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
      casters.refresh();
      if($casters.length){
        cast1 = $casters[0];
        cast2 = $casters[1];
        cast3 = $casters[2];
      }
      trig=true;
    }
    else if (document.hidden){
      trig=false;
    };

 })
 });

  let cast1={name:"",social:"",social_ico: null};
 let cast2={name:"",social:"",social_ico: null};
 let cast3={name:"",social:"",social_ico: null};

 $: if($casters.length){
    cast1 = $casters[0];
    cast2 = $casters[1];
    cast3 = $casters[2];
 }
</script>

<div class="h-[100vh] w-full px-10 flex-col items-center justify-center bg-transparent">
  <div class="h-[5%]"></div>
  <div class="flex items-center justify-center">
<FacecamSmall name={cast1.name} social={cast1.social} img="" no_vid={false} trigger={trig}></FacecamSmall> 
<!--SPACER-->
<div class="w-[7%] h-full"></div>
<FacecamSmall name={cast2.name} social={cast2.social} img="" no_vid={false} trigger={trig}></FacecamSmall>
</div>
<div class="h-[5%]"></div>
<div class="w-full flex items-center justify-center">
<FacecamSmall name={cast3.name} social={cast3.social} img="" no_vid={false} trigger={trig}></FacecamSmall>
</div>
</div>