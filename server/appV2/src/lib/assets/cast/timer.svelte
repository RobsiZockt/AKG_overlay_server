<script>
//@ts-nocheck
  import { onMount, onDestroy } from "svelte";

  export let delayMinutes = 3;
  export let intervalMs = 50; // faster so ms actually change

  const colorMap = {
    live: "text-red-700",
    build_delay: "text-yellow-400",
    default: "text-white"
  };

  let live = new Date();
  let delayed = new Date();

  let liveColor = colorMap.default;
  let delayColor = colorMap.default;

  function pad(n, l = 2) {
    return String(n).padStart(l, "0");
  }

  function formatWithMs(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }

  function computeColors() {
    if (live.getHours() >= 20 && live.getHours() < 23)
      liveColor = colorMap.live;
    else if (live.getHours() === 19 && live.getMinutes() >= 50)
      liveColor = colorMap.build_delay;
    else
      liveColor = colorMap.default;

    if (delayed.getHours() >= 20 && delayed.getHours() < 23)
      delayColor = colorMap.live;
    else if (delayed.getHours() === 19 && delayed.getMinutes() >= 50)
      delayColor = colorMap.build_delay;
    else
      delayColor = colorMap.default;
  }

  let interval;

  onMount(() => {
    interval = setInterval(() => {
      const now = new Date();

      live = new Date(now);
      delayed = new Date(now.getTime() - delayMinutes * 60 * 1000);

      computeColors();
    }, intervalMs);
  });

  onDestroy(() => clearInterval(interval));
</script>

<div class="lex flex-col items-center justify-center p-1 font-mono">
  <div class={`flex text-2xl font-bold items-center justify-center ${liveColor}`}>
    {formatWithMs(live)}
  </div>

  <div class={`flex text-lg font-bold items-center justify-center ${delayColor}`}>
    {formatWithMs(delayed)}
  </div>
</div>