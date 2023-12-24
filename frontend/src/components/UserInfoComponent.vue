<template>
  <CardComponent :header="$t('c_userInfo.quick')">
    <div class="body">
      <p class="text-gray-700">Show this at the bar so we can help you faster.</p>
      <h1 class="text-center">
        {{ isGewisUser(props.user) ? props.user.gewisId : `E${props.user.id}` }} <br/>
        {{ props.user.firstName }} {{ props.user.lastName }}
      </h1>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import type { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";

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
