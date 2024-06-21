<template>
  <CardComponent header="containers">
    <template #topAction>
      <!-- Header content goes here -->
      <Button
              @click="visible = true"
      >{{ $t("c_POSCreate.add container") }}</Button>
      <ContainerActionsDialog v-model:visible="visible"/>
    </template>
    <div class="flex flex-row">
      <DataTable
        v-model:selection="selectedPublicContainers"
        v-model:expandedRows="expandedContainers"
        :value="publicContainers"
        dataKey="id"
        class="w-6"
      >
        <Column selectionMode="multiple">
          <template #body v-if="isLoading">
            <Skeleton class="w-6 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="name" :header="$t('c_POSCreate.Public containers')">
          <template #body v-if="isLoading">
            <Skeleton class="w-6 my-1 h-1rem surface-300"/>
          </template>
        </Column>
      </DataTable>
      <DataTable
        v-model:selection="selectedOwnContainers"
        v-model:expandedRows="expandedContainers"
        :value="ownContainers"
        dataKey="id"
        class="w-6"
      >
        <Column selectionMode="multiple">
          <template #body v-if="isLoading">
            <Skeleton class="w-6 my-1 h-1rem surface-300"/>
          </template>
        </Column>
        <Column field="name" :header="$t('c_POSCreate.Own containers')">
          <template #body v-if="isLoading">
            <Skeleton class="w-6 my-1 h-1rem surface-300"/>
          </template>
        </Column>
      </DataTable>
    </div>
  </CardComponent>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type { ContainerResponse } from "@sudosos/sudosos-client";
import { onMounted, ref, watch } from "vue";
import Skeleton from "primevue/skeleton";
import ContainerActionsDialog from "@/components/ContainerActionsDialog.vue";

const visible = ref(false);
const selectedOwnContainers = ref<Array<ContainerResponse>>([]);
const selectedPublicContainers = ref<Array<ContainerResponse>>([]);

const props = defineProps({
  publicContainers: {
    type: Array<ContainerResponse>,
    required: true,
  },
  ownContainers: {
    type: Array<ContainerResponse>,
    required: true,
  },
  selectedContainers: {
    type: Array<ContainerResponse>,
    required: false,
  },
  isLoading: {
    type: Boolean,
    required: true,
  }
});

const emit = defineEmits(["selectedChanged"]);
const expandedContainers = ref();
function divideAndSetSelected() {
  if (props.selectedContainers) {
    selectedPublicContainers.value = props.selectedContainers.filter((selectedContainer) =>
        props.publicContainers.map((publicContainer) => publicContainer.id).includes(selectedContainer.id)
    );

    selectedOwnContainers.value = props.selectedContainers.filter((selectedContainer) =>
        props.ownContainers.map((ownContainer) => ownContainer.id).includes(selectedContainer.id)
    );
  }
}
watch([selectedPublicContainers, selectedOwnContainers], () => {
  const combinedSelectedContainers: Array<ContainerResponse> =
      selectedPublicContainers.value.concat(selectedOwnContainers.value);
  emit('selectedChanged', combinedSelectedContainers);
});

onMounted(() => {
  divideAndSetSelected();
});
</script>
<style scoped lang="scss">
</style>
