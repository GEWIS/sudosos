<template>
  <CardComponent :header="$t('containersOverview.Containers')" class="p-0">
    <template #topAction>
      <div v-if="showCreate || associatedPos" class="flex justify-content-endg gap-2">
        <Button
            v-if="associatedPos"
            @click="openContainerAdd()"
            outlined>{{$t('containersOverview.addExisting')}}</Button>
        <Button @click="openContainerEdit()">{{$t('app.Create')}}</Button>
      </div>
    </template>
    <Accordion :activeIndex="0" class="block w-full" :multiple="true"
               @tab-open="(event: AccordionTabOpenEvent) => onTabOpen(event)">
      <AccordionTab v-for="container in containers" :key="container.id">
        <template #header>
          <div class="flex justify-content-between w-full">
            <span>
              {{ container.name }}
            </span>
            <div>
              <div @click="(event) => handleEditClick(event, container.id)" class="px-5">
                <span class="mr-4 text-xs uppercase" v-if="container.public">
                  {{ $t('c_containerEditModal.Public') }}</span>
                <i class="pi pi-pencil"/>
              </div>
            </div>
          </div>
        </template>
        <ContainerProductGrid :container="container as ContainerWithProductsResponse"/>
      </AccordionTab>
    </Accordion>
    <ContainerActionsDialog
        :container="selectedContainer"
        v-model:visible="visible"
        :associatedPos="associatedPos"/>
    <!-- For rendering in the point of sale view -->
    <POSAddContainerModal
        v-if="associatedPos"
        :associated-pos="associatedPos"
        v-model:is-visible="POSAddContainerIsVisible" />
  </CardComponent>

</template>
<script setup lang="ts">
import ContainerProductGrid from "@/components/container/ContainerProductGrid.vue";
import CardComponent from "../CardComponent.vue";
import Accordion, { type AccordionTabOpenEvent } from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";
import { type PropType, type Ref, ref } from "vue";
import ContainerActionsDialog from "@/components/container/ContainerActionsDialog.vue";
import type { ContainerWithProductsResponse, PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import POSAddContainerModal from "@/modules/seller/components/POSAddContainerModal.vue";

const visible = ref(false);
const POSAddContainerIsVisible = ref(false);
const selectedContainer: Ref<ContainerWithProductsResponse | undefined> = ref(undefined);

const props = defineProps({
  containers: {
    type: Array<ContainerInStore>,
    required: true,
  },
  showCreate: {
    type: Boolean,
    default: false,
  },
  associatedPos: {
    type: Object as PropType<PointOfSaleWithContainersResponse>,
    required: false
  }
});

const containerStore = useContainerStore();

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
  }
  else selectedContainer.value = undefined;
  visible.value = true;
};

const openContainerAdd = async () => {
  POSAddContainerIsVisible.value = true;
};

</script>
<style scoped lang="scss">

</style>
