<template>
  <div ref="root" aria-hidden="true" class="shapes" :class="{ active }">
    <div
      v-for="(shape, index) in shapes"
      v-show="fits[index] > 0"
      :key="index"
      class="shape"
      :class="`shape-${shape.kind}`"
      :style="{
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        width: `${shape.size * fits[index]}%`,
        aspectRatio: aspectRatio(shape.kind),
        '--from': shape.gradient[0],
        '--to': shape.gradient[1],
        '--rotate': `${shape.rotate ?? 0}deg`,
        '--delay': `${index * 90}ms`,
      }"
    >
      <div class="motion" :class="shape.motion">
        <svg v-if="!boxKinds.includes(shape.kind)" :viewBox="`0 0 100 ${100 / aspectRatio(shape.kind)}`">
          <defs>
            <linearGradient
              :id="`${id}-${index}`"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="100"
              y1="0"
              :y2="100 / aspectRatio(shape.kind)"
            >
              <stop :stop-color="shape.gradient[0]" />
              <stop offset="1" :stop-color="shape.gradient[1]" />
            </linearGradient>
          </defs>
          <path
            v-if="shape.kind in shapePaths"
            :d="shapePaths[shape.kind as keyof typeof shapePaths]"
            :fill="`url(#${id}-${index})`"
          />
          <circle
            v-else-if="shape.kind === 'ring'"
            cx="50"
            cy="50"
            fill="none"
            r="40"
            :stroke="`url(#${id}-${index})`"
            stroke-width="16"
          />
          <path
            v-else-if="shape.kind === 'squiggle'"
            d="M5 20 Q 16 2 27 20 T 49 20 T 71 20 T 93 20"
            fill="none"
            pathLength="1"
            :stroke="`url(#${id}-${index})`"
            stroke-linecap="round"
            stroke-width="8"
          />
          <g v-else-if="shape.kind === 'dots'" :fill="`url(#${id}-${index})`">
            <circle v-for="[cx, cy] in dots" :key="`${cx}-${cy}`" :cx="cx" :cy="cy" r="9" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import {
  aspectRatio,
  footprint,
  shapePaths,
  shapeVariants,
  type Box,
  type Shape,
  type ShapeVariant,
} from '@/components/wrapped/shapes';

const props = defineProps<{ variant: ShapeVariant; active: boolean }>();

const TEXT = 'h1, h2, h3, h4, p, li, dt, dd, a, span, button';
const TEXT_MARGIN = 8;

const root = ref<HTMLElement>();
const shapes = computed(() => shapeVariants[props.variant]);
const id = useId();
/**
 * Kinds drawn as a box with rounded corners instead of an SVG.
 */
const boxKinds: Shape['kind'][] = ['circle', 'blob', 'pill', 'half'];
/**
 * How much each shape is scaled down to stay clear of the text, or 0 when it does not fit at all.
 */
const fits = ref<number[]>([]);
const SCALES = [1, 0.75, 0.55, 0.4];

/**
 * Layout position of an element within the card, without the transforms of the reveal animations.
 */
function boxOf(element: HTMLElement, card: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let current: Element | null = element;
  while (current instanceof HTMLElement && current !== card) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent;
  }
  if (current === card) return { left, top, right: left + element.offsetWidth, bottom: top + element.offsetHeight };

  const outer = card.getBoundingClientRect();
  const inner = element.getBoundingClientRect();
  return {
    left: inner.left - outer.left,
    top: inner.top - outer.top,
    right: inner.right - outer.left,
    bottom: inner.bottom - outer.top,
  };
}

/**
 * The part of an element's layout box that its text takes up. A heading is as wide as the card,
 * but its text often is not.
 */
function textBoxOf(element: HTMLElement, card: HTMLElement): Box {
  const layout = boxOf(element, card);
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  const rendered = element.getBoundingClientRect();
  if (text.width === 0 || rendered.width === 0 || rendered.height === 0) return layout;

  const scaleX = (layout.right - layout.left) / rendered.width;
  const scaleY = (layout.bottom - layout.top) / rendered.height;
  return {
    left: layout.left + (text.left - rendered.left) * scaleX,
    top: layout.top + (text.top - rendered.top) * scaleY,
    right: layout.left + (text.right - rendered.left) * scaleX,
    bottom: layout.top + (text.bottom - rendered.top) * scaleY,
  };
}

function overlaps(a: Box, b: Box): boolean {
  return (
    a.left < b.right + TEXT_MARGIN &&
    b.left - TEXT_MARGIN < a.right &&
    a.top < b.bottom + TEXT_MARGIN &&
    b.top - TEXT_MARGIN < a.bottom
  );
}

/**
 * Text on an opaque panel, such as the product photo card, stays readable with a shape behind it.
 */
function onOpaquePanel(element: HTMLElement, card: HTMLElement): boolean {
  for (let current: HTMLElement | null = element; current && current !== card; current = current.parentElement) {
    const background = getComputedStyle(current).backgroundColor;
    if (background.startsWith('rgb(')) return true;
  }
  return false;
}

function findCoveringShapes() {
  const card = root.value?.parentElement;
  if (!card) return;

  const text = [...card.querySelectorAll<HTMLElement>(TEXT)]
    .filter((element) => !root.value!.contains(element) && element.offsetWidth > 0)
    .filter((element) => element.textContent?.trim())
    .filter((element) => !onOpaquePanel(element, card))
    .map((element) => textBoxOf(element, card));
  fits.value = shapes.value.map((shape) => {
    const scale = SCALES.find((s) => {
      const box = footprint({ ...shape, size: shape.size * s }, card.clientWidth, card.clientHeight);
      return !text.some((textBox) => overlaps(box, textBox));
    });
    return scale ?? 0;
  });
}

const MEASURE_INTERVAL = 200;
let measureTimer = 0;

function scheduleMeasure() {
  if (measureTimer) return;
  measureTimer = window.setTimeout(() => {
    measureTimer = 0;
    findCoveringShapes();
  }, MEASURE_INTERVAL);
}

const resizeObserver = new ResizeObserver(findCoveringShapes);
const mutationObserver = new MutationObserver(scheduleMeasure);

onMounted(() => {
  const card = root.value!.parentElement!;
  resizeObserver.observe(card);
  card.querySelectorAll('.content').forEach((content) => resizeObserver.observe(content));
  mutationObserver.observe(card, { characterData: true, childList: true, subtree: true });
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
  mutationObserver.disconnect();
  clearTimeout(measureTimer);
});

watch(() => props.variant, findCoveringShapes);

const dots = [...[15, 50, 85].flatMap((x) => [15, 50, 85].map((y) => [x, y])), [50, 120]];
</script>

<style scoped>
.shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--rotate)) scale(0);
  transition: transform 250ms ease-in;
}

.active .shape {
  transform: translate(-50%, -50%) rotate(var(--rotate)) scale(1);
  animation: shape-in 800ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay) backwards;
}

.motion,
.motion svg {
  width: 100%;
  height: 100%;
  display: block;
}

.shape-circle .motion,
.shape-blob .motion,
.shape-pill .motion,
.shape-half .motion {
  background: linear-gradient(135deg, var(--from), var(--to));
  border-radius: 9999px;
}

.shape-half .motion {
  border-radius: 9999px 9999px 0 0;
}

.shape-blob .motion {
  border-radius: 62% 38% 32% 68% / 58% 30% 70% 42%;
}

.shape-squiggle path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

.active .shape-squiggle path {
  animation: draw 1200ms ease-out calc(var(--delay) + 300ms) forwards;
}

.active .float {
  animation: float 5s ease-in-out infinite alternate;
}

.active .spin {
  animation: spin 22s linear infinite;
}

.active .sway {
  animation: sway 3.5s ease-in-out infinite alternate;
}

.active .morph {
  animation: morph 7s ease-in-out infinite alternate;
}

.active .pulse {
  animation: pulse 2.4s ease-in-out infinite alternate;
}

.active .drift {
  animation: drift 8s ease-in-out infinite alternate;
}

@keyframes shape-in {
  from {
    transform: translate(-50%, -50%) rotate(calc(var(--rotate) - 120deg)) scale(0);
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes float {
  from {
    transform: translateY(-7%);
  }
  to {
    transform: translateY(7%);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes sway {
  from {
    transform: rotate(-12deg);
  }
  to {
    transform: rotate(12deg);
  }
}

@keyframes morph {
  50% {
    border-radius: 34% 66% 62% 38% / 44% 62% 38% 56%;
    transform: rotate(25deg) scale(1.05);
  }
  to {
    border-radius: 55% 45% 40% 60% / 35% 55% 45% 65%;
    transform: rotate(-15deg);
  }
}

@keyframes pulse {
  from {
    transform: scale(0.9);
  }
  to {
    transform: scale(1.1);
  }
}

@keyframes drift {
  from {
    transform: translate(-6%, 4%) rotate(-6deg);
  }
  to {
    transform: translate(6%, -4%) rotate(8deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shape,
  .active .shape {
    transform: translate(-50%, -50%) rotate(var(--rotate));
    animation: none;
  }

  .active .motion,
  .active .shape-squiggle path {
    animation: none;
  }

  .shape-squiggle path {
    stroke-dashoffset: 0;
  }
}
</style>
