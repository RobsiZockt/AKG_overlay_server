<script>
    let {title ="", color=""} = $props();
</script>

<style>

	.boxed {
  position: relative;
  border: 2px solid #333;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

.boxed-title {
  position: absolute;
  top: 0;
  left: 20px;
  transform: translateY(-50%);
  background: #2b2d30; /* match your page background */
  padding: 0 10px;
  font-weight: bold;
  font-size: 14px;
}

</style>

<div class="boxed">
  <span class="boxed-title">{title}</span>
  <div class="boxed-content">
   <slot></slot>
  </div>
</div>