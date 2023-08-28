<template>
  <div class="page-container">
    <div class="page-title">{{ `${currentUser ? currentUser.firstName : ''}'s profile` }}</div>
    <div class="content-wrapper">
<!--      TODO: Refactor to extract this component-->
      <CardComponent header="Personal Info" class="personal-info-card">
        <form @submit="console.error('clicked submit!')">
          <label for="firstName">First Name</label>
          <InputText id="firstName" v-model="firstName"/>
          <label for="lastName">Last Name</label>
          <InputText id="lastName" v-model="lastName"/>
          <label for="email">Email</label>
          <InputText id="email" v-model="email"/>
          <label for="type">Usertype</label>
          <InputText id="type" disabled :placeholder="currentUser ? currentUser.type : undefined"/>
          <label for="active">Active</label>
          <Checkbox id="active" v-model="isActive"/>
          <Button type="submit" severity="danger">Update information</Button>
        </form>
      </CardComponent>
      <BalanceComponent :user="currentUser" :showOption="false" id="userBalance"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, Ref, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@sudosos/sudosos-frontend-common'
import type { UserResponse } from '@sudosos/sudosos-client'
import CardComponent from "@/components/CardComponent.vue";
import Checkbox from "primevue/checkbox";
import BalanceComponent from "@/components/BalanceComponent.vue";

const userId = ref()
const route = useRoute()
const userStore = useUserStore()
const currentUser: Ref<UserResponse | undefined> = ref()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const isActive = ref(true)
onBeforeMount(async () => {
  userId.value = route.params.userId
  console.error(userId.value)
  currentUser.value = userStore.users.find((user) => user.id == userId.value)
  if (currentUser.value) {
    firstName.value = currentUser.value?.firstName
    lastName.value = currentUser.value?.lastName
    email.value = currentUser.value.email ? currentUser.value.email : ''
    isActive.value = currentUser.value.active
  }
  console.log(currentUser.value)
})
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
</style>
