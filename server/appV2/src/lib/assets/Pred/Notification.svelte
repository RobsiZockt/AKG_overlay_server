<script>
    let {type,color,text} = $props();
</script>



<div class='flex items-center gap-2 font-mono text-sm text-{color||"gray"}-300 bg-{color||"gray"}-400/10 border border-{color||"gray"}-400/40 rounded px-3 py-1'>
    <span class="font-bold tracking-widest">{type.toUpperCase()}</span>
    <span class="text-{color||"gray"}-200/70">– {text}</span>
</div>

