<script>
  import DropdownMenu from "$lib/assets/DropdownMenu.svelte";
  import { casters } from "$lib/stores/casters";
  import { teamdata } from "$lib/stores/TeamData";
  import { stream_config_static } from "$lib/stores/stream_config";
  import { streamConfData } from "$lib/stores/streamConfData";
  import { onMount, settled } from "svelte";
  import Textfield from "../Textfield.svelte";
  import TimeField from "../TimeField.svelte";
  import BoxText from "$lib/assets/wrapper/BoxText.svelte";


    onMount(()=> {teamdata.load();casters.load();stream_config_static.load()});
		let casters_local=$state([]);
    let first_team = $state(0);
    let second_team = $state(0);
    let delaytime= $state("s");
    let pausetime = $state("");
    let toptxt = $state("");
    let bottxt = $state("");
    let starttime = $state(["",""]);

    async function setSTconf(target) {
      let data={};

      if(target=="starttime"){
        data={"starttime":`${starttime[0]}:${starttime[1]}`};
      } else if(target=="preptime"){
        data={"preptime":delaytime};
      } else if(target=="pausetime"){
        data={"pausetime":pausetime};
      } else if(target=="bottext"){
        let tmp = bottxt.split("\"");
        tmp = tmp.filter(str=>str.trim()!=="");
        data={"inf_txt":tmp};
      } else if(target=="toptext"){
        data={"override_top":toptxt};
      }
      else{return;}
      try{
      const res = await fetch(`/api/stconf/update`, {
            method: "PUT",
						headers: { "Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
				const rec = await res.json();
      } catch (err){
        console.warn(err);
      }
    }

		async function setTeam(target,id) {
      if(id==0) return;
			try{
					const res = await fetch(`/api/stconf/set/${target}/${id}`, {
            method: "POST",
						headers: { "Content-Type": "application/json"}
        });
				const rec = await res.json();
			} catch (err){
				console.warn(err);
			}
		}

		async function saveCaster(id) {
			try{
				let data = casters_local[id];
				const res = await fetch(`/api/caster/${id+1}`, {
            method: "PUT",
						headers: { "Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
				const rec = await res.json();
			} catch (err){
				console.warn(err);
			}
		}

async function reset() {
  	try{
				const res = await fetch(`/api/api/new_matchup`, {
            method: "POST",
						headers: { "Content-Type": "application/json"},
        });
				const rec = await res.json();
			} catch (err){
				console.warn(err);
			}
}

	$effect(()=>{ casters_local = $casters;});
	$effect(()=>{setTeam("first_team",first_team)});
  $effect(()=>{setTeam("second_team",second_team)});;
  $effect(()=>{ if($stream_config_static.starttime==null) return;
    let tmp = "";
  tmp =  $stream_config_static.starttime;
    starttime= tmp.split(":");
  })
  $effect(()=>{
    if($stream_config_static.preptime == null) return;
    delaytime = $stream_config_static.preptime;
  })
   $effect(()=>{
    if($stream_config_static.pausetime == null) return;
    pausetime = $stream_config_static.pausetime;
  })
  $effect(()=>{
    if($streamConfData.inf_txt==null) return;
    let tmp = [""];
    tmp = $streamConfData.inf_txt;
    console.log(typeof tmp);
    let txt = tmp.filter(str=>str!=="").map(str=>`"${str}"`).join("");
    bottxt = txt;
  })
</script>

<div class="flex flex-col w-full h-full items-center">
<BoxText title="Select Teams">
  <div class="flex items-center w-[80%] gap-3">
    <DropdownMenu list={$teamdata} bind:value={first_team} nulltext="First named team" width={300} ></DropdownMenu>
    <DropdownMenu list={$teamdata} bind:value={second_team} nulltext="Second named team" width={300} ></DropdownMenu>
  </div>
</BoxText>
<BoxText title="Caster Setup">
  <div class=" w-[80%] h-fit">
    {#if $casters!=null}
      {#each casters_local as caster}
        <div class="flex w-full gap-1 h-fit pb-3">
				<p>Caster: </p>
          <Textfield placeholdertxt="Name" bind:value={caster.name} width={300} onBlur={()=>saveCaster(caster.id - 1)}></Textfield>
          <Textfield placeholdertxt="Social name" bind:value={caster.social} width={300} onBlur={()=>saveCaster(caster.id - 1)}></Textfield>
          <Textfield placeholdertxt="social ico" bind:value={caster.social_ico} onBlur={()=>saveCaster(caster.id - 1)}></Textfield>
        </div>
      {/each}
    {/if}
  </div>
</BoxText>
<BoxText title="Timer Setup">
<div>
  <div class="flex">
 		<p>Start Time:</p>
    <TimeField bind:hours={starttime[0]} bind:minutes={starttime[1]} onBlur={()=>setSTconf("starttime")}></TimeField>
    <p>Prep Time</p>
    <TimeField hours="00" bind:minutes={delaytime} onBlur={()=>setSTconf("preptime")}></TimeField>
 	</div>
  
  <div class="flex pt-1">
    <p>Pause Time</p>
    <TimeField hours="00" bind:minutes={pausetime} onBlur={()=>setSTconf("pausetime")}></TimeField>
  </div>
</div>
</BoxText>

<BoxText title="Footer Texts">
  <Textfield placeholdertxt="TOP TEXT (OVERRIDE)" bind:value={toptxt} width={600} onBlur={()=>setSTconf("toptext")}></Textfield>
  <Textfield placeholdertxt="Bottom text" bind:value={bottxt} width={600} onBlur={()=>setSTconf("bottext")}></Textfield>
</BoxText>

<BoxText title="Ruleset (very WIP)">
	<p>The Ruleset system will come soonTM</p>
</BoxText>
<BoxText title="Reset Played Maps">
  <button class="w-full h-[50px] text-white rounded-lg bg-red-700" onclick={()=>reset()}>
  RESET MAPS      
  </button>
</BoxText>
</div>