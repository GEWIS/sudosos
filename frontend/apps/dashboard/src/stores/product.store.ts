import { defineStore } from 'pinia';
import type {
  CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse,
  UpdateProductRequest,
  VatGroupResponse
} from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from "@/services/ApiService";
import { useContainerStore } from "@/stores/container.store";

export const useProductStore = defineStore('products', {
  state: () => ({
    // Products is a mapping between product IDs and product objects.
    products: {} as Record<number, ProductResponse>,
    categories: [] as ProductCategoryResponse[],
    vatGroups: [] as VatGroupResponse[],
  }),
    getters: {
        /**
         * Get all products in the store
         *
         * This function returns a mapping of product IDs to their respective product objects.
         * To convert this mapping into an array of container objects, use `Object.values`.
         * The resulting array will be deeply reactive with the store, meaning any changes to
         * the store's state will be reflected in the array.
         *
         * @returns {Record<number, ProductResponse>} A record of product IDs to their product objects.
         *
         * @example
         * // reactive array of containers
         * const productsArray = Object.values(useProductStore().getAllContainers());
         */
        getAllProducts(): Record<string, ProductResponse> {
            return this.products;
        },
        /**
         * Returns a single product from the store if it is loaded / exists.
         * @param state
         */
        getSingleProduct: (state) => (id: number): ProductResponse | undefined => {
            return state.products[id] || undefined;
        }
    },
  actions: {
    /**
     * Fetch all products, categories, and VAT groups if they are not already loaded.
     * Use this function in on before loads to ensure the readiness of the store.
     */
    async fetchAllIfEmpty() {
      if (Object.keys(this.products).length === 0) {
        await this.fetchAllProducts();
      }
      if (this.categories.length === 0) {
        await this.fetchAllCategories();
      }
      if (this.vatGroups.length === 0) {
        await this.fetchAllVatGroups();
      }
    },
    /**
     * Fetch all products and store them in the store.
     * Note, this function will overwrite any existing products in the store.
     */
    async fetchAllProducts() {
      return fetchAllPages<ProductResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.products.getAllProducts(take, skip)
      ).then((productsArray) => {
        this.products = {};
        productsArray.forEach((product) => {
          this.products[product.id] = product;
        });
      });
    },
    /**
     * Fetch all product categories and store them in the store.
     */
    async fetchAllCategories() {
      return fetchAllPages<ProductCategoryResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.category.getAllProductCategories(take, skip)
      ).then((categories) => {
        this.categories = categories;
        return categories;
      });
    },
    /**
     * Fetch all VAT groups and store them in the store.
     */
    async fetchAllVatGroups() {
      return fetchAllPages<VatGroupResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.vatGroups.getAllVatGroups(undefined, undefined,undefined,
            false, take, skip)).then((vatGroups) => {
          this.vatGroups = vatGroups;
          return this.vatGroups;
      });
    },
    /**
     * Update the image of a product.
     * @param id
     * @param productImage
     */
    async updateProductImage(id: number, productImage: File) {
      const product = this.products[id];
      if (!product) return;
      product.image = URL.createObjectURL(productImage);
      this.products[product.id] = product;

      return ApiService.products.updateProductImage(id, productImage).then(async () => {
        await (useContainerStore()).handleProductUpdate(product);
        return product;
      });
    },
    /**
     * Create a product and store it in the store.
     * @param createProductRequest
     * @param productImage
     */
    async createProduct(createProductRequest: CreateProductRequest, productImage: File | undefined) {
      const product = await ApiService.products.createProduct(createProductRequest).then((resp) => resp.data);
      this.products[product.id] = product;
      if (productImage) {
        await this.updateProductImage(product.id, productImage);
      }
      return product;
    },
    async updateProduct(productId: number, updateProductRequest: UpdateProductRequest): Promise<ProductResponse> {
      return ApiService.products
        .updateProduct(productId, updateProductRequest).then(async (resp) => {
          const product = resp.data;
            this.products[product.id] = product;
            await (useContainerStore()).handleProductUpdate(product);
            return product;
          });
    },
    async fetchProduct(id: number) {
      const product = await ApiService.products.getSingleProduct(id).then((resp) => resp.data);
      this.products[product.id] = product;
    },
    async addProduct(product: ProductResponse) {
      this.products[product.id] = product;
    },
    async deleteProduct(id: number) {
      await ApiService.products.deleteProduct(id);
      delete this.products[id];
      await (useContainerStore()).handleProductDelete(id);
    }
  },
});
