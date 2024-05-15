<template>
  <Panel :header="header.toUpperCase()">
    <template #icons>
      <slot name="topAction" />
    </template>
    <slot />
    <template v-if="action" #footer>
      <Button
        id="bottom-left-button"
        @click="handleClick"
        class="w-full border-none border-noround font-normal"
      >
        {{ action.toUpperCase() }}
      </Button>
    </template>
  </Panel>
</template>

<script setup lang="ts">
// TODO: Clean up all the fucking important statements
// See: https://github.com/gewis/sudosos-frontend-vue3/issues/14
import { useRouter } from "vue-router";

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  routerLink: {
    type: String,
    required: false,
  },
  action: {
    type: String,
    required: false,
  },
  func: {
    type: Function,
    required: false,
  },
});

const router = useRouter();
const handleClick = () => {
  if (props.routerLink) {
    // If routerLink is defined, use router.push to navigate
    router.push({ name: props.routerLink });
  } else if (props.func) {
    // If routerLink is not defined and func is provided, execute the func
    props.func();
  }
};
</script>

<style scoped>
</style>

