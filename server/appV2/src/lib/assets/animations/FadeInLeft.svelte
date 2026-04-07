<script>
  export let delay = 200;      // ms
  export let duration = 1000; // ms
</script>

<div
  class=" fade-in-left h-full"
  style="animation-delay: {delay}ms; animation-duration: {duration}ms;"
>
  <slot />
</div>

<style>
  .fade-in-left {
    opacity: 0;
    transform: translateX(-20px);
    animation-name: fadeInLeft;
    animation-fill-mode: forwards;
    animation-timing-function: ease;
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>