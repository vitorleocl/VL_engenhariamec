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
  Calculator
} from "lucide-react";
import { 
  PREFILLED_ART_PARAMS, 
  PREFILLED_ESCOPO, 
  PREFILLED_MATERIAIS, 
  PREFILLED_MEDICOES, 
  PREFILLED_NAO_CONFORMIDADES,
  EscopoItem,
  MaterialItem,
  MedicaoItem,
  NaoConformidadeItem,
  UploadedImage,
  ArtManutencaoParams
} from "./artManutencaoData";
import { exportToWord, copyRichText, preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";
import Logo from "../Logo";
import LaudoPricingTab from "./LaudoPricingTab";

interface LaudoArtManutencaoIndepProps {
  clients?: ClientData[];
  onBack?: () => void;
}

export default function LaudoArtManutencaoIndep({ onBack, clients }: LaudoArtManutencaoIndepProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"params" | "escopo" | "materiais" | "medicoes" | "naoconformidades" | "images" | "pricing" | "preview">("params");
  
  // Document Toggle inside Preview tab
  const [docLayout, setDocLayout] = useState<"all" | "memorial" | "checklist" | "relatorio">("all");

  // State Management
  const [params, setParams] = useState<ArtManutencaoParams>(PREFILLED_ART_PARAMS);
  const [escopo, setEscopo] = useState<EscopoItem[]>(PREFILLED_ESCOPO);
  const [materiais, setMateriais] = useState<MaterialItem[]>(PREFILLED_MATERIAIS);
  const [medicoes, setMedicoes] = useState<MedicaoItem[]>(PREFILLED_MEDICOES);
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidadeItem[]>(PREFILLED_NAO_CONFORMIDADES);
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
  const handleParamChange = (field: keyof ArtManutencaoParams, value: string) => {
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
            description: `Registro fotográfico técnico da inspeção e intervenção técnica no equipamento ${params.equipmentName}.`
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

  // Escopo CRUD
  const addEscopo = () => {
    const nextOrdem = escopo.length + 1;
    setEscopo(prev => [
      ...prev,
      {
        id: "esc_" + Date.now(),
        ordem: nextOrdem,
        atividade: "Nova Atividade Técnica",
        metodologia: "Método de execução detalhado..."
      }
    ]);
  };

  const updateEscopo = (id: string, field: keyof EscopoItem, val: string | number) => {
    setEscopo(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeEscopo = (id: string) => {
    setEscopo(prev => prev.filter(item => item.id !== id).map((item, idx) => ({ ...item, ordem: idx + 1 })));
  };

  // Materiais CRUD
  const addMaterial = () => {
    setMateriais(prev => [
      ...prev,
      {
        id: "mat_" + Date.now(),
        descricao: "Novo Item de Reposição",
        especificacao: "Especificação técnica / Código fabricante",
        quantidade: "1",
        unidade: "Unidade"
      }
    ]);
  };

  const updateMaterial = (id: string, field: keyof MaterialItem, val: string) => {
    setMateriais(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeMaterial = (id: string) => {
    setMateriais(prev => prev.filter(item => item.id !== id));
  };

  // Medições CRUD
  const addMedicao = () => {
    setMedicoes(prev => [
      ...prev,
      {
        id: "med_" + Date.now(),
        parametro: "Pressão de Trabalho",
        antes: "7.0 bar",
        depois: "8.0 bar",
        limite: "6.0 a 8.5 bar"
      }
    ]);
  };

  const updateMedicao = (id: string, field: keyof MedicaoItem, val: string) => {
    setMedicoes(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeMedicao = (id: string) => {
    setMedicoes(prev => prev.filter(item => item.id !== id));
  };

  // Não Conformidades CRUD
  const addNaoConformidade = () => {
    setNaoConformidades(prev => [
      ...prev,
      {
        id: "nc_" + Date.now(),
        problema: "Desvio técnico identificado...",
        norma: "Norma regulamentadora violada...",
        tratamento: "Medida corretiva tomada...",
        prazo: "Imediato"
      }
    ]);
  };

  const updateNaoConformidade = (id: string, field: keyof NaoConformidadeItem, val: string) => {
    setNaoConformidades(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeNaoConformidade = (id: string) => {
    setNaoConformidades(prev => prev.filter(item => item.id !== id));
  };

  // AI-Powered Call
  const handleAIAudit = async () => {
    setLoadingAI(true);
    // Interim placeholder
    setParams(prev => ({
      ...prev,
      introducao: "A Inteligência Artificial está analisando os dados da intervenção de manutenção e revisando as referências normativas no CREA-PE...",
      objetivo: "Processando objetivos técnicos formais com base no equipamento e descrição do problema...",
      justificativa: "Elaborando fundamentação de engenharia para estender a vida útil e garantir a segurança das instalações...",
      conclusao: "Elaborando parecer conclusivo mestre assinado pelo Engenheiro Vitor Leonardo...",
      ferramentas: "Identificando ferramentas apropriadas de calibração mecânica e elétrica...",
      qualificacaoEquipe: "Estruturando qualificações de engenharia exigidas para as atividades propostas...",
      criteriosAceitacao: "Ajustando limites de medição e aprovação do comissionamento térmico-mecânico...",
      proximaManutencao: "Consolidando plano para a próxima parada preventiva ou rotina de monitoramento...",
      testesComissionamento: "Definindo protocolos dinâmicos de teste de partida e estanqueidade..."
    }));

    try {
      const response = await fetch("/api/gemini/art-manutencao-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...params,
          escopo,
          materiais,
          medicoes,
          naoConformidades,
          images: uploadedImages.slice(0, 3)
        })
      });

      if (!response.ok) {
        throw new Error("API call failed.");
      }

      const data = await response.json();

      // Update params & collections from AI response
      setParams(prev => ({
        ...prev,
        introducao: data.introducao || prev.introducao,
        objetivo: data.objetivo || prev.objetivo,
        justificativa: data.justificativa || prev.justificativa,
        conclusao: data.conclusao || prev.conclusao,
        ferramentas: data.ferramentas || prev.ferramentas,
        qualificacaoEquipe: data.qualificacaoEquipe || prev.qualificacaoEquipe,
        criteriosAceitacao: data.criteriosAceitacao || prev.criteriosAceitacao,
        proximaManutencao: data.proximaManutencao || prev.proximaManutencao,
        pendencias: data.pendencias || prev.pendencias,
        testesComissionamento: data.testesComissionamento || prev.testesComissionamento
      }));

      if (data.escopo && data.escopo.length > 0) {
        setEscopo(data.escopo);
      }

      if (data.naoConformidades && data.naoConformidades.length > 0) {
        setNaoConformidades(data.naoConformidades);
      }

      showNotification("success", "Memorial Descritivo e Laudo Técnico de Manutenção gerados por IA com absoluto rigor técnico!");
    } catch (err) {
      console.error(err);
      showNotification("info", "Usando gerador inteligente padrão da VL Engenharia com parâmetros pré-configurados de alta fidelidade.");
      // Apply default prefilled text to restore state cleanly
      setParams(PREFILLED_ART_PARAMS);
    } finally {
      setLoadingAI(false);
    }
  };

  // Export & Action handlers
  const handlePrint = () => {
    preprocessStylesheets();
    window.print();
    restoreStylesheets();
  };

  const handleExportDoc = () => {
    exportToWord("art-report-container", `Laudo_ART_Manutencao_${params.clientName.replace(/\s+/g, '_')}`);
    showNotification("success", "Laudo Técnico e Memorial exportados no Word (.doc) com formatação preservada!");
  };

  const handleCopy = () => {
    copyRichText("art-report-container");
    showNotification("success", "Documento copiado no formato Rich Text! Perfeito para colar no Microsoft Word ou Google Docs.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <span className="font-sans font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase">SISTEMA ART MANUTENÇÃO</span>
            <p className="text-xs text-slate-500 font-mono">Gerador de Memorial Descritivo, Checklist Pré-ART e Relatório Técnico • VL Engenharia</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              Voltar ao Início
            </button>
          )}

          <button
            onClick={handleAIAudit}
            disabled={loadingAI}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4" />
            {loadingAI ? "Processando Engenheiro IA..." : "Gerar com IA"}
          </button>
        </div>
      </div>

      {/* Warning Alert about real ART emission */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl flex gap-3 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
        <Info className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-bold block mb-0.5">AVISO LEGAL DE RESPONSABILIDADE</span>
          A Anotação de Responsabilidade Técnica (ART) é de competência exclusiva de profissional legalmente habilitado registrado no sistema CONFEA/CREA. Este módulo **NÃO EMITE** a ART oficial. Ele elabora o **Memorial Descritivo**, o **Checklist Pré-ART** para facilitação de preenchimento em crea-pe.org.br, e o **Relatório Técnico de Manutenção**.
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border text-white animate-bounce ${
          notification.type === "success" ? "bg-emerald-600 border-emerald-500" :
          notification.type === "error" ? "bg-rose-600 border-rose-500" : "bg-blue-600 border-blue-500"
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {notification.text}
        </div>
      )}

      {/* Main Grid: Left Tabs Column, Right Form/Preview Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation / Control column */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-2">ETAPAS DE ELABORAÇÃO</span>
            
            <button
              onClick={() => setActiveTab("params")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "params" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Building className="w-4 h-4" />
              1. Geral & Contratante
            </button>

            <button
              onClick={() => setActiveTab("escopo")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "escopo" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              2. Escopo & Métodos
            </button>

            <button
              onClick={() => setActiveTab("materiais")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "materiais" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Wrench className="w-4 h-4" />
              3. Peças & Materiais
            </button>

            <button
              onClick={() => setActiveTab("medicoes")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "medicoes" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Activity className="w-4 h-4" />
              4. Resultados & Medições
            </button>

            <button
              onClick={() => setActiveTab("naoconformidades")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "naoconformidades" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              5. Desvios & Correções
            </button>

            <button
              onClick={() => setActiveTab("images")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "images" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Upload className="w-4 h-4" />
              6. Anexo de Fotos
            </button>

            <button
              onClick={() => setActiveTab("pricing")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === "pricing" 
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              7. Precificação
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

            <button
              onClick={() => setActiveTab("preview")}
              className={`w-full text-left px-3 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                activeTab === "preview" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" 
                  : "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              VER MEMORIAL & LAUDO
            </button>
          </div>

          {/* Quick info panel */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-indigo-500" />
              VL Engenharia & CREA-PE
            </span>
            <p className="text-slate-500 leading-relaxed">
              O responsável técnico habilitado é o **Engenheiro Mecânico Vitor Leonardo**, CREA-PE nº **1822299490**.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              Portaria CONFEA 1.025/2009<br/>
              Lei Federal nº 6.496/1977
            </div>
          </div>
        </div>

        {/* Editor or Preview Sheet Content */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Editor Header Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              {activeTab === "params" && "Identificação do Serviço e do Estabelecimento"}
              {activeTab === "escopo" && "Definição do Escopo Detalhado & Metodologia"}
              {activeTab === "materiais" && "Lista de Peças de Reposição & Materiais Aplicados"}
              {activeTab === "medicoes" && "Ensaios, Medições e Comissionamento do Equipamento"}
              {activeTab === "naoconformidades" && "Não Conformidades Identificadas e Ações de Engenharia"}
              {activeTab === "images" && "Upload de Imagens Técnicas e Legendas de Laudo"}
              {activeTab === "pricing" && "Precificação e Orçamento do Serviço"}
              {activeTab === "preview" && "Visualizador Técnico Unificado do Pacote ART"}
            </h2>
          </div>

          <div className="p-6">
            {/* TAB PRECIFICACAO */}
            {activeTab === "pricing" && (
              <LaudoPricingTab 
                clientName={params.clientName}
                serviceType="Laudo / ART de Manutenção e Instalação"
                equipmentName={params.equipmentName || "Equipamento Industrial"}
              />
            )}

            {/* TAB 1: PARAMS */}
            {activeTab === "params" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nº do Documento</label>
                    <input 
                      type="text" 
                      value={params.documentNumber} 
                      onChange={e => handleParamChange("documentNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">ART de Manutenção (CREA)</label>
                    <input 
                      type="text" 
                      value={params.artNumber} 
                      onChange={e => handleParamChange("artNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tipo de Serviço</label>
                    <select
                      value={params.serviceType}
                      onChange={e => handleParamChange("serviceType", e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    >
                      <option value="PREVENTIVA">Preventiva Programada</option>
                      <option value="CORRETIVA">Corretiva Crítica</option>
                      <option value="PREDITIVA">Preditiva de Alta Precisão</option>
                      <option value="REFORMA">Reforma / Retrofit</option>
                      <option value="INSPEÇÃO">Inspeção / Vistoria</option>
                    </select>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Dados da Contratante (Cliente)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Razão Social / Nome Fantasia</label>
                    <input 
                      type="text" 
                      value={params.clientName} 
                      onChange={e => handleParamChange("clientName", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">CNPJ / CPF do Cliente</label>
                    <input 
                      type="text" 
                      value={params.cnpj} 
                      onChange={e => handleParamChange("cnpj", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Endereço Completo</label>
                    <input 
                      type="text" 
                      value={params.address} 
                      onChange={e => handleParamChange("address", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Cidade / UF</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input 
                        type="text" 
                        value={params.city} 
                        onChange={e => handleParamChange("city", e.target.value)}
                        className="col-span-2 w-full px-2 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                      />
                      <input 
                        type="text" 
                        value={params.uf} 
                        onChange={e => handleParamChange("uf", e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono text-center uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">E-mail de Contato</label>
                    <input 
                      type="text" 
                      value={params.email} 
                      onChange={e => handleParamChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Telefone do Cliente</label>
                    <input 
                      type="text" 
                      value={params.telefone} 
                      onChange={e => handleParamChange("telefone", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Especificações do Equipamento / Sistema</span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nome do Equipamento</label>
                    <input 
                      type="text" 
                      value={params.equipmentName} 
                      onChange={e => handleParamChange("equipmentName", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Família / Categoria de Equipamento</label>
                    <input 
                      type="text" 
                      value={params.equipmentType} 
                      onChange={e => handleParamChange("equipmentType", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">TAG / Identificação Física</label>
                    <input 
                      type="text" 
                      value={params.equipmentTag} 
                      onChange={e => handleParamChange("equipmentTag", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Problema Encontrado ou Demanda do Serviço</label>
                  <textarea 
                    value={params.problemDescription} 
                    onChange={e => handleParamChange("problemDescription", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Início da Execução</label>
                    <input 
                      type="text" 
                      value={params.startDate} 
                      onChange={e => handleParamChange("startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Término Previsto/Real</label>
                    <input 
                      type="text" 
                      value={params.endDate} 
                      onChange={e => handleParamChange("endDate", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Valor do Contrato</label>
                    <input 
                      type="text" 
                      value={params.contractValue} 
                      onChange={e => handleParamChange("contractValue", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Horas Trabalhadas</label>
                    <input 
                      type="text" 
                      value={params.durationHours} 
                      onChange={e => handleParamChange("durationHours", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Código de Atividade Confea</label>
                    <input 
                      type="text" 
                      value={params.codigoAtividadeConfea} 
                      onChange={e => handleParamChange("codigoAtividadeConfea", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Local de Execução (Crea-PE)</label>
                    <input 
                      type="text" 
                      value={params.localExecucao} 
                      onChange={e => handleParamChange("localExecucao", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Normas de Referência Adicionais / Internacionais</label>
                  <textarea 
                    placeholder="Ex: ASME Section VIII Div 1, ISO 12100, etc. (Separe por vírgulas)"
                    value={params.normasAdicionais || ""}
                    onChange={e => handleParamChange("normasAdicionais", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: ESCOPO */}
            {activeTab === "escopo" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Cronograma técnico de atividades de manutenção:</span>
                  <button
                    onClick={addEscopo}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Atividade
                  </button>
                </div>

                <div className="space-y-3">
                  {escopo.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl relative group space-y-3"
                    >
                      <button
                        onClick={() => removeEscopo(item.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Remover Atividade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.atividade}
                          onChange={e => updateEscopo(item.id, "atividade", e.target.value)}
                          placeholder="Ex: Substituição de Mangueiras Hidráulicas"
                          className="w-[85%] bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none text-xs font-bold text-slate-800 dark:text-white pb-1"
                        />
                      </div>

                      <div className="pl-8">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Metodologia técnica de execução</label>
                        <textarea
                          value={item.metodologia}
                          onChange={e => updateEscopo(item.id, "metodologia", e.target.value)}
                          placeholder="Como este procedimento será realizado (ferramentas, isolamento, segurança, testes)..."
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MATERIAIS */}
            {activeTab === "materiais" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Mapeamento de insumos e sobressalentes:</span>
                  <button
                    onClick={addMaterial}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-4 py-3">Peça / Insumo</th>
                        <th className="px-4 py-3">Especificação / Descrição Técnica</th>
                        <th className="px-4 py-3 w-24">Qtd.</th>
                        <th className="px-4 py-3 w-28">Unidade</th>
                        <th className="px-4 py-3 w-16">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {materiais.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.descricao}
                              onChange={e => updateMaterial(item.id, "descricao", e.target.value)}
                              className="w-full bg-transparent text-slate-850 dark:text-white font-semibold focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.especificacao}
                              onChange={e => updateMaterial(item.id, "especificacao", e.target.value)}
                              className="w-full bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.quantidade}
                              onChange={e => updateMaterial(item.id, "quantidade", e.target.value)}
                              className="w-full bg-transparent text-center font-mono font-bold text-indigo-600 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.unidade}
                              onChange={e => updateMaterial(item.id, "unidade", e.target.value)}
                              className="w-full bg-transparent text-slate-600 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeMaterial(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: MEDICOES */}
            {activeTab === "medicoes" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Mapeamento quantitativo antes vs depois do comissionamento:</span>
                  <button
                    onClick={addMedicao}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Parâmetro
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-4 py-3">Parâmetro de Medição</th>
                        <th className="px-4 py-3 w-36">Antes do Serviço</th>
                        <th className="px-4 py-3 w-36">Após o Serviço</th>
                        <th className="px-4 py-3 w-40">Limite de Projeto</th>
                        <th className="px-4 py-3 w-16">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {medicoes.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.parametro}
                              onChange={e => updateMedicao(item.id, "parametro", e.target.value)}
                              className="w-full bg-transparent text-slate-850 dark:text-white font-semibold focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.antes}
                              onChange={e => updateMedicao(item.id, "antes", e.target.value)}
                              className="w-full bg-transparent font-mono text-rose-600 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.depois}
                              onChange={e => updateMedicao(item.id, "depois", e.target.value)}
                              className="w-full bg-transparent font-mono text-emerald-600 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.limite}
                              onChange={e => updateMedicao(item.id, "limite", e.target.value)}
                              className="w-full bg-transparent text-slate-600 focus:outline-none focus:border-b focus:border-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeMedicao(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: NAOCONFORMIDADES */}
            {activeTab === "naoconformidades" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Gestão de Não Conformidades encontradas e tratamentos aplicados:</span>
                  <button
                    onClick={addNaoConformidade}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Desvio
                  </button>
                </div>

                <div className="space-y-3">
                  {naoConformidades.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl relative group grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <button
                        onClick={() => removeNaoConformidade(item.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Remover Desvio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Problema / Desvio Técnico</label>
                          <input
                            type="text"
                            value={item.problema}
                            onChange={e => updateNaoConformidade(item.id, "problema", e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Referência Normativa / Norma Violada</label>
                          <input
                            type="text"
                            value={item.norma}
                            onChange={e => updateNaoConformidade(item.id, "norma", e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tratamento Realizado ou Recomendação</label>
                          <input
                            type="text"
                            value={item.tratamento}
                            onChange={e => updateNaoConformidade(item.id, "tratamento", e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Prazo de Adequação</label>
                          <input
                            type="text"
                            value={item.prazo}
                            onChange={e => updateNaoConformidade(item.id, "prazo", e.target.value)}
                            className="w-32 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: IMAGES */}
            {activeTab === "images" && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/20 relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-indigo-600 dark:text-indigo-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Arraste fotos do serviço de manutenção ou clique para selecionar</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1">Imagens de inspeção: Antes, Durante e Depois (Formatos JPG, PNG, WEBP)</span>
                    </div>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Galeria de Evidências Técnicas</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl relative flex flex-col gap-3">
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1 bg-white hover:bg-rose-50 dark:bg-slate-900 text-slate-400 hover:text-rose-600 rounded-lg transition-all border border-slate-200 dark:border-slate-800 shadow"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 relative border border-slate-200 dark:border-slate-800">
                            <img referrerPolicy="no-referrer" src={img.data} alt={img.name} className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Legenda Técnica do Relatório</label>
                            <input
                              type="text"
                              value={img.description}
                              onChange={e => updateImageDescription(idx, e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: PREVIEW SHEET */}
            {activeTab === "preview" && (
              <div className="space-y-6">
                {/* Actions bar for preview */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-950/40 rounded-xl">
                  {/* Select Document Layout inside Preview */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setDocLayout("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        docLayout === "all" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      Todos (Pacote Completo)
                    </button>
                    <button
                      onClick={() => setDocLayout("memorial")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        docLayout === "memorial" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      1. Memorial Descritivo
                    </button>
                    <button
                      onClick={() => setDocLayout("checklist")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        docLayout === "checklist" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      2. Checklist Pré-ART
                    </button>
                    <button
                      onClick={() => setDocLayout("relatorio")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        docLayout === "relatorio" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      3. Relatório Técnico
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-700 hover:text-indigo-600 rounded-lg shadow-sm transition-colors"
                      title="Copiar Rich Text para Google Docs / MS Word"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleExportDoc}
                      className="p-2 bg-white hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-700 hover:text-indigo-600 rounded-lg shadow-sm transition-colors"
                      title="Exportar em formato Word (.doc)"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-850 rounded-lg shadow transition-colors text-xs font-bold dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir / PDF
                    </button>
                  </div>
                </div>

                {/* Printable technical documentation container */}
                <div 
                  id="art-report-container" 
                  ref={reportRef} 
                  className="bg-white text-slate-900 p-8 md:p-12 border border-slate-200 rounded-xl space-y-12 font-sans shadow-lg print:border-none print:shadow-none print:p-0"
                >
                  
                  {/* DOCUMENTO 1: MEMORIAL DESCRITIVO DE SERVIÇO DE MANUTENÇÃO */}
                  {(docLayout === "all" || docLayout === "memorial") && (
                    <div className="space-y-10 page-break-after">
                      {/* Cover Memorial Descritivo */}
                      <div className="text-center space-y-8 py-10 border-b-2 border-indigo-900">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                          <Logo variant="print" className="h-12" />
                          <div className="text-right text-[10px] text-slate-400 font-mono">
                            Código: {params.documentNumber}<br/>
                            ART de Ref: {params.artNumber}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="block text-xs font-bold tracking-widest text-slate-400 uppercase">MEMORIAL DESCRITIVO TÉCNICO</span>
                          <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-indigo-950 uppercase leading-snug">
                            Serviços Especializados de Manutenção Mecânica de {params.equipmentName}
                          </h1>
                          <p className="text-xs text-slate-500 max-w-xl mx-auto font-mono">
                            Fundamentação e Instrução de Execução para Emissão de ART no CREA-PE • Lei Federal nº 6.496/1977
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-2xl mx-auto">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Contratante</span>
                            <span className="font-bold text-slate-800">{params.clientName}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Responsável Técnico</span>
                            <span className="font-bold text-slate-800">{params.rtName}</span>
                            <span className="block font-mono text-[10px]">CREA: {params.rtCrea}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section 1 to 13 */}
                      <div className="space-y-6">
                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase">SEÇÃO 1 — Identificação do Serviço</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                          <div>
                            <span className="font-bold text-slate-600 block">1.1 Tipo de Serviço:</span>
                            <span className="text-slate-800">Manutenção {params.serviceType} de Alta Confiabilidade</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">1.5 Local de Execução:</span>
                            <span className="text-slate-800">{params.localExecucao}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">1.4 Equipamento / TAG:</span>
                            <span className="text-slate-800 font-mono font-bold">{params.equipmentName} ({params.equipmentTag})</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">1.6 Prazo / Horas Previstas:</span>
                            <span className="text-slate-800">{params.durationHours} Horas Operacionais</span>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs leading-relaxed">
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">1.2 Objetivo do Serviço:</span>
                            <p className="text-slate-600 text-justify">{params.objetivo}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">1.3 Justificativa Técnica:</span>
                            <p className="text-slate-600 text-justify">{params.justificativa}</p>
                          </div>
                        </div>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 2 — Dados do Contratante</h2>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-bold text-slate-600 block">Razão Social:</span>
                            <span className="text-slate-800">{params.clientName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">CNPJ:</span>
                            <span className="text-slate-800 font-mono">{params.cnpj}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">Endereço:</span>
                            <span className="text-slate-800">{params.address}, {params.bairro}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">Contato:</span>
                            <span className="text-slate-800">{params.telefone} • {params.email}</span>
                          </div>
                        </div>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 3 — Dados do Responsável Técnico</h2>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-bold text-slate-600 block">Empresa Emitente:</span>
                            <span className="text-slate-800 font-bold">VL Engenharia</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">Engenheiro Responsável:</span>
                            <span className="text-slate-800">{params.rtName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">Registro Profissional:</span>
                            <span className="text-slate-800 font-mono">CREA-PE nº {params.rtCrea}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block">ART Emitida:</span>
                            <span className="text-slate-800 font-mono">{params.rtArt}</span>
                          </div>
                        </div>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 4 & 5 — Escopo Detalhado & Metodologia de Execução</h2>
                        <div className="space-y-4">
                          {escopo.map((item, idx) => (
                            <div key={item.id} className="text-xs space-y-1">
                              <span className="font-bold text-slate-850 block">{idx + 1}. {item.atividade}</span>
                              <p className="text-slate-600 pl-4 border-l border-slate-200 text-justify">{item.metodologia}</p>
                            </div>
                          ))}
                        </div>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 6 — Materiais e Peças a Utilizar</h2>
                        <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-800 border-b border-slate-200 font-bold">
                              <th className="p-2 border border-slate-200">Item</th>
                              <th className="p-2 border border-slate-200">Descrição</th>
                              <th className="p-2 border border-slate-200">Especificação Técnica</th>
                              <th className="p-2 border border-slate-200 text-center">Qtd.</th>
                              <th className="p-2 border border-slate-200 text-center">Unidade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materiais.map((item, index) => (
                              <tr key={item.id} className="border-b border-slate-200">
                                <td className="p-2 border border-slate-200 text-center font-mono">{index + 1}</td>
                                <td className="p-2 border border-slate-200 font-bold">{item.descricao}</td>
                                <td className="p-2 border border-slate-200 text-slate-600">{item.especificacao}</td>
                                <td className="p-2 border border-slate-200 text-center font-mono">{item.quantidade}</td>
                                <td className="p-2 border border-slate-200 text-center">{item.unidade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 7 — Ferramentas e Equipamentos Necessários</h2>
                        <p className="text-xs text-slate-600 text-justify leading-relaxed">{params.ferramentas}</p>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 8 — Normas Técnicas Aplicáveis</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-600 leading-relaxed font-mono">
                          <div>• Lei Federal nº 6.496/1977 — ART</div>
                          <div>• Resolução CONFEA nº 1.025/2009</div>
                          <div>• NR-10 — Segurança em Instalações Elétricas</div>
                          <div>• NR-12 — Segurança em Máquinas e Equipamentos</div>
                          <div>• NR-13 — Vasos de Pressão e Tubulações</div>
                          <div>• ABNT NBR 5462:1994 — Confiabilidade e Mantenabilidade</div>
                          <div>• ABNT NBR 5674:2012 — Manutenção de Edificações</div>
                          <div>• Manual do Fabricante do Equipamento</div>
                        </div>

                        <h2 className="text-sm font-sans font-black border-b-2 border-indigo-900 pb-1 text-indigo-950 uppercase pt-4">SEÇÃO 9 — Requisitos de Segurança e Procedimento LOTO</h2>
                        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                          <p className="text-justify font-semibold text-slate-800">
                            Fica estabelecido como obrigatório o cumprimento do seguinte procedimento de Lockout/Tagout (LOTO) para a segurança e isolamento físico de energias perigosas:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1.5 text-justify">
                            <li><strong>Comunicação prévia:</strong> Notificar formalmente todos os supervisores e operadores da área operacional envolvida;</li>
                            <li><strong>Desligamento seguro:</strong> Parar o equipamentoCMP-04 seguindo a sequência normal do fabricante;</li>
                            <li><strong>Isolamento elétrico:</strong> Localizar e seccionar o disjuntor principal no painel geral de energia elétrica (NR-10);</li>
                            <li><strong>Bloqueio mecânico/pneumático:</strong> Fechar a válvula esférica de descarga de ar comprimido e travar as fontes acumuladas;</li>
                            <li><strong>Dissipação de energia residual:</strong> Drenar completamente a pressão do pulmão de ar e da carcaça do separador;</li>
                            <li><strong>Etiquetagem pericial:</strong> Inserir cadeado individual e etiqueta VL Engenharia declarando: 'EQUIPAMENTO BLOQUEADO EM MANUTENÇÃO';</li>
                            <li><strong>Verificação de estado zero:</strong> Testar o acionamento elétrico para confirmar a ausência absoluta de alimentação;</li>
                            <li><strong>Remoção segura:</strong> Concluído o serviço, remover os cadeados em ordem inversa à instalação.</li>
                          </ol>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 text-xs leading-relaxed">
                          <div>
                            <h3 className="text-xs font-sans font-black border-b border-indigo-900 pb-0.5 text-indigo-950 uppercase">SEÇÃO 10 — Qualificação da Equipe</h3>
                            <p className="text-slate-600 text-justify mt-1">{params.qualificacaoEquipe}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-sans font-black border-b border-indigo-900 pb-0.5 text-indigo-950 uppercase">SEÇÃO 11 — Registros a Gerar</h3>
                            <p className="text-slate-600 text-justify mt-1">Geração de Ordem de Serviço, Medições de Campo, Termogramas Digitais, Relatório Técnico de Manutenção com Anexo Fotográfico e a ART (Anotação de Responsabilidade Técnica) homologada no CREA-PE.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 text-xs leading-relaxed">
                          <div>
                            <h3 className="text-xs font-sans font-black border-b border-indigo-900 pb-0.5 text-indigo-950 uppercase">SEÇÃO 12 — Critérios de Aceitação</h3>
                            <p className="text-slate-600 text-justify mt-1 whitespace-pre-line">{params.criteriosAceitacao}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-sans font-black border-b border-indigo-900 pb-0.5 text-indigo-950 uppercase">SEÇÃO 13 — Assinatura RT</h3>
                            <div className="mt-6 border-t border-slate-300 pt-3 text-center">
                              <span className="block font-bold text-slate-800">Eng. Vitor Leonardo Cl.</span>
                              <span className="block text-[10px] text-slate-500">Engenheiro Mecânico Responsável • CREA-PE 1822299490</span>
                              <span className="block text-[10px] text-slate-400">VL Engenharia Ltda</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTO 2: CHECKLIST PRÉ-ART (CREA-PE) */}
                  {(docLayout === "all" || docLayout === "checklist") && (
                    <div className="space-y-8 page-break-after border-t-2 border-indigo-900 pt-8">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <div className="text-left">
                          <span className="block font-sans font-black text-sm tracking-tight text-indigo-950">CHECKLIST PRÉ-ART</span>
                          <span className="block text-[10px] text-slate-400 font-mono">VALOR FACILITADOR PARA EMISSÃO DO ENGENHEIRO NO CREA-PE</span>
                        </div>
                        <div className="text-right text-[9px] text-slate-400 font-mono">
                          Referência: www.crea-pe.org.br
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        Utilize os dados estruturados abaixo para realizar o preenchimento exato da ART (Anotação de Responsabilidade Técnica) junto ao sistema eletrônico do <strong>CREA-PE (crea-pe.org.br)</strong>. A consistência de dados evita notificações técnicas e atrasos na validação.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        {/* RT card */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <span className="font-extrabold text-indigo-950 block border-b border-indigo-900/10 pb-0.5">DADOS DO RESPONSÁVEL TÉCNICO</span>
                          <div className="space-y-1 font-mono text-[11px] text-slate-700">
                            <div><strong className="text-slate-500">Nome:</strong> Vitor Leonardo Cl.</div>
                            <div><strong className="text-slate-500">Registro CREA:</strong> 1822299490 – PE</div>
                            <div><strong className="text-slate-500">Título Profissional:</strong> Engenheiro Mecânico</div>
                            <div><strong className="text-slate-500">E-mail:</strong> vitorleonardocl@gmail.com</div>
                            <div><strong className="text-slate-500">Telefone:</strong> (81) 98444-2592</div>
                          </div>
                        </div>

                        {/* Contratante Card */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <span className="font-extrabold text-indigo-950 block border-b border-indigo-900/10 pb-0.5">DADOS DO CONTRATANTE</span>
                          <div className="space-y-1 font-mono text-[11px] text-slate-700">
                            <div><strong className="text-slate-500">Razão Social:</strong> {params.clientName}</div>
                            <div><strong className="text-slate-500">CNPJ:</strong> {params.cnpj}</div>
                            <div><strong className="text-slate-500">Endereço:</strong> {params.address}</div>
                            <div><strong className="text-slate-500">CEP Local:</strong> {params.cepExecucao}</div>
                            <div><strong className="text-slate-500">Contato:</strong> {params.telefone}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
                        <span className="font-extrabold text-indigo-950 block border-b border-indigo-900/10 pb-0.5">DADOS DO SERVIÇO & CONTRATO</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px] text-slate-700">
                          <div>
                            <div><strong className="text-slate-500">Título do Serviço:</strong> Manutenção {params.serviceType} de {params.equipmentName}</div>
                            <div className="mt-1"><strong className="text-slate-500">Código de Atividade:</strong> {params.codigoAtividadeConfea}</div>
                            <div className="mt-1"><strong className="text-slate-500">Área de Atuação:</strong> {params.areaAtuacao}</div>
                            <div className="mt-1"><strong className="text-slate-500">Modalidade:</strong> {params.modalidade}</div>
                          </div>
                          <div>
                            <div><strong className="text-slate-500">Data de Início:</strong> {params.startDate}</div>
                            <div className="mt-1"><strong className="text-slate-500">Data de Término Prevista:</strong> {params.endDate}</div>
                            <div className="mt-1"><strong className="text-slate-500">Valor do Contrato:</strong> {params.contractValue}</div>
                            <div className="mt-1"><strong className="text-slate-500">Vinculação de Empresa:</strong> Vincular ao CNPJ da VL Engenharia</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
                        <span className="font-extrabold text-indigo-950 block">ORIENTAÇÕES TÉCNICAS PARA EMISSÃO NO CREA-PE</span>
                        <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-justify">
                          <li>Acesse o ambiente restrito do profissional em <strong>www.crea-pe.org.br</strong> utilizando senha eletrônica;</li>
                          <li>Navegue até o menu: <strong>Serviços ao Profissional → ART → Registrar ART</strong>;</li>
                          <li>Selecione o Tipo de ART correspondente a <strong>'Execução de Obra / Serviço'</strong>;</li>
                          <li>Copie e cole fielmente a descrição técnica resumida dos campos acima;</li>
                          <li>Gere o boleto correspondente à taxa do CREA (variável conforme o valor do contrato especificado);</li>
                          <li>Colete a assinatura do Contratante na via impressa e arquive juntamente com o presente Memorial e Relatório Técnico.</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTO 3: RELATÓRIO TÉCNICO DE MANUTENÇÃO (PÓS-EXECUÇÃO) */}
                  {(docLayout === "all" || docLayout === "relatorio") && (
                    <div className="space-y-10 border-t-2 border-indigo-900 pt-8">
                      {/* Cover Relatório */}
                      <div className="text-center space-y-6 pb-6 border-b border-slate-200">
                        <span className="block text-xs font-bold tracking-widest text-slate-400 uppercase">LAUDO DE CONCLUSÃO DE SERVIÇO</span>
                        <h2 className="text-xl md:text-2xl font-sans font-black tracking-tight text-indigo-950 uppercase">
                          Relatório Técnico de Execução de Manutenção
                        </h2>
                        <p className="text-xs text-slate-500 font-mono">
                          Equipamento: {params.equipmentName} ({params.equipmentTag}) • ART nº {params.artNumber}
                        </p>
                      </div>

                      <div className="space-y-6 text-xs leading-relaxed text-justify">
                        <div>
                          <span className="font-bold text-slate-800 block mb-1">SEÇÃO 1 — Resumo das Atividades Executadas</span>
                          <p className="text-slate-600">{params.introducao}</p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 block mb-1">SEÇÃO 2 — Resultados, Medições e Parametria Técnica</span>
                          <p className="text-slate-600 mb-3">
                            Durante a execução dos testes dinâmicos de carga e despressurização, as seguintes medições instrumentais foram registradas pela equipe técnica sob regência do Engenheiro Vitor Leonardo:
                          </p>
                          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-800 border-b border-slate-200 font-bold">
                                <th className="p-2 border border-slate-200">Parâmetro Analisado</th>
                                <th className="p-2 border border-slate-200 text-center">Antes da Intervenção</th>
                                <th className="p-2 border border-slate-200 text-center">Depois da Intervenção</th>
                                <th className="p-2 border border-slate-200 text-center">Limite Normativo / Projeto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicoes.map((item) => (
                                <tr key={item.id} className="border-b border-slate-200">
                                  <td className="p-2 border border-slate-200 font-semibold">{item.parametro}</td>
                                  <td className="p-2 border border-slate-200 text-center font-mono text-rose-600 font-bold">{item.antes}</td>
                                  <td className="p-2 border border-slate-200 text-center font-mono text-emerald-600 font-bold">{item.depois}</td>
                                  <td className="p-2 border border-slate-200 text-center font-mono text-slate-600">{item.limite}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 block mb-1">SEÇÃO 3 — Protocolo de Testes e Comissionamento</span>
                          <p className="text-slate-600">{params.testesComissionamento}</p>
                        </div>

                        {naoConformidades.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">SEÇÃO 4 — Desvios Identificados e Tratamentos Executados</span>
                            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-800 border-b border-slate-200 font-bold">
                                  <th className="p-2 border border-slate-200">Irregularidade Técnico-Normativa</th>
                                  <th className="p-2 border border-slate-200">Norma Referencial</th>
                                  <th className="p-2 border border-slate-200">Ação de Tratamento Corretivo</th>
                                  <th className="p-2 border border-slate-200 text-center">Prazo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {naoConformidades.map((item) => (
                                  <tr key={item.id} className="border-b border-slate-200">
                                    <td className="p-2 border border-slate-200 font-semibold text-rose-700">{item.problema}</td>
                                    <td className="p-2 border border-slate-200 text-slate-500 font-mono text-[10px]">{item.norma}</td>
                                    <td className="p-2 border border-slate-200 text-slate-600">{item.tratamento}</td>
                                    <td className="p-2 border border-slate-200 text-center font-bold text-indigo-700">{item.prazo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {uploadedImages.length > 0 && (
                          <div className="space-y-4 pt-4">
                            <span className="font-bold text-slate-800 block mb-1">SEÇÃO 5 — Registro e Laudo Fotográfico Técnico</span>
                            <div className="grid grid-cols-2 gap-6">
                              {uploadedImages.map((img, idx) => (
                                <div key={idx} className="space-y-1.5 break-inside-avoid">
                                  <div className="aspect-video w-full overflow-hidden border border-slate-200 rounded-lg bg-slate-100">
                                    <img referrerPolicy="no-referrer" src={img.data} alt={img.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="block text-[10px] text-slate-500 font-mono text-justify bg-slate-50 p-2 rounded border border-slate-100">
                                    <strong>Foto {idx + 1}:</strong> {img.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">SEÇÃO 6 — Recomendações e Plano Técnico Preventivo</span>
                            <p className="text-slate-600">{params.proximaManutencao}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">SEÇÃO 7 — Pendências Registradas</span>
                            <p className="text-slate-600">{params.pendencias}</p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <span className="font-bold text-slate-800 block mb-2">SEÇÃO 8 — Parecer Conclusivo e Liberação Operacional</span>
                          <p className="text-slate-600">{params.conclusao}</p>
                        </div>

                        {/* Signatures for report */}
                        <div className="grid grid-cols-2 gap-12 pt-16 break-inside-avoid text-center">
                          <div className="border-t border-slate-300 pt-3">
                            <span className="block font-bold text-slate-850">Eng. Vitor Leonardo Cl.</span>
                            <span className="block text-[10px] text-slate-500">Engenheiro Mecânico Responsável</span>
                            <span className="block text-[10px] text-slate-400">CREA-PE: 1822299490 • VL Engenharia</span>
                          </div>
                          <div className="border-t border-slate-300 pt-3">
                            <span className="block font-bold text-slate-850">{params.clientName}</span>
                            <span className="block text-[10px] text-slate-500">Representante Técnico da Contratante</span>
                            <span className="block text-[10px] text-slate-400">Aceite e Recebimento de Serviços</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
