<template>
  <LoginInfoComponent />
  <div class="w-[20rem] mr-12" :class="{ inactive: !isActive }">
    <i class="pi pi-user text-center w-full mb-4 text-primary" style="font-size: 3rem" />
    <Card
      class="h-24 text-5xl font-bold pl-3 text-primary"
      @click="
        () => {
          emits('focus:userid');
        }
      "
    >
      <template #content>
        {{ external ? 'E' : '' }}
        <span v-for="char in userId" :key="char" class="pl-3">
          {{ char }}
        </span>
      </template>
    </Card>
  </div>
  <div class="w-[20rem]" :class="{ inactive: isActive }">
    <i class="pi pi-key text-center w-full mb-4 text-primary" style="font-size: 3rem" />
    <div>
      <Message
        v-if="wrongPin"
        class="h-24 w-full"
        :pt="{
          text: {
            class: 'text-4xl text-center w-full',
          },
        }"
        severity="error"
        >WRONG PIN</Message
      >
      <div
        v-else
        class="items-center flex h-full justify-between w-full"
        @click="
          () => {
            emits('focus:passcode');
          }
        "
      >
        <Card v-for="char in displayCode" :key="char" class="h-24 w-16 text-6xl font-bold text-primary pin-card">
          <template #content>{{ char }}</template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoginInfoComponent from '@/components/LoginInfoComponent.vue';

const emits = defineEmits(['focus:passcode', 'focus:userid']);

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  wrongPin: {
    type: Boolean,
    required: true,
  },
  external: {
    type: Boolean,
    required: true,
  },
});

const displayCode = computed<string[]>(() => {
  const array = [...props.pinCode.split('')].fill('•');
  const fillerArray = new Array(4 - array.length).fill(' ');
  return array.concat(fillerArray);
});
</script>

<style scoped lang="scss">
.pin-card {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.p-card-content) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0;
    line-height: 1;
    transform: translateY(-6px);
  }
}
</style>
