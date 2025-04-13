<template>
  <CardComponent class="p-0" :header="t('modules.seller.productContainers.containers.header')">
    <template #topAction>
      <div v-if="showCreate || associatedPos" class="flex gap-2 justify-content-endg">
        <Button v-if="posEditAllowed && associatedPos" outlined @click="openContainerAdd()">{{
          t('modules.seller.productContainers.containers.addExisting')
        }}</Button>
        <Button v-if="isAllowed('create', ['own', 'organ'], 'Container', ['any'])" @click="openContainerEdit()">
          {{ t('common.create') }}
        </Button>
      </div>
    </template>
    <Accordion
      :active-index="0"
      class="block w-full"
      :multiple="true"
      @tab-open="(event: AccordionTabOpenEvent) => onTabOpen(event)"
    >
      <AccordionTab v-for="container in containers" :key="container.id">
        <template #header>
          <div class="flex justify-content-between w-full">
            <span>
              {{ container.name }}
            </span>
            <div>
              <div class="px-5" @click="(event) => handleEditClick(event, container.id)">
                <span v-if="container.public" class="mr-4 text-xs uppercase">
                  {{ t('modules.seller.productContainers.containers.public') }}
                  <i v-if="isAllowed('update', ['own', 'organ'], 'Container', ['any'])" class="pi pi-pencil" />
                  <i v-else class="pi pi-info-circle" />
                </span>
              </div>
            </div>
          </div>
        </template>
        <ContainerProductGrid :container="container as ContainerWithProductsResponse" />
      </AccordionTab>
    </Accordion>
    <ContainerActionsDialog
      v-model:visible="visible"
      :associated-pos="associatedPos"
      :container="selectedContainer"
      :is-edit-allowed="isAllowed('update', ['own', 'organ'], 'Container', ['any'])"
    />
    <!-- For rendering in the point of sale view -->
    <POSAddContainerModal
      v-if="associatedPos"
      v-model:is-visible="POSAddContainerIsVisible"
      :associated-pos="associatedPos"
    />
  </CardComponent>
</template>
<script setup lang="ts">
import Accordion, { type AccordionTabOpenEvent } from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import { type Ref, ref } from 'vue';
import type { ContainerWithProductsResponse, PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import CardComponent from '../CardComponent.vue';
import POSAddContainerModal from '@/modules/seller/components/POSAddContainerModal.vue';
import ContainerActionsDialog from '@/components/container/ContainerActionsDialog.vue';
import { type ContainerInStore, useContainerStore } from '@/stores/container.store';
import ContainerProductGrid from '@/components/container/ContainerProductGrid.vue';
import { isAllowed } from '@/utils/permissionUtils';

const visible = ref(false);
const POSAddContainerIsVisible = ref(false);
const selectedContainer: Ref<ContainerWithProductsResponse | undefined> = ref(undefined);

const props = withDefaults(
  defineProps<{
    containers: ContainerInStore[];
    showCreate: boolean;
    associatedPos?: PointOfSaleWithContainersResponse;
    posEditAllowed?: boolean;
  }>(),
  { associatedPos: undefined, showCreate: false },
);

const containerStore = useContainerStore();
const { t } = useI18n();
const onTabOpen = async (event: AccordionTabOpenEvent) => {
  await containerStore.fetchContainer(props.containers[event.index].id);
};

const handleEditClick = async (event: Event, id: number) => {
  event.stopPropagation();
  await openContainerEdit(id);
};

const openContainerEdit = async (id?: number) => {
  if (id) {
    const container = props.containers.find((c) => c.id === id);
    if (container) selectedContainer.value = await containerStore.fetchContainer(container.id);
  } else selectedContainer.value = undefined;
  visible.value = true;
};

const openContainerAdd = () => {
  POSAddContainerIsVisible.value = true;
};
</script>
<style scoped lang="scss"></style>
