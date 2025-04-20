export function isBetaEnabled(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)X-Beta-Enabled=([^;]*)/);
  return match?.[1] === 'true';
}
