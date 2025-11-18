<template>
  <AuthLocalCard :header="t('modules.auth.qr.confirmTitle')">
    <div v-if="isCheckingStatus" class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-900">{{ t('modules.auth.qr.checkingStatus') }}</p>
    </div>

    <div v-else-if="isLoading" class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-900">{{ t('modules.auth.qr.confirming') }}</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-4">
      <div class="text-red-600 text-center">
        <p class="font-semibold">{{ t('modules.auth.qr.confirmError') }}</p>
        <p class="text-sm">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="success" class="flex flex-col items-center gap-4">
      <div class="text-green-600 text-center">
        <div class="text-4xl mb-2">✓</div>
        <p class="font-semibold">{{ t('modules.auth.qr.confirmSuccess') }}</p>
        <p class="text-sm">{{ t('modules.auth.qr.redirecting') }}</p>
      </div>
    </div>

    <div v-else-if="isQrValid" class="flex flex-col items-center gap-4">
      <div class="text-center">
        <p class="text-900 mb-4">{{ t('modules.auth.qr.confirmInstructions') }}</p>
        <p class="text-sm text-gray-500 font-mono">{{ sessionId }}</p>
      </div>
      <Button class="w-full" @click="confirmLogin">
        {{ t('modules.auth.qr.confirmLogin') }}
      </Button>
    </div>

    <div v-else class="flex flex-col items-center gap-4">
      <div class="text-center">
        <p class="text-900 mb-4">{{ t('modules.auth.qr.waitingForQr') }}</p>
        <p class="text-sm text-gray-500 font-mono">{{ sessionId }}</p>
      </div>
    </div>

    <div class="mt-4 text-center">
      <router-link class="cursor-pointer text-900 underline" to="/">
        {{ t('modules.auth.qr.backToHome') }}
      </router-link>
    </div>
  </AuthLocalCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { QRStatusResponseStatusEnum } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import AuthLocalCard from '@/modules/auth/components/AuthLocalCard.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sessionId = ref<string>('');
const isLoading = ref(false);
const isCheckingStatus = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const isQrValid = ref(false);

const checkQrStatus = async () => {
  if (!sessionId.value) {
    error.value = t('modules.auth.qr.noSessionId');
    return;
  }

  try {
    isCheckingStatus.value = true;
    error.value = null;

    const response = await apiService.authenticate.getQRStatus(sessionId.value);

    if (response.data.status === QRStatusResponseStatusEnum.Pending) {
      isQrValid.value = true;
    } else {
      error.value = t('modules.auth.qr.qrExpired');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to check QR status';
  } finally {
    isCheckingStatus.value = false;
  }
};

const confirmLogin = async () => {
  if (!sessionId.value) {
    error.value = t('modules.auth.qr.noSessionId');
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    await apiService.authenticate.confirmQRCode(sessionId.value);
    success.value = true;

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      void router.push({ name: 'home' });
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Get sessionId from URL query parameters
  const sessionIdParam = route.query.sessionId as string;
  if (sessionIdParam) {
    sessionId.value = sessionIdParam;
    // Check if QR code is still valid instead of auto-confirming
    void checkQrStatus();
  } else {
    error.value = t('modules.auth.qr.noSessionId');
  }
});
</script>

<style scoped lang="scss">
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
