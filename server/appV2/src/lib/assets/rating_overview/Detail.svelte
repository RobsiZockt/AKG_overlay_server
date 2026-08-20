<script>
    let {head_txt,value} = $props();
</script>

<div class="w-1/4 h-full p-3">
    <div class="w-full h-full border-[#ffaa00] border-2">
        <div class="w-full h-1/4 border-[#ffaa00] border-b-2 flex items-center justify-center">
            <span class="font-[Cascadia Mono] text-white text-2xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2">{head_txt}</span>
        </div>
        <div class="w-full h-3/4 flex items-center justify-center">
            <span class="font-[Cascadia Mono] text-yellow-300 text-3xl drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] whitespace-pre font-mono p-2">{value}</span>
        </div>
    </div>
</div>