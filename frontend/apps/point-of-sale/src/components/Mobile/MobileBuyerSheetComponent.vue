<template>
  <MobileSheetComponent v-model:visible="visible" title="Who pays?" @show="onShow">
    <div class="flex flex-col gap-3 pb-2">
      <label class="search">
        <i class="pi pi-search" />
        <input v-model="searchValue" autocomplete="off" placeholder="Name or nickname" type="text" />
      </label>

      <div class="nfc-hint">
        <i class="pi pi-id-card text-xl" />
        <div>
          <div class="font-semibold">Scan member card</div>
          <div class="text-sm">Hold the card to the reader</div>
        </div>
      </div>

      <div class="section-label">{{ searchValue ? 'Results' : 'Recent at this till' }}</div>
      <div class="flex flex-col">
        <button
          v-for="user in results"
          :key="user.id"
          class="buyer-row"
          :disabled="!canCharge(user)"
          type="button"
          @click="select(user)"
        >
          <span class="avatar" :class="{ underage: isUnderage(user) }">{{ initials(user) }}</span>
          <span class="flex-1 min-w-0 text-left">
            <span class="flex items-center gap-2">
              <span class="font-semibold truncate">{{ fullName(user) }}</span>
              <span v-if="isUnderage(user)" class="age-tag">18−</span>
            </span>
            <span class="block text-sm opacity-70 truncate">{{ subtitle(user) }}</span>
          </span>
          <i class="pi pi-chevron-right opacity-50" />
        </button>
        <div v-if="results.length === 0" class="py-4 text-center opacity-60">
          {{ searchValue ? 'No one found' : 'No recent buyers yet' }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        v-if="!settings.isBorrelmode && authStore.user"
        class="w-full py-3"
        outlined
        @click="select(authStore.user)"
      >
        Charge yourself ({{ authStore.user.firstName }})
      </Button>
      <Button v-else-if="settings.isBorrelmode" class="w-full py-3" outlined @click="select(null)">
        <i class="pi pi-credit-card" />
        No one, pay by card
      </Button>
    </template>
  </MobileSheetComponent>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { UserResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import MobileSheetComponent from '@/components/Mobile/MobileSheetComponent.vue';
import { useUserSearch } from '@/composables/useUserSearch';
import { useCartStore } from '@/stores/cart.store';
import { useSettingStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';
import { formatDineroObjectToString } from '@/utils/FormatUtils';

const visible = defineModel<boolean>('visible', { required: true });
const emit = defineEmits<{ selected: [] }>();

const cartStore = useCartStore();
const authStore = useAuthStore();
const settings = useSettingStore();
const { searchValue, results, recent, loadRecent } = useUserSearch();

// Balances of recent buyers, so the seller sees who is low before charging.
const RECENT_BALANCES = 10;
const balances = ref(new Map<number, string>());
watch(recent, (users) => {
  users.slice(0, RECENT_BALANCES).forEach((user) => {
    void apiService.balance.getBalanceId({ id: user.id }).then((res) => {
      balances.value.set(user.id, formatDineroObjectToString(res.data.amount));
    });
  });
});

const onShow = () => {
  searchValue.value = '';
  void loadRecent();
};

// Borrel-mode recent buyers come from transactions and are BaseUserResponses at
// runtime, so type, active, ofAge and nickname can all be missing.
const AGED_TYPES = ['MEMBER', 'LOCAL_USER', 'LOCAL_ADMIN'];
const isUnderage = (user: UserResponse) => user.ofAge === false && AGED_TYPES.includes(user.type);
const canCharge = (user: UserResponse) => user.active !== false && user.acceptedToS !== 'NOT_ACCEPTED';

const initials = (user: UserResponse) => `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
const fullName = (user: UserResponse) =>
  `${user.firstName}${user.nickname ? ` "${user.nickname}"` : ''} ${user.lastName}`.trim();

const subtitle = (user: UserResponse) => {
  const balance = balances.value.get(user.id);
  if (!searchValue.value && balance) return balance;
  if (user.memberId) return `Member ${user.memberId}`;
  if (user.type === 'LOCAL_USER') return 'Local account';
  return user.type ? user.type.toLowerCase().replace(/_/g, ' ') : '';
};

const select = async (user: UserResponse | null) => {
  if (user && !canCharge(user)) return;
  visible.value = false;
  await cartStore.setBuyer(user);
  emit('selected');
};
</script>

<style scoped lang="scss">
.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--p-surface-300);
  border-radius: var(--p-button-border-radius);
  background: var(--p-surface-50);

  &:focus-within {
    border-color: var(--p-primary-color);
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    outline: none;
  }
}

.nfc-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--p-primary-color) 35%, transparent);
  border-radius: var(--p-button-border-radius);
  background: color-mix(in srgb, var(--p-primary-color) 8%, white);
  color: var(--p-primary-color);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.buyer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--p-surface-200);

  &:disabled {
    opacity: 0.35;
  }
}

.avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 700;

  &.underage {
    background: #f59e0b;
  }
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
