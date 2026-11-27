import { computed, inject, onUnmounted, ref, watch, type InjectionKey, type Ref, type ShallowRef } from 'vue';

export interface CardReveal {
  duration: number;
  done: Readonly<Ref<boolean>>;
  finish: () => void;
}

/**
 * The reveal of the card that is currently shown, so the deck can time and skip it.
 */
export const activeRevealKey: InjectionKey<ShallowRef<CardReveal | undefined>> = Symbol('activeReveal');

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals the steps of a card one after another, the first time the card becomes active.
 * `delays[i]` is the time in milliseconds between step `i + 1` and the step before it.
 */
export function useCardReveal(active: () => boolean, delays: number[]) {
  const step = ref(0);
  const timers: number[] = [];
  const activeReveal = inject(activeRevealKey, undefined);

  function finish() {
    timers.forEach(clearTimeout);
    step.value = delays.length;
  }

  const reveal: CardReveal = {
    duration: delays.reduce((total, delay) => total + delay, 0),
    done: computed(() => step.value >= delays.length),
    finish,
  };

  watch(
    active,
    (isActive) => {
      if (isActive && activeReveal) activeReveal.value = reveal;
      if (!isActive || step.value > 0 || timers.length > 0) return;
      if (prefersReducedMotion()) {
        finish();
        return;
      }

      let elapsed = 0;
      delays.forEach((delay, index) => {
        elapsed += delay;
        timers.push(window.setTimeout(() => (step.value = index + 1), elapsed));
      });
    },
    { immediate: true },
  );

  onUnmounted(() => timers.forEach(clearTimeout));

  return { step, done: reveal.done };
}

/**
 * Counts from zero up to `target` once `start` returns true. It jumps to `target` when `skip` returns true.
 */
export function useCountUp(
  target: () => number,
  start: () => boolean,
  skip: () => boolean,
  duration = 2500,
): Ref<number> {
  const value = ref(0);
  let frame = 0;

  watch(
    start,
    (started) => {
      if (!started) return;

      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = skip() ? 1 : Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        value.value = Math.round(target() * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
    { immediate: true },
  );

  onUnmounted(() => cancelAnimationFrame(frame));

  return value;
}
