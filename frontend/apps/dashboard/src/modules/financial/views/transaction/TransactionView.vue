<template>
  <PageContainer>
    <div class="flex flex-col gap-5">
      <TransactionSearchCard :initial-value="initialTransactionId" @search="handleSearch" />
      <TransactionDetailCard :editable="true" :error="errorMessage" :transaction="currentTransaction" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import type { AxiosError } from 'axios';
import PageContainer from '@/layout/PageContainer.vue';
import TransactionSearchCard from '@/modules/financial/components/transaction/TransactionSearchCard.vue';
import TransactionDetailCard from '@/modules/financial/components/transaction/TransactionDetailCard.vue';
import { useTransactionStore } from '@/stores/transaction.store';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const route = useRoute();

const transactionStore = useTransactionStore();
const currentTransactionId = ref<number | null>(null);
const errorMessage = ref<string>('');

// Get initial transaction ID from route query
const initialTransactionId = computed(() => {
  const transactionId = route.query.id;
  if (transactionId && typeof transactionId === 'string') {
    const id = parseInt(transactionId, 10);
    return !isNaN(id) ? id : undefined;
  }
  return undefined;
});

// Reactive transaction from store
const currentTransaction = computed(() => {
  if (currentTransactionId.value) {
    return transactionStore.getTransaction(currentTransactionId.value);
  }
  return null;
});

async function handleSearch(id: number) {
  try {
    errorMessage.value = '';
    currentTransactionId.value = id;
    await transactionStore.fetchIndividualTransaction(id, apiService);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      errorMessage.value = t('modules.admin.transactions.notFound');
    } else {
      errorMessage.value = t('common.toast.error.error');
    }
    currentTransactionId.value = null;
  }
}

onMounted(() => {
  // If there's an initial transaction ID from the route, search for it
  if (initialTransactionId.value) {
    void handleSearch(initialTransactionId.value);
  }
});
</script>
