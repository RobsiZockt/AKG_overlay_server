<script>
    import Textfield from "$lib/assets/cast/Textfield.svelte";
    import BoxText from "$lib/assets/wrapper/BoxText.svelte";
    import Button from "$lib/assets/Button.svelte";

		let red = $state({name:"",short:"",logo:""}), blue = $state({name:"",short:"",logo:""});
		let caster1 = $state({name:"", social:""});
		let caster2 = $state({name:"", social:""});
		let caster3 = $state({name:"", social:""});
		let cast_uri = $state("");
		const sep = "\u241F";

		async function send(team, action, value) {
			 try {
    

      const res = await fetch(`/api/uv/matchup/${action}/${team}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
				body: JSON.stringify({payload: value}),
      });

      const data = await res.json();

    } catch (err) {
      console.error("Request failed:", err);
		}
	}
	function b64EncodeUnicode(str) { return encodeURIComponent(btoa(String.fromCharCode(...new TextEncoder().encode(str))))}


	function handleClick(){
		if(caster3.name!=""){ 
			const arg = caster1.name+sep+caster1.social+sep+caster2.name+sep+caster2.social+sep+caster3.name+sep+caster3.social;
			cast_uri = `https://overlay.robsizockt.de/3-cam-cast/uv?v=${b64EncodeUnicode(arg)}`;
		} else {
			const arg = caster1.name+sep+caster1.social+sep+caster2.name+sep+caster2.social;
			cast_uri = `https://overlay.robsizockt.de/2-cam-cast/uv?v=${b64EncodeUnicode(arg)}`;}
		console.log(cast_uri);
	}
</script>

<div class="flex w-full h-[100vh] bg-[#2b2d30] gap-2">
	<div class="flex flex-col w-[50%] gap-3">
    <BoxText title="Blue Team">
    	<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Name</span>
				<Textfield placeholdertxt="Team name" bind:value={blue.name} onBlur={()=>send("blue","setname", blue.name)} width={300}></Textfield>
			</div>
			<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Short</span>
				<Textfield placeholdertxt="Short name" bind:value={blue.short} onBlur={()=>send("blue","setshort", blue.short)} width={300}></Textfield>
			</div>
			<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Logo URI</span>
				<Textfield placeholdertxt="Logo Link" bind:value={blue.logo} onBlur={()=>send("blue","setlogo", blue.logo)} width={300}></Textfield>
			</div>
    </BoxText>
		<Button text="Add Point" apiPath="/api/uv/matchup/add/blue" height="h-[80px]" method="PUT"></Button>
		<Button text="Remove Point" apiPath="/api/uv/matchup/sub/blue" height="h-[80px]" method="PUT"></Button>
	</div>
<!--RED SIDE-->
	<div class="flex flex-col w-[50%] gap-3">
    <BoxText title="Red Team">
    	<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Name</span>
				<Textfield placeholdertxt="Team name" bind:value={red.name} onBlur={()=>send("red","setname", red.name)} width={300}></Textfield>
			</div>
			<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Short</span>
				<Textfield placeholdertxt="Short name" bind:value={red.short} onBlur={()=>send("red","setshort", red.short)} width={300}></Textfield>
			</div>
			<div class="flex items-center gap-2">
        <span class="text-white text-xl text-center">Logo URI</span>
				<Textfield placeholdertxt="Logo Link" bind:value={red.logo} onBlur={()=>send("red","setlogo", red.logo)} width={300}></Textfield>
			</div>
    </BoxText>
		<Button text="Add Point" apiPath="/api/uv/matchup/add/red" height="h-[80px]" color="bg-red-700" method="PUT"></Button>
		<Button text="Remove Point" apiPath="/api/uv/matchup/sub/red" height="h-[80px]" color="bg-red-700" method="PUT"></Button>
	</div>
	<BoxText title="Caster Setup">
        <div class="flex w-full gap-1 h-fit pb-3">
				<p>Caster: </p>
          <Textfield placeholdertxt="Name" bind:value={caster1.name} width={300}></Textfield>
          <Textfield placeholdertxt="Social name" bind:value={caster1.social} width={300}></Textfield>
        </div>
				<div class="flex w-full gap-1 h-fit pb-3">
				<p>Caster: </p>
          <Textfield placeholdertxt="Name" bind:value={caster2.name} width={300}></Textfield>
          <Textfield placeholdertxt="Social name" bind:value={caster2.social} width={300}></Textfield>
        </div>
				<div class="flex w-full gap-1 h-fit pb-3">
				<p>Caster: </p>
          <Textfield placeholdertxt="Name" bind:value={caster3.name} width={300}></Textfield>
          <Textfield placeholdertxt="Social name" bind:value={caster3.social} width={300}></Textfield>
        </div>
			<button
  			on:click={handleClick}
  			class={`px-4 py-1 text-white font-medium bg-orange-300 rounded-lg shadow hover:opacity-90 active:scale-95 transition`}
			>
  GENERATE
</button>
<p>{cast_uri}</p>
	</BoxText>
</div>