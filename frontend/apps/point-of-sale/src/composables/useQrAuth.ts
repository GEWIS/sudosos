import { AuthenticationResponse, QRCodeResponse } from '@sudosos/sudosos-client';
import { useWebSocketStore, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { toDataURL } from 'qrcode';
import { userApiService } from '@/services/ApiService';

export function useQrAuth() {
  const session = ref<QRCodeResponse | null>(null);
  const qrCodeDataUrl = ref<string>('');
  const webSocketStore = useWebSocketStore();
  let expirationTimeout: ReturnType<typeof setTimeout> | null = null;

  const isExpired = computed(() => {
    if (!session.value) return false;
    return new Date() >= new Date(session.value.expiresAt);
  });

  const clearExpirationTimeout = () => {
    if (expirationTimeout) {
      clearTimeout(expirationTimeout);
      expirationTimeout = null;
    }
  };

  const setExpirationTimeout = (expiresAt: string) => {
    clearExpirationTimeout();
    const expirationTime = new Date(expiresAt).getTime() - Date.now();
    if (expirationTime > 0) {
      expirationTimeout = setTimeout(() => {
        void generateQrCode();
      }, expirationTime);
    }
  };

  const generateQrCode = async () => {
    const res: QRCodeResponse = (await userApiService.authenticate.generateQRCode()).data;
    session.value = res;
    setExpirationTimeout(res.expiresAt);

    webSocketStore.getSocket?.emit('subscribe-qr-session', res.sessionId);
    await generateQrCodeImage();
  };

  const generateQrCodeImage = async () => {
    if (!session.value) return;
    try {
      const qrCodeUrl = session.value.qrCodeUrl;
      qrCodeDataUrl.value = await toDataURL(qrCodeUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      qrCodeDataUrl.value = '';
    }
  };

  const handleConfirmed = (data: { sessionId: string; token: AuthenticationResponse }) => {
    if (session.value && data.sessionId === session.value.sessionId) {
      useAuthStore().handleResponse(data.token, userApiService);
      webSocketStore.getSocket?.emit('unsubscribe-qr-session', session.value.sessionId);
    }
  };

  onMounted(() => {
    webSocketStore.getSocket?.on('qr-confirmed', handleConfirmed);
  });

  onUnmounted(() => {
    webSocketStore.getSocket?.off('qr-confirmed', handleConfirmed);
    clearExpirationTimeout();

    if (session.value) {
      webSocketStore.getSocket?.emit('unsubscribe-qr-session', session.value.sessionId);
    }
  });

  return {
    session,
    qrCodeDataUrl,
    generateQrCode,
    generateQrCodeImage,
    isExpired,
  };
}
