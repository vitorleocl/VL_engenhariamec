import Logo from "../Logo";

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
  engName = "Vitor Leonardo Cordeiro Linhares", 
  engCrea = "CREA-PE: 1822299490", 
  artNumber, 
  additionalRole 
}: ReportSignatureProps) {
  return (
    <div className="py-6 text-center space-y-3 print-avoid-break flex flex-col items-center">
      <div className="w-72 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50/50 p-2 my-1">
        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Assinatura Digital — Gov.br</span>
        <span className="text-[8px] font-mono text-slate-400">Espaço Reservado para Certificação ICP-Brasil</span>
      </div>
      <div className="space-y-0.5 text-center">
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

