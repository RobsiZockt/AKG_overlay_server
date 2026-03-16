<script>
    let { placeholdertxt = "", value = $bindable(""), width=100, height=50} = $props();
    

</script>

<input class="flex p-3 text-base" style="width: {width}px; height: {height}px;" placeholder={placeholdertxt.toString()} bind:value/>
