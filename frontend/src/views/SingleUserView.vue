<!--TODO: Extract input validation styling-->
<!--See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/52-->
<template>
  <div class="page-container">
    <div class="page-title">{{ `${currentUser ? currentUser.firstName : ''}'s profile` }}</div>
    <div class="content-wrapper">
<!--      TODO: Refactor to extract this component-->
<!--      See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/21-->
      <div class="row">
        <CardComponent :header="$t('userDetails.Personal Info')" class="personal-info-card">
          <form @submit="handleEditUser">
            <label for="firstName">{{ $t('userDetails.First name') }}</label>
            <InputText id="firstName" v-bind="firstName" />
            <span class="error-text">{{ errors.firstName }}</span>
            <label for="lastName">{{ $t('userDetails.Last name') }}</label>
            <InputText id="lastName" v-bind="lastName" />
            <span class="error-text">{{ errors.lastName }}</span>
            <label for="email">{{ $t('userDetails.Email address') }}</label>
            <InputText id="email" v-bind="email"/>
            <label for="type">{{ $t('userDetails.Usertype') }}</label>
            <InputText
                id="userType"
                disabled
                :placeholder="currentUser ? currentUser.type : undefined"
                v-bind="userType"
            />
            <span class="error-text">{{ errors.userType }}</span>
            <label for="active">{{ $t('userDetails.Active') }}</label>
            <Checkbox :binary="true" id="active" v-bind="isActive" />
            <Button type="submit" severity="danger">{{ $t('userDetails.Update information') }}</Button>
          </form>
        </CardComponent>
        <BalanceComponent :user="currentUser" :showOption="false" id="userBalance"/>
      </div>
      <div class="row">
        <TransactionsTableComponent :header="$t('userDetails.User Transactions')" action="none" style="width: 100%;"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { UpdateUserRequest, UserResponse } from '@sudosos/sudosos-client';
import CardComponent from "@/components/CardComponent.vue";
import Checkbox from "primevue/checkbox";
import BalanceComponent from "@/components/BalanceComponent.vue";
import TransactionsTableComponent from "@/components/TransactionsTableComponent.vue";
import { useForm } from "vee-validate";
import apiService from "@/services/ApiService";
import router from "@/router";
import { userDetailsSchema } from "@/utils/validation-schema";

const { defineComponentBinds, handleSubmit, errors, setValues } = useForm({
  validationSchema: userDetailsSchema,
});

const userId = ref();
const route = useRoute();
const userStore = useUserStore();
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


</script>

<style scoped>
@import '../styles/BasePage.css';

:deep(.card){
  width: 35rem;
}

form {
  display: flex;
  flex-direction: column;
}

:deep(.p-button){
  margin-top: 10px;
  width: fit-content;
}

#userBalance {
  width: 20rem;
  height: 20rem;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
