export function getBasePath(): string {
  // @ts-expect-error it might exist, otherwise we have the fallback
  return window.__BASE_URL__ || '/';
}
