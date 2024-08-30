<template>
  <div>
    <span :class="['flex justify-content-between',
     column ? 'flex-column gap-1' : 'flex-row align-items-center gap-2']">
      <p class="my-0">{{ label }}</p>
      <InputText v-if="type === 'text'"
                 :placeholder="placeholder"
                 v-model="internalValue"
                 v-bind="attributes"
                 :disabled="disabled"/>

      <Textarea v-if="type === 'textarea'"
                :placeholder="placeholder"
                v-model="internalValue"
                v-bind="attributes"
                autoResize
                :disabled="disabled"/>

      <CalendarString v-if="type === 'date'"
                :placeholder="placeholder"
                v-model="internalValue"
                v-bind="attributes"
                :disabled="disabled"/>

      <InputNumber v-if="type === 'currency'"
                 mode="currency" currency="EUR" locale="nl-NL"
                 :min="0.0"
                :placeholder="placeholder"
                v-model="internalValue as number"
                :disabled="disabled"/>
      <InputNumber v-if="type === 'percentage'"
                   mode="decimal"
                   :min="0.0"
                   :min-fraction-digits="0" :max-fraction-digits="2"
                   :placeholder="placeholder"
                   v-model="internalValue as number"
                   :disabled="disabled"
                   suffix="%"/>
      <InputSwitch v-if="type === 'boolean'"
                   v-model="internalValue as boolean"
                   :disabled="disabled"/>
      <Dropdown v-if="type === 'usertype'"
                :options="userTypes"
                optionLabel="name"
                optionValue="value"
                v-model="internalValue as number"
                :placeholder="placeholder"
                :disabled="disabled"/>
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { PropType, Ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import ErrorSpan from "@/components/ErrorSpan.vue";
import CalendarString from "@/components/CalendarString.vue";

import type { HintedString } from "primevue/ts-helpers";
import InputNumber from "primevue/inputnumber";
import { userTypes } from "@/utils/validation-schema";

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number, Boolean],
  },
  attributes: {
    type: Object as PropType<any>,
    required: true,
  },
  errors: {
    type: Object as PropType<any>,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  type: {
    type: String as PropType<HintedString<'text' | 'textarea' | 'date' | 'currency' | 'percentage'>>,
    required: false,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  column: {
    type: Boolean,
    required: false,
    default: false
  },
});

const emit = defineEmits(['update:value']);

const stringInputs = ['text', 'textarea'];

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

watch(() => props.value, (newValue) => {
  internalValue.value = newValue ?? '';
});

watch(internalValue, (newValue) => {
  if (newValue !== props.value) {
    emit('update:value', newValue);
  }
});
</script>

<style scoped lang="scss">
</style>
