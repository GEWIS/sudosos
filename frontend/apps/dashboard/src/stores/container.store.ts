import { defineStore } from "pinia";
import type {
    ContainerResponse,
    ContainerWithProductsResponse, CreateContainerRequest,
    ProductResponse,
    UpdateContainerRequest
} from "@sudosos/sudosos-client";
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from "@/services/ApiService";

// Containers can be either containers with products or containers without products
export type ContainerInStore = ContainerWithProductsResponse | ContainerResponse;

// Typeguard
export function isContainerWithProductsResponse(container: ContainerInStore):
  container is ContainerWithProductsResponse {
    return (container as ContainerWithProductsResponse).products !== undefined;
}

export const useContainerStore = defineStore('container', {
    // The state is a mapping between IDs and containers which allow for quick lookups.
    state: () => ({
        containers: {} as Record<number, ContainerInStore>,
    }),
    getters: {
        /**
         * Get a container from the store if prefetched exists.
         */
        getContainer: (state) => (c: ContainerResponse): ContainerInStore | null => {
            return state.containers[c.id] || null;
        },
        /**
         * Get all containers from the store if prefetched exists.
         *
         * This function returns a mapping of container IDs to their respective container objects.
         * To convert this mapping into an array of container objects, use `Object.values`.
         * The resulting array will be deeply reactive with the store, meaning any changes to
         * the store's state will be reflected in the array.
         *
         * @returns {Record<number, ContainerInStore>} A record of container IDs to their container objects.
         *
         * @example
         * // reactive array of containers
         * const containersArray = Object.values(useContainerStore().getAllContainers());
         */
        getAllContainers(state): Record<number, ContainerInStore> {
            return state.containers;
        },
        /**
         * Get all public containers from the store if prefetched exists.
         */
        getPublicContainers(state): Record<number, ContainerInStore> {
            return Object.fromEntries(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              Object.entries(state.containers).filter(([_, container]) => container.public)
            );
        },
        /**
         * Get all users' containers from the store if prefetched exists.
         */
        getUsersContainers(state): Record<number, ContainerInStore> {
            return Object.fromEntries(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              Object.entries(state.containers).filter(([_, container]) => container.public === false)
            );
        }
    },
    actions: {
        /**
         * Fetches all containers if the store is empty.
         */
        async fetchAllIfEmpty() {
          if (Object.keys(this.containers).length === 0) {
            await this.fetchAllContainers();
          }
        },
        /**
         * Fetches a container by its ID and stores it in the store.
         * @param id - The ID of the container to fetch.
         */
        async fetchContainer(id: number): Promise<ContainerWithProductsResponse> {
            return ApiService.container.getSingleContainer(id).then((resp) => {
                this.containers[id] = resp.data;
                return this.containers[id] as ContainerWithProductsResponse;
            });
        },
        /**
         * Fetches all containers and stores them in the store.
         */
        async fetchAllContainers() {
            return fetchAllPages<ContainerResponse>(
              // @ts-ignore
              (take, skip) => ApiService.container.getAllContainers(take, skip)
            ).then((containersArray) => {
                containersArray.forEach((container: ContainerResponse) => {
                    this.containers[container.id] = container;
                });
                return this.containers;
            });
        },
        /**
         * Creates a container and stores it in the store.
         * @param c - The container to create.
         */
        async createContainer(c: CreateContainerRequest) {
            return await ApiService.container.createContainer(c).then(resp => {
                this.containers[resp.data.id] = resp.data;
                return this.containers[resp.data.id];
            });
        },
        /**
         * Adds a product to a container and updates the store.
         * @param c
         * @param product
         */
        async addProductToContainer(c: ContainerResponse, product: ProductResponse) {
            const container = this.containers[c.id];
            if (!container) {
                throw new Error(`Container with id ${c.id} not found`);
            }

            if (!isContainerWithProductsResponse(container)) {
                throw new Error(`Container with id ${c.id} does not have products loaded`);
            }

            const updateContainerReq: UpdateContainerRequest = {
                name: container.name,
                products: [product.id, ...container.products.map(e => e.id)],
                public: container.public || false,
            };

            container.products.push(product);
            return ApiService.container.updateContainer(container.id, updateContainerReq).then((resp) => {
                this.containers[container.id] = resp.data;
                return resp.data;
            });
        },
        /**
         * Deletes a product from a container and updates the store.
         * @param c
         * @param product
         */
        async deleteProductFromContainer(c: ContainerResponse, product: ProductResponse) {
            const container = this.containers[c.id];
            if (!container) {
                throw new Error(`Container with id ${c.id} not found`);
            }

            if (!isContainerWithProductsResponse(container)) {
                throw new Error(`Container with id ${c.id} does not have products loaded`);
            }

            const updateContainerReq: UpdateContainerRequest = {
                name: container.name,
                products: container.products.filter(e => e.id !== product.id).map(e => e.id),
                public: container.public || false,
            };

            container.products = container.products.filter(e => e.id !== product.id);
            return ApiService.container.updateContainer(container.id, updateContainerReq).then((resp) => {
                this.containers[container.id] = resp.data;
                return resp.data;
            });
        },
        /**
         * Used for receiving and handling product updates from product store.
         * @param productResponse
         */
        async handleProductUpdate(productResponse: ProductResponse) {
            const containers = Object.values(this.containers).filter(isContainerWithProductsResponse);
            for (const container of containers) {
                const productIndex = container.products.findIndex(p => p.id === productResponse.id);
                if (productIndex !== -1) {
                    container.products[productIndex] = productResponse;
                }
            }
        },
        /**
         * Used for receiving and handling product deletions from product store.
         * @param id
         */
        async handleProductDelete(id: Number) {
            const containers = Object.values(this.containers).filter(isContainerWithProductsResponse);
            for (const container of containers) {
                container.products = container.products.filter(e => e.id !== id);
            }
        },
        /**
         * Updates a container and stores it in the store.
         * @param cId
         * @param c
         */
        async updateContainer(cId: number, c: UpdateContainerRequest) {
            const response = await ApiService.container.updateContainer(
                cId, c);
            const container = response.data;

            this.containers[container.id] = container;
            return container;
        },
        /**
         * Creates an empty container and stores it in the store.
         * @param name
         * @param isPublic
         * @param ownerId
         */
        async createEmptyContainer(name: string, isPublic: boolean, ownerId: number) {
            const response = await ApiService.container.createContainer(
              { name: name, products: [], public: isPublic, ownerId: ownerId });
            const container = response.data;

            this.containers[container.id] = container;

            return container;
        },
        /**
         * Deletes a container, and updates the store.
         * @param id
         */
        async deleteContainer(id: number) {
            await ApiService.container.deleteContainer(id);
            delete this.containers[id];
        }
    }
});
