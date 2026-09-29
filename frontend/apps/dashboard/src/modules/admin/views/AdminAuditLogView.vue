<template>
  <PageContainer class="max-w-[100rem]">
    <CardComponent class="w-full" :header="t('modules.admin.audit.title')">
      <div class="flex flex-col gap-3">
        <div class="flex flex-row flex-wrap gap-3">
          <Select
            v-model="entityType"
            class="w-full md:w-[15rem]"
            option-label="label"
            option-value="value"
            :options="entityTypeOptions"
            :placeholder="t('modules.admin.audit.filters.allObjects')"
            show-clear
          />
          <Select
            v-model="action"
            class="w-full md:w-[15rem]"
            option-label="label"
            option-value="value"
            :options="actionOptions"
            :placeholder="t('modules.admin.audit.filters.allActions')"
            show-clear
          />
          <IconField class="w-full md:w-[10rem]" icon-position="left">
            <InputIcon class="pi pi-hashtag" />
            <InputText v-model="entityId" :placeholder="t('modules.admin.audit.filters.objectId')" />
          </IconField>
        </div>

        <AuditLogTable always-paginate :filters="filters" :rows="25" :rows-per-page-options="[10, 25, 50, 100]" />
      </div>
    </CardComponent>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  translateOr,
  type AuditAction,
  type AuditEntityType,
  type AuditLogFilters,
} from '@/utils/auditUtil';
import CardComponent from '@/components/CardComponent.vue';
import AuditLogTable from '@/components/audit/AuditLogTable.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const action = ref<AuditAction | undefined>(undefined);
const entityType = ref<AuditEntityType | undefined>(undefined);
const entityId = ref<string>('');

const filters = computed<AuditLogFilters>(() => ({
  action: action.value ?? undefined,
  entityType: entityType.value ?? undefined,
  entityId: entityId.value.trim() || undefined,
}));

function label(prefix: string, value: string): string {
  return translateOr(t, `components.audit.${prefix}.${value}`, value);
}

const actionOptions = computed(() => AUDIT_ACTIONS.map((value) => ({ value, label: label('actions', value) })));
const entityTypeOptions = computed(() =>
  AUDIT_ENTITY_TYPES.map((value) => ({ value, label: label('entities', value) })),
);
</script>
