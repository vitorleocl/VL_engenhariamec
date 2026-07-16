/**
 * Utility functions for clean PDF generation using html2pdf.js
 * and bypassing the oklch parser crash in html2canvas.
 */

// Simple mathematically correct OKLCH to sRGB conversion
export function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  // Convert h from degrees to radians
  const hRad = (h * Math.PI) / 180;
  
  // Oklch to Oklab
  const L = l;
  const a_lab = c * Math.cos(hRad);
  const b_lab = c * Math.sin(hRad);
  
  // Oklab to LMS
  const l_lms = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_lms = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_lms = L - 0.0894841775 * a_lab - 1.291485548 * b_lab;
  
  // LMS to linear sRGB
  const l_cube = Math.pow(Math.max(0, l_lms), 3);
  const m_cube = Math.pow(Math.max(0, m_lms), 3);
  const s_cube = Math.pow(Math.max(0, s_lms), 3);
  
  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.707614701 * s_cube;
  
  // linear sRGB to sRGB (gamma correction)
  const toSRGB = (x: number) => {
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  
  const r = Math.min(255, Math.max(0, Math.round(toSRGB(r_lin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(toSRGB(g_lin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(toSRGB(b_lin) * 255)));
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Replaces any instances of oklch(...) in CSS text with standard rgb/rgba fallbacks
export function replaceOklchInCss(cssText: string): string {
  if (!cssText) return "";
  
  // Replace standard oklch(L C H / A) or oklch(L C H)
  let result = cssText.replace(/oklch\(([^)]+)\)/g, (match, content) => {
    return parseAndConvertOklch(content);
  });
  
  // Replace color(oklch L C H / A) or color(oklch L C H)
  result = result.replace(/color\(\s*oklch\s+([^)]+)\)/g, (match, content) => {
    return parseAndConvertOklch(content);
  });
  
  return result;
}

function parseAndConvertOklch(content: string): string {
  try {
    const parts = content.trim().split(/\s+/);
    
    if (parts.includes('from')) {
      return 'rgb(100, 100, 100)';
    }
    
    const lVal = parseFloat(parts[0]);
    const cVal = parseFloat(parts[1]);
    const hVal = parseFloat(parts[2]);
    
    let alpha = 1;
    const slashIndex = parts.indexOf('/');
    if (slashIndex !== -1 && parts[slashIndex + 1]) {
      const aPart = parts[slashIndex + 1];
      if (aPart.endsWith('%')) {
        alpha = parseFloat(aPart) / 100;
      } else {
        alpha = parseFloat(aPart);
      }
    } else if (parts[3] === '/' && parts[4]) {
      const aPart = parts[4];
      if (aPart.endsWith('%')) {
        alpha = parseFloat(aPart) / 100;
      } else {
        alpha = parseFloat(aPart);
      }
    } else if (parts[3] && parts[3].startsWith('/')) {
      const aPart = parts[3].substring(1);
      if (aPart.endsWith('%')) {
        alpha = parseFloat(aPart) / 100;
      } else {
        alpha = parseFloat(aPart);
      }
    }
    
    if (isNaN(lVal) || isNaN(cVal) || isNaN(hVal)) {
      return 'rgb(100, 100, 100)';
    }
    
    return oklchToRgb(lVal, cVal, hVal, isNaN(alpha) ? 1 : alpha);
  } catch (e) {
    return 'rgb(100, 100, 100)';
  }
}

interface RestoredStyle {
  ownerNode: any;
  tempStyleEl?: HTMLStyleElement;
  originalText?: string;
}

let restoredStyles: RestoredStyle[] = [];
let originalGetComputedStyle: typeof window.getComputedStyle | null = null;

/**
 * Preprocess all style tags and stylesheets to eliminate oklch() color functions
 * before generating a canvas/PDF. Fully compatible with CSSOM programmatically
 * inserted styles (Vite dev server) and link elements.
 */
export async function preprocessStylesheets(element?: HTMLElement | null): Promise<void> {
  restoredStyles = [];
  
  // 1. Intercept getComputedStyle dynamically. This is critical because modern browsers 
  // resolve Tailwind v4 CSS variable colors to active "oklch" or "color(oklch)" strings,
  // which html2canvas reads and crashes on when retrieving computed styles!
  if (!originalGetComputedStyle) {
    originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (el, pseudo) {
      const style = originalGetComputedStyle!(el, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return (name: string) => {
              const val = target.getPropertyValue(name);
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('color('))) {
                return replaceOklchInCss(val);
              }
              return val;
            };
          }
          const value = Reflect.get(target, prop);
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('color('))) {
            return replaceOklchInCss(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };
  }

  // 2. Scan and sanitize any inline style attributes inside the printed element
  if (element) {
    try {
      const styledElements = element.querySelectorAll('[style]');
      styledElements.forEach(el => {
        const styleAttr = el.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('color('))) {
          el.setAttribute('style', replaceOklchInCss(styleAttr));
        }
      });
      const rootStyle = element.getAttribute('style');
      if (rootStyle && (rootStyle.includes('oklch') || rootStyle.includes('color('))) {
        element.setAttribute('style', replaceOklchInCss(rootStyle));
      }
    } catch (err) {
      console.warn("Could not preprocess inline styles:", err);
    }
  }

  // 3. Process all active stylesheets
  const sheets = Array.from(document.styleSheets);
  for (const sheet of sheets) {
    try {
      const ownerNode = sheet.ownerNode;
      if (!ownerNode) continue;

      if ((ownerNode as any).dataset?.tempPdfStyle === "true") continue;

      let cssText = "";
      try {
        cssText = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch (e) {
        if (ownerNode.nodeName === "STYLE") {
          cssText = (ownerNode as HTMLStyleElement).innerHTML;
        } else if (ownerNode.nodeName === "LINK") {
          const href = (ownerNode as HTMLLinkElement).href;
          if (href) {
            const url = new URL(href, window.location.origin);
            if (url.origin === window.location.origin) {
              const res = await fetch(href);
              if (res.ok) {
                cssText = await res.text();
              }
            }
          }
        }
      }

      if (cssText && (cssText.includes('oklch') || cssText.includes('color('))) {
        const cleanText = replaceOklchInCss(cssText);
        
        const tempStyle = document.createElement('style');
        tempStyle.innerHTML = cleanText;
        tempStyle.dataset.tempPdfStyle = "true";
        document.head.appendChild(tempStyle);

        (ownerNode as any).disabled = true;

        restoredStyles.push({
          ownerNode,
          tempStyleEl: tempStyle
        });
      }
    } catch (err) {
      console.warn("Could not preprocess style sheet:", err);
    }
  }

  // 4. Catch any raw style tags by text content
  const styleElements = Array.from(document.querySelectorAll('style:not([data-temp-pdf-style])'));
  for (const styleEl of styleElements) {
    try {
      const text = styleEl.innerHTML;
      if (text && (text.includes('oklch') || text.includes('color(')) && !restoredStyles.some(r => r.ownerNode === styleEl)) {
        restoredStyles.push({ ownerNode: styleEl, originalText: text });
        const cleanText = replaceOklchInCss(text);
        styleEl.innerHTML = cleanText;
      }
    } catch (e) {
      // Safely ignore
    }
  }
}

/**
 * Restore all style tags and stylesheets to their original state after PDF generation.
 */
export function restoreStylesheets(): void {
  // Restore window.getComputedStyle
  if (originalGetComputedStyle) {
    window.getComputedStyle = originalGetComputedStyle;
    originalGetComputedStyle = null;
  }

  for (const item of restoredStyles) {
    try {
      if (item.tempStyleEl) {
        item.tempStyleEl.remove();
      }
      if (item.ownerNode) {
        item.ownerNode.disabled = false;
        if (item.originalText !== undefined) {
          item.ownerNode.innerHTML = item.originalText;
        }
      }
    } catch (e) {
      console.warn("Could not restore stylesheet:", e);
    }
  }
  restoredStyles = [];
}

/**
 * Clean clone helper that prepares the HTML element for external editor compatibility
 */
function prepareHtmlClone(elementId: string): HTMLElement | null {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const clone = element.cloneNode(true) as HTMLElement;

  // Strip elements designed to be hidden when printing or in export
  const hiddenElements = clone.querySelectorAll('button, input, textarea, select, .print\\:hidden, [class*="print:hidden"]');
  hiddenElements.forEach(el => el.remove());

  // Convert modern visual classes like grid / flex to basic table / block styles for Word/Docs compatibility
  clone.querySelectorAll('.flex').forEach(flexEl => {
    (flexEl as HTMLElement).style.display = 'block';
  });

  return clone;
}

/**
 * Exports an HTML container to a .doc format file compatible with Microsoft Word & Google Docs.
 */
export function exportToWord(elementId: string, filename: string): void {
  const clone = prepareHtmlClone(elementId);
  if (!clone) {
    alert("Erro ao exportar: Elemento do laudo não encontrado.");
    return;
  }

  // Format all tables specifically for Word / Google Docs editor support
  const tables = clone.querySelectorAll('table');
  tables.forEach(table => {
    table.setAttribute('border', '1');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '6');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '15px';
    table.style.marginBottom = '15px';
    table.style.borderColor = '#cccccc';
    
    table.querySelectorAll('th').forEach(th => {
      th.style.backgroundColor = '#f1f5f9';
      th.style.border = '1px solid #cccccc';
      th.style.fontWeight = 'bold';
      th.style.color = '#1e293b';
      th.style.padding = '8px';
      th.style.fontSize = '10pt';
    });

    table.querySelectorAll('td').forEach(td => {
      td.style.border = '1px solid #cccccc';
      td.style.padding = '8px';
      td.style.fontSize = '10pt';
    });
  });

  // Highlight headings in Word / Google Docs
  clone.querySelectorAll('h1').forEach(h1 => {
    h1.style.fontSize = '22pt';
    h1.style.color = '#1e3a8a';
    h1.style.fontWeight = 'bold';
    h1.style.borderBottom = '2px solid #1e3a8a';
    h1.style.paddingBottom = '6px';
    h1.style.marginBottom = '15px';
    h1.style.fontFamily = 'Arial, sans-serif';
  });

  clone.querySelectorAll('h2').forEach(h2 => {
    h2.style.fontSize = '15pt';
    h2.style.color = '#0f172a';
    h2.style.fontWeight = 'bold';
    h2.style.borderBottom = '1px solid #cbd5e1';
    h2.style.paddingBottom = '4px';
    h2.style.marginTop = '20px';
    h2.style.marginBottom = '10px';
    h2.style.fontFamily = 'Arial, sans-serif';
  });

  const styles = `
    <style>
      body {
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        line-height: 1.5;
        color: #333333;
        margin: 20px;
      }
      p { margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #cbd5e1; padding: 6px; font-size: 10pt; }
      th { background-color: #f8fafc; font-weight: bold; text-align: left; }
      h1, h2, h3 { font-family: 'Arial', sans-serif; color: #1e293b; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-mono { font-family: 'Courier New', monospace; }
      .font-bold { font-weight: bold; }
      .bg-slate-50 { background-color: #f8fafc; }
      .bg-slate-100 { background-color: #f1f5f9; }
      .text-slate-500 { color: #64748b; }
      .text-slate-600 { color: #475569; }
      .text-slate-800 { color: #1e293b; }
      .border-b { border-bottom: 1px solid #cbd5e1; }
      .pb-1.5 { padding-bottom: 6px; }
      .py-12 { padding-top: 24px; padding-bottom: 24px; }
    </style>
  `;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        ${styles}
      </head>
      <body>
        ${clone.innerHTML}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies the formatted document to the user's clipboard as Rich Text (HTML)
 * allowing direct, flawless Ctrl+V pasting into Google Docs, Word or email.
 */
export async function copyRichText(elementId: string): Promise<boolean> {
  const clone = prepareHtmlClone(elementId);
  if (!clone) {
    alert("Erro ao copiar: Elemento do laudo não encontrado.");
    return false;
  }

  // Format tables
  const tables = clone.querySelectorAll('table');
  tables.forEach(table => {
    table.setAttribute('border', '1');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '6');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '15px 0';
    table.style.borderColor = '#cbd5e1';

    table.querySelectorAll('th').forEach(th => {
      th.style.backgroundColor = '#f8fafc';
      th.style.border = '1px solid #cbd5e1';
      th.style.fontWeight = 'bold';
      th.style.color = '#1e293b';
      th.style.padding = '8px';
      th.style.fontSize = '10pt';
    });

    table.querySelectorAll('td').forEach(td => {
      td.style.border = '1px solid #cbd5e1';
      td.style.padding = '8px';
      td.style.fontSize = '10pt';
    });
  });

  const styles = `
    <style>
      body {
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        line-height: 1.5;
        color: #333333;
      }
      p { margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #cbd5e1; }
      th, td { border: 1px solid #cbd5e1; padding: 6px; font-size: 10pt; }
      th { background-color: #f8fafc; font-weight: bold; text-align: left; }
      h1 { font-size: 22pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 15px; }
      h2 { font-size: 15pt; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; }
      h3 { font-size: 11pt; color: #333333; font-weight: bold; }
      .text-center { text-align: center; }
      .font-mono { font-family: 'Courier New', monospace; }
      .font-bold { font-weight: bold; }
    </style>
  `;

  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        ${styles}
      </head>
      <body>
        ${clone.innerHTML}
      </body>
    </html>
  `;

  const plainText = (document.getElementById(elementId) as HTMLElement).innerText;

  try {
    const blobHtml = new Blob([htmlContent], { type: "text/html" });
    const blobText = new Blob([plainText], { type: "text/plain" });
    
    const clipboardItem = new ClipboardItem({
      "text/html": blobHtml,
      "text/plain": blobText
    });
    
    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (err) {
    console.error("Erro ao copiar como Rich Text:", err);
    try {
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch (e) {
      console.error("Clipboard API failed completely", e);
      return false;
    }
  }
}

