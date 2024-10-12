import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { formatPrice } from '@/utils/formatterUtils';

export function sendEmail(transactionInfo: TransactionResponse, productsInfo: Array<SubTransactionRowResponse>)
{
  window.open("mailto:" + getEmail()
    + "?subject=" + getSubject(transactionInfo)
    + "&body="+ getBody(transactionInfo, productsInfo));
}

function getEmail(): string {
  return import.meta.env.VITE_APP_TREASURER_EMAIL;
}

function getSubject(transactionInfo: TransactionResponse): string {
  return "[FLAGGED TRANSACTION] "
    + transactionInfo.from.firstName + " "
    + transactionInfo.from.lastName + " "
    + getTime(transactionInfo);
}

function getBody(transactionInfo: TransactionResponse, productsInfo: Array<SubTransactionRowResponse>): string {
  return "Transaction Id: " + transactionInfo.id +  "%0D%0A"
    + "Transaction for: " + transactionInfo.from.firstName + " "
      + transactionInfo.from.lastName + " (" + transactionInfo.from.id + ")%0D%0A"
    + "Transaction by: " + transactionInfo.createdBy!.firstName
      + " " + transactionInfo.createdBy!.lastName + " (" + transactionInfo.createdBy!.id + ")%0D%0A"
    + "Transaction at: " + transactionInfo.pointOfSale.name + "%0D%0A"
    + "%0D%0AProducts in transaction: " + "%0D%0A" + formatProducts(productsInfo)
    + "________________________%0D%0A"
    + "DO NOT CHANGE ANY OF THE ABOVE INFO%0D%0A"
    + "Please add any additional information below:%0D%0A";
}

function getTime(transactionInfo: TransactionResponse): string {
  return new Date(transactionInfo.createdAt!!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

function formatProducts(productsInfo: Array<SubTransactionRowResponse>): string {
  let returnString = "";

  productsInfo.forEach(product => {
    returnString +=  product.amount + "x "
      + product.product.name + " @ "
      + formatPrice(product.product.priceInclVat) + " = "
      + formatPrice(product.totalPriceInclVat) + "%0D%0A";
  });

  return returnString;
}