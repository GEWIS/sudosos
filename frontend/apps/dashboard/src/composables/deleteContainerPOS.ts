import { useConfirm } from 'primevue/useconfirm';
import type { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { handleError } from '@/utils/errorUtils';
import { usePointOfSaleStore } from '@/stores/pos.store';
import type { ContainerInStore } from '@/stores/container.store';

export function useDeleteContainerPOS(group = 'containerDeletePos') {
  const confirm = useConfirm();
  const { t } = useI18n();
  const toast = useToast();
  const posStore = usePointOfSaleStore();

  return function deleteContainerPOS(p: PointOfSaleWithContainersResponse, c: ContainerInStore) {
    confirm.require({
      header: t('common.remove'),
      message: t('modules.seller.singlePos.confirmRemoveContainer'),
      acceptLabel: t('common.remove'),
      rejectLabel: t('common.close'),
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      group: `${group}-${c.id}`,
      accept: () => {
        posStore
          .removeContainerFromPos(p.id, c.id)
          .then(() => {
            toast.add({
              summary: t('common.toast.success.success'),
              detail: t('common.toast.success.containerRemoved'),
              severity: 'success',
              life: 3000,
            });
            confirm.close();
          })
          .catch((err) => {
            handleError(err, toast);
            confirm.close();
          });
      },
    });
  };
}
