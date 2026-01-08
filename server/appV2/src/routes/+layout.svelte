<script>
	import './layout.css';
 	import "../app.css";
	export let data;
	//import {sse} from '$lib/stores/createSSEStore'

  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {;
	//sse.connect();
  });

  onDestroy(() => {
  });


</script>

<!-- src/routes/+layout.svelte -->

{#if data.isCaster}
	<div style="border: 3px solid red; padding: 1rem;">
		<h2>Admin Layout</h2><slot></slot>
	</div>
{:else if data.isPublic}
	<div style="border: 3px solid green; padding: 1rem;">
		<h2>Public Layout</h2><slot></slot>
	</div>
{:else if data.isOverlay}
<div><slot></slot></div>
{:else}
	<div style="border: 3px solid gray; padding: 1rem;">
		<h2>Unknown host</h2><slot></slot>
	</div>
{/if}
