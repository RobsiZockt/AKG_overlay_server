<script>
 import Facecam from "$lib/assets/Facecam.svelte";
 import { casters } from "$lib/stores/casters";
 import { interview } from "$lib/stores/interview";
  import { onMount } from "svelte";
  let trig=$state(false);

 onMount(()=>{casters.load(); interview.load();
    document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
        casters.refresh();
				interview.refresh();
        if($casters.length){
            cast1 = $casters[0];
            cast2 = $casters[1];
        }
				if($interview.length){
		interview_local = $interview;
 }
        trig=true;
    }
    else if (document.hidden){
        trig=false;
    };

 })
 });

 let cast1=$state({name:"",social:"",social_ico: null});
 let cast2=$state({name:"",social:"",social_ico: null});
let interview_local = $state({name:"",team:"",role:"",team_img:""});

$effect(()=>{if($casters.length){
    cast1 = $casters[0];
    cast2 = $casters[1];
 }
})

$effect(()=>{
		interview_local = $interview;
 })


 
</script>

<div class="h-[100vh] w-full p-10 flex flex-col items-center justify-center bg-transparent">
  <div class="h-[5%]"></div>
  <div class="flex items-center justify-center">
  	<Facecam name={cast1.name} social={cast1.social} img="" no_vid={false} trigger={trig}></Facecam> 
		<!--SPACER-->
   	<div class="w-[49.6px] h-full"></div>
   	<Facecam name={cast2.name} social={cast2.social} img="" no_vid={false} trigger={trig}></Facecam>
 	</div>
	<div class="h-[5%]"></div>
	<div class="flex items-center justify-center">
		<div class="relative flex h-[128px] w-[2000px] items-start justify-center z-2 bg-[#1e1e1e] rounded-lg border-2 border-[#ffaaaa]">
			<div class="flex w-[90%] h-full items-center justify-center px-2">
				<span class="text-7xl text-white tracking-wide">Im Interview: </span>
				<div class="w-[1%]"></div>
				<span class="text-7xl text-white tracking-wide">{interview_local.name}</span>
			</div>
  		</div>
	</div>
</div>


