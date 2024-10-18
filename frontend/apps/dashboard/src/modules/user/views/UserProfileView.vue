<template>
  <div class="page-container">
    <div class="page-title">
      {{ t('modules.user.profile.title') }}
    </div>
    <div class="flex md:flex-row flex-column-reverse justify-content-between gap-4">
      <UserSettingsComponent :user="current.user as UserResponse"/>
      <UserInfo :user="gewisUser || current.user as GewisUserResponse"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { type StoreGeneric, storeToRefs } from "pinia";
import type { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import { onMounted, type Ref, ref } from "vue";
import apiService from "@/services/ApiService";
import router from "@/router";
import { useI18n } from "vue-i18n";
import UserSettingsComponent from "@/modules/user/components/UserSettingsComponent.vue";
import UserInfo from "@/modules/user/components/UserInfo.vue";

const userStore = useUserStore();
const dataAnalysis: Ref<boolean> = ref(false);
const { current } = storeToRefs(userStore as StoreGeneric as StoreGeneric);
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
</script>
<style scoped lang="scss">
</style>
