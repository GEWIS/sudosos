<template>
  <div class="page-container">
    <div class="page-title">{{ $t('c_POSCreate.Create Point of Sale') }}</div>
    <hr />
    <div class="flex flex-column md:flex-row gap-5 my-3">
      <div class="flex flex-column">
        <h2>{{ $t('posInfo.General') }}</h2>
        <form @submit="handleCreatePOS">
          <div class="flex flex-column">
            <label for="title">{{ $t("posInfo.Title") }}</label>
            <InputText inputId="title" id="title" class="input" type="text" v-bind="title"
              :class="{'p-invalid': errors.title}" />
            <small id="title-help" v-if="errors.title" class="p-error">
              <i class="pi pi-exclamation-circle" />{{ " " + errors.title }}
            </small>
            <br v-else>
          </div>
          <div class="flex flex-column">
            <b>{{ $t("posInfo.Owner") }}</b>
            <Dropdown class="input" :options="organsList" optionLabel="firstName" v-bind="owner"
              :placeholder="$t('c_POSCreate.Select owner')" :class="{'p-invalid': errors.owner}" />
            <small v-if="errors.title" class="p-error">
              <i class="pi pi-exclamation-circle" />{{ " " + errors.title }}
            </small>
            <br v-else>
          </div>
          <div class="flex flex-row gap-2">
            <Checkbox v-bind="useAuthentication" inputId="useAuthentication" name="useAuthentication" :binary="true"
              class="my-auto" />
            <label for="useAuthentication">{{ $t("c_POSCreate.Use authentication") }}</label>
          </div>
          <div class="flex flex-column">
            <b>{{ $t("c_POSCreate.Selected containers") }}</b>
            <i v-if="isEmpty(value)">{{ $t("c_POSCreate.noContainersSelected") }}</i>
            <ul v-else class="selected-containers">
              <li v-for="container in value" :key="container.id">
                {{ container.name }}
              </li>
            </ul>
          </div>
          <div class="flex justify-content-end mt-2">
            <Button id="create-pos-button" :label="$t('c_POSCreate.Create')" type="submit" />
          </div>
        </form>
      </div>
      <DetailedContainerCardComponent class="w-full" @selectedChanged="handleSelectedChanged"
        v-if="publicContainers && ownContainers" :own-containers="ownContainers"
        :public-containers="publicContainers" :isLoading="isLoading"/>
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
import { isEmpty } from "lodash";

const isLoading: Ref<boolean> = ref(true);
const containerStore = useContainerStore();
const userStore = useUserStore();
const publicContainers: Ref<Array<ContainerResponse> | null | undefined> = ref(new Array(10));
const ownContainers: Ref<Array<ContainerResponse> | null | undefined> = ref(new Array(10));
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
    isLoading.value = false;
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
