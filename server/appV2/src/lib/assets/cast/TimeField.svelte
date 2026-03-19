<script>
    let { width = 140, height = 50 ,hours = $bindable(""), minutes = $bindable("")} = $props();


    let hoursRef;
    let minutesRef;

    function handleHoursInput(e) {
        let val = e.target.value.replace(/\D/g, "").slice(0, 2);

        if (val.length === 2) {
            let h = Math.min(parseInt(val), 23);
            hours = String(h).padStart(2, "0");
            minutesRef?.focus();
        } else {
            hours = val;
        }
    }

    function handleMinutesInput(e) {
        let val = e.target.value.replace(/\D/g, "").slice(0, 2);

        if (val.length === 2) {
            let m = Math.min(parseInt(val), 59);
            minutes = String(m).padStart(2, "0");
        } else {
            minutes = val;
        }
    }

</script>

<!-- Wrapper acts as the "single input" -->
<div
    class="flex items-center shrink-0 border rounded px-2 focus-within:ring-2 focus-within:ring-blue-500"
    style="width: {width}px; height: {height}px;"
>
    <!-- HH -->
    <input
        class="w-full text-center outline-none border-none bg-transparent"
        placeholder="HH"
        bind:value={hours}
        bind:this={hoursRef}
        oninput={handleHoursInput}
        maxlength="2"
        inputmode="numeric"
        onfocus={(e) => e.target.select()}
    />

    <span class="px-1 select-none">:</span>

    <!-- MM -->
    <input
        class="w-full text-center outline-none border-none bg-transparent"
        placeholder="MM"
        bind:value={minutes}
        bind:this={minutesRef}
        oninput={handleMinutesInput}
        maxlength="2"
        inputmode="numeric"
        onfocus={(e) => e.target.select()}
        onkeydown={(e) => {
            if (e.key === "Backspace" && !minutes) {
                hoursRef?.focus();
            }
        }}
    />
</div>

