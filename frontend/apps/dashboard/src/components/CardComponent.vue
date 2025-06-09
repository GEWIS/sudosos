<template>
  <Panel :header="header.toUpperCase()">
    <template #icons>
      <slot name="topAction" />
    </template>
    <slot />
    <template v-if="action" #footer>
      <Button id="bottom-left-button" class="w-full rounded-none border-0! font-normal text-base" @click="handleClick">
        {{ action.toUpperCase() }}
      </Button>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { type RouteParamsRawGeneric, useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    header: string;
    routerLink?: string;
    routerParams?: RouteParamsRawGeneric;
    action?: string;
    func?: () => void;
  }>(),
  {
    routerLink: undefined,
    routerParams: undefined,
    action: undefined,
    func: undefined,
  },
);

const router = useRouter();
const handleClick = () => {
  if (props.routerLink) {
    // If routerLink is defined, use router.push to navigate
    void router.push({ name: props.routerLink, params: { ...props.routerParams } });
  } else if (props.func) {
    // If routerLink is not defined and func is provided, execute the func
    props.func();
  }
};
</script>

<style scoped></style>
