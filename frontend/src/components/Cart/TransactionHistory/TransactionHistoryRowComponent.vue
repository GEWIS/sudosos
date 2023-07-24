<template>
  <div class="transaction-history-row" @click="toggleOpen" v-if="transaction">
    <div class="top">
      <div>{{ formattedDate }}</div>
      <div>{{ formattedTime }}</div>
      <div class="price">€<div class="value">{{ formattedValue }}</div></div>
    </div>
    <transition name="expand">
      <div v-if="products" class="bottom" :class="{ open }">
        <hr>
        <template v-for="subTransaction in products.subTransactions">
          <div class="row-details" v-for="row in subTransaction.subTransactionRows" :key="row.product.id">
            <div class="product-details">
              {{ row.amount }}x <div class="product-name">{{ row.product.name }}</div>
            </div>
            <span>{{ formatDineroObjectToString(row.totalPriceInclVat) }}</span>
          </div>
        </template>
        <div v-if="isCreatedByDifferent">
          Created by {{ transaction.createdBy.firstName }} {{ transaction.createdBy.lastName }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, onMounted, ref } from "vue"
import { TransactionResponse } from "@sudosos/sudosos-client"
import { formatDateFromString, formatTimeFromString, formatDineroObjectToString } from "@/utils/FormatUtils"
import apiService from "@/services/ApiService"

const emit = defineEmits(['update:open'])

const props = defineProps({
  transaction: {
    type: Object as () => TransactionResponse,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})

const products = ref<undefined | TransactionResponse>()

onMounted(async () => {
  const res = await apiService.transaction.getSingleTransaction(props.transaction.id)
  products.value = res.data
})

const toggleOpen = () => emit("update:open", props.transaction.id)
const formattedDate = formatDateFromString(props.transaction.createdAt)
const formattedTime = formatTimeFromString(props.transaction.createdAt)
const formattedValue = formatDineroObjectToString(props.transaction.value, false)
const isCreatedByDifferent = props.transaction.createdBy.id !== props.transaction.from.id
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
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease-in-out;

  &.open {
    max-height: 1000px;
  }

  > hr {
    margin: 5px 0;
    border-top: 1px solid var(--accent-color);
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
