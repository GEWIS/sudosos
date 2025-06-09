<template>
  <div>
    <span :class="['flex justify-between', column ? 'flex-col gap-1' : 'flex-row items-center gap-2']">
      <p class="my-0">{{ label }}</p>
      <InputText
        v-if="type === 'text'"
        v-model="internalValue as string"
        v-bind="attributes"
        :disabled="disabled"
        :placeholder="placeholder"
      />

      <Textarea
        v-if="type === 'textarea'"
        v-model="internalValue as string"
        v-bind="attributes"
        auto-resize
        :disabled="disabled"
        :placeholder="placeholder"
      />

      <CalendarString
        v-if="type === 'date'"
        v-model="internalValue as string"
        v-bind="attributes"
        :disabled="disabled"
        :placeholder="placeholder"
      />

      <InputNumber
        v-if="type === 'currency'"
        v-model="internalValue as number"
        currency="EUR"
        :disabled="disabled"
        locale="nl-NL"
        :min="0.0"
        mode="currency"
        :placeholder="placeholder"
      />
      <InputNumber
        v-if="type === 'percentage'"
        v-model="internalValue as number"
        :disabled="disabled"
        :max-fraction-digits="2"
        :min="0.0"
        :min-fraction-digits="0"
        mode="decimal"
        :placeholder="placeholder"
        suffix="%"
      />
      <InputSwitch v-if="type === 'boolean'" v-model="internalValue as boolean" :disabled="disabled" />
      <Dropdown
        v-if="type === 'usertype'"
        v-model="internalValue as number"
        :disabled="disabled"
        option-label="name"
        option-value="value"
        :options="userTypes"
        :placeholder="placeholder"
      />

      <InputText
        v-if="type === 'pin'"
        v-model="internalValue as string"
        class="w-20"
        v-bind="attributes"
        :disabled="disabled"
        :placeholder="placeholder"
        size="small"
        type="password"
      />
      <InputText
        v-if="type === 'password'"
        v-model="internalValue as string"
        class="w-5"
        v-bind="attributes"
        :disabled="disabled"
        :placeholder="placeholder"
        type="password"
      />
    </span>
    <div class="flex justify-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import type { HintedString } from 'primevue/ts-helpers';
import InputNumber from 'primevue/inputnumber';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import ErrorSpan from '@/components/ErrorSpan.vue';
import CalendarString from '@/components/CalendarString.vue';

import { userTypes } from '@/utils/validation-schema';

type InputType = HintedString<'text' | 'textarea' | 'date' | 'currency' | 'percentage'>;

const props = withDefaults(
  defineProps<{
    label: string;
    value?: string | number | boolean;
    attributes?: BaseFieldProps & GenericObject;
    errors?: string;
    placeholder?: string;
    type?: InputType;
    disabled?: boolean;
    column?: boolean;
  }>(),
  {
    value: undefined,
    errors: undefined,
    attributes: undefined,
    placeholder: '',
    type: 'text',
    disabled: false,
    column: false,
  },
);

const emit = defineEmits(['update:value']);

const stringInputs = ['text', 'textarea', 'pin', 'password'];

const numberInputs = ['currency', 'number', 'usertype', 'percentage'];
const booleanInputs = ['boolean'];

const initialValue = () => {
  if (stringInputs.includes(props.type)) return '';
  if (numberInputs.includes(props.type)) return 0;
  if (booleanInputs.includes(props.type)) return false;
  return '';
};

const internalValue: Ref<string | number | boolean | undefined> = ref(initialValue());

onMounted(() => {
  internalValue.value = props.value ?? '';
});

watch(
  () => props.value,
  (newValue) => {
    internalValue.value = newValue ?? '';
  },
);

watch(internalValue, (newValue) => {
  if (newValue !== props.value) {
    emit('update:value', newValue);
  }
});
</script>

<style scoped lang="scss"></style>
