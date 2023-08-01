<!--TODO: Input validation-->
<template>
  <div class="page-container">
    <div class="page-title">{{ `Edit Point of Sale: ${pos ? pos.name : ''}`}}</div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <h3>General</h3>
          <span class="general-info-block">
            <b>Title</b>
            <InputText class="input" type="text" v-model="title"/>
          </span>
          <span class="general-info-block">
            <b>Owner</b>
            <p>{{ pos.owner.firstName }}</p></span>
          <div>
            <span class="general-info-block" style="flex-direction: row;">
              <Checkbox v-model="useAuthentication"
                        inputId="useAuthentication"
                        name="useAuthentication"
                        value="useAuthentication"
                        :binary="true"
              />
              <label for="useAuthentication">Use Authentication</label>
            </span>
          </div>
          <span class="general-info-block">
            <b>Selected Containers</b>
            <ul class="selected-containers">
              <li v-for="container in selectedContainers" :key="container.id">
                {{ container.name }}
              </li>
            </ul>
          </span>
          <Button id="create-pos-button" label="Edit" @click="updatePointOfSale" severity="success"/>
        </div>
        <DetailedContainerCardComponent
            @selectedChanged="handleSelectedChanged"
            class="container-card"
            v-if="publicContainers && ownContainers"
            :own-containers="ownContainers"
            :public-containers="publicContainers"
            :selectedContainers="selectedContainers"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onBeforeMount, ref } from "vue";
import type { Ref } from "vue";
import { useContainerStore } from "@/stores/container.store";
import DetailedContainerCardComponent from "@/components/DetailedContainerCardComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import type { BaseUserResponse, ContainerResponse, UserResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useRoute, useRouter } from "vue-router";
import { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";

const title = ref(null);

const containerStore = useContainerStore();
const userStore = useUserStore();
const publicContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const ownContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const selectedContainers: Ref<Array<ContainerResponse> | undefined> = ref();
const useAuthentication = ref(false);
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const pointOfSaleStore = usePointOfSaleStore();
const router = useRouter();
const id = ref();
const route = useRoute();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();
const selectedOwner: Ref<BaseUserResponse | undefined> = ref();

onBeforeMount(async () => {
  id.value = route.params.id;
  pos.value = pointOfSaleStore.getPos;
  useAuthentication.value = pos.value?.useAuthentication;
  selectedContainers.value = pos.value.containers;
  console.error("containers are: " + selectedContainers.value);
  title.value = pos.value.name;
  selectedOwner.value = pos.value.owner;
  console.log(selectedContainers.value);
  if (userStore.getCurrentUser.user ) {
    const publicContainersResponse = await containerStore.getPublicContainers();
    const ownContainersResponse = await containerStore.getUsersContainers(userStore.getCurrentUser.user.id);
    publicContainers.value = publicContainersResponse.records;
    ownContainers.value = ownContainersResponse.records.filter((container) => container.public == false);
    organsList.value = authStore.organs;
  } else {
    console.error("User not found"); // TODO: Error handling
  }
});

const handleSelectedChanged = (selected: any) => {
  selectedContainers.value = selected;
};

const updatePointOfSale = async () => {
  if (title.value && selectedOwner.value && pos.value) {
    const response = await pointOfSaleStore.updatePointOfSale(
        title.value,
        pos.value.id,
        useAuthentication.value,
        selectedContainers.value.map((container: ContainerResponse) => container.id),
    );
    if (response.status == 200){
      router.push('/point-of-sale/overview');
    } else {
      // TODO: Error Toasts
    }
  }
};

</script>

<style scoped lang="scss">
// TODO: Generalize this style and the one from create view
@import "@/styles/BasePage.css";

#pos-info-header {
  display: flex;
  justify-content: space-between;
}

hr {
  margin: 1rem 0;
}

:deep(.p-button){
  margin: 0 5px !important;
}

.pos-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.pos-general-info {
  flex: 1;
  padding-left: 0.25rem!important;
  font-family: Lato,Arial,sans-serif!important;
  display: flex;
  flex-direction: column;
  color: black;
  font-size: 1rem;
  h3 {
    font-size: 1.75rem;
    font-family: Raleway, sans-serif!important;
    margin-bottom: 0.5rem;
  }

  b {
    font-weight: bolder;
  }

  .input {
    width: 80%;
  }

  #create-pos-button {
    width: fit-content;
  }
}

.container-card {
  flex: 3;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

.pos-transactions {
  width: 100%;
  margin-top: 3rem;
}

.general-info-block {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
