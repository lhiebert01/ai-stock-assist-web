import type { Methodology } from '../types/stock';

// Printer-friendly LIGHT theme applied ONLY to the cloned DOM during PDF capture
// (the live app stays dark). Root cause of the "invisible text" bug: html2canvas
// drops inherited CSS-variable colors, so nodes without an explicit color class
// (ticker symbols, prices) defaulted to black and vanished on the dark background.
// A white background makes black-default text visible, and remapping the design
// tokens to high-contrast values keeps every value + chart/table readable in print.
// Color palette kept to a few high-contrast hues: deep red, dark green, dark amber,
// dark teal — all clearly visible on white and printer-safe.
const PDF_LIGHT_THEME_CSS = `
  .pdf-light-root {
    --color-surface-0: #ffffff; --color-surface-1: #ffffff; --color-surface-2: #ffffff;
    --color-surface-3: #f1f5f9; --color-border: #cbd5e1; --color-border-light: #94a3b8;
    --color-text-primary: #0f172a; --color-text-secondary: #334155; --color-text-muted: #475569;
    --color-accent: #0e7490; --color-accent-dim: #155e75;
    --color-buy: #15803d; --color-sell: #b91c1c; --color-hold: #a16207;
    background: #ffffff !important; color: #0f172a !important;
  }
  /* Neutralise any explicit dark fills that don't flow through the tokens */
  .pdf-light-root [class*="bg-black"],
  .pdf-light-root [class*="bg-slate-9"],
  .pdf-light-root [class*="bg-gray-9"] { background-color: #ffffff !important; }
`;

// Stay safely under the browser's ~16,384px max canvas dimension (Chrome/Safari).
const SAFE_MAX_PX = 16000;
// Target capture density. scale 2 over a 1200px layout → ~2400px across the 190mm
// content area → ~320 DPI in the final PDF (sharp, readable small text).
const TARGET_SCALE = 2;
const JPEG_QUALITY = 0.92;

/** Composite a (possibly transparent) capture onto opaque white so pages never
 *  export as black-RGB + alpha (which renders blank). */
function flattenOpaque(src: HTMLCanvasElement): HTMLCanvasElement {
  const flat = document.createElement('canvas');
  flat.width = src.width;
  flat.height = src.height;
  const ctx = flat.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, src.width, src.height);
    ctx.drawImage(src, 0, 0);
  }
  return flat;
}

/**
 * Captures a DOM element as a multi-page PDF using html2canvas + jspdf.
 * Elements with class `.no-print` are hidden during capture.
 * Capture uses a white, high-contrast print theme (see PDF_LIGHT_THEME_CSS).
 *
 * Resolution: the report is captured in vertical chunks at TARGET_SCALE (~320 DPI)
 * so tall multi-stock reports stay sharp. A single chunk that fails the browser's
 * canvas limit (or any capture error) falls back to one full-page capture at the
 * best single-canvas scale — identical to the prior behavior — so export never breaks.
 */
export async function exportPdf(
  element: HTMLElement,
  methodology: Methodology,
  tickers: string[]
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // Hide no-print elements during capture
  const noPrintEls = element.querySelectorAll<HTMLElement>('.no-print');
  noPrintEls.forEach((el) => (el.style.display = 'none'));

  const onclone = (clonedDoc: Document, clonedEl: HTMLElement) => {
    clonedEl.classList.add('pdf-light-root');
    const style = clonedDoc.createElement('style');
    style.textContent = PDF_LIGHT_THEME_CSS;
    clonedDoc.head.appendChild(style);
  };
  const commonOpts = {
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: 1200,
    onclone,
  };

  const totalSrcHeight = Math.max(1, element.scrollHeight);

  // Each chunk is a slice of the full-resolution "virtual" capture. We track each
  // chunk's top edge in device pixels so the page assembler can read/draw across
  // chunk boundaries as if it were one tall image.
  type Chunk = { devTop: number; canvas: HTMLCanvasElement };
  let chunks: Chunk[] = [];
  let imgWidth = 0;

  try {
    // High-res path: capture in vertical bands at TARGET_SCALE so no single canvas
    // exceeds the browser limit (band height in CSS px * scale ≤ SAFE_MAX_PX).
    const chunkSrcH = Math.floor(SAFE_MAX_PX / TARGET_SCALE);
    for (let y = 0; y < totalSrcHeight; y += chunkSrcH) {
      const h = Math.min(chunkSrcH, totalSrcHeight - y);
      const c = await html2canvas(element, {
        ...commonOpts,
        scale: TARGET_SCALE,
        y,
        height: h,
        windowHeight: totalSrcHeight,
      });
      // If cropping was ignored (canvas far larger/smaller than the band), bail to
      // the safe single-capture path rather than emit a misaligned PDF.
      if (!c.width || Math.abs(c.height - h * TARGET_SCALE) > TARGET_SCALE * 8) {
        throw new Error('chunk capture size mismatch');
      }
      chunks.push({ devTop: Math.round(y * TARGET_SCALE), canvas: flattenOpaque(c) });
    }
    if (!chunks.length) throw new Error('no chunks captured');
    imgWidth = chunks[0].canvas.width;
  } catch {
    // Fallback: original single-canvas capture at the best height-limited scale.
    chunks = [];
    const scale = Math.min(TARGET_SCALE, SAFE_MAX_PX / totalSrcHeight);
    const c = await html2canvas(element, { ...commonOpts, scale });
    chunks = [{ devTop: 0, canvas: flattenOpaque(c) }];
    imgWidth = c.width;
  }

  // Restore hidden elements
  noPrintEls.forEach((el) => (el.style.display = ''));

  const imgHeight = chunks.reduce((m, ch) => Math.max(m, ch.devTop + ch.canvas.height), 0);

  // Draw virtual device-pixel rows [sy, sy+sh) into destCtx at destY, sourcing from
  // whichever chunk(s) overlap that range.
  const copyRegion = (destCtx: CanvasRenderingContext2D, destY: number, sy: number, sh: number) => {
    for (const ch of chunks) {
      const top = Math.max(sy, ch.devTop);
      const bot = Math.min(sy + sh, ch.devTop + ch.canvas.height);
      if (bot <= top) continue;
      destCtx.drawImage(
        ch.canvas,
        0, top - ch.devTop, imgWidth, bot - top,
        0, destY + (top - sy), imgWidth, bot - top,
      );
    }
  };

  // Read a horizontal strip of the virtual image as ImageData (for whitespace scan).
  const stripData = (sy: number, sh: number): ImageData | null => {
    if (sh <= 0) return null;
    const t = document.createElement('canvas');
    t.width = imgWidth;
    t.height = sh;
    const tc = t.getContext('2d');
    if (!tc) return null;
    tc.fillStyle = '#ffffff';
    tc.fillRect(0, 0, imgWidth, sh);
    copyRegion(tc, 0, sy, sh);
    try {
      return tc.getImageData(0, 0, imgWidth, sh);
    } catch {
      return null;
    }
  };

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const headerHeight = 12;
  const footerHeight = 8;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - headerHeight - footerHeight;

  // Source-pixels per full content page.
  const pageSrcHeight = contentHeight * (imgWidth / contentWidth);

  // Compute page-break rows, snapping each up to the nearest whitespace gap so a
  // line of text is never sliced in half across a page boundary.
  const breaks: number[] = [0];
  const scanWindow = Math.round(pageSrcHeight * 0.1);
  let cursor = 0;
  while (cursor < imgHeight) {
    const target = cursor + pageSrcHeight;
    if (target >= imgHeight) { breaks.push(imgHeight); break; }
    let breakY = Math.floor(target);
    const scanTop = Math.max(cursor + 1, Math.floor(target) - scanWindow);
    const strip = stripData(scanTop, Math.floor(target) - scanTop);
    if (strip) {
      for (let ry = strip.height - 1; ry >= 0; ry--) {
        let isWhite = true;
        const base = ry * imgWidth * 4;
        for (let x = 0; x < imgWidth; x += 4) {
          const i = base + x * 4;
          if (strip.data[i] < 245 || strip.data[i + 1] < 245 || strip.data[i + 2] < 245) { isWhite = false; break; }
        }
        if (isWhite) { breakY = scanTop + ry; break; }
      }
    }
    breaks.push(breakY);
    cursor = breakY;
  }
  const totalPages = breaks.length - 1;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const tickerStr = tickers.join(', ');

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    // Header
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85); // slate-700 — readable on the white page
    pdf.text(`AI Stock Assist — Analysis Report`, margin, margin + 4);
    pdf.text(`${tickerStr} · ${methodology} · ${dateStr}`, pageWidth - margin, margin + 4, { align: 'right' });
    pdf.setDrawColor(203, 213, 225); // light rule
    pdf.line(margin, margin + headerHeight - 2, pageWidth - margin, margin + headerHeight - 2);

    // Content slice — boundaries snapped to whitespace (see breaks[])
    const srcY = breaks[page];
    const srcH = breaks[page + 1] - srcY;
    const destH = srcH * (contentWidth / imgWidth);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidth;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, imgWidth, srcH);
      copyRegion(ctx, 0, srcY, srcH);
      const pageImg = pageCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
      pdf.addImage(pageImg, 'JPEG', margin, margin + headerHeight, contentWidth, destH);
    }

    // Footer
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Generated by aistockassist.com', margin, pageHeight - margin);
    pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
  }

  const filename = `Stock-Analysis-${tickers.join('-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}
