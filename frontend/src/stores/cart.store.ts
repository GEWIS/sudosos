import { defineStore } from 'pinia';
import {
  ContainerResponse,
  ProductResponse,
  SubTransactionRequest,
  TransactionRequest,
  UserResponse
} from "@sudosos/sudosos-client";
import {usePointOfSaleStore} from "@/stores/pos.store";
import {
  SubTransactionRowRequest
} from "@sudosos/sudosos-client/src/api";
import apiService from "@/services/ApiService";

export interface CartProduct {
  container: ContainerResponse,
  product: ProductResponse,
  count: number,
}

interface CartState {
  products: CartProduct[],
  buyer: UserResponse | null,
}

const COUNTDOWN_TIMER = 3;

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    products: [] as CartProduct[],
    buyer: null,
    countdown: null,
    checkingOut: false,
  }),
  getters: {
    cartTotalCount(): number {
      return this.products.reduce((total, product) => total + product.count, 0);
    },
    getProducts(): CartProduct[] {
      return this.products;
    },
    getTotalPrice(): number {
      return this.products.reduce((total, product) => {
        const productPrice = product.product.priceInclVat.amount;
        return total + product.count * productPrice;
      }, 0);
    },
    getBuyer(): UserResponse | null {
      return this.buyer;
    }
  },
  actions: {
    setBuyer(buyer: UserResponse) {
      this.buyer = buyer;
    },
    addToCart(cartProduct: CartProduct): void {
      console.error(cartProduct);
      const existingProduct = this.products.find(
        (p) =>
          p.container.id === cartProduct.container.id &&
          p.product.id === cartProduct.product.id &&
          p.product.revision === cartProduct.product.revision
      );
      if (existingProduct) {
        existingProduct.count += cartProduct.count;
      } else {
        this.products.push(cartProduct);
      }
    },
    removeFromCart(product: CartProduct): void {
      const index = this.products.findIndex(
        (p) =>
          p.container.id === product.container.id &&
          p.product.id === product.product.id &&
          p.product.revision === product.product.revision
      );
      if (index !== -1) {
        const existingProduct = this.products[index];
        existingProduct.count -= 1;
        if (existingProduct.count === 0) {
          this.products.splice(index, 1);
        }
      }
    },
    clearCart(): void {
      this.products.splice(0, this.products.length);
    },
    async checkout(): Promise<void> {
      const pos = usePointOfSaleStore().getPos;
      if (!this.buyer || !pos || this.checkingOut) return;
      this.checkingOut = true;

      const containerSubTransactionsRows: { [key: string]: { container: ContainerResponse, row: SubTransactionRowRequest[] } } = {};
      this.products.map((cartProduct) => {
        const request: SubTransactionRowRequest = {
          amount: cartProduct.count,
          product: {
            id: cartProduct.product.id,
            revision: cartProduct.product.revision,
          },
          totalPriceInclVat: {
            currency: 'EUR',
            precision: 2,
            amount: cartProduct.count * cartProduct.product.priceInclVat.amount,
          }
        }
        if (containerSubTransactionsRows[cartProduct.container.id] === undefined) {
          containerSubTransactionsRows[cartProduct.container.id] = {
            container: cartProduct.container,
            row: [request],
          }
        } else {
          containerSubTransactionsRows[cartProduct.container.id].row.push(request);
        }
      })

      const subTransactions: SubTransactionRequest[] = Object.values(containerSubTransactionsRows).map((subTransactionRow) => {
        const {container, row} = subTransactionRow;
        return {
          to: container.owner.id,
          container: {
            id: container.id,
            revision: container.revision
          },
          subTransactionRows: row,
          totalPriceInclVat: {
            currency: 'EUR',
            precision: 2,
            amount: row.reduce((total, request) => total + request.totalPriceInclVat.amount, 0)
          }
        };
      });

      const request: TransactionRequest = {
        createdBy: this.buyer.id,
        from: this.buyer.id,
        pointOfSale: {
          id: pos.id,
          revision: pos.revision,
        },
        subTransactions,
        totalPriceInclVat: {
          currency: 'EUR',
          precision: 2,
          amount: this.getTotalPrice
        },
      }

      await (apiService.transaction.validateTransaction(request)).then((res) => {
        this.clearCart();
      });
    },
  },
});
