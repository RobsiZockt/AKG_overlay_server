<script>
import { teamdata } from "$lib/stores/TeamData";
  import { onMount } from "svelte";
  import TeamEdit from "../TeamEdit.svelte";

  let selected = 1;

onMount(()=>teamdata.load());
$: console.log($teamdata);

function handleclick(id){
selected = id-1;
console.log(selected);
}

async function newteam() {
     try{
        const res = await fetch(`/api/team/new`, {
        	method: "POST",
        	headers: {
          	"Content-Type": "application/json"
        	}
      	});
      	const data = await res.json();
        teamdata.refresh();
        }catch(err){
            console.error(err);
        }
}
</script>

<div class="flex w-full h-full pt-1 pr-1">
    <div class="flex flex-col w-[15%] h-full border-2 border-black overflow-y-scroll ">
        {#each $teamdata as team}
            <button class="w-full h-[50px] text-white border border-black" onclick={()=>handleclick(parseInt(team))}>
                {team}        
            </button>
        {/each}
        <button class="w-full h-[50px] text-white border border-dashed border-black" onclick={()=>newteam()}>
                Add Team        
            </button>
    </div>
    <div class="flex flex-col w-[85%] h-full">
        <TeamEdit id={selected+1} filename={$teamdata[selected]}/>
    </div>
</div>