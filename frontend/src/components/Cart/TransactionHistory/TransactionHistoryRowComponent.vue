<template>
  <div class="transaction-history-row" v-if="transaction" @click="toggleOpen">
    <div class="top">
      <div>{{formatDateFromString(transaction.createdAt)}}</div>
      <div>{{formatTimeFromString(transaction.createdAt)}}</div>
      <div class="price">€<div class="value">{{formatDineroObjectToString(transaction.value, false)}}</div></div>
    </div>
    <transition name="expand">
      <div class="bottom" :class="{open}" v-if="products">
        <hr>
        <span v-for="subTransaction in products.subTransactions" :key="subTransaction.to">
          <span class="row-details" v-for="row in subTransaction.subTransactionRows" :key="row.product.id">
            <div class="product-details">{{row.amount}}x ({{formatDineroObjectToString(row.product.priceInclVat)}})<div class="product-name">{{row.product.name}}</div></div>
            <span>{{formatDineroObjectToString(row.totalPriceInclVat)}}</span>
          </span>
        </span>
        <div v-if="transaction.createdBy.id !== transaction.from.id">
          Created by {{ transaction.createdBy.firstName }} {{ transaction.createdBy.lastName}}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {TransactionResponse} from "@sudosos/sudosos-client";
import {formatDateFromString, formatTimeFromString, formatPrice, formatDineroObjectToString} from "@/utils/FormatUtils";
import apiService from "@/services/ApiService";
import {onMounted, Ref, ref} from "vue";

const emit = defineEmits(['update:open'])

const props = defineProps({
  transaction: {
    type: Object as () => TransactionResponse,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
});
const products: Ref<undefined | TransactionResponse> = ref(undefined);
onMounted(() => {
  apiService.transaction.getSingleTransaction(props.transaction.id).then((res) => {
    products.value = res.data;
  })
})

const toggleOpen = () => {
  emit("update:open", props.transaction.id);
};
</script>

<style scoped>
.transaction-history-row {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  padding: 5px 10px;
}

.row-details {
  justify-content: space-between;
  display: flex;
}

.product-details {
  gap: 10px;
  display: flex;

  > .product-name {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
    text-align:left;
    display: inline-flex;
    min-width: 65px;
    justify-content: space-between;
    gap: 2px;
  }
}

.bottom {
  transition: max-height 0.5s ease-in-out;
  max-height: 0;
  overflow: hidden;

  &.open {
    max-height: 1000px;
    transition: max-height 0.5s ease-in-out;
  }

  > hr {
    margin-bottom: 5px;
    margin-top: 5px;
    border-top: 1px solid var(--accent-color);
  }
}
</style>
