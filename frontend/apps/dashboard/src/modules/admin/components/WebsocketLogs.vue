<template>
  <VirtualScroller
    :key="logs.length"
    class="font-mono rounded-lg p-2 overflow-y-auto"
    :item-size="28"
    :items="logs"
    style="height: 340px; background: var(--p-primary-color); color: var(--p-primary-inverse-color)"
  >
    <template #item="{ item }">
      <div
        class="log-line whitespace-pre-wrap px-2 py-1 transition-colors"
        style="border-color: var(--p-primary-inverse-color)"
      >
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        [{{ dateToTimeString(item.time) }}] {{ item.message }}
      </div>
    </template>
  </VirtualScroller>
</template>

<script setup lang="ts">
import { useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import { storeToRefs } from 'pinia';
import { dateToTimeString } from 'sudosos-dashboard/src/utils/formatterUtils';

const webSocketStore = useWebSocketStore();
const { logs } = storeToRefs(webSocketStore);
</script>

<style scoped lang="scss">
.log-line {
  cursor: pointer;
}

.log-line:hover {
  background: linear-gradient(rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0.21)), var(--p-primary-color);
}
</style>
