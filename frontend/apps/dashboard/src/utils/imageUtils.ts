import type { BannerResponse, ProductResponse } from "@sudosos/sudosos-client";

export function getProductImageSrc(product: ProductResponse): string {
    if (!product.image) {
        return 'https://imgur.com/CS0aauU.png';
    } else {
        // Regular expression to check if product.image is a URL
        // This allows for instant updating of the image locally
        const urlRegex = /(http|https):\/\/[^ "]+$/;
        if (urlRegex.test(product.image)) {
            // If product.image is a URL, return it directly
            return product.image;
        } else {
            // If product.image is not a URL, construct the URL
            return `${import.meta.env.VITE_APP_IMAGE_BASE}products/${product.image}`;
        }
    }
}
export function getBannerImageSrc(banner: BannerResponse): string {
    return `${import.meta.env.VITE_APP_IMAGE_BASE}banners/${banner.image}`;
}
