<template>
  <div class="fixed top-0 left-0 w-full h-full flex justify-center items-center auth-screen">
    <!-- Auth Screen (Not Authenticated) -->
    <main v-if="!userIsAuthenticated">
      <div class="block mx-auto mb-5 max-h-[25rem] w-64 h-64 flex items-center justify-center">
        <div v-if="session" class="w-full h-full flex items-center justify-center">
          <a v-if="qrCodeDataUrl" :href="session.qrCodeUrl" rel="noopener noreferrer" target="_blank">
            <img alt="QR Code" class="w-full h-full object-contain" :src="qrCodeDataUrl" />
          </a>
          <div
            v-else
            class="w-full h-full border-2 border-dashed flex flex-col items-center justify-center text-center p-4 qr-error"
          >
            <div class="text-4xl mb-2">📱</div>
            <p class="text-sm mb-2">Something went wrong</p>
          </div>
        </div>
        <img v-else alt="logo" class="w-full h-full object-contain" src="../assets/bier_grayscale.png" />
      </div>
      <div class="font-bold text-3xl text-center mb-4">No POS has been configured!</div>
      <div class="flex justify-center">
        <Button class="px-6 py-3 text-xl font-semibold configure-button" @click="handleConfigure">
          {{ session && !isExpired ? 'Refresh' : 'Configure' }}
        </Button>
      </div>
    </main>

    <!-- POS Selection Screen (Authenticated) -->
    <main v-else>
      <div class="block mx-auto mb-5 max-h-[25rem] w-64 h-64 flex items-center justify-center">
        <img alt="logo" class="w-full h-full object-contain" src="../assets/bier_grayscale.png" />
      </div>
      <div class="font-bold text-3xl text-center mb-4">Select Point of Sale</div>
      <div class="flex flex-col items-center gap-4 w-full max-w-4xl px-4">
        <PosSwitchDisplay
          empty-message="No Point of Sale options available"
          :grouped-pos="groupedPos"
          :loading="loadingPos"
          :on-primary-background="true"
          :show-refresh="true"
          :switching="authenticating"
          @refresh="handleRefresh"
          @select="handleAuthenticatePos"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, watch } from 'vue';
import Button from 'primevue/button';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { useRouter } from 'vue-router';
import PosSwitchDisplay from '@/components/PosSwitchDisplay.vue';
import { useQrAuth } from '@/composables/useQrAuth';
import { usePosToken } from '@/composables/usePosToken';
import { usePointOfSaleSwitch } from '@/composables/usePointOfSaleSwitch';
import { usePointOfSaleOptions } from '@/composables/usePointOfSaleOptions';

const { session, qrCodeDataUrl, generateQrCode, generateQrCodeImage, isExpired } = useQrAuth();
const { hasPosToken } = usePosToken();
const authStore = useAuthStore();
const router = useRouter();

const userIsAuthenticated = computed(() => authStore.getUser !== null);

const handleConfigure = async () => {
  try {
    await generateQrCode();
  } catch (err) {
    console.error('Failed to generate QR code:', err);
  }
};

// POS Selection methods
const { groupedPos, loadingPos, loadPosOptions } = usePointOfSaleOptions();
const { switchToPos, switching: authenticating } = usePointOfSaleSwitch();

const handleRefresh = async () => {
  await loadPosOptions();
};

const handleAuthenticatePos = async (pos: PointOfSaleResponse) => {
  await switchToPos(pos);
  // Redirect to cashier after POS is configured
  // The watcher on hasPosToken will handle navigation automatically
};

onMounted(async () => {
  await nextTick();
  if (!hasPosToken.value && !userIsAuthenticated.value) {
    void generateQrCode();
  } else if (!hasPosToken.value) {
    void loadPosOptions();
  }
  if (session.value) {
    void generateQrCodeImage();
  }
});

watch(
  session,
  async () => {
    await nextTick();
    if (session.value) {
      void generateQrCodeImage();
    }
  },
  { immediate: true },
);

// Watch for authentication state changes
watch(
  userIsAuthenticated,
  async (isAuth) => {
    if (isAuth && !hasPosToken.value) {
      await nextTick();
      void loadPosOptions();
    }
  },
  { immediate: true },
);

// Watch for POS token changes and redirect to cashier when token is available
watch(hasPosToken, (hasToken) => {
  if (hasToken) {
    void router.push({ name: 'cashier' });
  }
});
</script>

<style scoped lang="scss">
.auth-screen {
  background-color: var(--p-primary-color);
  color: var(--p-primary-inverse-color);
}

.qr-error {
  border-color: var(--p-surface-border-color);
  color: var(--p-text-muted-color);
}

.configure-button {
  background-color: var(--p-surface-color);
  color: var(--p-primary-color);
  border: 0;
}
</style>
