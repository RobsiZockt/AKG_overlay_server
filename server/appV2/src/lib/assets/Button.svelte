<script>
  export let text = "Click Me";
  export let color = "bg-blue-500";
  export let apiPath = "/api/action";
  export let method = "POST";

  let loading = false;

  async function handleClick() {
    try {
      loading = true;

      const res = await fetch(apiPath, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      loading = false;
    }
  }
</script>

<button
  on:click={handleClick}
  disabled={loading}
  class={`px-4 py-2 text-white font-medium ${color} rounded-lg shadow hover:opacity-90 active:scale-95 transition`}
>
  {text}
</button>