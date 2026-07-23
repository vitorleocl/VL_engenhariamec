import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global monkey-patch for getComputedStyle to convert oklch and oklab colors to rgb
// This prevents html2canvas / html2pdf from crashing with: "Attempting to parse an unsupported color function 'oklch' or 'oklab'"
if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
  const originalGetComputedStyle = window.getComputedStyle;
  const oklchToRgb = (l: string, c: string, h: string, a: string = '1'): string => {
    let L_val = parseFloat(l);
    if (l.toString().includes('%')) L_val /= 100;
    
    let C_val = parseFloat(c);
    if (c.toString().includes('%')) C_val /= 100;
    
    let H_val = parseFloat(h);
    if (h.toString().includes('rad')) {
      H_val = parseFloat(h) * (180 / Math.PI);
    } else if (h.toString().includes('turn')) {
      H_val = parseFloat(h) * 360;
    }
    
    const h_rad = (H_val * Math.PI) / 180;
    
    const l_ok = L_val;
    const a_ok = C_val * Math.cos(h_rad);
    const b_ok = C_val * Math.sin(h_rad);
    
    const l_lms = l_ok + 0.3963377774 * a_ok + 0.2158037573 * b_ok;
    const m_lms = l_ok - 0.1055613458 * a_ok - 0.0638541728 * b_ok;
    const s_lms = l_ok - 0.0894841775 * a_ok - 1.2914855480 * b_ok;
    
    const l_cube = Math.pow(Math.max(0, l_lms), 3);
    const m_cube = Math.pow(Math.max(0, m_lms), 3);
    const s_cube = Math.pow(Math.max(0, s_lms), 3);
    
    let r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
    let g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
    let b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;
    
    const transfer = (x: number) => {
      return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };
    
    let r = Math.round(Math.max(0, Math.min(1, transfer(r_lin))) * 255);
    let g = Math.round(Math.max(0, Math.min(1, transfer(g_lin))) * 255);
    let b = Math.round(Math.max(0, Math.min(1, transfer(b_lin))) * 255);
    
    const alpha = parseFloat(a);
    if (!isNaN(alpha) && alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const oklabToRgb = (l: string, a_lab: string, b_lab: string, a: string = '1'): string => {
    let L_val = parseFloat(l);
    if (l.toString().includes('%')) L_val /= 100;
    
    let a_val = parseFloat(a_lab);
    if (a_lab.toString().includes('%')) a_val /= 100;
    
    let b_val = parseFloat(b_lab);
    if (b_lab.toString().includes('%')) b_val /= 100;
    
    const l_ok = L_val;
    const a_ok = a_val;
    const b_ok = b_val;
    
    const l_lms = l_ok + 0.3963377774 * a_ok + 0.2158037573 * b_ok;
    const m_lms = l_ok - 0.1055613458 * a_ok - 0.0638541728 * b_ok;
    const s_lms = l_ok - 0.0894841775 * a_ok - 1.2914855480 * b_ok;
    
    const l_cube = Math.pow(Math.max(0, l_lms), 3);
    const m_cube = Math.pow(Math.max(0, m_lms), 3);
    const s_cube = Math.pow(Math.max(0, s_lms), 3);
    
    let r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
    let g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
    let b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;
    
    const transfer = (x: number) => {
      return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };
    
    let r = Math.round(Math.max(0, Math.min(1, transfer(r_lin))) * 255);
    let g = Math.round(Math.max(0, Math.min(1, transfer(g_lin))) * 255);
    let b = Math.round(Math.max(0, Math.min(1, transfer(b_lin))) * 255);
    
    const alpha = parseFloat(a);
    if (!isNaN(alpha) && alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const convertOklToRgb = (val: string): string => {
    if (!val) return val;
    let res = val;
    if (res.includes('oklch')) {
      res = res.replace(/oklch\(([^)]+)\)/g, (match, contents) => {
        try {
          const parts = contents.split('/');
          const colorParts = parts[0].trim().split(/\s+/);
          if (colorParts.length >= 3) {
            const l = colorParts[0];
            const c = colorParts[1];
            const h = colorParts[2];
            let a = '1';
            if (parts[1]) {
              let alphaStr = parts[1].trim();
              if (alphaStr.endsWith('%')) {
                a = (parseFloat(alphaStr) / 100).toString();
              } else {
                a = alphaStr;
              }
            }
            return oklchToRgb(l, c, h, a);
          }
        } catch (e) {
          // ignore
        }
        return match;
      });
    }
    if (res.includes('oklab')) {
      res = res.replace(/oklab\(([^)]+)\)/g, (match, contents) => {
        try {
          const parts = contents.split('/');
          const colorParts = parts[0].trim().split(/\s+/);
          if (colorParts.length >= 3) {
            const l = colorParts[0];
            const a_val = colorParts[1];
            const b_val = colorParts[2];
            let a = '1';
            if (parts[1]) {
              let alphaStr = parts[1].trim();
              if (alphaStr.endsWith('%')) {
                a = (parseFloat(alphaStr) / 100).toString();
              } else {
                a = alphaStr;
              }
            }
            return oklabToRgb(l, a_val, b_val, a);
          }
        } catch (e) {
          // ignore
        }
        return match;
      });
    }
    return res;
  };

  window.getComputedStyle = function (el: Element, pseudoElt?: string | null): CSSStyleDeclaration {
    const style = originalGetComputedStyle(el, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return function(propertyName: string) {
            const val = target.getPropertyValue(propertyName);
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return convertOklToRgb(val);
            }
            return val;
          };
        }
        const val = (target as any)[prop];
        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
          return convertOklToRgb(val);
        }
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    }) as CSSStyleDeclaration;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

