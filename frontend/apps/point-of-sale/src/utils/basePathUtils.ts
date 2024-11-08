export function getBasePath(): string {
  // @ts-ignore
  return window.__BASE_URL__ || '/';
}
