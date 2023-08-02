<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="header-row">
        <div class="c-btn active square search-close icon-large" @click="cancelSearch()">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
        </div>
        <input type="text" ref="searchInput" class="flex-sm-grow-1" v-model="searchQuery" placeholder="Search..."/>
        <div class="c-btn active rounder fs-5" @click="selectSelf()">
          Charge yourself
        </div>
      </div>
    </div>
    <div class="flex-column gap-sm-3">
      <UserSearchRowComponent v-for="user in sortedUsers" :user="user" :key="user.id" @click="selectUser(user)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, onMounted, ref, watch } from "vue";
import apiService from "@/services/ApiService";
import { PaginatedUserResponse, UserResponse } from "@sudosos/sudosos-client";
import UserSearchRowComponent from "@/components/UserSearch/UserSearchRowComponent.vue";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { debounce } from 'lodash';
import type { AxiosResponse } from 'axios';

const searchQuery = ref<string>('');

const users = ref<UserResponse[]>([]);
const cartStore = useCartStore();
const authStore = useAuthStore();
// const posStore = usePointOfSaleStore();


// TODO Idea to show recent users when searching?
// apiService.pos.getTransactions(posStore.getPos?.id).then((res) => {
//   const data = res.data as PaginatedBaseTransactionResponse;
//   const ids = new Set<number>([]);
//   data.records.map((u) => {
//     if (!ids.has(u.from.id)) {
//       users.value.push(u.from);
//       ids.add(u.from.id);
//     };
//   });
// });

const delayedAPICall = debounce(() => {
  apiService.user.getAllUsers(10, 0, searchQuery.value, true).then((res: AxiosResponse<PaginatedUserResponse, any>) => {
    users.value = res.data.records;
  });
}, 500);

watch(searchQuery, () => {
  delayedAPICall();
});

const sortedUsers = computed(() => {
  const validUsers = users.value.filter(user => user.active && user.acceptedToS !== "NOT_ACCEPTED");
  const invalidUsers = users.value.filter(user => !user.active || user.acceptedToS === "NOT_ACCEPTED");
  return [...validUsers, ...invalidUsers];
});

const searchInput = ref<null | HTMLInputElement>(null);

onMounted(() => {
  if (searchInput.value) searchInput.value.focus();
});

const emit = defineEmits(['cancelSearch']);
const selectSelf = () => {
  if (authStore.user) selectUser(authStore.user);
};

const selectUser = (user: UserResponse) => {
  cartStore.setBuyer(user);
  cancelSearch();
};

const cancelSearch = () => {
  emit('cancelSearch');
};

</script>

<style scoped lang="scss">
</style>
