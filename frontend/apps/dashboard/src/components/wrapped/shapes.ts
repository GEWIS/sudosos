/**
 * Colours a shape fades between, from its top left to its bottom right.
 */
export type Gradient = readonly [from: string, to: string];

export interface Shape {
  kind: 'circle' | 'blob' | 'pill' | 'half' | 'ring' | 'sparkle' | 'burst' | 'flower' | 'squiggle' | 'dots';
  motion: 'float' | 'spin' | 'sway' | 'morph' | 'pulse' | 'drift';
  gradient: Gradient;
  /** Centre of the shape, in percentages of the card. */
  x: number;
  y: number;
  /** Width of the shape, in percentages of the card width. */
  size: number;
  rotate?: number;
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// Dots are three rows of three with one centred dot below, so their box is 135 high for every 100 wide.
const aspectRatios: Partial<Record<Shape['kind'], number>> = { pill: 2.5, half: 2, squiggle: 2.5, dots: 100 / 135 };

export function aspectRatio(kind: Shape['kind']): number {
  return aspectRatios[kind] ?? 1;
}

/**
 * Kinds that stay within the circle that fits their box, whichever way they turn.
 */
const roundKinds: Shape['kind'][] = ['circle', 'ring', 'sparkle', 'burst', 'flower'];

/**
 * The area a shape can cover in a card of the given size, including the room its motion takes.
 */
export function footprint(shape: Shape, width: number, height: number): Box {
  const shapeWidth = (shape.size / 100) * width;
  const shapeHeight = shapeWidth / aspectRatio(shape.kind);
  const motionRoom = 1.15;
  let halfWidth: number;
  let halfHeight: number;
  if (roundKinds.includes(shape.kind)) {
    halfWidth = (shapeWidth / 2) * motionRoom;
    halfHeight = halfWidth;
  } else {
    const angles = shape.motion === 'spin' ? [0, 45, 90, 135] : [-25, 0, 25].map((a) => a + (shape.rotate ?? 0));
    const extents = angles.map((degrees) => {
      const radians = (degrees * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      return { x: (shapeWidth * cos + shapeHeight * sin) / 2, y: (shapeWidth * sin + shapeHeight * cos) / 2 };
    });
    halfWidth = Math.max(...extents.map((e) => e.x)) * motionRoom;
    halfHeight = Math.max(...extents.map((e) => e.y)) * motionRoom;
  }
  const x = (shape.x / 100) * width;
  const y = (shape.y / 100) * height;
  return { left: x - halfWidth, top: y - halfHeight, right: x + halfWidth, bottom: y + halfHeight };
}

export const lime: Gradient = ['#f2ff9e', '#4fd16b'];
export const pink: Gradient = ['#ffb3d4', '#c04bff'];
export const orange: Gradient = ['#ffc15e', '#ff3d3d'];
export const yellow: Gradient = ['#fffbb8', '#ffad33'];
const cream: Gradient = ['#ffffff', '#f5d2a8'];
const violet: Gradient = ['#d2c7ff', '#5b3dff'];
const mint: Gradient = ['#c2ffe0', '#0fb35f'];
const sky: Gradient = ['#d6f4ff', '#4f7dff'];

const burstPoints = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * 2 * Math.PI;
  const radius = index % 2 === 0 ? 50 : 36;
  return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
});

/**
 * Outlines of the shapes drawn as a single path, in a 100 by 100 box.
 */
export const shapePaths = {
  sparkle: 'M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0Z',
  burst: `M${burstPoints.join(' L')}Z`,
  flower:
    'M50 8 C62 8 66 26 72 30 C78 26 96 30 92 44 C90 52 76 52 74 56 C80 64 82 82 68 86 C58 88 54 74 50 72 C46 74 42 88 32 86 C18 82 20 64 26 56 C24 52 10 52 8 44 C4 30 22 26 28 30 C34 26 38 8 50 8Z',
};

const variants = {
  welcome: [
    { kind: 'blob', motion: 'morph', gradient: lime, x: 0, y: 100, size: 60 },
    { kind: 'sparkle', motion: 'spin', gradient: yellow, x: 86, y: 12, size: 34 },
    { kind: 'ring', motion: 'float', gradient: pink, x: 8, y: 23, size: 26 },
    { kind: 'squiggle', motion: 'sway', gradient: cream, x: 30, y: 9, size: 45, rotate: -12 },
  ],
  circles: [
    { kind: 'half', motion: 'drift', gradient: orange, x: 70, y: 96, size: 90, rotate: 0 },
    { kind: 'circle', motion: 'float', gradient: pink, x: 92, y: 8, size: 32 },
    { kind: 'dots', motion: 'sway', gradient: cream, x: 10, y: 10, size: 22 },
  ],
  sparkles: [
    { kind: 'sparkle', motion: 'spin', gradient: mint, x: 88, y: 10, size: 22 },
    { kind: 'sparkle', motion: 'pulse', gradient: yellow, x: 76, y: 92, size: 14 },
    { kind: 'sparkle', motion: 'spin', gradient: sky, x: 94, y: 70, size: 10 },
    { kind: 'circle', motion: 'float', gradient: violet, x: 100, y: 80, size: 18 },
  ],
  rings: [
    { kind: 'ring', motion: 'float', gradient: yellow, x: 88, y: 4, size: 30 },
    { kind: 'pill', motion: 'sway', gradient: pink, x: 12, y: 97, size: 45, rotate: -20 },
    { kind: 'circle', motion: 'pulse', gradient: sky, x: 96, y: 94, size: 14 },
  ],
  squiggles: [
    { kind: 'squiggle', motion: 'float', gradient: lime, x: 32, y: 10, size: 62, rotate: -8 },
    { kind: 'squiggle', motion: 'float', gradient: cream, x: 72, y: 93, size: 60, rotate: 10 },
    { kind: 'dots', motion: 'pulse', gradient: yellow, x: 92, y: 18, size: 18 },
  ],
  spotlight: [
    { kind: 'burst', motion: 'spin', gradient: yellow, x: 14, y: 46, size: 36 },
    { kind: 'flower', motion: 'spin', gradient: pink, x: 88, y: 53, size: 30 },
    { kind: 'sparkle', motion: 'pulse', gradient: pink, x: 12, y: 12, size: 18 },
    { kind: 'sparkle', motion: 'spin', gradient: cream, x: 90, y: 90, size: 14 },
  ],
  pills: [
    { kind: 'pill', motion: 'drift', gradient: lime, x: 94, y: 5, size: 34, rotate: 25 },
    { kind: 'pill', motion: 'drift', gradient: orange, x: 6, y: 97, size: 40, rotate: -30 },
    { kind: 'circle', motion: 'float', gradient: yellow, x: 96, y: 94, size: 16 },
  ],
  bursts: [
    { kind: 'burst', motion: 'spin', gradient: yellow, x: 92, y: 10, size: 48 },
    { kind: 'flower', motion: 'sway', gradient: pink, x: 8, y: 92, size: 42 },
    { kind: 'circle', motion: 'pulse', gradient: cream, x: 90, y: 88, size: 12 },
  ],
  blobs: [
    { kind: 'blob', motion: 'morph', gradient: lime, x: 100, y: 6, size: 70 },
    { kind: 'blob', motion: 'morph', gradient: cream, x: 0, y: 98, size: 60, rotate: 90 },
    { kind: 'sparkle', motion: 'spin', gradient: yellow, x: 88, y: 88, size: 16 },
  ],
  halves: [
    { kind: 'half', motion: 'sway', gradient: yellow, x: 86, y: 6, size: 50, rotate: 180 },
    { kind: 'half', motion: 'drift', gradient: violet, x: 16, y: 96, size: 55 },
    { kind: 'dots', motion: 'float', gradient: cream, x: 92, y: 90, size: 18 },
  ],
  mono: [
    {
      kind: 'ring',
      motion: 'float',
      gradient: ['rgb(255 255 255 / 0.5)', 'rgb(255 255 255 / 0.15)'],
      x: 92,
      y: 10,
      size: 40,
    },
    { kind: 'circle', motion: 'drift', gradient: ['rgb(0 0 0 / 0.05)', 'rgb(0 0 0 / 0.3)'], x: 4, y: 96, size: 60 },
    {
      kind: 'sparkle',
      motion: 'spin',
      gradient: ['rgb(255 255 255 / 0.7)', 'rgb(255 255 255 / 0.3)'],
      x: 90,
      y: 90,
      size: 14,
    },
  ],
  banner: [
    { kind: 'blob', motion: 'morph', gradient: lime, x: 60, y: 115, size: 14 },
    { kind: 'sparkle', motion: 'spin', gradient: yellow, x: 57.5, y: 28, size: 4 },
    { kind: 'squiggle', motion: 'sway', gradient: cream, x: 64.5, y: 24, size: 6, rotate: -10 },
    { kind: 'ring', motion: 'float', gradient: pink, x: 71, y: 14, size: 5 },
    { kind: 'dots', motion: 'pulse', gradient: sky, x: 67, y: 72, size: 3.5 },
    { kind: 'half', motion: 'drift', gradient: orange, x: 84, y: 100, size: 12 },
    { kind: 'circle', motion: 'float', gradient: violet, x: 97, y: 0, size: 9 },
  ],
  /** The banner on phones, where its title and button stack on the left. */
  bannerNarrow: [
    { kind: 'circle', motion: 'float', gradient: violet, x: 98, y: 0, size: 22 },
    { kind: 'sparkle', motion: 'spin', gradient: yellow, x: 86, y: 50, size: 9 },
    { kind: 'dots', motion: 'pulse', gradient: sky, x: 95, y: 70, size: 7 },
    { kind: 'ring', motion: 'float', gradient: pink, x: 72, y: 78, size: 10 },
    { kind: 'blob', motion: 'morph', gradient: lime, x: 58, y: 112, size: 22 },
    { kind: 'half', motion: 'drift', gradient: orange, x: 90, y: 100, size: 28 },
  ],
} satisfies Record<string, Shape[]>;

export type ShapeVariant = keyof typeof variants;

export const shapeVariants: Record<ShapeVariant, Shape[]> = variants;
