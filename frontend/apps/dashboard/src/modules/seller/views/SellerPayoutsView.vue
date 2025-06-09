<template>
  <div class="flex flex-col page-container">
    <div class="page-title">{{ user?.firstName }} {{ t('modules.seller.payouts.title') }}</div>
    <div class="flex flex-col gap-5 justify-between">
      <div class="flex flex-row gap-3 justify-between">
        <FormCard
          class="flex-grow-1"
          :create="!zeroBalance"
          :enable-edit="!zeroBalance"
          :form="form"
          :header="t('modules.seller.payouts.title')"
          @cancel="form.context.resetForm()"
        >
          <SellerPayoutCreateForm v-if="user" :disabled="zeroBalance" :form="form" :seller="user" />
        </FormCard>
        <AdminUserBalance v-if="user" :user="user" @update:value="balance = $event" />
      </div>
      <CardComponent v-if="user" :header="t('modules.seller.payouts.title')">
        <SellerPayoutsTable :seller="user" />
      </CardComponent>
      <Skeleton v-else class="h-20rem w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref, type Ref } from 'vue';
import ApiService from '@/services/ApiService';
import SellerPayoutsTable from '@/modules/seller/components/seller/SellerPayoutsTable.vue';
import CardComponent from '@/components/CardComponent.vue';
import AdminUserBalance from '@/modules/admin/components/users/AdminUserBalance.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createSellerPayoutObject } from '@/utils/validation-schema';
import FormCard from '@/components/FormCard.vue';
import SellerPayoutCreateForm from '@/modules/seller/components/seller/forms/SellerPayoutCreateForm.vue';
import router from '@/router';

const { t } = useI18n();
const route = useRoute();

const balance: Ref<BalanceResponse | null> = ref(null);
const zeroBalance = computed(() => {
  return balance.value?.amount?.amount === 0;
});
const user: Ref<UserResponse | undefined> = ref();

const form = schemaToForm(createSellerPayoutObject);

onBeforeMount(async () => {
  const id = Number(route.params.id);
  await ApiService.user
    .getIndividualUser(id)
    .then((res) => {
      user.value = res.data;
      form.context.resetForm({ values: { user: res.data } });
    })
    .catch(async () => {
      await router.replace('/error');
      return;
    });
});
</script>

<style scoped lang="scss"></style>
