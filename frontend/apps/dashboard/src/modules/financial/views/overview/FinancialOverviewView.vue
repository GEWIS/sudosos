<template>
  <div>
    <PageContainer>
      <div class="flex flex-col gap-5 md:flex-col">
        <Card class="w-full">
          <template #title> {{ t('modules.financial.financialOverview.title') }}</template>
          <template #subtitle> {{ t('modules.financial.financialOverview.subtitle') }} </template>
          <template #content>
            <Tabs v-model:value="year" class="w-full">
              <TabList>
                <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
              </TabList>
            </Tabs>
            <FinancialOverviewTable :loading="loading" :sellers="sellers" :year="Number(year)" />
          </template>
        </Card>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, ref, type Ref } from 'vue';
import type { UserResponse } from '@gewis/sudosos-client';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import FinancialOverviewTable from '@/modules/financial/views/overview/FinancialOverviewTable.vue';
import PageContainer from '@/layout/PageContainer.vue';
import { useFiscalYear } from '@/composables/fiscalYear';
import ApiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const { getFiscalYearList } = useFiscalYear();
const toast = useToast();

const years = getFiscalYearList();
const year: Ref<string> = ref(years[0]?.toString() || '');
const sellers: Ref<Array<UserResponse>> = ref([]);
const loading = ref(false);

const userStore = useUserStore();
onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchAllOrgans(ApiService);
    sellers.value = userStore.organs;
  } catch (error) {
    handleError(error as AxiosError, toast);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss"></style>
