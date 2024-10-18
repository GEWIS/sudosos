<template>
    <div class="page-container">
        <div class="page-title">{{ t('modules.admin.banners.title') }}</div>
        <BannersList :banners="banners" :skip="0" :take="5"/>
    </div>
</template>
<script setup lang="ts">
import BannersList from '@/modules/admin/components/banners/BannersList.vue';
import { onMounted } from 'vue';
import { useBannersStore } from '@/stores/banner.store';
import { type StoreGeneric, storeToRefs } from 'pinia';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore as StoreGeneric);

onMounted(async () => {
    bannersStore.fetchBanners();
});

</script>
