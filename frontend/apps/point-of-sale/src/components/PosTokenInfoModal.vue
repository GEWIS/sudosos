<template>
  <Dialog
    ref="dialog"
    v-model:visible="visible"
    :draggable="false"
    header="POS Token Info"
    modal
    :pt="{
      root: { class: 'w-full max-w-md' },
    }"
    @show="addListenerOnDialogueOverlay(dialog)"
  >
    <div v-if="tokenInfo" class="text-sm">
      <div class="flex justify-between gap-4 mb-3">
        <div class="flex-1">
          <div class="font-semibold text-gray-600 mb-1">POS ID</div>
          <div class="text-gray-900">{{ tokenInfo.posId }}</div>
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-600 mb-1">Expires</div>
          <div class="text-gray-900">{{ tokenInfo.expiresIn }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ tokenInfo.expiresAt }}</div>
        </div>
      </div>
      <div class="flex justify-between gap-4 mb-3">
        <div class="flex-1">
          <div class="font-semibold text-gray-600 mb-1">POS User ID</div>
          <div class="text-gray-900">{{ tokenInfo.posUserId || 'N/A' }}</div>
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-600 mb-1">POS Owner ID</div>
          <div class="text-gray-900">{{ tokenInfo.posOwnerId || 'N/A' }}</div>
        </div>
      </div>
      <div v-if="tokenInfo.owner" class="mb-3">
        <div class="font-semibold text-gray-600 mb-1">Owner</div>
        <div class="text-gray-900">{{ tokenInfo.owner }}</div>
      </div>
    </div>
    <div v-else class="text-gray-500 text-sm">No token information available</div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { jwtDecode } from 'jwt-decode';
import Dialog from 'primevue/dialog';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { BasePointOfSaleInfoResponse } from '@sudosos/sudosos-client';
import { usePosToken } from '@/composables/usePosToken';
import { usePointOfSaleStore } from '@/stores/pos.store';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { getPosToken } = usePosToken();
const posStore = usePointOfSaleStore();

const dialog = ref();

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

interface TokenInfo {
  posId: number | null;
  expiresIn: string;
  expiresAt: string;
  owner: string | null;
  posUserId: number | null;
  posOwnerId: number | null;
}

const tokenInfo = computed<TokenInfo | null>(() => {
  const token = getPosToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<{
      exp: number;
      user: { id: number; pointOfSale: BasePointOfSaleInfoResponse & { owner?: { id: number } } };
    }>(token);
    const posId = decoded.user.pointOfSale.id || null;
    const posUserId = decoded.user.id || null;
    const posOwnerId = decoded.user.pointOfSale.owner?.id || null;
    const exp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const expiresInMs = exp - now;

    let expiresIn: string;
    if (expiresInMs < 0) {
      expiresIn = 'Expired';
    } else {
      const minutes = Math.floor(expiresInMs / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        expiresIn = `${days} day${days !== 1 ? 's' : ''}`;
      } else if (hours > 0) {
        expiresIn = `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else if (minutes > 0) {
        expiresIn = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        expiresIn = 'Less than a minute';
      }
    }

    const expiresAt = new Date(exp).toLocaleString();

    // Get owner name from store if available
    const associates = posStore.getPointOfSaleAssociates;
    const ownerMember = associates?.find((a) => a.type === 'owner');
    const owner = ownerMember ? `${ownerMember.firstName} ${ownerMember.lastName}` : null;

    return {
      posId,
      expiresIn,
      expiresAt,
      owner,
      posUserId,
      posOwnerId,
    };
  } catch {
    return null;
  }
});
</script>
