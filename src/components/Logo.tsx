/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer' | 'print';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  const isDarkBg = variant === 'footer';
  const isPrint = variant === 'print';
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    // Check if a custom logo image exists in public folder
    const checkLogo = async () => {
      const paths = ['/logo.png', '/logo.svg', '/logo.jpg'];
      for (const path of paths) {
        try {
          const res = await fetch(path, { method: 'HEAD' });
          if (res.ok) {
            setLogoSrc(path);
            break;
          }
        } catch (e) {
          // ignore error
        }
      }
    };
    checkLogo();
  }, []);

  if (logoSrc) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img 
          src={logoSrc} 
          alt="VL Engenharia Logo" 
          className="h-12 md:h-14 w-auto object-contain max-w-full"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }
  
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 540 160" 
        className="w-auto h-12 md:h-14 max-w-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Silver gradient for the mechanical logo details */}
          <linearGradient id="silver-metal-logo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8f9fa" />
            <stop offset="25%" stopColor="#ced4da" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#adb5bd" />
            <stop offset="100%" stopColor="#6c757d" />
          </linearGradient>
          
          {/* Gear teeth template centered at (0,0) */}
          <g id="gear-tooth-logo">
            <path d="M -6,-52 L -4,-64 L 4,-64 L 6,-52 Z" fill={isPrint ? "#6c757d" : "url(#silver-metal-logo)"} stroke="#495057" strokeWidth="0.5" />
          </g>
        </defs>

        {/* Monogram circle graphic centered at (85, 80) */}
        <g id="monogram-emblem">
          {/* Outer crescent element floating at top-left */}
          <path d="M 55,35 A 56,56 0 0,1 138,55" stroke={isPrint ? "#495057" : "url(#silver-metal-logo)"} strokeWidth="4" strokeLinecap="round" fill="none" />
          
          {/* Core circular rim */}
          <circle cx="85" cy="80" r="52" stroke={isPrint ? "#0f284e" : "url(#silver-metal-logo)"} strokeWidth="5.5" fill="none" />
          
          {/* Dark blue top-right accent arc, mirroring the original logo's top sweep */}
          <path 
            d="M 55,41 A 52,52 0 0,1 131,63" 
            stroke={isDarkBg ? "#3b82f6" : "#0f284e"} 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          
          {/* Metallic gear teeth rotated geometrically along the left side (from 110deg to 250deg) */}
          <g transform="translate(85, 80)">
            <g transform="rotate(110)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(130)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(150)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(170)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(190)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(210)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(230)"><use href="#gear-tooth-logo" /></g>
            <g transform="rotate(250)"><use href="#gear-tooth-logo" /></g>
          </g>

          {/* Dotted/Dashed inner circle accent */}
          <circle cx="85" cy="80" r="44" stroke={isPrint ? "#6c757d" : "url(#silver-metal-logo)"} strokeWidth="1.2" strokeDasharray="3 3" fill="none" />

          {/* Stylized monogram initials inside (85, 80) */}
          <g transform="translate(85, 80)">
            {/* Bold custom angled letter V, highly slanted and interlocking */}
            <path 
              d="M -40,-28 L -17,-28 L 0,20 L 17,-28 L 31,-28 L -2,34 L -10,34 Z" 
              className={isDarkBg ? "fill-white" : isPrint ? "fill-[#0f284e]" : "fill-[#0f284e] dark:fill-white"} 
            />
            {/* Bold custom letter L nesting on the right, perfectly parallel and matching slant */}
            <path 
              d="M 37,-28 L 50,-28 L 25,18 L 58,18 L 49,34 L 4,34 Z" 
              className={isDarkBg ? "fill-[#3b82f6]" : isPrint ? "fill-[#0066d4]" : "fill-[#0066d4] dark:fill-[#4895EF]"} 
            />
          </g>
        </g>

        {/* Divider vertical stroke */}
        <line 
          x1="165" 
          y1="30" 
          x2="165" 
          y2="130" 
          strokeWidth="1.5" 
          stroke={isPrint ? "#cbd5e1" : "currentColor"}
          className={isPrint ? "" : "stroke-slate-350 dark:stroke-slate-700"} 
        />

        {/* Brand typography block */}
        <g id="brand-text">
          {/* Initial block VL */}
          <text 
            x="180" 
            y="74" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="900" 
            fontSize="41" 
            className={isDarkBg ? "fill-white" : isPrint ? "fill-[#0B2545]" : "fill-[#0B2545] dark:fill-white"}
          >
            VL
          </text>
          
          {/* Main title ENGENHARIA */}
          <text 
            x="240" 
            y="74" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="800" 
            fontSize="41" 
            className={isDarkBg ? "fill-[#4895EF]" : isPrint ? "fill-[#105FD3]" : "fill-[#105FD3] dark:fill-[#4895EF]"}
          >
            ENGENHARIA
          </text>

          {/* Subtext underline split */}
          <line 
            x1="180" 
            y1="92" 
            x2="520" 
            y2="92" 
            strokeWidth="1.5" 
            stroke={isPrint ? "#cbd5e1" : "currentColor"}
            className={isPrint ? "" : "stroke-slate-300 dark:stroke-slate-700"} 
          />

          {/* Small interlocking technical gear centered on the divider line */}
          <g transform="translate(350, 92)" className={isPrint ? "stroke-slate-400" : "stroke-slate-400 dark:stroke-slate-500"} strokeWidth="1.5">
            <circle cx="0" cy="0" r="5" fill={isDarkBg ? "#05162E" : isPrint ? "#FFFFFF" : "#F4F7F6"} className={isPrint ? "" : "dark:fill-slate-950"} />
            <circle cx="0" cy="0" r="1.5" fill="none" />
            <line x1="0" y1="-7" x2="0" y2="7" />
            <line x1="-7" y1="0" x2="7" y2="0" />
            <line x1="-5" y1="-5" x2="5" y2="5" />
            <line x1="5" y1="-5" x2="-5" y2="5" />
          </g>

          {/* Slogan/Service descriptions */}
          <text 
            x="350" 
            y="118" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="800" 
            fontSize="10" 
            letterSpacing="1.8" 
            className={isDarkBg ? "fill-slate-400" : isPrint ? "fill-slate-500" : "fill-slate-500 dark:fill-slate-400"}
          >
            INSPEÇÕES  •  LAUDOS TÉCNICOS  •  ENGENHARIA MECÂNICA
          </text>
        </g>
      </svg>
    </div>
  );
}
