<!--TODO: Input validation-->
<template>
  <div class="page-container">
    <div class="page-title">{{ $t("c_POSCreate.Create Point of Sale") }}</div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <h3>{{ $t("posInfo.General") }}</h3>
          <span class="general-info-block">
            <b>{{ $t("posInfo.Title") }}</b>
            <InputText class="input" type="text" v-model="title"/>

          </span>
          <span class="general-info-block">
            <b>{{ $t("posInfo.Owner") }}</b>
            <Dropdown
                class="input"
                :options="organsList"
                optionLabel="firstName"
                v-model="selectedOwner"
                :placeholder="$t('c_POSCreate.Select owner')"
            />
          </span>
          <span class="general-info-block" style="flex-direction: row;">
            <Checkbox
                v-model="useAuthentication"
                inputId="useAuthentication"
                name="useAuthentication"
                value="useAuthentication"
                :binary="true"
            />
            <label for="useAuthentication">{{ $t("c_POSCreate.Use Authentication") }}</label>
          </span>
          <span class="general-info-block" >
            <b>{{ $t("c_POSCreate.Selected Containers") }}</b>
            <ul class="selected-containers">
              <li v-for="container in selectedContainers" :key="container.id">
                {{ container.name }}
              </li>
            </ul>
          </span>
          <Button
              id="create-pos-button"
              :label="$t('c_POSCreate.Create')"
              @click="createPointOfSale"
              severity="success"
          />
        </div>
        <DetailedContainerCardComponent
            @selectedChanged="handleSelectedChanged"
            class="container-card"
            v-if="publicContainers && ownContainers"
            :own-containers="ownContainers"
            :public-containers="publicContainers"
        />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import { useContainerStore } from "@/stores/container.store";
import DetailedContainerCardComponent from "@/components/DetailedContainerCardComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import type { ContainerResponse, UserResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useRouter } from "vue-router";

const title = ref(null);
const selectedOwner: Ref<UserResponse | undefined> = ref();
const containerStore = useContainerStore();
const userStore = useUserStore();
const publicContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const ownContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const selectedContainers = ref();
const useAuthentication = ref(false);
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const pointOfSaleStore = usePointOfSaleStore();
const router = useRouter();

onMounted(async () => {
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

const createPointOfSale = async () => {
  console.warn(title.value);
  console.error(selectedOwner.value);
  console.warn(useAuthentication.value);
  console.error(selectedContainers.value);
  if (title.value && selectedOwner.value) {
    const response = await pointOfSaleStore.createPointOfSale(
        title.value,
        useAuthentication.value,
        selectedContainers.value.map((container: ContainerResponse) => container.id),
        selectedOwner.value.id
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
// TODO: Generalize this style and the one from edit view
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

  p {
    margin-bottom: 1rem;
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
