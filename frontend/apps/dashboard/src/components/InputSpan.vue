<template>
  <div>
    <span :class="['flex justify-between', column ? 'flex-col gap-1' : 'flex-row items-center gap-2']">
      <p class="my-0">{{ label }}</p>

      <InputText
        v-if="type === 'text'"
        v-model="internalValue as string"
        v-bind="attrs"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :placeholder="showInline ? errors : placeholder"
      />

      <Textarea
        v-if="type === 'textarea'"
        v-model="internalValue as string"
        v-bind="attrs"
        auto-resize
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :placeholder="showInline ? errors : placeholder"
      />

      <DatePickerString
        v-if="type === 'date'"
        v-model="internalValue as string"
        v-bind="attrs"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :placeholder="placeholder"
      />

      <InputNumber
        v-if="type === 'currency'"
        v-model="internalValue as number"
        :class="errors ? 'p-invalid' : ''"
        currency="EUR"
        :disabled="disabled"
        locale="nl-NL"
        :min="0.0"
        mode="currency"
        :placeholder="placeholder"
        v-bind="attrs"
      />

      <InputNumber
        v-if="type === 'percentage'"
        v-model="internalValue as number"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :max-fraction-digits="2"
        :min="0.0"
        :min-fraction-digits="0"
        mode="decimal"
        :placeholder="placeholder"
        suffix="%"
        v-bind="attrs"
      />

      <ToggleSwitch v-if="type === 'boolean'" v-model="internalValue as boolean" :disabled="disabled" v-bind="attrs" />

      <Select
        v-if="type === 'usertype'"
        v-model="internalValue as number"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        option-label="name"
        option-value="value"
        :options="userTypes"
        :placeholder="placeholder"
        v-bind="attrs"
      />

      <InputText
        v-if="type === 'pin'"
        v-model="internalValue as string"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :placeholder="showInline ? errors : placeholder"
        size="small"
        type="password"
        v-bind="attrs"
      />

      <InputText
        v-if="type === 'password'"
        v-model="internalValue as string"
        v-bind="attrs"
        :class="errors ? 'p-invalid' : ''"
        :disabled="disabled"
        :placeholder="showInline ? errors : placeholder"
        type="password"
      />

      <InputNumber
        v-if="type === 'number'"
        v-model="internalValue as number"
        :disabled="disabled"
        :placeholder="showInline ? errors : placeholder"
        :suffix="suffix"
        v-bind="attrs"
      />
    </span>
    <div v-if="!inlineError" class="flex justify-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, useAttrs, computed } from 'vue';
import type { Ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import type { HintedString } from '@primevue/core';
import ErrorSpan from '@/components/ErrorSpan.vue';
import DatePickerString from '@/components/DatePickerString.vue';
import { userTypes } from '@/utils/validation-schema';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

type InputType = HintedString<
  'text' | 'textarea' | 'date' | 'currency' | 'percentage' | 'pin' | 'password' | 'boolean' | 'usertype' | 'number'
>;

const props = withDefaults(
  defineProps<{
    label: string;
    value?: string | number | boolean;
    errors?: string;
    placeholder?: string;
    type?: InputType;
    disabled?: boolean;
    column?: boolean;
    inlineError?: boolean;
    suffix?: string;
  }>(),
  {
    value: undefined,
    errors: undefined,
    placeholder: '',
    type: 'text',
    disabled: false,
    column: false,
    inlineError: false,
    suffix: '',
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

const showInline = computed(() => {
  if (!props.inlineError || !props.errors) return false;
  return !!(props.errors && !internalValue.value);
});

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
