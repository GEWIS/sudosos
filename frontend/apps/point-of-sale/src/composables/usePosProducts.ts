import { computed, MaybeRefOrGetter, toValue } from 'vue';
import {
  ContainerWithProductsResponse,
  PointOfSaleWithContainersResponse,
  ProductResponse,
} from '@gewis/sudosos-client';
import Fuse from 'fuse.js';

export interface PosProduct {
  product: ProductResponse;
  container: ContainerWithProductsResponse;
}

interface UsePosProductsOptions {
  pointOfSale: MaybeRefOrGetter<PointOfSaleWithContainersResponse | undefined>;
  selectedCategoryId: MaybeRefOrGetter<string | undefined>;
  isProductSearch: MaybeRefOrGetter<boolean>;
  searchQuery: MaybeRefOrGetter<string>;
}

/**
 * The products of a point of sale, filtered by category or search query and
 * sorted with preferred products first.
 */
export function usePosProducts(options: UsePosProductsOptions) {
  const filteredProducts = computed<PosProduct[]>(() => {
    const pointOfSale = toValue(options.pointOfSale);
    if (!pointOfSale) return [];

    const selectedCategoryId = toValue(options.selectedCategoryId);
    const isProductSearch = toValue(options.isProductSearch);
    const searchQuery = toValue(options.searchQuery);

    let products = pointOfSale.containers.flatMap((container) => {
      return container.products.map((product) => ({
        product,
        container,
      }));
    });

    if (selectedCategoryId && selectedCategoryId !== 'all' && !isProductSearch) {
      products = products.filter((product) => {
        return product.product.category.id === Number(selectedCategoryId);
      });
    }

    if (isProductSearch && searchQuery !== '') {
      products = new Fuse(products, {
        keys: ['product.name'],
        isCaseSensitive: false,
        shouldSort: true,
        threshold: 0.3,
      })
        .search(searchQuery)
        .map((r) => r.item);
    }

    return products;
  });

  const sortedProducts = computed(() => {
    const products = [...filteredProducts.value];

    products.sort((a, b) => {
      // Prioritize 'preferred', then sort alphabetically
      if (a.product.preferred && !b.product.preferred) {
        return -1;
      } else if (!a.product.preferred && b.product.preferred) {
        return 1;
      }

      // If category is 'all', first also sort by categoryId
      if (toValue(options.selectedCategoryId) === 'all') {
        if (a.product.category.id < b.product.category.id) {
          return -1;
        } else if (a.product.category.id > b.product.category.id) {
          return 1;
        }
      }

      const nameA = a.product.name.toLowerCase();
      const nameB = b.product.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return products;
  });

  return { sortedProducts };
}
