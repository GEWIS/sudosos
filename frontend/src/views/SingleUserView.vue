<!--TODO: Extract input validation styling-->
<!--See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/52-->
<template>
  <div class="page-container">
    <div class="page-title">{{ `${currentUser ? currentUser.firstName : ''}'s profile` }}</div>
    <div class="flex flex-column md:flex-row flex-wrap justify-content-between gap-5">
<!--      TODO: Refactor to extract this component-->
<!--      See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/21-->
        <CardComponent :header="$t('userDetails.Personal Info')" class="">
          <form @submit="handleEditUser">
            <div class="field">
              <label for="firstName">{{ $t("userDetails.First name") }}</label>
              <InputText id="firstName" v-bind="firstName" class="w-full" />
              <span class="error-text">{{ errors.firstName }}</span>
            </div>
            <div class="field">
              <label for="lastName">{{ $t("userDetails.Last name") }}</label>
              <InputText id="lastName" v-bind="lastName" class="w-full"/>
              <span class="error-text">{{ errors.lastName }}</span>
            </div>
            <div class="field">
              <label for="email">{{ $t("userDetails.Email address") }}</label>
              <InputText id="email" v-bind="email" class="w-full"/>
            </div>
            <div class="field">
              <label for="type">{{ $t("userDetails.Usertype") }}</label>
              <InputText
                id="userType"
                disabled
                :placeholder="currentUser ? currentUser.type : undefined"
                v-bind="userType"
                class="w-full"
              />
              <span class="error-text">{{ errors.userType }}</span>
            </div>
            <div class="field">
              <label for="active">{{ $t("userDetails.Active") }}</label>
              <Checkbox :binary="true" id="active" v-bind="isActive" class="w-full"/>
            </div>
            <Button type="submit" class="update-button">{{ $t('userDetails.Update information') }}</Button>
          </form>
        </CardComponent>
        <BalanceComponent :user="currentUser" :showOption="false" id="userBalance"/>
        <MutationsTableComponent
          class="w-full"
          :header="$t('userDetails.User Transactions')"
          paginator
          modal
          :callbackFunction="getUserMutations"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import type { PaginatedFinancialMutationResponse, UpdateUserRequest, UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import Checkbox from "primevue/checkbox";
import BalanceComponent from "@/components/BalanceComponent.vue";
import { useForm } from "vee-validate";
import apiService from "@/services/ApiService";
import router from "@/router";
import { userDetailsSchema } from "@/utils/validation-schema";
import MutationsTableComponent from "@/components/Mutations/MutationsTableComponent.vue";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";

const { defineComponentBinds, handleSubmit, errors, setValues } = useForm({
  validationSchema: userDetailsSchema,
});

const userId = ref();
const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();
const toast = useToast();
const currentUser: Ref<UserResponse | undefined> = ref();
const firstName = defineComponentBinds('firstName', {});
const lastName = defineComponentBinds('lastName', {});
const email = defineComponentBinds('email', {});
const isActive = defineComponentBinds('isActive', {});
const userType = defineComponentBinds('userType', {});

onBeforeMount(async () => {
  userId.value = route.params.userId;
  currentUser.value = userStore.users.find((user) => user.id == userId.value);
  if (currentUser.value) {
    setValues({
      firstName: currentUser.value?.firstName,
      lastName: currentUser.value?.lastName,
      email: currentUser.value.email ? currentUser.value.email : '',
      userType: currentUser.value ? currentUser.value.type : '',
      isActive: currentUser.value.active,
    });
  }
});

const handleEditUser = handleSubmit(async (values) => {
  if (currentUser.value){
    const userId = currentUser.value.id;
    const updateUserRequest: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      active: values.isActive,
      email: values.email || '',
    };
    const response = await apiService.user.updateUser(userId, updateUserRequest);
    if (response.status === 200) {
      await router.push({ name: 'user', params: { userId } });
    } else {
      console.error(response.status + ": " + response.statusText);
    }
  }
});

const getUserMutations = async (take: number, skip: number) :
  Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};

</script>

<style scoped lang="scss">
</style>
