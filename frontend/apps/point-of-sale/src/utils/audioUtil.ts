function getSoundBasePath(): string {
  if (import.meta.env.DEV) return '/sounds/';
  if (window.location.pathname.includes('/pos-develop/')) return '/pos-develop/sounds/';
  return '/pos/sounds/';
}

export function playSound(soundName: string): void {
  const soundUrl = `${getSoundBasePath()}${soundName}`;
  const audio = new Audio(soundUrl);
  void audio.play().catch(() => {
    // Silently ignore audio playback errors (e.g., user interaction required)
  });
}
