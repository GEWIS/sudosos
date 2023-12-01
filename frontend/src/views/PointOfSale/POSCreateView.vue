<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_POSCreate.Create Point of Sale') }}</div>
    <hr />
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <h3>{{ $t('posInfo.General') }}</h3>
          <form @submit="handleCreatePOS">
            <span class="general-info-block">
              <b>{{ $t('posInfo.Title') }}</b>

              <InputText class="input" type="text" v-bind="title" :class="{'p-invalid': errors.title}" />
              <small
                  v-if="errors.title"
                  class="p-error"
              >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.title }}
            </small>
            <br v-else>
            </span>
            <span class="general-info-block">
              <b>{{ $t('posInfo.Owner') }}</b>
              <Dropdown
                class="input"
                :options="organsList"
                optionLabel="firstName"
                v-bind="owner"
                :placeholder="$t('c_POSCreate.Select owner')"
                :class="{'p-invalid': errors.owner}"
              />
              <small
                  v-if="errors.title"
                  class="p-error"
              >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.title }}
            </small>
            <br v-else>
            </span>
            <span class="general-info-block" style="flex-direction: row">
              <Checkbox
                v-bind="useAuthentication"
                inputId="useAuthentication"
                name="useAuthentication"
                :binary="true"
              />
              <label for="useAuthentication">{{ $t('c_POSCreate.Use authentication') }}</label>
            </span>
            <span class="general-info-block">
              <b>{{ $t('c_POSCreate.Selected containers') }}</b>
              <ul class="selected-containers">
                <li v-for="container in value" :key="container.id">
                  {{ container.name }}
                </li>
              </ul>
            </span>
            <Button
              id="create-pos-button"
              :label="$t('c_POSCreate.Create')"
              type="submit"
              severity="success"
            />
          </form>
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
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { useContainerStore } from '@/stores/container.store';
import DetailedContainerCardComponent from '@/components/DetailedContainerCardComponent.vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import type { ContainerResponse, UserResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useRouter } from 'vue-router';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useField, useForm } from 'vee-validate';
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";

const containerStore = useContainerStore();
const userStore = useUserStore();
const publicContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const ownContainers: Ref<Array<ContainerResponse> | null | undefined> = ref();
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const pointOfSaleStore = usePointOfSaleStore();
const router = useRouter();

// Vee-validate and yup validation definitions
const pointOfSaleSchema = toTypedSchema(
  yup.object({
    title: yup.string().required(),
    owner: yup.mixed<UserResponse>().required(),
    useAuthentication: yup.boolean().default(false).required(),
    selectedContainers: yup.mixed<Array<ContainerResponse>>()
  })
);
const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: pointOfSaleSchema
});
const title = defineComponentBinds('title');
const owner = defineComponentBinds('owner');
const useAuthentication = defineComponentBinds('useAuthentication', {});
const { value } = useField<ContainerResponse[]>(
  'selectedContainers',
  {},
  {
    initialValue: []
  }
);
const toast = useToast();

onMounted(async () => {
  if (userStore.getCurrentUser.user) {
    await containerStore.getPublicContainers().then((response) => {
      publicContainers.value = response.records;
    });
    await containerStore.getUsersContainers(
      userStore.getCurrentUser.user.id
    ).then((response) => {
      ownContainers.value = response.records.filter(
        (container) => container.public == false
      );
    });
    organsList.value = authStore.organs;
  } else {
    await router.replace({ path: '/error' });
  }
});

const handleCreatePOS = handleSubmit(async (values) => {
  await pointOfSaleStore.createPointOfSale(
    values.title,
    values.useAuthentication,
    values.selectedContainers ?
        values.selectedContainers.map((container: ContainerResponse) => container.id) : [],
    values.owner.id
  ).then(() => router.push('/point-of-sale/overview')).catch((err) => handleError(err, toast));
});

const handleSelectedChanged = (selected: any) => {
  value.value = selected;
};
</script>

<style scoped lang="scss">
// TODO: Generalize this style and the one from edit view
@import '@/styles/BasePage.css';

#pos-info-header {
  display: flex;
  justify-content: space-between;
}

hr {
  margin: 1rem 0;
}

:deep(.p-button) {
  margin: 0 5px !important;
}

.pos-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.pos-general-info {
  flex: 1;
  padding-left: 0.25rem !important;
  font-family: Lato, Arial, sans-serif !important;
  display: flex;
  flex-direction: column;
  color: black;
  font-size: 1rem;
  h3 {
    font-size: 1.75rem;
    font-family: Raleway, sans-serif !important;
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
  display: flex;
  flex-direction: column;
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
