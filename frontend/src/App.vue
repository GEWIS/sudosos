<template>
  <RouterView />
<!--    <img class="image-overlay fullscreen-positioning" src="@/assets/checkout.jpg" alt="Overlay Image" />-->
</template>

<style lang="scss">
@import "@/scss/styles";
.image-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  pointer-events: none;
}

</style>
