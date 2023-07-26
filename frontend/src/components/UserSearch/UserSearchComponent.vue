<template>
  <div class="point-of-sale">
    <div class="header">
      <div class="search-container">
        <div class="search-close" @click="cancelSearch()">
          <font-awesome-icon class="icon" icon="fa-solid fa-xmark"/>
        </div>
        <input type="text" class="search-input" id="searchInput" v-model="searchQuery" placeholder="Search..."/>
        <div class="search-button" @click="selectSelf()">
          Charge yourself
        </div>
      </div>
    </div>
    <div class="user-row-wrapper">
      <UserSearchRowComponent v-for="user in users" :user="user" v-bind="user.id" @click="selectUser(user)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, watch } from "vue";
import apiService from "@/services/ApiService";
import { UserResponse } from "@sudosos/sudosos-client";
import UserSearchRowComponent from "@/components/UserSearch/UserSearchRowComponent.vue";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";

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

// TODO Optimize?
watch(searchQuery, () => {
  apiService.user.getAllUsers(10, 0,searchQuery.value, true).then((res) => {
    users.value = res.data.records;
  });
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
.search-container {
  display: flex;
  width: 100%;
  gap: 10px;
}

.search-input {
  flex-grow: 2;
}

.search-close {
  background-color: var(--accent-color);
  font-size: 40px;
  border-radius: 10px;
  min-width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;

  > .icon {
    color: white;
  }
}

.user-row-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
