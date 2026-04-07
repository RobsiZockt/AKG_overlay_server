<script>
  export let open = false;
  export let width = 300;     // px
  export let height = 60;     // px
  export let color = '#ffaa00';
  export let duration = 600; // ms
</script>

<div
  class="box"
  style="
    --w: {width}px;
    --h: {height}px;
    --c: {color};
    --d: {duration}ms;
  "
>
  <!-- Content -->
  <div class="content">
    <slot />
  </div>

  <!-- Covers -->
  <div class="cover left" class:open></div>
  <div class="cover right" class:open></div>
</div>

<style>
.box {
  position: relative;
  width: var(--w);
  height: var(--h);
  overflow: hidden;
}


.content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}


.cover {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background: var(--c);
  transition: transform var(--d)
    cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

/* Initial (closed) state */
.left {
  left: 0;
  transform: translateX(0);
}

.right {
  right: 0;
  transform: translateX(0);
}

/* Open state */
.left.open {
  transform: translateX(-100%);
}

.right.open {
  transform: translateX(100%);
}
</style>
