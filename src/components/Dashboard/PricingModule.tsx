import React, { useState, useEffect, useRef } from "react";
import { 
  Calculator, 
  Settings, 
  History, 
  DollarSign, 
  Percent, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  CheckCircle, 
  X, 
  Plus, 
  Search, 
  MapPin, 
  Truck, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Briefcase, 
  Info,
  ArrowRight,
  Download,
  Check,
  Eye,
  Share2,
  Sliders,
  Printer,
  ChevronRight,
  Shield,
  Phone,
  Edit,
  Wrench
} from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { isRealFirebase, db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { preprocessStylesheets, restoreStylesheets } from "../../lib/pdfUtils";
// @ts-ignore
import capaBg from "../../assets/images/capa_bg_1784159920711.jpg";
// @ts-ignore
import contracapaBg from "../../assets/images/contracapa_bg_1784159930602.jpg";
// @ts-ignore
import assinaturaVitor from "../../assets/images/assinatura_vitor_1784295142175.jpg";
// @ts-ignore
import firebaseConfig from "../../../firebase-applet-config.json";

const hasRealConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'MOCK_API_KEY' && !firebaseConfig.apiKey.includes('YOUR_');

const HOURLY_ROLES = [
  { label: "Técnico (R$ 19,22)", value: 19.22 },
  { label: "Proj. Mec Júnior (R$ 28,90)", value: 28.90 },
  { label: "Proj. Mec Pleno (R$ 34,11)", value: 34.11 },
  { label: "Proj. Mec Master (R$ 38,90)", value: 38.90 },
  { label: "Engenheiro Júnior (R$ 43,75)", value: 43.75 },
  { label: "Engenheiro Pleno (R$ 55,00)", value: 55.00 },
  { label: "Engenheiro Senior (R$ 75,00)", value: 75.00 },
  { label: "Engenheiro Master (R$ 95,00)", value: 95.00 },
];

// Pre-registered Services Data (Etapa 2)
interface ServiceTemplate {
  id: string;
  name: string;
  category: "Industrial" | "Predial" | "Veicular" | "Outros";
  basePrice: number;
  norms: string[];
  scope: string[];
  durationDays: number;
  hours: number;
  professionals: number;
  description: string;
}

const PRE_REGISTERED_SERVICES: ServiceTemplate[] = [
  {
    id: "serv-nr12",
    name: "Laudo de Adequação NR-12",
    category: "Industrial",
    basePrice: 4500,
    norms: ["NR-12 (Segurança em Máquinas)", "ABNT NBR ISO 12100:2013", "ABNT NBR 14153"],
    scope: [
      "Inventário de máquinas e equipamentos industriais",
      "Mapeamento de riscos e pontos de perigo físico/mecânico",
      "Análise de categorias de segurança (Sistemas de comando)",
      "Emissão de ART de adequação técnica"
    ],
    durationDays: 5,
    hours: 24,
    professionals: 2,
    description: "Inspeção técnica completa, mapeamento detalhado de pontos de perigo físico e elétrico, cálculo de riscos por máquina e elaboração de plano de ação."
  },
  {
    id: "serv-nr13",
    name: "Laudo de Integridade Física / NR-13",
    category: "Industrial",
    basePrice: 2500,
    norms: ["NR-13 (Caldeiras e Vasos de Pressão)", "ASME Seção VIII Div. 1", "ABNT NBR ISO 16528"],
    scope: [
      "Inspeção visual e dimensional externa/interna",
      "Medição de espessura por ultrassom (corrosão de parede)",
      "Cálculo de Pressão Máxima de Trabalho Admissível (PMTA)",
      "Exame de estanqueidade e teste hidrostático"
    ],
    durationDays: 3,
    hours: 16,
    professionals: 1,
    description: "Inspeção e ensaios não destrutivos de caldeiras, vasos de pressão, tanques metálicos e tubulações de vapor em conformidade com as regras federais."
  },
  {
    id: "serv-pmoc",
    name: "Plano de Manutenção PMOC",
    category: "Predial",
    basePrice: 3500,
    norms: ["Portaria MS n° 3.523/98", "Lei Federal 13.589/18", "Resolução RE 09/ANVISA"],
    scope: [
      "Levantamento da carga térmica total do sistema central",
      "Criação das rotinas de manutenção preventiva mensal/anual",
      "Mapeamento biológico e análise laboratorial da qualidade do ar",
      "ART de Responsabilidade Técnica sobre Climatização"
    ],
    durationDays: 4,
    hours: 18,
    professionals: 1,
    description: "Plano de Manutenção, Operação e Controle para sistemas de ar condicionado central, otimizando a qualidade do ar em edifícios comerciais e hospitalares."
  },
  {
    id: "serv-play",
    name: "Laudo de Playground",
    category: "Predial",
    basePrice: 1600,
    norms: ["ABNT NBR 16071 (Playgrounds)", "ABNT NBR 15860"],
    scope: [
      "Avaliação de desgaste estrutural e corrosão de brinquedos",
      "Teste de impacto e integridade de pisos amortecedores",
      "Inspeção de rotas de fuga e zonas de queda",
      "Relatório fotográfico com laudo de adequação para condomínios"
    ],
    durationDays: 2,
    hours: 8,
    professionals: 1,
    description: "Inspeção detalhada de brinquedos de parques infantis em condomínios e escolas, verificando fixação, soldas, pregos, pontas cortantes e riscos de quedas."
  },
  {
    id: "serv-munck",
    name: "Laudo de Caminhão Munck",
    category: "Veicular",
    basePrice: 2200,
    norms: ["NR-11 (Transporte de Cargas)", "ABNT NBR 14768 (Guindastes articulados)"],
    scope: [
      "Ensaio de partículas magnéticas ou líquido penetrante em soldas",
      "Medição de desgaste em pinos e buchas hidráulicas",
      "Inspeção de patolas estabilizadoras e travas de segurança",
      "Emissão de laudo técnico de integridade e ART"
    ],
    durationDays: 2,
    hours: 10,
    professionals: 1,
    description: "Vistoria mecânica e ensaio estrutural em guindauto (caminhão munck) para homologação e segurança em movimentação pesada de cargas industriais."
  },
  {
    id: "serv-guindaste",
    name: "Laudo de Guindaste / Rigging",
    category: "Veicular",
    basePrice: 2800,
    norms: ["NR-11", "ASME B30.5", "ABNT NBR 14768"],
    scope: [
      "Inspeção ultrassônica estrutural de lanças telescópicas",
      "Verificação de cabos de aço, ganchos e polias",
      "Análise de tabelas de carga dinâmica",
      "ART técnica de rigging/movimentação"
    ],
    durationDays: 3,
    hours: 14,
    professionals: 1,
    description: "Inspeção completa de integridade estrutural e segurança mecânica de guindastes industriais de grande porte."
  },
  {
    id: "serv-monta",
    name: "Reclassificação de Monta Veicular",
    category: "Veicular",
    basePrice: 1800,
    norms: ["Resoluções CONTRAN 810/20 e 848/21", "Portarias SENATRAN"],
    scope: [
      "Avaliação detalhada dos danos estruturais pós-sinistro",
      "Cruzamento com a planilha de pontuação oficial do CONTRAN",
      "Laudo de recuperação e segurança do monobloco",
      "ART técnica com liberação no prontuário do DETRAN"
    ],
    durationDays: 2,
    hours: 8,
    professionals: 1,
    description: "Laudo técnico pericial de engenharia mecânica para baixar a monta de veículos acidentados de média para pequena monta, permitindo a regularização do documento."
  },
  {
    id: "serv-inspe",
    name: "Inspeção Veicular Escolar/Frotas",
    category: "Veicular",
    basePrice: 1500,
    norms: ["Resolução CONTRAN", "NBR 14040"],
    scope: [
      "Inspeção detalhada de sistemas de frenagem, suspensão e direção",
      "Verificação de cintos de segurança, tacógrafo e tacômetro",
      "Laudo de conformidade mecânica do veículo rodoviário"
    ],
    durationDays: 2,
    hours: 8,
    professionals: 1,
    description: "Auditoria mecânica preventiva e corretiva de veículos destinados ao transporte coletivo escolar ou frotas corporativas de logística."
  },
  {
    id: "serv-sinistro",
    name: "Laudo de Avaliação de Sinistro Veicular",
    category: "Veicular",
    basePrice: 1950,
    norms: ["Resolução CONTRAN 810/2020", "Manual Brasileiro de Inspeção Veicular", "Código de Trânsito Brasileiro"],
    scope: [
      "Vistoria física detalhada do veículo in loco pós-sinistro",
      "Mapeamento completo de componentes estruturais e monobloco",
      "Preenchimento de Checklist Pericial Estrutural (dinâmico)",
      "Análise de fotos, enquadramento de monta ou classificação de frota",
      "Emissão de Parecer Conclusivo de Engenharia e ART oficial"
    ],
    durationDays: 2,
    hours: 12,
    professionals: 1,
    description: "Laudo pericial de engenharia mecânica veicular para avaliação de extensão de danos e enquadramento técnico-legal após sinistros e colisões."
  },
  {
    id: "serv-apr",
    name: "APR (Análise Preliminar de Risco)",
    category: "Outros",
    basePrice: 1200,
    norms: ["NR-01 (Disposições Gerais)", "ISO 31000 (Gestão de Riscos)"],
    scope: [
      "Levantamento e catalogação de perigos operacionais",
      "Estudo de probabilidade de acidentes severos",
      "Proposição de barreiras de segurança física e administrativas"
    ],
    durationDays: 1,
    hours: 6,
    professionals: 1,
    description: "Análise técnica preliminar de segurança ocupacional e mecânica para frentes de trabalho temporárias ou novos processos industriais."
  },
  {
    id: "serv-projeto",
    name: "Projeto Mecânico e Memorial",
    category: "Industrial",
    basePrice: 5000,
    norms: ["ABNT NBR ISO", "SolidWorks Design Standards"],
    scope: [
      "Estudos preliminares e modelagem 3D computacional",
      "Cálculo estrutural por Elementos Finitos (FEA)",
      "Memorial descritivo de cálculo e dimensionamento mecânico",
      "Emissão de desenho técnico e ART de projeto"
    ],
    durationDays: 10,
    hours: 40,
    professionals: 2,
    description: "Desenvolvimento técnico completo de componentes mecânicos estruturais, dispositivos de içamento, pórticos e suportes em aço."
  }
];

export interface Proposal {
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
    docHours?: number;
    hourlyRate?: number;
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
  paid?: boolean;
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
  hasNf?: boolean;
  escopoItems?: { item: string; atividade: string; descricao: string }[];
}

export default function PricingModule({ clients }: { clients?: ClientData[] } = {}) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [historyList, setHistoryList] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // ETAPA 1 - Dados do Cliente State
  const [clientCompany, setClientCompany] = useState("");
  const [clientCnpj, setClientCnpj] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientRole, setClientRole] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("Recife");
  const [clientState, setClientState] = useState("PE");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // ETAPA 2 - Dados do Serviço State
  const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);

  // ETAPA 3 - Precificação State
  const [multiplierQty, setMultiplierQty] = useState<number>(1);
  const [technicalHours, setTechnicalHours] = useState<number>(16);
  const [docHours, setDocHours] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(220);
  const [travelKm, setTravelKm] = useState<number>(0);
  const [lodgingDays, setLodgingDays] = useState<number>(0);
  const [artCost, setArtCost] = useState<number>(108.39);
  const [extraExpenses, setExtraExpenses] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(16.5);
  const [profitMargin, setProfitMargin] = useState<number>(30);
  const [minPrice, setMinPrice] = useState<number>(1500);
  const [paymentTerms, setPaymentTerms] = useState("50% no aceite eletrônico e 50% após emissão da ART/Laudo.");
  const [validityDays, setValidityDays] = useState(15);
  const [executionWeeks, setExecutionWeeks] = useState(2);

  // New customizable fields for NF options and Escopo Técnico
  const [hasNf, setHasNf] = useState<boolean>(true);
  const [escopoItems, setEscopoItems] = useState<{ item: string; atividade: string; descricao: string }[]>(() => [
    { item: "01", atividade: "Inspeção In Loco", descricao: "Vistoria presencial minuciosa do maquinário ou instalação para mapeamento visual de não-conformidades de segurança." },
    { item: "02", atividade: "Checklists Normativos", descricao: "Aplicação de checklists técnicos customizados baseados nas resoluções ABNT e normas federais de referência." },
    { item: "03", atividade: "Ensaios Físicos", descricao: "Realização de ensaios estruturais não destrutivos avançados (PM, ultrassom ou estanqueidade) conforme exigido pela categoria do equipamento." },
    { item: "04", atividade: "Emissão de Relatório", descricao: "Elaboração de laudo fotográfico conclusivo apontando falhas e plano de ação corretivo detalhado para readequação física." },
    { item: "05", atividade: "ART CREA-PE", descricao: "Anotação de Responsabilidade Técnica emitida eletronicamente junto ao conselho federal de engenharia, conferindo validade legal." },
  ]);

  // ETAPA 4 - Geração Automática / AI State
  const [aiObjective, setAiObjective] = useState("");
  const [aiScope, setAiScope] = useState<string[]>([]);
  const [aiNorms, setAiNorms] = useState<string[]>([]);
  const [aiObservations, setAiObservations] = useState<string[]>([]);
  const [aiExclusions, setAiExclusions] = useState<string[]>([]);
  const [aiComplementary, setAiComplementary] = useState<string[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [savingProposal, setSavingProposal] = useState(false);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // NOVOS CAMPOS: Descrição da demanda e Imagens ilustrativas
  const [demandDescription, setDemandDescription] = useState("Laudo de integridade física para caminhão munck");
  const [proposalImages, setProposalImages] = useState<string[]>([]);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [visibleSections, setVisibleSections] = useState({
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
  });

  // Automatically update demandDescription to equal the selected services names
  useEffect(() => {
    if (selectedServices.length > 0) {
      const names = selectedServices.map(s => s.name).join(" e ");
      setDemandDescription(names);
    } else {
      setDemandDescription("Laudo de integridade física para caminhão munck");
    }
  }, [selectedServices]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setProposalImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProposalImage = (index: number) => {
    setProposalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Print references
  const printProposalRef = useRef<HTMLDivElement | null>(null);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      let localProposals: Proposal[] = [];
      const saved = localStorage.getItem("vitor_engmec_pricing_proposals");
      if (saved) {
        try {
          localProposals = JSON.parse(saved);
        } catch (err) {
          console.error("Failed to parse history", err);
        }
      }

      if (isRealFirebase) {
        try {
          const querySnapshot = await getDocs(collection(db, "proposals"));
          const firestoreProposals: Proposal[] = [];
          querySnapshot.forEach(doc => {
            firestoreProposals.push(doc.data() as Proposal);
          });

          const mergedMap = new Map<string, Proposal>();
          localProposals.forEach(p => mergedMap.set(p.id, p));
          firestoreProposals.forEach(p => mergedMap.set(p.id, p));

          const merged = Array.from(mergedMap.values()).sort((a, b) => b.id.localeCompare(a.id));
          setHistoryList(merged);
          localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(merged));
          return;
        } catch (err) {
          console.error("Failed to fetch proposals from Firestore:", err);
        }
      }

      if (localProposals.length > 0) {
        setHistoryList(localProposals);
      } else {
        // Seed with some professional proposals
        const seed: Proposal[] = [
          {
            id: "PROP-2026-001",
            clientCompany: "Indústria Metalúrgica Guararapes S.A.",
            clientName: "Roberto Antunes",
            clientCnpj: "45.123.456/0001-99",
            clientCity: "Jaboatão dos Guararapes",
            clientState: "PE",
            clientContact: "(81) 3461-1299",
            clientEmail: "compras@metalurgicaguararapes.com",
            clientRole: "Gerente Industrial",
            services: [
              {
                id: "serv-nr12",
                name: "Laudo de Adequação NR-12",
                description: "Mapeamento detalhado de perigos mecânicos de 3 injetoras plásticas.",
                basePrice: 4500,
                norms: ["NR-12", "NBR ISO 12100"],
                scope: ["Vistoria técnica", "Análise de segurança estrutural", "ART"]
              }
            ],
            pricingInfo: {
              subtotal: 4500,
              descontos: 500,
              impostos: 660,
              totalGeral: 4000,
              estimatedHours: 24,
              estimatedTeamSize: 2,
              paymentTerms: "Faturado em 15 dias após aprovação.",
              validityDays: 15,
              executionWeeks: 2
            },
            status: "aprovado",
            signature: "Digital Signed",
            signedAt: new Date().toISOString(),
            signedByName: "Roberto Antunes",
            signedByRole: "Gerente Industrial"
          }
        ];
        localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(seed));
        setHistoryList(seed);
      }
    };
    loadHistory();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Service toggle handler
  const toggleService = (template: ServiceTemplate) => {
    const exists = selectedServices.some(s => s.id === template.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== template.id));
    } else {
      setSelectedServices([...selectedServices, template]);
      // Accumulate hours and team properties
      setTechnicalHours(prev => prev + template.hours);
    }
  };

  // Calculation Engine (Math helper based on Etapa 3 prompt)
  const calculateFinancials = () => {
    // Stage 1: Base de Horas (H/H)
    const laborCost = technicalHours * hourlyRate;
    const docLaborCost = docHours * hourlyRate;

    // Stage 2: Custo Operacional e Logístico
    const travelCost = travelKm * 1.5; // R$ 1.50 per Km
    const lodgingCost = lodgingDays * 250; // R$ 250 per day
    const directCostsSum = laborCost + docLaborCost + travelCost + lodgingCost + artCost + extraExpenses;

    // Stage 3: Formação de Valor (Margem & Gross-up de Impostos)
    // Formula: Subtotal = Cost / (1 - Margin/100)
    const marginPct = profitMargin / 100;
    const preTaxValue = marginPct < 1 ? directCostsSum / (1 - marginPct) : directCostsSum * 1.5;
    const profitValue = preTaxValue - directCostsSum;

    // Gross-up de Impostos
    // Formula: Total = PreTaxValue / (1 - Tax/100)
    const taxesFactor = taxPercent / 100;
    const totalGeralCalculated = taxesFactor < 1 ? preTaxValue / (1 - taxesFactor) : preTaxValue * 1.2;
    const impostos = totalGeralCalculated - preTaxValue;

    // Apply Minimum Price constraint
    const finalCalculated = Math.max(totalGeralCalculated, minPrice);

    // Apply Discount on the final price
    const discountVal = (finalCalculated * discountPercent) / 100;
    const totalGeral = finalCalculated - discountVal;

    // Unit Pricing
    const totalQty = selectedServices.length * multiplierQty || 1;
    const valuePerEquipment = totalGeral / totalQty;

    return {
      laborCost,
      docLaborCost,
      travelCost,
      lodgingCost,
      directCostsSum,
      preTaxValue,
      profitValue,
      subtotal: finalCalculated,
      descontos: discountVal,
      impostos,
      totalGeral,
      valuePerEquipment,
      margemEfetiva: profitMargin
    };
  };

  const financials = calculateFinancials();

  // Dynamic Page numbering helpers based on checked sections
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

  // Trigger Gemini AI generation for the proposal texts
  const runAIGeneration = async () => {
    if (selectedServices.length === 0) {
      alert("Por favor, selecione pelo menos um serviço na Etapa 2.");
      return;
    }
    setGeneratingAI(true);
    try {
      const response = await fetch("/api/gemini/proposal-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedServices.map(s => ({
            name: s.name,
            description: s.description,
            basePrice: s.basePrice
          })),
          clientInfo: {
            clientCompany,
            clientName,
            clientCnpj,
            clientCity,
            clientState,
            clientRole
          },
          pricingInfo: {
            totalGeral: financials.totalGeral,
            estimatedHours: technicalHours
          }
        })
      });

      if (!response.ok) throw new Error("API call returned non-200");
      const data = await response.json();
      
      setAiObjective(data.objetivo);
      setAiScope(data.escopo);
      setAiNorms(data.normas);
      setAiObservations(data.observacoes);
      setAiExclusions(data.itensNaoInclusos);
      setAiComplementary(data.servicosComplementares);
      
      triggerToast("Proposta otimizada e reescrita com inteligência artificial!");
    } catch (err) {
      console.error("AI Generation error, loading standard templates", err);
      // Fallback templates
      const fallbackObjective = `Esta proposta formaliza o compromisso da VL Engenharia em prestar consultoria pericial qualificada para a empresa ${clientCompany || "Cliente Geral LTDA"}, mediante vistorias técnicas criteriosas, compilação de checklists normativos e emissão de Laudos e Anotações de Responsabilidade Técnica (ART) junto ao CREA-PE.`;
      const fallbackScopes = selectedServices.flatMap(s => s.scope);
      const fallbackNorms = selectedServices.flatMap(s => s.norms);
      
      setAiObjective(fallbackObjective);
      setAiScope(fallbackScopes);
      setAiNorms(fallbackNorms);
      setAiObservations([
        "O cliente deverá disponibilizar manuais e documentos anteriores das máquinas.",
        "A vistoria presencial deverá ser agendada com no mínimo 3 dias úteis de antecedência."
      ]);
      setAiExclusions([
        "Instalação mecânica física, reparos ou serralheria de campo.",
        "Projetos elétricos ou automação de segurança adicionais."
      ]);
      setAiComplementary([
        "Auditoria de conformidade e suporte pós-reforma industrial",
        "Inspeções preventivas anuais programadas"
      ]);
      triggerToast("Proposta gerada usando modelos estruturados da VL Engenharia.");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Auto-generate sections when reaching Etapa 4
  useEffect(() => {
    if (currentStep === 4 && !aiObjective) {
      runAIGeneration();
    }
  }, [currentStep]);

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

  const clearForm = () => {
    setEditingProposalId(null);
    setClientCompany("");
    setClientCnpj("");
    setClientName("");
    setClientRole("");
    setClientAddress("");
    setClientCity("Recife");
    setClientState("PE");
    setClientContact("");
    setClientEmail("");
    setSelectedServices([]);
    setMultiplierQty(1);
    setTechnicalHours(16);
    setTravelKm(0);
    setLodgingDays(0);
    setArtCost(108.39);
    setExtraExpenses(0);
    setDiscountPercent(0);
    setTaxPercent(16.5);
    setProfitMargin(30);
    setMinPrice(1500);
    setPaymentTerms("50% no aceite eletrônico e 50% após emissão da ART/Laudo.");
    setValidityDays(15);
    setExecutionWeeks(2);
    setHasNf(true);
    setEscopoItems([
      { item: "01", atividade: "Inspeção In Loco", descricao: "Vistoria presencial minuciosa do maquinário ou instalação para mapeamento visual de não-conformidades de segurança." },
      { item: "02", atividade: "Checklists Normativos", descricao: "Aplicação de checklists técnicos customizados baseados nas resoluções ABNT e normas federais de referência." },
      { item: "03", atividade: "Ensaios Físicos", descricao: "Realização de ensaios estruturais não destrutivos avançados (PM, ultrassom ou estanqueidade) conforme exigido pela categoria do equipamento." },
      { item: "04", atividade: "Emissão de Relatório", descricao: "Elaboração de laudo fotográfico conclusivo apontando falhas e plano de ação corretivo detalhado para readequação física." },
      { item: "05", atividade: "ART CREA-PE", descricao: "Anotação de Responsabilidade Técnica emitida eletronicamente junto ao conselho federal de engenharia, conferindo validade legal." },
    ]);
    setAiObjective("");
    setAiScope([]);
    setAiNorms([]);
    setAiObservations([]);
    setAiExclusions([]);
    setAiComplementary([]);
    setDemandDescription("Laudo de integridade física para caminhão munck");
    setProposalImages([]);
    setDeliveryDays(14);
    setVisibleSections({
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
    });
    setCurrentStep(1);
    triggerToast("Formulário limpo para um novo orçamento.");
  };

  const handleEditProposal = (prop: Proposal) => {
    setEditingProposalId(prop.id);
    
    // ETAPA 1
    setClientCompany(prop.clientCompany || "");
    setClientCnpj(prop.clientCnpj || "");
    setClientName(prop.clientName || "");
    setClientRole(prop.clientRole || "");
    setClientAddress(prop.clientAddress || "");
    setClientCity(prop.clientCity || "Recife");
    setClientState(prop.clientState || "PE");
    setClientContact(prop.clientContact || "");
    setClientEmail(prop.clientEmail || "");

    // ETAPA 2
    setSelectedServices(prop.services.map(s => {
      const match = PRE_REGISTERED_SERVICES.find(ts => ts.id === s.id);
      return {
        id: s.id,
        name: s.name,
        category: match?.category || "Industrial",
        basePrice: s.basePrice,
        norms: s.norms || [],
        scope: s.scope || [],
        durationDays: s.durationDays || match?.durationDays || 3,
        hours: match?.hours || 16,
        professionals: match?.professionals || 1,
        description: s.description || ""
      };
    }));

    // ETAPA 3
    setMultiplierQty(prop.pricingInfo.multiplierQty ?? 1);
    setTechnicalHours(prop.pricingInfo.technicalHours ?? prop.pricingInfo.estimatedHours ?? 16);
    setDocHours(prop.pricingInfo.docHours ?? 8);
    setHourlyRate(prop.pricingInfo.hourlyRate ?? 220);
    setTravelKm(prop.pricingInfo.travelKm ?? 0);
    setLodgingDays(prop.pricingInfo.lodgingDays ?? 0);
    setArtCost(prop.pricingInfo.artCost ?? 108.39);
    setExtraExpenses(prop.pricingInfo.extraExpenses ?? 0);
    setDiscountPercent(prop.pricingInfo.discountPercent ?? 0);
    setTaxPercent(prop.pricingInfo.taxPercent ?? 16.5);
    setProfitMargin(prop.pricingInfo.profitMargin ?? 30);
    setMinPrice(prop.pricingInfo.minPrice ?? 1500);
    setPaymentTerms(prop.pricingInfo.paymentTerms || "50% no aceite eletrônico e 50% após emissão da ART/Laudo.");
    setValidityDays(prop.pricingInfo.validityDays ?? 15);
    setExecutionWeeks(prop.pricingInfo.executionWeeks ?? 2);
    setHasNf(prop.hasNf ?? true);
    setEscopoItems(prop.escopoItems ?? [
      { item: "01", atividade: "Inspeção In Loco", descricao: "Vistoria presencial minuciosa do maquinário ou instalação para mapeamento visual de não-conformidades de segurança." },
      { item: "02", atividade: "Checklists Normativos", descricao: "Aplicação de checklists técnicos customizados baseados nas resoluções ABNT e normas federais de referência." },
      { item: "03", atividade: "Ensaios Físicos", descricao: "Realização de ensaios estruturais não destrutivos avançados (PM, ultrassom ou estanqueidade) conforme exigido pela categoria do equipamento." },
      { item: "04", atividade: "Emissão de Relatório", descricao: "Elaboração de laudo fotográfico conclusivo apontando falhas e plano de ação corretivo detalhado para readequação física." },
      { item: "05", atividade: "ART CREA-PE", descricao: "Anotação de Responsabilidade Técnica emitida eletronicamente junto ao conselho federal de engenharia, conferindo validade legal." },
    ]);

    // ETAPA 4 / AI
    setAiObjective(prop.aiObjective || "");
    setAiScope(prop.aiScope || []);
    setAiNorms(prop.aiNorms || []);
    setAiObservations(prop.aiObservations || []);
    setAiExclusions(prop.aiExclusions || []);
    setAiComplementary(prop.aiComplementary || []);
    setDemandDescription(prop.demandDescription || "");
    setProposalImages(prop.images || []);
    setDeliveryDays(prop.deliveryDays ?? 14);
    
    if (prop.visibleSections) {
      setVisibleSections({
        capa: prop.visibleSections.capa ?? true,
        contracapa: prop.visibleSections.contracapa ?? true,
        principios: prop.visibleSections.principios ?? true,
        entregamos: prop.visibleSections.entregamos ?? true,
        problemas: prop.visibleSections.problemas ?? true,
        clientes: prop.visibleSections.clientes ?? true,
        resumoServicos: prop.visibleSections.resumoServicos ?? true,
        identificacao: prop.visibleSections.identificacao ?? true,
        equipe: prop.visibleSections.equipe ?? true,
        atividades: prop.visibleSections.atividades ?? true,
        investimento: prop.visibleSections.investimento ?? true,
        condicoes: prop.visibleSections.condicoes ?? true,
        prazos: prop.visibleSections.prazos ?? true,
        assinatura: prop.visibleSections.assinatura ?? true,
      });
    }

    // Switch tab and go to first step or step 4
    setActiveTab("new");
    setCurrentStep(1); // load the active editor
    triggerToast(`Orçamento ${prop.id} carregado para edição! Faça seus ajustes e salve.`);
  };

  // Save draft / publish proposal in localStorage
  const handleSaveProposal = async (status: "rascunho" | "enviado") => {
    setSavingProposal(true);
    try {
      const isEditing = !!editingProposalId;
      const proposalId = editingProposalId || `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      
      const newProposal: Proposal = {
        id: proposalId,
        clientCompany: clientCompany || "Empresa Cliente Geral",
        clientName: clientName || "Contato de Vendas",
        clientCnpj: clientCnpj || "00.000.000/0001-00",
        clientCity: clientCity,
        clientState: clientState,
        clientContact: clientContact,
        clientEmail: clientEmail,
        clientRole: clientRole,
        clientAddress: clientAddress,
        services: selectedServices.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          basePrice: s.basePrice,
          norms: s.norms,
          scope: s.scope,
          durationDays: s.durationDays
        })),
        pricingInfo: {
          subtotal: financials.subtotal,
          descontos: financials.descontos,
          impostos: financials.impostos,
          totalGeral: financials.totalGeral,
          estimatedHours: technicalHours,
          hourlyRate: hourlyRate,
          estimatedTeamSize: selectedServices.reduce((acc, s) => Math.max(acc, s.professionals), 1),
          paymentTerms: paymentTerms,
          validityDays: validityDays,
          executionWeeks: executionWeeks,
          multiplierQty: multiplierQty,
          technicalHours: technicalHours,
          docHours: docHours,
          travelKm: travelKm,
          lodgingDays: lodgingDays,
          artCost: artCost,
          extraExpenses: extraExpenses,
          discountPercent: discountPercent,
          taxPercent: taxPercent,
          profitMargin: profitMargin,
          minPrice: minPrice
        },
        aiObjective,
        aiScope,
        aiNorms,
        aiObservations,
        aiExclusions,
        aiComplementary,
        status: status,
        images: proposalImages,
        demandDescription: demandDescription,
        deliveryDays: deliveryDays,
        visibleSections: visibleSections,
        hasNf: hasNf,
        escopoItems: escopoItems
      };

      if (isRealFirebase || hasRealConfig) {
        try {
          await setDoc(doc(db, "proposals", proposalId), newProposal);
          console.log("Saved proposal to Firestore successfully:", proposalId);
        } catch (dbErr) {
          console.error("Failed to save proposal to Firestore:", dbErr);
        }
      }

      let updatedHistory;
      if (isEditing) {
        updatedHistory = historyList.map(p => p.id === editingProposalId ? newProposal : p);
      } else {
        updatedHistory = [newProposal, ...historyList];
      }
      
      setHistoryList(updatedHistory);
      localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(updatedHistory));
      setSavingProposal(false);
      setEditingProposalId(null);
      
      if (status === "enviado") {
        const secureUrl = getSharedUrl(proposalId);
        const message = `Olá, ${clientName}! Segue o link seguro para visualizar, aprovar e assinar eletronicamente a nossa Proposta Comercial da VL Engenharia:\n\n${secureUrl}`;
        
        // Show success toast immediately so the user always has confirmation
        triggerToast("Orçamento publicado com sucesso no acervo!");

        // Attempt copying to clipboard safely without blocking the rest of the flow
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(secureUrl)
            .then(() => {
              triggerToast("Link seguro de assinatura copiado para área de transferência!");
            })
            .catch((err) => {
              console.warn("Clipboard block", err);
            });
        }

        // Attempt opening WhatsApp safely (direct call inside user thread increases popup permissions)
        try {
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          window.open(waUrl, "_blank");
        } catch (openErr) {
          console.warn("Could not open WhatsApp window (blocked by iframe sandbox):", openErr);
        }
      } else {
        triggerToast("Rascunho de orçamento salvo com sucesso no acervo!");
      }
    } catch (err) {
      console.error("Save error", err);
      setSavingProposal(false);
    }
  };

  const deleteProposal = (id: string) => {
    try {
      const filtered = historyList.filter(p => p.id !== id);
      setHistoryList(filtered);
      localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(filtered));
      setDeletingProposalId(null);
      triggerToast("Orçamento removido com sucesso.");
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleCopySecureLink = (id: string) => {
    const secureUrl = getSharedUrl(id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(secureUrl)
        .then(() => {
          triggerToast("Link seguro do cliente copiado!");
        })
        .catch((err) => {
          console.warn("Clipboard failed", err);
          triggerToast(`Link do cliente: ${secureUrl}`);
        });
    } else {
      triggerToast(`Link do cliente: ${secureUrl}`);
    }
  };

  // Modern PDF rendering with html2pdf and dynamic CDN script loading fallback
  const exportA4PDF = async () => {
    const element = document.getElementById("proposal-printable-block");
    if (!element) return;

    // Add special class to body to alter layout during PDF generation
    document.body.classList.add("generating-pdf");

    const opt = {
      margin: 0,
      filename: `Proposta_Comercial_VL_Engenharia_${clientCompany.replace(/[^a-zA-Z0-9]/g, "_") || "Geral"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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

  const filteredHistory = historyList.filter(p => 
    p.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Calculator className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase font-sans">Orçamentos Inteligentes</h1>
            <p className="text-slate-400 text-xs font-mono">Transformação automática de precificação em propostas de engenharia comercial premium.</p>
          </div>
        </div>

        {/* ADMIN NAV TAB TOGGLE */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "new" ? "bg-[#134074] text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            {editingProposalId ? `Editando (${editingProposalId})` : "Novo Orçamento"}
          </button>
          {editingProposalId && activeTab === "new" && (
            <button
              onClick={clearForm}
              className="px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-all flex items-center gap-1.5 ml-1 cursor-pointer"
              title="Cancelar Edição e Iniciar Novo"
            >
              <X className="h-3.5 w-3.5" />
              Novo do Zero
            </button>
          )}
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history" ? "bg-[#134074] text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Histórico ({historyList.length})
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500/90 text-white rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-bounce border border-emerald-400">
          <Check className="h-4.5 w-4.5 border-2 border-white rounded-full p-0.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* VIEW: NEW BUDGET GENERATOR WITH STEPS */}
      {activeTab === "new" && (
        <div className="space-y-6">
          
          {/* STEP INDICATOR HEADER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              { step: 1, label: "Dados do Cliente" },
              { step: 2, label: "Serviços & Parâmetros" },
              { step: 3, label: "Cálculo & Margem" },
              { step: 4, label: "Proposta Comercial" }
            ].map((s) => (
              <button
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep || selectedServices.length > 0) {
                    setCurrentStep(s.step as any);
                  }
                }}
                className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                  currentStep === s.step
                    ? "bg-[#0B2545] border-[#4895EF] text-white shadow-lg"
                    : currentStep > s.step
                    ? "bg-slate-900/60 border-slate-800 text-slate-300"
                    : "bg-slate-950 border-slate-900/40 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === s.step 
                    ? "bg-[#4895EF] text-[#0B2545]" 
                    : currentStep > s.step 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-slate-900 text-slate-600"
                }`}>
                  {currentStep > s.step ? <Check className="h-3 w-3" /> : s.step}
                </span>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Etapa {s.step}</p>
                  <p className="font-sans font-bold text-[11px] truncate">{s.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* STEP 1: CLIENT DATA */}
          {currentStep === 1 && (
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#4895EF]" />
                <h3 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Etapa 1 – Identificação Geral do Cliente</h3>
              </div>

              {/* Client Selection from pre-registered clients */}
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-3">
                <p className="text-slate-400 text-xs font-sans">
                  Selecione um cliente pré-cadastrado abaixo para preencher automaticamente todos os dados comerciais e otimizar a precificação:
                </p>
                <ClientSelector
                  clients={clients}
                  label="Pesquisar no Cadastro de Clientes"
                  onSelectClient={(client) => {
                    if (client.id) {
                      setClientCompany(client.company || client.name || "");
                      setClientCnpj(client.cnpj_cpf || "");
                      setClientName(client.name || "");
                      setClientAddress(client.address || "");
                      setClientContact(client.phone || "");
                      setClientEmail(client.email || "");
                      if (client.address) {
                        const addrLower = client.address.toLowerCase();
                        if (addrLower.includes("jaboatão")) {
                          setClientCity("Jaboatão dos Guararapes");
                          setClientState("PE");
                        } else if (addrLower.includes("olinda")) {
                          setClientCity("Olinda");
                          setClientState("PE");
                        } else if (addrLower.includes("caruaru")) {
                          setClientCity("Caruaru");
                          setClientState("PE");
                        } else if (addrLower.includes("pe") || addrLower.includes("pernambuco")) {
                          setClientCity("Recife");
                          setClientState("PE");
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Razão Social / Nome da Empresa *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={clientCompany} 
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="Ex: Cerâmica Pernambuco S.A." 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">CNPJ *</label>
                  <input 
                    type="text" 
                    value={clientCnpj} 
                    onChange={(e) => setClientCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Representante Legal / Responsável *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Vitor Silva" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cargo / Função</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={clientRole} 
                      onChange={(e) => setClientRole(e.target.value)}
                      placeholder="Ex: Diretor de Operações" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Endereço Comercial</label>
                  <input 
                    type="text" 
                    value={clientAddress} 
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cidade / UF *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={clientCity} 
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="Recife" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Telefone de Contato *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={clientContact} 
                      onChange={(e) => setClientContact(e.target.value)}
                      placeholder="(81) 98444-2592" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">E-mail Corporativo *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input 
                      type="email" 
                      value={clientEmail} 
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="gerencia@ceramicape.com.br" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIÇÃO DA DEMANDA E IMAGENS */}
              <div className="border-t border-slate-800/60 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Descrição da Demanda Solicitada *</label>
                  <textarea 
                    rows={3}
                    value={demandDescription} 
                    onChange={(e) => setDemandDescription(e.target.value)}
                    placeholder="Ex: Laudo técnico de integridade estrutural e segurança de guindaste veicular, contemplando ensaios não destrutivos..." 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#4895EF]"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">Esta descrição será exibida em destaque nas páginas do orçamento impresso.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Anexar Imagens do Levantamento (Max 4)</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer relative bg-slate-950">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText className="h-6 w-6 text-[#4895EF] mx-auto mb-2" />
                    <p className="text-[11px] text-slate-300">Arraste ou clique para enviar fotos do local ou equipamento</p>
                    <p className="text-[9px] text-slate-500">Formato PNG, JPG. Máximo 4 imagens.</p>
                  </div>

                  {proposalImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {proposalImages.map((img, idx) => (
                        <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-800">
                          <img src={img} alt="Uploaded preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeProposalImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (!clientCompany || !clientName) {
                      alert("Por favor, preencha a Razão Social e o Responsável.");
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="bg-[#134074] hover:bg-[#1e5494] text-white text-xs font-bold font-mono tracking-wider uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Avançar: Configurar Serviços</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES & PARAMETERS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Etapa 2 – Selecionar Serviços Cadastrados</h3>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-mono">
                    {selectedServices.length} Serviços Selecionados
                  </span>
                </div>

                <p className="text-slate-400 text-xs">Múltipla escolha técnica. Selecione quais laudos ou pacotes de vistorias serão combinados neste orçamento.</p>

                {/* SERVICES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRE_REGISTERED_SERVICES.map((serv) => {
                    const isSelected = selectedServices.some(s => s.id === serv.id);
                    return (
                      <div
                        key={serv.id}
                        onClick={() => toggleService(serv)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between h-44 ${
                          isSelected
                            ? "bg-[#0B2545]/40 border-emerald-500/80 shadow-lg shadow-emerald-500/5"
                            : "bg-slate-950 border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase">
                              {serv.category}
                            </span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-800"
                            }`}>
                              {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                          </div>
                          
                          <h4 className="text-white font-bold text-xs mt-2.5">{serv.name}</h4>
                          <p className="text-slate-500 text-[10px] leading-normal mt-1 line-clamp-2">{serv.description}</p>
                        </div>

                        <div className="border-t border-slate-900/80 pt-2.5 flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400">Base: <strong className="text-white">R$ {serv.basePrice}</strong></span>
                          <span className="text-slate-500">{serv.hours}h • {serv.professionals} Eng.</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedServices.length > 0 && (
                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-white font-bold font-mono text-xs uppercase tracking-wider">Parâmetros Detalhados do Escopo</h4>
                  <p className="text-slate-400 text-[10px]">Ajuste fino preliminar de prazos e dimensionamento para as soluções escolhidas:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase">Multiplicador Geral (Qtd de Unidades/Máquinas)</span>
                      <input 
                        type="number" 
                        value={multiplierQty} 
                        onChange={(e) => setMultiplierQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase">Horas de Engenharia Estimadas</span>
                      <input 
                        type="number" 
                        value={technicalHours} 
                        onChange={(e) => setTechnicalHours(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase">H/TRAB. DOCUMENTAÇÃO</span>
                      <input 
                        type="number" 
                        value={docHours} 
                        onChange={(e) => setDocHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 sm:col-span-2 lg:col-span-1">
                      <span className="text-slate-400 text-[10px] uppercase">Valor da Hora Técnica (R$/h)</span>
                      <div className="flex gap-1.5">
                        <select
                          value={HOURLY_ROLES.find(r => Math.abs(r.value - hourlyRate) < 0.01)?.value || "custom"}
                          onChange={(e) => {
                            if (e.target.value !== "custom") {
                              setHourlyRate(parseFloat(e.target.value));
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white focus:outline-none text-[10px] font-mono"
                        >
                          {HOURLY_ROLES.map((role) => (
                            <option key={role.label} value={role.value} className="bg-slate-950 text-white">
                              {role.label}
                            </option>
                          ))}
                          <option value="custom" className="bg-slate-950 text-white">Outro (Manual)</option>
                        </select>
                        <input 
                          type="number" 
                          step="0.01"
                          value={hourlyRate} 
                          onChange={(e) => setHourlyRate(Math.max(1, parseFloat(e.target.value) || 1))}
                          className="w-16 bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white focus:outline-none text-center font-mono text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase">Custo Fixo de ART (CREA) (R$)</span>
                      <input 
                        type="number" 
                        value={artCost} 
                        onChange={(e) => setArtCost(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITABLE ESCOPO TÉCNICO DAS ATIVIDADES */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-sky-400" />
                    <h4 className="text-white font-bold font-mono text-xs uppercase tracking-wider">
                      Etapa 2 – Personalizar Itens do Escopo Técnico
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEscopoItems(prev => [
                        ...prev,
                        { item: String(prev.length + 1).padStart(2, '0'), atividade: "", descricao: "" }
                      ]);
                    }}
                    className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer"
                  >
                    + Adicionar Item
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Estes itens serão mostrados na tabela de <strong>Etapa 2: Escopo Técnico das Atividades</strong> na proposta gerada. Personalize-os livremente.
                </p>

                <div className="space-y-3">
                  {escopoItems.map((esc, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                      <div className="md:col-span-1">
                        <span className="text-slate-500 text-[9px] uppercase font-mono block mb-1">Item</span>
                        <input
                          type="text"
                          value={esc.item}
                          onChange={(e) => {
                            const newItems = [...escopoItems];
                            newItems[index].item = e.target.value;
                            setEscopoItems(newItems);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <span className="text-slate-500 text-[9px] uppercase font-mono block mb-1">Atividade Técnica</span>
                        <input
                          type="text"
                          value={esc.atividade}
                          onChange={(e) => {
                            const newItems = [...escopoItems];
                            newItems[index].atividade = e.target.value;
                            setEscopoItems(newItems);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-white text-xs font-semibold focus:outline-none"
                          placeholder="Ex: Ensaios Físicos"
                        />
                      </div>
                      <div className="md:col-span-7">
                        <span className="text-slate-500 text-[9px] uppercase font-mono block mb-1">Descrição detalhada do procedimento</span>
                        <input
                          type="text"
                          value={esc.descricao}
                          onChange={(e) => {
                            const newItems = [...escopoItems];
                            newItems[index].descricao = e.target.value;
                            setEscopoItems(newItems);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-white text-xs focus:outline-none"
                          placeholder="Ex: Realização de ensaios estruturais..."
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEscopoItems(prev => prev.filter((_, idx) => idx !== index));
                          }}
                          className="w-full text-red-500 hover:text-red-400 p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-mono font-bold uppercase cursor-pointer text-center transition-all"
                          title="Remover Item"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold font-mono tracking-wider uppercase px-5 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    if (selectedServices.length === 0) {
                      alert("Por favor, selecione pelo menos um serviço.");
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="bg-[#134074] hover:bg-[#1e5494] text-white text-xs font-bold font-mono tracking-wider uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Avançar: Precificação & Margem</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRICING ENGINE */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* VARIABLES INPUT (LEFT 7 COLUMNS) */}
              <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-[#4895EF]" />
                  <h3 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Etapa 3 – Variáveis Financeiras e Impostos</h3>
                </div>

                <div className="space-y-5 font-mono text-xs">
                  
                  {/* LOGISTICS SECTION */}
                  <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <h4 className="text-slate-300 font-bold font-sans text-xs flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#4895EF]" />
                      <span>Despesas de Deslocamento e Logística</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase">Distância Rodoviária (Km)</span>
                          <span className="text-white font-bold">{travelKm} Km</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="800" 
                          step="10"
                          value={travelKm}
                          onChange={(e) => setTravelKm(parseInt(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                        />
                        <span className="text-[9px] text-slate-500">Calculado a R$ 1,50/Km para mobilização técnica</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase">Diárias de Hospedagem</span>
                          <span className="text-white font-bold">{lodgingDays} Dias</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="15" 
                          value={lodgingDays}
                          onChange={(e) => setLodgingDays(parseInt(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                        />
                        <span className="text-[9px] text-slate-500">Calculado a R$ 250,00/diária</span>
                      </div>
                    </div>
                  </div>

                  {/* COMMERICALS SECTION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Despesas Extras / Outras Despesas (R$)</span>
                      <input 
                        type="number" 
                        value={extraExpenses} 
                        onChange={(e) => setExtraExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Desconto Geral (%)</span>
                      <div className="relative">
                        <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                        <input 
                          type="number" 
                          max="90"
                          min="0"
                          value={discountPercent} 
                          onChange={(e) => setDiscountPercent(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-10 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Aliquota de Impostos (%)</span>
                      <input 
                        type="number" 
                        value={taxPercent} 
                        onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px] uppercase">Margem de Lucro (%)</span>
                        <span className="text-[#4895EF] font-bold">{profitMargin}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="70" 
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Valor Mínimo de Proposta (R$)</span>
                      <input 
                        type="number" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Prazo de Validade da Proposta (Dias)</span>
                      <input 
                        type="number" 
                        value={validityDays} 
                        onChange={(e) => setValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Prazo de Entrega dos Laudos (Dias Úteis)</span>
                      <input 
                        type="number" 
                        value={deliveryDays} 
                        onChange={(e) => setDeliveryDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#4895EF]"
                      />
                    </div>
                  </div>

                  {/* NOTA FISCAL OPTION */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between col-span-1 md:col-span-2">
                    <div className="space-y-1 pr-4 text-left font-sans">
                      <h4 className="text-white font-bold text-xs">Incluir Emissão de Nota Fiscal de Serviços (NFS-e)?</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Se ativado, inclui &ldquo;Emissão de Nota Fiscal de Serviços (NFS-e)&rdquo; na lista de itens inclusos na proposta. Se desativado, o texto exibirá apenas CREA-PE (ART) e deslocamentos operacionais.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasNf(!hasNf)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hasNf ? 'bg-emerald-500' : 'bg-slate-850'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          hasNf ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider">Termos e Condições de Pagamento</label>
                    <textarea 
                      rows={2}
                      value={paymentTerms} 
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#4895EF] font-sans"
                    />
                  </div>

                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold font-mono tracking-wider uppercase px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-[#134074] hover:bg-[#1e5494] text-white text-xs font-bold font-mono tracking-wider uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Avançar: Gerar Proposta</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* LIVE PRICING SUMMARY PANEL (RIGHT 5 COLUMNS) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-[#4895EF]/5 rounded-bl-full pointer-events-none"></div>
                  
                  <h3 className="text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <DollarSign className="h-4.5 w-4.5 text-emerald-400" />
                    <span>Resumo Financeiro da Venda</span>
                  </h3>

                  <div className="space-y-4 font-mono text-xs">
                    
                    {/* MEMORIAL DE CÁLCULO DE 3 ETAPAS */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-900 text-left">
                      <p className="text-[10px] text-[#4895EF] font-bold uppercase tracking-wider text-center border-b border-slate-900 pb-1.5">Memorial de Cálculo (3 Etapas)</p>
                      
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between font-semibold text-sky-400">
                          <span>1. Base H/H Técnico:</span>
                          <span>R$ {financials.laborCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-2">
                          {technicalHours} horas × R$ {hourlyRate}/h
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] border-t border-slate-900/50 pt-1.5">
                        <div className="flex justify-between font-semibold text-sky-300">
                          <span>H/Trab. Documentação:</span>
                          <span>R$ {financials.docLaborCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-2">
                          {docHours} horas × R$ {hourlyRate}/h
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] border-t border-slate-900/50 pt-1.5">
                        <div className="flex justify-between font-semibold text-purple-400">
                          <span>2. Custos Operacionais:</span>
                          <span>R$ {(financials.directCostsSum - financials.laborCost - financials.docLaborCost).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-2 space-y-0.5">
                          <div>• Mobilização ({travelKm} Km): R$ {(travelKm * 1.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                          <div>• Hospedagem ({lodgingDays} d): R$ {(lodgingDays * 250).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                          <div>• Taxa de ART do CREA: R$ {artCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                          {extraExpenses > 0 && <div>• Outras despesas: R$ {extraExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>}
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] border-t border-slate-900/50 pt-1.5">
                        <div className="flex justify-between font-semibold text-emerald-400">
                          <span>3. Formação de Valor:</span>
                          <span>R$ {financials.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-2 space-y-0.5">
                          <div>• Custo Direto Total: R$ {financials.directCostsSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                          <div>• Margem Operacional ({profitMargin}%): +R$ {financials.profitValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                          <div>• Gross-up Impostos ({taxPercent}%): +R$ {financials.impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>

                    {financials.descontos > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 border-b border-slate-900 pb-2">
                        <span>Desconto Aplicado ({discountPercent}%):</span>
                        <span>- R$ {financials.descontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                      <span>Equipamentos/Unidades:</span>
                      <span className="text-white">{selectedServices.length * multiplierQty} unidades</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                      <span>Valor Médio por Unidade:</span>
                      <span className="text-white">R$ {financials.valuePerEquipment.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="pt-4 flex flex-col justify-center items-center bg-slate-950 p-4 rounded-xl border border-slate-900 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Investimento Total Líquido</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">R$ {financials.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] mt-2 font-bold uppercase tracking-wider">
                        Margem Operacional: {profitMargin}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex gap-2.5 text-slate-400 text-xs leading-normal">
                  <Info className="h-4.5 w-4.5 text-[#4895EF] shrink-0 mt-0.5" />
                  <p>A margem recomendada para serviços técnicos periciais com emissão de ART é de no mínimo <strong>30%</strong> para cobertura de seguros corporativos e contingências operacionais.</p>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: PRINT PREVIEW AND AI ACTIONS */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* AI & ACTIONS PANEL (LEFT 3 COLUMNS) */}
              <div className="lg:col-span-3 space-y-6 print:hidden">
                
                {/* AI SUITE */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                  <h4 className="text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
                    <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                    <span>Inteligência Artificial</span>
                  </h4>
                  <p className="text-slate-400 text-[10px] leading-normal">Otimize a proposta com o assistente inteligente para adequar os objetivos, termos legais e escopos ao perfil do cliente.</p>

                  <button
                    onClick={runAIGeneration}
                    disabled={generatingAI}
                    className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold font-mono text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {generatingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Processando IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Reescrever com Gemini IA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* PUBLISH AND SHARING ACTIONS */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
                  <h4 className="text-white font-bold font-mono text-xs uppercase tracking-wider border-b border-slate-850 pb-2.5">
                    Ações de Orçamento
                  </h4>

                  <button
                    onClick={() => handleSaveProposal("enviado")}
                    disabled={savingProposal}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[11px] uppercase tracking-wider py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Publicar e Enviar Link</span>
                  </button>

                  <button
                    onClick={exportA4PDF}
                    className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold font-mono text-[11px] uppercase tracking-wider py-3 px-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-emerald-400" />
                    <span>Gerar PDF Oficial</span>
                  </button>

                  <button
                    onClick={() => handleSaveProposal("rascunho")}
                    disabled={savingProposal}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold font-mono text-[11px] uppercase tracking-wider py-3 px-3 rounded-xl border border-slate-800 hover:border-slate-750 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Salvar Rascunho</span>
                  </button>
                </div>

                {/* SECTION SELECTOR (FLEGS) */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl print:hidden">
                  <h4 className="text-white font-bold font-mono text-xs uppercase tracking-wider border-b border-slate-850 pb-2.5 flex items-center gap-1.5">
                    <Sliders className="h-4.5 w-4.5 text-[#4895EF]" />
                    <span>Seções do Orçamento (Fleg)</span>
                  </h4>
                  <p className="text-slate-400 text-[10px] leading-normal">Escolha quais páginas/seções farão parte do documento final:</p>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {Object.entries({
                      capa: "01. Capa Principal",
                      contracapa: "02. Contracapa & Missão",
                      principios: "03. Princípios e Valores",
                      entregamos: "04. O que Entregamos",
                      problemas: "05. Problemas Resolvidos",
                      clientes: "06. Nossos Clientes & Atuação",
                      resumoServicos: "07. Resumo de Serviços",
                      identificacao: "08. Identificação & Demanda",
                      equipe: "09. Engenheiros & Estrutura",
                      atividades: "10. Atividades Detalhadas",
                      investimento: "11. Tabela de Escopo Técnico",
                      condicoes: "12. Diretrizes e Obrigações",
                      prazos: "13. Valores & Prazos",
                      assinatura: "14. Agradecimento final",
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={visibleSections[key as keyof typeof visibleSections]}
                          onChange={(e) => setVisibleSections(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded border-slate-800 bg-slate-950 text-[#4895EF] focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* DOCUMENT RENDERING CANVAS (RIGHT 9 COLUMNS) */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* INSTRUCTION CARD */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex gap-2.5 text-slate-400 text-xs leading-normal print:hidden">
                  <Info className="h-4.5 w-4.5 text-[#4895EF] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Visualização Digital da Proposta Técnica</p>
                    <p className="text-[11px]">Esta seção renderiza o documento final de 14 páginas exatamente no layout físico que seu cliente visualizará no link seguro ou no arquivo PDF impresso.</p>
                  </div>
                </div>

                {/* THE A4 PRINT BLOCK FOR EXPORT */}
                <div 
                  id="proposal-printable-block"
                  className="bg-slate-100/50 dark:bg-slate-950/20 text-slate-950 rounded-3xl overflow-hidden p-0 font-sans text-xs leading-relaxed max-w-[210mm] mx-auto text-left space-y-6 print:space-y-0"
                >
                  
                  {/* PAGE 1: COVER (CAPA) */}
                  {visibleSections.capa && (
                    <div className="flex flex-col justify-between break-after-page page-block page-block-cover border-b border-slate-100 relative overflow-hidden bg-gradient-to-br from-[#f4f7fa] via-[#edf2f7] to-[#e2e8f0]">
                      {/* Background Image overlay for Capa */}
                      <img 
                        src={capaBg} 
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
                              <p><strong>Proposta nº:</strong> PROP-{new Date().getFullYear()}-{Math.floor(100 + Math.random() * 900)}</p>
                              <p><strong>Data de Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
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
                    <div className="flex flex-col justify-between break-after-page page-block page-block-cover relative overflow-hidden bg-gradient-to-br from-[#f4f7fa] via-[#edf2f7] to-[#e2e8f0]">
                      {/* Background Image overlay for Contracapa */}
                      <img 
                        src={contracapaBg} 
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
                              Sob a direção técnica do Engenheiro Mecânico <strong>Vitor Leonardo C. Linhares (CREA-PE 182229949-0)</strong>, nossa atuação é pautada pelo rigor metodológico e conformidade com as normas técnicas da ABNT e diretrizes federais de segurança do trabalho.
                            </p>
                          </div>

                          <div className="md:col-span-7 flex justify-center">
                            <div className="relative p-2.5 bg-transparent border-transparent rounded-3xl overflow-hidden max-w-sm w-full">
                              <div className="absolute top-0 right-0 w-16 h-16 border-b border-l border-slate-400/20 pointer-events-none z-10" />
                              <div className="absolute bottom-0 left-0 w-16 h-16 border-t border-r border-slate-400/20 pointer-events-none z-10" />
                              
                              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-transparent relative">
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
                              <p><strong>Engenheiro Responsável:</strong> Vitor Leonardo C. Linhares</p>
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
                              <p className="font-bold text-slate-700 mt-0.5">{new Date().toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-100">
                              <p className="text-slate-400 font-mono text-[9px] uppercase">Código de Controle Interno</p>
                              <p className="font-bold text-slate-700 mt-0.5">PROP-{new Date().getFullYear()}-{Math.floor(100 + Math.random() * 900)}</p>
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
                              {(escopoItems && escopoItems.length > 0 ? escopoItems : [
                                { item: "01", atividade: "Inspeção In Loco", descricao: "Vistoria presencial minuciosa do maquinário ou instalação para mapeamento visual de não-conformidades de segurança." },
                                { item: "02", atividade: "Checklists Normativos", descricao: "Aplicação de checklists técnicos customizados baseados nas resoluções ABNT e normas federais de referência." },
                                { item: "03", atividade: "Ensaios Físicos", descricao: "Realização de ensaios estruturais não destrutivos avançados (PM, ultrassom ou estanqueidade) conforme exigido pela categoria do equipamento." },
                                { item: "04", atividade: "Emissão de Relatório", descricao: "Elaboração de laudo fotográfico conclusivo apontando falhas e plano de ação corretivo detalhado para readequação física." },
                                { item: "05", atividade: "ART CREA-PE", descricao: "Anotação de Responsabilidade Técnica emitida eletronicamente junto ao conselho federal de engenharia, conferindo validade legal." },
                              ]).map((esc, idx) => (
                                <tr key={idx}>
                                  <td className="p-2.5 font-bold text-[#0B2545]">{esc.item}</td>
                                  <td className="p-2.5 font-bold text-slate-800">{esc.atividade}</td>
                                  <td className="p-2.5">{esc.descricao}</td>
                                </tr>
                              ))}
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
                                <p className="text-[9px] text-slate-400 font-mono mt-1">
                                  {hasNf 
                                    ? "Inclusos: Emissão de Nota Fiscal de Serviços (NFS-e), taxas de CREA-PE (ART) e deslocamentos operacionais." 
                                    : "Inclusos: Taxas de CREA-PE (ART) e deslocamentos operacionais."}
                                </p>
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
                            <div className="h-20 flex items-center justify-center">
                              <img src={assinaturaVitor} alt="Assinatura Vitor Leonardo" className="h-16 object-contain mix-blend-multiply" />
                            </div>
                            <div className="h-0.5 w-32 bg-slate-200 mx-auto mt-2" />
                            <p className="font-bold text-slate-800 text-xs mt-1">Vitor Leonardo C. Linhares</p>
                            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Responsável Técnico • CREA-PE 182229949-0</p>
                          </div>

                          <div className="text-center space-y-2">
                            <p className="text-slate-400 font-mono text-[9px] italic">[Aguardando Assinatura Eletrônica]</p>
                            <div className="h-0.5 w-32 bg-slate-200 mx-auto mt-2" />
                            <p className="font-bold text-slate-800 text-xs mt-1">{clientName || "Representante Comercial"}</p>
                            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{clientCompany || "Empresa Cliente"}</p>
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
                          <p>Telefone / WhatsApp: (81) 98444-2592</p>
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

              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW: PROPOSALS HISTORY TABLE */}
      {activeTab === "history" && (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Acervo Histórico de Propostas e Status</h3>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente ou código..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#4895EF] font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Cód. Proposta</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Cliente / Empresa</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Cidade/UF</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-right">Valor Líquido</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-center">Status</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Nenhum orçamento encontrado no histórico.</td>
                  </tr>
                ) : (
                  filteredHistory.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-[#4895EF]">{prop.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-white font-sans text-xs">{prop.clientCompany}</p>
                        <p className="text-[10px] text-slate-400">Resp: {prop.clientName}</p>
                      </td>
                      <td className="p-3">{prop.clientCity} - {prop.clientState}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">R$ {prop.pricingInfo.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          prop.status === "aprovado"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : prop.status === "enviado"
                            ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {deletingProposalId === prop.id ? (
                            <div className="flex items-center gap-1 animate-pulse bg-slate-950 p-1 rounded-lg border border-red-900/40">
                              <span className="text-[9px] text-red-500 font-bold uppercase px-1">Excluir?</span>
                              <button
                                onClick={() => deleteProposal(prop.id)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase rounded cursor-pointer transition-all"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeletingProposalId(null)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase rounded cursor-pointer transition-all"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleCopySecureLink(prop.id)}
                                className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-850 hover:border-slate-750 transition-all text-blue-400 cursor-pointer"
                                title="Copiar Link Seguro de Assinatura"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              
                              <button 
                                onClick={() => handleEditProposal(prop)}
                                className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-850 hover:border-slate-750 transition-all text-emerald-400 cursor-pointer"
                                title="Editar Orçamento / Carregar Rascunho"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              
                              <button 
                                onClick={() => {
                                  const secureUrl = getSharedUrl(prop.id);
                                  window.open(secureUrl, "_blank");
                                }}
                                className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-850 hover:border-slate-750 transition-all text-amber-400 cursor-pointer"
                                title="Visualizar Portal do Cliente"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              <button 
                                onClick={() => setDeletingProposalId(prop.id)}
                                className="p-1.5 bg-slate-950 hover:bg-red-950/40 rounded-lg border border-slate-850 hover:border-red-900/60 transition-all text-red-500 cursor-pointer"
                                title="Excluir Orçamento"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
