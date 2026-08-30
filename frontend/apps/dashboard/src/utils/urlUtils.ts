import type { BannerResponse, ProductResponse } from '@gewis/sudosos-client';

export function resolveImageUrl(
  image: string | null | undefined,
  fallbackPath: string,
  defaultFallbackUrl: string,
): string {
  if (!image) return defaultFallbackUrl;

  const isUrl = /^(blob:|http:\/\/|https:\/\/)[^ "]+$/.test(image);
  if (isUrl) return image;

  return `${window.location.origin}${fallbackPath}/${image}`;
}

export function getProductImageSrc(product: ProductResponse): string {
  return resolveImageUrl(product.image, '/static/products', 'https://imgur.com/CS0aauU.png');
}

export function getProductImageSrcFromString(image: string): string {
  return resolveImageUrl(image, '/static/products', 'https://imgur.com/CS0aauU.png');
}

export function getBannerImageSrc(banner: BannerResponse): string {
  return resolveImageUrl(banner.image, '/static/banners', 'https://imgur.com/CS0aauU.png');
}

export function getInvoicePdfSrc(pdf: string): string {
  return `${window.location.origin}/static/invoices/${pdf}`;
}

export function getPayoutPdfSrc(pdf: string): string {
  return `${window.location.origin}/static/payouts/${pdf}`;
}

export function getSellerPayoutPdfSrc(pdf: string): string {
  return `${window.location.origin}/static/sellerPayouts/${pdf}`;
}

export function getWriteOffPdfSrc(pdf: string): string {
  return `${window.location.origin}/static/writeOffs/${pdf}`;
}

/**
 * Link to a member's profile on the GEWIS website.
 */
export function getGewisMemberUrl(gewisId: number | string, locale: string): string {
  const gewisLocale = locale === 'nl' ? 'nl' : 'en';
  return `https://gewis.nl/${gewisLocale}/members/${gewisId}`;
}
