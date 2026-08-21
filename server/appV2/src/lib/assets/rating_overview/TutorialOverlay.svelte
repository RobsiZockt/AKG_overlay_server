<script>
//@ts-ignore
    let {open = $bindable(true)} = $props();

    function close(){
        open=false;
    }
    function handleKeyDown(event){
        if (event.key == "Escape")
        close();
    }
</script>

<svelte:window onkeydown={handleKeyDown}></svelte:window>

{#if open}
<!-- svelte-ignore a11y_click_events_have_key_events (because of reasons)-->
 <!-- svelte-ignore a11y_no_static_element_interactions (because of reasons)-->
  <div class="fixed inset-0 z-50 flex items-center justify-center" onclick={close}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
 <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
      class=" relative p-2 bg-gray-400 rounded-lg"
      role="dialog"
      aria-modal="true"
      onclick={(event) => event.stopPropagation()}
    >
      <button type="button" onclick={close} class="absolute right-3 top-3 rounded-md p-1 text-2xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900">
        Close
      </button>

      <h2 class="mb-2 text-xl font-semibold">Was ist das</h2>

      <p>PRE-ALPHA BUILD</p>
      <p>This Rating System is based on a modified Glicko2 Algorithm using Map specific rating to determie who will win </p>
      <p>This also accounts who picked the map and expects, with two identical Teams, that the team picking the map will win slightly</p>
      <h3 class="mb-2 text-l font-semibold">Interaktion</h3>
      <p>Klickt einfach auf das jeweilige Team von dem ihr weitere Stats wie u.a. Maps Won / Lost wissen wollt</p>
      <h3 class="mb-2 text-l font-semibold">How to Read</h3>
      <p>Rating is das Rating eines Teams, guess what</p>
      <p>RD ist die halbe Abweichung dieses Ratings, heist ein Team kann ein Rating von Rating +/- 2*RD haben</p>
      <p>Games: Anzahl der gespielten Maps, die für das aktuelle Rating einbezogen werden</p>
      <p>Mehr Stats kommen sobald ich die Queries dafür fertig geschrieben habe</p>
      <p>Falls ihr noch Ideen für Stats hab, let me know :3 </p>
    </div>
  </div>
{/if}