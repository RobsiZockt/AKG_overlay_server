<script>
    let {data,index} = $props();

</script>

{#if index==0}
<div class="w-full h-full items-center justify-center flex">
    <div class="w-[2px] h-full bg-white"></div>
    <div>
        <div class="h-[2px] w-full bg-white"></div>
        <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rank}</span>
        <div class="h-[2px] w-full bg-white"></div>
    </div>
    <div class="w-[2px] h-full bg-white"></div>
    <div>
        <div class="h-[2px] w-full bg-white"></div>
        <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.name}</span>
        <div class="h-[2px] w-full bg-white"></div>
    </div>
    <div class="w-[2px] h-full bg-white"></div>
    <div>
        <div class="h-[2px] w-full bg-white"></div>
        <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rating}</span>
        <div class="h-[2px] w-full bg-white"></div>
    </div>
    <div class="w-[2px] h-full bg-white"></div>
    <div>
        <div class="h-[2px] w-full bg-white"></div>
        <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rd}</span>
        <div class="h-[2px] w-full bg-white"></div>
    </div>
    <div class="w-[2px] h-full bg-white"></div>
    <div>
        <div class="h-[2px] w-full bg-white"></div>
        <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.games}</span>  
        <div class="h-[2px] w-full bg-white"></div>
    </div>
    <!----><div class="h-[8px]"><!----></div><!---->  
    <div class="w-[2px] h-full bg-white"></div>
</div>
{:else}
<div class="w-full h-full items-center justify-center flex">
    {#if index<10}
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rank}</span>
    {:else}
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rank}</span>
    {/if}
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.name}</span>
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rating}</span>
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.rd}</span>
    <div class="w-[2px] h-full bg-white"></div>
    <span class="font-[Cascadia Mono] text-yellow-300 text-5xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono px-8">{data.games}</span>    
    <div class="w-[2px] h-full bg-white"></div>
</div>
{/if}