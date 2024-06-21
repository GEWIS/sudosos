<template>
  <div class="page-container">
    <div class="page-title">
      {{ `${$t('c_POSCreate.Edit Point of Sale')}: ${pos ? pos.name : ''}` }}
    </div>
    <hr />
    <div class="flex flex-column md:flex-row gap-5 my-3">
      <div class="flex flex-column">
        <h2>{{ $t('c_POSCreate.General') }}</h2>
        <form @submit="handleEditPOS">
          <div class="flex flex-column">
            <b>{{ $t('c_POSCreate.Title') }}</b>
            <InputText class="input" type="text" v-model="title" v-bind="titleAttrs"
              :class="{ 'p-invalid': errors.title }" />
            <small v-if="errors.title" class="p-error">
              <i class="pi pi-exclamation-circle" />{{ ' ' + errors.title }}
            </small>
            <br v-else />
          </div>
          <div class="flex flex-column">
            <b>{{ $t('c_POSCreate.Owner') }}</b>
            <p>{{ posDisplayName }}</p>
          </div>
          <div class="flex flex-row gap-2">
            <Checkbox v-model="useAuthentication" v-bind="useAuthenticationAttrs" inputId="useAuthentication"
              name="useAuthentication" value="useAuthentication" :binary="true" class="my-auto" />
            <label for="useAuthentication">{{ $t('c_POSCreate.Use authentication') }}</label>
          </div>
          <div class="flex flex-column">
            <b>{{ $t('c_POSCreate.Selected containers') + ":" }}</b>
            <i v-if="isEmpty(selectedContainers)">{{ $t("c_POSCreate.noContainersSelected") }}</i>
            <ul v-else class="selected-containers m-0">
              <li v-for="container in selectedContainers" :key="container.id">
                {{ container.name }}
              </li>
            </ul>
          </div>
          <div class="flex justify-content-end mt-2">
            <Button id="create-pos-button" :label="$t('c_containerEditModal.save')" type="submit" />
          </div>
        </form>
      </div>
      <DetailedContainerCardComponent @selectedChanged="handleSelectedChanged" class="w-full"
        v-if="publicContainers && ownContainers" :own-containers="ownContainers" :public-containers="publicContainers"
        :selectedContainers="selectedContainers" :isLoading="isLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
import { useContainerStore } from '@/stores/container.store';
import DetailedContainerCardComponent from '@/components/DetailedContainerCardComponent.vue';
import type { BaseUserResponse, ContainerResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useRoute } from 'vue-router';
import type { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import apiService from '@/services/ApiService';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { handleError } from '@/utils/errorUtils';
import router from "@/router";
import { isEmpty } from "lodash";

const toast = useToast();
const { t } = useI18n();
const { defineField, handleSubmit, errors, setValues } = useForm({
  validationSchema: {
    title: yup.string().required(),
    useAuthentication: yup.boolean().required(),
    selectedContainers: yup.mixed<Array<ContainerResponse>>()
  }
});

const [title, titleAttrs] = defineField('title');

const containerStore = useContainerStore();

const publicContainers = computed(() => Object.values(containerStore.getPublicContainers));
const ownContainers = computed(() => Object.values(containerStore.getUsersContainers));

const selectedContainers: Ref<Array<ContainerResponse> | undefined> = ref();
const [useAuthentication, useAuthenticationAttrs] = defineField('useAuthentication');
const pointOfSaleStore = usePointOfSaleStore();
const id = ref();
const route = useRoute();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();
const selectedOwner: Ref<BaseUserResponse | undefined> = ref();
const isLoading: Ref<boolean> = ref(true);
const posDisplayName = computed(() => {
  if (!pos.value || !pos.value.owner) return '';
  return pos.value.owner.firstName + pos.value.owner.lastName;
});

onBeforeMount(async () => {
  await containerStore.fetchAllIfEmpty();

  id.value = route.params.id;
  await apiService.pos.getSinglePointOfSale(id.value).then((response) => {
    pos.value = response.data;
  }).catch(() => {
    router.replace({ path: '/error' });
  });

  if (pos.value) {
    setValues({
      useAuthentication: pos.value.useAuthentication,
      title: pos.value.name
    });
    selectedContainers.value = pos.value.containers;
    selectedOwner.value = pos.value.owner;
  }
  isLoading.value = false;
});

const handleSelectedChanged = (selected: any) => {
  selectedContainers.value = selected;
};

const handleEditPOS = handleSubmit(async (values) => {
  if (!pos.value || !selectedContainers.value) {
    await router.replace({ path: '/error' });
    return;
  }
  await pointOfSaleStore
    .updatePointOfSale(
      values.title,
      pos.value.id,
      values.useAuthentication,
      selectedContainers.value.map((cont: ContainerResponse) => cont.id)
    )
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.editPOS'),
        life: 3000
      });
      router.push({ name: 'pointOfSaleInfo', params: { id: id.value } });
    }).catch((error) => handleError(error, toast));
});
</script>

<style scoped lang="scss">
// TODO: Generalize this style and the one from create view

.p-invalid {
  background-color: #fef0f0;
}

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height: 18px;
}

.p-error > i {
  font-size: 12px;
  margin-right: 3.6px;
  line-height: 12px;
}
</style>
