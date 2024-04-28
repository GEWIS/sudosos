<template>
    <CardComponent :header="$t('banner.Banner overview')">
        <DataView :value="displayedBanners" data-key="id" paginator :first="props.skip && props.skip-1"
            :rows="props.take">
            <template #header>
                <div class="flex flex-column md:flex-row align-items-center justify-content-between">
                    <SelectButton v-model="filters" :options="options" optionLabel="name" multiple />
                    <Button class="mt-2 md:mt-0" :label="$t('app.Create')" icon="pi pi-plus"
                        @click="isCreateDialogVisible = true" />
                </div>
            </template>
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <BannerItemComponent v-for="(item, index) in slotProps.items" :key="index" :index="index"
                        :banner="item" />
                </div>
            </template>
        </DataView>
    </CardComponent>
    <BannerDialogComponent v-model:visible="isCreateDialogVisible" />
</template>
<script setup lang="ts">
import DataView from "primevue/dataview";
import SelectButton from "primevue/selectbutton";

import type {
    BannerResponse,
} from "@sudosos/sudosos-client";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import BannerItemComponent from "@/components/BannerItemComponent.vue";
import CardComponent from "@/components/CardComponent.vue";
import BannerDialogComponent from "@/components/BannerDialogComponent.vue";

const props = defineProps<{
    banners: BannerResponse[],
    skip?: number | undefined,
    take?: number | undefined
}>();

const isCreateDialogVisible = ref<boolean>();


// Filtering the banners
const filters = ref<FilterOption[]>();

interface FilterOption {
    name: string,
    type: Filter
}

enum Filter {
    ACTIVE,
    EXPIRED
}

const options = [
    {
        name: t('banner.Filter active'),
        type: Filter.ACTIVE
    },
    {
        name: t('banner.Filter not expired'),
        type: Filter.EXPIRED
    }
];

const displayedBanners = computed(() => {
    return props.banners
        .filter(b => {
            const appliedFilters = filters.value?.map(f => f.type) || []

            // Filters active banners
            if (appliedFilters.includes(Filter.ACTIVE) && !b.active) return false;
            // Filters expired banners
            if (appliedFilters.includes(Filter.EXPIRED)  && Date.parse(b.endDate) <= Date.now()) return false;

            return true;

        })
        .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));
});

</script>
