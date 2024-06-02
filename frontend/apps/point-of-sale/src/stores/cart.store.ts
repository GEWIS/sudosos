import { defineStore } from 'pinia';
import {
  ContainerResponse,
  ProductResponse,
  SubTransactionRequest,
  TransactionRequest,
  UserResponse
} from '@sudosos/sudosos-client';
import { SubTransactionRowRequest } from '@sudosos/sudosos-client/src/api';
import { usePointOfSaleStore } from '@/stores/pos.store';
import apiService from '@/services/ApiService';
import { useAuthStore } from "@sudosos/sudosos-frontend-common";

export interface CartProduct {
  container: ContainerResponse
  product: ProductResponse
  count: number
}

interface CartState {
  products: CartProduct[]
  buyer: UserResponse | null
  createdBy: UserResponse | null
  lockedIn: UserResponse | null
}
export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    products: [] as CartProduct[],
    buyer: null,
    createdBy: null,
    lockedIn: null,
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
    setLockedIn(lockedIn: UserResponse | null) {
      this.lockedIn = lockedIn;
    },
    setBuyer(buyer: UserResponse | null) {
      this.buyer = buyer;
    },
    setCreatedBy(createdBy: UserResponse) {
      this.createdBy = createdBy;
    },
    addToCart(cartProduct: CartProduct): void {
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
      if (!this.buyer || !pos ) return;

      const containerSubTransactionsRows: {
        [key: string]: { container: ContainerResponse; row: SubTransactionRowRequest[] }
      } = {};
      this.products.map((cartProduct) => {
        const request: SubTransactionRowRequest = {
          amount: cartProduct.count,
          product: {
            id: cartProduct.product.id,
            revision: cartProduct.product.revision
          },
          totalPriceInclVat: {
            currency: 'EUR',
            precision: 2,
            amount: cartProduct.count * cartProduct.product.priceInclVat.amount
          }
        };
        if (containerSubTransactionsRows[cartProduct.container.id] === undefined) {
          containerSubTransactionsRows[cartProduct.container.id] = {
            container: cartProduct.container,
            row: [request]
          };
        } else {
          containerSubTransactionsRows[cartProduct.container.id].row.push(request);
        }
      });

      const subTransactions: SubTransactionRequest[] = Object.values(
        containerSubTransactionsRows
      ).map((subTransactionRow) => {
        const { container, row } = subTransactionRow;
        return {
          to: container.owner.id,
          container: {
            id: container.id,
            revision: container.revision as number
          },
          subTransactionRows: row,
          totalPriceInclVat: {
            currency: 'EUR',
            precision: 2,
            amount: row.reduce((total, request) => total + request.totalPriceInclVat.amount, 0)
          }
        };
      });

      const authStore = useAuthStore();

      const request: TransactionRequest = {
        createdBy: this.createdBy ? this.createdBy.id : authStore.getUser?.id,
        from: this.buyer.id,
        pointOfSale: {
          id: pos.id,
          revision: pos.revision
        },
        subTransactions,
        totalPriceInclVat: {
          currency: 'EUR',
          precision: 2,
          amount: this.getTotalPrice
        }
      };

      await apiService.transaction.createTransaction(request).then(() => {
        this.products.length = 0;
        this.buyer = this.lockedIn;
        this.createdBy = null;
      });
    }
  }
});
