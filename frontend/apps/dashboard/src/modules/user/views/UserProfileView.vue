<template>
  <div class="page-container">
    <div class="page-title">
      {{ t('profile.myProfile')}}
    </div>
    <div class="flex md:flex-row flex-column-reverse justify-content-between gap-4">
      <UserSettingsComponent :user="current.user as UserResponse"/>
      <UserInfo :user="gewisUser || current.user as GewisUserResponse"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import type { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import { onMounted, type Ref, ref } from "vue";
import apiService from "@/services/ApiService";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";
import UserSettingsComponent from "@/modules/user/components/UserSettingsComponent.vue";
import UserInfo from "@/modules/user/components/UserInfo.vue";

const userStore = useUserStore();
const authStore = useAuthStore();
const dataAnalysis: Ref<boolean> = ref(false);
const { current } = storeToRefs(userStore);
const toast = useToast();
const { t } = useI18n();
const gewisUser: Ref<GewisUserResponse | undefined> = ref(undefined);

onMounted(async () => {
  if (!userStore.current.user) {
    await router.replace({ path: "/error" });
    return;
  }
  gewisUser.value = await userStore.fetchGewisUser(userStore.current.user.id, apiService);
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
