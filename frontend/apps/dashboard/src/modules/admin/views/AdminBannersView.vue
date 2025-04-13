<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.admin.banners.title') }}</div>
    <BannersList :banners="banners" :skip="0" :take="5" />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { type StoreGeneric, storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useBannersStore } from '@/stores/banner.store';
import BannersList from '@/modules/admin/components/banners/BannersList.vue';

const { t } = useI18n();

const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore as StoreGeneric);

onMounted(() => {
  void bannersStore.fetchBanners();
});
</script>
