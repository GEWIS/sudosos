<template>
  <div class="col-12">
    <div class="flex flex-column md:flex-row py-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
      <div class="w-full md:w-5 relative md:pr-2">
        <Image preview class="w-full" v-if="banner.image" :src="getBannerImageSrc(banner)" :pt:image:alt="banner.name"
          :pt="{
            image: 'w-full'
          }" />
        <div v-else class="px-3 py-5 text-xl surface-hover text-center">
          {{ $t('banner.noBannersFound') }}
        </div>
        <!--
                    Green when active and banner image is present
                    Yellow when active but banner image is not present
                    Red when not active
                -->
        <Tag :value="banner.active ? $t('banner.Active') : $t('banner.Not active')"
          :severity="banner.active ? (banner.image ? 'success' : 'warning') : 'danger'" class="absolute"
          style="left: 4px; top: 4px" />
      </div>
      <div class="flex flex-row justify-content-between w-full md:w-7">
        <div class="flex flex-column pr-3">
          <span class="text-xl">{{ banner.name }}</span><br />
          <span class="font-italic flex flex-row align-items-center">
            <i class="pi pi-clock mr-1"></i>
            {{ displaySeconds }}
          </span>
        </div>
        <div class="flex flex-column justify-content-between align-items-end">
          <!-- Text will be grey when time is in the past -->
          <div class="text-right" :class="{ 'text-600 font-italic': isExpired }">
            <span v-tooltip.top="startDate.toLocaleString()" class="font-semibold">
              {{ formatDateTime(startDate) }}
            </span>
            {{ $t('banner.till') }}
            <span v-tooltip.top="endDate.toLocaleString()" class="font-semibold">
              {{ formatDateTime(endDate) }}
            </span>
          </div>
          <!-- Add icon and delete button here -->
          <Button @click="openDialog">{{ $t('posInfo.Edit') }}</Button>
        </div>
      </div>
    </div>
  </div>
  <BannerDialog v-model:visible="isEditDialogVisible" v-model:banner="banner" />
</template>
<script setup lang="ts">
import Image from 'primevue/image';
import Tag from 'primevue/tag';

import BannerDialog from '@/modules/admin/components/banners/BannerDialog.vue';

import type { BannerResponse } from '@sudosos/sudosos-client';
import { computed, ref } from 'vue';
import { getBannerImageSrc } from '@/utils/urlUtils';
import { formatDateTime } from '@/utils/formatterUtils';
import { useI18n } from 'vue-i18n';

defineProps<{
  index: number;
}>();

const { t } = useI18n();

const displaySeconds = computed(() => {
  return `${(banner.value.duration).toLocaleString()}
   ${t('banner.seconds', banner.value.duration)}`;
});

const banner = defineModel<BannerResponse>('banner', { required: true });

const startDate = computed(() => {
  return new Date(banner.value.startDate);
});

const endDate = computed(() => {
  return new Date(banner.value.endDate);
});

const isExpired = computed(() => {
  return Date.now() > Date.parse(banner.value.endDate);
});

const isEditDialogVisible = ref<boolean>(false);

const openDialog = () => {
  isEditDialogVisible.value = true;
};
</script>
