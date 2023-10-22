<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { SubTransactionRow, TransactionResponse, TransferResponse } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";
import { useTransactionStore } from "@/stores/transaction.store";
import { useTransferStore } from "@/stores/transfer.store";
import { Dinero } from "@sudosos/sudosos-client";
import { formatPrice } from "@/utils/formatterUtils";
import { SubTransactionResponse, SubTransactionRowResponse } from "@sudosos/sudosos-client/src/api";
let visible = ref(false);
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
});

const transactionStore = useTransactionStore();
const transactionInfo = ref<TransactionResponse | null>();
const transactionProducts = ref<Array<SubTransactionRowResponse>>([]);

const transferStore = useTransferStore();
const transferInfo = ref<TransferResponse | null>();

const mutationIsLoaded = ref<boolean>(false);

/**
 *
 * @param transactionResponse
 */
function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      transactionProducts.value.push(subTransactionRow);
    });
  });
}

async function fetchTransactionInfo () {
  if (props.type == 'transaction' && !transactionInfo.value){
    await transactionStore.fetchIndividualTransaction(props.id, apiService);
    transactionInfo.value = transactionStore.transaction;
    getProductsOfTransaction(transactionStore.transaction);

  } else if (props.type == 'transfer' && !transferInfo.value) {
    await transferStore.fetchIndividualTransfer(props.id, apiService);
    transferInfo.value = transferStore.transfer;
  }
  mutationIsLoaded.value = true;
}
function showModal(): void {
  fetchTransactionInfo().then(() => {
    visible.value = true;
  });
}

function formatValueEuro(value: Dinero) : string {
  return formatPrice(value.amount);
}
</script>

<template>
  <i @click="showModal()" class="pi pi-info-circle"/>
  {{props.id}}
  <Dialog v-if="props.type=='transaction'" v-model:visible="visible" modal header="Transaction Details" :style="{ width: '30vw' }">
      <div v-if="mutationIsLoaded" class="content-wrapper">
        <div class="transaction-row">
          <div class="transaction-left-column"><p>Total</p></div>
          <div class="transaction-right-column"><p>{{ formatValueEuro(transactionInfo.totalPriceInclVat) }}</p></div>
        </div>
        <div class="transaction-row">
          <div class="transaction-left-column"><p>Point of sale</p></div>
          <div class="transaction-right-column"><p>{{ transactionInfo.pointOfSale.name }}</p></div>
        </div>
        <div class="transaction-row">
          <div class="transaction-left-column"><p>Bought by</p></div>
          <div class="transaction-right-column"><p> {{ transactionInfo.from.firstName }} {{ transactionInfo.from.lastName }}</p></div>
        </div>
        <div v-if="transactionInfo.createdBy" class="transaction-row" >
          <div class="transaction-left-column"><p>Put in by</p></div>
          <div class="transaction-right-column"><p> {{ transactionInfo.createdBy.firstName }} {{  transactionInfo.createdBy.lastName }}</p></div>
        </div>
        <div class="transaction-row">
          <div class="transaction-left-column"><p>Products</p></div>
          <div class="transaction-right-column">
            <div v-for="transactionProduct in transactionProducts" class="product-row">
              <div class="product-row-left-column"><p>{{ transactionProduct.amount }} x {{ transactionProduct.product.name }}</p></div>
              <div class="product-row-right-column"> <p>({{ formatValueEuro(transactionProduct.product.priceInclVat) }}) = {{ formatValueEuro(transactionProduct.totalPriceInclVat) }} </p></div>
            </div>
            <div class="product-row-total">
              <p><i>Total</i> {{ formatValueEuro(transactionInfo.totalPriceInclVat)}}</p>
            </div>
          </div>
        </div>
      </div>
  </Dialog>
  <Dialog v-if="transferInfo && transferInfo.deposit" v-model:visible="visible" modal header="Deposit Details" :style="{ width: '30vw' }">
    <div v-if="mutationIsLoaded" class="content-wrapper">
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Total:</p></div>
        <div class="transaction-right-column"><p>{{ formatValueEuro(transferInfo.amount) }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>To:</p></div>
        <div class="transaction-right-column"><p>{{ transferInfo.deposit.to.firstName + ' ' +transferInfo.deposit.to.lastName }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Reference:</p></div>
        <div class="transaction-right-column"><p>{{ transferInfo.deposit.stripeId }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Type:</p></div>
        <div class="transaction-right-column"><p>Deposit</p></div>
      </div>
    </div>
  </Dialog>

  <Dialog v-if="transferInfo && transferInfo.invoice" v-model:visible="visible" modal header="Invoice Details" :style="{ width: '30vw' }">
    <div v-if="mutationIsLoaded" class="content-wrapper">
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Total:</p></div>
        <div class="transaction-right-column"><p>{{ formatValueEuro(transferInfo.amount) }}</p></div>
      </div>
      <div v-if="transferInfo.invoice.to" class="transaction-row">
        <div class="transaction-left-column"><p>To:</p></div>
        <div class="transaction-right-column"><p>{{ transferInfo.invoice.to.firstName + ' ' + transferInfo.invoice.to.lastName }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Description:</p></div>
        <div class="transaction-right-column"><p>{{ transferInfo.invoice.description }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Status:</p></div>
        <div class="transaction-right-column"><p>{{ transferInfo.invoice.currentState.state }}</p></div>
      </div>
      <div class="transaction-row">
        <div class="transaction-left-column"><p>Transfer Type:</p></div>
        <div class="transaction-right-column"><p>Invoice</p></div>
      </div>
    </div>
  </Dialog>

</template>

<style scoped lang="scss">
p {
  margin:0;
}

.transaction-row, .product-row {
  margin:0;
  display: flex;
  width: 100%;
}

.transaction-left-column{
  width: 40%;
}

.transaction-left-column > p, .product-row-left-column > p {
  font-weight:bold!important;
}

.transaction-right-column{
  width: 50%;
}

.product-row-left-column {
  width: 60%;
}

.product-row-right-column{
  width: 60%;
  text-align: right;
}
.product-row-total {
  width: 100%;
  border-top: 1px solid;
  text-align: right;
}
</style>