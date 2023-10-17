<template>
  <div class="page-container">
    <div class="page-title">{{ `${$t('c_POSCreate.Edit Point of Sale')}: ${pos ? pos.name : ''}`}}</div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <form @submit="handleEditPOS">
            <h3>{{ $t("c_POSCreate.General") }}</h3>
            <span class="general-info-block">
              <b>{{ $t("c_POSCreate.Title") }}</b>
              <InputText class="input" type="text" v-bind="title" :class="{'p-invalid': errors.title}"/>
              <small
                  v-if="errors.title"
                  class="p-error"
              >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.title }}
            </small>
            <br v-else>
            </span>
            <div class="general-info-block">
              <b>{{ $t("c_POSCreate.Owner") }}</b>
              <p>{{ posDisplayName }}</p>
            </div>
            <div>
            <span class="general-info-block" style="flex-direction: row; align-items: center;">
              <Checkbox v-bind="useAuthentication"
                        inputId="useAuthentication"
                        name="useAuthentication"
                        value="useAuthentication"
                        :binary="true"
              />
              <label for="useAuthentication">{{ $t("c_POSCreate.Use authentication") }}</label>
            </span>
            </div>
            <div class="general-info-block">
              <b>{{ $t("c_POSCreate.Selected containers") }}</b>
              <ul class="selected-containers">
                <li v-for="container in selectedContainers" :key="container.id">
                  {{ container.name }}
                </li>
              </ul>
            </div>
            <Button id="create-pos-button" :label="$t('c_containerEditModal.save')" type="submit" severity="success"/>
          </form>
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

import { computed, onBeforeMount, ref } from "vue";
import type { Ref } from "vue";
import { useContainerStore } from "@/stores/container.store";
import DetailedContainerCardComponent from "@/components/DetailedContainerCardComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import type { BaseUserResponse, ContainerResponse, UserResponse } from "@sudosos/sudosos-client";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useRoute } from "vue-router";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import * as yup from 'yup';
import { useForm } from "vee-validate";
import apiService from "@/services/ApiService";

const { defineComponentBinds, handleSubmit, errors, setValues } = useForm({
  validationSchema: {
    title: yup.string().required(),
    useAuthentication: yup.boolean().required(),
    selectedContainers: yup.mixed<Array<ContainerResponse>>(),
  }
});

const title = defineComponentBinds('title');

const containerStore = useContainerStore();
const userStore = useUserStore();
const publicContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const ownContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const selectedContainers: Ref<Array<ContainerResponse> | undefined> = ref();
const useAuthentication = defineComponentBinds('useAuthentication');
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const pointOfSaleStore = usePointOfSaleStore();
const id = ref();
const route = useRoute();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();
const selectedOwner: Ref<BaseUserResponse | undefined> = ref();

const posDisplayName = computed(() => {
  if (!pos.value || !pos.value.owner) return "";
  return pos.value.owner.firstName + pos.value.owner.lastName;
});

onBeforeMount(async () => {
  id.value = route.params.id;
  const posRes = await apiService.pos.getSinglePointOfSale(id.value);
  pos.value = posRes.data;

  if (userStore.getCurrentUser.user ) {
    const publicContainersResponse = await containerStore.getPublicContainers();
    const ownContainersResponse = await containerStore.getUsersContainers(userStore.getCurrentUser.user.id);
    publicContainers.value = publicContainersResponse.records;
    ownContainers.value = ownContainersResponse.records.filter((container) => container.public == false);
    organsList.value = authStore.organs;
  } else {
    // TODO: Error handling
    // See: https://github.com/gewis/sudosos-frontend-vue3/issues/18
  }
  if (pos.value) {
    setValues({
      useAuthentication : pos.value.useAuthentication,
      title: pos.value.name,
    });
    selectedContainers.value = pos.value.containers;
    selectedOwner.value = pos.value.owner;
  }
});

const handleSelectedChanged = (selected: any) => {
  selectedContainers.value = selected;
};

const handleEditPOS = handleSubmit(async (values) => {
    if (!pos.value) return;
    const handleEditPOSResponse = await pointOfSaleStore.updatePointOfSale(
        values.title,
        pos.value.id,
        values.useAuthentication,
        values.selectedContainers.map((cont: ContainerResponse) => cont.id),
    );
    console.warn(handleEditPOSResponse.status);
    // TODO: Correct error handling
    // See: https://github.com/GEWIS/sudosos-frontend-vue3/issues/18
});
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

  label {
    margin-left: 10px;
  }
}

:deep(tr.p-highlight) {
  color: black;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height:18px;
}

.p-error > i {
  font-size:12px;
  margin-right: 3.6px;
  line-height:12px;
}
</style>
