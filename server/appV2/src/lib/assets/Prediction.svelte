<script>
import { onMount } from "svelte";
import { matchupData } from "$lib/stores/matchupData";
import FadeInLeft from "./animations/FadeInLeft.svelte";
import FadeInRight from "./animations/FadeInRight.svelte";
let predData=$state({})


let t1_logo = $state("");
let t2_logo = $state("");
let leftfade = $state("");
let rightfade = $state("");
let {trigger = $bindable()} = $props();
let trig_flag = $state();
async function getPredData() {
    try {
      const res = await fetch(`/api/pred/predict_current`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      predData = await res.json();
      console.log(predData);
    } catch (err) {
      console.warn(err);
    }
  }

$effect(()=>{
    if($matchupData.switched===0){
        t1_logo = $matchupData.blue_logo;
        t2_logo = $matchupData.red_logo;
    } else{
        t2_logo = $matchupData.blue_logo;
        t1_logo = $matchupData.red_logo;
    }
})
$effect(()=>{
    if(predData.team1_win_probability==0 || predData=={} || predData.team1_win_probability==undefined)
    return;
    leftfade = `-${(predData.team1_win_probability.toFixed())*5}px`;
})

$effect(()=>{
    if(predData.team2_win_probability==0 || predData=={} || predData.team2_win_probability==undefined)
    return;
    rightfade = `${(predData.team2_win_probability.toFixed())*5}px`;
})

$effect(()=>{
	if(trig_flag==trigger)
	return;
	getPredData();
	trig_flag=trigger;
})
  onMount(()=>{getPredData();}) 
</script>

<style>
    .appear {
        opacity: 0;
        animation-name: appear;
        animation-fill-mode: forwards;
        animation-timing-function: ease;
        animation-duration: 2s;
        animation-delay: 6.2s;
    }

    @keyframes appear{
        from{
            opacity: 0;
        } to {
            opacity: 1;
        }
    }
    .disappear {
        opacity: 1;
        animation-name: disappear;
        animation-fill-mode: forwards;
        animation-timing-function: ease;
        animation-duration: 2s;
        animation-delay: 15s;
    }

    @keyframes disappear{
        from{
            opacity: 1;
        } to {
            opacity: 0;
        }
    }
</style>

{#if trigger == true}
	<FadeInLeft duration={2000}>
		{#if predData != {}}
			<!--div class="disappear w-full h-full flex-col bg-[#000000ee] border-4 border-black"-->
			<div class="disappear w-full h-full flex-col bg-[#000000ee] border-4 border-black">
				<!--Name HEader-->
				<div class="w-full h-1/6 items-center justify-center flex border-b-4 border-black">
					<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]"> PREDICTION</span>
				</div>
				<!--Team Logos ans Shorts-->
				<div class="w-full h-7/12 items-center justify-center flex p-4">
					<div class="w-1/3 h-full items-center justify-start flex-col"> 
						<img src='{t1_logo}' alt="" class="h-auto aspect-square object-cover"/>
						<div class="w-auto h-auto flex justify-center">   
							<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]"> {predData.team1_kurz}</span>
						</div>
					</div>
					<div class="w-1/3 h-full items-center justify-center flex">
						<div>
							<span class="font-[teko] text-white text-7xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">VS</span>
						</div>
					</div>
					<div class="w-1/3 h-full items-center justify-end flex-col">
					<img src='{t2_logo}' alt="" class="h-auto aspect-square object-cover"/>
						<div class="w-auto h-auto flex justify-center">   
							<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]"> {predData.team2_kurz}</span>
						</div>
					</div>
				</div>
				<!--Model confidence-->
				<div class="w-full h-1/12 items-center justify-center flex">
					<div>
						<span class="flex-1 font-[teko] text-gray-500  text-[20px] p-0 m-0 leading-none inline-block">Model Confidence: {(predData.confidence*100).toFixed(2)}%</span>
					</div>
				</div>
				<!--Prediction Bar-->
				{#if predData.team1_win_probability!=0}
					<div class="w-full h-1/6 items-center justify-center flex">
						<div class="h-full" style:width={`${predData.team1_win_probability}%`}>
							<FadeInLeft duration={4000} offset={leftfade} delay={2000}>
								<div class='bg-blue-400 h-full w-full'>
									<div class="appear w-full h-full flex">
										{#if predData.team1_win_probability>=20}
											<div class="items-center justify-start pl-2 flex ">				
											<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">{predData.team1_win_probability.toFixed()}%</span>								
											</div>
										{/if}
										{#if predData.team2_win_probability<20}
											<div class="flex w-full h-full items-center pr-2 justify-end">
												<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">{predData.team2_win_probability.toFixed()}%</span>
											</div>
										{/if}
									</div>
								</div>
							</FadeInLeft>
						</div>
						<div class="h-full" style:width={`${predData.team2_win_probability}%`}>
							<FadeInRight duration={4000} offset={rightfade} delay={2000}>
								<div class= "bg-red-400 h-full w-full">
									<div class="appear w-full h-full flex">
										{#if predData.team1_win_probability<20}
											<div class="items-center justify-start pl-2 flex ">				
												<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">{predData.team1_win_probability.toFixed()}%</span>								
											</div>
										{/if}
										{#if predData.team2_win_probability>=20}
											<div class="flex w-full h-full items-center pr-2 justify-end">
												<span class="font-[teko] text-white text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)]">{predData.team2_win_probability.toFixed()}%</span>
											</div>
										{/if}
									</div>
								</div>
							</FadeInRight>
						</div> 
					</div>
				{/if}
			</div>
		{/if}
	</FadeInLeft>
{/if}

