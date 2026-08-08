import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import LaudoPricingTab from "./LaudoPricingTab";
import { 
  Shield, 
  FileText, 
  Wand2, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  FileDown, 
  Car, 
  HelpCircle,
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
  ArrowLeft,
  Award,
  Search,
  Image as ImageIcon,
  Calculator
} from "lucide-react";
import {
  UploadedImage,
  ChecklistItem,
  DanoCartao,
  BLOCOS_LABELS,
  DEFAULT_CHECKLIST,
  PREFILLED_PARAMS,
  PREFILLED_CHECKLIST_UPDATES,
  PREFILLED_DANOS,
  DEFAULT_LEGISLACAO,
  DEFAULT_SECOES,
  ChecklistStatus
} from "./montaVeicularData";

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoMontaVeicularIndep({ onBack, initialPrefilled = false, clients }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "pricing" | "preview">("form");

  // Core Parameters state
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LRM-047/2026 Rev. 00",
    clientName: "TransLogística Pernambuco Ltda",
    cnpj: "42.921.848/0001-72",
    address: "Av. Marechal Mascarenhas de Morais, 2901 - Imbiribeira, Recife - PE",
    telephone: "(81) 3444-9090",
    email: "contato@translogisticapereira.com.br",
    ownerName: "Pedro Albuquerque Pereira",
    ownerDoc: "099.482.904-88",
    brand: "Toyota",
    model: "Hilux CD SRV 4x4 2.8 Diesel",
    fabYear: "2023",
    modelYear: "2023",
    color: "Prata Metálico",
    plate: "QYF-9H20",
    vin: "8AJHA82G0PJ482991",
    renavam: "01349820491",
    motorNumber: "1GD-FTV-849201",
    fuel: "DIESEL",
    category: "PARTICULAR",
    bodyType: "PICKUP",
    mileage: "42.500 km",
    conditionPre: "Excelente estado de conservação, sem registro de sinistros anteriores no prontuário.",
    conditionActual: "O veículo apresenta colisão frontal-lateral esquerda de média intensidade, com deformação da torre de suspensão esquerda, para-lama esquerdo e danos em para-choque.",
    insuranceCompany: "Porto Seguro Companhia de Seguros Gerais",
    claimNumber: "CLAIM-90492-2026",
    claimDate: "12/05/2026",
    claimType: "Colisão frontal-lateral",
    inspectionCity: "Recife",
    inspectionState: "PE",
    inspectionDate: "20/05/2026",
    notes: "O veículo foi classificado inicialmente como Grande Monta devido ao acionamento dos airbags e deformação parcial na soleira esquerda. O proprietário contesta a classificação inicial fundamentando-se na inexistência de deformações permanentes nas colunas principais A, B, C e sem invasão de habitáculo. O presente laudo visa a reclassificação técnica sob as diretrizes da Resolução CONTRAN nº 810/2020.",
    normasAdicionais: "Resolução CONTRAN nº 810/2020, ABNT NBR 13042"
  });

  // Structural checklists, damages, text sections
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [danos, setDanos] = useState<DanoCartao[]>([]);
  const [secoes, setSecoes] = useState<Record<string, string>>(DEFAULT_SECOES);
  
  // Accordion active bloco state for editing checklist
  const [activeBloco, setActiveBloco] = useState<string>("bloco_1");

  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize prefilled if requested
  useEffect(() => {
    if (initialPrefilled) {
      loadSimulatedData();
    }
  }, [initialPrefilled]);

  // Load complete prefilled demo data
  const loadSimulatedData = () => {
    setLaudoParams(PREFILLED_PARAMS);
    setChecklist(prev => 
      prev.map(item => {
        const update = PREFILLED_CHECKLIST_UPDATES[item.id];
        if (update) {
          return { 
            ...item, 
            status: update, 
            nota: update === "DM" ? "Dano médio identificado por imagem." : "Dano menor ou leve." 
          };
        }
        return { ...item, status: "OK", nota: "Componente em perfeito estado de conservação." };
      })
    );
    setDanos(PREFILLED_DANOS);
    setSecoes(DEFAULT_SECOES);
    
    // Add default images if empty
    if (uploadedImages.length === 0) {
      setUploadedImages([
        {
          name: "torre_esquerda_sinistro.jpg",
          data: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400",
          description: "Deformação parcial na torre de suspensão dianteira esquerda - Média Monta"
        },
        {
          name: "soleira_lateral_esq.jpg",
          data: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400",
          description: "Amassamento localizado na soleira esquerda por impacto - Média Monta"
        }
      ]);
    }
  };

  // Reset Form
  const clearForm = () => {
    if (window.confirm("Deseja realmente limpar todos os campos do formulário?")) {
      setLaudoParams({
        laudoNumber: "LRM-047/2026 Rev. 00",
        clientName: "",
        cnpj: "",
        address: "",
        telephone: "",
        email: "",
        ownerName: "",
        ownerDoc: "",
        brand: "",
        model: "",
        fabYear: "2024",
        modelYear: "2024",
        color: "",
        plate: "",
        vin: "",
        renavam: "",
        motorNumber: "",
        fuel: "FLEX",
        category: "PARTICULAR",
        bodyType: "SEDAN",
        mileage: "",
        conditionPre: "",
        conditionActual: "",
        insuranceCompany: "",
        claimNumber: "",
        claimDate: "",
        claimType: "",
        inspectionCity: "Recife",
        inspectionState: "PE",
        inspectionDate: new Date().toLocaleDateString("pt-BR"),
        notes: ""
      });
      setChecklist(DEFAULT_CHECKLIST.map(item => ({ ...item, status: "OK", nota: "" })));
      setDanos([]);
      setSecoes({
        introducao: "Aguardando preenchimento ou geração inteligente...",
        metodologia: "Aguardando preenchimento ou geração inteligente...",
        limitacoes: "Aguardando preenchimento ou geração inteligente...",
        conclusao: "Aguardando preenchimento ou geração inteligente..."
      });
      setUploadedImages([]);
    }
  };

  // Input change handler
  const handleInputChange = (field: keyof typeof laudoParams, value: string) => {
    setLaudoParams(prev => ({ ...prev, [field]: value }));
  };

  // Checklist status/note update
  const handleChecklistUpdate = (id: string, field: "status" | "nota", value: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value as any } : item))
    );
  };

  // Image upload handling with local preview
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [
          ...prev,
          {
            name: file.name,
            data: reader.result as string,
            description: "Registro visual: " + file.name.split(".")[0]
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

  // Damage Card Manual CRUD
  const addDanoCard = () => {
    const nextId = `dano_${danos.length + 1}`;
    setDanos(prev => [
      ...prev,
      {
        id: nextId,
        fotoRef: "Foto [N°] — [Ângulo]",
        localizacao: "Região do Veículo",
        componente: "Nome Técnico da Peça",
        descricaoDano: "Descrição técnica dos danos visualizados...",
        tipoDano: "Deformação",
        enquadramento: "Resolução CONTRAN 810/2020 — Anexo II",
        classificacao: "MÉDIA",
        grauConfianca: "★★★★★",
        grauConfiancaPercentual: 95,
        justificativa: "Evidência fotográfica direta demonstrando...",
        impactoSeguranca: "MÉDIO",
        reparabilidade: "RECUPERÁVEL"
      }
    ]);
  };

  const updateDanoCard = (id: string, field: keyof DanoCartao, value: any) => {
    setDanos(prev =>
      prev.map(card => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const removeDanoCard = (id: string) => {
    setDanos(prev => prev.filter(card => card.id !== id));
  };

  // Trigger Gemini AI Reclassification Auditor
  const triggerGeminiAudit = async () => {
    setLoadingAI(true);
    try {
      const payload = {
        ...laudoParams,
        checklist,
        danos,
        images: uploadedImages.slice(0, 3) // Send first 3 images with base64 data
      };

      const res = await fetch("/api/gemini/monta-veicular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erro na requisição do servidor.");
      }

      const data = await res.json();
      
      // Update state with Gemini output
      if (data.checklist) {
        setChecklist(prev => prev.map(item => {
          const match = data.checklist[item.id];
          if (match) {
            return { ...item, status: match.resposta, nota: match.nota };
          }
          return item;
        }));
      }

      if (data.danos && Array.isArray(data.danos)) {
        setDanos(data.danos);
      }
      
      if (data.secoes) {
        setSecoes(data.secoes);
      }

      setActiveTab("preview");
    } catch (err) {
      console.error(err);
      alert("Conexão com a IA indisponível. Carregando dados de simulação pericial do CONTRAN 810/2020.");
      loadSimulatedData();
    } finally {
      setLoadingAI(false);
    }
  };

  // Export functions using pdfUtils and html2pdf
  const printLaudoPDF = async () => {
    if (!reportRef.current) return;
    try {
      await preprocessStylesheets(reportRef.current);
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${laudoParams.laudoNumber.replace(/\//g, "-")}-reclassificacao-monta-veicular.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css"] as any }
      };
      await html2pdf().from(reportRef.current).set(opt).save();
    } catch (e) {
      console.error(e);
      alert("Erro ao exportar PDF.");
    } finally {
      restoreStylesheets();
    }
  };

  const handleCopyRichText = async () => {
    const ok = await copyRichText("laudo-printable-area");
    if (ok) alert("Laudo copiado para a área de transferência com sucesso!");
  };

  const handleExportWord = () => {
    exportToWord("laudo-printable-area", `${laudoParams.laudoNumber.replace(/\//g, "-")}-reclassificacao-monta-veicular`);
  };

  // Determine Overall Vehicle Classification based on CONTRAN 810/2020 Rules
  // Rule: Component of highest classification determines the overall vehicle classification
  const getOverallClassification = () => {
    // If chassi (VIN) is damaged or ilegivel, automatically GRANDE MONTA
    const vinStatus = checklist.find(item => item.id === "b9_1")?.status;
    if (vinStatus === "DM" || vinStatus === "DG") {
      return {
        label: "GRANDE MONTA (Irrecuperável / Baixa)",
        color: "bg-red-600 text-white",
        icon: AlertTriangle,
        desc: "Atenção: Número de chassi (VIN) ou elemento estrutural correspondente com avaria grave detectada. Veículo enquadrado em Grande Monta de forma compulsória e irreversível."
      };
    }

    let hasGrande = danos.some(d => d.classificacao === "GRANDE") || checklist.some(c => c.status === "DG");
    let hasMedia = danos.some(d => d.classificacao === "MÉDIA") || checklist.some(c => c.status === "DM");

    if (hasGrande) {
      return {
        label: "GRANDE MONTA (Irrecuperável / Baixa)",
        color: "bg-red-600 text-white border-red-500",
        icon: AlertTriangle,
        desc: "Classificação conforme Anexo III da Resolução CONTRAN nº 810/2020. Exige baixa de registro definitiva no DETRAN, sendo vedada a circulação pública."
      };
    } else if (hasMedia) {
      return {
        label: "MÉDIA MONTA (Recuperável após CSV)",
        color: "bg-amber-500 text-slate-950 border-amber-400",
        icon: AlertTriangle,
        desc: "Classificação conforme Anexo II da Resolução CONTRAN nº 810/2020. O veículo poderá retornar à circulação após reparo qualificado e emissão de CSV em ITL licenciada."
      };
    } else {
      return {
        label: "PEQUENA MONTA (Liberado)",
        color: "bg-emerald-600 text-white border-emerald-500",
        icon: CheckCircle,
        desc: "Classificação conforme Anexo I da Resolução CONTRAN nº 810/2020. Não há bloqueio administrativo de circulação no cadastro do RENAVAM."
      };
    }
  };

  const overall = getOverallClassification();

  return (
    <div className={`space-y-8 animate-fade-in text-left ${fullscreen ? "fixed inset-0 z-50 bg-slate-900 overflow-y-auto p-6 md:p-12" : ""}`}>
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-[#134074] dark:text-[#4895EF] hover:underline mb-1 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Central
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-[#134074] dark:text-[#4895EF]" />
            <span>Reclassificação de Monta Veicular (CONTRAN 810/2020)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Estudo pericial de reclassificação de monta para veículos sinistrados. Anexos I, II e III da Resolução CONTRAN nº 810/2020.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            title={fullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("form")}
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer ${
            activeTab === "form"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Formulário & Auditoria
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer flex items-center gap-1 ${
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
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer ${
            activeTab === "preview"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Visualizar Laudo (A4)
        </button>
      </div>

      {/* Main Grid */}
      {activeTab === "pricing" ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Reclassificação de Monta Veicular"
            equipmentName={`${laudoParams.vehicleBrand} ${laudoParams.vehicleModel}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Editing / Form controls (Hidden when preview in non-fullscreen if desired, but let's toggle with tab) */}
        <div className={`xl:col-span-7 space-y-8 ${activeTab === "preview" ? "hidden xl:block" : ""}`}>
          
          {/* Quick Actions Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm tracking-wide uppercase">Ações do Laudo Técnico</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Utilize o assistente de inteligência artificial ou carregue o modelo pericial preenchido para avaliar a integridade estrutural e a correta enquadração do veículo.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={triggerGeminiAudit}
                disabled={loadingAI}
                className="flex items-center gap-2 px-5 py-3 bg-[#4895EF] hover:bg-[#4895EF]/95 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {loadingAI ? (
                  <span className="flex items-center gap-1.5">
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                    Analisando Sinistro...
                  </span>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 animate-pulse text-amber-300" />
                    Gerar com IA (Gemini)
                  </>
                )}
              </button>

              <button
                onClick={loadSimulatedData}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Simular Vistoria
              </button>

              <button
                onClick={clearForm}
                className="flex items-center gap-2 px-5 py-3 bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-900/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Campos
              </button>
            </div>
          </div>

          {/* Form Panel: General and Vehicle Specs */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <span>1. Informações Gerais e do Proprietário</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nº do Laudo</label>
                <input
                  type="text"
                  value={laudoParams.laudoNumber}
                  onChange={(e) => handleInputChange("laudoNumber", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Proprietário / Razão Social</label>
                <input
                  type="text"
                  value={laudoParams.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: Pedro de Souza"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">CPF / CNPJ do Proprietário</label>
                <input
                  type="text"
                  value={laudoParams.ownerDoc}
                  onChange={(e) => handleInputChange("ownerDoc", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: 000.000.000-00"
                />
              </div>


              {/* Seleção de Cliente Pré-cadastrado */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl mb-4 col-span-1 md:col-span-2">
                <ClientSelector
                  clients={clients}
                  label="Selecionar Cliente Cadastrado"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setLaudoParams(prev => ({
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
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cliente Solicitante (Se diferente)</label>
                <input
                  type="text"
                  value={laudoParams.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: Seguradora X"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Endereço da Vistoria</label>
                <input
                  type="text"
                  value={laudoParams.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Av. Mascarenhas de Morais..."
                />
              </div>
            </div>
          </div>

          {/* Form Panel: Vehicle Details */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <span>2. Caracterização Técnica do Veículo</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Marca / Modelo</label>
                <input
                  type="text"
                  value={laudoParams.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fabricante (Marca)</label>
                <input
                  type="text"
                  value={laudoParams.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Placa</label>
                <input
                  type="text"
                  value={laudoParams.plate}
                  onChange={(e) => handleInputChange("plate", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Chassi (VIN)</label>
                <input
                  type="text"
                  value={laudoParams.vin}
                  onChange={(e) => handleInputChange("vin", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">RENAVAM</label>
                <input
                  type="text"
                  value={laudoParams.renavam}
                  onChange={(e) => handleInputChange("renavam", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ano Fabricação</label>
                <input
                  type="text"
                  value={laudoParams.fabYear}
                  onChange={(e) => handleInputChange("fabYear", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ano Modelo</label>
                <input
                  type="text"
                  value={laudoParams.modelYear}
                  onChange={(e) => handleInputChange("modelYear", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cor</label>
                <input
                  type="text"
                  value={laudoParams.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quilometragem</label>
                <input
                  type="text"
                  value={laudoParams.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: 15.000 km"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Combustível</label>
                <select
                  value={laudoParams.fuel}
                  onChange={(e) => handleInputChange("fuel", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer"
                >
                  <option value="FLEX">FLEX</option>
                  <option value="GASOLINA">GASOLINA</option>
                  <option value="ALCOOL">ÁLCOOL</option>
                  <option value="DIESEL">DIESEL</option>
                  <option value="HIBRIDO">HÍBRIDO</option>
                  <option value="ELETRICO">ELÉTRICO</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Categoria</label>
                <input
                  type="text"
                  value={laudoParams.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Carroceria</label>
                <input
                  type="text"
                  value={laudoParams.bodyType}
                  onChange={(e) => handleInputChange("bodyType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="PICKUP, SEDAN, HATCH..."
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Nº do Motor</label>
                <input
                  type="text"
                  value={laudoParams.motorNumber}
                  onChange={(e) => handleInputChange("motorNumber", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Panel: Sinistro e Inspeção */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <span>3. Histórico do Sinistro e Inspeção</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seguradora</label>
                <input
                  type="text"
                  value={laudoParams.insuranceCompany}
                  onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: Porto Seguro"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Nº do Sinistro / Processo</label>
                <input
                  type="text"
                  value={laudoParams.claimNumber}
                  onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data do Sinistro</label>
                <input
                  type="text"
                  value={laudoParams.claimDate}
                  onChange={(e) => handleInputChange("claimDate", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cidade da Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionCity}
                  onChange={(e) => handleInputChange("inspectionCity", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estado da Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionState}
                  onChange={(e) => handleInputChange("inspectionState", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data da Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionDate}
                  onChange={(e) => handleInputChange("inspectionDate", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  placeholder="Ex: Resolução CONTRAN nº 810/2020, ABNT NBR 13042, etc. (Separe por vírgulas)"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-white"
                  value={laudoParams.normasAdicionais || ""}
                  onChange={(e) => handleInputChange("normasAdicionais", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição do Sinistro / Tipo de Colisão</label>
                <input
                  type="text"
                  value={laudoParams.claimType}
                  onChange={(e) => handleInputChange("claimType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="Ex: Colisão frontal com colisão secundária traseira..."
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estado de Conservação Pré-Acidente</label>
                <textarea
                  value={laudoParams.conditionPre}
                  onChange={(e) => handleInputChange("conditionPre", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-16 resize-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estado de Conservação Atual</label>
                <textarea
                  value={laudoParams.conditionActual}
                  onChange={(e) => handleInputChange("conditionActual", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-16 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Panel: Interactive Checklist grouped by Blocks */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <span>4. Checklist Técnico (CONTRAN 810/2020)</span>
              </h3>
              <span className="text-[10px] text-slate-400 italic">9 blocos de avaliação obrigatória</span>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {Object.entries(BLOCOS_LABELS).map(([blocoKey, label]) => {
                const itemsInBloco = checklist.filter(item => item.bloco === blocoKey);
                const isExpanded = activeBloco === blocoKey;
                const affectedCount = itemsInBloco.filter(item => item.status !== "OK").length;

                return (
                  <div 
                    key={blocoKey} 
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-900/30"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setActiveBloco(isExpanded ? "" : blocoKey)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <span className="text-[#134074] dark:text-[#4895EF] flex items-center gap-2">
                        {label}
                        {affectedCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black font-mono">
                            {affectedCount} AVARIADOS
                          </span>
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {/* Items table */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950 space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
                          <div className="col-span-5">Componente</div>
                          <div className="col-span-3">Status</div>
                          <div className="col-span-4">Nota de Avaliação</div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-900 space-y-2.5">
                          {itemsInBloco.map(item => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 pt-2.5 items-center">
                              <div className="col-span-5 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <span className="font-mono text-[10px] text-slate-400">{item.id.replace("b", "A")}</span>
                                <span>{item.name}</span>
                              </div>
                              <div className="col-span-3">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleChecklistUpdate(item.id, "status", e.target.value)}
                                  className={`w-full px-2 py-1.5 border rounded-lg text-[11px] font-bold cursor-pointer ${
                                    item.status === "OK" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    item.status === "DM" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    item.status === "DG" ? "bg-red-50 text-red-700 border-red-200" :
                                    item.status === "NI" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    "bg-slate-100 text-slate-600 border-slate-300"
                                  }`}
                                >
                                  <option value="OK">OK (Sem Danos)</option>
                                  <option value="DM">DM (Dano Médio)</option>
                                  <option value="DG">DG (Dano Grande)</option>
                                  <option value="NI">NI (Dano Leve / Não Imp.)</option>
                                  <option value="NA">NA (Não Avaliado)</option>
                                </select>
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={item.nota}
                                  onChange={(e) => handleChecklistUpdate(item.id, "nota", e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                  placeholder="Nota técnica visual..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Panel: Cartões de Dano (Anexo I, II, III evidence) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                <span>5. Cartões de Dano (Evidências de Monta)</span>
              </h3>
              <button
                onClick={addDanoCard}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white text-xs font-black rounded-lg cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Evidência
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Cada componente danificado visível deve conter um Cartão de Dano específico apontando enquadramento normativo na Resolução CONTRAN 810/2020, grau de confiança visual e impacto na segurança.
            </p>

            {danos.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-400">Nenhum Cartão de Dano inserido ainda.</p>
                <button
                  onClick={addDanoCard}
                  className="text-xs text-[#134074] dark:text-[#4895EF] font-bold hover:underline"
                >
                  Criar primeiro cartão manualmente
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {danos.map((d, index) => (
                  <div key={d.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 relative bg-slate-50/30 dark:bg-slate-900/10">
                    <button
                      onClick={() => removeDanoCard(d.id)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                      title="Excluir Evidência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 text-xs font-black text-[#134074] dark:text-[#4895EF]">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">DANO #{index + 1}</span>
                      <span className="font-sans uppercase">Avaria Estrutural ou de Segurança</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Foto de Ref.</label>
                        <input
                          type="text"
                          value={d.fotoRef}
                          onChange={(e) => updateDanoCard(d.id, "fotoRef", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-black uppercase text-slate-400">Componente</label>
                        <input
                          type="text"
                          value={d.componente}
                          onChange={(e) => updateDanoCard(d.id, "componente", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Localização</label>
                        <input
                          type="text"
                          value={d.localizacao}
                          onChange={(e) => updateDanoCard(d.id, "localizacao", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Tipo de Avaria</label>
                        <select
                          value={d.tipoDano}
                          onChange={(e) => updateDanoCard(d.id, "tipoDano", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer"
                        >
                          <option value="Amassamento">Amassamento</option>
                          <option value="Deformação">Deformação</option>
                          <option value="Fratura">Fratura / Trinca</option>
                          <option value="Torção">Torção</option>
                          <option value="Corte">Corte</option>
                          <option value="Substituição">Substituição</option>
                          <option value="Acionamento">Acionamento (SRS)</option>
                          <option value="Corrosão">Corrosão</option>
                          <option value="Incêndio">Incêndio</option>
                          <option value="Alagamento">Alagamento</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Enquadramento Normativo</label>
                        <input
                          type="text"
                          value={d.enquadramento}
                          onChange={(e) => updateDanoCard(d.id, "enquadramento", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Classificação de Monta</label>
                        <select
                          value={d.classificacao}
                          onChange={(e) => updateDanoCard(d.id, "classificacao", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer"
                        >
                          <option value="PEQUENA">PEQUENA MONTA</option>
                          <option value="MÉDIA">MÉDIA MONTA</option>
                          <option value="GRANDE">GRANDE MONTA</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Grau de Confiança Visual</label>
                        <select
                          value={d.grauConfianca}
                          onChange={(e) => {
                            const stars = e.target.value;
                            const percent = stars === "★★★★★" ? 98 : stars === "★★★★☆" ? 90 : stars === "★★★☆☆" ? 75 : stars === "★★☆☆☆" ? 50 : 30;
                            updateDanoCard(d.id, "grauConfianca", stars);
                            updateDanoCard(d.id, "grauConfiancaPercentual", percent);
                          }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer"
                        >
                          <option value="★★★★★">★★★★★ (Excelente &gt;=95%)</option>
                          <option value="★★★★☆">★★★★☆ (Alto 80-94%)</option>
                          <option value="★★★☆☆">★★★☆☆ (Médio 60-79%)</option>
                          <option value="★★☆☆☆">★★☆☆☆ (Baixo 40-59%)</option>
                          <option value="★☆☆☆☆">★☆☆☆☆ (Muito Baixo &lt;40%)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Reparabilidade</label>
                        <select
                          value={d.reparabilidade}
                          onChange={(e) => updateDanoCard(d.id, "reparabilidade", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer"
                        >
                          <option value="RECUPERÁVEL">RECUPERÁVEL</option>
                          <option value="SUBSTITUIÇÃO NECESSÁRIA">SUBSTITUIÇÃO NECESSÁRIA</option>
                          <option value="PERDA TOTAL PROVÁVEL">PERDA TOTAL PROVÁVEL</option>
                          <option value="A AVALIAR PRESENCIALMENTE">A AVALIAR PRESENCIALMENTE</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[9px] font-black uppercase text-slate-400">Descrição Detalhada do Dano Visualizado</label>
                        <input
                          type="text"
                          value={d.descricaoDano}
                          onChange={(e) => updateDanoCard(d.id, "descricaoDano", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[9px] font-black uppercase text-slate-400">Justificativa Técnica do Dano por Imagem</label>
                        <textarea
                          value={d.justificativa}
                          onChange={(e) => updateDanoCard(d.id, "justificativa", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs h-16 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Panel: Photo Upload Section */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <span>6. Galeria Fotográfica de Sinistro (Fotos para o Laudo)</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Arraste ou clique para enviar fotos do sinistro</p>
                    <p className="text-[10px] text-slate-400 font-medium">JPEG, PNG ou GIF (Máximo 3 arquivos para processamento IA)</p>
                  </div>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex gap-3 items-start bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border">
                        <img src={img.data} alt={img.name} className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[10px] font-mono font-bold truncate text-slate-400">{img.name}</p>
                          <button onClick={() => removeImage(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={img.description}
                          onChange={(e) => updateImageDescription(i, e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px]"
                          placeholder="Legenda da foto..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Panel: Text Sections (Introdução, Metodologia, Limitações, Conclusão) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
              <span>7. Seções Técnicas Textuais</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Introdução do Parecer</label>
                <textarea
                  value={secoes.introducao}
                  onChange={(e) => setSecoes(prev => ({ ...prev, introducao: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-32"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Metodologia Pericial Aplicada</label>
                <textarea
                  value={secoes.metodologia}
                  onChange={(e) => setSecoes(prev => ({ ...prev, metodologia: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-32"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Limitações de Auditoria Visual</label>
                <textarea
                  value={secoes.limitacoes}
                  onChange={(e) => setSecoes(prev => ({ ...prev, limitacoes: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-32"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Conclusão e Parecer Conclusivo</label>
                <textarea
                  value={secoes.conclusao}
                  onChange={(e) => setSecoes(prev => ({ ...prev, conclusao: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-32"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Print/Preview (Always visible on desktop, tabbed on mobile) */}
        <div className={`xl:col-span-5 space-y-6 ${activeTab === "form" ? "hidden xl:block" : ""}`}>
          
          {/* Quick PDF/Word Export Toolbar */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-2 justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase font-mono">Exportar Documento</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={printLaudoPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#134074] hover:bg-[#134074]/90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> PDF (A4)
              </button>

              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                <FileDown className="w-3.5 h-3.5" /> Word (.doc)
              </button>

              <button
                onClick={handleCopyRichText}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Texto
              </button>
            </div>
          </div>

          {/* Dynamic Overall Rating Card in Side Preview */}
          <div className={`border rounded-2xl p-5 space-y-3 ${overall.color} shadow-lg`}>
            <div className="flex items-center gap-2.5">
              <overall.icon className="w-6 h-6 shrink-0 text-white" />
              <h4 className="font-black text-sm tracking-wide uppercase">Classificação Geral Proposta</h4>
            </div>
            <div className="text-xl font-black font-sans">{overall.label}</div>
            <p className="text-[11px] leading-relaxed opacity-90">{overall.desc}</p>
          </div>

          {/* Printable Container wrapper */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* The printable boundary conforming to strict A4 format */}
            <div 
              ref={reportRef}
              id="laudo-printable-area"
              className="bg-white text-slate-900 p-8 md:p-12 space-y-8 font-sans text-xs leading-relaxed max-w-full print:p-0 print:text-[10px]"
              style={{ minHeight: "297mm" }}
            >
              
              {/* Header block with company details */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <Logo variant="print" className="h-12" />
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    VL Engenharia & Inspeções S/S Ltda
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono leading-tight">
                    Crea-PE 1822299490 | CNPJ: 50.842.103/0001-92<br />
                    Recife - Pernambuco | Tel: (81) 98444-2592
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black tracking-widest uppercase font-mono border">
                    LAUDO TÉCNICO
                  </div>
                  <div className="text-[10px] font-black text-slate-700 font-mono">
                    Nº {laudoParams.laudoNumber}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold font-mono">
                    EMISSÃO: {laudoParams.inspectionDate || "Data atual"}
                  </div>
                </div>
              </div>

              {/* Cover Title */}
              <div className="text-center space-y-3 py-6 bg-slate-50 border rounded-2xl">
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  Laudo Pericial de Reclassificação de Monta
                </h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  RESOLUÇÃO CONTRAN Nº 810/2020 (ANEXOS I, II E III)
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 font-mono text-[9px] font-black">
                  <span>PLACA:</span>
                  <span className="text-slate-900">{laudoParams.plate || "NÃO INFORMADO"}</span>
                  <span className="text-slate-400">|</span>
                  <span>CHASSI:</span>
                  <span className="text-slate-900">{laudoParams.vin || "NÃO INFORMADO"}</span>
                </div>
              </div>

              {/* Section 1: Customer Data */}
              <div className="space-y-2">
                <div className="border-b border-slate-900 pb-1 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    1. Identificação do Solicitante e do Proprietário
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-slate-400">Pág. 01</span>
                </div>
                
                <table className="w-full text-left border-collapse border border-slate-200">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 w-1/4 uppercase text-[8px] text-slate-500">Proprietário:</td>
                      <td className="p-2 font-bold text-slate-800 text-[10px]">{laudoParams.ownerName || "Não informado"}</td>
                      <td className="p-2 font-bold bg-slate-50 w-1/6 uppercase text-[8px] text-slate-500">Doc / CPF / CNPJ:</td>
                      <td className="p-2 font-mono text-[9px] text-slate-800">{laudoParams.ownerDoc || "Não informado"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Cliente Solicitante:</td>
                      <td className="p-2 text-slate-700">{laudoParams.clientName || laudoParams.ownerName || "Não informado"}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">CNPJ:</td>
                      <td className="p-2 font-mono text-[9px] text-slate-700">{laudoParams.cnpj || "Não informado"}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Endereço Vistoria:</td>
                      <td className="p-2 text-slate-600" colSpan={3}>{laudoParams.address || "Não informado"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Vehicle Specs */}
              <div className="space-y-2">
                <div className="border-b border-slate-900 pb-1">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    2. Dados Técnicos de Identificação do Veículo
                  </h3>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Marca / Modelo:</td>
                      <td className="p-2 font-bold text-slate-800" colSpan={3}>{laudoParams.model || "Não informado"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Nº do Chassi (VIN):</td>
                      <td className="p-2 font-mono text-[9px] text-slate-800 font-bold">{laudoParams.vin || "Não informado"}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Nº do Motor:</td>
                      <td className="p-2 font-mono text-[9px] text-slate-700">{laudoParams.motorNumber || "Não informado"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">RENAVAM:</td>
                      <td className="p-2 font-mono text-[9px] text-slate-700">{laudoParams.renavam || "Não informado"}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500 font-sans">Combustível:</td>
                      <td className="p-2 text-slate-700 font-bold text-[9px]">{laudoParams.fuel}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Ano Fabr / Modelo:</td>
                      <td className="p-2 text-slate-700">{laudoParams.fabYear} / {laudoParams.modelYear}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Cor Predominante:</td>
                      <td className="p-2 text-slate-700">{laudoParams.color || "Não informado"}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Carroceria / Km:</td>
                      <td className="p-2 text-slate-700">{laudoParams.bodyType} | {laudoParams.mileage}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Categoria:</td>
                      <td className="p-2 text-slate-700">{laudoParams.category}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Claim Info */}
              <div className="space-y-2">
                <div className="border-b border-slate-900 pb-1">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    3. Dados de Ocorrência do Sinistro e Vistoria
                  </h3>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Seguradora Parceira:</td>
                      <td className="p-2 text-slate-700">{laudoParams.insuranceCompany || "N/A"}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Nº do Sinistro:</td>
                      <td className="p-2 font-mono text-[9px] text-slate-700">{laudoParams.claimNumber || "N/A"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Data Sinistro / Tipo:</td>
                      <td className="p-2 text-slate-600" colSpan={3}>{laudoParams.claimDate || "Não informada"} | {laudoParams.claimType || "Colisão"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Local da Inspeção:</td>
                      <td className="p-2 text-slate-700">{laudoParams.inspectionCity || "Recife"} - {laudoParams.inspectionState || "PE"}</td>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Data Perícia:</td>
                      <td className="p-2 text-slate-700 font-bold">{laudoParams.inspectionDate}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-50 uppercase text-[8px] text-slate-500">Observações de Entrada:</td>
                      <td className="p-2 text-slate-600 italic text-[9px] leading-tight" colSpan={3}>{laudoParams.notes || "Nenhuma observação técnica adicional registrada."}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Force page break in PDF */}
              <div className="html2pdf__page-break"></div>

              {/* Section 4: Legislative baseline */}
              <div className="space-y-2">
                <div className="border-b border-slate-900 pb-1 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    4. Fundamentação e Legislação Técnica Aplicada
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-slate-400">Pág. 02</span>
                </div>
                <p className="text-[9.5px] text-slate-600 text-justify">
                  A reclassificação de monta veicular baseia-se exclusivamente no rigor da **Resolução CONTRAN nº 810 de 30 de Outubro de 2020**, que dispõe sobre os requisitos para a classificação de danos decorrentes de acidentes e os procedimentos para a regularização ou baixa de veículos sinistrados. O enquadramento segue a determinação matemática onde o maior índice de gravidade estrutural define a classificação final.
                </p>
                
                <table className="w-full text-left border-collapse border border-slate-200 text-[8px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-black">
                      <th className="p-1.5">Norma / Referência</th>
                      <th className="p-1.5">Órgão Regulador</th>
                      <th className="p-1.5">Aplicação e Escopo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-bold">Resolução CONTRAN nº 810/2020</td>
                      <td className="p-1.5">CONTRAN / SENATRAN</td>
                      <td className="p-1.5">Determina classificação em Pequena, Média ou Grande Monta por soma e criticidade estrutural.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 font-bold">Artigo 126 do CTB (Lei 9.503/97)</td>
                      <td className="p-1.5 font-bold">Congresso Nacional</td>
                      <td className="p-1.5">Trata da obrigatoriedade de comunicação do sinistro e bloqueio temporário do prontuário veicular.</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold">ABNT NBR 14447:2008</td>
                      <td className="p-1.5">ABNT</td>
                      <td className="p-1.5 font-bold">Estabelece requisitos técnicos para inspeção mecânica de veículos recuperados de acidentes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 5: Text Sections - Introdução & Metodologia */}
              <div className="space-y-4">
                <div className="space-y-1.5 text-justify">
                  <div className="font-bold text-[9px] uppercase text-slate-500 tracking-wider">A. Introdução do Parecer Pericial</div>
                  <p className="text-[9.5px] leading-relaxed text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {secoes.introducao}
                  </p>
                </div>

                <div className="space-y-1.5 text-justify">
                  <div className="font-bold text-[9px] uppercase text-slate-500 tracking-wider">B. Metodologia de Campo Aplicada</div>
                  <p className="text-[9.5px] leading-relaxed text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {secoes.metodologia}
                  </p>
                </div>
              </div>

              {/* Force page break in PDF */}
              <div className="html2pdf__page-break"></div>

              {/* Section 6: Audit Checklist (The blocks overview in table) */}
              <div className="space-y-2">
                <div className="border-b border-slate-900 pb-1 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    5. Auditoria Sistemática de Danos Estruturais (Checklist)
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-slate-400">Pág. 03</span>
                </div>
                <p className="text-[9.5px] text-slate-600 text-justify">
                  Checklist unificado de integridade física. Apresenta os componentes avaliados agrupados por blocos estruturais normativos. Classificações aplicadas: **OK** (Sem Danos), **DM** (Dano Médio Estrutural), **DG** (Dano Grande/Irrecuperável), **NI** (Dano Leve Não Impeditivo), **NA** (Não se aplica / Não avaliado por imagem).
                </p>

                <div className="space-y-4 pt-2">
                  {Object.entries(BLOCOS_LABELS).map(([blocoKey, label]) => {
                    const itemsInBloco = checklist.filter(item => item.bloco === blocoKey);
                    const affected = itemsInBloco.filter(item => item.status !== "OK");

                    if (affected.length === 0) {
                      return (
                        <div key={blocoKey} className="border border-slate-100 rounded-lg p-2 flex items-center justify-between bg-emerald-50/20 text-[9px]">
                          <span className="font-bold text-[#134074]">{label}</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> TODOS OS COMPONENTES ÍNTEGROS (OK)
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={blocoKey} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                        <div className="bg-[#134074] text-white px-3 py-1.5 font-bold text-[8.5px] uppercase tracking-wider font-mono">
                          {label}
                        </div>
                        <table className="w-full text-left border-collapse text-[8.5px]">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase font-mono">
                              <th className="p-1.5 w-1/12">ID</th>
                              <th className="p-1.5 w-5/12">Componente Avaliado</th>
                              <th className="p-1.5 w-2/12 text-center">Status</th>
                              <th className="p-1.5 w-4/12">Nota Pericial / Justificativa de Vistoria</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsInBloco.map(item => (
                              <tr key={item.id} className="border-b border-slate-150 last:border-b-0 bg-white">
                                <td className="p-1.5 font-mono text-slate-400 font-bold">{item.id.replace("b", "A")}</td>
                                <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                                <td className="p-1.5 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    item.status === "OK" ? "bg-emerald-100 text-emerald-800" :
                                    item.status === "DM" ? "bg-amber-100 text-amber-800" :
                                    item.status === "DG" ? "bg-red-100 text-red-800" :
                                    item.status === "NI" ? "bg-blue-100 text-blue-800" :
                                    "bg-slate-100 text-slate-600"
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-1.5 text-slate-600 italic text-[8.5px] leading-tight">
                                  {item.nota || "Componente sem anotações impeditivas."}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Force page break in PDF */}
              <div className="html2pdf__page-break"></div>

              {/* Section 7: Damage Cards (The core pericial body) */}
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-1 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    6. Cartões de Dano Pericialmente Evidenciados (Artigos Regulamentares)
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-slate-400">Pág. 04</span>
                </div>
                <p className="text-[9.5px] text-slate-600 text-justify">
                  Evidências materiais registradas pelo perito em campo. Cada item avariado de relevância estrutural possui sua devida fundamentação técnica descrita a seguir, com o objetivo de ratificar a correta classificação de monta.
                </p>

                {danos.length === 0 ? (
                  <div className="p-6 border rounded-xl text-center text-slate-400 italic">
                    Nenhum cartão de avaria estrutural cadastrado. Veículo classificado integralmente como sem danos aparentes (Pequena Monta).
                  </div>
                ) : (
                  <div className="space-y-4">
                    {danos.map((d, index) => (
                      <div key={d.id} className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm page-break-avoid">
                        {/* Header of card */}
                        <div className="bg-slate-900 text-white px-3.5 py-2 flex justify-between items-center text-[9px] font-bold">
                          <span className="uppercase tracking-wider">EVIDÊNCIA Nº {index + 1} — {d.componente}</span>
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded uppercase">
                            MONTA: {d.classificacao}
                          </span>
                        </div>

                        {/* Body of card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                          {/* Left specifications */}
                          <div className="p-3 space-y-1.5 text-[8.5px] md:col-span-1">
                            <div><span className="font-bold text-slate-400 uppercase">Foto Ref:</span> <span className="font-bold text-slate-700">{d.fotoRef}</span></div>
                            <div><span className="font-bold text-slate-400 uppercase">Local:</span> <span className="text-slate-700">{d.localizacao}</span></div>
                            <div><span className="font-bold text-slate-400 uppercase">Avaria:</span> <span className="text-slate-700 font-bold">{d.tipoDano}</span></div>
                            <div><span className="font-bold text-slate-400 uppercase">Reparabilidade:</span> <span className="text-[#134074] font-bold">{d.reparabilidade}</span></div>
                            <div>
                              <span className="font-bold text-slate-400 uppercase">Confiança:</span> 
                              <span className="text-amber-500 font-bold ml-1">{d.grauConfianca}</span>
                              <span className="text-slate-400 text-[8px] ml-1">({d.grauConfiancaPercentual}%)</span>
                            </div>
                          </div>

                          {/* Right technical justification */}
                          <div className="p-3 text-[9px] md:col-span-2 space-y-1.5 bg-slate-50/50">
                            <div>
                              <span className="font-black text-slate-500 uppercase block text-[8px] tracking-wide">Descrição Física do Dano:</span>
                              <p className="text-slate-800 leading-tight">{d.descricaoDano}</p>
                            </div>
                            <div>
                              <span className="font-black text-slate-500 uppercase block text-[8px] tracking-wide">Justificativa Técnica de Imagem e Enquadramento:</span>
                              <p className="text-slate-700 italic leading-snug">{d.justificativa}</p>
                            </div>
                            <div className="text-[8px] text-slate-400 font-bold">
                              Enquadramento: <span className="text-slate-600 font-mono">{d.enquadramento}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Force page break in PDF */}
              <div className="html2pdf__page-break"></div>

              {/* Section 8: Image Evidence Attachment page */}
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-1 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    7. Anexo de Registros Fotográficos (Avarias de Campo)
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-slate-400">Pág. 05</span>
                </div>
                <p className="text-[9.5px] text-slate-600">
                  Registros fotográficos anexados digitalmente, fundamentando visualmente as deformidades ou o estado de integridade mecânica das colunas e habitáculo.
                </p>

                {uploadedImages.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-2xl text-center text-slate-400 italic">
                    Nenhuma fotografia de campo anexada para exibição final no laudo físico.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-2.5 space-y-2 bg-slate-50/50 page-break-avoid">
                        <div className="h-44 w-full overflow-hidden rounded-lg bg-slate-100 border">
                          <img src={img.data} alt={img.name} className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                        </div>
                        <div className="text-center">
                          <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase">Fotografia {i + 1}</span>
                          <span className="text-[8.5px] font-bold text-slate-700 italic block leading-tight">{img.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 9: Limitations, Conclusion and professional Signature block */}
              <div className="space-y-6 pt-6">
                <div className="border-b border-slate-900 pb-1">
                  <h3 className="text-[11px] font-black uppercase text-slate-900 font-mono tracking-wider">
                    8. Limitações de Vistoria, Parecer Técnico e Conclusão
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="font-bold text-[9px] uppercase text-slate-500 tracking-wider">Limitações de Avaliação por Imagem</div>
                    <p className="text-[9px] text-slate-600 text-justify leading-relaxed">
                      {secoes.limitacoes}
                    </p>
                  </div>

                  <div className="space-y-2 text-justify bg-slate-900 text-white p-4 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4.5 h-4.5 text-amber-400" />
                      <div className="font-black text-[9.5px] uppercase tracking-wide">Parecer de Conclusão Técnica e Enquadramento Geral</div>
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-slate-200">
                      {secoes.conclusao}
                    </p>
                    <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-[8px] font-mono font-bold text-slate-400">
                      <span>MONTA FINAL ESTIMADA: {overall.label}</span>
                      <span>STATUS DO VEÍCULO: RECUPERÁVEL</span>
                    </div>
                  </div>
                </div>

                {/* Signature box and CREA-PE verification stamps */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 page-break-avoid">
                  <div className="space-y-1.5 text-left text-[8.5px]">
                    <div className="font-black text-[#134074] uppercase tracking-wider text-[9px]">Chancela Digital de Responsabilidade Técnica</div>
                    <div>Perito: <span className="font-bold text-slate-800 text-[9px]">Engenheiro Mecânico Vitor Leonardo</span></div>
                    <div>Registro Nacional: <span className="font-bold text-slate-800">CREA-PE 1822299490</span></div>
                    <div>Empresa Emissora: <span className="font-bold text-slate-800">VL Engenharia (Crea-PE 1822299490)</span></div>
                    <div className="text-[7.5px] text-slate-400 font-mono leading-tight">Este parecer de engenharia é chancelado digitalmente com validade civil e criminal.<br />Exige recolhimento prévio de ART correspondente junto ao CREA-PE.</div>
                  </div>
                  
                  {/* Digital Stamp representing Vitor's official CREA stamp */}
                  <div className="flex flex-col items-center justify-center border-2 border-[#134074]/30 rounded-xl px-5 py-4 bg-white shadow-sm font-mono shrink-0 text-center w-52">
                    <div className="text-[9px] font-black text-[#134074] tracking-widest leading-none">VL ENGENHARIA</div>
                    <div className="text-[7px] text-slate-400 font-black uppercase py-0.5 tracking-wider">Responsabilidade Técnica</div>
                    <div className="w-full border-t border-slate-100 my-1"></div>
                    <div className="text-[8.5px] font-bold text-slate-800">VITOR LEONARDO</div>
                    <div className="text-[7px] text-slate-500 font-bold">CREA-PE 1822299490</div>
                    <div className="text-[6.5px] text-slate-400 italic font-sans leading-none pt-1">Assinado digitalmente em {laudoParams.inspectionDate}</div>
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
