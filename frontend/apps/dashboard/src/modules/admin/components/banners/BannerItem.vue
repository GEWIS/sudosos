<template>
  <div class="col-12">
    <div class="flex flex-col md:flex-row py-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
      <div class="md:pr-4 md:w-1/2 relative">
        <Image
          v-if="banner.image"
          :key="banner.image"
          class="w-full max-h-[6.25rem]"
          preview
          :pt="{
            image: 'w-full object-cover',
          }"
          :pt:image:alt="banner.name"
          :src="getBannerImageSrc(banner)"
        />
        <div v-else class="px-3 py-5 surface-hover text-center text-xl">
          {{ t('modules.admin.banners.noBannerFound') }}
        </div>
        <!--
                    Green when active and banner image is present
                    Yellow when active but banner image is not present
                    Red when not active
                -->
        <Tag
          class="absolute"
          :severity="banner.active ? (banner.image ? 'success' : 'warning') : 'danger'"
          style="left: 4px; top: 4px"
          :value="banner.active ? t('modules.admin.banners.list.active') : t('modules.admin.banners.list.notActive')"
        />
      </div>
      <div class="flex flex-row justify-between w-1/2">
        <div class="flex flex-col pr-3">
          <span class="text-xl">{{ banner.name }}</span
          ><br />
          <span class="items-center flex flex-row font-italic">
            <i class="mr-1 pi pi-clock"></i>
            {{ displaySeconds }}
          </span>
        </div>
        <div class="items-end flex flex-col justify-between">
          <!-- Text will be grey when time is in the past -->
          <div class="text-right" :class="{ 'text-600 font-italic': isExpired }">
            <span v-tooltip.top="startDate.toLocaleString()" class="font-semibold">
              {{ formatDateTime(startDate) }}
            </span>
            {{ t('modules.admin.banners.till') }}
            <span v-tooltip.top="endDate.toLocaleString()" class="font-semibold">
              {{ formatDateTime(endDate) }}
            </span>
          </div>
          <Button @click="handeClick">{{ t('common.edit') }}</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Image from 'primevue/image';
import Tag from 'primevue/tag';

import type { BannerResponse } from '@sudosos/sudosos-client';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getBannerImageSrc } from '@/utils/urlUtils';
import { formatDateTime } from '@/utils/formatterUtils';

const emit = defineEmits(['select:banner']);

defineProps<{
  index: number;
}>();

const { t } = useI18n();

const displaySeconds = computed(() => {
  return `${banner.value.duration.toLocaleString()}
   ${t('modules.admin.banners.seconds', banner.value.duration)}`;
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

const handeClick = () => {
  emit('select:banner', banner.value);
};
</script>
