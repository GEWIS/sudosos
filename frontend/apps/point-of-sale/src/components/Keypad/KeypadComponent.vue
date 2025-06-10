<template>
  <div class="flex-col keypad">
    <div v-for="row in keypadLayout" :key="row[0]" class="flex justify-center key-row">
      <div
        v-for="key in row"
        :key="key"
        :class="['key c-btn active square shadow-md', { outlined: key === keypadBackspace || key === keypadExternal }]"
        @click="handleKeyClick(key)"
      >
        <i v-if="key === keypadBackspace" class="pi pi-delete-left" style="font-size: 3rem" />
        {{ key !== keypadBackspace ? key : '' }}
      </div>
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
.keypad {
  gap: var(--key-gap-size);
  border-radius: $border-radius;
  user-select: none;
}

.key {
  color: rgba(255, 255, 255, 0.8) !important;
  width: var(--key-size);
  height: var(--key-size);
  font-weight: bold;
  font-size: $font-size-larger;

  &-row {
    gap: var(--key-gap-size);
  }
}

.backspace {
  background-color: #d40000 !important;
  color: rgba(255, 255, 255, 1);
}

.outlined {
  background-color: transparent !important;
  border-style: solid;
  border-width: 3px;
  border-color: #d40000;
  color: #d40000 !important;

  > * {
    color: #d40000 !important;
  }
}
</style>
