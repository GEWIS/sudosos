import { BannerResponse, ProductResponse } from '@sudosos/sudosos-client';

export function getProductImageSrc(product: ProductResponse): string {
  if (!product.image) {
    return 'https://imgur.com/CS0aauU.png';
  }
  return `${window.location.origin}/static/products/${product.image}`;
}
export function getBannerImageSrc(banner: BannerResponse): string {
  return `${window.location.origin}/static/banners/${banner.image}`;
}
