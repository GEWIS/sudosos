<template>
    <CardComponent :header="t('c_userInfo.quick')" >
        <p class="text-gray-700">{{ t("quickOverview.quickOverviewMessage") }}</p>
        <h1 class="text-center">
          {{ isGewisUser(props.user) ? props.user.gewisId : `E${props.user.id}` }} <br />
          {{ props.user.firstName }} {{ props.user.lastName }}
        </h1>
        <p class="font-bold text-red-500 text-center" v-if="!props.user.ofAge">{{ t("quickOverview.underAge") }}</p>
    </CardComponent>
</template>

<script setup lang="ts">
import type { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import { useI18n } from "vue-i18n";

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
