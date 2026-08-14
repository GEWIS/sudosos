<template>
  <PageContainer>
    <div class="flex flex-col gap-10 justify-between flex-grow">
      <CardComponent class="max-w-[30rem]" :header="t('modules.admin.actions.title')">
        <div class="flex flex-col gap-4">
          <MaintenanceToggle />
          <WrappedToggle />
        </div>
      </CardComponent>
      <CardComponent class="max-w-[30rem]" :header="t('modules.admin.websocket.title')">
        <WebsocketLogs />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PageContainer from '@/layout/PageContainer.vue';
import CardComponent from '@/components/CardComponent.vue';
import MaintenanceToggle from '@/modules/admin/components/MaintenanceToggle.vue';
import WrappedToggle from '@/modules/admin/components/WrappedToggle.vue';
import WebsocketLogs from '@/modules/admin/components/WebsocketLogs.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
