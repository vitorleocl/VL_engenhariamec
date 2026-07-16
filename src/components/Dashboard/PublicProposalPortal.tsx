import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, 
  Printer, 
  FileDown, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Info,
  Shield, 
  FileText,
  AlertTriangle,
  ArrowLeft,
  Share2
} from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import { isRealFirebase, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";

interface Proposal {
  id: string;
  clientCompany: string;
  clientName: string;
  clientCnpj: string;
  clientCity: string;
  clientState: string;
  clientContact: string;
  clientEmail: string;
  clientRole?: string;
  clientAddress?: string;
  services: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    norms: string[];
    scope: string[];
    durationDays?: number;
  }[];
  pricingInfo: {
    subtotal: number;
    descontos: number;
    impostos: number;
    totalGeral: number;
    estimatedHours: number;
    estimatedTeamSize: number;
    paymentTerms: string;
    validityDays: number;
    executionWeeks: number;
    multiplierQty?: number;
    technicalHours?: number;
    travelKm?: number;
    lodgingDays?: number;
    artCost?: number;
    extraExpenses?: number;
    discountPercent?: number;
    taxPercent?: number;
    profitMargin?: number;
    minPrice?: number;
  };
  aiObjective?: string;
  aiScope?: string[];
  aiNorms?: string[];
  aiObservations?: string[];
  aiExclusions?: string[];
  aiComplementary?: string[];
  status: "rascunho" | "enviado" | "aprovado";
  signature?: string;
  signedAt?: string;
  signedByName?: string;
  signedByRole?: string;
  images?: string[];
  demandDescription?: string;
  deliveryDays?: number;
  visibleSections?: {
    capa: boolean;
    contracapa: boolean;
    principios: boolean;
    entregamos: boolean;
    problemas: boolean;
    clientes: boolean;
    resumoServicos: boolean;
    identificacao: boolean;
    equipe: boolean;
    atividades: boolean;
    investimento: boolean;
    condicoes: boolean;
    prazos: boolean;
    assinatura: boolean;
  };
}

export default function PublicProposalPortal({ proposalId }: { proposalId: string }) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Signature Form States
  const [clientSignName, setClientSignName] = useState("");
  const [clientSignRole, setClientSignRole] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadProposal = async () => {
      // 1. Try Firestore first
      if (isRealFirebase) {
        try {
          const docRef = doc(db, "proposals", proposalId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Proposal;
            setProposal(data);
            if (data.signedByName) setClientSignName(data.signedByName);
            if (data.signedByRole) setClientSignRole(data.signedByRole || "");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error fetching proposal from Firestore", err);
        }
      }

      // 2. Fallback to localStorage
      const saved = localStorage.getItem("vitor_engmec_pricing_proposals");
      if (saved) {
        try {
          const proposals: Proposal[] = JSON.parse(saved);
          const found = proposals.find(p => p.id === proposalId);
          if (found) {
            setProposal(found);
            if (found.signedByName) setClientSignName(found.signedByName);
            if (found.signedByRole) setClientSignRole(found.signedByRole || "");
          }
        } catch (err) {
          console.error("Error reading proposals", err);
        }
      }
      setLoading(false);
    };
    loadProposal();
  }, [proposalId]);

  // Drawing signature pad handlers
  useEffect(() => {
    if (canvasRef.current && !proposal?.signature) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#05162E";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
      }
    }
  }, [proposal, proposal?.signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (proposal?.status === "aprovado" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || proposal?.status === "aprovado") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleApprove = async () => {
    if (!proposal) return;
    if (!clientSignName) {
      alert("Por favor, preencha o seu nome completo para assinar.");
      return;
    }
    if (!acceptedTerms) {
      alert("Por favor, aceite os termos de conformidade técnica.");
      return;
    }

    let signatureData = "";
    if (canvasRef.current) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    setApproving(true);
    
    try {
      // Update proposal state
      const updated: Proposal = {
        ...proposal,
        status: "aprovado",
        signature: signatureData || "Digital Signed",
        signedAt: new Date().toISOString(),
        signedByName: clientSignName,
        signedByRole: clientSignRole || "Responsável Legal"
      };

      // 1. Try Firestore
      if (isRealFirebase) {
        try {
          const docRef = doc(db, "proposals", proposal.id);
          await updateDoc(docRef, {
            status: "aprovado",
            signature: updated.signature,
            signedAt: updated.signedAt,
            signedByName: updated.signedByName,
            signedByRole: updated.signedByRole
          });
          console.log("Proposal approved in Firestore:", proposal.id);
        } catch (dbErr) {
          console.error("Error updating signature in Firestore", dbErr);
        }
      }

      // 2. Local storage sync
      const saved = localStorage.getItem("vitor_engmec_pricing_proposals");
      if (saved) {
        try {
          const proposals: Proposal[] = JSON.parse(saved);
          const index = proposals.findIndex(p => p.id === proposal.id);
          if (index !== -1) {
            proposals[index] = updated;
            localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(proposals));
          }
        } catch (err) {
          console.error("Error saving proposal approval locally", err);
        }
      }

      setProposal(updated);
      setSuccess(true);
    } catch (err) {
      console.error("Approval flow failed", err);
    } finally {
      setApproving(false);
    }
  };

  // Helper to resolve the correct shared app URL regardless of the sandbox domain pattern
  const getSharedUrl = (id?: string) => {
    let origin = window.location.origin;
    if (origin.includes("ais-dev-")) {
      origin = origin.replace("ais-dev-", "ais-pre-");
    } else if (origin.includes("looping-sandbox-dev")) {
      origin = origin.replace("looping-sandbox-dev", "looping-sandbox");
    } else if (origin.includes("-dev.")) {
      origin = origin.replace("-dev.", ".");
    } else if (origin.includes("-dev")) {
      origin = origin.replace("-dev", "-pre");
    }
    const path = window.location.pathname;
    return id ? `${origin}${path}?proposalId=${id}` : `${origin}${path}`;
  };

  // Modern high resolution PDF export with html2pdf.js and dynamic CDN script loading fallback
  const handleExportPDF = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    // Add special class to body to alter layout during PDF generation
    document.body.classList.add("generating-pdf");

    const opt = {
      margin: 10,
      filename: `Proposta_Comercial_VL_Engenharia_${proposal?.clientCompany.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ["css", "legacy"] }
    };

    try {
      // Replace modern unsupported OKLCH colors in styles with standard rgb values temporarily
      await preprocessStylesheets(element);

      let exporter = (window as any).html2pdf;
      if (!exporter) {
        exporter = typeof html2pdf !== "undefined" ? ((html2pdf as any)?.default || html2pdf) : null;
      }
      
      if (!exporter) {
        // Dynamically load the bundled html2pdf.js from CDN to guarantee resolution
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => {
            exporter = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => reject(new Error("Não foi possível carregar a biblioteca de geração de PDF."));
          document.body.appendChild(script);
        });
      }
      
      if (exporter) {
        await exporter().from(element).set(opt).save();
      } else {
        throw new Error("A biblioteca html2pdf não pôde ser iniciada.");
      }
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      alert(`Houve um erro ao gerar o PDF: ${err?.message || err}. Por favor, tente novamente.`);
    } finally {
      // Remove special class from body and restore original stylesheets
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
    }
  };

  const handleWhatsAppShare = () => {
    if (!proposal) return;
    const message = `Olá! Acabei de analisar a Proposta Comercial de Engenharia Mecânica da VL Engenharia para a empresa ${proposal.clientCompany}.`;
    const url = getSharedUrl(proposal.id);
    const encoded = encodeURIComponent(`${message}\n\nVisualizar e Assinar Online: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134074] mb-4"></div>
        <p className="text-slate-400 font-mono text-xs">Carregando portal de orçamento...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg mx-auto text-center my-12 shadow-2xl">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Proposta Não Encontrada</h3>
        <p className="text-slate-400 text-xs mb-6">O link que você seguiu pode estar quebrado ou a proposta correspondente foi arquivada.</p>
        <button 
          onClick={() => { window.location.hash = ""; }} 
          className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold px-6 py-3 rounded-xl transition-all"
        >
          Ir para a Página Inicial
        </button>
      </div>
    );
  }

  // Calculate standards and scopes to render dynamically
  const displayObjective = proposal.aiObjective || 
    `Esta proposta de serviços de engenharia mecânica tem como objetivo realizar vistorias técnicas, avaliações estruturais, e emissões de Laudos de Conformidade Técnica para a empresa ${proposal.clientCompany}.`;

  const displayScopes = proposal.aiScope || 
    proposal.services.flatMap(s => s.scope).filter((v, i, a) => a.indexOf(v) === i);

  const displayNorms = proposal.aiNorms || 
    proposal.services.flatMap(s => s.norms).filter((v, i, a) => a.indexOf(v) === i);

  const displayObservations = proposal.aiObservations || [
    "A contratante fornecerá acompanhamento para vistoria física e disponibilizará toda a documentação anterior.",
    "Os equipamentos devem estar operacionais ou disponíveis para vistorias visuais estáticas no horário agendado."
  ];

  const displayExclusions = proposal.aiExclusions || [
    "Serviços mecânicos físicos, montagem e desmontagem estrutural",
    "Adequação de circuitos elétricos, cabeamento ou automação",
    "Emissão de taxas ou emolumentos públicos extraordinários"
  ];

  const displayComplementary = proposal.aiComplementary || [
    "Acompanhamento anual preventivo de integridade",
    "Treinamento de segurança de operadores conforme NR-11 e NR-12"
  ];

  // Map state fields for page layout matching PricingModule
  const visibleSections = proposal.visibleSections || {
    capa: true,
    contracapa: true,
    principios: true,
    entregamos: true,
    problemas: true,
    clientes: true,
    resumoServicos: true,
    identificacao: true,
    equipe: true,
    atividades: true,
    investimento: true,
    condicoes: true,
    prazos: true,
    assinatura: true,
  };

  const proposalImages = proposal.images || [];
  const demandDescription = proposal.demandDescription || "Laudo de integridade física para caminhão munck";
  const deliveryDays = proposal.deliveryDays || 14;
  const multiplierQty = (proposal as any).multiplierQty || 1;
  const technicalHours = (proposal as any).technicalHours || (proposal.services.length * 8);
  const selectedServices = proposal.services || [];
  const financials = proposal.pricingInfo || {
    subtotal: 0,
    descontos: 0,
    impostos: 0,
    totalGeral: 0,
    paymentTerms: "50% de sinal + 50% na entrega",
    validityDays: 10,
    executionWeeks: 2
  };

  const clientCompany = proposal.clientCompany;
  const clientCnpj = proposal.clientCnpj;
  const clientName = proposal.clientName;
  const clientRole = proposal.clientRole || "Representante Técnico";
  const clientCity = proposal.clientCity;
  const clientState = proposal.clientState;
  const clientEmail = proposal.clientEmail;
  const clientContact = proposal.clientContact;
  const validityDays = financials.validityDays;
  const paymentTerms = financials.paymentTerms;

  const getPageNum = (sectionKey: keyof typeof visibleSections) => {
    const keys: (keyof typeof visibleSections)[] = [
      "capa", "contracapa", "principios", "entregamos", "problemas", "clientes",
      "resumoServicos", "identificacao", "equipe", "atividades", "investimento",
      "condicoes", "prazos", "assinatura"
    ];
    const activeKeys = keys.filter(k => visibleSections[k]);
    const idx = activeKeys.indexOf(sectionKey);
    return idx !== -1 ? `${(idx + 1).toString().padStart(2, '0')}` : '';
  };

  const getTotalPagesLabel = () => {
    return Object.values(visibleSections).filter(Boolean).length;
  };

  return (
    <div className="space-y-8" id="public-portal">
      
      {/* HEADER CONTROLS (Floating header in screen view, hidden in prints) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${proposal.status === "aprovado" ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"}`}></span>
            <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
              Proposta {proposal.id} • {proposal.status === "aprovado" ? "Aprovada & Assinada" : "Aguardando Aprovação"}
            </span>
          </div>
          <h2 className="text-white text-base font-bold mt-1">Portal de Proposta Comercial • VL Engenharia</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold font-mono tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Baixar PDF Oficial</span>
          </button>
          
          <button 
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Share2 className="h-4 w-4" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center gap-3 shadow-inner print:hidden">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="font-bold">Proposta Comercial Aprovada com Sucesso!</p>
            <p className="text-[11px] text-slate-400">Sua assinatura e aceitação digital foram carimbadas no documento oficial abaixo. Você já pode salvar ou imprimir.</p>
          </div>
        </div>
      )}

      {/* PROPOSAL VIEW AREA (Formatted for A4-ratio page blocks) */}
      <div 
        ref={printAreaRef}
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-w-[210mm] mx-auto p-[15mm] space-y-[20mm] font-sans text-xs leading-relaxed print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ contentVisibility: "auto" }}
      >
        
        {/* PAGE 1: COVER (CAPA) */}
        {visibleSections.capa && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block border-b border-slate-100 pb-8 relative overflow-hidden bg-gradient-to-br from-[#f4f7fa] via-[#edf2f7] to-[#e2e8f0]">
            {/* Background Image overlay for Capa */}
            <img 
              src="/capa_bg.jpg" 
              alt="Engineering background" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.14] pointer-events-none" 
              referrerPolicy="no-referrer"
            />
            
            {/* Technical Blueprint Elements */}
            <div className="absolute top-4 left-4 text-[7px] font-mono text-slate-400 pointer-events-none">SYS.COORD // 0.00.00</div>
            <div className="absolute top-4 right-4 text-[7px] font-mono text-slate-400 pointer-events-none">SPEC.REF // PROP-{new Date().getFullYear()}</div>
            <div className="absolute bottom-4 left-4 text-[7px] font-mono text-slate-400 pointer-events-none">METRIC: ISO-A4 / SCALE: 1:1</div>
            <div className="absolute bottom-4 right-4 text-[7px] font-mono text-slate-400 pointer-events-none">VL.ENG.MECANICA</div>
            
            {/* Technical framing border */}
            <div className="absolute inset-3 border border-[#0B2545]/15 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 border border-[#0B2545]/5 rounded-2xl pointer-events-none" />
            
            {/* Technical AutoCAD Corner Marks */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0B2545]/20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[265mm] w-full p-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div className="scale-100 origin-left">
                  <Logo variant="print" className="h-16" />
                </div>
                <div className="text-right text-[9px] font-mono text-slate-500">
                  <p className="font-bold text-[#0B2545]">VL ENGENHARIA MECÂNICA</p>
                  <p>CREA-PE: 182229949-0</p>
                  <p>Recife - PE</p>
                </div>
              </div>

              <div className="my-auto space-y-10 text-center py-10">
                <div className="inline-block bg-[#0B2545]/5 border border-[#0B2545]/15 text-[#0B2545] px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                  Proposta Técnica Comercial
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-black text-[#0B2545] tracking-tight leading-none uppercase">
                    Orçamento de Engenharia
                  </h1>
                  <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Laudos, Vistorias & Responsabilidade Técnica</p>
                </div>
                
                <div className="h-1.5 w-20 bg-[#134074] mx-auto rounded-full"></div>
                
                <p className="max-w-md mx-auto text-slate-600 text-[11px] leading-relaxed">
                  Prestação de serviços de Engenharia Mecânica de conformidade, mapeamento de risco técnico e emissão de ART oficial para regularização jurídica e operacional.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left mt-10">
                  <div className="bg-slate-50/90 backdrop-blur-xs p-4 rounded-xl border border-slate-150 space-y-2">
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Identificação do Cliente</p>
                    <p className="font-bold text-[#0B2545] text-xs truncate">{clientCompany || "Empresa Cliente"}</p>
                    <p className="text-slate-600 text-[10px]">CNPJ: {clientCnpj || "00.000.000/0001-00"}</p>
                    <p className="text-slate-600 text-[10px]">Representante: {clientName || "Diretor de Operações"}</p>
                  </div>
                  
                  <div className="bg-slate-50/90 backdrop-blur-xs p-4 rounded-xl border border-slate-150 space-y-1 font-mono text-[9px] text-slate-600">
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-sans font-bold">Dados Gerais</p>
                    <p><strong>Proposta nº:</strong> {proposal.id}</p>
                    <p><strong>Data de Emissão:</strong> {new Date(proposal.signedAt || Date.now()).toLocaleDateString("pt-BR")}</p>
                    <p><strong>Validade Comercial:</strong> {validityDays} dias</p>
                    <p><strong>Localidade:</strong> {clientCity} - {clientState}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 text-center text-[9px] text-slate-400 flex justify-between items-center font-mono">
                <span>© {new Date().getFullYear()} VL Engenharia • Todos os direitos reservados.</span>
                <span className="text-slate-500 font-bold">Página {getPageNum("capa")} de {getTotalPagesLabel()}</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: CONTRACAPA (Vitor's portrait and Propósito) */}
        {visibleSections.contracapa && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8 relative overflow-hidden bg-gradient-to-br from-[#f4f7fa] via-[#edf2f7] to-[#e2e8f0]">
            {/* Background Image overlay for Contracapa */}
            <img 
              src="/contracapa_bg.jpg" 
              alt="Engineering background" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.11] pointer-events-none" 
              referrerPolicy="no-referrer"
            />
            
            {/* Technical Blueprint Elements */}
            <div className="absolute top-4 left-4 text-[7px] font-mono text-slate-400 pointer-events-none">SYS.COORD // 0.01.00</div>
            <div className="absolute top-4 right-4 text-[7px] font-mono text-slate-400 pointer-events-none">SECTION // 01.PROPOSITO</div>
            <div className="absolute bottom-4 left-4 text-[7px] font-mono text-slate-400 pointer-events-none">VL.MEC.SECTION</div>
            <div className="absolute bottom-4 right-4 text-[7px] font-mono text-slate-400 pointer-events-none">ISO-9001 // SEC.01</div>
            
            {/* Technical framing border */}
            <div className="absolute inset-3 border border-[#0B2545]/15 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 border border-[#0B2545]/5 rounded-2xl pointer-events-none" />
            
            {/* Technical AutoCAD Corner Marks */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0B2545]/20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0B2545]/20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[265mm] w-full p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Nossa Missão & Propósito</span>
                <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("contracapa")}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-auto items-center">
                <div className="md:col-span-5 space-y-6">
                  <div className="scale-100 origin-left">
                    <Logo variant="print" className="h-12" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-[#0B2545] tracking-tight uppercase leading-none">
                      Nosso Propósito
                    </h2>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Compromisso com a conformidade real</p>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed font-sans bg-white/80 backdrop-blur-xs p-4 border-l-4 border-[#134074] rounded-r-xl shadow-xs">
                    "Contribuir para um ambiente mais seguro e eficiente em diversos setores industriais, elevando o nível de consciência do mercado."
                  </p>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Sob a direção técnica do Engenheiro Mecânico <strong>Vitor Leonardo C. de Lima (CREA-PE 182229949-0)</strong>, nossa atuação é pautada pelo rigor metodológico e conformidade com as normas técnicas da ABNT e diretrizes federais de segurança do trabalho.
                  </p>
                </div>

                <div className="md:col-span-7 flex justify-center">
                  <div className="relative p-2.5 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-sm w-full">
                    <div className="absolute top-0 right-0 w-16 h-16 border-b border-l border-slate-200 pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-t border-r border-slate-200 pointer-events-none z-10" />
                    
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 relative">
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://vitorleonardo-engmec.netlify.app/assets/vitor-leonardo-Ca17hHDt.png" 
                        alt="Vitor Leonardo" 
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-left">
                        <span className="text-[8px] font-mono font-bold tracking-widest text-[#4895EF] uppercase">
                          Responsável Técnico Certificado
                        </span>
                        <h3 className="text-sm font-sans font-black text-white tracking-tight">
                          Vitor Leonardo Cordeiro Linhares
                        </h3>
                        <p className="text-[9px] text-[#8DA9C4] font-mono font-semibold">
                          CREA-PE 1822299490
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
                <span>VL Engenharia Mecânica • Proposta Comercial</span>
                <span>Página {getPageNum("contracapa")} de {getTotalPagesLabel()}</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: NOSSOS PRINCÍPIOS */}
        {visibleSections.principios && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Nossos Princípios Fundamentais</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("principios")}</span>
            </div>

            <div className="my-auto space-y-8 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">Princípios Fundamentais</h2>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">Valores inegociáveis que norteiam cada vistoria, parecer e entrega técnica assinada por nossa empresa.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B2545]/5 text-[#0B2545] font-mono font-bold flex items-center justify-center text-sm border border-[#0B2545]/10">01</div>
                  <h3 className="font-bold text-sm text-[#0B2545] uppercase tracking-tight">Confiança na Entrega</h3>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    Compromisso inabalável com a precisão dos prazos acordados. Nossos laudos técnicos são entregues de forma ágil para viabilizar as metas operacionais do cliente.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B2545]/5 text-[#0B2545] font-mono font-bold flex items-center justify-center text-sm border border-[#0B2545]/10">02</div>
                  <h3 className="font-bold text-sm text-[#0B2545] uppercase tracking-tight">Ética no Serviço</h3>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    Transparência total em nossas avaliações físicas. Fornecemos pareceres periciais justos, respaldados estritamente na verdade técnica e na legislação federal.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B2545]/5 text-[#0B2545] font-mono font-bold flex items-center justify-center text-sm border border-[#0B2545]/10">03</div>
                  <h3 className="font-bold text-sm text-[#0B2545] uppercase tracking-tight">Satisfação do Cliente</h3>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    Entendemos o negócio do cliente. Focamos em simplificar procedimentos complexos de adequação, transformando as exigências fiscais em melhorias operacionais reais.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B2545]/5 text-[#0B2545] font-mono font-bold flex items-center justify-center text-sm border border-[#0B2545]/10">04</div>
                  <h3 className="font-bold text-sm text-[#0B2545] uppercase tracking-tight">Relacionamento duradouro</h3>
                  <p className="text-slate-600 text-[10px] leading-relaxed">
                    Mais do que um fornecedor, somos parceiros de engenharia do seu negócio. Oferecemos suporte consultivo contínuo pós-entrega de laudos e laço corporativo de longo prazo.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("principios")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 4: O QUE ENTREGAMOS */}
        {visibleSections.entregamos && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">O Que Entregamos</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("entregamos")}</span>
            </div>

            <div className="my-auto space-y-10 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">O Que Entregamos</h2>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">Nossas soluções de engenharia geram resultados tangíveis para a governança das empresas parceiras.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-lg text-emerald-500 mt-1">✔</span>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Ambiente mais seguro</h4>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-1">Garantia técnica de segurança contra acidentes operacionais, reduzindo drasticamente riscos à vida e à integridade dos funcionários.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-lg text-emerald-500 mt-1">✔</span>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Solução Custo x Benefício</h4>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-1">Otimização de custos de adequação. Projetamos e indicamos soluções financeiramente viáveis que não prejudicam a produtividade.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-lg text-emerald-500 mt-1">✔</span>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Respaldo Técnico de Excelência</h4>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-1">Emissão de Anotações de Responsabilidade Técnica (ART) registradas no CREA-PE para plena proteção jurídica perante órgãos fiscalizadores.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-lg text-emerald-500 mt-1">✔</span>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Qualidade e Confiança</h4>
                    <p className="text-slate-600 text-[10px] leading-relaxed mt-1">Relatórios analíticos fotográficos minuciosos, ensaios estruturais não destrutivos avançados e rastreabilidade total de dados técnicos.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("entregamos")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 5: PROBLEMAS QUE RESOLVEMOS */}
        {visibleSections.problemas && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Problemas Que Ajudamos a Resolver</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("problemas")}</span>
            </div>

            <div className="my-auto space-y-10 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">Problemas que Ajudamos a Resolver</h2>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Eliminamos gargalos regulatórios, técnicos e de custos operacionais das empresas.</p>
              </div>

              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex gap-4 items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs">Acidentes Operacionais</h4>
                    <p className="text-slate-600 text-[10px]">Identificação proativa de falhas de fadiga metálica ou dimensionamento antes de causar danos físicos.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs">Retrabalho no Serviço</h4>
                    <p className="text-slate-600 text-[10px]">Orientação técnica clara, eliminando a contratação de adequações incorretas e retrabalhos caros.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs">Complexidade nas Adequações</h4>
                    <p className="text-slate-600 text-[10px]">Traduzimos as exigências regulatórias das NRs (NR-12, NR-13, NR-11) para um plano operacional simplificado.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs">Não Conformidade com as Normas</h4>
                    <p className="text-slate-600 text-[10px]">Proteção jurídica contra multas do Ministério do Trabalho, interdições de pátio industrial ou embargos prediais.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs">Alto Custo</h4>
                    <p className="text-slate-600 text-[10px]">Evitamos multas, paralisações, interdições civis e perdas judiciais que poderiam custar fortunas às empresas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("problemas")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 6: ALGUNS DE NOSSOS CLIENTES */}
        {visibleSections.clientes && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Nossos Clientes & Atuação</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("clientes")}</span>
            </div>

            <div className="my-auto space-y-10 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">Alguns De Nossos Clientes</h2>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Parceiros comerciais atendidos por nossa excelência técnica regulatória.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center h-24">
                  <span className="font-bold text-[#0B2545] text-xs">Indústrias Metalúrgicas</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Adequações NR-12</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center h-24">
                  <span className="font-bold text-[#0B2545] text-xs">Frotas de Logística</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Vistorias Munck / Linha</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center h-24">
                  <span className="font-bold text-[#0B2545] text-xs">Condomínios Residenciais</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Playgrounds & PMOC</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center h-24">
                  <span className="font-bold text-[#0B2545] text-xs">Construtoras Civis</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Projetos & Playgrounds</span>
                </div>
              </div>

              <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100 text-center max-w-lg mx-auto space-y-3">
                <h3 className="font-bold text-[#0B2545] text-xs uppercase tracking-wider">Mobilização Técnica em Todo o Estado de Pernambuco</h3>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Nossa base central em <strong>Recife-PE</strong> permite mobilização rápida para atendimento de vistorias técnicas emergenciais, peritagens e vistorias agendadas no Grande Recife, Caruaru, Petrolina, Olinda, Jaboatão, Ipojuca e Região Metropolitana.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("clientes")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 7: RESUMO DOS NOSSOS SERVIÇOS (ILUSTRATIVO) */}
        {visibleSections.resumoServicos && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Resumo de Nossos Serviços</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("resumoServicos")}</span>
            </div>

            <div className="my-auto space-y-8 py-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">Nossos Serviços</h2>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Soluções integradas em engenharia mecânica pericial, industrial e veicular.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3.5 items-start">
                  <div className="h-8 w-8 bg-[#134074] text-white flex items-center justify-center font-bold rounded-lg text-xs shrink-0">⚙</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Adequação NR-12</h4>
                    <p className="text-slate-600 text-[9.5px] leading-relaxed mt-1">Análise de risco de máquinas industriais, inventários de risco, projeto conceitual de proteções metálicas e emissão de ART.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3.5 items-start">
                  <div className="h-8 w-8 bg-[#134074] text-white flex items-center justify-center font-bold rounded-lg text-xs shrink-0">⚽</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Playgrounds</h4>
                    <p className="text-slate-600 text-[9.5px] leading-relaxed mt-1">Avaliação e laudo de brinquedos infantis sob normas ABNT NBR 16071, atestando conformidade estrutural e segurança em parques.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3.5 items-start">
                  <div className="h-8 w-8 bg-[#134074] text-white flex items-center justify-center font-bold rounded-lg text-xs shrink-0">✏</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Projetos Mecânicos 3D</h4>
                    <p className="text-slate-600 text-[9.5px] leading-relaxed mt-1">Modelagem matemática tridimensional CAD, cálculo estrutural FEA por elementos finitos e detalhamento de fabricação técnica.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3.5 items-start">
                  <div className="h-8 w-8 bg-[#134074] text-white flex items-center justify-center font-bold rounded-lg text-xs shrink-0">🚚</div>
                  <div>
                    <h4 className="font-bold text-[#0B2545] text-xs uppercase">Veículos & Máquinas</h4>
                    <p className="text-slate-600 text-[9.5px] leading-relaxed mt-1">Laudo técnico estrutural de caminhões munck, guindastes de grande porte, ônibus de transporte escolar e perícia de sinistro.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("resumoServicos")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 8: IDENTIFICACAO DO CLIENTE / DETALHES DA PROPOSTA */}
        {visibleSections.identificacao && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Identificação das Partes & Demanda</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("identificacao")}</span>
            </div>

            <div className="my-auto space-y-6 py-4">
              <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Detalhes do Atendimento Comercial</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-xs text-[#0B2545] uppercase tracking-wider font-mono">Informações da Provedora</h4>
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <p><strong>Razão Social:</strong> VL ENGENHARIA MECÂNICA</p>
                    <p><strong>Engenheiro Responsável:</strong> Vitor Leonardo C. de Lima</p>
                    <p><strong>CREA-PE:</strong> 182229949-0</p>
                    <p><strong>Localidade:</strong> Recife - PE</p>
                    <p><strong>E-mail:</strong> vitorleonardo.engmec@gmail.com</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-xs text-[#0B2545] uppercase tracking-wider font-mono">Informações do Cliente</h4>
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <p><strong>Razão Social:</strong> {clientCompany || "Empresa Cliente Geral"}</p>
                    <p><strong>CNPJ:</strong> {clientCnpj || "00.000.000/0001-00"}</p>
                    <p><strong>Contato Legal:</strong> {clientName || "Responsável Técnico"}</p>
                    <p><strong>E-mail:</strong> {clientEmail || "comercial@cliente.com"}</p>
                    <p><strong>Telefone:</strong> {clientContact || "Não informado"}</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-blue-50/20 space-y-3">
                <h4 className="font-bold text-xs text-[#0B2545] uppercase tracking-wider font-mono">Detalhes da Proposta Comercial</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-600">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-mono text-[9px] uppercase">Data do Orçamento</p>
                    <p className="font-bold text-slate-700 mt-0.5">{new Date(proposal.signedAt || Date.now()).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-mono text-[9px] uppercase">Código de Controle Interno</p>
                    <p className="font-bold text-slate-700 mt-0.5">{proposal.id}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-1">
                  <p className="text-slate-400 font-mono text-[9px] uppercase">Descrição Detalhada da Demanda Solicitada pelo Cliente</p>
                  <p className="text-xs text-[#0B2545] font-bold leading-relaxed">{demandDescription}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("identificacao")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 9: NOSSA EQUIPE & ESTRUTURA DA PROPOSTA */}
        {visibleSections.equipe && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Nossa Equipe & Estrutura da Proposta</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("equipe")}</span>
            </div>

            <div className="my-auto space-y-8 py-4">
              <div>
                <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Nossa Equipe & Estrutura</h2>
                <p className="text-[10px] text-slate-500 font-mono">Atendimento especializado e estruturação transparente em etapas.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-[#0B2545] text-xs uppercase tracking-wider">Nossa Equipe Técnica</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] space-y-2">
                  <strong className="text-[#0B2545] text-xs uppercase block">Engenheiros Mecânicos</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Nossos laudos, pareceres e vistorias são elaborados, assinados e homologados exclusivamente por <strong>Engenheiros Mecânicos habilitados</strong> com registro regular ativo no CREA-PE. Garantimos a plena responsabilidade técnica (ART) sobre cada equipamento avaliado, assegurando total conformidade com todas as normas e leis federais vigentes.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                <h3 className="font-bold text-[#0B2545] text-xs uppercase tracking-wider border-b pb-2">A Proposta Será Dividida em Três Etapas:</h3>
                
                <div className="space-y-3 text-[10px] text-slate-600">
                  <p>
                    <strong className="text-[#0B2545]">Etapa 1: Relação/Descrição dos Serviços</strong><br />
                    Apresentação detalhada de cada serviço selecionado, normas técnicas associadas e levantamento fotográfico inicial da demanda do cliente.
                  </p>
                  <p>
                    <strong className="text-[#0B2545]">Etapa 2: Escopo dos Serviços (Metodologia)</strong><br />
                    Definição de todas as rotinas técnicas de inspeção mecânica, checklists normativos aplicados in loco e elaboração do dossiê técnico.
                  </p>
                  <p>
                    <strong className="text-[#0B2545]">Etapa 3: Prazo, Forma de Pagamento e Valores</strong><br />
                    Apresentação das condições comerciais formais, cronograma de desembolso financeiro, formas de pagamento e prazos finais de entrega.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("equipe")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 10: ETAPA 1 - RELAÇÃO E DESCRIÇÃO DOS SERVIÇOS & LEVANTAMENTO FOTOGRÁFICO */}
        {visibleSections.atividades && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Etapa 1 – Relação dos Serviços & Levantamento Fotográfico</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("atividades")}</span>
            </div>

            <div className="my-auto space-y-5 py-4">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Etapa 1: Descrição dos Serviços</h2>
                <p className="text-[10px] text-slate-500 font-sans">A proposta comercial contempla as seguintes soluções de engenharia mecânica pericial selecionadas:</p>
              </div>

              <div className="space-y-3 max-h-[110mm] overflow-hidden">
                {selectedServices.map((serv, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <strong className="text-xs text-[#0B2545] uppercase block">{serv.name}</strong>
                    <p className="text-[10px] text-slate-600 leading-normal">{serv.description}</p>
                    <p className="text-[9px] text-slate-400 font-mono"><strong>Normas Técnicas Associadas:</strong> {serv.norms.join(", ")}</p>
                  </div>
                ))}
              </div>

              <div className="border border-slate-250 rounded-xl p-4 bg-white space-y-2.5">
                <h4 className="font-bold text-[10px] text-[#0B2545] uppercase tracking-wider font-mono">Levantamento Fotográfico Preliminar</h4>
                
                {proposalImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {proposalImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-300">
                        <img src={img} alt="Uploaded attachment" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-500 text-[10px]">
                    <p className="font-bold">Nenhuma imagem preliminar anexada pelo usuário.</p>
                    <p className="text-[9px] mt-0.5">O levantamento fotográfico analítico detalhado será realizado em campo pelo Engenheiro Responsável durante a inspeção física in loco.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("atividades")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 11: ETAPA 2 - ESCOPO TÉCNICO DAS ATIVIDADES */}
        {visibleSections.investimento && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Etapa 2 – Escopo Técnico Detalhado</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("investimento")}</span>
            </div>

            <div className="my-auto space-y-6 py-4">
              <div>
                <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Etapa 2: Escopo Técnico das Atividades</h2>
                <p className="text-[10px] text-slate-500 font-mono">Descrição exaustiva de todas as etapas metodológicas que serão realizadas:</p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full border-collapse text-left text-[10px]">
                  <thead>
                    <tr className="bg-[#0B2545] text-white font-mono uppercase text-[8.5px]">
                      <th className="p-2.5 font-bold">Item</th>
                      <th className="p-2.5 font-bold">Atividade Técnico</th>
                      <th className="p-2.5 font-bold">Descrição do Procedimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2545]">01</td>
                      <td className="p-2.5 font-bold text-slate-800">Inspeção In Loco</td>
                      <td className="p-2.5">Vistoria presencial minuciosa do maquinário ou instalação para mapeamento visual de não-conformidades de segurança.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2545]">02</td>
                      <td className="p-2.5 font-bold text-slate-800">Checklists Normativos</td>
                      <td className="p-2.5">Aplicação de checklists técnicos customizados baseados nas resoluções ABNT e normas federais de referência.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2545]">03</td>
                      <td className="p-2.5 font-bold text-slate-800">Ensaios Físicos</td>
                      <td className="p-2.5">Realização de ensaios estruturais não destrutivos avançados (PM, ultrassom ou estanqueidade) conforme exigido pela categoria do equipamento.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2545]">04</td>
                      <td className="p-2.5 font-bold text-slate-800">Emissão de Relatório</td>
                      <td className="p-2.5">Elaboração de laudo fotográfico conclusivo apontando falhas e plano de ação corretivo detalhado para readequação física.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2545]">05</td>
                      <td className="p-2.5 font-bold text-slate-800">ART CREA-PE</td>
                      <td className="p-2.5">Anotação de Responsabilidade Técnica emitida eletronicamente junto ao conselho federal de engenharia, conferindo validade legal.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("investimento")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 12: INFORMAÇÕES OPERACIONAIS DE CAMPO */}
        {visibleSections.condicoes && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Informações de Campo & Diretrizes</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("condicoes")}</span>
            </div>

            <div className="my-auto space-y-6 py-4">
              <div>
                <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Informações Técnicas Operacionais</h2>
                <p className="text-[10px] text-slate-500 font-mono">Resumo técnico do dimensionamento e esforço exigidos para a entrega:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Total de Equipamentos</p>
                  <p className="text-xl font-bold text-[#0B2545] mt-1">{selectedServices.length * multiplierQty} Unidades</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Tempo de Engenharia</p>
                  <p className="text-xl font-bold text-[#0B2545] mt-1">{technicalHours} Horas</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">Janela de Mobilização</p>
                  <p className="text-xl font-bold text-[#0B2545] mt-1">Imediata</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
                <h3 className="font-bold text-[#0B2545] text-xs uppercase tracking-wider font-mono">Diretrizes e Obrigações do Cliente</h3>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Para o cumprimento ideal das metas técnicas e dos prazos acordados, o cliente deverá disponibilizar:<br />
                  • Acesso livre e desimpedido às máquinas e instalações objeto de vistoria técnica.<br />
                  • Presença de operador qualificado ou técnico de manutenção para acionamento mecânico teste.<br />
                  • Envio de documentação de histórico prévio, manuais de fabricação ou plantas caso existentes.<br />
                  • Liberação de segurança interna do pátio operacional (EPIs especiais se exigido).
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("condicoes")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 13: ETAPA 3 - PRAZO, CONDIÇÕES DE PAGAMENTO E VALORES */}
        {visibleSections.prazos && (
          <div className="flex flex-col justify-between min-h-[285mm] break-after-page page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Etapa 3 – Prazo, Pagamento & Investimento</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("prazos")}</span>
            </div>

            <div className="my-auto space-y-6 py-4">
              <div>
                <h2 className="text-lg font-black text-[#0B2545] uppercase tracking-tight">Etapa 3: Prazo, Forma de Pagamento e Valores</h2>
                <p className="text-[10px] text-slate-500 font-mono">Abaixo detalhamos a proposta comercial e condições gerais de investimento:</p>
              </div>

              {/* CONDIÇÃO TICKET BOX LAYOUT */}
              <div className="border-2 border-[#134074] rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-[#0B2545] text-white px-5 py-3.5 flex justify-between items-center font-mono text-[9px] font-bold tracking-widest uppercase">
                  <span>Condição Comercial de Engenharia</span>
                  <span>VL Engenharia Mecânica</span>
                </div>
                
                <div className="p-5 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-700">
                    <div>
                      <p className="text-[9px] font-mono text-slate-400 uppercase">Prazo para Entrega dos Laudos</p>
                      <p className="font-bold text-[#0B2545] text-sm mt-0.5">{deliveryDays} Dias Úteis <span className="text-slate-500 font-normal text-xs">(após vistoria in loco)</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-slate-400 uppercase">Formas e Termos de Pagamento</p>
                      <p className="font-bold text-[#0B2545] text-xs mt-0.5">{paymentTerms}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-4 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] font-mono text-slate-400 uppercase font-bold">Investimento Comercial Líquido</p>
                      <p className="text-3xl font-black text-emerald-600 mt-0.5">R$ {financials.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">Inclusos: Emissão de Nota Fiscal de Serviços (NFS-e), taxas de CREA-PE (ART) e deslocamentos operacionais.</p>
                    </div>
                    <div className="bg-[#0B2545]/5 px-4 py-2 rounded-lg border border-[#0B2545]/10 text-center font-mono text-[10px]">
                      <p className="text-[#0B2545] font-bold">A.R.T. Inclusa</p>
                      <p className="text-slate-500 text-[8px] uppercase">CREA-PE Ativo</p>
                    </div>
                  </div>

                  <p className="text-[8.5px] font-mono text-slate-400 leading-normal text-center select-none pt-2">
                    * Proposta válida por {validityDays} dias a contar da data de emissão. Este orçamento de engenharia não constitui vínculo financeiro definitivo sem aceite digital formal.
                  </p>
                </div>
              </div>

              {/* SIGNATURE SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="text-center space-y-2">
                  <p className="font-serif italic text-slate-400 text-[10px] select-none tracking-widest">[Assinado Eletronicamente]</p>
                  <div className="h-0.5 w-32 bg-slate-200 mx-auto mt-2" />
                  <p className="font-bold text-slate-800 text-xs mt-1">Vitor Leonardo C. de Lima</p>
                  <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Responsável Técnico • CREA-PE 182229949-0</p>
                </div>

                <div className="text-center space-y-2">
                  {proposal.signature ? (
                    <div className="space-y-1">
                      <img src={proposal.signature} alt="Assinatura Cliente" className="max-h-10 max-w-[180px] object-contain mx-auto mix-blend-multiply" />
                      <div className="h-0.5 w-32 bg-slate-200 mx-auto mt-2" />
                      <p className="font-bold text-slate-800 text-xs mt-1">{proposal.signedByName || clientName}</p>
                      <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{proposal.signedByRole || clientRole || "Representante Técnico"}</p>
                      {proposal.signedAt && (
                        <p className="text-[8px] text-emerald-600 font-mono">Assinado em {new Date(proposal.signedAt).toLocaleString("pt-BR")}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-400 font-mono text-[9px] italic select-none">[Aguardando Assinatura Eletrônica]</p>
                      <div className="h-0.5 w-32 bg-slate-200 mx-auto mt-2" />
                      <p className="font-bold text-slate-800 text-xs mt-1">{clientName || "Representante Comercial"}</p>
                      <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{clientCompany || "Empresa Cliente"}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("prazos")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

        {/* PAGE 14: AGRADECIMENTO FINAL */}
        {visibleSections.assinatura && (
          <div className="flex flex-col justify-between min-h-[285mm] page-block pb-8">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-[10px] font-bold text-[#0B2545] font-mono uppercase tracking-widest">Agradecimento & Contato</span>
              <span className="text-[10px] text-slate-400 font-mono">Pág. {getPageNum("assinatura")}</span>
            </div>

            <div className="my-auto space-y-8 text-center py-10 max-w-lg mx-auto">
              <div className="scale-100 flex justify-center">
                <Logo variant="print" className="h-16" />
              </div>

              <div className="h-1 w-16 bg-[#134074] mx-auto rounded-full"></div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#0B2545] uppercase tracking-tight">AGRADECIMENTO</h3>
                
                <p className="text-slate-600 text-xs leading-relaxed font-sans">
                  A <strong>VL Engenharia</strong> agradece pela oportunidade de apresentar esta Proposta Comercial. Ficamos à total disposição para sanar quaisquer dúvidas técnicas ou comerciais que possam surgir sobre o escopo de serviços ou condições descritas.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 font-mono space-y-1">
                <p className="font-bold text-[#0B2545] font-sans">VL Engenharia Mecânica & Consultoria Pericial</p>
                <p>Recife, Pernambuco - Brasil</p>
                <p>Telefone / WhatsApp: (81) 98888-7777</p>
                <p>E-mail: vitorleonardo.engmec@gmail.com</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-[9px] text-slate-400 font-mono flex justify-between">
              <span>VL Engenharia Mecânica • Proposta Comercial</span>
              <span>Página {getPageNum("assinatura")} de {getTotalPagesLabel()}</span>
            </div>
          </div>
        )}

      </div>

      {/* CLIENT APPROVAL CARD (Only visible when pending) */}
      {proposal.status !== "aprovado" && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-2xl mx-auto space-y-6 shadow-2xl print:hidden text-white">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <div>
              <h3 className="text-white text-base font-bold">Aprovação & Assinatura Eletrônica da Proposta</h3>
              <p className="text-slate-400 text-xs">Preencha seus dados e assine digitalmente no quadro abaixo para validar e aprovar este orçamento.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono text-[10px] uppercase tracking-wider">Nome Completo do Responsável</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={clientSignName}
                  onChange={(e) => setClientSignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Nome de quem assina"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono text-[10px] uppercase tracking-wider">Cargo ou Função</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={clientSignRole}
                  onChange={(e) => setClientSignRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Diretor de Operações"
                />
              </div>
            </div>
          </div>

          {/* SIGNATURE DRAW CANVAS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-slate-300 font-mono text-[10px] uppercase tracking-wider">Quadro de Assinatura Digital (Desenhe com o dedo ou mouse)</label>
              <button 
                onClick={clearCanvas}
                className="text-[10px] text-amber-500 hover:text-amber-400 hover:underline font-mono"
              >
                Limpar Assinatura
              </button>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden border-2 border-dashed border-slate-800 h-36 relative shadow-inner">
              <canvas 
                ref={canvasRef}
                width={600}
                height={144}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="accept-terms" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 bg-slate-950 focus:ring-emerald-500 text-emerald-500"
            />
            <label htmlFor="accept-terms" className="text-[10px] text-slate-400 leading-normal">
              Declaro que concordo formalmente com os termos, prazos e valores expressos nesta proposta técnica de engenharia, autorizando o início da mobilização da equipe técnica da VL Engenharia.
            </label>
          </div>

          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {approving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processando Assinatura Digital...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4.5 w-4.5 text-white" />
                <span>Confirmar e Aprovar Proposta Comercial</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
