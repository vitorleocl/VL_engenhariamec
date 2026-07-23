import Logo from "../Logo";
import assinaturaVitor from "../../assets/images/assinatura_vitor_1784295142175.jpg";

interface ReportHeaderProps {
  title: string;
  subTitle?: string;
}

export function ReportHeader({ title, subTitle }: ReportHeaderProps) {
  return (
    <div className="flex justify-between items-center border-b pb-3 border-slate-200 mb-6 print-avoid-break">
      <div className="text-left font-mono text-[8px] text-slate-500 uppercase tracking-wider">
        {title} {subTitle && <span className="text-slate-400"> — {subTitle}</span>}
      </div>
      <Logo variant="print" className="h-6" />
    </div>
  );
}

interface ReportSignatureProps {
  isBlank?: boolean;
  engName?: string;
  engCrea?: string;
  artNumber?: string;
  additionalRole?: string;
}

export function ReportSignature({ 
  isBlank = false, 
  engName = "Vitor Leonardo Cordeiro Linhares", 
  engCrea = "CREA-PE: 1822299490", 
  artNumber, 
  additionalRole 
}: ReportSignatureProps) {
  return (
    <div className="py-6 text-center space-y-4 print-avoid-break flex flex-col items-center">
      <div className="h-20 flex flex-col items-center justify-center">
        {!isBlank ? (
          <img 
            src={assinaturaVitor} 
            alt="Assinatura Vitor Leonardo" 
            className="h-16 object-contain mix-blend-multiply" 
          />
        ) : (
          <div className="w-56 h-10 border-b border-dashed border-slate-400" />
        )}
      </div>
      <div className="space-y-1 text-center">
        <p className="font-bold text-slate-900 text-xs uppercase tracking-wide">{engName}</p>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          {additionalRole || "Engenheiro Mecânico Responsável"}
        </p>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{engCrea}</p>
        {artNumber && <p className="text-[8px] font-mono text-slate-400">ART VINCULADA: {artNumber}</p>}
      </div>
    </div>
  );
}
