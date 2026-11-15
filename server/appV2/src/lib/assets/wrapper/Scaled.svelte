<script>
  let { children, width = 800, height = 500 } = $props();

  let cellWidth = $state(width);
  let scale = $derived(cellWidth / width);
</script>

<!-- the outer box takes the space in the grid; aspect ratio keeps the height in sync -->
<div
  class="relative overflow-hidden"
  style:aspect-ratio="{width} / {height}"
  bind:clientWidth={cellWidth}
>
  <!-- the inner box keeps its original 800x500 and is scaled visually -->
  <div
    class="absolute top-0 left-0 origin-top-left"
    style:width="{width}px"
    style:height="{height}px"
    style:transform="scale({scale})"
  >
    {@render children()}
  </div>
</div>