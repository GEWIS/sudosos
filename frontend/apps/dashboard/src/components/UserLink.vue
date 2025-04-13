<template>
  <a class="cursor-pointer hover:text-red-800 text-red-500" @click="goToUser">
    {{ user.firstName }} {{ user.lastName }}
  </a>
</template>

<script setup lang="ts">
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import type { PropType } from 'vue';
import router from '@/router';

const props = defineProps({
  user: {
    type: Object as PropType<BaseUserResponse>,
    required: true,
  },
  newTab: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const goToUser = () => {
  const routeData = router.resolve({ name: 'user', params: { userId: props.user.id } });
  window.open(routeData.href, '_blank');
};
</script>

<style scoped lang="scss"></style>
