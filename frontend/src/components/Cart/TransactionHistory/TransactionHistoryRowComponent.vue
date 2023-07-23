<template>
  <div class="transaction-history-row" v-if="transaction">
    <div class="top">
      <div>{{dateFromString(transaction.createdAt)}}</div>
      <div>{{timeFromString(transaction.createdAt)}}</div>
      <div class="price">€<div class="value">{{formatPrice(transaction.value.amount)}}</div></div>
    </div>
<!--    <div class="bottom">-->
<!--      <div class="created-by">-->
<!--&lt;!&ndash;        {{ transaction.createdBy }}&ndash;&gt;-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import {TransactionResponse} from "@sudosos/sudosos-client";
import {dateFromString, timeFromString} from "@/utils/FormatUtils";
import {formatPrice} from "@/utils/priceUtils";

const props = defineProps({
  transaction: {
    type: Object as () => TransactionResponse,
    required: true,
  }
})

</script>

<style scoped>
.transaction-history-row {
  display: flex;
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
    text-align:left;
    display: inline-flex;
    min-width: 65px;
    justify-content: space-between;
    gap: 2px;
  }
}
</style>
