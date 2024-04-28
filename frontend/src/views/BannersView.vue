<template>
    <div class="page-container">
        <div class="page-title">{{ $t('banner.Banners') }}</div>
        <BannersListComponent :banners="banners" :skip="0" :take="5"/>
    </div>
</template>
<script setup lang="ts">
import BannersListComponent from '@/components/BannersListComponent.vue';
import { onMounted } from 'vue';
import { useBannersStore } from '@/stores/banner.store';
import { storeToRefs } from 'pinia';

const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore);

onMounted(async () => {
    bannersStore.fetchBanners();
});

</script>
