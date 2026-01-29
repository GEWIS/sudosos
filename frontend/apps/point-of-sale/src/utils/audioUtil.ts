const AUDIO_BASE_PATH = (() => {
  if (location.hostname === 'localhost') return '/sounds/';
  if (window.location.pathname.includes('/pos-develop/')) return '/pos-develop/sounds/';
  return '/pos/sounds/';
})();

export enum Sound {
  PRESS = 'button-press.wav',
  TOP_UP_WARNING = 'sad-trombone.wav',
  CASHOUT = 'rct-cash.wav',
}

const audioCache: Map<Sound, HTMLAudioElement> = new Map();

function getAudio(audio: Sound, volume: number = 1.0): HTMLAudioElement {
  let audioElement = audioCache.get(audio);
  if (!audioElement) {
    const audioUrl = `${AUDIO_BASE_PATH}${audio}`;
    audioElement = new Audio(audioUrl);
    audioCache.set(audio, audioElement);
  }

  audioElement.volume = volume;
  return audioElement;
}

export function preloadAudios(audios: Sound[]): void {
  for (const audio of audios) {
    const audioElement = getAudio(audio);
    if (!audioElement.preload) {
      audioElement.preload = 'auto';
    }
    audioElement.load();
  }
}

export function playAudio(audio: Sound, volume: number = 1.0): void {
  const audioElement = getAudio(audio, volume);
  // If audio is already playing, stop it and play from the beginning.
  audioElement.currentTime = 0;

  void audioElement.play().catch(() => {
    // Silently ignore audio playback errors (e.g., user interaction required)
  });
}
