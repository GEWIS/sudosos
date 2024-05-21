<template>
  <div class="page-container">
    <div class="page-title my-0">
      {{ $t('profile.myProfile')}}
    </div>
    <div class="grid">
      <div class="col-6 md:col-6">
        <UserInfoComponent :user="current.user as UserResponse"/>
      </div>
      <div class="col-6 md:col-6">
          <ChangePinComponent />
      </div>
      <div class="col-6 md:col-6">
        <ChangePasswordComponent />
      </div>
      <div class="col-6 md:col-6">
        <ChangeApiKeyComponent v-if="isAdmin"/>
        <div class="flex flex-row mb-2 align-items-center">
          <h3 class="mr-3">{{ $t('profile.individualDataAnalysis') }}</h3>
          <InputSwitch v-model="dataAnalysis" @update:modelValue="handleChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import UserInfoComponent from "@/components/UserInfoComponent.vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { computed, onMounted, type Ref, ref } from "vue";
import { UserRole } from "@/utils/rbacUtils";
import InputSwitch from "primevue/inputswitch";
import apiService from "@/services/ApiService";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";

const userStore = useUserStore();
const authStore = useAuthStore();
const isAdmin = computed(() => {
  return authStore.roles.includes(UserRole.BOARD);
});
const dataAnalysis: Ref<boolean> = ref(false);
const { current } = storeToRefs(userStore);
const toast = useToast();
const { t } = useI18n();


onMounted(async () => {
  if (!userStore.current.user) {
    await router.replace({ path: "/error" });
    return;
  }
  await userStore.fetchUsers(apiService);
  dataAnalysis.value = userStore.getUserById(userStore.current.user.id)?.extensiveDataProcessing || false;
});

function handleChange(value: boolean) {
  if (!authStore.user){
    router.replace({ path: "/error" });
    return;
  }
  apiService.user.updateUser(authStore.user?.id, { extensiveDataProcessing: value }).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('userDetails.updatedUserInfo'),
      life: 3000
    });
  }).catch((error) => {
    handleError(error, toast);
  });
}
</script>
<style scoped lang="scss">
</style>
