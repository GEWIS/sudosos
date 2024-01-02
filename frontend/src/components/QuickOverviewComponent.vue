<template>
  <CardComponent
    :header=" t('quickOverview.quickOverview')"
  >
    <div class="flex flex-column align-items-center">
      <p>{{ t('quickOverview.quickOverviewMessage')}}</p>
      <h1 class="text-5xl font-medium my-1">{{props.gewisId}}</h1>
      <h1 class="text-5xl font-medium text-center my-1">{{props.name}}</h1>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">

import CardComponent from '@/components/CardComponent.vue';
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  name: {
    required: true,
    type: String,
  },
  gewisId: {
    required: true,
    type: Number,
  }
});
</script>

<style scoped>

</style>
