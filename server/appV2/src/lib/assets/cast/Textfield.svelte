<script>
    let { placeholdertxt = "", value = $bindable(""), width=100, height=50, onBlur=()=>{}} = $props();

function test(){
    onBlur();
}
</script>

<input class="flex shrink-0 p-3 text-base" style="width: {width}px; height: {height}px;" placeholder={placeholdertxt.toString()} bind:value onblur={()=>test()}/>
