<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="$t('c_productInfoModal.title')"
    class="flex w-9">
      <!-- Row for Name -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Name") }}</h4>
          <p class="my-0">{{ product.name }}</p>
      </div>

      <!-- Row for Added by -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Added by") }}</h4>
          <p class="my-0">{{ product.owner.firstName + ' ' + product.owner.lastName }}</p>
      </div>

      <!-- Row for Added on -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Added on") }}</h4>
          <p class="my-0">{{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
      </div>

      <!-- Row for Updated on -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Updated on") }}</h4>
          <p class="my-0">{{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
      </div>

      <!-- Row for Price -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Price") }}</h4>
          <p class="my-0">{{ formatPrice(product.priceInclVat) }}</p>
      </div>

      <!-- Row for Category -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Category") }}</h4>
          <p class="my-0">{{ product.category.name }}</p>
      </div>

      <!-- Row for Alcohol percentage -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Alcohol percentage") }}</h4>
          <p class="my-0">{{ product.alcoholPercentage + '%' }}</p>
      </div>

      <!-- Row for Picture -->
      <div class="flex flex-row justify-content-between">
          <h4 class="my-0">{{ $t("c_productInfoModal.Picture") }}</h4>
          <img class="max-w-10rem max-h-10rem w-full h-full" :src="getProductImageSrc(product)" :alt="product.name">
      </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { ProductResponse } from "@sudosos/sudosos-client";
import Dialog from 'primevue/dialog';
import { ref } from "vue";
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  }
});
const visible = ref(false);

</script>

<style scoped lang="scss">
//
//.product-dialog {
//  width: 50vw;
//  display: flex;
//  flex-direction: column;
//  padding-bottom: 1rem;
//
//  .rfow {
//    display: flex;
//    width: 100%;
//    padding-left: 1rem;
//    padding-right: 1rem;
//
//    h6 {
//      font-weight: 700!important;
//      font-family: Lato,Arial,sans-serif!important;
//      font-size: 1rem!important;
//      flex: 0 0 33.33333%;
//      max-width: 33.33333%;
//    }
//
//    p {
//      font-family: Lato,Arial,sans-serif!important;
//      font-size: 1rem!important;
//      flex: 0 0 66.66666%;
//      max-width: 66.66666%;
//      margin-bottom: 0.25rem;
//    }
//
//    img {
//      max-width: 10rem;
//      max-height: 10rem;
//      width: 100%;
//      height: 100%;
//    }
//  }
//}
</style>
