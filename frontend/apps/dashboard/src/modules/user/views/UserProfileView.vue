<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('modules.user.profile.title') }}</div>
    <div v-if="current.user" class="block md:hidden mb-4">
      <UserInfo :user="current.user" />
    </div>
    <div v-if="current.user" class="flex flex-col md:flex-row gap-8">
      <div class="flex flex-col gap-4 flex-1">
        <UserPinComponent />
        <UserSettingsComponent :user="current.user" />
      </div>
      <div class="hidden md:flex justify-center md:justify-start items-start flex-1">
        <UserInfo class="self-start shrink-0" :user="current.user" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import UserSettingsComponent from '@/modules/user/components/UserSettingsComponent.vue';
import UserInfo from '@/modules/user/components/UserInfo.vue';
import PageContainer from '@/layout/PageContainer.vue';
import UserPinComponent from '@/modules/user/components/UserPinComponent.vue';

const userStore = useUserStore();
const { t } = useI18n();

const { current } = storeToRefs(userStore);
</script>
<style scoped lang="scss"></style>
