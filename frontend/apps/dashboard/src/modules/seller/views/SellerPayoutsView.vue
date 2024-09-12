<template>
  <div class="page-container flex flex-column">
    <div class="page-title"> {{ user?.firstName }} {{ t('modules.seller.payouts.title') }}</div>
    <div class="flex flex-column justify-content-between gap-5">
      <div class="flex flex-row gap-3 justify-content-between">
        <FormCard :form="form" :create="!zeroBalance" :enable-edit="!zeroBalance" :header="t('modules.seller.payouts.title')" class="flex-grow-1" @cancel="form.context.resetForm()">
          <SellerPayoutCreateForm :form="form" v-if="user" :seller="user" :disabled="zeroBalance"/>
        </FormCard>
        <AdminUserBalance v-if="user" :user="user" @update:value="balance = $event"/>
      </div>
      <CardComponent :header="t('modules.seller.payouts.title')" v-if="user">
        <SellerPayoutsTable :seller="user"/>
      </CardComponent>
      <Skeleton v-else class="h-20rem w-full"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ApiService from "@/services/ApiService";
import type { BalanceResponse, UserResponse } from "@sudosos/sudosos-client";
import { useRoute } from "vue-router";
import SellerPayoutsTable from "@/modules/seller/components/seller/SellerPayoutsTable.vue";
import CardComponent from "@/components/CardComponent.vue";
import AdminUserBalance from "@/modules/admin/components/users/AdminUserBalance.vue";
import { schemaToForm } from "@/utils/formUtils";
import { createSellerPayoutObject } from "@/utils/validation-schema";
import FormCard from "@/components/FormCard.vue";
import SellerPayoutCreateForm from "@/modules/seller/components/seller/forms/SellerPayoutCreateForm.vue";
import { useI18n } from "vue-i18n";
import { computed, onBeforeMount, ref, type Ref } from "vue";
import router from "@/router";

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
  await ApiService.user.getIndividualUser(id).then((res) => {
    user.value = res.data;
    form.context.resetForm({ values: { user: res.data } });
  }).catch(async () => {
    await router.replace('/error');
    return;
  });
});

</script>

<style scoped lang="scss">

</style>
