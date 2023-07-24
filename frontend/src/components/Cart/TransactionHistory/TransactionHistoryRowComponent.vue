<template>
  <div class="transaction-history-row" @click="toggleOpen" v-if="transaction">
    <div class="top">
      <div>{{ formattedDate }}</div>
      <div>{{ formattedTime }}</div>
      <div class="price">€<div class="value">{{ formattedValue }}</div></div>
    </div>
    <!-- Here, we attach animation related functions to the corresponding Vue transition hooks-->
    <transition name="expand"
                @before-enter="beforeEnter"
                @enter="enter"
                @before-leave="beforeLeave"
                @leave="leave"
                :css="false"
    >
      <!-- The 'bottom' div will only be rendered when 'products' is truthy and 'open' is true -->
      <div v-if="products && open" class="bottom" ref="bottomDiv">
        <hr>
        <div v-for="subTransaction in products.subTransactions" :key="subTransaction.id">
          <div class="row-details" v-for="row in subTransaction.subTransactionRows" :key="row.product.id">
            <div class="product-details">
              {{ row.amount }}x <div class="product-name">{{ row.product.name }}</div>
            </div>
            <span>{{ formatDineroObjectToString(row.totalPriceInclVat) }}</span>
          </div>
        </div>
        <div class="created-by" v-if="isCreatedByDifferent && transaction.createdBy">
          Created by {{ transaction.createdBy.firstName }} {{ transaction.createdBy.lastName }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue"
import { BaseTransactionResponse, TransactionResponse } from "@sudosos/sudosos-client"
import { formatDateFromString, formatTimeFromString, formatDineroObjectToString } from "@/utils/FormatUtils"
import apiService from "@/services/ApiService"

const emit = defineEmits(['update:open'])

const props = defineProps({
  transaction: {
    type: Object as () => BaseTransactionResponse,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})

// To store the extra infromation in
const products = ref<undefined | TransactionResponse>()

onMounted(async () => {
  if (props.open) {
    const res = await apiService.transaction.getSingleTransaction(props.transaction.id)
    products.value = res.data
  }
})

watch(() => props.open, () => {
  if (!products.value) {
    apiService.transaction.getSingleTransaction(props.transaction.id).then((res) => {
      products.value = res.data;
    })
  }
})

// Reset max height before the component is destroyed
onBeforeUnmount(() => {
  if (bottomDiv.value) {
    bottomDiv.value.style.maxHeight = ''
  }
})

const bottomDiv: Ref<HTMLElement | null> = ref(null)

// We want to animate the folding and opening of the info boxes.
// However, css does not like percentage based animation. So we use CSS + Vue animation hooks.
function beforeEnter(el: Element) {
  (el as HTMLElement).style.maxHeight = '0'; // set max-height to 0 before the element enters
}

async function enter(el: Element) {
  await nextTick(); // wait for DOM update to complete
  (el as HTMLElement).style.maxHeight = `${el.scrollHeight  }px`; // set max-height to its scrollHeight after it enters
}

function beforeLeave(el: Element) {
  (el as HTMLElement).style.maxHeight = `${el.scrollHeight  }px`; // set max-height to its scrollHeight before it leaves
}

async function leave(el: Element) {
  await nextTick(); // wait for DOM update to complete
  (el as HTMLElement).style.maxHeight = '0'; // set max-height to 0 after it leaves
}

const toggleOpen = () => emit("update:open", props.transaction.id)
const formattedDate = formatDateFromString(props.transaction.createdAt)
const formattedTime = formatTimeFromString(props.transaction.createdAt)
const formattedValue = formatDineroObjectToString(props.transaction.value, false)
const isCreatedByDifferent = props.transaction.createdBy?.id !== props.transaction.from.id
</script>

<style scoped>
.transaction-history-row {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  padding: 5px 10px;
}

.top {
  display: flex;
  justify-content: space-between;
  width: 100%;

  > div {
    font-weight: 500;
    font-size: 20px;
  }

  > .value {
    min-width: 52px;
    text-align: right;
  }

  > .price {
    display: inline-flex;
    justify-content: space-between;
    gap: 2px;
    min-width: 65px;
    text-align: left;
  }
}

.bottom {
  overflow: hidden;
  transition: max-height 0.2s ease-in-out;

  > hr {
    margin: 5px 0;
    border-top: 1px solid var(--accent-color);
  }

  > .created-by {
    margin-top: 5px;
  }
}

.row-details {
  display: flex;
  justify-content: space-between;
}

.product-details {
  display: flex;
  gap: 10px;

  > .product-name {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
