import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportImageOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  quality?: number;
  skipFonts?: boolean;
}

export interface ExportPdfOptions extends ExportImageOptions {
  orientation: 'portrait' | 'landscape';
  unit?: 'mm' | 'pt';
  format?: string | [number, number];
  imgX?: number;
  imgY?: number;
  imgW?: number;
  imgH?: number;
}

/**
 * Converts a base64 Data URL into a native binary Blob
 * Required to bypass sandboxed iframe restrictions on data: URI downloads
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Universal safe file download trigger compatible with sandboxed iframes & modern web standards
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';

  document.body.appendChild(anchor);
  anchor.click();

  // Clean up object URL after download has initiated
  setTimeout(() => {
    try {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Ignore cleanup error if DOM element was already detached
    }
  }, 4000);
}

/**
 * Robust element screenshot engine with multi-tier fallbacks:
 * 1. html-to-image (vector-grade SVG rendering with font skip)
 * 2. html2canvas (DOM rasterizer bypassing foreignObject restrictions)
 * 3. Fallback canvas capture
 */
export async function captureElementToPng(
  element: HTMLElement,
  options?: ExportImageOptions
): Promise<string> {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('Target DOM element for capture is invalid or null');
  }

  const pixelRatio = options?.pixelRatio ?? 2.5;
  const backgroundColor = options?.backgroundColor ?? '#ffffff';
  const quality = options?.quality ?? 0.95;
  const skipFonts = options?.skipFonts ?? true;

  // Tier 1: Try html-to-image with race timeout (2500ms max)
  try {
    const htmlToImagePromise = toPng(element, {
      cacheBust: false,
      pixelRatio,
      backgroundColor,
      quality,
      skipFonts,
      fontEmbedCSS: '',
      imagePlaceholder:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23f1f5f9"/>',
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('html-to-image timeout exceeded')), 2500)
    );

    const result = await Promise.race([htmlToImagePromise, timeoutPromise]);
    if (result && result.length > 500) {
      return result;
    }
  } catch (err) {
    console.warn('html-to-image capture failed or timed out, executing html2canvas fallback:', err);
  }

  // Tier 2: html2canvas DOM rasterization
  try {
    const canvas = await html2canvas(element, {
      scale: pixelRatio > 2 ? 2 : pixelRatio,
      backgroundColor,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    return canvas.toDataURL('image/png', quality);
  } catch (h2cError) {
    console.warn('html2canvas standard failed, trying relaxed capture mode:', h2cError);
  }

  // Tier 3: Conservative html2canvas with lower scale
  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } catch (finalError) {
    console.error('All rendering tiers exhausted for capture:', finalError);
    throw new Error('Unable to capture visual document. Please take a manual screenshot.');
  }
}

/**
 * Exports and triggers instant download of a DOM element as a high-resolution PNG
 * Uses ObjectURL blobs for seamless execution in preview iframes
 */
export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
  options?: ExportImageOptions
): Promise<string> {
  if (!element) {
    throw new Error('Target element for PNG export is null');
  }
  const dataUrl = await captureElementToPng(element, options);
  const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  const blob = dataUrlToBlob(dataUrl);
  triggerBlobDownload(blob, cleanFilename);
  return dataUrl;
}

/**
 * Converts a DOM element to an image and bundles it into an authentic vector PDF document
 * Triggers clean Blob download compatible with iframe containers
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  options: ExportPdfOptions
): Promise<Blob> {
  if (!element) {
    throw new Error('Target element for PDF export is null');
  }
  const dataUrl = await captureElementToPng(element, options);
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: options.unit || 'mm',
    format: options.format || 'a4',
  });

  const x = options.imgX ?? (options.orientation === 'landscape' ? 10 : 10);
  const y = options.imgY ?? (options.orientation === 'landscape' ? 10 : 10);
  const w = options.imgW ?? (options.orientation === 'landscape' ? 277 : 190);
  const h = options.imgH ?? (options.orientation === 'landscape' ? 190 : 260);

  pdf.addImage(dataUrl, 'PNG', x, y, w, h);

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdfBlob = pdf.output('blob');
  triggerBlobDownload(pdfBlob, cleanFilename);
  return pdfBlob;
}
