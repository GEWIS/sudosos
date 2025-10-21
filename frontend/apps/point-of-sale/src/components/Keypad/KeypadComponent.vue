<template>
  <div class="flex flex-col w-full gap-3">
    <div v-for="row in keypadLayout" :key="row[0]" class="flex justify-center gap-3">
      <Button
        v-for="key in row"
        :key="key"
        :class="['key c-btn active square shadow-md', { outlined: key === keypadBackspace || key === keypadExternal }]"
        @click="handleKeyClick(key)"
      >
        <i v-if="key === keypadBackspace" class="pi pi-delete-left" style="font-size: 3rem" />
        {{ key !== keypadBackspace ? key : '' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
const keypadBackspace = 'B';
const keypadExternal = 'E';
const keypadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['E', '0', 'B'],
];

const emits = defineEmits(['backspace', 'continue', 'input', 'external']);

const handleKeyClick = (key: string) => {
  if (key === keypadBackspace) {
    emits('backspace');
  } else if (key === keypadExternal) {
    emits('external');
  } else {
    emits('input', key);
  }
};
</script>

<style scoped lang="scss">
.key {
  color: rgba(255, 255, 255, 0.8) !important;
  width: 95px;
  height: 95px;
  font-weight: bold;
  font-size: 45px;

  &-row {
    gap: 8px;
  }
}

.backspace {
  background-color: var(--p-primary-color);
  color: rgba(255, 255, 255, 1);
}

.outlined {
  background-color: transparent !important;
  border-style: solid;
  border-width: 3px;
  border-color: var(--p-primary-color);
  color: var(--p-primary-color) !important;

  > * {
    color: var(--p-primary-color) !important;
  }
}
</style>
