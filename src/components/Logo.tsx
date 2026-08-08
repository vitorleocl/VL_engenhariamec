/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import logoImg from '../assets/images/logo.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer' | 'print';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img 
        src={logoImg} 
        alt="VL Engenharia Logo" 
        className="h-12 md:h-16 w-auto object-contain max-w-full"
        style={{ maxWidth: '280px', maxHeight: '70px', width: 'auto', height: 'auto', objectFit: 'contain' }}
        onError={(e) => {
          // Fallback to /logo.png if module import fails
          (e.target as HTMLImageElement).src = '/logo.png';
        }}
      />
    </div>
  );
}
