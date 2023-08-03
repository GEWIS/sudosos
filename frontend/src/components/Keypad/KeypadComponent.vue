<template>
  <div class="keypad flex-column">
    <div class="key-row d-flex justify-content-center" v-for="row in keypadLayout" :key="row[0]">
      <div
        :class="['key c-btn active square', { backspace: key === keypadBackspace, continue: key === keypadContinue }]"
        v-for="key in row"
        :key="key"
        @click="handleKeyClick(key)"
      >
        <font-awesome-icon icon="fa-solid fa-backspace" v-if="key === keypadBackspace" />
        <font-awesome-icon icon="fa-solid fa-arrow-right" v-if="key === keypadContinue" />
        {{ key !== keypadBackspace && key !== keypadContinue ? key : '' }}
      </div>
    </div>
    <div class="key c-btn active square align-self-center" @click="emitExternal">E</div>
  </div>
</template>

<script setup lang="ts">
const keypadBackspace = 'B';
const keypadContinue = 'C';
const keypadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['B', '0', 'C']
];

const emits = defineEmits(['backspace', 'continue', 'input', 'external']);

const handleKeyClick = (key: string) => {
  if (key === keypadBackspace) {
    emits('backspace');
  } else if (key === keypadContinue) {
    emits('continue');
  } else {
    emits('input', key);
  }
};

const emitExternal = () => {
  emits('external');
};
</script>

<style scoped lang="scss">
.keypad {
  gap: var(--key-gap-size);
  border-radius: $border-radius;
}

.key {
  color: rgba(255, 255, 255, 0.8)!important;
  width: var(--key-size);
  height: var(--key-size);
  font-weight: bold;
  font-size: $font-size-larger;

  &-row {
    gap: var(--key-gap-size);
  }
}

.backspace {
  background-color: $accent-color!important;
  color: rgba(255, 255, 255, 1);
}

.continue {
  background-color: #0055fd!important;
  color: rgba(255, 255, 255, 1);
}
</style>
