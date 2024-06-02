<template>
  <div v-if="transaction">
    <div class="flex-column content-body px-3 py-1" @click="toggleOpen" >
    <div class="d-flex justify-content-between w-100 font-size-lg fw-medium">
      <div>{{ formattedDate }}</div>
      <div>{{ formattedTime }}</div>
      <div class="d-inline-flex justify-content-between">
        €
        <div class="text-end min-w-65">{{ formattedValue }}</div>
      </div>
    </div>
      <div v-if="settings.isBorrelmode">
        <div class="mt-1 fs-6">
          Transaction for {{ transaction.from.firstName}} by {{transaction.createdBy?.firstName}}
        </div>
      </div>
    <!-- Here, we attach animation related functions to the corresponding Vue transition hooks-->
    <transition
      name="expand"
      @before-enter="beforeEnter"
      @enter="enter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <!-- The 'bottom' div will only be rendered when 'products' is truthy and 'open' is true -->
      <div v-if="products && open" class="bottom" ref="bottomDiv">
        <hr />
        <div v-for="subTransaction in products.subTransactions" :key="subTransaction.id">
          <div
            class="d-flex justify-content-between"
            v-for="row in subTransaction.subTransactionRows"
            :key="row.product.id"
          >
            <div class="d-flex gap-2">
              {{ row.amount }}x
              <div class="product-name text-overflow" style="max-width: 150px;">{{ row.product.name }}</div>
            </div>
            <span>{{ formatDineroObjectToString(row.totalPriceInclVat) }}</span>
          </div>
        </div>
        <div class="created-by" v-if="isCreatedByDifferent && transaction.createdBy && !settings.isBorrelmode">
          Created by {{ transaction.createdBy.firstName }} {{ transaction.createdBy.lastName }}
        </div>
      </div>
    </transition>
  </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { BaseTransactionResponse, TransactionResponse } from '@sudosos/sudosos-client';
import {
  formatDateFromString,
  formatTimeFromString,
  formatDineroObjectToString
} from '@/utils/FormatUtils';
import apiService from '@/services/ApiService';
import { useSettingStore } from "@/stores/settings.store";

const emit = defineEmits(['update:open']);
const settings = useSettingStore();

const props = defineProps({
  transaction: {
    type: Object as () => BaseTransactionResponse,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
});

// To store the extra infromation in
const products = ref<undefined | TransactionResponse>();

onMounted(async () => {
  if (props.open) {
    const res = await apiService.transaction.getSingleTransaction(props.transaction.id);
    products.value = res.data;
  }
});

watch(
  () => props.open,
  () => {
    if (!products.value) {
      apiService.transaction.getSingleTransaction(props.transaction.id).then((res) => {
        products.value = res.data;
      });
    }
  }
);

// Reset max height before the component is destroyed
onBeforeUnmount(() => {
  if (bottomDiv.value) {
    bottomDiv.value.style.maxHeight = '';
  }
});

const bottomDiv: Ref<HTMLElement | null> = ref(null);

// We want to animate the folding and opening of the info boxes.
// However, css does not like percentage based animation. So we use CSS + Vue animation hooks.
function beforeEnter(el: Element) {
  ;(el as HTMLElement).style.maxHeight = '0'; // set max-height to 0 before the element enters
}

async function enter(el: Element) {
  await nextTick() // wait for DOM update to complete
  // set max-height to its scrollHeight after it enters
  ;(el as HTMLElement).style.maxHeight = `${el.scrollHeight}px`;
}

function beforeLeave(el: Element) {
  // set max-height to its scrollHeight before it leaves
  ;(el as HTMLElement).style.maxHeight = `${el.scrollHeight}px`;
}

async function leave(el: Element) {
  await nextTick() // wait for DOM update to complete
  ;(el as HTMLElement).style.maxHeight = '0'; // set max-height to 0 after it leaves
}

const toggleOpen = () => emit('update:open', props.transaction.id);
const formattedDate = formatDateFromString(props.transaction.createdAt);
const formattedTime = formatTimeFromString(props.transaction.createdAt);
const formattedValue = formatDineroObjectToString(props.transaction.value, false);
const isCreatedByDifferent = props.transaction.createdBy?.id !== props.transaction.from.id || settings.isBorrelmode;
</script>

<style scoped lang="scss">

.bottom {
  overflow: hidden;
  transition: max-height 0.2s ease-in-out;

  > hr {
    margin: 5px 0;
    border-top: 1px solid $accent-color;
  }

  > .created-by {
    margin-top: 5px;
  }
}
</style>
