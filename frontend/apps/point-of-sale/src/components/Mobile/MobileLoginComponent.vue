<template>
  <div class="flex flex-col h-full gap-2 p-2">
    <div class="card flex-1 flex flex-col p-4">
      <div class="flex items-center justify-between">
        <span class="pill"><i class="pi pi-shop" /> {{ posName }}</span>
        <span class="pill"><i class="pi pi-id-card" /> Scan card</span>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center gap-3 py-4">
        <template v-if="enteringUserId">
          <span class="opacity-70">{{ external ? 'External account' : 'Member number' }}</span>
          <div class="id-display"><span v-if="external" class="opacity-50">E</span>{{ userId || '\u00a0' }}</div>
        </template>
        <template v-else>
          <span class="opacity-70">Logging in as</span>
          <div class="text-2xl font-bold">
            {{ external ? 'External' : 'Member' }} {{ userId }}
            <button class="change" type="button" @click="emit('change')">Change</button>
          </div>
          <div class="dots" :class="{ wrong: wrongPin }">
            <span v-for="index in 4" :key="index" :class="{ filled: index <= pinCode.length }" />
          </div>
          <span v-if="wrongPin" class="wrong-text">Wrong PIN, try again</span>
        </template>
      </div>

      <KeypadComponent
        @backspace="emit('backspace')"
        @continue="emit('continue')"
        @external="emit('external')"
        @input="emit('input', $event)"
      />
      <Button v-if="enteringUserId" class="next-button" :disabled="!userId" @click="emit('continue')">
        Next
        <i class="pi pi-arrow-right" />
      </Button>
      <p v-else class="text-center text-sm opacity-60 pt-3">Enter your 4-digit PIN</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import KeypadComponent from '@/components/Keypad/KeypadComponent.vue';
import { usePointOfSaleStore } from '@/stores/pos.store';

defineProps<{
  userId: string;
  pinCode: string;
  enteringUserId: boolean;
  external: boolean;
  wrongPin: boolean;
}>();

const emit = defineEmits<{
  input: [value: string];
  backspace: [];
  external: [];
  continue: [];
  change: [];
}>();

const posStore = usePointOfSaleStore();
const posName = computed(() => posStore.getPos?.name ?? 'Unknown POS');
</script>

<style scoped lang="scss">
.card {
  border-radius: var(--p-button-border-radius);
  background: #ffffffee;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-surface-100);
  font-size: 0.875rem;
  font-weight: 600;
}

.id-display {
  min-width: 10rem;
  padding: 0.5rem 1rem;
  border-bottom: 3px solid var(--p-primary-color);
  color: var(--p-primary-color);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-align: center;
}

.change {
  margin-left: 0.5rem;
  color: var(--p-primary-color);
  font-size: 1rem;
  font-weight: 600;
}

.dots {
  display: flex;
  gap: 1rem;

  > span {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--p-primary-color);
    border-radius: var(--p-button-border-radius);

    &.filled {
      background: var(--p-primary-color);
    }
  }

  &.wrong {
    animation: shake 0.3s;
  }
}

.wrong-text {
  color: var(--p-primary-color);
  font-weight: 600;
}

@keyframes shake {
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}

.next-button {
  margin-top: 0.75rem;
  padding: 0.9rem;
  font-size: 1.25rem;
}

// Kiosk keypad keys are fixed squares; on a phone they share the width.
:deep(.key) {
  flex: 1;
  height: 4.25rem;
  font-size: 2rem;
}
</style>
