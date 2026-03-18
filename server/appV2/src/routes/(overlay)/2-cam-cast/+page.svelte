<script>
 import Facecam from "$lib/assets/Facecam.svelte";
 import { casters } from "$lib/stores/casters";
  import { onMount } from "svelte";
 onMount(()=>casters.load());

 let cast1={name:"",social:"",social_ico: null};
 
 let cast2={name:"",social:"",social_ico: null};

 $: if($casters.length){
    cast1 = $casters[0];
    cast2 = $casters[1];
 }
</script>

<div class="h-[100vh] w-full p-10 flex items-center justify-center bg-transparent">
    <Facecam name={cast1.name} social={cast1.social} img="" no_vid={false}></Facecam> 
<!--SPACER-->
<div class="w-[2%] h-full"></div>
    <Facecam name={cast2.name} social={cast2.social} img="" no_vid={false}></Facecam>
</div>