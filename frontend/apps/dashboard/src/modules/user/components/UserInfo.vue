<template>
  <CardComponent :header="t('components.general.quickOverview.header')">
    <p class="text-gray-700">{{ t('components.general.quickOverview.message') }}</p>
    <h1 class="text-center text-2xl font-bold my-4">
      {{ isGewisUser(props.user) ? props.user.gewisId : `E${props.user.id}` }} <br />
      {{ props.user.firstName }} {{ props.user.lastName }}
    </h1>
    <p v-if="!props.user.ofAge" class="font-bold text-center text-red-500">
      {{ t('components.general.quickOverview.underAge') }}
    </p>
  </CardComponent>
</template>

<script setup lang="ts">
import type { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const props = defineProps({
  user: {
    type: Object as () => UserResponse | GewisUserResponse,
    required: true,
  },
});

// Type guard
function isGewisUser(user: UserResponse | GewisUserResponse): user is GewisUserResponse {
  return (user as GewisUserResponse).gewisId !== undefined;
}
</script>

<style scoped lang="scss">
// Your styles here
</style>
