import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import Logo from "../Logo";
import { ReportSignature, ReportHeader } from "./ReportBranding";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import LaudoPricingTab from "./LaudoPricingTab";
import SectionOrderToolbar from "./SectionOrderToolbar";
import CustomSectionRenderer from "./CustomSectionRenderer";
import { SectionConfig, getNumberedSections } from "../../lib/sectionManager";
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
  ChevronDown,
  Upload,
  Maximize2,
  Minimize2,
  Copy,
  Layers as LayersIcon,
  HelpCircle,
  Calculator,
  Flame,
  Building,
  CheckSquare,
  Building2,
  Save,
  MessageSquare,
  FileCheck,
  FileSpreadsheet
} from "lucide-react";
import { 
  DEFAULT_PPCI_CHECKLIST, 
  DEFAULT_AVCB_CHECKLIST, 
  PREFILLED_PPCI_PARAMS, 
  PPCIChecklistItem, 
  AVCBChecklistItem, 
  FireSafetyImage 
} from "./fireSafetyData";
import { saveGeneratorLaudo } from "../../lib/generatorStorage";

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
  initialData?: any;
  initialSavedId?: string | null;
}

type LaudoType = 'ppci' | 'avcb' | 'clcb';
type TabType = "params" | "checklist" | "nonconformities" | "pricing" | "preview";

const DEFAULT_FIRE_SAFETY_SECTIONS: SectionConfig[] = [
  { id: "capa", label: "Capa do Laudo de Incêndio", visible: true },
  { id: "sumario", label: "Sumário Executivo", visible: true },
  { id: "secao_1", label: "1. Introdução, Escopo e Objetivos", visible: true },
  { id: "secao_2", label: "2. Identificação do Processo e Contratante", visible: true },
  { id: "secao_3", label: "3. Qualificação Técnica da Empresa (VL Engenharia)", visible: true },
  { id: "secao_4", label: "4. Especificações da Edificação e Carga de Incêndio", visible: true },
  { id: "secao_5", label: "5. Documentos Analisados e Normas do CB / ABNT", visible: true },
  { id: "secao_6", label: "6. Diagnóstico e Parecer Técnico dos Sistemas", visible: true },
  { id: "secao_7", label: "7. Checklist de Vistoria de Campo e Conformidades", visible: true },
  { id: "secao_8", label: "8. Relatório de Não Conformidades e Pendências", visible: true },
  { id: "secao_9", label: "9. Registro Fotográfico de Vistoria in Loco", visible: true },
  { id: "secao_10", label: "10. Cronograma Recomendado e Plano de Ação", visible: true },
  { id: "secao_11", label: "11. Parecer Pericial Conclusivo Final", visible: true },
  { id: "secao_12", label: "12. Limitações Técnicas e Reservas Periciais", visible: true },
  { id: "anexoArt", label: "Anexo — Anotação de Responsabilidade Técnica (ART)", visible: true }
];

export default function LaudoFireSafetyIndep({ onBack, initialPrefilled = false, clients, initialData, initialSavedId }: Props) {
  const [laudoType, setLaudoType] = useState<LaudoType>('avcb');
  const [activeTab, setActiveTab] = useState<TabType>("params");
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<FireSafetyImage[]>([]);
  const [savedId, setSavedId] = useState<string | null>(initialSavedId || null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Section manager state
  const [sectionsConfig, setSectionsConfig] = useState<SectionConfig[]>(DEFAULT_FIRE_SAFETY_SECTIONS);
  const [printConfig, setPrintConfig] = useState({
    capa: true,
    sumario: true,
    fotos: true,
    checklist: true,
    art: true
  });

  // Cadastral and Technical parameters
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "PPCI-2026/089-VL",
    clientName: "Condomínio Comercial Plaza Tower",
    cnpj: "12.345.678/0001-99",
    address: "Av. Agamenon Magalhães, 4500 - Espinheiro",
    city: "Recife",
    state: "PE",
    processoCB: "CBPE-2026-004812",
    projetoAprovado: "PA-7891/2023",
    laudoDate: "01/08/2026",
    responsavelTecnico: "Eng. Vitor Leonardo",
    registroCrea: "CREA-PE 048192-D",
    artRrt: "PE2026098124",
    artPdfUrl: "",
    artFileName: "",
    areaConstruida: "1.450 m²",
    numeroPavimentos: "4 (Térreo + 3 Pavimentos)",
    alturaEdificacao: "12,80 m",
    tipoOcupacao: "Comercial (C-2) - Escritórios e Serviços",
    cargaIncendio: "300 MJ/m² (Média)",
    populacaoEstimada: "180 pessoas",
    fonteAgua: "Reservatório Superior Dedicado (Castelo d'Água)",
    volumeReservaAgua: "15.000 Litros",
    blankSignature: false,
    notes: ""
  });

  // Checklist state
  const [ppciChecklist, setPpciChecklist] = useState<PPCIChecklistItem[]>(DEFAULT_PPCI_CHECKLIST);
  const [avcbChecklist, setAvcbChecklist] = useState<AVCBChecklistItem[]>(DEFAULT_AVCB_CHECKLIST);

  // AI Generated Results
  const [aiResult, setAiResult] = useState({
    diagnosticoTecnico: "Aguardando geração com IA...",
    parecerTecnico: "Aguardando geração com IA...",
    parecerFinal: "APTO_COM_PENDENCIAS" as "APTO" | "APTO_COM_PENDENCIAS" | "NAO_APTO",
    justificativaParecer: "Edificação com conformidade parcial nos sistemas hidráulicos.",
    resumoCliente: "Realizamos a vistoria técnica no seu imóvel e a maior parte dos itens está dentro do padrão exigido pelo Corpo de Bombeiros. Encontramos apenas algumas pendências simples que exigem adequação rápida antes da emissão definitiva.",
    resumoExecutivo: {
      totalItens: 10,
      conformes: 8,
      naoConformes: 2,
      pctConforme: 80,
      pendenciasCriticas: 1,
      pendenciasLeves: 1
    },
    pendenciasIdentificadas: [
      {
        num: 1,
        descricao: "Abrigo de hidrante nº 02 sem chave de mangueira e com engate Storz engripado.",
        normaInfringida: "NBR 13714 / IT do Corpo de Bombeiros",
        risco: "MÉDIO",
        prazoSugerido: "15 dias"
      }
    ],
    normasAplicaveis: [
      "NBR 9077 - Saídas de emergência em edifícios",
      "NBR 12693 - Sistemas de proteção por extintores de incêndio",
      "NBR 13714 - Sistemas de hidrantes e de mangotinhos para combate a incêndio",
      "NBR 17240 - Sistemas de detecção e alarme de incêndio",
      "NBR 10898 - Sistema de iluminação de emergência",
      "NBR 13434 - Sinalização de segurança contra incêndio e pânico",
      "NBR 5419 - Proteção contra descargas atmosféricas (SPDA)"
    ],
    recomendacoes: [
      "Proceder com a desoxidação e lubrificação dos engates Storz dos hidrantes.",
      "Instalar chave de mangueira no abrigo nº 02 e certificar-se da estanqueidade do registro.",
      "Providenciar treinamento periódico de reciclagem para os brigadistas de incêndio."
    ]
  });

  const reportRef = useRef<HTMLDivElement>(null);

  // Load saved or initial data
  useEffect(() => {
    if (initialData) {
      if (initialData.laudoType) setLaudoType(initialData.laudoType);
      if (initialData.laudoParams) setLaudoParams(initialData.laudoParams);
      if (initialData.ppciChecklist) setPpciChecklist(initialData.ppciChecklist);
      if (initialData.avcbChecklist) setAvcbChecklist(initialData.avcbChecklist);
      if (initialData.aiResult) setAiResult(initialData.aiResult);
      if (initialData.uploadedImages) setUploadedImages(initialData.uploadedImages);
    } else if (initialPrefilled) {
      loadSimulatedData();
    }
  }, [initialPrefilled, initialData]);

  const loadSimulatedData = () => {
    setLaudoParams({
      ...PREFILLED_PPCI_PARAMS,
      blankSignature: false,
      notes: "Vistoria realizada no local com presença do zelador e do síndico. Constatada boa conservação geral das rotas de fuga e iluminação."
    });
    setPpciChecklist(DEFAULT_PPCI_CHECKLIST);
    setAvcbChecklist(DEFAULT_AVCB_CHECKLIST);
  };

  const handleSaveToDatabase = async () => {
    try {
      const formDataToSave = {
        laudoType,
        laudoParams,
        ppciChecklist,
        avcbChecklist,
        aiResult,
        uploadedImages
      };
      
      const reportTitle = `${laudoType.toUpperCase()} - ${laudoParams.clientName}`;
      const newId = await saveGeneratorLaudo(
        'ppci_avcb_clcb',
        laudoParams.clientName,
        reportTitle,
        laudoParams.laudoDate,
        formDataToSave,
        savedId || undefined
      );
      setSavedId(newId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Erro ao salvar laudo no banco:", e);
    }
  };

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const payload = {
        laudoType,
        state: laudoParams.state,
        clientName: laudoParams.clientName,
        cnpj: laudoParams.cnpj,
        address: laudoParams.address,
        city: laudoParams.city,
        laudoNumber: laudoParams.laudoNumber,
        processoCB: laudoParams.processoCB,
        projetoAprovado: laudoParams.projetoAprovado,
        responsavelTecnico: laudoParams.responsavelTecnico,
        registroCrea: laudoParams.registroCrea,
        artRrt: laudoParams.artRrt,
        laudoDate: laudoParams.laudoDate,
        areaConstruida: laudoParams.areaConstruida,
        numeroPavimentos: laudoParams.numeroPavimentos,
        alturaEdificacao: laudoParams.alturaEdificacao,
        tipoOcupacao: laudoParams.tipoOcupacao,
        cargaIncendio: laudoParams.cargaIncendio,
        populacaoEstimada: laudoParams.populacaoEstimada,
        fonteAgua: laudoParams.fonteAgua,
        volumeReservaAgua: laudoParams.volumeReservaAgua,
        checklist: laudoType === 'ppci' ? ppciChecklist : avcbChecklist,
        notes: `${laudoParams.notes} ${aiPrompt}`.trim(),
        images: uploadedImages.map(img => ({ data: img.url, mimeType: 'image/jpeg' }))
      };

      const res = await fetch('/api/gemini/fire-safety-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.resumoCliente) {
          setAiResult(data);
          setActiveTab('preview');
        }
      }
    } catch (e) {
      console.error("Erro ao chamar IA para laudo de incêndio:", e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [
            ...prev,
            {
              id: 'img-' + Date.now() + '-' + index,
              url: event.target!.result as string,
              title: file.name.replace(/\.[^/.]+$/, ""),
              obs: 'Anexo de vistoria técnica in loco'
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleArtUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLaudoParams(prev => ({
        ...prev,
        artPdfUrl: result,
        artFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const original = reportRef.current;
      preprocessStylesheets(original);
      
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `Laudo_${laudoType.toUpperCase()}_${laudoParams.laudoNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(original).save();
      restoreStylesheets();
    } catch (e) {
      console.error("Erro ao exportar PDF:", e);
    }
  };

  const handleExportWord = () => {
    if (reportRef.current) {
      exportToWord(reportRef.current, `Laudo_${laudoType.toUpperCase()}_${laudoParams.laudoNumber}.doc`);
    }
  };

  const handleCopyText = () => {
    if (reportRef.current) {
      copyRichText(reportRef.current);
    }
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Top Header & Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 shrink-0"
            >
              ← Voltar aos Geradores
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500" />
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Gerador de Laudos com IA — Segurança Contra Incêndio
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Laudos Periciais de Pré-Projeto PPCI, Vistoria para AVCB e CLCB com análise de normas estaduais (IT/NT).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveToDatabase}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? "Salvo com Sucesso!" : "Salvar Laudo"}</span>
            </button>
            <button
              onClick={handleGenerateAI}
              disabled={loadingAI}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Wand2 className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
              <span>{loadingAI ? 'Gerando com IA...' : 'Gerar com IA (Gemini)'}</span>
            </button>
          </div>
        </div>

        {/* Report Type selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setLaudoType('ppci')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              laudoType === 'ppci'
                ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">PPCI — Pré-Projeto</span>
              <Building2 className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-1">Levantamento de Campo PPCI</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Diagnóstico técnico inicial para dimensionamento do projeto executivo de combate a incêndio.
            </p>
          </button>

          <button
            onClick={() => setLaudoType('avcb')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              laudoType === 'avcb'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AVCB — Vistoria de Campo</span>
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-1">Laudo para Emissão/Renovação AVCB</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Verificação de conformidade de edificação existente frente ao projeto aprovado e IT/NT.
            </p>
          </button>

          <button
            onClick={() => setLaudoType('clcb')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              laudoType === 'clcb'
                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">CLCB — Licença Simplificada</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white mt-1">Laudo de Vistoria CLCB</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Certificado de Licença do Corpo de Bombeiros adaptado às normas específicas do estado.
            </p>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'params'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>1. Dados & Edificação</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>2. Checklist de Campo ({laudoType.toUpperCase()})</span>
        </button>

        <button
          onClick={() => setActiveTab('nonconformities')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'nonconformities'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. Pendências & Imagens ({uploadedImages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>4. Formação de Preço VL</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>5. Laudo Final Oficial</span>
        </button>
      </div>

      {/* TAB 1: PARAMETERS & BUILDING IDENTIFICATION */}
      {activeTab === 'params' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-red-500" />
              <span>Identificação do Processo e Características da Edificação</span>
            </h2>
            <button
              onClick={loadSimulatedData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold border border-slate-700 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carregar Dados de Exemplo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Selector linkage */}
            <div className="md:col-span-3">
              <ClientSelector
                clients={clients}
                onSelectClient={(c) => {
                  setLaudoParams(prev => ({
                    ...prev,
                    clientName: c.name,
                    cnpj: (c as any).cnpj || c.cnpj_cpf || prev.cnpj,
                    address: c.address || prev.address,
                    city: (c as any).city || prev.city
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Número do Laudo VL</label>
              <input
                type="text"
                value={laudoParams.laudoNumber}
                onChange={(e) => setLaudoParams({ ...laudoParams, laudoNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Razão Social / Proprietário</label>
              <input
                type="text"
                value={laudoParams.clientName}
                onChange={(e) => setLaudoParams({ ...laudoParams, clientName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">CNPJ / CPF</label>
              <input
                type="text"
                value={laudoParams.cnpj}
                onChange={(e) => setLaudoParams({ ...laudoParams, cnpj: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={laudoParams.address}
                onChange={(e) => setLaudoParams({ ...laudoParams, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Município</label>
              <input
                type="text"
                value={laudoParams.city}
                onChange={(e) => setLaudoParams({ ...laudoParams, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Estado (UF - IT/NT Local)</label>
              <select
                value={laudoParams.state}
                onChange={(e) => setLaudoParams({ ...laudoParams, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="PE">Pernambuco (PE)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="CE">Ceará (CE)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="GO">Goiás (GO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nº Processo no Corpo de Bombeiros</label>
              <input
                type="text"
                value={laudoParams.processoCB}
                onChange={(e) => setLaudoParams({ ...laudoParams, processoCB: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nº Projeto Aprovado / Data</label>
              <input
                type="text"
                value={laudoParams.projetoAprovado}
                onChange={(e) => setLaudoParams({ ...laudoParams, projetoAprovado: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Data da Vistoria</label>
              <input
                type="text"
                value={laudoParams.laudoDate}
                onChange={(e) => setLaudoParams({ ...laudoParams, laudoDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Responsável Técnico</label>
              <input
                type="text"
                value={laudoParams.responsavelTecnico}
                onChange={(e) => setLaudoParams({ ...laudoParams, responsavelTecnico: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Registro CREA / CAU</label>
              <input
                type="text"
                value={laudoParams.registroCrea}
                onChange={(e) => setLaudoParams({ ...laudoParams, registroCrea: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Número ART / RRT</label>
              <input
                type="text"
                value={laudoParams.artRrt}
                onChange={(e) => setLaudoParams({ ...laudoParams, artRrt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* ART PDF / Image Upload */}
            <div className="md:col-span-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Anexar ART / RRT Oficial (PDF ou Imagem)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Anexe o arquivo da ART expedida pelo CREA/CAU para inclusão automática no anexo do laudo.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleArtUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                />
                {laudoParams.artPdfUrl && (
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ART Anexada ({laudoParams.artFileName || 'Arquivo'})</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Área Construída Total</label>
              <input
                type="text"
                value={laudoParams.areaConstruida}
                onChange={(e) => setLaudoParams({ ...laudoParams, areaConstruida: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Número de Pavimentos</label>
              <input
                type="text"
                value={laudoParams.numeroPavimentos}
                onChange={(e) => setLaudoParams({ ...laudoParams, numeroPavimentos: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Altura da Edificação (m)</label>
              <input
                type="text"
                value={laudoParams.alturaEdificacao}
                onChange={(e) => setLaudoParams({ ...laudoParams, alturaEdificacao: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Ocupação / Uso</label>
              <input
                type="text"
                value={laudoParams.tipoOcupacao}
                onChange={(e) => setLaudoParams({ ...laudoParams, tipoOcupacao: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Carga de Incêndio</label>
              <input
                type="text"
                value={laudoParams.cargaIncendio}
                onChange={(e) => setLaudoParams({ ...laudoParams, cargaIncendio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">População Estimada</label>
              <input
                type="text"
                value={laudoParams.populacaoEstimada}
                onChange={(e) => setLaudoParams({ ...laudoParams, populacaoEstimada: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Abastecimento d'Água (RTI)</label>
              <input
                type="text"
                value={laudoParams.fonteAgua}
                onChange={(e) => setLaudoParams({ ...laudoParams, fonteAgua: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Volume de Reserva Técnica (Litros)</label>
              <input
                type="text"
                value={laudoParams.volumeReservaAgua}
                onChange={(e) => setLaudoParams({ ...laudoParams, volumeReservaAgua: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 mb-1">Observações do Vistoriador / Notas de Campo</label>
              <textarea
                rows={3}
                value={laudoParams.notes}
                onChange={(e) => setLaudoParams({ ...laudoParams, notes: e.target.value })}
                placeholder="Insira detalhes observados na vistoria para orientar o motor de IA..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHECKLIST DE CAMPO */}
      {activeTab === 'checklist' && (
        <div id="printable-fire-checklist" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 print:bg-white print:text-slate-900 print:p-0 print:border-none">
          
          {/* Header Action Bar for UI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4 print:hidden">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-red-500" />
                <span>
                  {laudoType === 'ppci' 
                    ? 'Checklist de Levantamento para Pré-Projeto PPCI' 
                    : `Checklist de Vistoria Técnica para ${laudoType.toUpperCase()}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {laudoType === 'ppci'
                  ? 'Levantamento de existência e dimensionamento dos sistemas para elaboração do projeto.'
                  : 'Verificação de conformidade com indicação compulsória de riscos e ações corretivas.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const typeLabel = laudoType.toUpperCase();
                  const bannerBlock = [
                    ['VL ENGENHARIA E SEGURANÇA DO TRABALHO', '', '', '', '', '', ''],
                    ['PROJETOS DE INCÊNDIO (PPCI) • VISTORIAS TÉCNICAS (AVCB/CLCB) • LAUDOS DE SEGURANÇA', '', '', '', '', '', ''],
                    ['CREA-PE: 1822299490 • ENG. VITOR LEONARDO CORDEIRO LINHARES', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', ''],
                    ['CABEÇALHO DE IDENTIFICAÇÃO E DADOS DA VISTORIA DE CAMPO'],
                    ['1. DOCUMENTO:', `CHECKLIST DE VISTORIA E LEVANTAMENTO — ${typeLabel}`, '', '6. DATA DA VISTORIA:', laudoParams.laudoDate || new Date().toLocaleDateString('pt-BR')],
                    ['2. Nº DO LAUDO:', laudoParams.laudoNumber || '________________________________________', '', '7. ART / RRT:', laudoParams.artRrt || '________________________________________'],
                    ['3. CLIENTE / EDIFICAÇÃO:', laudoParams.clientName || '________________________________________', '', '8. CNPJ / CPF:', laudoParams.cnpj || '________________________________________'],
                    ['4. ENDEREÇO DA VISTORIA:', `${laudoParams.address || '________________________________________'}, ${laudoParams.city || ''} - ${laudoParams.state || ''}`, '', '9. MUNICÍPIO / UF:', `${laudoParams.city || '______'} / ${laudoParams.state || 'PE'}`],
                    ['5. RESPONSÁVEL TÉCNICO:', laudoParams.responsavelTecnico || 'Vitor Leonardo Cordeiro Linhares', '', '10. CREA / CAU:', laudoParams.registroCrea || 'CREA-PE 1822299490'],
                    ['', '', '', '', '', '', '']
                  ];

                  let itemRows: any[][] = [];
                  let colWidths: { wch: number }[] = [];

                  if (laudoType === 'ppci') {
                    itemRows = [
                      ['Item Nº', 'Categoria do Sistema', 'Item / Equipamento Avaliado', 'Possui / Existe', 'Dimensionamento / Quantidade', 'Norma Ref / IT', 'Observação de Campo']
                    ];
                    ppciChecklist.forEach((i, idx) => {
                      itemRows.push([
                        idx + 1,
                        i.categoria,
                        i.item,
                        i.possui,
                        i.dimensao || '',
                        i.normaRef,
                        i.observacao
                      ]);
                    });
                    colWidths = [
                      { wch: 8 },  // Item Nº
                      { wch: 25 }, // Categoria
                      { wch: 45 }, // Item Avaliado
                      { wch: 18 }, // Possui
                      { wch: 30 }, // Dimensionamento
                      { wch: 22 }, // Norma Ref
                      { wch: 40 }  // Observação
                    ];
                  } else {
                    itemRows = [
                      ['Item Nº', 'Item Vistoriado', 'Status Conformidade', 'Grau de Risco', 'Ação Corretiva Exigida', 'Prazo (Dias)', 'Norma Ref / IT', 'Observação de Campo']
                    ];
                    avcbChecklist.forEach((i, idx) => {
                      itemRows.push([
                        idx + 1,
                        i.item,
                        i.status,
                        i.risco || 'N/A',
                        i.acaoCorretiva || '',
                        i.prazoDias || '',
                        i.normaRef,
                        i.observacao
                      ]);
                    });
                    colWidths = [
                      { wch: 8 },  // Item Nº
                      { wch: 40 }, // Item Vistoriado
                      { wch: 20 }, // Status
                      { wch: 15 }, // Risco
                      { wch: 35 }, // Ação Corretiva
                      { wch: 12 }, // Prazo
                      { wch: 20 }, // Norma
                      { wch: 40 }  // Obs
                    ];
                  }

                  const wb = XLSX.utils.book_new();
                  const fullSheetData = [...bannerBlock, ...itemRows];
                  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);
                  ws['!cols'] = colWidths;

                  // Add Excel Data Validation for status/possuis columns
                  if (laudoType === 'ppci') {
                    ws['!dataValidation'] = [
                      {
                        sqref: `D12:D${Math.max(100, 11 + ppciChecklist.length)}`,
                        type: 'list',
                        operator: 'equal',
                        formula1: '"SIM,NÃO,NÃO APLICÁVEL"',
                        allowBlank: true,
                        showErrorMessage: true,
                        errorTitle: 'Seleção Inválida',
                        error: 'Escolha uma opção da lista: SIM, NÃO ou NÃO APLICÁVEL.'
                      }
                    ];
                  } else {
                    ws['!dataValidation'] = [
                      {
                        sqref: `C12:C${Math.max(100, 11 + avcbChecklist.length)}`,
                        type: 'list',
                        operator: 'equal',
                        formula1: '"CONFORME,NÃO CONFORME,NÃO APLICÁVEL"',
                        allowBlank: true,
                        showErrorMessage: true,
                        errorTitle: 'Status Inválido',
                        error: 'Escolha um status válido da lista: CONFORME, NÃO CONFORME ou NÃO APLICÁVEL.'
                      },
                      {
                        sqref: `D12:D${Math.max(100, 11 + avcbChecklist.length)}`,
                        type: 'list',
                        operator: 'equal',
                        formula1: '"BAIXO,MÉDIO,GRAVE,CRÍTICO,N/A"',
                        allowBlank: true,
                        showErrorMessage: true,
                        errorTitle: 'Grau de Risco Inválido',
                        error: 'Escolha um grau de risco da lista: BAIXO, MÉDIO, GRAVE, CRÍTICO ou N/A.'
                      }
                    ];
                  }

                  XLSX.utils.book_append_sheet(wb, ws, `Checklist ${typeLabel}`);

                  const safeClient = (laudoParams.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
                  XLSX.writeFile(wb, `Checklist_${typeLabel}_${safeClient}.xlsx`);
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                title="Exportar Checklist para Planilha Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const element = document.getElementById('printable-fire-checklist');
                  if (!element) {
                    window.print();
                    return;
                  }
                  try {
                    const opt = {
                      margin: 6,
                      filename: `Checklist_${laudoType.toUpperCase()}_${(laudoParams.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
                      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    };

                    let exporter = (window as any).html2pdf;
                    if (!exporter) {
                      // @ts-ignore
                      exporter = html2pdf?.default || html2pdf;
                    }

                    if (typeof exporter === 'function') {
                      await exporter().set(opt).from(element).save();
                    } else {
                      window.print();
                    }
                  } catch (err) {
                    console.error('Erro ao gerar PDF:', err);
                    window.print();
                  }
                }}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                title="Exportar Checklist para Documento PDF (.pdf)"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar PDF (.pdf)</span>
              </button>
            </div>
          </div>

          {/* PRINT & PDF BRANDING HEADER */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4 shadow-sm">
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div className="space-y-1">
                <Logo variant="print" className="h-10" />
                <p className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wide">
                  VL ENGENHARIA E SEGURANÇA DO TRABALHO • REGISTRO CREA-PE 1822299490
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-800 space-y-0.5">
                <div className="font-bold text-sm text-slate-900 uppercase">
                  CHECKLIST TÉCNICO DE CAMPO — {laudoType.toUpperCase()}
                </div>
                <div>LAUDO Nº: {laudoParams.laudoNumber || 'N/A'}</div>
                <div>DATA DA VISTORIA: {laudoParams.laudoDate || new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* METADATA SUMMARY TABLE */}
            <div className="border border-slate-300 rounded-xl overflow-hidden text-xs bg-slate-50 font-sans shadow-sm">
              <div className="bg-slate-900 text-white font-bold uppercase tracking-wider p-2 text-[10px] flex justify-between items-center">
                <span>IDENTIFICAÇÃO E DADOS DE CAMPO</span>
                <span className="font-mono text-slate-300">PREENCHIMENTO LIVRE / VISTORIA</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 border-b border-slate-300">
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">CLIENTE / EDIFICAÇÃO / RAZÃO SOCIAL</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.clientName || <span className="text-slate-400 font-normal">________________________________________</span>}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">ENDEREÇO DA VISTORIA</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.address ? `${laudoParams.address}, ${laudoParams.city || ''} - ${laudoParams.state || ''}` : <span className="text-slate-400 font-normal">________________________________________</span>}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-slate-300">
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">CNPJ / CPF</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.cnpj || <span className="text-slate-400 font-normal">____________________</span>}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Nº DO LAUDO</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.laudoNumber || <span className="text-slate-400 font-normal">____________________</span>}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">ART / RRT</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.artRrt || <span className="text-slate-400 font-normal">____________________</span>}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">RESPONSÁVEL TÉCNICO</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {laudoParams.responsavelTecnico || 'Vitor Leonardo Cordeiro Linhares'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {laudoType === 'ppci' ? (
            /* PPCI SURVEY TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Sistema / Equipamento</th>
                    <th className="py-2.5 px-3">Existe?</th>
                    <th className="py-2.5 px-3">Dimensionamento / Quantidade</th>
                    <th className="py-2.5 px-3">Norma Ref / IT-{laudoParams.state}</th>
                    <th className="py-2.5 px-3">Observação de Campo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {ppciChecklist.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">
                        <div>{item.item}</div>
                        <div className="text-[10px] text-slate-500">{item.categoria}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono text-[10px] whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setPpciChecklist(prev => prev.map(i => i.id === item.id ? { ...i, possui: 'SIM' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.possui === 'SIM'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold print:bg-emerald-100 print:border-emerald-600 print:text-emerald-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.possui === 'SIM' ? '☑' : '☐'} SIM
                          </button>
                          <button
                            type="button"
                            onClick={() => setPpciChecklist(prev => prev.map(i => i.id === item.id ? { ...i, possui: 'NAO' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.possui === 'NAO'
                                ? 'bg-red-500/20 border-red-500 text-red-300 font-bold print:bg-red-100 print:border-red-600 print:text-red-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.possui === 'NAO' ? '☑' : '☐'} NÃO
                          </button>
                          <button
                            type="button"
                            onClick={() => setPpciChecklist(prev => prev.map(i => i.id === item.id ? { ...i, possui: 'NAO_APLICAVEL' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.possui === 'NAO_APLICAVEL'
                                ? 'bg-slate-800 border-slate-600 text-slate-200 font-bold print:bg-slate-200 print:border-slate-400 print:text-slate-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.possui === 'NAO_APLICAVEL' ? '☑' : '☐'} N/A
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.dimensao || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPpciChecklist(prev => prev.map(i => i.id === item.id ? { ...i, dimensao: val } : i));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                        />
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.normaRef}
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.observacao}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPpciChecklist(prev => prev.map(i => i.id === item.id ? { ...i, observacao: val } : i));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* AVCB / CLCB CONFORMITY TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item do Sistema</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Norma Ref.</th>
                    <th className="py-2.5 px-3">Risco / Prazo</th>
                    <th className="py-2.5 px-3">Observações / Ação Corretiva</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {avcbChecklist.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white max-w-[220px]">
                        {item.item}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono text-[10px] whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, status: 'CONFORME' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.status === 'CONFORME'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold print:bg-emerald-100 print:border-emerald-600 print:text-emerald-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.status === 'CONFORME' ? '☑' : '☐'} CONF.
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, status: 'NAO_CONFORME' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.status === 'NAO_CONFORME'
                                ? 'bg-red-500/20 border-red-500 text-red-300 font-bold print:bg-red-100 print:border-red-600 print:text-red-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.status === 'NAO_CONFORME' ? '☑' : '☐'} N-CONF.
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, status: 'NAO_APLICAVEL' } : i))}
                            className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                              item.status === 'NAO_APLICAVEL'
                                ? 'bg-slate-800 border-slate-600 text-slate-200 font-bold print:bg-slate-200 print:border-slate-400 print:text-slate-950'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-slate-400'
                            }`}
                          >
                            {item.status === 'NAO_APLICAVEL' ? '☑' : '☐'} N/A
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.normaRef}
                      </td>
                      <td className="py-3 px-3">
                        {item.status === 'NAO_CONFORME' ? (
                          <div className="space-y-1">
                            <select
                              value={item.risco || 'MEDIO'}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, risco: val } : i));
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-amber-400 font-bold"
                            >
                              <option value="BAIXO">Risco Baixo</option>
                              <option value="MEDIO">Risco Médio</option>
                              <option value="GRAVE">Risco Grave</option>
                              <option value="CRITICO">Risco Crítico</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Prazo (dias)"
                              value={item.prazoDias || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, prazoDias: val } : i));
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
                            />
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        <input
                          type="text"
                          placeholder="Observação da vistoria..."
                          value={item.observacao}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, observacao: val } : i));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                        />
                        {item.status === 'NAO_CONFORME' && (
                          <input
                            type="text"
                            placeholder="Ação corretiva recomendada..."
                            value={item.acaoCorretiva || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAvcbChecklist(prev => prev.map(i => i.id === item.id ? { ...i, acaoCorretiva: val } : i));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-300"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDENCIAS & IMAGENS DE VISTORIA */}
      {activeTab === 'nonconformities' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Registro Fotográfico e Resumo de Pendências Identificadas</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Anexe fotos de evidência de campo para enriquecer o laudo oficial expedido.
              </p>
            </div>
            <label className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Anexar Fotos de Vistoria</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Uploaded Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((img) => (
              <div key={img.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-900">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setUploadedImages(prev => prev.filter(i => i.id !== img.id))}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={img.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUploadedImages(prev => prev.map(i => i.id === img.id ? { ...i, title: val } : i));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                  placeholder="Título do anexo fotográfico"
                />
                <input
                  type="text"
                  value={img.obs || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUploadedImages(prev => prev.map(i => i.id === img.id ? { ...i, obs: val } : i));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400"
                  placeholder="Descrição da irregularidade na imagem..."
                />
              </div>
            ))}

            {uploadedImages.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Nenhuma foto de vistoria anexada ainda.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Clique no botão acima para adicionar imagens de evidência.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRICING FORMULATION */}
      {activeTab === 'pricing' && (
        <LaudoPricingTab
          serviceType={`Laudo de Incêndio (${laudoType.toUpperCase()})`}
          clientName={laudoParams.clientName}
          equipmentName={`Instalação de Incêndio (${laudoParams.areaConstruida})`}
        />
      )}

      {/* TAB 5: OFFICIAL FINAL REPORT PREVIEW & PRINT */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Section Toolbar for dynamic ordering & selection */}
          <div className="max-w-[900px] mx-auto print:hidden">
            <SectionOrderToolbar
              sections={sectionsConfig}
              onUpdateSections={setSectionsConfig}
              diagnosticInputData={{
                reportType: laudoType.toUpperCase(),
                clientName: laudoParams.clientName,
                equipmentName: `Edificação (${laudoParams.areaConstruida})`,
                observations: laudoParams.notes
              }}
            />
          </div>

          {/* Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 print:hidden max-w-[900px] mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Ações de Exportação:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copiar Texto Formatado</span>
              </button>
              <button
                onClick={handleExportWord}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
              >
                <FileDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Exportar Word (.doc)</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Gerar PDF Oficial</span>
              </button>
            </div>
          </div>

          {/* Client Summary Box */}
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/30 rounded-2xl p-5 shadow-xl max-w-[900px] mx-auto">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Resumo Executivo para o Cliente (Linguagem Acessível)</span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
              {aiResult.resumoCliente}
            </p>
          </div>

          {/* OFFICIAL PAPER DOCUMENT (A4 PRINTABLE) */}
          <div
            ref={reportRef}
            className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-xl space-y-8 text-xs font-serif leading-relaxed border border-slate-200 mx-auto max-w-[900px]"
          >
            {/* RENDER DYNAMIC SECTIONS IN USER-CONFIGURED ORDER */}
            {getNumberedSections(sectionsConfig).filter(s => s.visible).map((sec) => {
              if (sec.id === 'capa') {
                return (
                  <div key={sec.id} className="flex flex-col justify-between text-center border-b-2 border-slate-900 pb-8 min-h-[700px] space-y-6" style={{ pageBreakAfter: "always" }}>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-red-700 pb-4 gap-4">
                      <Logo variant="print" className="h-12" />
                      <div className="text-right text-xs font-sans text-slate-500">
                        <p className="font-bold text-slate-900">VL ENGENHARIA DIAGNÓSTICA</p>
                        <p>{laudoParams.laudoNumber}</p>
                      </div>
                    </div>

                    <div className="my-auto py-8 space-y-6">
                      <span className="text-[11px] font-sans tracking-widest text-red-700 uppercase font-black bg-red-50 border border-red-200 px-4 py-1.5 rounded-full">
                        LAUDO TÉCNICO ESPECIALIZADO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO
                      </span>

                      <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans py-2 leading-tight uppercase">
                        {laudoType === 'ppci' && 'PRÉ-PROJETO DE PREVENÇÃO E COMBATE A INCÊNDIO (PPCI)'}
                        {laudoType === 'avcb' && 'VISTORIA TÉCNICA PARA OBTENÇÃO/RENOVAÇÃO DE AVCB'}
                        {laudoType === 'clcb' && 'VISTORIA TÉCNICA PARA OBTENÇÃO/RENOVAÇÃO DE CLCB'}
                      </h1>

                      <div className="max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-left font-sans text-xs">
                        <p><strong>EDIFICAÇÃO / CONTRATANTE:</strong> <span className="uppercase font-bold text-slate-900">{laudoParams.clientName}</span></p>
                        <p><strong>CNPJ / CPF:</strong> {laudoParams.cnpj}</p>
                        <p><strong>ENDEREÇO:</strong> {laudoParams.address}, {laudoParams.city} - {laudoParams.state}</p>
                        <p><strong>PROCESSO CORPO DE BOMBEIROS:</strong> <span className="font-mono text-red-700 font-bold">{laudoParams.processoCB}</span></p>
                        <p><strong>ÁREA CONSTRUÍDA:</strong> {laudoParams.areaConstruida} | <strong>PAVIMENTOS:</strong> {laudoParams.numeroPavimentos}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-4 text-xs font-sans text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2">
                      <p><strong>Responsável Técnico:</strong> {laudoParams.responsavelTecnico} ({laudoParams.registroCrea})</p>
                      <p className="font-bold">{laudoParams.city} - {laudoParams.state}, {laudoParams.laudoDate}</p>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'sumario') {
                return (
                  <div key={sec.id} className="space-y-3 border-b border-slate-200 pb-6">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
                      <span>SUMÁRIO EXECUTIVO E INDICADORES DE CONFORMIDADE</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans text-[11px] text-center">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium">Sistemas Vistoriados</div>
                        <div className="text-base font-black text-slate-900">{aiResult.resumoExecutivo.totalItens}</div>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                        <div className="text-emerald-700 font-medium">Itens Conformes</div>
                        <div className="text-base font-black text-emerald-800">{aiResult.resumoExecutivo.conformes} ({aiResult.resumoExecutivo.pctConforme}%)</div>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                        <div className="text-amber-700 font-medium">Pendências Leves</div>
                        <div className="text-base font-black text-amber-800">{aiResult.resumoExecutivo.pendenciasLeves}</div>
                      </div>
                      <div className="bg-red-50 p-2.5 rounded border border-red-200">
                        <div className="text-red-700 font-medium">Pendências Críticas</div>
                        <div className="text-base font-black text-red-800">{aiResult.resumoExecutivo.pendenciasCriticas}</div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'secao_1') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. INTRODUÇÃO, ESCOPO E OBJETIVOS
                    </h2>
                    <p className="text-[11px] text-justify font-sans leading-relaxed">
                      {laudoType === 'ppci' && `Este laudo tem por finalidade registrar o levantamento técnico pericial realizado na edificação acima identificada, para subsidiar o dimensionamento e elaboração do Projeto de Prevenção e Combate a Incêndio (PPCI), conforme normas do Corpo de Bombeiros Militar do Estado de ${laudoParams.state} e normas NBR ABNT aplicáveis.`}
                      {laudoType === 'avcb' && `Verificar a conformidade das instalações de segurança contra incêndio e pânico da edificação frente ao projeto aprovado e à Instrução Técnica vigente do Corpo de Bombeiros de ${laudoParams.state}, para fins de emissão/renovação do Auto de Vistoria do Corpo de Bombeiros (AVCB).`}
                      {laudoType === 'clcb' && `Verificar a conformidade das instalações de segurança contra incêndio da edificação frente ao projeto aprovado e à Norma Técnica/IT vigente do Corpo de Bombeiros de ${laudoParams.state}, para fins de emissão/renovação do Certificado de Licença do Corpo de Bombeiros (CLCB).`}
                    </p>
                  </div>
                );
              }

              if (sec.id === 'secao_2') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. IDENTIFICAÇÃO DO PROCESSO E DA EDIFICAÇÃO
                    </h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-sans text-[11px]">
                      <div><span className="font-bold">Edificação:</span> {laudoParams.clientName}</div>
                      <div><span className="font-bold">CNPJ/CPF:</span> {laudoParams.cnpj}</div>
                      <div className="col-span-2"><span className="font-bold">Endereço:</span> {laudoParams.address}, {laudoParams.city} - {laudoParams.state}</div>
                      <div><span className="font-bold">Nº Processo CB:</span> {laudoParams.processoCB}</div>
                      <div><span className="font-bold">Projeto Aprovado nº / data:</span> {laudoParams.projetoAprovado}</div>
                      <div><span className="font-bold">Responsável Técnico:</span> {laudoParams.responsavelTecnico}</div>
                      <div><span className="font-bold">Registro CREA/CAU:</span> {laudoParams.registroCrea} (ART/RRT: {laudoParams.artRrt})</div>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'secao_3') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. QUALIFICAÇÃO TÉCNICA DA EMPRESA CONTRATADA
                    </h2>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 font-sans text-[11px] space-y-1">
                      <p><strong>Empresa Pericial:</strong> VL ENGENHARIA DIAGNÓSTICA E SEGURANÇA CONTRA INCÊNDIO</p>
                      <p><strong>Engenheiro Responsável:</strong> {laudoParams.responsavelTecnico} — {laudoParams.registroCrea}</p>
                      <p><strong>Especialidade:</strong> Engenharia de Segurança contra Incêndio e Perícias Diagnósticas</p>
                      <p><strong>Contato:</strong> vitorleonardocl@gmail.com | (81) 98444-2592</p>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'secao_4') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. CARACTERÍSTICAS DA EDIFICAÇÃO E CARGA DE INCÊNDIO
                    </h2>
                    <div className="grid grid-cols-3 gap-2 font-sans text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
                      <div><span className="font-bold">Área Construída:</span> {laudoParams.areaConstruida}</div>
                      <div><span className="font-bold">Pavimentos:</span> {laudoParams.numeroPavimentos}</div>
                      <div><span className="font-bold">Altura:</span> {laudoParams.alturaEdificacao}</div>
                      <div><span className="font-bold">Ocupação/Uso:</span> {laudoParams.tipoOcupacao}</div>
                      <div><span className="font-bold">Carga de Incêndio:</span> {laudoParams.cargaIncendio}</div>
                      <div><span className="font-bold">População:</span> {laudoParams.populacaoEstimada}</div>
                      <div className="col-span-3"><span className="font-bold">Abastecimento de Água (RTI):</span> {laudoParams.fonteAgua} — Reserva: {laudoParams.volumeReservaAgua}</div>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'secao_5') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. DOCUMENTAÇÃO TÉCNICA E NORMAS APLICÁVEIS
                    </h2>
                    <ul className="list-disc list-inside font-sans text-[10px] space-y-0.5 text-slate-700">
                      {aiResult.normasAplicaveis?.map((norma, idx) => (
                        <li key={idx}>{norma}</li>
                      )) || (
                        <>
                          <li>Instrução Técnica do CBMPE / Corpo de Bombeiros Militar de {laudoParams.state}</li>
                          <li>ABNT NBR 12693 — Sistemas de proteção por extintores de incêndio</li>
                          <li>ABNT NBR 10898 — Sistema de iluminação de emergência</li>
                          <li>ABNT NBR 13434 — Sinalização de segurança contra incêndio e pânico</li>
                          <li>ABNT NBR 13714 — Sistemas de hidrantes e de mangotinhos</li>
                        </>
                      )}
                    </ul>
                  </div>
                );
              }

              if (sec.id === 'secao_6') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. DIAGNÓSTICO E PARECER TÉCNICO PERICIAL
                    </h2>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 font-sans text-[11px] text-justify leading-relaxed">
                      <p><strong>Situação Técnica Observada:</strong> {aiResult.diagnosticoTecnico}</p>
                      <p><strong>Parecer Conclusivo do Engenheiro:</strong> {aiResult.parecerTecnico}</p>
                    </div>
                  </div>
                );
              }

              if (sec.id === 'secao_7') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. RESULTADO DA VISTORIA POR ITEM E CONFORMIDADE
                    </h2>

                    <table className="w-full text-left border-collapse border border-slate-300 font-sans text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                          <th className="p-1.5 border-r border-slate-300">Item do Sistema</th>
                          <th className="p-1.5 border-r border-slate-300 text-center w-24">Status</th>
                          <th className="p-1.5 border-r border-slate-300 w-32">Norma Referência</th>
                          <th className="p-1.5">Observações de Campo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {laudoType === 'ppci' ? (
                          ppciChecklist.map((item) => (
                            <tr key={item.id}>
                              <td className="p-1.5 border-r border-slate-300 font-semibold">{item.item}</td>
                              <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                                {item.possui === 'SIM' ? 'POSSUI' : item.possui === 'NAO' ? 'NÃO POSSUI' : 'N/A'}
                              </td>
                              <td className="p-1.5 border-r border-slate-300">{item.normaRef}</td>
                              <td className="p-1.5">{item.observacao} {item.dimensao ? `(${item.dimensao})` : ''}</td>
                            </tr>
                          ))
                        ) : (
                          avcbChecklist.map((item) => (
                            <tr key={item.id}>
                              <td className="p-1.5 border-r border-slate-300 font-semibold">{item.item}</td>
                              <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                                <span className={item.status === 'CONFORME' ? 'text-emerald-700' : item.status === 'NAO_CONFORME' ? 'text-red-700' : 'text-slate-500'}>
                                  {item.status === 'CONFORME' ? '[ X ] Conforme' : item.status === 'NAO_CONFORME' ? '[ X ] Não Conforme' : 'N/A'}
                                </span>
                              </td>
                              <td className="p-1.5 border-r border-slate-300">{item.normaRef}</td>
                              <td className="p-1.5">{item.observacao} {item.acaoCorretiva ? `— Ação: ${item.acaoCorretiva}` : ''}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (sec.id === 'secao_8') {
                const pendencias = laudoType === 'ppci' 
                  ? ppciChecklist.filter(i => i.possui === 'NAO') 
                  : avcbChecklist.filter(i => i.status === 'NAO_CONFORME');
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. RELATÓRIO DE NÃO CONFORMIDADES E ADEQUAÇÕES EXIGIDAS
                    </h2>
                    {pendencias.length === 0 ? (
                      <p className="text-[11px] font-sans text-emerald-700 font-bold bg-emerald-50 p-3 rounded border border-emerald-200">
                        Nenhuma não conformidade técnica foi identificada durante a vistoria pericial.
                      </p>
                    ) : (
                      <div className="space-y-2 font-sans text-[10px]">
                        {pendencias.map((p, idx) => (
                          <div key={p.id} className="bg-amber-50/60 border border-amber-200 rounded p-2.5">
                            <div className="font-bold text-amber-900 text-[11px]">
                              Item {idx + 1}: {p.item} — Risco: {(p as any).risco || 'MEDIO'}
                            </div>
                            <div className="text-slate-700 mt-0.5">Norma: {p.normaRef}</div>
                            <div className="text-slate-800 font-semibold mt-1">Observação: {p.observacao || 'Pendente de adequação.'}</div>
                            {(p as any).acaoCorretiva && (
                              <div className="text-red-700 font-bold mt-0.5">Ação Recomendada: {(p as any).acaoCorretiva}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (sec.id === 'secao_9') {
                return uploadedImages.length > 0 ? (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. REGISTRO FOTOGRÁFICO DE CAMPO
                    </h2>
                    <div className="grid grid-cols-2 gap-4 font-sans">
                      {uploadedImages.map((img, idx) => (
                        <div key={img.id} className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                          <img src={img.url} alt={img.title} className="max-h-40 mx-auto object-contain rounded mb-1" />
                          <div className="text-[10px] font-bold text-slate-900">Foto {idx + 1}: {img.title}</div>
                          <div className="text-[9px] text-slate-600">{img.obs}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              }

              if (sec.id === 'secao_10') {
                return (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. CRONOGRAMA RECOMENDADO E PLANO DE AÇÃO
                    </h2>
                    <p className="text-[11px] font-sans text-justify text-slate-700">
                      Recomenda-se a imediata sanção das não conformidades sinalizadas no item anterior em até 30 dias contados da expedição deste laudo, com acompanhamento de responsável técnico habilitado para que a edificação permaneça em estrita regularidade perante o Corpo de Bombeiros.
                    </p>
                  </div>
                );
              }

              if (sec.id === 'secao_11') {
                return (
                  <div key={sec.id} className="space-y-4 pt-2">
                    <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {sec.computedNumber}. PARECER PERICIAL CONCLUSIVO FINAL
                    </h2>

                    <div className="bg-slate-100 p-3 rounded font-sans text-center border border-slate-200">
                      <span className="text-xs font-bold text-slate-900">PARECER TÉCNICO FINAL DO RESPONSÁVEL: </span>
                      <span className="text-xs font-black uppercase tracking-wide text-red-700">
                        {aiResult.parecerFinal.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1">{aiResult.justificativaParecer}</p>
                    </div>

                    <ReportSignature
                      engName={laudoParams.responsavelTecnico}
                      engCrea={laudoParams.registroCrea}
                      artNumber={laudoParams.artRrt}
                      isBlank={laudoParams.blankSignature}
                    />
                  </div>
                );
              }

              if (sec.id === 'secao_12') {
                return (
                  <div key={sec.id} className="space-y-2 pt-2 border-t border-slate-200">
                    <h2 className="text-[11px] font-bold font-sans uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                      {sec.computedNumber}. LIMITAÇÕES TÉCNICAS E RESERVAS PERICIAIS
                    </h2>
                    <p className="text-[9px] text-slate-500 font-sans italic leading-tight">
                      * Observação Importante: Este laudo representa o parecer técnico pericial fundamentado do profissional habilitado abaixo assinado com base no estado visível das instalações na data da vistoria e não substitui o documento formal de vistoria expedido pelo Corpo de Bombeiros Militar.
                    </p>
                  </div>
                );
              }

              if (sec.id === 'anexoArt') {
                return (
                  <div key={sec.id} className="space-y-3 pt-6 border-t-2 border-slate-900" style={{ pageBreakBefore: "always" }}>
                    <div className="border-b-2 border-red-700 pb-2 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-black font-sans uppercase text-slate-900">ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART / RRT)</h2>
                        <p className="text-[10px] text-slate-500 font-sans">Documento de Responsabilidade Profissional — CREA/CAU</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-700">{laudoParams.artRrt}</span>
                    </div>

                    {laudoParams.artPdfUrl ? (
                      <div className="border border-slate-300 rounded-xl p-2 bg-slate-50 text-center">
                        {laudoParams.artPdfUrl.startsWith("data:image/") ? (
                          <img src={laudoParams.artPdfUrl} alt="ART Anexada" className="max-h-[800px] mx-auto object-contain rounded" />
                        ) : (
                          <iframe src={laudoParams.artPdfUrl} title="ART PDF" className="w-full h-[700px] border-none rounded" />
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 font-sans">
                        <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700 uppercase">ART / RRT Pendente de Anexo em Arquivo</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                          Nenhum arquivo de ART em PDF ou imagem foi anexado ainda. Você pode anexar na aba "Dados Gerais" para exibição automática nesta seção.
                        </p>
                      </div>
                    )}
                  </div>
                );
              }

              if (sec.isCustom) {
                return (
                  <CustomSectionRenderer
                    key={sec.id}
                    customSection={sec.customData!}
                    sectionNumber={sec.computedNumber || undefined}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
