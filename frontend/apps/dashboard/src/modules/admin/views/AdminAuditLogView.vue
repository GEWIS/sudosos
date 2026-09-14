<template>
  <PageContainer class="max-w-[100rem]">
    <CardComponent class="w-full" :header="t('modules.admin.audit.title')">
      <template #topAction>
        <Button
          :icon="table?.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          :label="t('common.refresh')"
          outlined
          @click="table?.refresh()"
        />
      </template>

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
            <InputNumber
              v-model="entityId"
              :placeholder="t('modules.admin.audit.filters.objectId')"
              :use-grouping="false"
            />
          </IconField>
        </div>

        <AuditLogTable
          ref="table"
          always-paginate
          :filters="filters"
          :rows="25"
          :rows-per-page-options="[10, 25, 50, 100]"
        />
      </div>
    </CardComponent>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import InputNumber from 'primevue/inputnumber';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  type AuditAction,
  type AuditEntityType,
  type AuditLogFilters,
} from '@/utils/auditUtil';
import CardComponent from '@/components/CardComponent.vue';
import AuditLogTable from '@/components/audit/AuditLogTable.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const table = useTemplateRef<InstanceType<typeof AuditLogTable>>('table');

const action = ref<AuditAction | undefined>(undefined);
const entityType = ref<AuditEntityType | undefined>(undefined);
const entityId = ref<number | undefined>(undefined);

const filters = computed<AuditLogFilters>(() => ({
  action: action.value ?? undefined,
  entityType: entityType.value ?? undefined,
  entityId: entityId.value ?? undefined,
}));

// vue-i18n returns the key itself when there is no translation.
function label(prefix: string, value: string): string {
  const key = `components.audit.${prefix}.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

const actionOptions = computed(() => AUDIT_ACTIONS.map((value) => ({ value, label: label('actions', value) })));
const entityTypeOptions = computed(() =>
  AUDIT_ENTITY_TYPES.map((value) => ({ value, label: label('entities', value) })),
);
</script>
