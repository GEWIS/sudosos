<template>
  <CardComponent header="containers">
    <template #topAction>
      <!-- Header content goes here -->
      <Button severity="success"
              @click="visible = true"
      >{{ $t("c_POSCreate.add container") }}</Button>
      <AddContainerDialogComponent v-model:visible="visible"/>
    </template>
    <p class="container-type-title">{{ $t("c_POSCreate.Public containers") }}</p>
    <DataTable
        v-model:selection="selectedPublicContainers"
        v-model:expandedRows="expandedContainers"
        :value="publicContainers"
        dataKey="id"
    >
      <Column selectionMode="multiple" headerStyle="width: 1rem" />
      <Column field="name" />
    </DataTable>
    <p class="container-type-title">{{ $t("c_POSCreate.Own containers") }}</p>
    <DataTable
        v-model:selection="selectedOwnContainers"
        v-model:expandedRows="expandedContainers"
        :value="ownContainers"
        dataKey="id"
    >
      <Column selectionMode="multiple" headerStyle="width: 1rem" />
      <Column field="name" />
    </DataTable>
  </CardComponent>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import CardComponent from "@/components/CardComponent.vue";
import type { ContainerResponse } from "@sudosos/sudosos-client";
import { onMounted, ref, watch } from "vue";
import AddContainerDialogComponent from "@/components/AddContainerDialogComponent.vue";

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
:deep(.p-datatable-thead) {
  display: none;
}

:deep(.p-datatable-table){
  border-collapse: separate;
  border-spacing: 0 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr){
  background-color: #f2f2f2;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  font-family: Lato,Arial,sans-serif!important;


}

:deep(.p-selection-column) {
    width: 2rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:first-child)) {
  border-left: none; /* Remove the left border for all cells except the first child */
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:last-child)) {
  border-right: none; /* Remove the left border for all cells except the first child */
}
</style>
