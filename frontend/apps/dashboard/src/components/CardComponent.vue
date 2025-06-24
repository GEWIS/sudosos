<template>
  <Card
    :pt="{
      body: center ? 'flex-1' : '',
      content: center ? 'h-full pb-[2rem]' : '',
    }"
  >
    <template #header>
      <div class="flex flex-row w-full justify-between p-5 pb-0">
        <div class="font-semibold text-primary">{{ header.toUpperCase() }}</div>
        <div><slot name="topAction" /></div>
      </div>
    </template>
    <template #content>
      <slot />
    </template>
    <template v-if="action" #footer>
      <Button id="bottom-left-button" class="w-full" outlined @click="handleClick">
        {{ action.toUpperCase() }}
      </Button>
    </template>
  </Card>
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
    center?: boolean;
  }>(),
  {
    routerLink: undefined,
    routerParams: undefined,
    action: undefined,
    func: undefined,
    center: false,
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
