<template>
  <CardComponent :header="t('components.general.quickOverview.header')">
    <div v-if="props.user" class="@container">
      <div class="flex flex-col-reverse @sm:flex-row @sm:justify-center items-center gap-2">
        <span class="text-2xl font-bold text-center"> {{ props.user.firstName }} {{ props.user.lastName }} </span>
        <span class="text-2xl text-center font-mono font-semibold text-gray-500">
          {{ props.user.memberId ? props.user.memberId : `E${props.user.id}` }}
        </span>
      </div>
      <p v-if="!props.user.ofAge" class="font-bold text-center text-red-500 mt-2">
        {{ t('components.general.quickOverview.underAge') }}
      </p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import type { UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const props = defineProps({
  user: {
    type: Object as () => UserResponse | null,
    required: true,
  },
});
</script>
