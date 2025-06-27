export function debounce<T extends (...args: never[]) => Promise<void>>(func: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      void func(...args);
    }, delay);
  };
}
