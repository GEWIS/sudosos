<template>
  <Dialog v-model:visible="visible" modal :header="$t('c_productInfoModal.title')" class="custom-dialog">
    <div class="product-dialog">
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Name") }}</h6>
        <p>{{ product.name }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Added by") }}</h6>
        <p>{{ product.owner.firstName + product.owner.lastName }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Added on") }}</h6>
        <p>{{formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : ''))}}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Updated on") }}</h6>
        <p>{{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Price") }}</h6>
        <p>{{ formatPrice(product.priceInclVat) }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Category") }}</h6>
        <p>{{ product.category.name }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Alcohol percentage") }}</h6>
        <p>{{ product.alcoholPercentage + '%' }}</p>
      </div>
      <div class="row">
        <h6>{{ $t("c_productInfoModal.Picture") }}</h6>
        <img :src="getProductImageSrc(product)" :alt="product.name">
      </div>
    </div>

  </Dialog>
</template>
<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import Dialog from 'primevue/dialog';
import { onMounted, ref } from "vue";
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  }
});
const visible = ref(false);
onMounted(() => {
});
</script>

<style scoped lang="scss">

.product-dialog {
  width: 50vw;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;

  .row {
    display: flex;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;

    h6 {
      font-weight: 700!important;
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 0 0 33.33333%;
      max-width: 33.33333%;
    }

    p {
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 0 0 66.66666%;
      max-width: 66.66666%;
      margin-bottom: 0.25rem;
    }

    img {
      max-width: 10rem;
      max-height: 10rem;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
