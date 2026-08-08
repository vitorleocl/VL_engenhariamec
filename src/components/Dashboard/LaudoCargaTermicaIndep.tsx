import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import React, { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { 
  Shield, 
  FileText, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Printer, 
  FileDown, 
  Clipboard, 
  Sparkles, 
  Loader2, 
  Thermometer, 
  Users, 
  Lightbulb, 
  ArrowRight,
  Calculator,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Building,
  Tv,
  Maximize2
} from "lucide-react";
import { exportToWord, copyRichText, preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";
import Logo from "../Logo";
import LaudoPricingTab from "./LaudoPricingTab";
import {
  HVACJanela,
  HVACParede,
  HVACTeto,
  HVACPiso,
  HVACPessoas,
  HVACEquipamentos,
  HVACPortaVao,
  HVACProjetoData,
  INITIAL_HVAC_DATA,
  CIDADES_REFERENCIA,
  FATORES_INSOLACAO,
  FATORES_TRANSMISSAO_VIDRO,
  FATORES_PAREDE,
  FATORES_TETO,
  FATORES_PESSOAS,
  FATORES_PORTA_VAO,
  FATOR_PISO_PILOTIS,
  FATOR_PISO_SOLO,
  TIPO_COMPUTADOR_PADRAO,
  calcularCargaTermica
} from "./hvacData";

interface LaudoCargaTermicaIndepProps {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoCargaTermicaIndep({ onBack, initialPrefilled = false, clients }: LaudoCargaTermicaIndepProps) {
  // Primary state
  const [projeto, setProjeto] = useState<HVACProjetoData>(INITIAL_HVAC_DATA.projeto);
  const [janelas, setJanelas] = useState<HVACJanela[]>(INITIAL_HVAC_DATA.janelas);
  const [paredes, setParedes] = useState<HVACParede[]>(INITIAL_HVAC_DATA.paredes);
  const [teto, setTeto] = useState<HVACTeto>(INITIAL_HVAC_DATA.teto);
  const [piso, setPiso] = useState<HVACPiso>(INITIAL_HVAC_DATA.piso);
  const [pessoas, setPessoas] = useState<HVACPessoas>(INITIAL_HVAC_DATA.pessoas);
  const [equipamentos, setEquipamentos] = useState<HVACEquipamentos>(INITIAL_HVAC_DATA.equipamentos);
  const [portasVaos, setPortasVaos] = useState<HVACPortaVao[]>(INITIAL_HVAC_DATA.portasVaos);

  // AI results state
  const [aiResult, setAiResult] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "pricing" | "preview">("form");

  const reportRef = useRef<HTMLDivElement | null>(null);

  // Auto prefill on mount if requested
  useEffect(() => {
    if (initialPrefilled) {
      handlePrefill();
    }
  }, [initialPrefilled]);

  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Calculations
  const calc = calcularCargaTermica({
    projeto,
    janelas,
    paredes,
    teto,
    piso,
    pessoas,
    equipamentos,
    portasVaos
  });

  // Calculate area and volume dynamically
  const areaCalculada = projeto.comprimento * projeto.largura;
  const volumeCalculado = areaCalculada * projeto.peDireito;

  // Auto update wall window areas and teto/piso area when dimensions change
  useEffect(() => {
    // Teto & Piso dimensions mirror project length & width
    setTeto(prev => ({ ...prev, comprimento: projeto.comprimento, largura: projeto.largura }));
    setPiso(prev => ({ ...prev, comprimento: projeto.comprimento, largura: projeto.largura }));
  }, [projeto.comprimento, projeto.largura]);

  // Form management helpers
  const handleProjetoChange = (field: keyof HVACProjetoData, value: any) => {
    setProjeto(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrefill = () => {
    setProjeto(INITIAL_HVAC_DATA.projeto);
    setJanelas(INITIAL_HVAC_DATA.janelas);
    setParedes(INITIAL_HVAC_DATA.paredes);
    setTeto(INITIAL_HVAC_DATA.teto);
    setPiso(INITIAL_HVAC_DATA.piso);
    setPessoas(INITIAL_HVAC_DATA.pessoas);
    setEquipamentos(INITIAL_HVAC_DATA.equipamentos);
    setPortasVaos(INITIAL_HVAC_DATA.portasVaos);
    setAiResult(null);
    showNotification("success", "Dados de projeto preenchidos com o modelo padrão de referência VL Engenharia.");
  };

  const handleReset = () => {
    setProjeto({
      cliente: "",
      endereco: "",
      cidade: "Recife",
      uf: "PE",
      ambiente: "",
      comprimento: 4,
      largura: 4,
      peDireito: 2.8,
      numeroProjeto: `PHVAC-001/${new Date().getFullYear()}`,
      data: new Date().toISOString().split("T")[0],
      fatorClimaticoManual: null
    });
    setJanelas([]);
    setParedes([
      { id: "p_1", descricao: "Parede Principal", largura: 4, altura: 2.8, areaJanelas: 0, orientacao: "Outras", construcao: "Leve" },
      { id: "p_2", descricao: "Parede Lateral", largura: 4, altura: 2.8, areaJanelas: 0, orientacao: "Outras", construcao: "Leve" }
    ]);
    setTeto({ comprimento: 4, largura: 4, tipo: "entre_andares" });
    setPiso({ comprimento: 4, largura: 4, sobreSolo: true });
    setPessoas({ quantidade: 2, atividade: "normal" });
    setEquipamentos({
      incandescenteW: 0,
      fluorescenteW: 0,
      aparelhosKW: 0,
      motoresHP: 0,
      computadores: []
    });
    setPortasVaos([]);
    setAiResult(null);
    showNotification("info", "Formulários limpos com sucesso.");
  };

  // Dynamic lists handlers
  const addJanela = () => {
    const newJanela: HVACJanela = {
      id: "j_" + Date.now(),
      descricao: `Janela ${janelas.length + 1}`,
      orientacao: "Leste",
      largura: 1.5,
      altura: 1.2,
      protecao: "Proteção Interna",
      tipoVidro: "comum"
    };
    setJanelas([...janelas, newJanela]);
  };

  const removeJanela = (id: string) => {
    setJanelas(janelas.filter(j => j.id !== id));
    // Also clear references in walls
    setParedes(paredes.map(p => ({
      ...p,
      areaJanelas: Math.max(0, p.areaJanelas - 1.8) // generic adjust
    })));
  };

  const updateJanela = (id: string, field: keyof HVACJanela, value: any) => {
    setJanelas(janelas.map(j => j.id === id ? { ...j, [field]: value } : j));
  };

  const addParede = () => {
    const newParede: HVACParede = {
      id: "p_" + Date.now(),
      descricao: `Parede ${paredes.length + 1}`,
      largura: 3.5,
      altura: projeto.peDireito,
      areaJanelas: 0,
      orientacao: "Outras",
      construcao: "Leve"
    };
    setParedes([...paredes, newParede]);
  };

  const removeParede = (id: string) => {
    setParedes(paredes.filter(p => p.id !== id));
  };

  const updateParede = (id: string, field: keyof HVACParede, value: any) => {
    setParedes(paredes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addComputador = () => {
    const newComp = {
      id: "c_" + Date.now(),
      tipo: "desktop_basico" as const,
      quantidade: 1,
      wattsUnitario: 200,
      descricao: `Computador ${equipamentos.computadores.length + 1}`
    };
    setEquipamentos(prev => ({
      ...prev,
      computadores: [...prev.computadores, newComp]
    }));
  };

  const removeComputador = (id: string) => {
    setEquipamentos(prev => ({
      ...prev,
      computadores: prev.computadores.filter(c => c.id !== id)
    }));
  };

  const updateComputador = (id: string, field: string, value: any) => {
    setEquipamentos(prev => {
      const updated = prev.computadores.map(c => {
        if (c.id === id) {
          const u = { ...c, [field]: value };
          if (field === "tipo") {
            const preset = TIPO_COMPUTADOR_PADRAO.find(p => p.tipo === value);
            if (preset) u.wattsUnitario = preset.wattsUnitario;
          }
          return u;
        }
        return c;
      });
      return { ...prev, computadores: updated };
    });
  };

  const addPortaVao = () => {
    const newVao: HVACPortaVao = {
      id: "v_" + Date.now(),
      descricao: `Porta/Vão ${portasVaos.length + 1}`,
      largura: 0.9,
      altura: 2.1
    };
    setPortasVaos([...portasVaos, newVao]);
  };

  const removePortaVao = (id: string) => {
    setPortasVaos(portasVaos.filter(v => v.id !== id));
  };

  const updatePortaVao = (id: string, field: keyof HVACPortaVao, value: any) => {
    setPortasVaos(portasVaos.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  // AI Generation
  const handleAIQuery = async () => {
    setLoadingAI(true);
    showNotification("info", "Consultando o Motor de Auditoria Térmica VL Engenharia com Inteligência Artificial...");
    try {
      const response = await fetch("/api/gemini/hvac-load-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projeto,
          janelas,
          paredes,
          teto,
          piso,
          pessoas,
          equipamentos,
          portasVaos,
          totalBtuCalculado: calc.cargaTotalFinal
        })
      });

      if (!response.ok) throw new Error("Erro na requisição à API Gemini.");
      const data = await response.json();
      setAiResult(data);
      showNotification("success", "Relatório pericial otimizado e chancelado com sucesso pela IA!");
    } catch (err: any) {
      console.error(err);
      showNotification("error", "Não foi possível conectar com o servidor de IA. Modo de simulação ativado.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Export Actions
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloadingPdf(true);
    showNotification("info", "Processando e formatando laudo de dimensionamento técnico...");

    preprocessStylesheets();
    document.body.classList.add("generating-pdf");

    try {
      const element = reportRef.current;
      const opt = {
        margin:       0,
        filename:     `PHVAC_${projeto.cliente.replace(/\s+/g, '_')}.pdf`,
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak:    { mode: ["avoid-all", "css", "legacy"] }
      };

      let exporter = (window as any).html2pdf;
      if (!exporter) {
        // @ts-ignore
        exporter = html2pdf?.default || html2pdf;
      }

      if (typeof exporter !== "function") {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.crossOrigin = "anonymous";
          script.onload = () => {
            exporter = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => reject(new Error("Erro ao carregar a biblioteca de PDF remota."));
          document.body.appendChild(script);
        });
      }

      if (typeof exporter !== "function") {
        throw new Error("A biblioteca html2pdf não pôde ser iniciada.");
      }

      await exporter().set(opt).from(element).save();
      showNotification("success", "Cálculo técnico e dimensionamento oficial baixado com sucesso em PDF!");
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      showNotification("error", `Houve um erro: ${err?.message || err}.`);
    } finally {
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintPDF = () => {
    preprocessStylesheets();
    window.print();
    restoreStylesheets();
  };

  // Recommended Equipment Calculation
  const finalSafetyMargin = calc.cargaTotalFinal * 1.1; // 10% safety margin standard
  const capacitiesList = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000, 60000, 80000, 120000, 150000, 180000];
  const comercialRecomendada = capacitiesList.find(c => c >= finalSafetyMargin) || 180000;
  const isPmocRequired = (comercialRecomendada / 12000) >= 5;

  const handleCopyText = () => {
    copyRichText("phvac-report-container");
    showNotification("success", "Relatório de cálculo copiado para a área de transferência!");
  };

  const handleExportWord = () => {
    exportToWord("phvac-report-container", `PHVAC_${projeto.cliente.replace(/\s+/g, '_')}`);
    showNotification("success", "Documento gerado e baixado no formato Word (.doc) com sucesso!");
  };

  return (
    <div className={`text-left ${isFullscreen ? "fixed inset-0 z-50 bg-slate-100 dark:bg-slate-900 p-6 md:p-8 lg:p-10 overflow-y-auto space-y-6" : "space-y-6"}`}>
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <button 
            onClick={isFullscreen ? () => setIsFullscreen(false) : onBack}
            className="text-xs font-bold text-[#134074] dark:text-[#4895EF] hover:underline mb-1 flex items-center gap-1 cursor-pointer"
          >
            {isFullscreen ? "← Sair do Tela Cheia" : "← Voltar à Central"}
          </button>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Calculator className="w-7 h-7 text-[#134074] dark:text-[#4895EF]" />
            Cálculo de Carga Térmica & Dimensionamento HVAC
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Módulo avançado de engenharia de climatização para dimensionamento, memórias de cálculo detalhadas e emissão de ART.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/15 text-[#134074] dark:text-[#4895EF] border border-[#134074]/25 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? "Sair do Tela Cheia" : "Expandir Tela Cheia"}</span>
          </button>
          <button
            onClick={handlePrefill}
            className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-xl text-xs font-bold transition-all"
          >
            Preencher Exemplo
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            Limpar Campos
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-md transition-all animate-fade-in ${
          notification.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200" :
          notification.type === "error" ? "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200" :
          "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-200"
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
        <button
          onClick={() => setActiveTab("form")}
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer ${
            activeTab === "form"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Formulário & Dimensionamento
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === "pricing"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          Precificação
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer xl:hidden ${
            activeTab === "preview"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Visualizar Memorial (A4)
        </button>
      </div>

      {activeTab === "pricing" ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <LaudoPricingTab 
            clientName={projeto.cliente}
            serviceType="Cálculo de Carga Térmica & Dimensionamento HVAC"
            equipmentName={projeto.nomeAmbiente || "Central de Climatização"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Side: Forms */}
          <div className={`xl:col-span-5 space-y-6 ${activeTab === "preview" ? "hidden xl:block" : ""}`}>
          {/* Card 1: Projeto e Ambiente */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
              <Building className="w-4 h-4" /> Dados de Identificação do Projeto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Seleção de Cliente Pré-cadastrado */}
              <div className="col-span-1 sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                <ClientSelector
                  clients={clients}
                  label="Selecionar Cliente Cadastrado"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setProjeto(prev => ({
                        ...prev,
                        cliente: client.company || client.name,
                        endereco: client.address
                      }));
                    }
                  }}
                />
              </div>


              {/* Seleção de Cliente Pré-cadastrado */}
              <div className="col-span-1 sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                <ClientSelector
                  clients={clients}
                  label="Selecionar Cliente Cadastrado"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setProjeto(prev => ({
                        ...prev,
                        cliente: client.company || client.name,
                        endereco: client.address
                      }));
                    }
                  }}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cliente / Solicitante</label>
                <input
                  type="text"
                  value={projeto.cliente}
                  onChange={(e) => handleProjetoChange("cliente", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  placeholder="Ex: Clínica Bem Estar"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Endereço Completo</label>
                <input
                  type="text"
                  value={projeto.endereco}
                  onChange={(e) => handleProjetoChange("endereco", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  placeholder="Rua, Número, Bairro"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cidade</label>
                <select
                  value={projeto.cidade}
                  onChange={(e) => handleProjetoChange("cidade", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  {CIDADES_REFERENCIA.map(c => (
                    <option key={c.cidade} value={c.cidade}>{c.cidade} ({c.uf})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ambiente Climatizado</label>
                <input
                  type="text"
                  value={projeto.ambiente}
                  onChange={(e) => handleProjetoChange("ambiente", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  placeholder="Ex: Recepção, Sala de Reunião"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Nº do Projeto / Código</label>
                <input
                  type="text"
                  value={projeto.numeroProjeto}
                  onChange={(e) => handleProjetoChange("numeroProjeto", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Data do Cálculo</label>
                <input
                  type="date"
                  value={projeto.data}
                  onChange={(e) => handleProjetoChange("data", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Comprimento (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={projeto.comprimento}
                  onChange={(e) => handleProjetoChange("comprimento", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Largura (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={projeto.largura}
                  onChange={(e) => handleProjetoChange("largura", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pé-direito (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={projeto.peDireito}
                  onChange={(e) => handleProjetoChange("peDireito", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Custo de Energia (R$/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue="0.75"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1 md:col-span-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  placeholder="Ex: ABNT NBR 16401-1, ABNT NBR 16401-2, ASHRAE Standard 55, etc. (Separe por vírgulas)"
                  value={projeto.normasAdicionais || ""}
                  onChange={(e) => handleProjetoChange("normasAdicionais", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Janelas (Insolação e Transmissão) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
              <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" /> Janelas Envidadraçadas (Tipos I e II)
              </h3>
              <button
                onClick={addJanela}
                className="px-2 py-1 bg-[#134074] hover:bg-[#134074]/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Janela
              </button>
            </div>

            {janelas.length === 0 ? (
              <p className="text-xs text-slate-450 italic py-2">Nenhuma janela cadastrada. O ganho por radiação solar direta será considerado nulo.</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-900">
                {janelas.map((j, idx) => (
                  <div key={j.id} className="pt-3 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black font-sans text-slate-700 dark:text-slate-350">
                        {j.descricao}
                      </span>
                      <button
                        onClick={() => removeJanela(j.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Descrição</label>
                        <input
                          type="text"
                          value={j.descricao}
                          onChange={(e) => updateJanela(j.id, "descricao", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Orientação</label>
                        <select
                          value={j.orientacao}
                          onChange={(e) => updateJanela(j.id, "orientacao", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        >
                          <option value="Norte">Norte</option>
                          <option value="Nordeste">Nordeste</option>
                          <option value="Leste">Leste</option>
                          <option value="Sudeste">Sudeste</option>
                          <option value="Sul">Sul (Sem Ganho)</option>
                          <option value="Sudoeste">Sudoeste</option>
                          <option value="Oeste">Oeste</option>
                          <option value="Noroeste">Noroeste</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Proteção</label>
                        <select
                          value={j.protecao}
                          onChange={(e) => updateJanela(j.id, "protecao", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        >
                          <option value="Sem Proteção">Sem Proteção</option>
                          <option value="Proteção Interna">Interna (Cortina)</option>
                          <option value="Proteção Extena">Externa (Brise/Toldo)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Largura (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={j.largura}
                          onChange={(e) => updateJanela(j.id, "largura", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Altura (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={j.altura}
                          onChange={(e) => updateJanela(j.id, "altura", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 font-mono">Tipo de Vidro</label>
                        <select
                          value={j.tipoVidro}
                          onChange={(e) => updateJanela(j.id, "tipoVidro", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                        >
                          <option value="comum">Vidro Comum (210)</option>
                          <option value="duplo_tijolo">Vidro Duplo/Tijolo (105)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Paredes (Tipo III) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
              <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" /> Paredes Internas e Externas (Tipo III)
              </h3>
              <button
                onClick={addParede}
                className="px-2 py-1 bg-[#134074] hover:bg-[#134074]/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Parede
              </button>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-900">
              {paredes.map((p, idx) => (
                <div key={p.id} className="pt-3 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-350">
                      {p.descricao}
                    </span>
                    {paredes.length > 2 && (
                      <button
                        onClick={() => removeParede(p.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Largura (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={p.largura}
                        onChange={(e) => updateParede(p.id, "largura", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Altura (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={p.altura}
                        onChange={(e) => updateParede(p.id, "altura", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Área Janelas (m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={p.areaJanelas}
                        onChange={(e) => updateParede(p.id, "areaJanelas", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Orientação</label>
                      <select
                        value={p.orientacao}
                        onChange={(e) => updateParede(p.id, "orientacao", e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                      >
                        <option value="Outras">Externas out. orientações</option>
                        <option value="Sul">Externas voltadas para o Sul</option>
                        <option value="Interna">Internas (Não climatizados)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Construção</label>
                      <select
                        value={p.construcao}
                        onChange={(e) => updateParede(p.id, "construcao", e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                      >
                        <option value="Leve">Leve (Tijolo furado, drywall)</option>
                        <option value="Pesada">Pesada (Concreto, maciço)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Área Líquida</label>
                      <div className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-500 font-mono">
                        {Math.max(0, p.largura * p.altura - p.areaJanelas).toFixed(1)} m²
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Teto e Piso (Tipos IV e V) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
              <Maximize2 className="w-4 h-4" /> Cobertura & Piso (Tipos IV e V)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Tipo de Teto / Cobertura</label>
                <select
                  value={teto.tipo}
                  onChange={(e) => setTeto(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="laje_exposta">Laje exposta sem proteção (315)</option>
                  <option value="laje_isolada">Laje com isolação ≥ 2,5cm (125)</option>
                  <option value="entre_andares">Laje entre andares climatizados (52)</option>
                  <option value="telhado_isolado">Sob telhado com isolação (72)</option>
                  <option value="telhado_sem_isolado">Sob telhado sem isolação (160)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">O piso está sobre o solo?</label>
                <select
                  value={piso.sobreSolo ? "true" : "false"}
                  onChange={(e) => setPiso(prev => ({ ...prev, sobreSolo: e.target.value === "true" }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="true">Sim (Sem Ganho de Calor - Fator 0)</option>
                  <option value="false">Não (Pilotis, Garagem, etc - Fator 52)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 5: Ocupantes (Tipo VI) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
              <Users className="w-4 h-4" /> Carga Térmica Humana (Tipo VI)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Nº de Ocupantes / Pessoas</label>
                <input
                  type="number"
                  value={pessoas.quantidade}
                  onChange={(e) => setPessoas(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Nível de Atividade Física</label>
                <select
                  value={pessoas.atividade}
                  onChange={(e) => setPessoas(prev => ({ ...prev, atividade: e.target.value as any }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="normal">Normal / Escritório / Loja (630)</option>
                  <option value="intensa">Intensa / Academia / Fábrica (1000)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 6: Iluminação e Aparelhos (Tipo VII) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
              <Lightbulb className="w-4 h-4" /> Iluminação & Equipamentos Elétricos (Tipo VII)
            </h3>
            <div className="grid grid-cols-2 gap-4 pb-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">Lâmpadas Incandescentes (Watts)</label>
                <input
                  type="number"
                  value={equipamentos.incandescenteW}
                  onChange={(e) => setEquipamentos(prev => ({ ...prev, incandescenteW: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">Lâmpadas Fluorescentes (Watts)</label>
                <input
                  type="number"
                  value={equipamentos.fluorescenteW}
                  onChange={(e) => setEquipamentos(prev => ({ ...prev, fluorescenteW: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">Aparelhos Gerais (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={equipamentos.aparelhosKW}
                  onChange={(e) => setEquipamentos(prev => ({ ...prev, aparelhosKW: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">Motores Elétricos (HP)</label>
                <input
                  type="number"
                  step="0.5"
                  value={equipamentos.motoresHP}
                  onChange={(e) => setEquipamentos(prev => ({ ...prev, motoresHP: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-900 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-550 uppercase font-sans">Computadores & Servidores</span>
                <button
                  onClick={addComputador}
                  className="px-2 py-0.5 border border-[#134074]/35 hover:bg-[#134074]/5 text-[#134074] dark:text-[#4895EF] rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Computador
                </button>
              </div>

              {equipamentos.computadores.length === 0 ? (
                <p className="text-[10px] text-slate-450 italic">Nenhum computador cadastrado.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {equipamentos.computadores.map(c => (
                    <div key={c.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                      <select
                        value={c.tipo}
                        onChange={(e) => updateComputador(c.id, "tipo", e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-[11px] font-bold shrink"
                      >
                        <option value="desktop_basico">Desktop Básico (200W)</option>
                        <option value="desktop_gamer">Desktop Gamer (400W)</option>
                        <option value="notebook">Notebook (65W)</option>
                        <option value="servidor_rack">Servidor Rack (500W)</option>
                        <option value="led">Monitor LED (25W)</option>
                      </select>
                      <input
                        type="number"
                        value={c.quantidade}
                        onChange={(e) => updateComputador(c.id, "quantidade", parseInt(e.target.value) || 1)}
                        className="w-12 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-[11px] font-mono text-center font-bold"
                        placeholder="Qtd"
                        title="Quantidade"
                      />
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">x {c.wattsUnitario}W</span>
                      <button
                        onClick={() => removeComputador(c.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg shrink-0 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 7: Vãos Abertos (Tipo VIII) */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
              <h3 className="text-xs font-black text-[#134074] dark:text-[#4895EF] tracking-wider uppercase flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" /> Vãos e Portas Abertas (Tipo VIII)
              </h3>
              <button
                onClick={addPortaVao}
                className="px-2 py-1 bg-[#134074] hover:bg-[#134074]/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Vão
              </button>
            </div>

            {portasVaos.length === 0 ? (
              <p className="text-xs text-slate-450 italic py-1">Nenhum vão ou abertura livre constante cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {portasVaos.map(v => (
                  <div key={v.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                    <input
                      type="text"
                      value={v.descricao}
                      onChange={(e) => updatePortaVao(v.id, "descricao", e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-[11px] grow"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={v.largura}
                      onChange={(e) => updatePortaVao(v.id, "largura", parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-[11px] text-center"
                      placeholder="L (m)"
                      title="Largura"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={v.altura}
                      onChange={(e) => updatePortaVao(v.id, "altura", parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-[11px] text-center"
                      placeholder="H (m)"
                      title="Altura"
                    />
                    <button
                      onClick={() => removePortaVao(v.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Audit Activation Panel */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#4895EF]/20 border border-[#4895EF]/30 rounded-full text-[#4895EF] text-[9px] font-black tracking-wider uppercase font-mono">
                Inteligência Artificial Ativa
              </span>
              <h4 className="text-sm font-black font-sans text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Consultoria Técnica de Climatização
              </h4>
              <p className="text-slate-350 text-[11px] leading-relaxed font-sans">
                Gere análises térmicas sob medida, indicações comerciais precisas e estimativas de consumo com recomendações de infraestrutura validadas pelo motor de IA.
              </p>
            </div>
            <button
              onClick={handleAIQuery}
              disabled={loadingAI}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4895EF] hover:bg-[#4895EF]/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#4895EF]/10"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando Dimensionamento...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" /> Otimizar Dimensionamento com IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Report Preview */}
        <div className={`xl:col-span-7 space-y-4 ${activeTab === "form" ? "hidden xl:block" : ""}`}>
          {/* Controls Bar for Preview */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 font-mono uppercase tracking-wider">
              PRÉ-VISUALIZAÇÃO DO RELATÓRIO TÉCNICO A4
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-800 cursor-pointer"
                title="Copiar texto formatado"
              >
                <Clipboard className="w-4 h-4" /> Copiar Texto
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all border border-blue-500 shadow-sm shadow-blue-500/10 cursor-pointer"
                title="Exportar para Microsoft Word"
              >
                <FileDown className="w-4 h-4" /> Baixar Word
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all border border-rose-500 shadow-sm shadow-rose-500/10 cursor-pointer"
                title="Exportar em formato PDF de alta resolução"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" /> Exportar PDF
                  </>
                )}
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>

          {/* Paper View Container */}
          <div className="bg-slate-200 dark:bg-slate-900 rounded-3xl p-4 sm:p-8 max-h-[1400px] overflow-y-auto shadow-inner border border-slate-300 dark:border-slate-800">
            {/* Embedded A4 Sheet */}
            <div 
              ref={reportRef}
              id="phvac-report-container"
              className="bg-white text-slate-950 p-[20mm] mx-auto shadow-2xl max-w-[210mm] min-h-[297mm] font-sans text-[11px] leading-relaxed relative print:p-10 print:shadow-none"
              style={{ boxSizing: "border-box" }}
            >
              
              {/* PAGE 1: COVER */}
              <div className="space-y-12 min-h-[250mm] flex flex-col justify-between">
                {/* Header branding */}
                <div className="flex justify-between items-center border-b-2 border-[#134074] pb-4">
                  <Logo variant="print" className="h-12" />
                  <div className="text-right text-[8px] font-mono text-slate-500 uppercase">
                    <div>PHVAC — Carga Térmica</div>
                    <div>Rev. 00 — Confidencial</div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="text-center space-y-4 my-auto py-12">
                  <div className="inline-block p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm mb-4">
                    <Calculator className="w-16 h-16 text-[#134074]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug uppercase">
                    Relatório Técnico de Cálculo de Carga Térmica
                  </h2>
                  <p className="text-xs text-[#134074] font-bold font-mono tracking-wider uppercase">
                    DIMENSIONAMENTO TÉCNICO DE SISTEMA DE CLIMATIZAÇÃO
                  </p>
                  <div className="w-24 h-1.5 bg-[#134074] mx-auto rounded-full mt-4"></div>
                </div>

                {/* Metadata & Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-150 text-left">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">Identificação do Projeto</h3>
                    <div className="space-y-1 text-xs">
                      <p><strong>Nº do Projeto:</strong> {projeto.numeroProjeto || "PHVAC-087/2026"} Rev. 00</p>
                      <p><strong>Cliente:</strong> {projeto.cliente || "Clínica Médica Bem Estar Ltda"}</p>
                      <p><strong>Local:</strong> {projeto.endereco || "Recife, PE"}</p>
                      <p><strong>Ambiente:</strong> {projeto.ambiente || "Sala de Espera Principal"}</p>
                      <p><strong>Data de Emissão:</strong> {projeto.data}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">Responsável Técnico</h3>
                    <div className="space-y-1 text-xs text-slate-700">
                      <p className="font-bold text-slate-900">Eng. Mecânico Vitor Leonardo</p>
                      <p>CREA-PE: 1822299490</p>
                      <p>VL Engenharia</p>
                      <p>E-mail: vitorleonardocl@gmail.com</p>
                      <p>Telefone: (81) 98444-2592</p>
                    </div>
                  </div>
                </div>

                {/* Footer block */}
                <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-4 font-mono uppercase">
                  VL Engenharia Ltda • Recife, Pernambuco, Brasil • {new Date().getFullYear()}
                </div>
              </div>

              {/* Force page break for html2pdf */}
              <div className="html2pdf__page-break"></div>

              {/* PAGE 2: SEÇÃO 1, 2, 3 */}
              <div className="space-y-6 pt-10 text-left">
                {/* SECTION 1 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 1 — INTRODUÇÃO E OBJETIVO
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Este documento pericial apresenta a memória descritiva, análise física e cálculo matemático detalhado de carga térmica para dimensionamento e especificação técnica do sistema de climatização artificial para o ambiente <strong>"{projeto.ambiente}"</strong> do cliente <strong>"{projeto.cliente}"</strong>. 
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    A metodologia empregada fundamenta-se estritamente no <strong>Método Simplificado de Fatores de Ganho de Calor</strong> (conforme planilha de referência VL Engenharia). Os cálculos foram conduzidos sob o escopo e as diretrizes regulamentares vigentes, englobando as seguintes normas reguladoras brasileiras e referências internacionais:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-600 pl-2 space-y-1">
                    <li><strong>ABNT NBR 16401-1:2008</strong> — Instalações de ar-condicionado — Projetos e Parâmetros de Conforto Térmico;</li>
                    <li><strong>ABNT NBR 16401-3:2008</strong> — Qualidade do ar interior e requisitos de renovação mecânica mínima;</li>
                    <li><strong>ASHRAE Fundamentals Handbook</strong> — Cooling Load Calculations and Factors Method;</li>
                    <li><strong>Portaria MS 3.523/1998 e Lei Federal 13.589/2018</strong> — Regulamentação e obrigatoriedade do Plano de PMOC.</li>
                  </ul>
                </div>

                {/* SECTION 2 */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 2 — DADOS DIMENSIONAIS DO AMBIENTE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Área Útil de Piso</p>
                      <p className="text-lg font-black text-slate-800">{areaCalculada.toFixed(2)} m²</p>
                      <p className="text-[9px] text-slate-400 font-mono">{projeto.comprimento}m x {projeto.largura}m</p>
                    </div>
                    <div className="space-y-0.5 text-center sm:text-left border-y sm:border-y-0 sm:border-x border-slate-200 py-2 sm:py-0 sm:px-4">
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Pé-direito Médio</p>
                      <p className="text-lg font-black text-slate-800">{projeto.peDireito.toFixed(2)} m</p>
                      <p className="text-[9px] text-slate-400 font-mono">Do piso acabado ao forro</p>
                    </div>
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Volume Interno Total</p>
                      <p className="text-lg font-black text-slate-800">{volumeCalculado.toFixed(2)} m³</p>
                      <p className="text-[9px] text-slate-400 font-mono">Volume volumétrico de cálculo</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3 */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 3 — MEMÓRIA DE CÁLCULO DETALHADA (OS 8 TIPOS DE GANHO)
                  </h3>
                  
                  {/* TIPO I: JANELAS - INSOLAÇÃO */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#134074] text-[10px] uppercase">3.1 Janelas — Ganho por Radiação Solar Direta (Tipo I)</p>
                    <table className="w-full border-collapse border border-slate-200 text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                          <th className="border p-1.5 text-left font-bold">Identificação / Janela</th>
                          <th className="border p-1.5 text-center font-bold">Orientação</th>
                          <th className="border p-1.5 text-center font-bold">Dimensão (L x H)</th>
                          <th className="border p-1.5 text-center font-bold">Área (m²)</th>
                          <th className="border p-1.5 text-left font-bold">Proteção</th>
                          <th className="border p-1.5 text-right font-bold">Fator</th>
                          <th className="border p-1.5 text-right font-bold">BTU/h</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calc.listTipoI.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="border p-1.5 text-center text-slate-400 italic">Nenhuma janela com incidência solar direta registrada.</td>
                          </tr>
                        ) : (
                          calc.listTipoI.map(j => (
                            <tr key={j.id}>
                              <td className="border p-1.5">{j.descricao}</td>
                              <td className="border p-1.5 text-center font-semibold">{j.orientacao}</td>
                              <td className="border p-1.5 text-center font-mono">{j.largura.toFixed(1)}m x {j.altura.toFixed(1)}m</td>
                              <td className="border p-1.5 text-center font-mono">{j.area.toFixed(2)} m²</td>
                              <td className="border p-1.5">{j.protecao}</td>
                              <td className="border p-1.5 text-right font-mono">{j.fator}</td>
                              <td className="border p-1.5 text-right font-mono font-bold">{j.btu.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-slate-50 font-bold border-t border-slate-300">
                          <td colSpan={6} className="border p-1.5 text-right uppercase">Subtotal Tipo I (Insolação):</td>
                          <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.subtotalTipoI.toLocaleString()} BTU/h</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* TIPO II: JANELAS - TRANSMISSÃO */}
                  <div className="space-y-1.5 pt-1">
                    <p className="font-bold text-[#134074] text-[10px] uppercase">3.2 Janelas — Ganho por Condução do Vidro (Tipo II)</p>
                    <table className="w-full border-collapse border border-slate-200 text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                          <th className="border p-1.5 text-left font-bold">Vão Envidraçado</th>
                          <th className="border p-1.5 text-center font-bold">Área (m²)</th>
                          <th className="border p-1.5 text-left font-bold">Especificação de Vidro</th>
                          <th className="border p-1.5 text-right font-bold">Fator de Transmissão</th>
                          <th className="border p-1.5 text-right font-bold">BTU/h</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calc.listTipoII.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="border p-1.5 text-center text-slate-400 italic">Sem janelas cadastradas.</td>
                          </tr>
                        ) : (
                          calc.listTipoII.map(j => (
                            <tr key={j.id}>
                              <td className="border p-1.5">{j.descricao}</td>
                              <td className="border p-1.5 text-center font-mono">{j.area.toFixed(2)} m²</td>
                              <td className="border p-1.5">{j.tipoVidro === "comum" ? "Vidro Comum Monolítico" : "Vidro Duplo / Tijolo de Vidro"}</td>
                              <td className="border p-1.5 text-right font-mono">{j.fator}</td>
                              <td className="border p-1.5 text-right font-mono font-bold">{j.btu.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-slate-50 font-bold border-t border-slate-300">
                          <td colSpan={4} className="border p-1.5 text-right uppercase">Subtotal Tipo II (Transmissão):</td>
                          <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.subtotalTipoII.toLocaleString()} BTU/h</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* Force page break for html2pdf */}
              <div className="html2pdf__page-break"></div>

              {/* PAGE 3: TIPO III, IV, V, VI, VII, VIII */}
              <div className="space-y-6 pt-10 text-left">
                
                {/* TIPO III: PAREDES */}
                <div className="space-y-1.5">
                  <p className="font-bold text-[#134074] text-[10px] uppercase">3.3 Paredes — Ganho por Condução Estrutural (Tipo III)</p>
                  <table className="w-full border-collapse border border-slate-200 text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                        <th className="border p-1.5 text-left font-bold">Parede Descritiva</th>
                        <th className="border p-1.5 text-center font-bold">Orientação</th>
                        <th className="border p-1.5 text-center font-bold">Área Bruta</th>
                        <th className="border p-1.5 text-center font-bold">Desconto Vãos</th>
                        <th className="border p-1.5 text-center font-bold">Área Líquida</th>
                        <th className="border p-1.5 text-left font-bold">Construção</th>
                        <th className="border p-1.5 text-right font-bold">Fator</th>
                        <th className="border p-1.5 text-right font-bold">BTU/h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.listTipoIII.map(p => (
                        <tr key={p.id}>
                          <td className="border p-1.5">{p.descricao}</td>
                          <td className="border p-1.5 text-center">{p.orientacao === "Sul" ? "Sul" : p.orientacao === "Interna" ? "Interna" : "Outras"}</td>
                          <td className="border p-1.5 text-center font-mono">{p.areaTotal.toFixed(1)} m²</td>
                          <td className="border p-1.5 text-center font-mono text-rose-600">{p.areaJanelas > 0 ? `-${p.areaJanelas.toFixed(1)} m²` : "0"}</td>
                          <td className="border p-1.5 text-center font-mono font-bold">{p.areaLiquida.toFixed(1)} m²</td>
                          <td className="border p-1.5">{p.construcao === "Leve" ? "Leve (Tijolo furado)" : "Pesada (Concreto)"}</td>
                          <td className="border p-1.5 text-right font-mono">{p.fator}</td>
                          <td className="border p-1.5 text-right font-mono font-bold">{p.btu.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={7} className="border p-1.5 text-right uppercase">Subtotal Tipo III (Paredes):</td>
                        <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.subtotalTipoIII.toLocaleString()} BTU/h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TIPO IV E V: TETO E PISO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#134074] text-[10px] uppercase">3.4 Teto — Cobertura Térmica (Tipo IV)</p>
                    <table className="w-full border-collapse border border-slate-200 text-[10px]">
                      <tbody>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold w-1/3">Tipo Teto</td>
                          <td className="border p-2 uppercase text-[#134074]">
                            {teto.tipo === "laje_exposta" ? "Laje Exposta sem Isolação" :
                             teto.tipo === "laje_isolada" ? "Laje com Isolação (>= 2.5cm)" :
                             teto.tipo === "entre_andares" ? "Entre andares climatizados" :
                             teto.tipo === "telhado_isolado" ? "Sob telhado com isolamento" :
                             "Sob telhado sem isolamento"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold">Cálculo Área</td>
                          <td className="border p-2 font-mono">{calc.areaTeto.toFixed(1)} m² ({teto.comprimento}m x {teto.largura}m)</td>
                        </tr>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold">Fator Térmico</td>
                          <td className="border p-2 font-mono font-semibold">{calc.fatorTeto} BTU/h·m²</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="border p-2 text-right text-slate-500 uppercase">Subtotal Teto:</td>
                          <td className="border p-2 font-mono font-black text-[#134074]">{calc.btuTeto.toLocaleString()} BTU/h</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-[#134074] text-[10px] uppercase">3.5 Piso — Fundações e Pilotis (Tipo V)</p>
                    <table className="w-full border-collapse border border-slate-200 text-[10px]">
                      <tbody>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold w-1/3">Configuração</td>
                          <td className="border p-2 uppercase text-[#134074]">
                            {piso.sobreSolo ? "Colocado sobre o Solo (Fator 0)" : "Piso elevado (Sob pilotis, garagem, etc)"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold">Cálculo Área</td>
                          <td className="border p-2 font-mono">{calc.areaPiso.toFixed(1)} m² ({piso.comprimento}m x {piso.largura}m)</td>
                        </tr>
                        <tr>
                          <td className="border p-2 bg-slate-50 font-bold">Fator Aplicado</td>
                          <td className="border p-2 font-mono font-semibold">{calc.fatorPiso} BTU/h·m²</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="border p-2 text-right text-slate-500 uppercase">Subtotal Piso:</td>
                          <td className="border p-2 font-mono font-black text-[#134074]">{calc.btuPiso.toLocaleString()} BTU/h</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TIPO VI: PESSOAS (METABÓLICO) */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-bold text-[#134074] text-[10px] uppercase">3.6 Pessoas — Carga Térmica Humana (Tipo VI)</p>
                  <table className="w-full border-collapse border border-slate-200 text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                        <th className="border p-1.5 text-left font-bold">Tipo de Atividade</th>
                        <th className="border p-1.5 text-center font-bold">Quantidade (Nº)</th>
                        <th className="border p-1.5 text-right font-bold">Fator por Pessoa</th>
                        <th className="border p-1.5 text-right font-bold">BTU/h</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-1.5 uppercase font-semibold">
                          {pessoas.atividade === "normal" ? "Atividade Normal (Escritório, Residencial, Consultórios)" : "Atividade Física Intensa (Academia de Ginástica, Fábrica)"}
                        </td>
                        <td className="border p-1.5 text-center font-mono font-bold text-slate-800">{pessoas.quantidade}</td>
                        <td className="border p-1.5 text-right font-mono">{calc.fatorPessoas} BTU/h por pessoa</td>
                        <td className="border p-1.5 text-right font-mono font-bold text-[#134074]">{calc.btuPessoas.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={3} className="border p-1.5 text-right uppercase">Subtotal Tipo VI (Pessoas):</td>
                        <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.btuPessoas.toLocaleString()} BTU/h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TIPO VII: ILUMINAÇÃO E EQUIPAMENTOS */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-bold text-[#134074] text-[10px] uppercase">3.7 Iluminação e Aparelhos Elétricos (Tipo VII)</p>
                  <table className="w-full border-collapse border border-slate-200 text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                        <th className="border p-1.5 text-left font-bold">Fonte de Equipamento</th>
                        <th className="border p-1.5 text-center font-bold">Potência de Entrada</th>
                        <th className="border p-1.5 text-right font-bold">Fator de Carga</th>
                        <th className="border p-1.5 text-right font-bold">BTU/h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipamentos.incandescenteW > 0 && (
                        <tr>
                          <td className="border p-1.5">Lâmpadas Incandescentes</td>
                          <td className="border p-1.5 text-center font-mono">{equipamentos.incandescenteW} W</td>
                          <td className="border p-1.5 text-right font-mono">4 BTU/h·W</td>
                          <td className="border p-1.5 text-right font-mono">{calc.btuIncandescente.toLocaleString()}</td>
                        </tr>
                      )}
                      {equipamentos.fluorescenteW > 0 && (
                        <tr>
                          <td className="border p-1.5">Lâmpadas Fluorescentes / Reatores</td>
                          <td className="border p-1.5 text-center font-mono">{equipamentos.fluorescenteW} W</td>
                          <td className="border p-1.5 text-right font-mono">2 BTU/h·W</td>
                          <td className="border p-1.5 text-right font-mono">{calc.btuFluorescente.toLocaleString()}</td>
                        </tr>
                      )}
                      {equipamentos.aparelhosKW > 0 && (
                        <tr>
                          <td className="border p-1.5">Aparelhos Elétricos de Uso Geral</td>
                          <td className="border p-1.5 text-center font-mono">{equipamentos.aparelhosKW} kW</td>
                          <td className="border p-1.5 text-right font-mono">860 BTU/h·kW</td>
                          <td className="border p-1.5 text-right font-mono">{calc.btuAparelhos.toLocaleString()}</td>
                        </tr>
                      )}
                      {equipamentos.motoresHP > 0 && (
                        <tr>
                          <td className="border p-1.5">Motores Elétricos Dedicados</td>
                          <td className="border p-1.5 text-center font-mono">{equipamentos.motoresHP} HP</td>
                          <td className="border p-1.5 text-right font-mono">645 BTU/h·HP</td>
                          <td className="border p-1.5 text-right font-mono">{calc.btuMotores.toLocaleString()}</td>
                        </tr>
                      )}
                      {calc.listComputadoresCalculated.map(c => (
                        <tr key={c.id}>
                          <td className="border p-1.5">Computador: {c.descricao}</td>
                          <td className="border p-1.5 text-center font-mono">{c.quantidade} Unidades x {c.wattsUnitario}W</td>
                          <td className="border p-1.5 text-right font-mono">3,412 BTU/h·W</td>
                          <td className="border p-1.5 text-right font-mono">{c.btu.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={3} className="border p-1.5 text-right uppercase">Subtotal Tipo VII (Equipamentos):</td>
                        <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.btuTipoVII.toLocaleString()} BTU/h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TIPO VIII: PORTAS E VÃOS */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-bold text-[#134074] text-[10px] uppercase">3.8 Portas ou Vãos Abertos Permanentes (Tipo VIII)</p>
                  <table className="w-full border-collapse border border-slate-200 text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                        <th className="border p-1.5 text-left font-bold">Descrição da Abertura</th>
                        <th className="border p-1.5 text-center font-bold">Dimensão (L x H)</th>
                        <th className="border p-1.5 text-center font-bold">Área (m²)</th>
                        <th className="border p-1.5 text-right font-bold">Fator</th>
                        <th className="border p-1.5 text-right font-bold">BTU/h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.listTipoVIII.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="border p-1.5 text-center text-slate-400 italic">Nenhuma abertura constante para corredor ou ambiente externo cadastrada.</td>
                        </tr>
                      ) : (
                        calc.listTipoVIII.map(v => (
                          <tr key={v.id}>
                            <td className="border p-1.5">{v.descricao}</td>
                            <td className="border p-1.5 text-center font-mono">{v.largura.toFixed(1)}m x {v.altura.toFixed(1)}m</td>
                            <td className="border p-1.5 text-center font-mono">{v.area.toFixed(2)} m²</td>
                            <td className="border p-1.5 text-right font-mono">{v.fator}</td>
                            <td className="border p-1.5 text-right font-mono font-bold">{v.btu.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={4} className="border p-1.5 text-right uppercase">Subtotal Tipo VIII (Aberturas):</td>
                        <td className="border p-1.5 text-right font-mono font-black text-[#134074]">{calc.subtotalTipoVIII.toLocaleString()} BTU/h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Force page break for html2pdf */}
              <div className="html2pdf__page-break"></div>

              {/* PAGE 4: QUADRO RESUMO E DIMENSIONAMENTO */}
              <div className="space-y-6 pt-10 text-left">
                {/* SECTION 4 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 4 — QUADRO RESUMO DA CARGA TÉRMICA
                  </h3>
                  <table className="w-full border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-[#134074] text-white">
                        <th className="border p-2 text-center font-bold w-12">Nº</th>
                        <th className="border p-2 text-left font-bold">Origem / Fonte de Calor</th>
                        <th className="border p-2 text-right font-bold w-36">Carga Frigorífica (BTU/h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">1</td>
                        <td className="border p-1.5 font-sans">Janelas — Radiação Solar / Insolação (Tipo I)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.subtotalTipoI.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">2</td>
                        <td className="border p-1.5 font-sans">Janelas — Condução do Vidro (Tipo II)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.subtotalTipoII.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">3</td>
                        <td className="border p-1.5 font-sans">Paredes — Condução Térmica (Tipo III)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.subtotalTipoIII.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">4</td>
                        <td className="border p-1.5 font-sans">Teto — Condução da Cobertura (Tipo IV)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.btuTeto.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">5</td>
                        <td className="border p-1.5 font-sans">Piso — Condução da Fundação / Pilotis (Tipo V)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.btuPiso.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">6</td>
                        <td className="border p-1.5 font-sans">Pessoas — Calor Metabólico Acumulado (Tipo VI)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.btuPessoas.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">7</td>
                        <td className="border p-1.5 font-sans">Iluminação e Aparelhos Elétricos (Tipo VII)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.btuTipoVII.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border p-1.5 text-center font-mono">8</td>
                        <td className="border p-1.5 font-sans">Aberturas, Portas ou Vãos Livres (Tipo VIII)</td>
                        <td className="border p-1.5 text-right font-mono">{calc.subtotalTipoVIII.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={2} className="border p-2 text-right uppercase text-slate-600">Subtotal de Carga Líquida:</td>
                        <td className="border p-2 text-right font-mono text-slate-800">{calc.subtotalGeral.toLocaleString()} BTU/h</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold border-y border-slate-300">
                        <td colSpan={2} className="border p-2 text-right uppercase text-[#134074]">Fator Climático Regional da Instalação:</td>
                        <td className="border p-2 text-right font-mono font-bold text-[#134074]">x {calc.fatorClimatico.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-[#134074]/5 font-black text-[#134074] border-t-2 border-[#134074]">
                        <td colSpan={2} className="border p-2.5 text-right uppercase">CARGA TÉRMICA FINAL CONVALIDADA:</td>
                        <td className="border p-2.5 text-right font-mono text-base font-black">{Math.round(calc.cargaTotalFinal).toLocaleString()} BTU/h</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Conversions display */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 text-center font-mono text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Carga em TR</p>
                      <p className="text-sm font-bold text-slate-800">{(calc.cargaTotalFinal / 12000).toFixed(2)} TR</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Carga em kW</p>
                      <p className="text-sm font-bold text-slate-800">{(calc.cargaTotalFinal / 3412).toFixed(2)} kW</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Carga em kcal/h</p>
                      <p className="text-sm font-bold text-slate-800">{(calc.cargaTotalFinal / 3.968).toFixed(0)} kcal/h</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 5 */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 5 — SELEÇÃO DE CAPACIDADE E EQUIPAMENTOS COMERCIAIS
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p>
                      Com base no método dos fatores e na margem regulamentar de segurança recomendada de <strong>10% a 15%</strong> (a fim de suportar flutuações sazonais extremas de temperatura no município de <strong>{projeto.cidade}</strong>), estabelece-se o seguinte dimensionamento de mercado:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                      <li><strong>Carga Térmica de Cálculo:</strong> {Math.round(calc.cargaTotalFinal).toLocaleString()} BTU/h ({(calc.cargaTotalFinal/12000).toFixed(2)} TR)</li>
                      <li><strong>Margem de Engenharia Recomendada (10%):</strong> {Math.round(calc.cargaTotalFinal * 0.1).toLocaleString()} BTU/h</li>
                      <li><strong>Carga com Margem Adulterada:</strong> {Math.round(finalSafetyMargin).toLocaleString()} BTU/h</li>
                      <li><strong>CAPACIDADE NOMINAL COMERCIAL SUGERIDA:</strong> <strong className="text-[#134074] font-black text-sm">{comercialRecomendada.toLocaleString()} BTU/h ({(comercialRecomendada/12000).toFixed(1)} TR)</strong></li>
                    </ul>

                    {/* Options Table */}
                    <table className="w-full border-collapse border border-slate-200 text-[10px] mt-2">
                      <thead>
                        <tr className="bg-slate-50 text-[#134074] border-b border-slate-200">
                          <th className="border p-2 text-center font-bold w-12">Opção</th>
                          <th className="border p-2 text-left font-bold">Tipo de Equipamento</th>
                          <th className="border p-2 text-center font-bold">Capacidade Comercial</th>
                          <th className="border p-2 text-left font-bold">Tensão Recomendada</th>
                          <th className="border p-2 text-left font-bold">Principais Marcas Líderes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiResult && aiResult.opcoesEquipamentos ? (
                          aiResult.opcoesEquipamentos.map((o: any, idx: number) => (
                            <tr key={idx}>
                              <td className="border p-2 text-center font-bold">{o.opcao}</td>
                              <td className="border p-2"><strong>{o.tipo}</strong></td>
                              <td className="border p-2 text-center font-mono font-bold">{o.capacidade}</td>
                              <td className="border p-2">{o.tensao}</td>
                              <td className="border p-2 font-medium">{o.marcaRecomendada}</td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr>
                              <td className="border p-2 text-center font-bold">1</td>
                              <td className="border p-2"><strong>{comercialRecomendada <= 36000 ? "Split Cassete Inverter" : "Split Piso-Teto Inverter"}</strong></td>
                              <td className="border p-2 text-center font-mono font-bold">{comercialRecomendada.toLocaleString()} BTU/h</td>
                              <td className="border p-2">220V Bifásico</td>
                              <td className="border p-2 font-medium">Daikin / Carrier / Midea</td>
                            </tr>
                            <tr>
                              <td className="border p-2 text-center font-bold">2</td>
                              <td className="border p-2"><strong>Split Hi-Wall Inverter</strong></td>
                              <td className="border p-2 text-center font-mono font-bold">{comercialRecomendada.toLocaleString()} BTU/h</td>
                              <td className="border p-2">220V Monofásico</td>
                              <td className="border p-2 font-medium">LG / Samsung / WEG</td>
                            </tr>
                            <tr>
                              <td className="border p-2 text-center font-bold">3</td>
                              <td className="border p-2"><strong>VRF (Múltiplas Evaporadoras)</strong></td>
                              <td className="border p-2 text-center font-mono font-bold">Equivalente a {comercialRecomendada.toLocaleString()} BTU/h</td>
                              <td className="border p-2">220V/380V Trifásico</td>
                              <td className="border p-2 font-medium">Hitachi / Mitsubishi / Toshiba</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1 mt-2">
                      <p className="text-[10px] uppercase font-black text-[#134074]">Tipo de Equipamento Recomendado:</p>
                      <p className="font-bold text-slate-800 text-xs">{aiResult?.tipoEquipamentoRecomendado || (comercialRecomendada <= 36000 ? "Split Cassete Inverter de Alta Vazão" : "Split Piso-Teto Inverter de Grande Capacidade")}</p>
                      <p className="text-slate-600 text-[11px] leading-relaxed italic">
                        {aiResult?.justificativaEscolha || "Justificativa: Esta configuração garante ampla vazão e homogeneização do ar, eliminando pontos quentes e garantindo altíssima eficiência energética com modulação contínua do compressor, evitando picos de corrente na rede elétrica."}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Force page break for html2pdf */}
              <div className="html2pdf__page-break"></div>

              {/* PAGE 5: CONSUMO E INSTALAÇÃO */}
              <div className="space-y-6 pt-10 text-left">
                {/* SECTION 6 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 6 — ESTIMATIVA DE CONSUMO ENERGÉTICO E EFICIÊNCIA
                  </h3>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                    <p>
                      Considerando a implementação de tecnologia com controle eletrônico de frequência de rotação <strong>Inverter</strong> e classificação máxima de eficiência pelo <strong>INMETRO Classe A (EER mínimo recomendado de 3.02 W/W)</strong>, aponta-se as seguintes estimativas operacionais:
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono text-xs text-slate-800">
                      {aiResult?.estimativaConsumoAdicional || (
                        <>
                          <p>• COP de Cálculo Estimado: <strong>3.80 W/W</strong></p>
                          <p>• Potência Elétrica de Consumo Estimada: <strong>{(comercialRecomendada / (3.8 * 3412)).toFixed(2)} kW</strong></p>
                          <p>• Regime Operacional de Cálculo: <strong>8 horas/dia • 22 dias por mês</strong></p>
                          <p>• Consumo Elétrico Mensal Estimado: <strong>{Math.round((comercialRecomendada / (3.8 * 3412)) * 8 * 22)} kWh/mês</strong></p>
                          <p>• Custo Operacional Mensal Estimado (Tarifa R$ 0,75/kWh): <strong>R$ {((comercialRecomendada / (3.8 * 3412)) * 8 * 22 * 0.75).toFixed(2)} / mês</strong></p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 7 */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 7 — REQUISITOS TÉCNICOS E RECOMENDAÇÕES DE INSTALAÇÃO
                  </h3>
                  <div className="text-xs space-y-2 text-justify">
                    <p>
                      De modo a manter a garantia mecânica de fábrica, assegurar a segurança operacional das frotas prediais e em cumprimento às diretrizes legais e normativas da ABNT, instrui-se a execução mandatória das seguintes orientações de instalação:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 text-[11px]">
                      {aiResult && aiResult.recomendacoesInstalacao ? (
                        aiResult.recomendacoesInstalacao.map((r: string, idx: number) => (
                          <li key={idx}><strong>{r}</strong></li>
                        ))
                      ) : (
                        <>
                          <li><strong>Instalação Elétrica:</strong> Circuito exclusivo trifásico ou bifásico de 220V estruturado em eletrodutos rígidos metálicos com disjuntor termomagnético de proteção bipolar Curva C dimensionado para 20A / 25A.</li>
                          <li><strong>Drenagem por Gravidade:</strong> Linha de dreno exclusiva em tubulação de PVC soldável marrom de 3/4 polegadas com caimento linear de no mínimo 1%, sifonado antes do descarte para proteção de odores e infiltrações.</li>
                          <li><strong>Linha Frigorígena de Cobre:</strong> Tubulação em cobre eletrolítico puro isolado termicamente com elastômero expandido individual e testes de estanqueidade pressurizado com nitrogênio a 450 PSI por 1 hora.</li>
                          <li><strong>Posicionamento da Condensadora:</strong> Instalar a unidade externa em área aberta e arejada, garantindo distância traseira mínima de 30 cm de anteparos para troca de calor plena, suspensa em bases de borracha anti-vibratórias.</li>
                          <li><strong>Renovação de Ar Mecânica:</strong> Instalar sistema mecânico suplementar de renovação de ar forçado com filtragem Classe G3, dimensionado para suprir a vazão mínima de <strong>{pessoas.quantidade * 27} m³/h</strong> ({pessoas.quantidade} ocupantes x 27 m³/h/pessoa) em consonância estrita com a norma ABNT NBR 16401-3.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* SECTION 8 */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#134074] border-b border-slate-200 pb-1 uppercase font-mono tracking-wider">
                    SEÇÃO 8 — PARECER DE CONFORMIDADE PMOC (LEI 13.589/18)
                  </h3>
                  <div className="p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed text-justify bg-slate-50 border-slate-200 text-slate-700">
                    {isPmocRequired ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 uppercase">Atenção: Elaboração e Execução do PMOC Mandatório Exigida por Lei</p>
                          <p>
                            A capacidade total recomendada do sistema de climatização ({comercialRecomendada.toLocaleString()} BTU/h) equivale a <strong>{(comercialRecomendada / 12000).toFixed(1)} TR (Toneladas de Refrigeração)</strong>. Pela legislação federal vigente da <strong>Lei nº 13.589 de 12 de janeiro de 2018 e Portaria MS 3.523/1998</strong>, estabelecimentos públicos e privados com sistemas de climatização com capacidade igual ou superior a 5 TR (60.000 BTU/h) são <strong>obrigados</strong> a possuir um <strong>Plano de Manutenção, Operação e Controle (PMOC)</strong> chancelado por Responsável Técnico habilitado com a respectiva anotação de ART no CREA.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 uppercase">PMOC Recomendado para Gestão Operacional Preventiva</p>
                          <p>
                            A capacidade nominal final recomendada de {comercialRecomendada.toLocaleString()} BTU/h ({(comercialRecomendada/12000).toFixed(2)} TR) posiciona-se abaixo do teto de obrigatoriedade jurídica de 5 TR estabelecido pela Lei Federal nº 13.589/2018. Todavia, a estruturação e execução periódica das rotinas básicas de limpeza de filtros e serpentinas são altamente sugeridas para prolongar a vida útil operacional do compressor e assegurar o padrão de qualidade do ar interno.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* SECTION 9 */}
                <div className="space-y-4 pt-10">
                  <div className="flex justify-between items-end border-t border-slate-200 pt-8">
                    <div className="space-y-1 text-xs">
                      <p>Recife, PE, Brasil</p>
                      <p>Data do Cálculo: {projeto.data}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="w-48 border-b border-slate-400 mx-auto"></div>
                      <p className="font-bold text-xs text-slate-900">Eng. Mecânico Vitor Leonardo</p>
                      <p className="text-[10px] text-slate-500">CREA-PE: 1822299490</p>
                      <p className="text-[9px] text-slate-400 font-mono">VL Engenharia • Responsável Técnico</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
