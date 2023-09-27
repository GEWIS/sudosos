import type { BannerResponse, ProductResponse } from "@sudosos/sudosos-client";

export function getProductImageSrc(product: ProductResponse): string {
    if (!product.image) {
        return 'https://imgur.com/CS0aauU.png';
    } else {
        return `${import.meta.env.VITE_APP_IMAGE_BASE}products/${product.image}`;
    }
}
export function getBannerImageSrc(banner: BannerResponse): string {
    return `${import.meta.env.VITE_LIVE_IMAGE_BASE}banners/${banner.image}`;
}
