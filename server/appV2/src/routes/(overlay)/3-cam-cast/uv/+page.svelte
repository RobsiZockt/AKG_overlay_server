<script>
  import FacecamSmall from "$lib/assets/FacecamSmall.svelte";
   import { casters } from "$lib/stores/casters";
   import { page } from "$app/state";
  import { onMount } from "svelte";

  let trig=false;
 	let query = page.url.searchParams.get("v");
	const sep = "\u241F";

function b64DecodeUnicode(str) { return new TextDecoder().decode(
    Uint8Array.from(atob(decodeURIComponent(str)), c => c.charCodeAt(0))
  );}



 onMount(()=>{
    document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
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

 if (query!=null) query = b64DecodeUnicode(query);
let data = query?.split(sep);
cast1={name:data[0], social:data[1], social_ico: null};
cast2={name:data[2], social:data[3], social_ico: null};
cast3={name:data[4], social:data[5], social_ico: null};

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