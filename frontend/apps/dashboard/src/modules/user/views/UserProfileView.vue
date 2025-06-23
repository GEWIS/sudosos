<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('modules.user.profile.title') }}</div>
    <div class="flex flex-col">
      <div class="flex flex-col justify-between md:flex-row">
        <UserSettingsComponent class="flex-grow-1" :user="current.user as UserResponse" />
        <UserInfo class="self-start shrink-0" :user="gewisUser || (current.user as GewisUserResponse)" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { type StoreGeneric, storeToRefs } from 'pinia';
import type { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { onMounted, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apiService from '@/services/ApiService';
import router from '@/router';
import UserSettingsComponent from '@/modules/user/components/UserSettingsComponent.vue';
import UserInfo from '@/modules/user/components/UserInfo.vue';
import PageContainer from '@/layout/PageContainer.vue';

const userStore = useUserStore();
const dataAnalysis: Ref<boolean> = ref(false);
const { current } = storeToRefs(userStore as StoreGeneric);
const { t } = useI18n();
const gewisUser: Ref<GewisUserResponse | undefined> = ref(undefined);

onMounted(async () => {
  if (!userStore.current.user) {
    await router.replace({ path: '/error' });
    return;
  }
  gewisUser.value = await userStore.fetchGewisUser(userStore.current.user.id, apiService);
  dataAnalysis.value = userStore.getUserById(userStore.current.user.id)?.extensiveDataProcessing || false;
});
</script>
<style scoped lang="scss"></style>
