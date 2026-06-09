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

/**
 * Captures a DOM element as a multi-page PDF using html2canvas + jspdf.
 * Elements with class `.no-print` are hidden during capture.
 * Capture uses a white, high-contrast print theme (see PDF_LIGHT_THEME_CSS).
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

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 1200,
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      clonedEl.classList.add('pdf-light-root');
      const style = clonedDoc.createElement('style');
      style.textContent = PDF_LIGHT_THEME_CSS;
      clonedDoc.head.appendChild(style);
    },
  });

  // Restore hidden elements
  noPrintEls.forEach((el) => (el.style.display = ''));

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

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
  // line of text is never sliced in half across a page boundary. Falls back to
  // fixed slicing if the canvas can't be read (e.g. tainted by cross-origin img).
  const fullCtx = canvas.getContext('2d');
  const breaks: number[] = [0];
  const scanWindow = Math.round(pageSrcHeight * 0.1);
  let cursor = 0;
  while (cursor < imgHeight) {
    const target = cursor + pageSrcHeight;
    if (target >= imgHeight) { breaks.push(imgHeight); break; }
    let breakY = Math.floor(target);
    try {
      if (fullCtx) {
        const scanTop = Math.max(cursor + 1, Math.floor(target) - scanWindow);
        const strip = fullCtx.getImageData(0, scanTop, imgWidth, Math.floor(target) - scanTop);
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
    } catch { /* tainted canvas — keep the fixed break */ }
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

    // Create a temporary canvas for this page's slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidth;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, srcY, imgWidth, srcH, 0, 0, imgWidth, srcH);
      const pageImg = pageCanvas.toDataURL('image/png');
      pdf.addImage(pageImg, 'PNG', margin, margin + headerHeight, contentWidth, destH);
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
