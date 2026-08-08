import React from 'react';
import logoImg from '../../assets/images/logo.png';

export interface HeaderMasterConfig {
  logoUrl?: string;
  logoHeight?: number; // in px (e.g., 25 to 80, default 55)
  logoPosition?: 'left' | 'center' | 'right';
  showSlogan?: boolean;
  headerTitle?: string;
  engineerName?: string;
  creaDetails?: string;
  reportNumber?: string;
  artNumber?: string;
  issueDate?: string;
  borderColor?: string;
}

interface HeaderMasterProps {
  config?: HeaderMasterConfig;
  variables?: Record<string, string>;
  className?: string;
}

export default function HeaderMaster({ config = {}, variables = {}, className = '' }: HeaderMasterProps) {
  const isCustomUpload = config.logoUrl && (config.logoUrl.startsWith('data:') || config.logoUrl.startsWith('http://') || config.logoUrl.startsWith('https://'));
  const logoUrl = isCustomUpload ? config.logoUrl : logoImg;
  const logoHeight = config.logoHeight || 72;
  const logoPosition = config.logoPosition || 'left';
  
  const engineerName = variables.nome_engenheiro || variables.engenheiro_responsavel || config.engineerName || 'Vitor Leonardo Cordeiro Linhares';
  const formacao = variables.formacao_titulo || 'Engenheiro Mecânico';
  const uf = variables.uf || 'PE';
  const registro = variables.numero_registro || variables.crea_engenheiro || '1822299490';
  const creaFormatted = `ENG. ${engineerName.toUpperCase()} — ${formacao} CREA-${uf}: ${registro}`;
  
  const reportNumber = variables.numero_laudo || config.reportNumber || 'LAU-2026/001';
  const artNumber = variables.numero_art || variables.art_rrt || config.artNumber || 'PE202609161747';
  const issueDate = variables.data_emissao || config.issueDate || new Date().toLocaleDateString('pt-BR');

  return (
    <div className={`header-master-container border-b-2 border-slate-900 pb-2 mb-4 font-sans ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* HEADER IMAGE BANNER */}
        <div className="flex items-center gap-3 min-w-0">
          <img 
            src={logoUrl} 
            alt="VL Engenharia - Inspeções, Laudos Técnicos e Engenharia Mecânica" 
            style={{ 
              height: `${logoHeight}px`, 
              width: 'auto', 
              maxHeight: '110px', 
              objectFit: 'contain' 
            }}
            className="header-master-logo transition-all block max-w-full"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== logoImg) {
                target.src = logoImg;
              }
            }}
          />
        </div>

        {/* TECHNICAL DETAILS BADGE */}
        <div className="text-right font-mono text-[8.5px] text-slate-700 space-y-0.5 shrink-0 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
          <p className="font-bold text-slate-900 text-[10.5px] border-b border-slate-200 pb-0.5 mb-0.5">{reportNumber}</p>
          <p><span className="text-slate-500 font-normal">ART:</span> <strong className="text-slate-900">{artNumber}</strong></p>
          <p><span className="text-slate-500 font-normal">DATA:</span> <strong className="text-slate-900">{issueDate}</strong></p>
          <p className="text-[7.5px] text-slate-500 pt-0.5 border-t border-slate-200 font-sans truncate max-w-[200px]" title={creaFormatted}>
            {creaFormatted}
          </p>
        </div>
      </div>
    </div>
  );
}
