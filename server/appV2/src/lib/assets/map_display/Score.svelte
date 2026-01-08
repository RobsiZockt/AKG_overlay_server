<script>
    //@ts-nocheck
    export let blue_score;
    export let red_score;

    $: red = Number(red_score);
    $: blue = Number(blue_score);
    let winner;

    $: if(red > blue) winner="red";
    else if (red < blue) winner="blue";
    else winner="nan";

    
    </script>

    <div class="relative h-[100px] flex items-center justify-center w-full top-9/16">
        <div class=" flex items-center justify-center rounded-lg"><!--bg-[#000000aa] pr-2 pt-2-->
            <span class="ml-2 drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] font-[teko] text-5xl text-white items-center justify-center filter {winner === "red" ? "brightness-50" : ""}">{blue}</span>
            <span class="ml-2 drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] font-[teko] text-5xl text-white items-center justify-center">:</span>
            <span class="ml-2 drop-shadow-[0_1.4px_1.4px_rgba(0,0,0,0.8)] font-[teko] text-5xl text-white items-center justify-center filter {winner === "blue" ? "brightness-50" : ""}">{red}</span>
        </div>
    </div>
