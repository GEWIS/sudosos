<!--TODO: Extract input validation styling-->
<!--See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/52-->
<template>
  <div class="page-container">
    <div class="page-title">{{ `${currentUser ? currentUser.firstName : ''}'s profile` }}</div>
    <div class="flex flex-column md:flex-row flex-wrap justify-content-between gap-5">
      <!--      TODO: Refactor to extract this component-->
      <!--      See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/21-->
      <CardComponent :header="$t('userDetails.Personal Info')">
        <form @submit="handleEditUser">
          <small v-if="!isLocal">{{ $t('profile.notManagedThroughSudoSOS') }}</small>
          <div class="field">
            <label for="firstName">{{ $t("userDetails.First name") }}</label>
            <InputText :disabled="!isLocal" id="firstName" v-model="firstName" v-bind="firstNameAttrs" class="w-full" />
            <span class="error-text">{{ errors.firstName }}</span>
          </div>
          <div class="field">
            <label for="lastName">{{ $t("userDetails.Last name") }}</label>
            <InputText :disabled="!isLocal" id="lastName" v-model="lastName" v-bind="lastNameAttrs" class="w-full" />
            <span class="error-text">{{ errors.lastName }}</span>
          </div>
          <div class="field">
            <label for="email">{{ $t("userDetails.Email address") }}</label>
            <InputText :disabled="!isLocal" id="email" v-model="email" v-bind="emailAttrs" class="w-full" />
          </div>
          <div class="field">
            <label for="type">{{ $t("userDetails.Usertype") }}</label>
            <InputText id="userType" disabled :placeholder="userTypeDisplay"
                       v-bind="userTypeAttrs" class="w-full" />
            <span class="error-text">{{ errors.userType }}</span>
          </div>
          <div class="field">
            <label for="active">{{ $t("userDetails.Active") }}</label>
            <Checkbox :binary="true" id="active" v-model="isActive" v-bind="isActiveAttrs" class="w-full" />
          </div>
          <div class="field">
            <label for="ofAge">{{ $t('profile.ofAge') }}</label>
            <Checkbox :binary="true" v-model="ofAge" v-bind="ofAgeAttrs" id="ofAge" class="w-full" />
            <span class="error-text">{{ errors.ofAge }}</span>
          </div>
          <div class="field">
            <label for="canGoIntoDebt">{{ $t('profile.canGoIntoDebt') }}</label>
            <Checkbox :binary="true" v-model="canGoIntoDebt" v-bind="canGoIntoDebtAttrs" id="canGoIntoDebt"
              class="w-full" />
            <span class="error-text">{{ errors.canGoIntoDebt }}</span>
          </div>
          <div class="flex justify-content-end">
            <Button type="submit" class="update-button">{{ $t('userDetails.Update information') }}</Button>
          </div>
        </form>
      </CardComponent>
      <BalanceComponent :user="currentUser" :showOption="false" id="userBalance" />
      <MutationsTableComponent class="w-full" :header="$t('userDetails.User Transactions')" paginator modal
        :callbackFunction="getUserMutations" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import type { PaginatedFinancialMutationResponse, UpdateUserRequest, UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import Checkbox from "primevue/checkbox";
import BalanceComponent from "@/components/BalanceComponent.vue";
import { useForm } from "vee-validate";
import apiService from "@/services/ApiService";
import router from "@/router";
import { userDetailsSchema, userTypes } from "@/utils/validation-schema";
import MutationsTableComponent from "@/components/Mutations/MutationsTableComponent.vue";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import type { AxiosError } from "axios";
import Button from "primevue/button";
import { useI18n } from "vue-i18n";

const { defineField, handleSubmit, errors, setValues } = useForm({
  validationSchema: userDetailsSchema,
});

const userId = ref();
const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const { t } = useI18n();
const currentUser: Ref<UserResponse | undefined> = ref();
const [firstName, firstNameAttrs] = defineField('firstName', {});
const [lastName, lastNameAttrs] = defineField('lastName', {});
const [email, emailAttrs] = defineField('email', {});
const [isActive, isActiveAttrs] = defineField('isActive', {});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [userType, userTypeAttrs] = defineField('userType', {});
const [canGoIntoDebt, canGoIntoDebtAttrs] = defineField('canGoIntoDebt', {});
const [ofAge, ofAgeAttrs] = defineField('ofAge', {});

const isLocal: Ref<Boolean> = ref(false);

onBeforeMount(async () => {
  userId.value = route.params.userId;
  await apiService.user.getIndividualUser(userId.value).then((res) => {
    currentUser.value = res.data;
  }).catch((error: AxiosError) => {
    handleError(error, toast);
  });
  if (!currentUser.value) {
    await router.replace({ path: '/error' });
    return;
  }
  isLocal.value = currentUser.value.type == "LOCAL_USER";
  setValues({
    firstName: currentUser.value?.firstName,
    lastName: currentUser.value?.lastName,
    email: currentUser.value.email ? currentUser.value.email : '',
    userType: currentUser.value ? currentUser.value.type : '',
    isActive: currentUser.value.active,
    ofAge: currentUser.value.ofAge,
    canGoIntoDebt: currentUser.value?.canGoIntoDebt,
  });
});

const handleEditUser = handleSubmit(async (values) => {
  if (currentUser.value) {
    const userId = currentUser.value.id;
    const updateUserRequest: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      active: values.isActive,
      email: values.email || '',
      canGoIntoDebt: values.canGoIntoDebt,
      ofAge: values.ofAge
    };
    const response = await apiService.user.updateUser(userId, updateUserRequest);
    if (response.status === 200) {
      await router.push({ name: 'user', params: { userId } }).then(() => {
        toast.add({
          severity: 'success',
          summary: t('successMessages.success'),
          detail: t('userDetails.updatedUserInfo'),
          life: 3000
        });
      });
    } else {
      console.error(response.status + ": " + response.statusText);
    }
  }
});

const getUserMutations = async (take: number, skip: number):
    Promise<PaginatedFinancialMutationResponse | undefined> => {
  await userStore.fetchUsersFinancialMutations(userId.value, apiService, take, skip)
      .catch((err: AxiosError) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

const userTypeDisplay = computed(() => {
  const type = currentUser.value ? currentUser.value.type : '';
  // Assuming type is a numeric ID; find the corresponding name
  const userTypeObj = userTypes.value.find(ut => ut.name === type);
  return userTypeObj ? userTypeObj.name : 'Unknown';
});
</script>

<style scoped lang="scss">
</style>
