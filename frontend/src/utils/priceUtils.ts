export function formatPrice(number: number) {
  return (number / 100).toFixed(2).replace('.',',');
};
