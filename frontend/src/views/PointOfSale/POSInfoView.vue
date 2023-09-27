<!--TODO: Make typing correct for the POSResponse-->

<template>
  <div class="page-container">
    <div class="page-title" id="pos-info-header">
      <span>{{ `${ $t("posInfo.POS") }: ${pos ? pos.name : ''}` }}</span>
      <div>
        <Button severity="secondary" :label="$t('posInfo.Edit')" icon="pi pi-pencil" @click="handleEditClicked"/>
        <Button severity="danger" :label="$t('posInfo.Close')" icon="pi pi-times" @click="handleClosedClicked"/>
      </div>
    </div>
    <hr>
    <div class="content-wrapper">
      <div class="pos-row">
        <div class="pos-general-info">
          <h3>{{ $t('posInfo.General') }}</h3>
          <b>{{ $t('posInfo.Title') }}</b>
          <p>{{ pos ? pos.name: '' }}</p>
          <b>{{ $t('posInfo.Owner') }}</b>
          <p>{{ pos ? (pos.owner ? pos.owner.firstName + pos.owner.lastName : "") : "" }}</p>
          <!--          TODO: Clean-up whatever the fuck is that above-->
        </div>
        <ContainerCardComponent
            class="container-card"
            v-if="pos && pos.containers"
            :data="pos.containers"
        />
      </div>
      <TransactionsTableComponent :header="$t('app.Transactions')" class="pos-transactions" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import ContainerCardComponent from "@/components/ContainerCardComponent.vue";
import TransactionsTableComponent from "@/components/TransactionsTableComponent.vue";
import { usePointOfSaleStore } from "@/stores/pos.store";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import router from "@/router";

const route = useRoute(); // Use the useRoute function to access the current route
const id = ref();
const pointOfSaleStore = usePointOfSaleStore();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();
onBeforeMount(async () => {
  id.value = route.params.id; // TODO: Implement API Getter for the POS in question
  await pointOfSaleStore.fetchPointOfSale(id.value);
  pos.value = pointOfSaleStore.getPos;
});

const handleClosedClicked = () => {
  router.push('/point-of-sale/overview');
};

const handleEditClicked = () => {
  if (pos.value) {
    router.push(`/point-of-sale/edit/${pos.value.id}`);
  } else {
    // TODO: Correct Error handling
  }
};
</script>

<style scoped lang="scss">
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
  width: 100%;
}

.pos-general-info {
  flex: 1;
  padding-left: 0.25rem!important;
  font-family: Lato,Arial,sans-serif!important;

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

  p {
    margin-bottom: 1rem;
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
}
</style>
