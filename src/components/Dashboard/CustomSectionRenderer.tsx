import React from 'react';
import { CustomSection } from '../../lib/sectionManager';
import { ReportHeader } from './ReportBranding';

interface CustomSectionRendererProps {
  key?: React.Key;
  customSection: CustomSection;
  sectionNumber?: number | null;
  reportTitle?: string;
  subTitle?: string;
}

export default function CustomSectionRenderer({
  customSection,
  sectionNumber,
  reportTitle = "LAUDO TÉCNICO DE ENGENHARIA",
  subTitle = "VL ENGENHARIA"
}: CustomSectionRendererProps) {
  return (
    <div className="bg-white p-8 text-slate-900 font-sans print-page mb-6 shadow-sm rounded-lg border border-slate-200">
      <ReportHeader title={reportTitle} subTitle={subTitle} />

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 uppercase border-b-2 border-amber-500 pb-2 tracking-wide flex items-center gap-2">
          {sectionNumber !== undefined && sectionNumber !== null && (
            <span className="text-amber-600 font-mono">SEÇÃO {sectionNumber}:</span>
          )}
          <span>{customSection.title}</span>
        </h3>

        {customSection.content && (
          <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap text-justify border-l-2 border-slate-200 pl-3">
            {customSection.content}
          </div>
        )}

        {customSection.images && customSection.images.length > 0 && (
          <div className="pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
              REGISTROS FOTOGRÁFICOS / ANEXOS DA SEÇÃO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customSection.images.map((img, idx) => (
                <div key={idx} className="border border-slate-200 rounded p-2 bg-slate-50 flex flex-col items-center">
                  <img
                    src={img.data}
                    alt={img.caption || `Anexo ${idx + 1}`}
                    className="max-h-56 object-contain rounded border border-slate-300"
                  />
                  <p className="text-[10px] text-slate-600 font-mono mt-2 text-center">
                    <strong>Figura {idx + 1}:</strong> {img.caption || `Anexo fotográfico ${idx + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
