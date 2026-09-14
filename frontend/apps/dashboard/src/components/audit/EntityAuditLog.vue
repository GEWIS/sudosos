<template>
  <CardComponent class="w-full" :header="t('components.audit.entityHeader')">
    <AuditLogTable :filters="{ entityType, entityId }" :rows="5" :show-entity="false" />
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import AuditLogTable from '@/components/audit/AuditLogTable.vue';
import type { AuditEntityType } from '@/utils/auditUtil';

/**
 * Everything that has been recorded against one object, for the page of that
 * object.
 * @property entityType - The kind of object, as the back-end names it.
 * @property entityId - The id of the object.
 */
interface EntityAuditLogProps {
  entityType: AuditEntityType;
  entityId: number;
}

defineProps<EntityAuditLogProps>();

const { t } = useI18n();
</script>
