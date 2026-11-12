<script lang="ts">
  let { data } = $props();
  import { goto } from "$app/navigation";
</script>

<svelte:head>
  <title>OW Uniliga Prediction - by RZ</title>
</svelte:head>

<div class="w-full h-dvh bg-[#1e1e1e] flex flex-col overflow-x-hidden overflow-y-auto">
  <div class="h-[40px] w-full flex items-center justify-end">
    <div class="w-auto h-full flex" onclick={()=>{goto('/team_rating')}}>
      <span class="font-[Cascadia Mono] text-gray-300 text-2xl underline drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2"> Team Rating</span>
    </div> 
  </div>
<div class="w-full flex-1 min-h-0 flex flex-col items-center">

<div class="bg-[#1e1e1e] max-w-[1080px]"> 
{#each data.patches as p (p.slug)}
  <article id={p.slug} class="mb-16 px-20">
    <div class="prose prose-patchnotes max-w-none">{@html p.html}</div>
  </article>
{/each}
</div>
</div>
</div>