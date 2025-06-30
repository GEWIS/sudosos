<template>
  <a v-if="allowed" class="cursor-pointer hover:opacity-80 text-primary" @click="goToUser">
    {{ name }}
  </a>
  <span v-else>{{ name }}</span>
</template>

<script setup lang="ts">
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import { computed } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { getRelation, isAllowed } from '@/utils/permissionUtils';

const { t } = useI18n();
const authStore = useAuthStore();

/**
 * Props for UserLink component.
 * @property user - The user to link to.
 * @property [newTab=false] - Open in new tab if true.
 */
interface UserLinkProps {
  user: BaseUserResponse;
  newTab?: boolean;
}

/**
 * Renders a link to a user's profile page.
 */
const props = defineProps<UserLinkProps>();

// If the user cannot get the balance, there is not much sensible to see at the profile page anyway.
const allowed = isAllowed('get', [getRelation(props.user.id)], 'Balance', ['any']);

const u = authStore.getUser;

const name = computed(() => {
  if (u?.id === props.user.id) return t('components.mutations.you');
  return `${props.user.firstName} ${props.user.lastName}`.trim();
});

const goToUser = () => {
  const routeData = router.resolve({ name: 'user', params: { userId: props.user.id } });
  window.open(routeData.href, '_blank');
};
</script>

<style scoped lang="scss"></style>
