<script>
    import { playedMaps } from "$lib/stores/playedMapsUpdate";
    import Button from "../Button.svelte";
</script>

<Button text={"+"} apiPath={'/api/api/played_maps/1/blue/add'} method={"POST"}/>