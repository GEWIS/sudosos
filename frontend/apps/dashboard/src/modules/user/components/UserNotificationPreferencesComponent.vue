<template>
  <CardComponent :header="t('modules.user.notifications.header')">
    <div v-if="loading" class="flex justify-center p-4">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>
    <div v-else class="flex flex-col gap-4">
      <InputSpan
        :label="t('modules.user.notifications.transactionsMadeByMyself')"
        type="boolean"
        :value="selfEnabled"
        @update:value="handleSelfChange"
      />
      <InputSpan
        :label="t('modules.user.notifications.transactionsMadeByOthers')"
        type="boolean"
        :value="otherEnabled"
        @update:value="handleOtherChange"
      />
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type {
  UserResponse,
  BaseUserNotificationPreferenceResponse,
  UserNotificationPreferenceUpdateRequest,
} from '@sudosos/sudosos-client';
import type { AxiosError } from 'axios';
import CardComponent from '@/components/CardComponent.vue';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const props = defineProps<{
  user: UserResponse;
}>();

const { t } = useI18n();
const toast = useToast();
const loading = ref(true);
const allPreferences = ref<BaseUserNotificationPreferenceResponse[]>([]);
const transactionNotificationSelfId = ref<number | null>(null);
const transactionNotificationChargedByOtherId = ref<number | null>(null);
const isInitializing = ref(true);

const NOTIFICATION_CHANNEL = 'EMAIL' as const;
const NOTIFICATION_TYPE_SELF = 'TransactionNotificationSelf' as const;
const NOTIFICATION_TYPE_OTHER = 'TransactionNotificationChargedByOther' as const;

const findPreference = (
  type: typeof NOTIFICATION_TYPE_SELF | typeof NOTIFICATION_TYPE_OTHER,
): BaseUserNotificationPreferenceResponse | undefined => {
  return allPreferences.value.find((p) => p.type === type && p.channel === NOTIFICATION_CHANNEL);
};

const selfEnabled = ref(false);
const otherEnabled = ref(false);

const fetchPreferences = async () => {
  loading.value = true;
  try {
    const res = await apiService.userNotifications.getAllUserNotificationPreferences(undefined, props.user.id);
    allPreferences.value = res.data.records || [];

    const selfPreference = findPreference(NOTIFICATION_TYPE_SELF);
    const otherPreference = findPreference(NOTIFICATION_TYPE_OTHER);

    transactionNotificationSelfId.value = selfPreference?.id ?? null;
    transactionNotificationChargedByOtherId.value = otherPreference?.id ?? null;

    selfEnabled.value = selfPreference?.enabled === true;
    otherEnabled.value = otherPreference?.enabled === true;
    isInitializing.value = false;
  } catch (err) {
    handleError(err as AxiosError, toast);
    isInitializing.value = false;
  } finally {
    loading.value = false;
  }
};

const updatePreference = async (id: number, enabled: boolean) => {
  const updateRequest = { enabled } as UserNotificationPreferenceUpdateRequest;
  await apiService.userNotifications.updateUserNotificationPreference(id, updateRequest);
};

const handleSelfChange = async (enabled: boolean) => {
  if (isInitializing.value || transactionNotificationSelfId.value === null) return;

  try {
    await updatePreference(transactionNotificationSelfId.value, enabled);
    const selfPreference = findPreference(NOTIFICATION_TYPE_SELF);
    if (selfPreference) {
      selfPreference.enabled = enabled;
    }
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('modules.user.notifications.preferencesUpdated'),
      life: 3000,
    });
  } catch (err) {
    handleError(err as AxiosError, toast);
    selfEnabled.value = !enabled;
  }
};

const handleOtherChange = async (enabled: boolean) => {
  if (isInitializing.value || transactionNotificationChargedByOtherId.value === null) return;

  try {
    await updatePreference(transactionNotificationChargedByOtherId.value, enabled);
    const otherPreference = findPreference(NOTIFICATION_TYPE_OTHER);
    if (otherPreference) {
      otherPreference.enabled = enabled;
    }
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('modules.user.notifications.preferencesUpdated'),
      life: 3000,
    });
  } catch (err) {
    handleError(err as AxiosError, toast);
    otherEnabled.value = !enabled;
  }
};

onMounted(() => {
  void fetchPreferences();
});
</script>
