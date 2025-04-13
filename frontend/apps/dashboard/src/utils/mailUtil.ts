import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { formatPrice } from '@/utils/formatterUtils';

export function sendEmail(transactionInfo: TransactionResponse, productsInfo: Array<SubTransactionRowResponse>) {
  window.open(`mailto:${getEmail()}
  ?subject=${getSubject(transactionInfo)}
  &body=${getBody(transactionInfo, productsInfo)}`);
}

function getEmail(): string {
  return import.meta.env.VITE_APP_TREASURER_EMAIL;
}

function getSubject(transactionInfo: TransactionResponse): string {
  return encodeURIComponent(
    '[FLAGGED TRANSACTION] ' +
      transactionInfo.from.firstName +
      ' ' +
      transactionInfo.from.lastName +
      ' ' +
      getTime(transactionInfo),
  );
}

function getBody(transactionInfo: TransactionResponse, productsInfo: Array<SubTransactionRowResponse>): string {
  return encodeURIComponent(
    'Transaction Id: ' +
      transactionInfo.id +
      '\n' +
      'Transaction for: ' +
      transactionInfo.from.firstName +
      ' ' +
      transactionInfo.from.lastName +
      ' (' +
      transactionInfo.from.id +
      ')\n' +
      'Transaction by: ' +
      transactionInfo.createdBy!.firstName +
      ' ' +
      transactionInfo.createdBy!.lastName +
      ' (' +
      transactionInfo.createdBy!.id +
      ')\n' +
      'Transaction at: ' +
      transactionInfo.pointOfSale.name +
      '\n' +
      '\nProducts in transaction: \n' +
      formatProducts(productsInfo) +
      '________________________\n' +
      'DO NOT CHANGE ANY OF THE ABOVE INFO\n' +
      'Please add any additional information below:\n',
  );
}

function getTime(transactionInfo: TransactionResponse): string {
  return new Date(transactionInfo.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatProducts(productsInfo: Array<SubTransactionRowResponse>): string {
  let returnString = '';

  productsInfo.forEach((product) => {
    returnString +=
      product.amount +
      'x ' +
      product.product.name +
      ' @ ' +
      formatPrice(product.product.priceInclVat) +
      ' = ' +
      formatPrice(product.totalPriceInclVat) +
      '\n';
  });

  return returnString;
}
