<template>
  <Menubar :class="menuClass" :model="model">
    <template #start>
      <slot name="start"></slot>
    </template>
    <template #item="{ item, props, hasSubmenu }">
      <slot :has-submenu="hasSubmenu" :item="item" name="item" :props="props">
        <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
          <a v-bind="props.action" class="w-full" :href="href" @click="navigate">
            <div class="flex justify-between items-center w-full">
              <span class="p-menuitem-text flex-shrink-0">{{ item.label }}</span>
              <div class="flex items-center">
                <span v-if="item.icon" :class="item.icon + ' ml-2'" />
                <Badge v-if="item.notifications" class="ml-2" severity="secondary" :value="item.notifications" />
                <span v-else-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
              </div>
            </div>
          </a>
        </router-link>
        <a v-else v-bind="props.action" class="w-full" :href="item.url" :target="item.target">
          <div
            :class="[
              'flex items-center w-full',
              hasSubmenu
                ? !item.label && item.icon
                  ? 'justify-between'
                  : 'justify-between'
                : !item.label && item.icon
                  ? 'justify-start'
                  : 'justify-between',
            ]"
          >
            <span v-if="item.label" class="p-menuitem-text flex-shrink-0">{{ item.label }}</span>
            <template v-if="!item.label && item.icon && hasSubmenu">
              <span :class="item.icon" />
              <span class="ml-2 pi pi-angle-down pi-fw" />
            </template>
            <template v-else>
              <div class="flex items-center">
                <span v-if="item.icon" :class="item.icon + (item.label ? ' ml-2' : '')" />
                <Badge v-if="item.notifications" class="ml-2" severity="secondary" :value="item.notifications" />
                <span v-else-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
              </div>
            </template>
          </div>
        </a>
      </slot>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';

type Item = {
  label?: string;
  route?: string;
  url?: string;
  target?: string;
  icon?: string;
  notifications?: number;
  visible?: boolean;
};

defineProps<{
  model: Item[];
  menuClass?: string;
}>();
</script>
