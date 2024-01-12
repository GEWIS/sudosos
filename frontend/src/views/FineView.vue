<template>
  <div class="page-container">
    <div class="page-title">{{ t('fine.fineOverview') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="t('fine.eligibleUsers')" class="w-full">
        <DataTable
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50, 100]"
          :value="eligibleUsers"
          dataKey="id"
          v-model:selection="selection"
        >
          <template #header>
            <div class="flex flex-row justify-content-between">
              <form @submit.prevent="handlePickedDates" class="flex flex-row gap-3">
                <span class="p-float-label">
                  <Calendar
                    v-model="firstDate"
                    id="firstDate"
                    v-bind="firstDateAttrs"
                    showTime
                    hourFormat="24"
                  />
                  <label for="firstDate">{{ t('fine.firstDate') }}</label>
                </span>
                <span class="p-float-label">
                  <Calendar
                    v-model="secondDate"
                    id="firstDate"
                    v-bind="secondDateAttrs"
                    showTime
                    hourFormat="24"
                  />
                  <label for="secondDate">{{ t('fine.secondDate') }}</label>
                </span>
                <Button severity="success" type="submit">{{ t('fine.apply') }}</Button>
              </form>
              <Button @click="notifyUsers" severity="info">{{ t('fine.notify') }}</Button>
              <Button @click="handoutFines" severity="success">{{ t('fine.handout') }}</Button>
            </div>
          </template>
          <Column selectionMode="multiple" />
          <Column field="id" :header="t('fine.gewisId')" />
          <Column field="fullName" :header="t('fine.name')" />
          <Column field="firstBalance" :header="t('fine.firstBalance')">
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.firstBalance.amount) }}
            </template>
          </Column>
          <Column field="lastBalance" :header="t('fine.lastBalance')">
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.lastBalance.amount) }}
            </template>
          </Column>
        </DataTable>
      </CardComponent>
      <CardComponent :header="t('fine.fineHandoutEvents')" class="w-full">
        <DataTable paginator :rows="10" :rowsPerPageOptions="[5, 10, 25, 50, 100]">
          <Column id="id" :header="t('fine.id')" />
          <Column id="date" :header="t('fine.date')" />
          <Column id="referenceDate" :header="t('fine.referenceDate')" />
          <Column id="count" :header="t('fine.count')" />
          <Column id="info" :header="t('fine.info')" />
        </DataTable>
      </CardComponent>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from "primevue/column";
import CardComponent from "@/components/CardComponent.vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import Calendar from "primevue/calendar";
import apiService from "@/services/ApiService";
import { onMounted, ref } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { formatPrice } from "../utils/formatterUtils";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const eligibleUsers = ref();
const userStore = useUserStore();
const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      firstDate: yup.date().required(),
      secondDate: yup.date().required(),
    }
  ))
});
const selection = ref();
const [firstDate, firstDateAttrs] = defineField('firstDate');
const [secondDate, secondDateAttrs] = defineField('secondDate');

const handlePickedDates = handleSubmit(async (values) => {
  console.log(values.firstDate, values.secondDate);
  const result = await apiService.debtor.calculateFines(
    [values.firstDate.toISOString(), values.secondDate.toISOString()],
    [1]);
  console.log(result);
  const userFullNameMap: { [key: number]: string } = {};
  userStore.users.forEach((user: any) => {
    userFullNameMap[user.id] = `${user.firstName} ${user.lastName}`;
  });
  eligibleUsers.value = result.data.map((item: any) => {
    const fullName = userFullNameMap[item.id];

    // Extract balances from the item
    const [firstBalance, secondBalance] = item.balances || [null, null];

    return {
      ...item,
      fullName,
      // Assign first and last balance based on the first and second items in the balances array
      firstBalance,
      lastBalance: secondBalance,
    };
  });
  console.log(eligibleUsers.value);
});

onMounted(async () => {
  await userStore.fetchUsers(apiService);
  console.log(userStore.users);
});

const notifyUsers = async () => {
  console.log(selection);
  await apiService.debtor.notifyAboutFutureFines({
    userIds: selection.value.map((item: any) => item.id),
    referenceDate: secondDate.value?.toISOString() || new Date().toISOString()
  });
};

const handoutFines = async () => {
  console.log(selection);
  if (!firstDate.value) {
    await router.replace({ path: "/error" });
    return;
  }
  await apiService.debtor.handoutFines({
    userIds: selection.value.map((item: any) => item.id),
    referenceDate: firstDate.value.toISOString(),
  });
};
</script>

<style scoped>
@import '../styles/BasePage.scss';
</style>
