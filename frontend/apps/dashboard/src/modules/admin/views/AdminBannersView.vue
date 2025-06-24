<template>
  <PageContainer>
    <BannersList :banners="banners" :skip="0" :take="5" />
  </PageContainer>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useBannersStore } from '@/stores/banner.store';
import BannersList from '@/modules/admin/components/banners/BannersList.vue';
import PageContainer from '@/layout/PageContainer.vue';

const bannersStore = useBannersStore();

const banners = computed(() => {
  return Object.values(bannersStore.banners);
});

onMounted(() => {
  void bannersStore.fetchBanners();
});
</script>
