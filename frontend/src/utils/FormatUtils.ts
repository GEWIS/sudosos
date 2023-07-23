export function dateFromString(date: string) {
  return date.split('T')[0];
}

export function timeFromString(date: string) {
  return date.split('T')[1].slice(0, 5);
}
