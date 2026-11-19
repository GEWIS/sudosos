import { lime, orange, pink, shapePaths, yellow, type Gradient } from '@/components/wrapped/shapes';

export interface SummaryLine {
  label: string;
  value: string;
}

export interface Summary {
  title: string;
  name: string;
  tagline: string;
  lines: SummaryLine[];
}

const WIDTH = 1080;
const HEIGHT = 1920;
const MARGIN = 96;

/**
 * Draws a shape in a 100 by 100 box centred on (x, y), filled with a gradient from its top left to its bottom right.
 */
function drawShape(
  context: CanvasRenderingContext2D,
  gradient: Gradient,
  x: number,
  y: number,
  size: number,
  draw: (paint: CanvasGradient) => void,
) {
  context.save();
  context.translate(x - size / 2, y - size / 2);
  context.scale(size / 100, size / 100);
  const paint = context.createLinearGradient(0, 0, 100, 100);
  paint.addColorStop(0, gradient[0]);
  paint.addColorStop(1, gradient[1]);
  draw(paint);
  context.restore();
}

/**
 * The shapes of the cards, placed in the margins and corners the text leaves free.
 */
function drawShapes(context: CanvasRenderingContext2D) {
  drawShape(context, yellow, 950, 130, 240, (paint) => {
    context.fillStyle = paint;
    context.fill(new Path2D(shapePaths.sparkle));
  });
  drawShape(context, pink, 990, 600, 130, (paint) => {
    context.strokeStyle = paint;
    context.lineWidth = 16;
    context.beginPath();
    context.arc(50, 50, 40, 0, 2 * Math.PI);
    context.stroke();
  });
  drawShape(context, lime, 10, 1480, 170, (paint) => {
    context.fillStyle = paint;
    context.beginPath();
    context.arc(50, 50, 50, 0, 2 * Math.PI);
    context.fill();
  });
  drawShape(context, orange, 800, 1920, 640, (paint) => {
    context.fillStyle = paint;
    context.beginPath();
    context.arc(50, 50, 50, Math.PI, 2 * Math.PI);
    context.fill();
  });
}

/**
 * Draws the summary as a portrait image, the format of a story on most platforms.
 */
export function renderSummary(summary: Summary): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d')!;
  const fontFamily = getComputedStyle(document.body).fontFamily;
  const text = (content: string, y: number, size: number, weight: number, alpha = 1) => {
    context.font = `${weight} ${size}px ${fontFamily}`;
    context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    context.fillText(content, MARGIN, y, WIDTH - 2 * MARGIN);
  };

  context.fillStyle = '#b40000';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  drawShapes(context);

  text(summary.title, 220, 64, 700);
  text(summary.name, 300, 48, 400, 0.8);
  text(summary.tagline, 500, 104, 900);

  summary.lines.forEach((line, index) => {
    const y = 700 + index * 210;
    text(line.label, y, 44, 400, 0.7);
    text(line.value, y + 90, 80, 700);
  });

  text('sudosos.gewis.nl', HEIGHT - MARGIN, 40, 400, 0.6);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not render the summary'))),
      'image/jpeg',
      0.92,
    );
  });
}

/**
 * Shares a file through the share sheet of the device, or downloads it when there is none.
 */
export async function shareFile(file: File, title: string): Promise<void> {
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
    });
    return;
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(link.href);
}
