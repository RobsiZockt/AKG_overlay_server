<script>
let matchupData = $props();

</script>

    <div class="relative flex h-[128px] w-[2000px] items-start justify-center z-2 bg-[#1e1e1e] rounded-lg border-2 border-[#ffaaaa]">
        <div class="flex w-[45%] h-full items-center justify-start pr-1">
            <img src={matchupData.blue_logo} alt="" class="h-[96px] object-contain"/>
            <span class="text-white text-7xl pl-9">{matchupData.blue}</span>

        </div>
        <div class="flex w-[6%] h-full items-center justify-center px-2">
            <span class="text-white text-7xl ">{matchupData.blue_score}</span>
            <span class="text-white text-7xl px-1">:</span>
            <span class="text-white text-7xl ">{matchupData.red_score}</span>
        </div>
        <div class="flex w-[45%] h-full items-center justify-end pl-1">

            <span class="text-white text-7xl pr-9">{matchupData.red}</span>
            <img src={matchupData.red_logo} alt="" class="h-[96px] object-contain"/>
        </div>
    </div>