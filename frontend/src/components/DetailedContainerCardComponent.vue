<template>
  <CardComponent header="containers">
    <template #topAction>
      <!-- Header content goes here -->
      <Button
              @click="visible = true"
      >{{ $t("c_POSCreate.add container") }}</Button>
      <AddContainerDialogComponent v-model:visible="visible"/>
    </template>
    <DataTable
        v-model:selection="selectedPublicContainers"
        v-model:expandedRows="expandedContainers"
        :value="publicContainers"
        dataKey="id"
    >
      <Column selectionMode="multiple" headerStyle="visibility: hidden;" />
      <Column field="name" :header="$t('c_POSCreate.Public containers')" />
    </DataTable>
    <DataTable
        v-model:selection="selectedOwnContainers"
        v-model:expandedRows="expandedContainers"
        :value="ownContainers"
        dataKey="id"
    >
      <Column selectionMode="multiple" headerStyle="visibility: hidden;" />
      <Column field="name" :header="$t('c_POSCreate.Own containers')" />
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
</style>
