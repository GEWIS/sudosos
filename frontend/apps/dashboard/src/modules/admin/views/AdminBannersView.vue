<template>
  <PageContainer>
    <BannersList :banners="banners" :skip="0" :take="5" />
  </PageContainer>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { type StoreGeneric, storeToRefs } from 'pinia';
import { useBannersStore } from '@/stores/banner.store';
import BannersList from '@/modules/admin/components/banners/BannersList.vue';
import PageContainer from '@/layout/PageContainer.vue';

const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore as StoreGeneric);

onMounted(() => {
  void bannersStore.fetchBanners();
});
</script>
