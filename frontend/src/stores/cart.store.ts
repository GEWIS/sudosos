import { defineStore } from 'pinia';
import {ProductResponse} from "@sudosos/sudosos-client";

interface CartProduct {
  containerId: number,
  product: ProductResponse,
  count: number,
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    products: [] as CartProduct[],
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
  },
  actions: {
    addToCart(product: CartProduct): void {
      console.error(product);
      const existingProduct = this.products.find(
        (p) =>
          p.containerId === product.containerId &&
          p.product.id === product.product.id &&
          p.product.revision === product.product.revision
      );
      if (existingProduct) {
        existingProduct.count += product.count;
      } else {
        this.products.push(product);
      }
    },
    removeFromCart(product: CartProduct): void {
      const index = this.products.findIndex(
        (p) =>
          p.containerId === product.containerId &&
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
    checkout(): void {
      // Perform checkout logic here, e.g., send cart data to the server
      // Reset the cart after successful checkout
      this.clearCart();
    },
  },
});
