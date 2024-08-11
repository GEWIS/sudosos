<template>
  <a class="cursor-pointer text-red-500 hover:text-red-800" @click="goToUser">
    {{ user.firstName }} {{ user.lastName }}
  </a>
</template>

<script setup lang="ts">
import type { BaseUserResponse } from "@sudosos/sudosos-client";
import type { PropType } from "vue";
import router from "@/router";

const props = defineProps({
  user: {
    type: Object as PropType<BaseUserResponse>,
    required: true,
  }
});

const goToUser = () => {
  router.push({ name: 'user', params: { userId: props.user.id } });
};

</script>

<style scoped lang="scss">

</style>
