<template>
  <CardComponent class="p-0" :header="t('modules.seller.productContainers.containers.header')">
    <template #topAction>
      <div v-if="showCreate || associatedPos" class="flex gap-2 justify-end">
        <Button v-if="posEditAllowed && associatedPos" outlined @click="openContainerAdd()"
          >{{ t('modules.seller.productContainers.containers.addExisting') }}
        </Button>
        <Button v-if="isAllowed('create', ['own', 'organ'], 'Container', ['any'])" @click="openContainerEdit()">
          {{ t('common.create') }}
        </Button>
      </div>
    </template>
    <Accordion class="block w-full" :multiple="true" @tab-open="onTabOpen">
      <AccordionPanel v-for="container in containers" :key="container.id" :value="container.id">
        <AccordionHeader>
          <div class="flex items-center w-full gap-2">
            <Badge
              class="min-w-[3.5rem]"
              :severity="container.public ? 'success' : 'secondary'"
              :value="
                container.public
                  ? t('modules.seller.productContainers.containers.public')
                  : t('modules.seller.productContainers.containers.private')
              "
            />
            <span>{{ container.name }}</span>
            <span class="flex-1"></span>

            <div
              v-if="isAllowed('update', ['own', 'organ'], 'Container', ['any'])"
              class="flex flex-row gap-2 justify-end"
            >
              <span
                v-if="canRemoveFromPos"
                class="mr-4 text-xs uppercase"
                @click="(event) => handleRemoveClick(event, container.id)"
              >
                <ConfirmDialog :group="`containerDeletePos-${container?.id}`" />
                <i class="pi pi-sign-out" />
              </span>
              <span class="mr-4 text-xs uppercase" @click="(event) => handleEditClick(event, container.id)">
                <i class="pi pi-pencil" />
              </span>
            </div>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <ContainerProductGrid :container="container as ContainerWithProductsResponse" />
        </AccordionContent>
      </AccordionPanel>
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
import { computed, type Ref, ref } from 'vue';
import type { ContainerWithProductsResponse, PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import CardComponent from '../CardComponent.vue';
import POSAddContainerModal from '@/modules/seller/components/POSAddContainerModal.vue';
import ContainerActionsDialog from '@/components/container/ContainerActionsDialog.vue';
import { type ContainerInStore, useContainerStore } from '@/stores/container.store';
import ContainerProductGrid from '@/components/container/ContainerProductGrid.vue';
import { useDeleteContainerPOS } from '@/composables/deleteContainerPOS';

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
  const index = props.containers.findIndex((c) => c.id === event.index);
  if (index === -1) return;
  await containerStore.fetchContainer(props.containers[index].id);
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

const canRemoveFromPos = computed(() => {
  if (!props.associatedPos) return false;
  return isAllowed('update', ['own', 'organ'], 'PointOfSale', ['any']);
});

const deleteContainerPOS = useDeleteContainerPOS();
const handleRemoveClick = (event: Event, id: number) => {
  const index = props.containers.findIndex((c) => c.id === id);
  event.stopPropagation();
  if (!props.associatedPos || index === -1) return;
  deleteContainerPOS(props.associatedPos, props.containers[index]);
};
</script>
<style scoped lang="scss"></style>
