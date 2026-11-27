<template>
  <Drawer
    v-model:visible="visible"
    block-scroll
    class="mobile-sheet"
    position="bottom"
    :show-close-icon="false"
    @show="emit('show')"
  >
    <template #header>
      <div class="w-full">
        <div class="mobile-sheet-handle" />
        <slot name="header">
          <h2 class="text-xl font-bold">{{ title }}</h2>
        </slot>
      </div>
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Drawer>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
const visible = defineModel<boolean>('visible', { required: true });
const emit = defineEmits<{ show: [] }>();
</script>

<!-- Not scoped: the Drawer is teleported to <body>. -->
<style lang="scss">
.p-drawer.mobile-sheet {
  height: auto;
  max-height: 92dvh;
  border-radius: var(--p-button-border-radius) var(--p-button-border-radius) 0 0;

  .p-drawer-header {
    padding: 0.5rem 1rem 0.5rem;
  }

  .p-drawer-content {
    padding: 0 1rem;
  }

  .p-drawer-footer {
    padding: 0.75rem 1rem 1rem;
  }
}

.mobile-sheet-handle {
  width: 2.5rem;
  height: 0.3rem;
  margin: 0 auto 0.75rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-surface-300);
}
</style>
