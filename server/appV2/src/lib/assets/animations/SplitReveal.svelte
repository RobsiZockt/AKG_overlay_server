<script>
  export let open = false;
  export let width = 260;     // center width in px
  export let duration = 2000;  // ms
</script>

<div
  class="split-root"
  style="--duration: {duration}ms"
>
  <div class="side left" class:open></div>

  <div
    class="center"
    class:open
    style="--target-width: {width}px"
  >
    <div class="content">
      <slot />
    </div>
  </div>

  <div class="side right" class:open></div>
</div>

<style>
.split-root {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  background: #ffaa00;
}

/* Orange sides */
.side {
  width: 10px;
  background: #ffaa00;
  transition: transform var(--duration)
    cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.left.open {
  transform: translateX(-100%);
}

.right.open {
  transform: translateX(100%);
}

/* Center reveal */
.center {
  background: #000000cc;
  overflow: hidden;
  max-width: 0;
  transition: max-width var(--duration)
    cubic-bezier(0.22, 1, 0.36, 1);
  will-change: max-width;
}

/* OPEN STATE */
.center.open {
  max-width: var(--target-width);
}

/* Text wrapper */
.content {
  white-space: nowrap;        
  display: flex;
  align-items: center;
  padding: 0.5rem;
}
</style>