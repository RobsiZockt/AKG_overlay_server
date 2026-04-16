<script>
import { page } from "$app/state";
import soloplan from "$lib/assets/logos/Soloplan_wide.png";

const bg = $derived(page.url.searchParams.get('bg'));

let conf = $state("");
if(bg=="black") conf = "m-0 p-0 flex w-[1024px] h-[343px] overflow-hidden justify-center bg-[#282828ee]";
if(bg=="nobg")  conf = "m-0 p-0 flex w-[1024px] h-[343px] overflow-hidden justify-center";
</script>

<div class={conf}>
    <img src={soloplan} alt="" class="h-[95%] w-[90%] bg-contain bg-no-repeat "/>
</div>
