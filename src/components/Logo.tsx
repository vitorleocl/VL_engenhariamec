/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import logoImg from '../assets/images/logo.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer' | 'print';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(logoImg);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = () => {
    if (retryCount === 0) {
      setImgSrc('/logo.png');
      setRetryCount(1);
    } else if (retryCount === 1) {
      setImgSrc('/assets/images/logo.png');
      setRetryCount(2);
    } else if (retryCount === 2) {
      setImgSrc('/logo.jpg');
      setRetryCount(3);
    }
  };

  const isDarkContainer = variant === 'footer' || variant === 'dark';

  return (
    <div 
      className={`inline-flex items-center select-none transition-all ${
        isDarkContainer 
          ? 'bg-white/95 p-1.5 rounded-xl shadow-md border border-white/20' 
          : 'bg-white/90 dark:bg-white/95 p-1 rounded-xl shadow-sm border border-slate-200/60'
      } ${className}`}
    >
      <img 
        src={imgSrc} 
        alt="VL Engenharia - Inspeções e Laudos Técnicos" 
        className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[220px] sm:max-w-[260px] md:max-w-[280px]"
        onError={handleImageError}
      />
    </div>
  );
}
