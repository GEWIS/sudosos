<template>
  <button class="buyer-chip" :class="{ empty: !buyer, locked: isLocked }" type="button">
    <i class="pi" :class="buyer ? 'pi-user' : 'pi-user-plus'" />
    <span class="truncate">{{ label }}</span>
    <span v-if="buyer && cartStore.buyerBalance" class="balance">{{
      formatDineroObjectToString(cartStore.buyerBalance)
    }}</span>
    <span v-if="buyer && !buyer.ofAge" class="age-tag">18−</span>
    <i v-if="isLocked" class="pi pi-lock text-sm" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import { formatDineroObjectToString } from '@/utils/FormatUtils';

const cartStore = useCartStore();
const authStore = useAuthStore();
const settings = useSettingStore();

const buyer = computed(() => cartStore.getBuyer);
const isLocked = computed(() => !!buyer.value && cartStore.lockedIn?.id === buyer.value.id);

const label = computed(() => {
  if (!buyer.value) return settings.isBorrelmode ? 'Pick buyer' : 'No one';
  if (buyer.value.id === authStore.getUser?.id && !settings.isBorrelmode) return buyer.value.firstName;
  return `${buyer.value.firstName} ${buyer.value.lastName}`;
});
</script>

<style scoped lang="scss">
.buyer-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  max-width: 100%;
  padding: 0.4rem 0.75rem;
  border: 2px solid var(--p-primary-color);
  border-radius: var(--p-button-border-radius);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 600;

  &.empty {
    background: white;
    color: var(--p-primary-color);
    border-style: dashed;
  }
}

.balance {
  opacity: 0.85;
  font-weight: 500;
  white-space: nowrap;
}

.age-tag {
  padding: 0 0.35rem;
  border-radius: var(--p-button-border-radius);
  background: #fde68a;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
