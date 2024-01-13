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
      <Button severity="danger" @click="handleDeleteProduct">
        {{ $t("c_productInfoModal.delete") }}
      </Button>
  </Dialog>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import Dialog from 'primevue/dialog';
import { ref } from "vue";
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";
import apiService from "@/services/ApiService";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();
const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});
const visible = ref(false);
const { t } = useI18n();
const handleDeleteProduct = async () => {
  const newProducts = props.container.products.filter(product => product.id !== props.product.id).map(product => product.id);
  await apiService.container.updateContainer(props.container.id, {
    name: props.container.name,
    products: newProducts,
    public: props.container.public || false,
    }).then(() => {
        toast.add({
          severity: 'success',
          summary: t('successMessages.success'),
          detail: t('successMessages.deleteProductContainer'),
          life: 3000,
        });
        router.go(0);
      }
    ).catch((error) => handleError(error, toast));
};

</script>

<style scoped lang="scss">
</style>
