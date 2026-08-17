<script>
  export let delay = 200;      // ms
  export let duration = 1000; // ms
  export let offset = "20px";
</script>

<div
  class=" fade-in-right w-full h-full"
  style="animation-delay: {delay}ms; animation-duration: {duration}ms;
  --translate-from : {offset};"
>
  <slot />
</div>

<style>
  .fade-in-right {
    opacity: 0;
    transform: translateX(var(--translate-from));
    animation-name: fadeInRight;
    animation-fill-mode: forwards;
    animation-timing-function: ease;
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(var(--translate-from));
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>