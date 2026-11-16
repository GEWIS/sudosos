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
