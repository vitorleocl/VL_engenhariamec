import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import React, { useState, useRef } from "react";
import { 
  Shield, 
  FileText, 
  Wand2, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileDown, 
  Plus, 
  Trash2, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Info, 
  X, 
  Upload, 
  Copy, 
  Layers, 
  Building, 
  Users, 
  Wrench,
  Activity,
  DollarSign,
  Briefcase,
  FileCheck,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Cpu,
  Brain,
  Calculator
} from "lucide-react";
import { 
  PREFILLED_PCM_PARAMS, 
  PREFILLED_DIAGNOSTICO, 
  PREFILLED_PCM_PMP, 
  PREFILLED_PCM_FMEA, 
  PREFILLED_PCM_KPIS,
  PcmParams,
  DiagnosticoItem,
  PmpRotina,
  FmeaItem,
  KpiMeta,
  UploadedImage
} from "./pcmData";
import { exportToWord, copyRichText, preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";
import Logo from "../Logo";
import LaudoPricingTab from "./LaudoPricingTab";

interface LaudoPCMIndepProps {
  clients?: ClientData[];
  onBack?: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoPCMIndep({ onBack, initialPrefilled = false, clients }: LaudoPCMIndepProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"params" | "diagnostico" | "pmp" | "fmea" | "kpis" | "images" | "pricing" | "preview">("params");
  
  // Document Toggle inside Preview tab
  const [docLayout, setDocLayout] = useState<"all" | "diagnostico" | "pmp" | "fmea" | "kpis">("all");

  // State Management
  const [params, setParams] = useState<PcmParams>(
    initialPrefilled ? PREFILLED_PCM_PARAMS : {
      laudoNumber: "LPCM-" + Math.floor(1000 + Math.random() * 9000) + "/2026 Rev. 00",
      clientName: "",
      cnpj: "",
      address: "",
      inspectionCity: "Recife",
      inspectionDate: new Date().toISOString().split("T")[0],
      facilityName: "",
      facilityDesc: "",
      totalAssets: "",
      pcmAnalyst: "Vitor Leonardo - Engenheiro Mecânico (CREA-PE 1822299490)",
      deliveryType: "E", // Combined / Plano Diretor
      notes: "",
      normasAdicionais: "ABNT NBR ISO 55001, ABNT NBR 5410, ABNT NBR ISO 9001"
    }
  );

  const [diagnostico, setDiagnostico] = useState<DiagnosticoItem[]>(
    initialPrefilled ? PREFILLED_DIAGNOSTICO : []
  );

  const [pmp, setPmp] = useState<PmpRotina[]>(
    initialPrefilled ? PREFILLED_PCM_PMP : []
  );

  const [fmea, setFmea] = useState<FmeaItem[]>(
    initialPrefilled ? PREFILLED_PCM_FMEA : []
  );

  const [kpis, setKpis] = useState<KpiMeta[]>(
    initialPrefilled ? PREFILLED_PCM_KPIS : []
  );

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // UI state
  const [loadingAI, setLoadingAI] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const reportRef = useRef<HTMLDivElement | null>(null);

  // Helper to show notifications
  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // State update handlers
  const handleParamChange = (field: keyof PcmParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [
          ...prev,
          {
            name: file.name,
            data: reader.result as string,
            description: `Registro fotográfico da auditoria de campo para conformidade do PCM no ativo ou setor analisado.`
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, val: string) => {
    setUploadedImages(prev => prev.map((img, i) => i === index ? { ...img, description: val } : img));
  };

  // Diagnostico CRUD
  const addDiagnostico = () => {
    setDiagnostico(prev => [
      ...prev,
      {
        id: "diag_" + Date.now(),
        categoria: "Insira a categoria",
        item: "Insira o item a ser avaliado",
        status: "NÃO CONFORME",
        criticidade: "MÉDIA",
        observacao: "Descrição observada in loco...",
        recomendacao: "Medida recomendada na gestão de manutenção..."
      }
    ]);
  };

  const updateDiagnostico = (id: string, field: keyof DiagnosticoItem, val: string) => {
    setDiagnostico(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeDiagnostico = (id: string) => {
    setDiagnostico(prev => prev.filter(item => item.id !== id));
  };

  // PMP CRUD
  const addPmp = () => {
    setPmp(prev => [
      ...prev,
      {
        id: "rot_" + Date.now(),
        equipamento: "Insira o equipamento",
        tag: "VL-TAG-...",
        rotina: "Rotina de preventiva sistemática",
        frequencia: "Mensal",
        procedimento: "Procedimento passo-a-passo detalhado...",
        tempoEstimado: "1 hora",
        executante: "Mecânico"
      }
    ]);
  };

  const updatePmp = (id: string, field: keyof PmpRotina, val: string) => {
    setPmp(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removePmp = (id: string) => {
    setPmp(prev => prev.filter(item => item.id !== id));
  };

  // FMEA CRUD
  const addFmea = () => {
    setFmea(prev => [
      ...prev,
      {
        id: "fmea_" + Date.now(),
        equipamento: "Ativo analisado",
        componente: "Componente gargalo",
        modoFalha: "Modo de falha física",
        efeitoFalha: "Efeito na linha fabril / segurança",
        causaFalha: "Causa física ou operacional",
        severidade: 5,
        ocorrencia: 3,
        deteccao: 4,
        rpn: 60,
        acaoRecomendada: "Substituição preventiva ou calibração..."
      }
    ]);
  };

  const updateFmea = (id: string, field: keyof FmeaItem, val: string | number) => {
    setFmea(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: val } as FmeaItem;
          // Recalculate RPN if any modifier changes
          if (["severidade", "ocorrencia", "deteccao"].includes(field)) {
            updated.rpn = updated.severidade * updated.ocorrencia * updated.deteccao;
          }
          return updated;
        }
        return item;
      });
    });
  };

  const removeFmea = (id: string) => {
    setFmea(prev => prev.filter(item => item.id !== id));
  };

  // KPIs CRUD
  const addKpi = () => {
    setKpis(prev => [
      ...prev,
      {
        id: "kpi_" + Date.now(),
        indicador: "Novo Indicador",
        descricao: "Métrica operacional de confiabilidade...",
        valorAtual: "Não medido",
        meta: "Defina a meta",
        prazo: "30 dias",
        planoAcao: "Ações necessárias para alcance da meta..."
      }
    ]);
  };

  const updateKpi = (id: string, field: keyof KpiMeta, val: string) => {
    setKpis(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeKpi = (id: string) => {
    setKpis(prev => prev.filter(item => item.id !== id));
  };

  // IA Intelligent Auditor trigger
  const runIntelligentPcmAudit = async () => {
    if (!params.clientName || !params.facilityName) {
      showNotification("error", "Preencha ao menos o Nome do Cliente e o Nome da Instalação!");
      return;
    }

    setLoadingAI(true);
    showNotification("info", "Conectando ao SISTEMA PCM da VL ENGENHARIA. Gerando diagnóstico, plano de preventivas, matriz FMEA e painel de indicadores com IA...");

    try {
      const response = await fetch("/api/gemini/pcm-consulting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          laudoNumber: params.laudoNumber,
          clientName: params.clientName,
          cnpj: params.cnpj,
          address: params.address,
          facilityName: params.facilityName,
          facilityDesc: params.facilityDesc,
          totalAssets: params.totalAssets,
          inspectionCity: params.inspectionCity,
          inspectionDate: params.inspectionDate,
          deliveryType: params.deliveryType,
          notes: params.notes,
          normasAdicionais: params.normasAdicionais || "",
          images: uploadedImages.map(img => ({ data: img.data, mimeType: "image/jpeg" }))
        })
      });

      if (!response.ok) {
        throw new Error("Falha técnica no servidor de IA.");
      }

      const data = await response.json();

      if (data) {
        if (data.numero) {
          handleParamChange("laudoNumber", data.numero);
        }

        // Fill Diagnosis
        if (data.diagnostico && Array.isArray(data.diagnostico.matriz_criticidade)) {
          const mappedDiag: DiagnosticoItem[] = data.diagnostico.matriz_criticidade.map((item: any, idx: number) => ({
            id: "diag_ai_" + idx,
            categoria: item.categoria || "Geral",
            item: item.item || "Parâmetro analisado",
            status: item.status || "PARCIAL",
            criticidade: item.critica || "ALTA",
            observacao: item.observacao || "Observado in loco pela IA.",
            recomendacao: item.recomendacao || "Recomendação técnica sugerida."
          }));
          setDiagnostico(mappedDiag);
        }

        // Fill PMP
        if (Array.isArray(data.pmp)) {
          const mappedPmp: PmpRotina[] = data.pmp.map((item: any, idx: number) => ({
            id: "rot_ai_" + idx,
            equipamento: item.equipamento || "Ativo",
            tag: item.tag || "VL-TAG",
            rotina: item.rotina || "Atividade preventiva",
            frequencia: item.frequencia || "Mensal",
            procedimento: item.procedimento || "Procedimento normativo.",
            tempoEstimado: item.tempoEstimado || "30 min",
            executante: item.executante || "Mecânico"
          }));
          setPmp(mappedPmp);
        }

        // Fill FMEA
        if (Array.isArray(data.fmea)) {
          const mappedFmea: FmeaItem[] = data.fmea.map((item: any, idx: number) => ({
            id: "fmea_ai_" + idx,
            equipamento: item.equipamento || params.facilityName,
            componente: item.componente || "Componente",
            modoFalha: item.modo_falha || "Modo de falha",
            efeitoFalha: item.efeito || "Efeito colateral",
            causaFalha: item.causa || "Causa mecânica/elétrica",
            severidade: item.s || 5,
            ocorrencia: item.o || 3,
            deteccao: item.d || 4,
            rpn: (item.s || 5) * (item.o || 3) * (item.d || 4),
            acaoRecomendada: item.acao || "Ação de Confiabilidade"
          }));
          setFmea(mappedFmea);
        }

        // Fill KPIs
        if (data.kpis && Array.isArray(data.kpis.metas_sugeridas)) {
          const mappedKpi: KpiMeta[] = data.kpis.metas_sugeridas.map((item: any, idx: number) => ({
            id: "kpi_ai_" + idx,
            indicador: item.indicador || "KPI",
            descricao: item.descricao || "Descrição do indicador",
            valorAtual: item.valor_atual || "A definir",
            meta: item.meta || "Meta",
            prazo: "90 dias",
            planoAcao: item.acao || "Ação de melhoria"
          }));
          setKpis(mappedKpi);
        }

        showNotification("success", "Plano de Consultoria PCM estruturado com pleno sucesso pela Inteligência Artificial!");
        setActiveTab("diagnostico");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Erro ao executar auditoria por IA. Os dados fictícios de alta fidelidade da VL Engenharia foram aplicados localmente como contingência pericial.");
      // Apply prefilled as fallback
      setDiagnostico(PREFILLED_DIAGNOSTICO);
      setPmp(PREFILLED_PCM_PMP);
      setFmea(PREFILLED_PCM_FMEA);
      setKpis(PREFILLED_PCM_KPIS);
      setActiveTab("diagnostico");
    } finally {
      setLoadingAI(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const triggerDownloadWord = () => {
    if (!reportRef.current) return;
    showNotification("info", "Exportando laudo do PCM para formato Microsoft Word (.doc)...");
    exportToWord(reportRef.current, `Consultoria_PCM_VL_Engenharia_${params.laudoNumber}.doc`);
  };

  const triggerCopyRichText = () => {
    if (!reportRef.current) return;
    const success = copyRichText(reportRef.current);
    if (success) {
      showNotification("success", "Conteúdo do Plano Diretor copiado em formatação rica! Pronto para colar no Google Docs, Word ou e-mail.");
    } else {
      showNotification("error", "Falha ao copiar conteúdo.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer flex items-center gap-1"
            >
              ← Voltar
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#134074]/10 dark:bg-[#4895EF]/10 border border-[#134074]/20 dark:border-[#4895EF]/20 rounded text-xs font-bold font-mono uppercase text-[#134074] dark:text-[#4895EF]">
              PRODUTIVIDADE & CONFIABILIDADE (PCM)
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">SISTEMA VL CONSULTORIA PCM</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runIntelligentPcmAudit}
            disabled={loadingAI}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Brain className={`w-4 h-4 ${loadingAI ? "animate-spin" : "animate-pulse text-amber-200"}`} />
            {loadingAI ? "Processando IA..." : "Gerar PCM com IA"}
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-300" 
            : notification.type === "error"
            ? "bg-red-50 dark:bg-red-950/20 border-red-500/20 text-red-800 dark:text-red-300"
            : "bg-blue-50 dark:bg-blue-950/20 border-blue-500/20 text-blue-800 dark:text-blue-300"
        }`}>
          <Info className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold font-sans">{notification.text}</span>
        </div>
      )}

      {/* Navigation tabs row */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-px scrollbar-thin">
        <button
          onClick={() => setActiveTab("params")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "params" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            <span>1. Parâmetros</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("diagnostico")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "diagnostico" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            <span>2. Diagnóstico</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("pmp")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "pmp" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>3. Plano PMP</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("fmea")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "fmea" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            <span>4. FMEA Confiabilidade</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("kpis")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "kpis" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>5. KPIs & Dashboard</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "images" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Upload className="w-4 h-4" />
            <span>6. Imagens ({uploadedImages.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "pricing" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>7. Precificação</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-3 text-xs font-bold font-sans uppercase border-b-2 transition-all shrink-0 cursor-pointer ml-auto bg-[#134074]/5 dark:bg-[#4895EF]/5 rounded-t-xl ${
            activeTab === "preview" 
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF] bg-[#134074]/10" 
              : "border-transparent text-slate-600 dark:text-slate-300 hover:bg-[#134074]/10"
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>8. Visualizar Plano Diretor</span>
          </div>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-left">
        
        {/* PRECIFICACAO TAB */}
        {activeTab === "pricing" && (
          <div className="space-y-6 animate-fade-in">
            <LaudoPricingTab 
              clientName={params.clientName}
              serviceType="Plano Diretor de Manutenção (PCM)"
              equipmentName={params.plantName || "Planta Industrial"}
            />
          </div>
        )}

        {/* 1. PARAMETERS TAB */}
        {activeTab === "params" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Identificação e Configuração da Consultoria</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Número do Laudo / Relatório</label>
                <input
                  type="text"
                  value={params.laudoNumber}
                  onChange={(e) => handleParamChange("laudoNumber", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Entregável da Consultoria (Escopo)</label>
                <select
                  value={params.deliveryType}
                  onChange={(e) => handleParamChange("deliveryType", e.target.value as any)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                >
                  <option value="A">Entrega A: Diagnóstico Físico e Operacional (Maturidade do PCM)</option>
                  <option value="B">Entrega B: Plano de Manutenção Preventiva (PMP Sistemático)</option>
                  <option value="C">Entrega C: FMEA (Análise de Modos de Falhas Físicas)</option>
                  <option value="D">Entrega D: KPIs & Dashboard de Desempenho Operacional</option>
                  <option value="E">Entrega E: Plano Diretor Completo (Todas as Entregas Combinadas)</option>
                </select>
              </div>


              {/* Seleção de Cliente Pré-cadastrado */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl mb-4">
                <ClientSelector
                  clients={clients}
                  label="Selecionar Cliente Cadastrado"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setParams(prev => ({
                        ...prev,
                        clientName: client.company || client.name,
                        cnpj: client.cnpj_cpf,
                        address: client.address
                      }));
                    }
                  }}
                />
              </div>


              {/* Seleção de Cliente Pré-cadastrado */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl mb-4">
                <ClientSelector
                  clients={clients}
                  label="Selecionar Cliente Cadastrado"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setParams(prev => ({
                        ...prev,
                        clientName: client.company || client.name,
                        cnpj: client.cnpj_cpf,
                        address: client.address
                      }));
                    }
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Razão Social do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Siderúrgica Pernambucana S/A"
                  value={params.clientName}
                  onChange={(e) => handleParamChange("clientName", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">CNPJ</label>
                <input
                  type="text"
                  placeholder="Ex: 12.345.678/0001-90"
                  value={params.cnpj}
                  onChange={(e) => handleParamChange("cnpj", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Endereço da Instalação</label>
                <input
                  type="text"
                  placeholder="Ex: Rodovia BR-101, Km 35, Cabo de Santo Agostinho - PE"
                  value={params.address}
                  onChange={(e) => handleParamChange("address", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Cidade de Inspeção</label>
                <input
                  type="text"
                  value={params.inspectionCity}
                  onChange={(e) => handleParamChange("inspectionCity", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Data do Diagnóstico</label>
                <input
                  type="date"
                  value={params.inspectionDate}
                  onChange={(e) => handleParamChange("inspectionDate", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Nome da Instalação / Setor</label>
                <input
                  type="text"
                  placeholder="Ex: Planta de Ar Comprimido Central e Utilidades"
                  value={params.facilityName}
                  onChange={(e) => handleParamChange("facilityName", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Ativos e Volume Abrangido</label>
                <input
                  type="text"
                  placeholder="Ex: 18 ativos críticos de alta pressão"
                  value={params.totalAssets}
                  onChange={(e) => handleParamChange("totalAssets", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Descrição Detalhada do Sistema / Situação Geral</label>
                <textarea
                  rows={3}
                  placeholder="Descreva as características físicas, os principais equipamentos, os gargalos e as necessidades específicas do cliente..."
                  value={params.facilityDesc}
                  onChange={(e) => handleParamChange("facilityDesc", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-medium text-slate-800 dark:text-white font-sans leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Responsável Técnico / Engenheiro Mecânico</label>
                <input
                  type="text"
                  value={params.pcmAnalyst}
                  onChange={(e) => handleParamChange("pcmAnalyst", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white font-sans"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  rows={2}
                  placeholder="Ex: ABNT NBR ISO 55001, ABNT NBR 5410, ABNT NBR ISO 9001, etc. (Separe por vírgulas)"
                  value={params.normasAdicionais || ""}
                  onChange={(e) => handleParamChange("normasAdicionais", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-medium text-slate-800 dark:text-white font-sans leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Notas Complementares / Instruções Especiais do Projeto</label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionais sobre a equipe local de manutenção, rotinas ou especificações..."
                  value={params.notes}
                  onChange={(e) => handleParamChange("notes", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-medium text-slate-800 dark:text-white font-sans leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 mt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white font-sans uppercase flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-500" />
                Como funciona a IA para a Consultoria em Gestão de Manutenção (PCM)?
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-sans">
                Ao preencher os dados iniciais do cliente e acionar o botão **"Gerar PCM com IA"** na barra superior, nosso motor neural pericial interpretará a descrição da instalação, os desvios cadastrados e as fotos carregadas para redigir autonomamente o diagnóstico de maturidade, as rotinas preventivas de engenharia, a árvore de falhas FMEA matemática e o painel de KPIs críticos.
              </p>
            </div>
          </div>
        )}

        {/* 2. DIAGNOSTICO TAB */}
        {activeTab === "diagnostico" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Diagnóstico de Maturidade Física e Operacional (Maturidade do PCM)</h3>
              </div>
              <button
                onClick={addDiagnostico}
                className="px-3.5 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Parâmetro
              </button>
            </div>

            {diagnostico.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sem parâmetros de diagnóstico cadastrados</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">Cadastre os tópicos avaliados na planta do cliente ou acione "Gerar PCM com IA" para preenchimento profissional autônomo.</p>
                <button
                  onClick={addDiagnostico}
                  className="px-4 py-2 bg-[#134074] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Criar Primeiro Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnostico.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 relative group"
                  >
                    <button
                      onClick={() => removeDiagnostico(item.id)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Macro-Categoria</label>
                        <input
                          type="text"
                          value={item.categoria}
                          onChange={(e) => updateDiagnostico(item.id, "categoria", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Item Avaliado</label>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateDiagnostico(item.id, "item", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Status Pericial</label>
                        <select
                          value={item.status}
                          onChange={(e) => updateDiagnostico(item.id, "status", e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="CONFORME">CONFORME</option>
                          <option value="NÃO CONFORME">NÃO CONFORME</option>
                          <option value="PARCIAL">CONFORME PARCIAL</option>
                          <option value="N/A">NÃO APLICÁVEL</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Criticidade para a Planta</label>
                        <select
                          value={item.criticidade}
                          onChange={(e) => updateDiagnostico(item.id, "criticidade", e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="CRÍTICA">CRÍTICA (Intervenção imediata)</option>
                          <option value="ALTA">ALTA (Curto prazo)</option>
                          <option value="MÉDIA">MÉDIA (Médio prazo)</option>
                          <option value="BAIXA">BAIXA (Ajustes de rotina)</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Situação Observada / Diagnóstico Físico</label>
                        <textarea
                          rows={2}
                          value={item.observacao}
                          onChange={(e) => updateDiagnostico(item.id, "observacao", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Recomendação Técnica VL Engenharia</label>
                        <textarea
                          rows={2}
                          value={item.recomendacao}
                          onChange={(e) => updateDiagnostico(item.id, "recomendacao", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. PMP ROTINES TAB */}
        {activeTab === "pmp" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Plano de Manutenção Preventiva (PMP Sistemático)</h3>
              </div>
              <button
                onClick={addPmp}
                className="px-3.5 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Rotina
              </button>
            </div>

            {pmp.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sem rotinas preventivas cadastradas</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">Cadastre as rotinas periódicas de manutenção mecânica ou elétrica, ou acione a IA para preencher as rotinas sistemáticas recomendadas.</p>
                <button
                  onClick={addPmp}
                  className="px-4 py-2 bg-[#134074] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Criar Primeira Rotina
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pmp.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 relative group"
                  >
                    <button
                      onClick={() => removePmp(item.id)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Equipamento / Ativo</label>
                        <input
                          type="text"
                          value={item.equipamento}
                          onChange={(e) => updatePmp(item.id, "equipamento", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">TAG Física</label>
                        <input
                          type="text"
                          value={item.tag}
                          onChange={(e) => updatePmp(item.id, "tag", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Frequência da Rotina</label>
                        <select
                          value={item.frequencia}
                          onChange={(e) => updatePmp(item.id, "frequencia", e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="Diária">Diária</option>
                          <option value="Semanal">Semanal</option>
                          <option value="Quinzenal">Quinzenal</option>
                          <option value="Mensal">Mensal</option>
                          <option value="Trimestral">Trimestral</option>
                          <option value="Semestral">Semestral</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Duração & Executante</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="30 min"
                            value={item.tempoEstimado}
                            onChange={(e) => updatePmp(item.id, "tempoEstimado", e.target.value)}
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          />
                          <select
                            value={item.executante}
                            onChange={(e) => updatePmp(item.id, "executante", e.target.value as any)}
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          >
                            <option value="Mecânico">Mecânico</option>
                            <option value="Eletricista">Eletricista</option>
                            <option value="Lubrificador">Lubrificador</option>
                            <option value="Operador">Operador</option>
                            <option value="Equipe VL">Equipe VL</option>
                          </select>
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Nome da Rotina / Atividade</label>
                        <input
                          type="text"
                          value={item.rotina}
                          onChange={(e) => updatePmp(item.id, "rotina", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Metodologia de Execução Passo-a-Passo</label>
                        <textarea
                          rows={2}
                          value={item.procedimento}
                          onChange={(e) => updatePmp(item.id, "procedimento", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. FMEA TAB */}
        {activeTab === "fmea" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">FMEA (Failure Mode and Effects Analysis) de Componentes Críticos</h3>
              </div>
              <button
                onClick={addFmea}
                className="px-3.5 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Análise FMEA
              </button>
            </div>

            {fmea.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sem registros FMEA cadastrados</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">Mapeie os modos de falha física dos componentes críticos e calcule o RPN (Número de Prioridade de Risco) ou acione a IA para modelar a matriz FMEA.</p>
                <button
                  onClick={addFmea}
                  className="px-4 py-2 bg-[#134074] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Criar Primeira Linha FMEA
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {fmea.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 relative group"
                  >
                    <button
                      onClick={() => removeFmea(item.id)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Equipamento / Ativo</label>
                        <input
                          type="text"
                          value={item.equipamento}
                          onChange={(e) => updateFmea(item.id, "equipamento", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Componente Físico</label>
                        <input
                          type="text"
                          value={item.componente}
                          onChange={(e) => updateFmea(item.id, "componente", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Modo de Falha Crítico</label>
                        <input
                          type="text"
                          value={item.modoFalha}
                          onChange={(e) => updateFmea(item.id, "modoFalha", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-[#134074] dark:text-[#4895EF] uppercase tracking-wider font-mono">Severidade (S) [1-10]</label>
                          <select
                            value={item.severidade}
                            onChange={(e) => updateFmea(item.id, "severidade", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1} - {i === 9 ? "Parada Completa/Catástrofe" : i === 0 ? "Desprezível" : `Nível ${i+1}`}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-[#134074] dark:text-[#4895EF] uppercase tracking-wider font-mono">Ocorrência (O) [1-10]</label>
                          <select
                            value={item.ocorrencia}
                            onChange={(e) => updateFmea(item.id, "ocorrencia", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1} - {i === 9 ? "Frequente / Diária" : i === 0 ? "Quase Impossível" : `Nível ${i+1}`}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-[#134074] dark:text-[#4895EF] uppercase tracking-wider font-mono">Detecção (D) [1-10]</label>
                          <select
                            value={item.deteccao}
                            onChange={(e) => updateFmea(item.id, "deteccao", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1} - {i === 9 ? "Indetectável / Sem Alarme" : i === 0 ? "Detecção Automática Absoluta" : `Nível ${i+1}`}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col justify-center items-center p-3 bg-[#134074]/5 dark:bg-[#4895EF]/5 rounded-xl border border-[#134074]/10 dark:border-[#4895EF]/10">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">RPN RESULTANTE</span>
                          <span className={`text-2xl font-black font-mono ${
                            item.rpn >= 150 ? "text-red-600" : item.rpn >= 80 ? "text-amber-500" : "text-emerald-500"
                          }`}>
                            {item.rpn}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 font-sans">
                            {item.rpn >= 150 ? "Prioridade Crítica" : item.rpn >= 80 ? "Prioridade Média" : "Prioridade Baixa"}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Efeito da Falha (No Processo Produtivo / Ativos)</label>
                        <input
                          type="text"
                          value={item.efeitoFalha}
                          onChange={(e) => updateFmea(item.id, "efeitoFalha", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Causa Provável da Falha</label>
                        <input
                          type="text"
                          value={item.causaFalha}
                          onChange={(e) => updateFmea(item.id, "causaFalha", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Ação Recomendada (Ação Mitigadora / Preventiva / Engenharia)</label>
                        <textarea
                          rows={2}
                          value={item.acaoRecomendada}
                          onChange={(e) => updateFmea(item.id, "acaoRecomendada", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. KPIS TAB */}
        {activeTab === "kpis" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Mapeamento de KPIs e Metas de Desempenho Operacional</h3>
              </div>
              <button
                onClick={addKpi}
                className="px-3.5 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Indicador
              </button>
            </div>

            {kpis.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sem KPIs cadastrados</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">Defina os indicadores chaves de manutenção (MTBF, MTTR, Custos, Backlog, Disponibilidade, Confiabilidade) ou acione a IA para modelar os KPIs.</p>
                <button
                  onClick={addKpi}
                  className="px-4 py-2 bg-[#134074] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Criar Primeiro KPI
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {kpis.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 relative group"
                  >
                    <button
                      onClick={() => removeKpi(item.id)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Indicador de Desempenho</label>
                        <input
                          type="text"
                          value={item.indicador}
                          onChange={(e) => updateKpi(item.id, "indicador", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Valor Atual Estimado</label>
                        <input
                          type="text"
                          placeholder="Ex: 180 h"
                          value={item.valorAtual}
                          onChange={(e) => updateKpi(item.id, "valorAtual", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Meta Estabelecida & Prazo</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ex: >= 400 h"
                            value={item.meta}
                            onChange={(e) => updateKpi(item.id, "meta", e.target.value)}
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Ex: 90 dias"
                            value={item.prazo}
                            onChange={(e) => updateKpi(item.id, "prazo", e.target.value)}
                            className="w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Descrição Técnica do Indicador</label>
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(e) => updateKpi(item.id, "descricao", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Plano de Ação para Alcançar a Meta</label>
                        <textarea
                          rows={2}
                          value={item.planoAcao}
                          onChange={(e) => updateKpi(item.id, "planoAcao", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. IMAGES TAB */}
        {activeTab === "images" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Upload className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Registro de Evidências Fotográficas de Campo</h3>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50 dark:bg-slate-950/20 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto text-[#134074] dark:text-[#4895EF] mb-3 animate-bounce" />
              <p className="text-sm font-bold text-slate-800 dark:text-white font-sans">Arraste ou Selecione Imagens Técnicas</p>
              <p className="text-xs text-slate-400 mt-1 font-sans">Selecione fotos reais dos ativos, painéis, vazamentos ou ferramentas para o relatório fotográfico</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all cursor-pointer z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
                      <img 
                        src={img.data} 
                        alt={img.name} 
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain" 
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                        Foto {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Legenda Técnica Pericial</label>
                      <textarea
                        rows={2}
                        value={img.description}
                        onChange={(e) => updateImageDescription(idx, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium text-slate-800 dark:text-white leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. PREVIEW TAB (THE CORE WORD/PDF EXPORT PIECE) */}
        {activeTab === "preview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Control Bar inside Preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans uppercase">Visualização da Entrega:</span>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setDocLayout("all")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      docLayout === "all" ? "bg-[#134074] text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Completo
                  </button>
                  <button
                    onClick={() => setDocLayout("diagnostico")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      docLayout === "diagnostico" ? "bg-[#134074] text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Diag. Maturidade
                  </button>
                  <button
                    onClick={() => setDocLayout("pmp")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      docLayout === "pmp" ? "bg-[#134074] text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Plano PMP
                  </button>
                  <button
                    onClick={() => setDocLayout("fmea")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      docLayout === "fmea" ? "bg-[#134074] text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    FMEA Matrix
                  </button>
                  <button
                    onClick={() => setDocLayout("kpis")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      docLayout === "kpis" ? "bg-[#134074] text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Dashboard KPIs
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerCopyRichText}
                  className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Copiar formatado para colar no Docs/Word"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar Formato Rico</span>
                </button>

                <button
                  onClick={triggerDownloadWord}
                  className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-indigo-500" />
                  <span>Download Word</span>
                </button>

                <button
                  onClick={triggerPrint}
                  className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-500" />
                  <span>Imprimir A4</span>
                </button>
              </div>
            </div>

            {/* Document Stage */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 p-4 md:p-8 flex justify-center">
              
              {/* Document Container (Standard A4 Dimensions) */}
              <div 
                ref={reportRef}
                className="bg-white text-slate-950 p-12 w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-slate-200 text-left font-sans text-xs relative"
                style={{ contentVisibility: "auto" }}
                id="printable-area-pcm"
              >
                
                {/* 1. Header VL Engenharia */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
                  <Logo variant="print" className="h-12" />
                  <div className="text-right space-y-1">
                    <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black uppercase rounded">
                      PLANO DIRETOR PCM
                    </span>
                    <p className="text-[8px] font-bold text-slate-500 font-mono m-0">{params.laudoNumber}</p>
                  </div>
                </div>

                {/* 2. Title Block */}
                <div className="space-y-2 mb-8 text-center bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h2 className="text-base font-black tracking-tight font-sans uppercase m-0">
                    {params.deliveryType === "A" && "DIAGNÓSTICO DE MATURIDADE FÍSICA E OPERACIONAL"}
                    {params.deliveryType === "B" && "PLANO DE MANUTENÇÃO PREVENTIVA (PMP SISTEMÁTICO)"}
                    {params.deliveryType === "C" && "FMEA (FAILURE MODE AND EFFECTS ANALYSIS) DE ATIVOS"}
                    {params.deliveryType === "D" && "KPIS & DASHBOARD DE DESEMPENHO OPERACIONAL"}
                    {params.deliveryType === "E" && "PLANO DIRETOR DE GESTÃO DA MANUTENÇÃO (PCM)"}
                  </h2>
                  <p className="text-[9px] text-slate-500 font-mono uppercase m-0">
                    Normas e Conceitos: ABNT NBR ISO 55001, NBR 5462, NBR 5674, RCM & TPM
                  </p>
                </div>

                {/* 3. Client & Facility Info */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">1. Identificação Geral</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">Cliente Contratante</p>
                      <p className="text-[10px] font-bold text-slate-900 m-0 leading-normal">{params.clientName || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">CNPJ</p>
                      <p className="text-[10px] font-bold text-slate-900 m-0 leading-normal">{params.cnpj || "Não informado"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">Endereço Técnico da Planta</p>
                      <p className="text-[10px] font-medium text-slate-900 m-0 leading-normal">{params.address || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">Instalação / Sistema</p>
                      <p className="text-[10px] font-bold text-slate-900 m-0 leading-normal">{params.facilityName || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">Data de Auditoria</p>
                      <p className="text-[10px] font-bold text-slate-900 m-0 leading-normal">{params.inspectionDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono m-0">Descrição Física dos Ativos</p>
                      <p className="text-[10px] font-medium text-slate-900 m-0 leading-relaxed text-justify">{params.facilityDesc || "Não informado"}</p>
                    </div>
                  </div>
                </div>

                {/* 4. SECTIONS FILTERED BY DOC LAYOUT OR DELIVERY TYPE */}
                
                {/* SECTION A: DIAGNOSIS */}
                {(docLayout === "all" || docLayout === "diagnostico") && (params.deliveryType === "A" || params.deliveryType === "E") && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">2. Diagnóstico de Maturidade do PCM</h3>
                    <p className="text-[9.5px] leading-relaxed text-slate-600 text-justify m-0">
                      A auditoria física e lógica foi executada para verificar a aderência das rotinas industriais da empresa frente às melhores práticas de gestão de ativos preconizadas na norma **ABNT NBR ISO 55001** e **NBR 5674**. Segue abaixo a matriz de conformidade e criticidade dos processos:
                    </p>

                    {diagnostico.length === 0 ? (
                      <p className="text-slate-400 italic text-[9px] m-0">Nenhum desvio cadastrado nesta seção.</p>
                    ) : (
                      <table className="w-full border-collapse border border-slate-300 text-[9px] mt-2">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/4">Categoria</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/3">Item Avaliado</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-1/12">Status</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-1/12">Criticidade</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider">Desvios & Recomendações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagnostico.map((item) => (
                            <tr key={item.id}>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900">{item.categoria}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.item}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] ${
                                  item.status === "CONFORME" 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : item.status === "NÃO CONFORME"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">
                                <span className={`text-[8px] ${
                                  item.criticidade === "CRÍTICA" 
                                    ? "text-red-700" 
                                    : item.criticidade === "ALTA"
                                    ? "text-red-500"
                                    : "text-amber-500"
                                }`}>
                                  {item.criticidade}
                                </span>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify leading-relaxed">
                                <p className="m-0 font-bold text-slate-800">Obs: <span className="font-normal text-slate-600">{item.observacao}</span></p>
                                <p className="m-0 font-bold text-indigo-900 mt-1">Recomendação: <span className="font-normal text-slate-600">{item.recomendacao}</span></p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* SECTION B: PMP ROTINES */}
                {(docLayout === "all" || docLayout === "pmp") && (params.deliveryType === "B" || params.deliveryType === "E") && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">3. Plano de Manutenção Preventiva (PMP Sistemático)</h3>
                    <p className="text-[9.5px] leading-relaxed text-slate-600 text-justify m-0">
                      Cronograma e memorial operacional estruturados para garantir a conservação sistemática dos ativos e utilidades da instalação. Focado no cumprimento das especificações dos fabricantes e regulamentos de segurança mecânica:
                    </p>

                    {pmp.length === 0 ? (
                      <p className="text-slate-400 italic text-[9px] m-0">Nenhuma rotina cadastrada nesta seção.</p>
                    ) : (
                      <table className="w-full border-collapse border border-slate-300 text-[9px] mt-2">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/4">Equipamento & TAG</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/4">Nome da Rotina</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-1/12">Freq.</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-1/12">Duração / Exec.</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider">Procedimento Operacional de Execução</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pmp.map((item) => (
                            <tr key={item.id}>
                              <td className="border border-slate-300 px-2 py-1.5">
                                <p className="m-0 font-bold text-slate-900">{item.equipamento}</p>
                                <p className="m-0 font-mono text-[8px] text-slate-400">TAG: {item.tag}</p>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-700 font-bold">{item.rotina}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-[#134074]">{item.frequencia}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center text-[8px] leading-relaxed">
                                <p className="m-0 font-bold text-slate-800">{item.tempoEstimado}</p>
                                <p className="m-0 text-slate-500">[{item.executante}]</p>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify text-slate-600 leading-normal">{item.procedimento}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* SECTION C: FMEA */}
                {(docLayout === "all" || docLayout === "fmea") && (params.deliveryType === "C" || params.deliveryType === "E") && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">4. Matriz FMEA de Engenharia de Confiabilidade</h3>
                    <p className="text-[9.5px] leading-relaxed text-slate-600 text-justify m-0">
                      Análise profunda de Confiabilidade estruturada sob os preceitos da norma **ABNT NBR 5462**. A matriz mapeia os modos de falha física, seus efeitos colaterais na linha e causas, calculando o **RPN (Risk Priority Number)**:
                    </p>

                    {fmea.length === 0 ? (
                      <p className="text-slate-400 italic text-[9px] m-0">Nenhum registro cadastrado nesta seção.</p>
                    ) : (
                      <table className="w-full border-collapse border border-slate-300 text-[9px] mt-2">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/5">Componente / Ativo</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/5">Modo & Causa da Falha</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/4">Efeito Colateral na Planta</th>
                            <th className="border border-slate-300 px-1 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-[120px]">S × O × D = RPN</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider">Ações de Confiabilidade Sugeridas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fmea.map((item) => (
                            <tr key={item.id}>
                              <td className="border border-slate-300 px-2 py-1.5">
                                <p className="m-0 font-bold text-slate-900">{item.componente}</p>
                                <p className="m-0 text-[8px] text-slate-400">Ativo: {item.equipamento}</p>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-600 text-justify leading-relaxed">
                                <p className="m-0 font-bold text-red-600">Modo: <span className="font-normal text-slate-600">{item.modoFalha}</span></p>
                                <p className="m-0 font-bold text-slate-800 mt-1">Causa: <span className="font-normal text-slate-600">{item.causaFalha}</span></p>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-600 text-justify leading-normal">{item.efeitoFalha}</td>
                              <td className="border border-slate-300 px-1 py-1.5 text-center font-mono">
                                <div className="flex justify-center items-center gap-1.5">
                                  <span title="Severidade" className="text-slate-500 font-bold">S:{item.severidade}</span>
                                  <span className="text-slate-300">|</span>
                                  <span title="Ocorrência" className="text-slate-500 font-bold">O:{item.ocorrencia}</span>
                                  <span className="text-slate-300">|</span>
                                  <span title="Detecção" className="text-slate-500 font-bold">D:{item.deteccao}</span>
                                </div>
                                <div className="mt-1">
                                  <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[9px] ${
                                    item.rpn >= 150 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    RPN: {item.rpn}
                                  </span>
                                </div>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify text-indigo-950 font-bold leading-normal">{item.acaoRecomendada}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* SECTION D: KPIS & METAS */}
                {(docLayout === "all" || docLayout === "kpis") && (params.deliveryType === "D" || params.deliveryType === "E") && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">5. KPIs & Dashboard de Gestão Confiabilidade</h3>
                    <p className="text-[9.5px] leading-relaxed text-slate-600 text-justify m-0">
                      Modelagem matemática dos indicadores chaves de desempenho recomendados para o acompanhamento gerencial do cliente. Seguem as metas e prazos de enquadramento sugeridos:
                    </p>

                    {kpis.length === 0 ? (
                      <p className="text-slate-400 italic text-[9px] m-0">Nenhum KPI mapeado nesta seção.</p>
                    ) : (
                      <table className="w-full border-collapse border border-slate-300 text-[9px] mt-2">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/4">Indicador</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider w-1/3">Descrição Técnica</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-[100px]">Atual vs Meta</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-black text-slate-900 uppercase tracking-wider w-1/12">Prazo</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-left font-black text-slate-900 uppercase tracking-wider">Ações Estratégicas Recomendadas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpis.map((item) => (
                            <tr key={item.id}>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold text-[#134074]">{item.indicador}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-600 leading-normal text-justify">{item.descricao}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center leading-normal">
                                <p className="m-0 font-bold text-red-600">Atual: <span className="font-bold">{item.valorAtual}</span></p>
                                <p className="m-0 font-bold text-emerald-600">Meta: <span className="font-bold">{item.meta}</span></p>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-500">{item.prazo}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify text-slate-600 leading-relaxed font-bold">{item.planoAcao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 5. REPORT IMAGES */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4 mb-8 page-break-before">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">6. Anexo de Evidências Fotográficas da Vistoria</h3>
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="border border-slate-200 p-3 rounded-lg space-y-2 flex flex-col justify-between">
                          <div className="aspect-video overflow-hidden bg-black flex items-center justify-center rounded">
                            <img src={img.data} alt={img.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <p className="text-[8.5px] leading-relaxed text-slate-600 text-justify font-sans">
                            <span className="font-bold text-slate-900">Foto {idx + 1}: </span>
                            {img.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. TECHNICAL CONCLUSION */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-200 pb-1 m-0 tracking-wider">
                    {params.deliveryType === "E" ? "7. Parecer Técnico Final e Plano Diretor" : "6. Parecer Técnico de Engenharia"}
                  </h3>
                  <p className="text-[9.5px] leading-relaxed text-slate-600 text-justify m-0">
                    Com base no diagnóstico estruturado e nas análises de risco de confiabilidade, declaramos o sistema de utilidades sob um cronograma de **IMPLANTAÇÃO DE MELHORIAS SISTEMÁTICAS**. Fica formalmente recomendado o início da execução do cronograma de 52 semanas do PMP, treinamento operacional LOTO e parametrização dos KPIs propostos de modo a alinhar a operação com as normas internacionais.
                  </p>

                  {params.deliveryType === "E" && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 mt-2">
                      <p className="text-[9px] font-black uppercase text-[#134074] m-0 tracking-wider">Cronograma de Implantação do Plano Diretor PCM (VL Engenharia)</p>
                      <table className="w-full text-[8.5px] border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-200 px-2 py-1 text-left font-bold text-slate-800">Fase</th>
                            <th className="border border-slate-200 px-2 py-1 text-left font-bold text-slate-800">Escopo da Ação</th>
                            <th className="border border-slate-200 px-2 py-1 text-center font-bold text-slate-800">Prazo Sugerido</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-200 px-2 py-1 font-bold text-slate-900">Fase 1: Recadastro</td>
                            <td className="border border-slate-200 px-2 py-1 text-slate-600">Inventário geral físico e enquadramento lógico de TAGs segundo a ISO 14224.</td>
                            <td className="border border-slate-200 px-2 py-1 text-center font-mono font-bold">D+15 dias</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 px-2 py-1 font-bold text-slate-900">Fase 2: Balanceamento PMP</td>
                            <td className="border border-slate-200 px-2 py-1 text-slate-600">Estruturação e balanceamento de homens-hora (HH) no cronograma de 52 semanas.</td>
                            <td className="border border-slate-200 px-2 py-1 text-center font-mono font-bold">D+30 dias</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 px-2 py-1 font-bold text-slate-900">Fase 3: Mitigação FMEA</td>
                            <td className="border border-slate-200 px-2 py-1 text-slate-600">Aplicação física das ações de Confiabilidade geradas para componentes com RPN alto.</td>
                            <td className="border border-slate-200 px-2 py-1 text-center font-mono font-bold">D+60 dias</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 px-2 py-1 font-bold text-slate-900">Fase 4: Dashboard KPIs</td>
                            <td className="border border-slate-200 px-2 py-1 text-slate-600">Parametrização e início de rodadas mensais de análise de MTBF, MTTR e Backlog.</td>
                            <td className="border border-slate-200 px-2 py-1 text-center font-mono font-bold">D+90 dias</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 7. SIGNATURE SPACE */}
                <div className="mt-16 flex justify-between items-end border-t border-slate-200 pt-8 page-break-inside-avoid">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono m-0">Analista Responsável</p>
                    <p className="text-[10px] font-black text-slate-900 m-0 leading-normal">{params.pcmAnalyst}</p>
                    <p className="text-[8px] text-slate-500 font-sans m-0">VL Engenharia - CREA-PE 1822299490</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[8px] text-slate-400 font-mono uppercase m-0">Documento Auditado com IA</p>
                    <div className="inline-flex items-center gap-1 text-[9px] font-black text-[#134074]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                      <span>VL PERITO DIGITAL V1.5</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
