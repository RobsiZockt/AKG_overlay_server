<script>
let {matchData} = $props();
$effect(()=>console.log(matchData));

</script>

    <div class="relative flex h-[128px] w-[2000px] items-start justify-center z-2 bg-[#1e1e1e] rounded-lg border-2 border-[#ffaaaa]">
        <div class="flex w-[45%] h-full items-center justify-start pr-1">
            <img src={matchData.blue_logo} alt="" class="h-[96px] object-contain"/>
            <span class="text-white text-7xl pl-9">{matchData.blue}</span>

        </div>
        <div class="flex w-[6%] h-full items-center justify-center px-2">
            <span class="text-white text-7xl ">{matchData.blue_score}</span>
            <span class="text-white text-7xl px-1">:</span>
            <span class="text-white text-7xl ">{matchData.red_score}</span>
        </div>
        <div class="flex w-[45%] h-full items-center justify-end pl-1">

            <span class="text-white text-7xl pr-9">{matchData.red}</span>
            <img src={matchData.red_logo} alt="" class="h-[96px] object-contain"/>
        </div>
    </div>