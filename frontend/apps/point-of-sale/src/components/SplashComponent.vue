<template>
  <svg class="image-underlay" viewBox="0 0 624.78 2337.62" xmlns="http://www.w3.org/2000/svg">
    <path class="cls-1" d="m624.78,2337.62c-139.64,0-520.82-669.8-605.58-1531.68C-53.34,68.32,65.19,0,624.78,0" />
  </svg>
</template>

<style scoped>
.cls-1 {
  fill: var(--p-primary-color);
  stroke-width: 0;
}

.image-underlay {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  pointer-events: none;
  z-index: -10;
  overflow: hidden;

  position: fixed;
  top: -25%;
  right: 0;
  height: 175%;
}
</style>
