<script>
    import Footer from "$lib/assets/Footer.svelte";
    import { page } from "$app/state";
    let s = page.url.searchParams.get("s");
    let ico = page.url.searchParams.get("ico");
    let liga= page.url.searchParams.get("liga");
</script>

<div class="flex w-full h-[100vh] items-end">
<Footer cd_mode={"end"} cd_text={""} sponsor={s=="false"?false:true} ico={ico!=null?ico:""} liga={liga=="false"?false:true} scrolltext={["Der AKgaming ev bedankt sich fürs zuschauen und wünscht einen schönen abend"]}></Footer>
</div> 