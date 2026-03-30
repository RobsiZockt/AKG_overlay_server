<script>
//@ts-nocheck
  import { onMount, onDestroy } from "svelte";
  import { stream_config } from "$lib/stores/stream_config";

  let delayMinutes = $state(3);
  let intervalMs = $state(50); // faster so ms actually change
  let starttime = $state([0,0]);
  let preptime = $state([0,0]);

  const colorMap = {
    live: "text-red-700",
    build_delay: "text-yellow-400",
    default: "text-white"
  };

  let live = $state(new Date());
  let delayed = $state(new Date());

  let liveColor = $state(colorMap.default);
  let delayColor = $state(colorMap.default);

  $effect(()=>{
    if($stream_config.starttime == null) return;
    const tmp = $stream_config.starttime.split(":");
    starttime[0]=parseInt(tmp[0]);
    starttime[1]=parseInt(tmp[1]);

    preptime[0]=parseInt(tmp[0]);
    let comp= parseInt(tmp[1])- parseInt($stream_config.preptime);
    preptime[1] = comp;
    if(comp<0){
      preptime[1] = comp+60;
      preptime[0] = parseInt(tmp[0]) -1;
    }

  })

  function pad(n, l = 2) {
    return String(n).padStart(l, "0");
  }

  function formatWithMs(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }

  function computeColors() {
    if (live.getHours() > starttime[0] && live.getHours() < 23)
      liveColor = colorMap.live;
    else if(live.getHours() == starttime[0] && live.getMinutes() >= starttime[1])
      liveColor = colorMap.live;
    else if(live.getHours() == starttime[0] && live.getMinutes() == starttime[1]-1 && live.getSeconds() <=50 && live.getSeconds()%2 ==1)
      liveColor=colorMap.live;
    else if(live.getHours() == starttime[0] && live.getMinutes() == starttime[1]-1 && live.getSeconds() >=50 && live.getSeconds() <55 && live.getMilliseconds()>=500)
      liveColor=colorMap.live;
    else if(live.getHours() == starttime[0] && live.getMinutes() == starttime[1]-1 && live.getSeconds() >=55 && parseInt(((live.getMilliseconds()/100)%4)%2) ==1)
      liveColor=colorMap.live;
    else if (live.getHours() > preptime[0])
      liveColor = colorMap.build_delay;
    else if(live.getHours() == preptime[0] && live.getMinutes() >=preptime[1])
      liveColor = colorMap.build_delay;
    else
      liveColor = colorMap.default;

    if (delayed.getHours() > starttime[0] && delayed.getHours() < 23)
    delayColor = colorMap.live;
    else if(delayed.getHours() == starttime[0] && delayed.getMinutes() >= starttime[1])
      delayColor = colorMap.live;
    else if(delayed.getHours() >preptime[0])
      delayColor = colorMap.build_delay;
    else if (delayed.getHours() == preptime[0] && delayed.getMinutes() >= preptime[1])
      delayColor = colorMap.build_delay;
    else
      delayColor = colorMap.default;
  }

  let interval;

  onMount(() => {
    stream_config.load();
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