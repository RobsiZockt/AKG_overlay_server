<script>
    import DropdownMenu from "$lib/assets/DropdownMenu.svelte";
  import { casters } from "$lib/stores/casters";
    import { teamdata } from "$lib/stores/TeamData";
  import { onMount } from "svelte";
  import Textfield from "../Textfield.svelte";
  import TimeField from "../TimeField.svelte";
  import BoxText from "$lib/assets/wrapper/BoxText.svelte";

    onMount(()=> {teamdata.load();casters.load()});
    let first_team = $state(0);
    let second_team = $state(0);
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
    {#if casters!=null}
      {#each $casters as caster}
        <div class="flex w-full gap-1 h-fit pb-3">
				<p>Caster: </p>
          <Textfield placeholdertxt="Name" bind:value={caster.name} width={300}></Textfield>
          <Textfield placeholdertxt="Social name" bind:value={caster.social} width={300}></Textfield>
          <Textfield placeholdertxt="social ico" bind:value={caster.social_ico}></Textfield>
        </div>
      {/each}
    {/if}
  </div>
</BoxText>
<BoxText title="Timer Setup">
  <div class="flex">
 		<p>Start Time:</p>
    <TimeField hours="" minutes=""></TimeField>
 	</div>
</BoxText>
<BoxText title="Ruleset (very WIP)">
	<p>The Ruleset system will come soonTM</p>
</BoxText>
</div>