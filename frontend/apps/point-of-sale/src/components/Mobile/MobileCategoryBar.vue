<template>
  <nav
    aria-label="Product categories"
    class="category-bar shrink-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
  >
    <div class="flex gap-2 overflow-x-auto no-scrollbar px-3 pt-2">
      <button
        v-for="category in categories"
        :key="category.id"
        :aria-pressed="category.id === selectedCategoryId"
        class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
        :class="
          category.id === selectedCategoryId ? 'bg-primary text-primary-contrast shadow' : 'bg-gray-100 text-gray-700'
        "
        @click="emit('selectCategory', category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { PosCategory } from '@/composables/usePosCategories';

defineProps<{
  categories: PosCategory[];
  selectedCategoryId?: string;
}>();

const emit = defineEmits<{
  selectCategory: [categoryId: string];
}>();
</script>

<style scoped lang="scss">
.category-bar {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.no-scrollbar {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
