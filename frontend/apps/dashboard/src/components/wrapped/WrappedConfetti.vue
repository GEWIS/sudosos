<template>
  <div aria-hidden="true" class="confetti">
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="piece"
      :style="{
        left: `${piece.left}%`,
        width: `${piece.size}px`,
        height: `${piece.round ? piece.size : piece.size * 0.45}px`,
        borderRadius: piece.round ? '50%' : '1px',
        background: piece.color,
        '--drift': `${piece.drift}px`,
        '--spin': `${piece.spin}deg`,
        '--duration': `${piece.duration}ms`,
        '--delay': `${piece.delay}ms`,
      }"
    ></span>
  </div>
</template>

<script setup lang="ts">
const colors = ['#cdf564', '#f573a0', '#fff36d', '#7dd3fc', '#ff6b35', '#fbf3e4'];

// A fixed pattern that looks random, so the confetti falls the same way every time.
const noise = (index: number, salt: number) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const pieces = Array.from({ length: 48 }, (_, index) => ({
  left: noise(index, 1) * 100,
  size: 6 + noise(index, 2) * 7,
  round: noise(index, 3) > 0.7,
  color: colors[index % colors.length],
  drift: (noise(index, 4) - 0.5) * 140,
  spin: (noise(index, 5) - 0.5) * 1440,
  duration: 2200 + noise(index, 6) * 1600,
  delay: noise(index, 7) * 700,
}));
</script>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  container-type: size;
  z-index: 3;
}

.piece {
  position: absolute;
  top: -20px;
  animation: fall var(--duration) cubic-bezier(0.25, 0.6, 0.45, 1) var(--delay) both;
}

@keyframes fall {
  from {
    transform: translate(0, 0) rotate(0);
  }
  to {
    transform: translate(var(--drift), calc(100cqh + 40px)) rotate(var(--spin));
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}
</style>
