<template>
  <AppLink :allowed="allowed" :new-tab="newTab" :text="name" :to="userRoute" />
</template>

<script setup lang="ts">
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import { computed } from 'vue';
import { useAuthStore, getRelation, isAllowed } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import AppLink from '@/components/AppLink.vue';

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

const userRoute = computed(() => ({ name: 'user', params: { userId: props.user.id } }));
const newTab = computed(() => props.newTab ?? false);
</script>

<style scoped lang="scss"></style>
