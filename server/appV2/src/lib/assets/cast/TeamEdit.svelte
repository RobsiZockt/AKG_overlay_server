<script>
  import { heros } from "$lib/stores/heros";
  import { onMount } from "svelte";
  import DropdownMenu from "../DropdownMenu.svelte";
    import Textfield from "./Textfield.svelte";
    export let id;
    export let filename;
    let team = null;

    onMount(()=>heros.load());

    async function fetchTeam(id) {
	    try {
    			const res = await fetch(`/api/team/${id}`);
      			const data = await res.json();
                team = JSON.parse(data);
    		} catch (err) {
      		console.error("Request failed:", err);
  			}
    }
    fetchTeam(id);
$: if(team !=null && team.id != id) fetchTeam(id);
    async function handleclick(op){
        if(op=="cancel")fetchTeam(id);
        if(op=="save"){
            try{
                const res = await fetch(`/api/team/${id}`, {
        			method: "PUT",
        			headers: {
          			"Content-Type": "application/json"
        			},
                    body: JSON.stringify(team)
      			});
      			const data = await res.json();4
            }catch(err){
                console.error(err);
            }
        }
        if(op=="new"){
            let tmpdat={"id": team.players.at(-1).id + 1,"name": "","main_id": "","role": "","extra": ""}
           team.players =[...team.players, tmpdat];
        }
    }
    async function deleteEntry(id) {
        let tmpdat= team.players;
        tmpdat.splice(id-1,1);
        let p_id = 1;
        for(const player of tmpdat){
            player.id = p_id;
            p_id++;
        }
        team.players = [...tmpdat];
    }


</script>

{#if team != null}
<div class="flex w-full justify-between h-[48px]">
<span class="text-white text-2xl text-center">{filename}</span>
<div class="flex w-[300px] gap-1 pt-2">
    <button class="w-full h-[50px] text-white bg-red-700 rounded-lg " onclick={()=>handleclick("cancel")}> Cancel </button>
    <button class="w-full h-[50px] text-white bg-[#35a653] rounded-lg " onclick={()=>handleclick("save")}> Save </button>
</div>
</div>
<div class="flex w-full h-fit items-center gap-2">
<Textfield placeholdertxt="Team Name" width={400} height={50} bind:value={team.name}></Textfield>
<Textfield placeholdertxt="Team Short" width={200} height={50} bind:value={team.name_short}></Textfield>
<Textfield placeholdertxt="Team Logo url" width={500} height={50} bind:value={team.logo}></Textfield>
<img class="h-[128px]" src={team.logo} alt=""/>
</div>

<div class="flex flex-col w-full h-fit gap-1">
    {#each team.players as player}
    <div class="w-[80%] bg-[#282828] border border-black rounded-lg">
    <div class="flex items-center justify-center m-2">
        <Textfield placeholdertxt="Spieler Name" width={400} height={50} bind:value={player.name}></Textfield>
        <Textfield placeholdertxt="Spieler extra info" width={400} height={50} bind:value={player.extra}></Textfield>
        <Textfield placeholdertxt="Spieler Roles" width={400} height={50} bind:value={player.role}></Textfield>
        <DropdownMenu list={$heros} nulltext="Select a Hero" bind:value={player.main_id} width={100} height={50}></DropdownMenu>
        {#if player.id > 5}
        <button class="w-[40px] h-[40px] text-white bg-[#35a653] rounded-lg " onclick={()=>deleteEntry(player.id)}> Delete </button>
        {/if}
    </div>

    </div>
{/each}
{#if team.players.at(-1).id < 10}
    <button class="w-[80%] h-[50px] bg-[#282828] border border-dashed border-black items-center justify-center rounded-lg" onclick={()=>handleclick("new")}>
<span class="text-black text-4xl">+</span>
    </button>
{/if}
</div>
{/if}
