import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import type { SellerPayoutResponse } from '@sudosos/sudosos-client';
import { formatPrice } from '@/utils/formatterUtils';
import ApiService from '@/services/ApiService';

export const useVerifyPayout = {
  setup() {
    const verifying = ref<boolean>(false);
    const verifySuccess = ref<boolean | null>(null);
    const verifyAmount = ref<number | null>(null);
    const toast = useToast();
    const { t } = useI18n();

    const verifyPayout = async (payout: SellerPayoutResponse) => {
      if (!payout) return;

      verifying.value = true;
      verifySuccess.value = null;

      try {
        const startDate = new Date(payout.startDate);
        const endDate = new Date(payout.endDate);

        const result = await ApiService.user.getUsersSalesReport(
          payout.requestedBy.id,
          startDate.toISOString(),
          endDate.toISOString(),
        );

        verifyAmount.value = result.data.totalInclVat.amount;
        if (result.data.totalInclVat.amount === payout.amount.amount) {
          verifySuccess.value = true;
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.payout.verify'),
            detail: t('common.toast.success.payout.details'),
            life: 3000,
          });
        } else {
          verifySuccess.value = false;
          toast.add({
            severity: 'error',
            summary: t('common.toast.failed.failed'),
            detail: t('common.toast.failed.payout.details', {
              amount: formatPrice(payout.amount),
              totalInclVat: formatPrice(result.data.totalInclVat),
            }),
            life: 3000,
          });
        }
      } catch {
        verifySuccess.value = false;
        toast.add({
          severity: 'error',
          summary: t('common.toast.failed.failed'),
          detail: t('common.toast.failed.payout.unable'),
          life: 3000,
        });
      } finally {
        verifying.value = false;
      }
    };

    const verifyButtonLabel = computed(() => {
      if (verifying.value) return '';
      return verifySuccess.value === true
        ? t('common.verified')
        : verifySuccess.value === false
          ? t('common.failed')
          : t('common.verify');
    });

    const verifyButtonIcon = computed(() => {
      if (verifying.value) return 'pi pi-spin pi-spinner';
      return verifySuccess.value === true
        ? 'pi pi-check'
        : verifySuccess.value === false
          ? 'pi pi-times'
          : 'pi pi-check';
    });

    const verifyButtonSeverity = computed(() => {
      return verifySuccess.value === true ? 'success' : verifySuccess.value === false ? 'danger' : 'info';
    });

    const verifyButtonClass = computed(() => {
      return verifySuccess.value === false
        ? 'p-button-danger'
        : verifySuccess.value === true
          ? 'p-button-success'
          : 'p-button-info';
    });

    return {
      verifyPayout,
      verifying,
      verifySuccess,
      verifyButtonLabel,
      verifyButtonIcon,
      verifyButtonSeverity,
      verifyButtonClass,
      verifyAmount,
    };
  },
};
