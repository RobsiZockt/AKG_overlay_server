<script>
    import DropdownMenu from "$lib/assets/DropdownMenu.svelte";
  import { casters } from "$lib/stores/casters";
    import { teamdata } from "$lib/stores/TeamData";
  import { onMount } from "svelte";
  import Textfield from "../Textfield.svelte";

    onMount(()=> {teamdata.load();casters.load()});
    let first_team = $state(0);
    let second_team = $state(0);
</script>

<div class="flex flex-col w-full h-full items-center">
<p>SELECT TEAMS</p>
    <div class="flex w-[80%]">
        <DropdownMenu list={$teamdata} bind:value={first_team} nulltext="First named team" ></DropdownMenu>
        <DropdownMenu list={$teamdata} bind:value={second_team} nulltext="Second named team" ></DropdownMenu>
    </div>
    <p>Caster Setup</p>
    <div class=" w-[80%] h-fit">
    {#if casters!=null}
        {#each $casters as caster}
            <div class="flex w-full h-fit">
                <Textfield placeholdertxt="Name" bind:value={caster.name}></Textfield>
                <Textfield placeholdertxt="Social name" bind:value={caster.social}></Textfield>
                <Textfield placeholdertxt="social ico" bind:value={caster.social_ico}></Textfield>
            </div>
        {/each}
    {/if}
    </div>

</div>