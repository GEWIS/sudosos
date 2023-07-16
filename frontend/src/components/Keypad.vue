<template>
  <div class="keypad">
    <div class="key-row" v-for="row in keypadLayout" :key="row">
      <div
        :class="['key', { 'backspace': key === keypadBackspace, 'continue': key === keypadContinue }]"
        v-for="key in row"
        :key="key"
        @click="handleKeyClick(key)"
      >
        <font-awesome-icon icon="fa-solid fa-backspace" v-if="key === keypadBackspace"/>
        <font-awesome-icon icon="fa-solid fa-arrow-right" v-if="key === keypadContinue"/>
        {{ key !== keypadBackspace && key !== keypadContinue ? key: '' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Keypad',
  data() {
    return {
      keypadBackspace: 'B',
      keypadContinue: 'C',
      keypadLayout: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['B', '0', 'C'],
      ],
    };
  },
  methods: {
    handleKeyClick(key) {
      if (key === this.keypadBackspace) {
        this.$emit('backspace');
      } else if (key === this.keypadContinue) {
        this.$emit('continue');
      } else {
        this.$emit('input', key);
      }
    },
  },
};
</script>

<style scoped>
.keypad {
  display: flex;
  flex-direction: column;
  gap: var(--key-gap-size);
  border-radius: 10px;
}

.key-row {
  display: flex;
  justify-content: center;
  gap: var(--key-gap-size);
}

.key {
  background-color: var(--accent-color);
  color: rgba(255,255,255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--key-size);
  height: var(--key-size);
  border: 1px solid #ccc;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
}

.backspace {
  background-color: red;
  color: rgba(255,255,255, 1);
}

.continue {
  background-color: #0055FD;
  color: rgba(255,255,255, 1);
}


/* Optional: Add styling for key text */
.key {
  font-size: 42px;
}
</style>
