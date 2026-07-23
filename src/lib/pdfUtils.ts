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

// Simple mathematically correct Oklab to sRGB conversion
export function oklabToRgb(l: number, a_lab: number, b_lab: number, a: number = 1): string {
  const L = l;
  
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

function replaceCssColors(cssText: string, colorName: string, convertFn: (content: string) => string): string {
  let result = "";
  let i = 0;
  const target = colorName + "(";
  const targetLen = target.length;
  
  while (i < cssText.length) {
    const idx = cssText.indexOf(target, i);
    if (idx === -1) {
      result += cssText.substring(i);
      break;
    }
    
    result += cssText.substring(i, idx);
    
    let parenCount = 1;
    let j = idx + targetLen;
    while (j < cssText.length && parenCount > 0) {
      if (cssText[j] === '(') {
        parenCount++;
      } else if (cssText[j] === ')') {
        parenCount--;
      }
      j++;
    }
    
    if (parenCount === 0) {
      const content = cssText.substring(idx + targetLen, j - 1);
      const replacement = convertFn(content);
      result += replacement;
      i = j;
    } else {
      result += target;
      i = idx + targetLen;
    }
  }
  
  return result;
}

// Replaces any instances of oklch(...) and oklab(...) in CSS text with standard rgb/rgba fallbacks
export function replaceOklchInCss(cssText: string): string {
  if (!cssText) return "";
  
  // Replace standard oklch(L C H / A) or oklch(L C H)
  let result = replaceCssColors(cssText, "oklch", parseAndConvertOklch);
  
  // Replace color(oklch L C H / A) or color(oklch L C H)
  result = replaceCssColors(result, "color(oklch", parseAndConvertOklch);

  // Replace standard oklab(L A B / alpha) or oklab(L A B)
  result = replaceCssColors(result, "oklab", parseAndConvertOklab);
  
  // Replace color(oklab L A B / alpha) or color(oklab L A B)
  result = replaceCssColors(result, "color(oklab", parseAndConvertOklab);
  
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

function parseAndConvertOklab(content: string): string {
  try {
    const parts = content.trim().split(/\s+/);
    
    if (parts.includes('from')) {
      return 'rgb(100, 100, 100)';
    }
    
    const lVal = parseFloat(parts[0]);
    const aVal = parseFloat(parts[1]);
    const bVal = parseFloat(parts[2]);
    
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
    
    if (isNaN(lVal) || isNaN(aVal) || isNaN(bVal)) {
      return 'rgb(100, 100, 100)';
    }
    
    return oklabToRgb(lVal, aVal, bVal, isNaN(alpha) ? 1 : alpha);
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
 * Preprocess all style tags and stylesheets to eliminate oklch() and oklab() color functions
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
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                return replaceOklchInCss(val);
              }
              return val;
            };
          }
          const value = Reflect.get(target, prop);
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab') || value.includes('color('))) {
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
        if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('color('))) {
          el.setAttribute('style', replaceOklchInCss(styleAttr));
        }
      });
      const rootStyle = element.getAttribute('style');
      if (rootStyle && (rootStyle.includes('oklch') || rootStyle.includes('oklab') || rootStyle.includes('color('))) {
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

      if (cssText && (cssText.includes('oklch') || cssText.includes('oklab') || cssText.includes('color('))) {
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
      if (text && (text.includes('oklch') || text.includes('oklab') || text.includes('color(')) && !restoredStyles.some(r => r.ownerNode === styleEl)) {
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
/**
 * Clean clone helper that prepares the HTML element for external editor compatibility.
 * It traverses all elements, converting Tailwind CSS grid, flex, colors, borders, and spacings
 * into inline CSS styles and layout tables that Microsoft Word and Google Docs render flawlessly.
 */
function prepareHtmlClone(elementId: string): HTMLElement | null {
  const element = document.getElementById(elementId);
  if (!element) return null;

  // Helper to check if color is visible (not transparent)
  function isColorVisible(colorStr: string): boolean {
    if (!colorStr) return false;
    if (colorStr === 'transparent') return false;
    if (colorStr.includes('rgba') && colorStr.endsWith(', 0)')) return false;
    if (colorStr === 'rgba(0, 0, 0, 0)') return false;
    return true;
  }

  // Helper to check if element has class
  function hasClass(el: HTMLElement, cls: string): boolean {
    if (!el || !el.classList) return false;
    try {
      return el.classList.contains(cls);
    } catch (e) {
      return false;
    }
  }

  // Helper to check if element's className contains substring (handles SVGAnimatedString objects gracefully)
  function classNameIncludes(el: HTMLElement, sub: string): boolean {
    if (!el) return false;
    try {
      const className = el.className;
      if (typeof className === 'string') {
        return className.includes(sub);
      }
      if (className && typeof className === 'object' && 'baseVal' in className) {
        return ((className as any).baseVal || '').includes(sub);
      }
    } catch (e) {}
    return false;
  }

  // Helper to copy computed styles from source node to destination node
  function copyComputedStyles(src: HTMLElement, dest: HTMLElement) {
    try {
      const style = window.getComputedStyle(src);
      if (!style) return;

      // Font styles
      dest.style.fontFamily = style.fontFamily || "Arial, sans-serif";
      dest.style.fontSize = style.fontSize;
      dest.style.fontWeight = style.fontWeight;
      dest.style.fontStyle = style.fontStyle;
      dest.style.lineHeight = style.lineHeight;
      dest.style.textTransform = style.textTransform;
      dest.style.textDecoration = style.textDecoration;
      dest.style.textAlign = style.textAlign;

      // Colors & backgrounds (only copy if visible)
      dest.style.color = style.color;
      if (isColorVisible(style.backgroundColor)) {
        dest.style.backgroundColor = style.backgroundColor;
      }

      // Paddings & Margins
      dest.style.paddingTop = style.paddingTop;
      dest.style.paddingBottom = style.paddingBottom;
      dest.style.paddingLeft = style.paddingLeft;
      dest.style.paddingRight = style.paddingRight;

      dest.style.marginTop = style.marginTop;
      dest.style.marginBottom = style.marginBottom;
      dest.style.marginLeft = style.marginLeft;
      dest.style.marginRight = style.marginRight;

      // Borders (only copy if they actually exist)
      const borderTopWidth = parseFloat(style.borderTopWidth || '0');
      if (style.borderTopStyle !== 'none' && borderTopWidth > 0) {
        dest.style.borderTopWidth = style.borderTopWidth;
        dest.style.borderTopStyle = style.borderTopStyle;
        dest.style.borderTopColor = style.borderTopColor;
      }
      const borderBottomWidth = parseFloat(style.borderBottomWidth || '0');
      if (style.borderBottomStyle !== 'none' && borderBottomWidth > 0) {
        dest.style.borderBottomWidth = style.borderBottomWidth;
        dest.style.borderBottomStyle = style.borderBottomStyle;
        dest.style.borderBottomColor = style.borderBottomColor;
      }
      const borderLeftWidth = parseFloat(style.borderLeftWidth || '0');
      if (style.borderLeftStyle !== 'none' && borderLeftWidth > 0) {
        dest.style.borderLeftWidth = style.borderLeftWidth;
        dest.style.borderLeftStyle = style.borderLeftStyle;
        dest.style.borderLeftColor = style.borderLeftColor;
      }
      const borderRightWidth = parseFloat(style.borderRightWidth || '0');
      if (style.borderRightStyle !== 'none' && borderRightWidth > 0) {
        dest.style.borderRightWidth = style.borderRightWidth;
        dest.style.borderRightStyle = style.borderRightStyle;
        dest.style.borderRightColor = style.borderRightColor;
      }

      // Extra formatting parameters for table cells and blocks
      dest.style.boxSizing = 'border-box';
    } catch (err) {
      console.warn("Could not copy computed styles for element", src, err);
    }
  }

  // Recursive high-fidelity document builder
  function buildHighFidelityDoc(srcNode: Node): Node | null {
    try {
      // If it's a text node, clone it directly
      if (srcNode.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(srcNode.nodeValue || "");
      }

      // Only process elements
      if (srcNode.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const srcEl = srcNode as HTMLElement;
      const tagName = srcEl.tagName.toUpperCase();

      // 1. Filter out hidden or interactive elements
      if (
        tagName === 'BUTTON' ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        tagName === 'IFRAME' ||
        tagName === 'SCRIPT' ||
        tagName === 'STYLE' ||
        tagName === 'NOSCRIPT'
      ) {
        return null;
      }

      // Convert SVG vector elements to inline IMG tags with data URI for Word and Google Docs
      if (tagName === 'SVG') {
        try {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(srcEl);
          if (!svgString.includes('xmlns=')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          const rect = srcEl.getBoundingClientRect();
          const wAttr = srcEl.getAttribute('width');
          const hAttr = srcEl.getAttribute('height');
          const viewBox = srcEl.getAttribute('viewBox');
          
          let w = '180';
          let h = '50';
          
          if (wAttr && !wAttr.includes('%')) {
            w = wAttr;
          } else if (rect.width && rect.width > 0) {
            w = String(Math.round(rect.width));
          } else if (viewBox) {
            const vbParts = viewBox.split(/\s+|,/);
            if (vbParts.length === 4) w = vbParts[2];
          }

          if (hAttr && !hAttr.includes('%')) {
            h = hAttr;
          } else if (rect.height && rect.height > 0) {
            h = String(Math.round(rect.height));
          } else if (viewBox) {
            const vbParts = viewBox.split(/\s+|,/);
            if (vbParts.length === 4) h = vbParts[3];
          }

          const imgDest = document.createElement('img');
          imgDest.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
          imgDest.setAttribute('width', w);
          imgDest.setAttribute('height', h);
          imgDest.style.width = `${w}px`;
          imgDest.style.height = `${h}px`;
          imgDest.style.maxWidth = '100%';
          imgDest.style.display = 'inline-block';
          imgDest.style.verticalAlign = 'middle';
          return imgDest;
        } catch (e) {
          console.warn("SVG to IMG conversion failed:", e);
          return null;
        }
      }

      // Filter elements with print-hidden classes
      if (
        hasClass(srcEl, 'print:hidden') ||
        classNameIncludes(srcEl, 'print:hidden') ||
        srcEl.getAttribute('aria-hidden') === 'true'
      ) {
        return null;
      }

      // 2. Handle page break indicator cleanly (recognized by Word/Docs page setup)
      let isPageBreak = false;
      if (
        hasClass(srcEl, 'page-break-after-always') ||
        classNameIncludes(srcEl, 'page-break-after-always')
      ) {
        isPageBreak = true;
      }

      // 3. Determine if this element is a side-by-side container (flex row or grid)
      const srcChildren = Array.from(srcEl.children) as HTMLElement[];
      const visibleChildren = srcChildren.filter(child => {
        const tag = child.tagName.toUpperCase();
        if (tag === 'BUTTON' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'INPUT') return false;
        if (hasClass(child, 'print:hidden') || classNameIncludes(child, 'print:hidden')) return false;
        return true;
      });

      const style = window.getComputedStyle(srcEl);
      const isFlexRow = style && (
                        (style.display === 'flex' && style.flexDirection !== 'column') || 
                        hasClass(srcEl, 'flex-row') || 
                        (hasClass(srcEl, 'flex') && !hasClass(srcEl, 'flex-col'))
                      );
      const isGrid = style && (style.display === 'grid' || hasClass(srcEl, 'grid'));

      if ((isFlexRow || isGrid) && visibleChildren.length >= 2) {
        // Create HTML table to force side-by-side positioning
        const table = document.createElement('table');
        table.setAttribute('border', '0');
        table.setAttribute('cellspacing', '0');
        table.setAttribute('cellpadding', '0');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        if (style) {
          table.style.marginTop = style.marginTop !== '0px' ? style.marginTop : '12px';
          table.style.marginBottom = style.marginBottom !== '0px' ? style.marginBottom : '12px';

          if (isColorVisible(style.backgroundColor)) {
            table.style.backgroundColor = style.backgroundColor;
          }
          if (style.borderTopStyle !== 'none' && parseFloat(style.borderTopWidth || '0') > 0) {
            table.style.border = `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`;
          }
        }

        if (isGrid) {
          // Detect number of grid columns
          let cols = 2;
          const classStr = typeof srcEl.className === 'string' ? srcEl.className : '';
          const colsMatch = classStr.match(/grid-cols-(\d+)/);
          if (colsMatch) {
            cols = parseInt(colsMatch[1], 10);
          }

          for (let i = 0; i < visibleChildren.length; i += cols) {
            const rowChildren = visibleChildren.slice(i, i + cols);
            const tr = document.createElement('tr');
            table.appendChild(tr);

            rowChildren.forEach(child => {
              const td = document.createElement('td');
              td.style.width = `${100 / cols}%`;
              td.style.verticalAlign = 'top';
              td.style.padding = '8px';
              td.style.border = 'none';

              const childDoc = buildHighFidelityDoc(child);
              if (childDoc) {
                td.appendChild(childDoc);
              }
              tr.appendChild(td);
            });

            // Fill out remaining columns
            if (rowChildren.length < cols) {
              for (let j = 0; j < cols - rowChildren.length; j++) {
                const emptyTd = document.createElement('td');
                emptyTd.style.width = `${100 / cols}%`;
                emptyTd.style.border = 'none';
                tr.appendChild(emptyTd);
              }
            }
          }
        } else {
          // Flex Row
          const tr = document.createElement('tr');
          table.appendChild(tr);

          // Calculate proportional widths based on live viewport measurements
          const widths = visibleChildren.map(child => {
            try {
              return child.getBoundingClientRect().width || 100;
            } catch (e) {
              return 100;
            }
          });
          const totalWidth = widths.reduce((sum, w) => sum + w, 0);

          visibleChildren.forEach((child, idx) => {
            const td = document.createElement('td');
            const pct = totalWidth > 0 ? Math.round((widths[idx] / totalWidth) * 100) : Math.round(100 / visibleChildren.length);
            td.style.width = `${pct}%`;
            td.style.verticalAlign = 'top';
            td.style.padding = '6px';
            td.style.border = 'none';

            // Align text cell-level for justify-between layouts
            if (hasClass(srcEl, 'justify-between') || classNameIncludes(srcEl, 'justify-between')) {
              if (idx === 0) {
                td.style.textAlign = 'left';
              } else if (idx === visibleChildren.length - 1) {
                td.style.textAlign = 'right';
              } else {
                td.style.textAlign = 'center';
              }
            }

            const childDoc = buildHighFidelityDoc(child);
            if (childDoc) {
              td.appendChild(childDoc);
            }
            tr.appendChild(td);
          });
        }

        return table;
      }

      // 4. Create standard element and copy computed styles
      const destEl = document.createElement(tagName);

      if (tagName === 'TABLE') {
        destEl.setAttribute('border', '1');
        destEl.setAttribute('cellspacing', '0');
        destEl.setAttribute('cellpadding', '6');
        destEl.style.borderCollapse = 'collapse';
        destEl.style.width = '100%';
      } else if (tagName === 'TH' || tagName === 'TD') {
        destEl.setAttribute('valign', 'top');
      } else if (tagName === 'IMG') {
        const imgSrc = srcEl as HTMLImageElement;
        const imgDest = destEl as HTMLImageElement;
        imgDest.src = imgSrc.src;

        const isLogo = (imgSrc.src && (imgSrc.src.toLowerCase().includes('logo') || imgSrc.src.endsWith('.png'))) ||
                       (imgSrc.alt && imgSrc.alt.toLowerCase().includes('logo')) ||
                       hasClass(imgSrc, 'h-10') || hasClass(imgSrc, 'h-12') || hasClass(imgSrc, 'h-8') ||
                       classNameIncludes(imgSrc, 'h-10') || classNameIncludes(imgSrc, 'h-12') || classNameIncludes(imgSrc, 'h-8');

        if (isLogo) {
          imgDest.style.maxWidth = '180px';
          imgDest.style.maxHeight = '48px';
          imgDest.style.width = '180px';
          imgDest.style.height = 'auto';
          imgDest.style.display = 'inline-block';
          imgDest.style.verticalAlign = 'middle';
          imgDest.style.margin = '0px';
          imgDest.style.border = 'none';
          imgDest.setAttribute('width', '180');
          imgDest.setAttribute('height', '48');
        } else {
          imgDest.style.maxWidth = '100%';
          imgDest.style.maxHeight = '240px';
          imgDest.style.display = 'block';
          imgDest.style.margin = '10px auto';
          imgDest.style.borderRadius = '4px';
          imgDest.style.border = '1px solid #cbd5e1';
        }
      }

      // Copy computed styles (except layout-breaking widths on block elements)
      copyComputedStyles(srcEl, destEl);

      // Clear container-level padding and margin that break Word A4 layout
      if (srcEl.id === elementId || hasClass(srcEl, 'min-h-[297mm]') || classNameIncludes(srcEl, 'min-h-[297mm]')) {
        destEl.style.padding = '0px';
        destEl.style.margin = '0px';
        destEl.style.minHeight = '0px';
        destEl.style.width = '100%';
        destEl.style.maxWidth = '100%';
      }

      // Clear hard width constraints on block elements to let them expand inside A4 layout margins
      if (tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE') {
        const computedWidth = style ? parseFloat(style.width) : NaN;
        if (!isNaN(computedWidth) && computedWidth > 400 || hasClass(srcEl, 'w-full') || classNameIncludes(srcEl, 'min-h-')) {
          destEl.style.width = '100%';
          destEl.style.maxWidth = '100%';
        }
      }

      if (isPageBreak) {
        destEl.style.pageBreakAfter = 'always';
        destEl.style.breakAfter = 'page';
        destEl.style.paddingTop = '0px';
        destEl.style.marginTop = '0px';
        destEl.style.minHeight = '0px';
      }

      // Recursively append child nodes
      const srcChildNodes = Array.from(srcEl.childNodes);
      srcChildNodes.forEach(child => {
        const childDoc = buildHighFidelityDoc(child);
        if (childDoc) {
          destEl.appendChild(childDoc);
        }
      });

      return destEl;
    } catch (err) {
      console.error("Error building high-fidelity node:", err);
      try {
        return srcNode.cloneNode(true);
      } catch (e) {
        return null;
      }
    }
  }

  // Build the high-fidelity tree starting from the element root
  const rootClone = buildHighFidelityDoc(element) as HTMLElement;
  return rootClone;
}

/**
 * Helper to convert inline SVG elements into raster PNG images (data URIs)
 * so MS Word displays all vector logos and icons without blank boxes.
 */
async function convertSvgElementsToPngInContainer(container: HTMLElement): Promise<void> {
  const svgs = Array.from(container.querySelectorAll('svg'));

  await Promise.all(
    svgs.map((svg) => {
      return new Promise<void>((resolve) => {
        try {
          // Get SVG dimensions
          const bbox = svg.getBoundingClientRect();
          const viewBox = svg.getAttribute('viewBox');
          let width = parseFloat(svg.getAttribute('width') || '');
          let height = parseFloat(svg.getAttribute('height') || '');

          if ((!width || !height) && viewBox) {
            const vbParts = viewBox.split(/[\s,]+/).map(parseFloat);
            if (vbParts.length === 4) {
              width = width || vbParts[2];
              height = height || vbParts[3];
            }
          }

          width = Math.max(width || bbox.width || 240, 40);
          height = Math.max(height || bbox.height || 70, 20);

          const svgClone = svg.cloneNode(true) as SVGElement;
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svgClone.setAttribute('width', String(width));
          svgClone.setAttribute('height', String(height));

          const svgString = new XMLSerializer().serializeToString(svgClone);
          const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const scale = 2.5; // High clarity for Word
              canvas.width = Math.round(width * scale);
              canvas.height = Math.round(height * scale);

              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pngDataUrl = canvas.toDataURL('image/png');

                const newImg = document.createElement('img');
                newImg.src = pngDataUrl;
                newImg.alt = 'Logo / Vector';
                newImg.style.width = `${width}px`;
                newImg.style.height = `${height}px`;
                newImg.style.objectFit = 'contain';
                newImg.style.display = 'inline-block';

                if (svg.parentNode) {
                  svg.parentNode.replaceChild(newImg, svg);
                }
              }
            } catch (e) {
              console.warn("SVG canvas conversion skipped:", e);
            }
            resolve();
          };

          img.onerror = () => resolve();
          img.src = svgDataUrl;
        } catch (err) {
          console.warn("SVG element processing skipped:", err);
          resolve();
        }
      });
    })
  );
}

/**
 * Helper to convert all images (including SVG data URIs, relative URLs like /logo.png, and external HTTP URLs)
 * in a cloned DOM element into base64 PNG data URLs to ensure Microsoft Word and Google Docs display all logos,
 * signatures, and photos without missing image boxes or CORS issues.
 */
async function convertAllImagesToBase64InContainer(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));

  await Promise.all(
    images.map((img) => {
      return new Promise<void>((resolve) => {
        const src = img.getAttribute('src') || img.src || '';
        if (!src) {
          resolve();
          return;
        }

        const isLogo = src.toLowerCase().includes('logo') ||
                       (img.alt && img.alt.toLowerCase().includes('logo')) ||
                       (img.className && (img.className.includes('h-10') || img.className.includes('h-12') || img.className.includes('w-8') || img.className.includes('w-12')));

        // If it's already a base64 raster image (PNG / JPEG), set size constraints and resolve
        if (src.startsWith('data:image/png;base64') || src.startsWith('data:image/jpeg;base64') || src.startsWith('data:image/jpg;base64')) {
          if (isLogo) {
            img.setAttribute('width', '180');
            img.setAttribute('height', '48');
            img.style.width = '180px';
            img.style.height = 'auto';
            img.style.maxWidth = '180px';
            img.style.maxHeight = '48px';
            img.style.display = 'inline-block';
            img.style.margin = '0px';
            img.style.border = 'none';
          }
          resolve();
          return;
        }

        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';

        tempImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = 180;
            let h = 48;

            if (isLogo) {
              w = 180;
              if (tempImg.naturalWidth > 0 && tempImg.naturalHeight > 0) {
                h = Math.round((tempImg.naturalHeight / tempImg.naturalWidth) * w);
              } else {
                h = 48;
              }
            } else {
              const wAttr = img.getAttribute('width');
              const hAttr = img.getAttribute('height');
              const renderedW = img.clientWidth || img.getBoundingClientRect().width;
              const renderedH = img.clientHeight || img.getBoundingClientRect().height;

              w = Math.max(parseFloat(wAttr || String(renderedW || tempImg.naturalWidth || 280)), 20);
              h = Math.max(parseFloat(hAttr || String(renderedH || tempImg.naturalHeight || 180)), 20);

              if (w > 500) {
                h = Math.round((h / w) * 500);
                w = 500;
              }
            }

            const scale = 2.0; // High clarity for Word document images
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
              const pngUrl = canvas.toDataURL('image/png');
              img.src = pngUrl;
            }

            img.setAttribute('width', String(Math.round(w)));
            img.setAttribute('height', String(Math.round(h)));
            img.style.width = `${Math.round(w)}px`;
            img.style.height = isLogo ? 'auto' : `${Math.round(h)}px`;
            img.style.maxWidth = isLogo ? '180px' : '100%';
            img.style.maxHeight = isLogo ? '48px' : '280px';
            img.style.objectFit = 'contain';

            if (isLogo) {
              img.style.display = 'inline-block';
              img.style.verticalAlign = 'middle';
              img.style.margin = '0px';
              img.style.border = 'none';
            }
          } catch (err) {
            console.warn("Canvas rasterization skipped:", err);
          }
          resolve();
        };

        tempImg.onerror = () => {
          resolve();
        };

        // Handle relative URLs (e.g. /logo.png)
        if (src.startsWith('/')) {
          tempImg.src = window.location.origin + src;
        } else {
          tempImg.src = src;
        }
      });
    })
  );
}

/**
 * Exports an HTML container to a .doc format file compatible with Microsoft Word & Google Docs.
 */
export async function exportToWord(elementId: string, filename: string): Promise<void> {
  const clone = prepareHtmlClone(elementId);
  if (!clone) {
    alert("Erro ao exportar: Elemento do laudo não encontrado.");
    return;
  }

  // First convert all SVG vector elements into raster PNG images
  await convertSvgElementsToPngInContainer(clone);

  // Then convert all img tags (including /logo.png) to base64 PNG data URIs so MS Word displays logos & photos
  await convertAllImagesToBase64InContainer(clone);

  const styles = `
    <style>
      @page Section1 {
        size: 595.3pt 841.9pt; /* Perfect A4 dimensions in pt: 21.0cm x 29.7cm */
        margin: 1.5cm 1.5cm 1.5cm 1.5cm; /* Clean 15mm outer margins */
        mso-page-orientation: portrait;
        mso-header-margin: 36pt;
        mso-footer-margin: 36pt;
        mso-paper-source: 0;
      }
      div.Section1 {
        page: Section1;
        margin: 0px !important;
        padding: 0px !important;
      }
      body {
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        line-height: 1.4;
        color: #1e293b;
        margin: 0px !important;
        padding: 0px !important;
      }
      /* Remove rigid screen height constraints and padding that push content onto extra pages */
      #pmoc-report-container {
        padding: 0px !important;
        margin: 0px !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      [class*="min-h-"], .min-h-\\[255mm\\], .min-h-\\[297mm\\], .min-h-screen {
        min-height: 0 !important;
        height: auto !important;
        padding-top: 0px !important;
      }
      p { margin-bottom: 6px; margin-top: 0px; mso-pagination: widow-orphan; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; page-break-inside: avoid; break-inside: avoid; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      th, td { border: 1px solid #cbd5e1; padding: 5px 6px; font-size: 9.5pt; vertical-align: top; }
      th { background-color: #134074; font-weight: bold; text-align: left; color: #ffffff; }
      h1, h2, h3, h4 { font-family: 'Arial', sans-serif; color: #134074; margin-top: 12px; margin-bottom: 6px; page-break-after: avoid; break-after: avoid; mso-pagination: lines-together; }
      h1 { font-size: 17pt; border-bottom: 2px solid #134074; padding-bottom: 3px; }
      h2 { font-size: 12.5pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
      h3 { font-size: 10.5pt; font-weight: bold; color: #1e293b; }
      .page-break-after-always, .break-after-page { page-break-after: always !important; break-after: page !important; mso-break-type: page-break; margin-bottom: 0px !important; padding-bottom: 0px !important; }
      .page-break-before-always, .break-before-page { page-break-before: always !important; break-before: page !important; mso-break-type: page-break; }
      .page-break-inside-avoid, .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-mono { font-family: 'Courier New', monospace; }
      .font-bold { font-weight: bold; }
      img { max-width: 100%; height: auto; }
      img[src*="logo"], img[alt*="logo"], img[alt*="Logo"] {
        width: 180px !important;
        max-width: 180px !important;
        height: auto !important;
        max-height: 48px !important;
        display: inline-block !important;
        border: none !important;
        margin: 0px !important;
        padding: 0px !important;
      }
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
        <div class="Section1">
          ${clone.innerHTML}
        </div>
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

  // Convert all images to base64 PNG data URIs
  await convertAllImagesToBase64InContainer(clone);

  const styles = `
    <style>
      @page Section1 {
        size: 21.0cm 29.7cm;
        margin: 2.0cm 2.0cm 2.0cm 2.0cm;
        mso-page-orientation: portrait;
      }
      div.Section1 {
        page: Section1;
      }
      body {
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        line-height: 1.4;
        color: #1e293b;
      }
      p { margin-bottom: 6px; margin-top: 0px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1; }
      th, td { border: 1px solid #cbd5e1; padding: 6px; font-size: 9.5pt; vertical-align: top; }
      th { background-color: #134074; font-weight: bold; text-align: left; color: #ffffff; }
      h1 { font-size: 18pt; color: #134074; border-bottom: 2px solid #134074; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px; }
      h2 { font-size: 13pt; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-top: 15px; margin-bottom: 8px; }
      h3 { font-size: 11pt; color: #1e293b; font-weight: bold; }
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
        <div class="Section1">
          ${clone.innerHTML}
        </div>
      </body>
    </html>
  `;

  const originalElement = document.getElementById(elementId);
  const plainText = originalElement ? originalElement.innerText : "";

  // Strategy 1: Try navigator.clipboard.write with ClipboardItem
  if (navigator.clipboard && window.ClipboardItem) {
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
      console.warn("ClipboardItem API write failed, trying execCommand fallback...", err);
    }
  }

  // Strategy 2: Fallback to document.execCommand('copy') with temporary contenteditable element
  try {
    const tempDiv = document.createElement('div');
    tempDiv.contentEditable = 'true';
    tempDiv.innerHTML = clone.innerHTML;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.opacity = '0';
    document.body.appendChild(tempDiv);

    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const successful = document.execCommand('copy');
    if (selection) {
      selection.removeAllRanges();
    }
    document.body.removeChild(tempDiv);

    if (successful) {
      return true;
    }
  } catch (err) {
    console.warn("execCommand copy failed:", err);
  }

  // Strategy 3: Final fallback to navigator.clipboard.writeText
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch (e) {
      console.error("All copy strategies failed:", e);
    }
  }

  return false;
}

/**
 * Formats the document as high-fidelity rich text, copies it to the clipboard,
 * and opens Google Docs (docs.new) in a new tab so the user can paste it.
 */
export async function exportToGoogleDocs(elementId: string): Promise<boolean> {
  const success = await copyRichText(elementId);
  if (success) {
    window.open("https://docs.new", "_blank");
    return true;
  }
  return false;
}

