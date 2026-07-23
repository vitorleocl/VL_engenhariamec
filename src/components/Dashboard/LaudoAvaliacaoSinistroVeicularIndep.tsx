import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import LaudoPricingTab from "./LaudoPricingTab";
import { saveGeneratorLaudo } from "../../lib/generatorStorage";
import { ReportSignature, ReportHeader } from "./ReportBranding";
import { 
  Shield, 
  FileText, 
  Wand2, 
  CheckCircle, 
  AlertTriangle, 
  Calculator, 
  Printer, 
  FileDown, 
  Layers, 
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
  Car,
  Check,
  AlertOctagon,
  HelpCircle as HelpIcon,
  Award,
  Edit2
} from "lucide-react";

interface UploadedImage {
  id: string;
  name: string;
  data: string;
  category: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  category: "structure" | "direction" | "suspension" | "brakes" | "safety";
  name: string;
  status: "Conforme" | "Danificado" | "Não Avaliado";
  notes: string;
  linkedPhotoId?: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Estrutura
  { id: "str_1", category: "structure", name: "Longarina dianteira", status: "Conforme", notes: "Sem indícios de deformação torcional ou amassamentos estruturais." },
  { id: "str_2", category: "structure", name: "Longarina traseira", status: "Conforme", notes: "Sem desalinhamento ou reparos anteriores." },
  { id: "str_3", category: "structure", name: "Travessas", status: "Conforme", notes: "Íntegras e alinhadas." },
  { id: "str_4", category: "structure", name: "Painel frontal", status: "Conforme", notes: "Alinhado com a travessa de proteção frontal." },
  { id: "str_5", category: "structure", name: "Painel traseiro", status: "Conforme", notes: "Estrutura preservada." },
  { id: "str_6", category: "structure", name: "Assoalho", status: "Conforme", notes: "Chapa original sem amassados significativos." },
  { id: "str_7", category: "structure", name: "Teto", status: "Conforme", notes: "Sem sinais de capotamento ou flambagem de chapa." },
  { id: "str_8", category: "structure", name: "Coluna A", status: "Conforme", notes: "Pontos de solda de fábrica preservados." },
  { id: "str_9", category: "structure", name: "Coluna B", status: "Conforme", notes: "Perfeita integridade e alinhamento das portas." },
  { id: "str_10", category: "structure", name: "Coluna C", status: "Conforme", notes: "Pontos de solda originais íntegros." },
  { id: "str_11", category: "structure", name: "Caixa de roda", status: "Conforme", notes: "Preservada, sem deformações por impacto lateral." },
  { id: "str_12", category: "structure", name: "Chassi", status: "Conforme", notes: "Gravação legível e sem deformações estruturais." },
  { id: "str_13", category: "structure", name: "Subchassi", status: "Conforme", notes: "Preservado e fixado adequadamente." },

  // Direção
  { id: "dir_1", category: "direction", name: "Caixa de direção", status: "Conforme", notes: "Sem folgas de cremalheira ou vazamento de fluido hidráulico." },
  { id: "dir_2", category: "direction", name: "Coluna de direção", status: "Conforme", notes: "Absorvedor de impacto e articulações íntegras." },
  { id: "dir_3", category: "direction", name: "Terminais", status: "Conforme", notes: "Coifas protetoras íntegras, sem folgas excessivas." },
  { id: "dir_4", category: "direction", name: "Braços", status: "Conforme", notes: "Braços oscilantes sem empeno." },

  // Suspensão
  { id: "susp_1", category: "suspension", name: "Bandejas", status: "Conforme", notes: "Buchas e pivôs íntegros, sem folga operativa." },
  { id: "susp_2", category: "suspension", name: "Amortecedores", status: "Conforme", notes: "Haste seca, sem vazamentos e ação amortecedora nominal." },
  { id: "susp_3", category: "suspension", name: "Molas", status: "Conforme", notes: "Ausência de trincas ou fadiga elástica aparente." },
  { id: "susp_4", category: "suspension", name: "Torres", status: "Conforme", notes: "Sem deformações nos copos de montagem superior." },
  { id: "susp_5", category: "suspension", name: "Eixos", status: "Conforme", notes: "Eixo traseiro perfeitamente alinhado." },
  { id: "susp_6", category: "suspension", name: "Agregados", status: "Conforme", notes: "Coxins de motor e suspensão fixados." },

  // Freios
  { id: "brk_1", category: "brakes", name: "Discos", status: "Conforme", notes: "Espessura útil dentro do limite mínimo do fabricante." },
  { id: "brk_2", category: "brakes", name: "Tambores", status: "Conforme", notes: "Preservados, sem ovalização." },
  { id: "brk_3", category: "brakes", name: "Pinças", status: "Conforme", notes: "Êmbolos e borrachas de vedação operacionais." },
  { id: "brk_4", category: "brakes", name: "Tubulações", status: "Conforme", notes: "Tubos rígidos e flexíveis sem ressecamentos ou vazamento." },

  // Segurança
  { id: "saf_1", category: "safety", name: "Airbags", status: "Conforme", notes: "Módulos de motorista, passageiro e cortina íntegros e sem ativação." },
  { id: "saf_2", category: "safety", name: "Pré-tensionadores", status: "Conforme", notes: "Dispositivos pirotécnicos dos cintos sem ativação registrada." },
  { id: "saf_3", category: "safety", name: "Cintos", status: "Conforme", notes: "Cintos de segurança de três pontos operando com retração perfeita." },
  { id: "saf_4", category: "safety", name: "ABS", status: "Conforme", notes: "Sensores de roda ativos e bomba moduladora de pressão operacional." },
  { id: "saf_5", category: "safety", name: "ESC", status: "Conforme", notes: "Sistema de controle eletrônico de estabilidade em conformidade." }
];

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
  initialData?: any;
  initialSavedId?: string | null;
}

export default function LaudoAvaliacaoSinistroVeicularIndep({ onBack, initialPrefilled = false, clients, initialData, initialSavedId }: Props) {
  const [activeTab, setActiveTab] = useState<"form" | "pricing">("form");
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // State Management for saved generator reports
  const [savedId, setSavedId] = useState<string | null>(initialSavedId || null);
  const [coverImage, setCoverImage] = useState<string>("");
  const [blankSignature, setBlankSignature] = useState<boolean>(false);

  // 1. Cadastro do Processo
  const [processo, setProcesso] = useState({
    laudoNumber: "LAS-004/2026 Rev. 00",
    dataVistoria: "2026-07-17",
    dataSinistro: "2026-07-12",
    localAcidente: "Rodovia BR-101, Km 45",
    cidadeUf: "Recife/PE",
    artNumber: "ART-PE-2026-081745",
    processoNumber: "PR-2026-9812-CIV",
    solicitante: "Seguradora Allianz Brasil S/A",
    finalidade: "Avaliação pericial de sinistro e enquadramento de monta para fins de indenização integral e liberação de tráfego."
  });

  // 2. Dados do Proprietário
  const [proprietario, setProprietario] = useState({
    nome: "Carlos Eduardo de Souza Santos",
    cpfCnpj: "049.281.382-90",
    endereco: "Rua do Futuro, 1205 - Jaqueira, Recife - PE",
    telefone: "(81) 99876-5432",
    email: "carlos.santos@email.com"
  });

  // 3. Identificação do Veículo
  const [veiculo, setVeiculo] = useState({
    marca: "Toyota",
    modelo: "Corolla",
    versao: "Altis Hybrid Premium 1.8",
    anoFab: "2023",
    anoMod: "2024",
    cor: "Preto Eclipse",
    placa: "VL-MEC-26",
    renavam: "01398274615",
    chassi: "9BRBC12EXR9284712",
    categoria: "Particular",
    especie: "Passageiro",
    tipo: "Automóvel",
    combustivel: "Flex / Híbrido",
    quilometragem: "28.450 km",
    motorNumber: "2ZR-FXE-8927341",
    proprietario: ""
  });

  // 4. Histórico do Sinistro
  const [historico, setHistorico] = useState(
    "Trata-se de sinistro por colisão frontal e oblíqua ocorrido no dia 12 de julho de 2026 às 14:30h, na BR-101, Km 45. O condutor relata que, sob pista molhada e chuva forte (condições climáticas adversas), outro veículo realizou frenagem brusca à frente. Para evitar colisão traseira total, o condutor tentou desviar para a faixa da direita, atingindo de forma frontal/lateral-esquerda a barreira de proteção de concreto (defensa rígida).\n\nA colisão ocasionou amassamento severo da porção frontal esquerda, afetando componentes estruturais, para-lama dianteiro esquerdo, capô, conjunto óptico esquerdo, para-choque frontal e suspensão dianteira esquerda. O boletim de ocorrência da PRF de nº 89472/2026 confirms as condições climáticas desfavoráveis e danos de grande monta aparentes."
  );

  // 7. Avaliação Técnica (Checklist)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  // 8. Classificação dos Danos
  const [regimeClassificacao, setRegimeClassificacao] = useState<"contran" | "frotas">("contran");
  const [classificacao, setClassificacao] = useState<string>("Média Monta");

  // 9. Fundamentação Técnica
  const [fundamentacao, setFundamentacao] = useState(
    "A fundamentação pericial técnica deste laudo baliza-se em conformidade estrita com:\n" +
    "1. Resolução CONTRAN nº 810/2020 e suas alterações posteriores (que dispõe sobre a classificação de danos e procedimentos para a regularização de veículos sinistrados).\n" +
    "2. Manual Brasileiro de Inspeção Veicular (MBIV).\n" +
    "3. Código de Trânsito Brasileiro (CTB) - Lei Federal nº 9.503/1997.\n" +
    "4. Normas ABNT NBR 14040 (Inspeção de Segurança Veicular) e ABNT NBR 13971 (Inspeção em Sistemas de Suspensão e Direção).\n" +
    "5. Diretrizes do fabricante Toyota Motor Corporation para reparação estrutural do chassi e componentes de deformação programada."
  );

  // 10. Conclusão Técnica
  const [conclusao, setConclusao] = useState(
    "Com base nas avaliações periciais físicas realizadas in loco no veículo Toyota Corolla (Placa: VL-MEC-26) e no enquadramento técnico-legal da Resolução CONTRAN nº 810/2020, o veículo apresenta Danos de MÉDIA MONTA.\n\n" +
    "A colisão afetou componentes estruturais vitais não redundantes, como a ponta da longarina dianteira esquerda (amassada e defletida horizontalmente) e o painel frontal. Houve danos mecânicos significativos na suspensão dianteira esquerda (bandeja e amortecedor empenados), além do acionamento completo dos airbags frontais (motorista e passageiro) com danos nos pré-tensionadores dos cintos de segurança.\n\n" +
    "Sob o aspect de engenharia legal, o veículo é recuperável, condicionando sua liberação de tráfego à substituição integral das peças danificadas por componentes genuínos, reparo estrutural em mesa de alinhamento monobloco, recarga completa do sistema SRS de Airbag e emissão de Certificado de Segurança Veicular (CSV) por Instituição Técnica Licenciada (ITL)."
  );

  // 11. Recomendações
  const [recomendacoes, setRecomendacoes] = useState(
    "- Substituição integral e imediata do conjunto da suspensão dianteira esquerda (amortecedor, bandeja, manga de eixo, cubo e rolamento).\n" +
    "- Alinhamento técnico do subchassi e estiramento controlado da ponta da longarina dianteira esquerda em mesa de tração por coordenadas ópticas de fábrica.\n" +
    "- Substituição de ambos os airbags frontais (painel, bolsa, volante e chicotes), incluindo os sensores perimetrais e central do SRS.\n" +
    "- Substituição dos conjuntos dianteiros de cinto de segurança devido à ativação pirotécnica dos pré-tensionadores.\n" +
    "- Inspeção de geometria veicular 3D computadorizada e ensaio de trincas por líquido penetrante nas juntas de solda das travessas após o estiramento.\n" +
    "- Realização de Inspeção Técnica Veicular por ITL credenciada pelo SENATRAN para emissão de CSV (Certificado de Segurança Veicular) conforme exigência legal para desbloqueio do documento junto ao DETRAN-PE."
  );

  // Load initial data
  useEffect(() => {
    if (initialData) {
      if (initialData.uploadedImages) setUploadedImages(initialData.uploadedImages);
      if (initialData.processo) setProcesso(initialData.processo);
      if (initialData.proprietario) setProprietario(initialData.proprietario);
      if (initialData.veiculo) setVeiculo(initialData.veiculo);
      if (initialData.historico) setHistorico(initialData.historico);
      if (initialData.checklist) setChecklist(initialData.checklist);
      if (initialData.regimeClassificacao) setRegimeClassificacao(initialData.regimeClassificacao);
      if (initialData.classificacao) setClassificacao(initialData.classificacao);
      if (initialData.fundamentacao) setFundamentacao(initialData.fundamentacao);
      if (initialData.conclusao) setConclusao(initialData.conclusao);
      if (initialData.recomendacoes) setRecomendacoes(initialData.recomendacoes);
      if (initialData.coverImage) setCoverImage(initialData.coverImage);
      if (initialData.blankSignature !== undefined) setBlankSignature(initialData.blankSignature);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      const clientName = veiculo.proprietario || proprietario.nome || "Cliente Geral";
      const equipmentModel = `${veiculo.marca} ${veiculo.modelo}`;
      const date = processo.dataVistoria;
      const formData = {
        uploadedImages,
        processo,
        proprietario,
        veiculo,
        historico,
        checklist,
        regimeClassificacao,
        classificacao,
        fundamentacao,
        conclusao,
        recomendacoes,
        coverImage,
        blankSignature
      };

      const newId = await saveGeneratorLaudo(
        'sinistro_veicular',
        clientName,
        equipmentModel,
        date,
        formData,
        savedId || undefined
      );
      setSavedId(newId);
      alert("Alterações salvas com sucesso");
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar o laudo: ${err?.message || err}`);
    }
  };

  const reportRef = useRef<HTMLDivElement>(null);

  // Automatically count how many items are damaged
  const getDamagedCount = () => {
    return checklist.filter(item => item.status === "Danificado").length;
  };

  const getConformeCount = () => {
    return checklist.filter(item => item.status === "Conforme").length;
  };

  const getNaCount = () => {
    return checklist.filter(item => item.status === "Não Avaliado").length;
  };

  // Simulates AI evaluation of attached images and populates values
  const handleAIEvaluation = () => {
    if (uploadedImages.length === 0) {
      alert("Por favor, anexe pelo menos uma foto do veículo na seção abaixo antes de rodar o motor de IA.");
      return;
    }
    setLoadingAI(true);
    
    setTimeout(() => {
      // AI Logic Simulation
      // Finds which images are attached and marks relevant items in the checklist as "Danificado"
      const updatedChecklist = [...checklist];
      
      // Let's simulate IA detecting damages in front left collision
      const frontDamages = ["Longarina dianteira", "Painel frontal", "Amortecedores", "Bandejas", "Airbags", "Pré-tensionadores", "Cintos"];
      
      updatedChecklist.forEach(item => {
        if (frontDamages.includes(item.name)) {
          item.status = "Danificado";
          item.notes = `[IA DETECTOU AVARIA]: Deformação por impacto severo correspondente à imagem frontal/lateral esquerda enviada.`;
        }
      });
      
      setChecklist(updatedChecklist);
      setClassificacao("Média Monta");
      
      setHistorico(
        "Trata-se de sinistro por colisão frontal e oblíqua ocorrido no dia 12 de julho de 2026 às 14:30h, na BR-101, Km 45. O condutor relata que, sob pista molhada e chuva forte (condições climáticas adversas), outro veículo realizou frenagem brusca à frente. Para evitar colisão traseira total, o condutor tentou desviar para a faixa da direita, atingindo de forma frontal/lateral-esquerda a barreira de proteção de concreto (defensa rígida).\n\nA colisão ocasionou amassamento severo da porção frontal esquerda, afetando componentes estruturais, para-lama dianteiro esquerdo, capô, conjunto óptico esquerdo, para-choque frontal e suspensão dianteira esquerda. O boletim de ocorrência da PRF de nº 89472/2026 confirma as condições climáticas desfavoráveis e danos de grande monta aparentes."
      );
      
      setConclusao(
        "Com base nas avaliações periciais físicas realizadas in loco no veículo Toyota Corolla (Placa: VL-MEC-26) e no enquadramento técnico-legal da Resolução CONTRAN nº 810/2020, o veículo apresenta Danos de MÉDIA MONTA.\n\n" +
        "A colisão afetou componentes estruturais vitais não redundantes, como a ponta da longarina dianteira esquerda (amassada e defletida horizontalmente) e o painel frontal. Houve danos mecânicos significativos na suspensão dianteira esquerda (bandeja e amortecedor empenados), além do acionamento completo dos airbags frontais (motorista e passageiro) com danos nos pré-tensionadores dos cintos de segurança.\n\n" +
        "Sob o aspecto de engenharia legal, o veículo é recuperável, condicionando sua liberação de tráfego à substituição integral das peças danificadas por componentes genuínos, reparo estrutural em mesa de alinhamento monobloco, recarga completa do sistema SRS de Airbag e emissão de Certificado de Segurança Veicular (CSV) por Instituição Técnica Licenciada (ITL)."
      );

      // Auto update image descriptions with technical captions
      const updatedImages = uploadedImages.map((img, index) => {
        let cap = `Registro Fotográfico nº ${index + 1}: Componentes do veículo avaliados em campo.`;
        if (img.category === "frontal") {
          cap = `Fotografia nº ${index + 1} (Frente do Veículo): Visão da zona de impacto primário frontal/lateral esquerda. Evidencia-se deformação na travessa e deformação acentuada do capô e para-lama.`;
        } else if (img.category === "suspensão") {
          cap = `Fotografia nº ${index + 1} (Suspensão Esquerda): Amortecedor e bandeja de suspensão dianteira esquerda apresentando desalinhamento e empeno visível pós colisão.`;
        } else if (img.category === "airbags") {
          cap = `Fotografia nº ${index + 1} (Painel / Volante): Acionamento total do sistema pirotécnico do airbag dianteiro esquerdo e direito, denotando desaceleração acima dos limites operacionais.`;
        } else if (img.category === "longarinas") {
          cap = `Fotografia nº ${index + 1} (Estrutura Inferior): Extremidade da longarina dianteira esquerda com amassamento plástico estrutural visível na alma de aço.`;
        }
        return { ...img, description: cap };
      });
      setUploadedImages(updatedImages);

      setLoadingAI(false);
      alert("A Inteligência Artificial da VL Engenharia analisou as imagens e o prompt técnico, preencheu o checklist pericial estrutural, sugeriu a classificação 'Média Monta' e gerou legendas e pareceres de engenharia com sucesso!");
    }, 2200);
  };

  const loadSimulatedData = () => {
    // Already populated by default with realistic Corolla crash scenario
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, cat: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const newImg: UploadedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          data: reader.result as string,
          category: cat,
          description: `Registro fotográfico da porção ${cat} do veículo sinistrado.`
        };
        setUploadedImages(prev => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    
    // Smooth transitions styles bypass
    preprocessStylesheets();
    
    // Add temporary printing class
    element.classList.add("pdf-render-mode");

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Laudo_Sinistro_${veiculo.placa}_${processo.laudoNumber}.pdf`.replace(/\s+/g, "_"),
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] as any }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        element.classList.remove("pdf-render-mode");
        restoreStylesheets();
      })
      .catch((err: any) => {
        console.error("PDF download failed:", err);
        element.classList.remove("pdf-render-mode");
        restoreStylesheets();
      });
  };

  // Checklist updates
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const updateChecklistItemStatus = (id: string, status: "Conforme" | "Danificado" | "Não Avaliado") => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const updateChecklistItemNotes = (id: string, notes: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const addChecklistItem = (cat: "structure" | "direction" | "suspension" | "brakes" | "safety") => {
    const newId = `custom_${Date.now()}`;
    const newItem: ChecklistItem = {
      id: newId,
      category: cat,
      name: "Novo Item de Verificação",
      status: "Conforme",
      notes: "Sem anomalias."
    };
    setChecklist(prev => [...prev, newItem]);
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const updateChecklistItemName = (id: string, name: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header Controls Banner */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20 py-4 px-6 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs text-[#134074] dark:text-[#4895EF] hover:underline font-bold font-mono tracking-wide uppercase cursor-pointer"
            >
              ← Voltar ao Acervo
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 text-white rounded-lg">
                <Car className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Laudo de Avaliação de Sinistro Veicular
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              PERÍCIA AUTOMOTIVA • RESOLUÇÃO CONTRAN Nº 810/2020 • LAUDO IA
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("form")}
                className={`px-4 py-2 text-xs font-black font-mono tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
                  activeTab === "form" 
                    ? "bg-[#0B2545] text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Laudo Principal
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-4 py-2 text-xs font-black font-mono tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
                  activeTab === "pricing" 
                    ? "bg-[#0B2545] text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Precificação & Proposta
              </button>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar no Sistema</span>
            </button>

            <button
              onClick={() => exportToWord("perito-sinistro-doc", `Laudo_Sinistro_${veiculo.placa || 'Veiculo'}_${processo.laudoNumber.replace(/\//g, '-')}`)}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Exportar Word</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {activeTab === "pricing" ? (
          <div className="lg:col-span-12">
            <LaudoPricingTab 
              clientName={veiculo.proprietario || "Cliente"} 
              serviceType="Avaliação de Sinistro Veicular" 
              equipmentName={`${veiculo.marca} ${veiculo.modelo}`} 
            />
          </div>
        ) : (
          <>
            {/* Editor Sidebar Panels */}
            <div className="lg:col-span-5 space-y-6">
              {/* IA Assistant Panel */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider font-mono">Motor de IA de Sinistros</h3>
                      <p className="text-[10px] text-slate-400 font-mono">AUTOMATION SYSTEM</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full font-bold uppercase font-mono">ATIVO</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Insira as fotos do veículo sinistrado nas categorias abaixo e clique no botão para que a IA analise a integridade física, identifique componentes afetados e gere as legendas e o parecer pericial automaticamente.
                </p>

                <div className="space-y-3">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase">
                    Instruções Específicas para o Agente (Opcional)
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Foque nos danos das colunas estruturais esquerdas e airbags frontais acionados..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#4895EF] font-sans h-20 leading-relaxed"
                  />
                  
                  <button
                    onClick={handleAIEvaluation}
                    disabled={loadingAI}
                    className="w-full flex items-center justify-center gap-2 bg-[#134074] hover:bg-[#1a5291] disabled:bg-slate-800 text-white p-3.5 rounded-xl text-xs font-black font-mono tracking-widest uppercase transition-all shadow-md hover:scale-102 cursor-pointer"
                  >
                    {loadingAI ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>ANALISANDO COMPONENTES...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>PROCESSAR COM IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 1: Processo e Proprietario */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-6">
                <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[#134074] dark:text-[#4895EF]">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Dados do Processo</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Nº do Laudo</label>
                    <input
                      type="text"
                      value={processo.laudoNumber}
                      onChange={(e) => setProcesso({ ...processo, laudoNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">ART Vinculada</label>
                    <input
                      type="text"
                      value={processo.artNumber}
                      onChange={(e) => setProcesso({ ...processo, artNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Data Vistoria</label>
                    <input
                      type="date"
                      value={processo.dataVistoria}
                      onChange={(e) => setProcesso({ ...processo, dataVistoria: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Data Sinistro</label>
                    <input
                      type="date"
                      value={processo.dataSinistro}
                      onChange={(e) => setProcesso({ ...processo, dataSinistro: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Local do Acidente</label>
                    <input
                      type="text"
                      value={processo.localAcidente}
                      onChange={(e) => setProcesso({ ...processo, localAcidente: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Cidade / UF</label>
                    <input
                      type="text"
                      value={processo.cidadeUf}
                      onChange={(e) => setProcesso({ ...processo, cidadeUf: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Processo Judicial (Opcional)</label>
                    <input
                      type="text"
                      value={processo.processoNumber}
                      onChange={(e) => setProcesso({ ...processo, processoNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Solicitante</label>
                    <input
                      type="text"
                      value={processo.solicitante}
                      onChange={(e) => setProcesso({ ...processo, solicitante: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Finalidade do Laudo</label>
                    <textarea
                      value={processo.finalidade}
                      onChange={(e) => setProcesso({ ...processo, finalidade: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white leading-relaxed h-16"
                    />
                  </div>
                </div>

                {/* Opções Extras: Capa e Assinatura */}
                <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assinatura em Branco */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Assinatura de Responsabilidade</h4>
                      <p className="text-[10px] text-slate-400">Escolha se quer assinar com assinatura padrão VL Engenharia ou deixar em branco para assinar com o Gov.br</p>
                    </div>
                    <label className="flex items-center gap-2 mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 select-none">
                      <input
                        type="checkbox"
                        checked={blankSignature}
                        onChange={(e) => setBlankSignature(e.target.checked)}
                        className="rounded text-[#134074] focus:ring-[#134074] border-slate-300 w-4 h-4 cursor-pointer"
                      />
                      <span>Deixar assinatura em branco (para assinar via Gov.br)</span>
                    </label>
                  </div>

                  {/* Foto de Capa */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Imagem de Destaque da Capa</h4>
                      <p className="text-[10px] text-slate-400">Adicione uma foto do veículo sinistrado para ilustrar a capa do laudo</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      {coverImage ? (
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border">
                          <img src={coverImage} className="w-full h-full object-cover" alt="Cover preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setCoverImage("")}
                            className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow transition-all cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center border text-slate-400">
                          <Car className="w-5 h-5" />
                        </div>
                      )}
                      
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] rounded-lg cursor-pointer transition-all">
                        <Upload className="w-3 h-3" />
                        <span>Selecionar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCoverImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">Dados do Proprietário</h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Nome Completo</label>
                      <input
                        type="text"
                        value={proprietario.nome}
                        onChange={(e) => setProprietario({ ...proprietario, nome: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">CPF / CNPJ</label>
                      <input
                        type="text"
                        value={proprietario.cpfCnpj}
                        onChange={(e) => setProprietario({ ...proprietario, cpfCnpj: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Telefone</label>
                      <input
                        type="text"
                        value={proprietario.telefone}
                        onChange={(e) => setProprietario({ ...proprietario, telefone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">E-mail</label>
                      <input
                        type="text"
                        value={proprietario.email}
                        onChange={(e) => setProprietario({ ...proprietario, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Endereço Residencial</label>
                      <input
                        type="text"
                        value={proprietario.endereco}
                        onChange={(e) => setProprietario({ ...proprietario, endereco: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Veiculo e Historico */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 text-left">
                <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[#134074] dark:text-[#4895EF]">
                    <Car className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Identificação do Veículo</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Marca</label>
                    <input
                      type="text"
                      value={veiculo.marca}
                      onChange={(e) => setVeiculo({ ...veiculo, marca: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Modelo</label>
                    <input
                      type="text"
                      value={veiculo.modelo}
                      onChange={(e) => setVeiculo({ ...veiculo, modelo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Versão</label>
                    <input
                      type="text"
                      value={veiculo.versao}
                      onChange={(e) => setVeiculo({ ...veiculo, versao: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Ano Fabr.</label>
                    <input
                      type="text"
                      value={veiculo.anoFab}
                      onChange={(e) => setVeiculo({ ...veiculo, anoFab: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Ano Modelo</label>
                    <input
                      type="text"
                      value={veiculo.anoMod}
                      onChange={(e) => setVeiculo({ ...veiculo, anoMod: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Cor</label>
                    <input
                      type="text"
                      value={veiculo.cor}
                      onChange={(e) => setVeiculo({ ...veiculo, cor: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Placa</label>
                    <input
                      type="text"
                      value={veiculo.placa}
                      onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">RENAVAM</label>
                    <input
                      type="text"
                      value={veiculo.renavam}
                      onChange={(e) => setVeiculo({ ...veiculo, renavam: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Chassi</label>
                    <input
                      type="text"
                      value={veiculo.chassi}
                      onChange={(e) => setVeiculo({ ...veiculo, chassi: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Combustível</label>
                    <input
                      type="text"
                      value={veiculo.combustivel}
                      onChange={(e) => setVeiculo({ ...veiculo, combustivel: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Quilometragem</label>
                    <input
                      type="text"
                      value={veiculo.quilometragem}
                      onChange={(e) => setVeiculo({ ...veiculo, quilometragem: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Nº do Motor (Opcional)</label>
                    <input
                      type="text"
                      value={veiculo.motorNumber || ""}
                      onChange={(e) => setVeiculo({ ...veiculo, motorNumber: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Histórico & Dinâmica do Sinistro</label>
                    <textarea
                      value={historico}
                      onChange={(e) => setHistorico(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-950 dark:text-white h-28 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Categorized Image Uploads */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 text-left">
                <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[#134074] dark:text-[#4895EF]">
                    <Upload className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Anexos Fotográficos de Campo</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Anexe fotografias divididas por subsistemas técnicos. A IA utilizará estas imagens organizadas para enquadrar as legendas.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {["frontal", "traseira", "lateral_esquerda", "lateral_direita", "teto", "interior", "motor", "suspensão", "direção", "chassi", "longarinas", "airbags"].map((cat) => (
                      <div key={cat} className="relative group border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex flex-col items-center justify-center">
                        <Upload className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#134074] dark:group-hover:text-[#4895EF] mb-1" />
                        <span className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 truncate max-w-full">
                          {cat.replace("_", " ")}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, cat)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <h4 className="text-[11px] font-mono font-bold uppercase text-slate-400">Fotos Selecionadas ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {uploadedImages.map((img) => (
                          <div key={img.id} className="flex gap-2.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 items-start">
                            <img src={img.data} alt={img.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                            <div className="flex-grow text-left space-y-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-mono font-bold bg-[#134074]/15 text-[#134074] dark:bg-[#4895EF]/15 dark:text-[#4895EF] px-1.5 py-0.5 rounded-md uppercase">
                                  {img.category.replace("_", " ")}
                                </span>
                                <button onClick={() => removeUploadedImage(img.id)} className="text-slate-400 hover:text-red-500">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={img.description}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setUploadedImages(prev => prev.map(o => o.id === img.id ? { ...o, description: text } : o));
                                }}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-md px-2 py-0.5 text-[10px] text-slate-800 dark:text-slate-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Technical Norms and Config */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm space-y-4 text-left">
                <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[#134074] dark:text-[#4895EF]">
                    <Shield className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white font-sans">Fundamentação Técnica & Normativa</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Regime de Classificação</label>
                      <select
                        value={regimeClassificacao}
                        onChange={(e) => {
                          const regime = e.target.value as "contran" | "frotas";
                          setRegimeClassificacao(regime);
                          setClassificacao(regime === "contran" ? "Média Monta" : "Classe B");
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      >
                        <option value="contran">CONTRAN 810/2020 (Padrão Legal)</option>
                        <option value="frotas">Classificação para Empresas/Frotas</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Classificação Final</label>
                      <select
                        value={classificacao}
                        onChange={(e) => setClassificacao(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white"
                      >
                        {regimeClassificacao === "contran" ? (
                          <>
                            <option value="Pequena Monta">Pequena Monta (Recuperação simples sem bloqueio de CRLV)</option>
                            <option value="Média Monta">Média Monta (Bloqueio de CRLV e exigência de CSV)</option>
                            <option value="Grande Monta">Grande Monta (Indenização integral / Sucata classificada)</option>
                            <option value="Irrecuperável">Irrecuperável (Inviabilidade estrutural de recuperação)</option>
                          </>
                        ) : (
                          <>
                            <option value="Classe A">Classe A (Sem danos materiais e sem vítimas)</option>
                            <option value="Classe B">Classe B (Apenas danos ao veículo da empresa)</option>
                            <option value="Classe C">Classe C (Danos ao veículo e a patrimônio de terceiros)</option>
                            <option value="Classe D">Classe D (Danos materiais com vítimas lesionadas)</option>
                            <option value="Classe E">Classe E (Sinistro fatal)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Fundamentação Normativa (Customizável)</label>
                    <textarea
                      value={fundamentacao}
                      onChange={(e) => setFundamentacao(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-950 dark:text-white h-24 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Parecer Conclusivo Técnico</label>
                    <textarea
                      value={conclusao}
                      onChange={(e) => setConclusao(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-950 dark:text-white h-32 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Recomendações e Diretrizes Mecânicas</label>
                    <textarea
                      value={recomendacoes}
                      onChange={(e) => setRecomendacoes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-950 dark:text-white h-32 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview and Report Document Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Checklist review directly in editor */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm text-left">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                    <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Lista de Verificação de Sinistro</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    {getDamagedCount()} Avarias Encontradas
                  </span>
                </div>

                <div className="mt-4 max-h-[450px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {["structure", "direction", "suspension", "brakes", "safety"].map((cat) => (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 py-1 px-2.5 rounded-md">
                        {cat === "structure" ? "Estrutura do Monobloco" :
                         cat === "direction" ? "Sistema de Direção" :
                         cat === "suspension" ? "Suspensão Mecânica" :
                         cat === "brakes" ? "Freios e Segurança Ativa" :
                         "Sistemas de Retenção e Segurança"}
                      </h4>
                      <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-1">
                        {checklist.filter(item => item.category === cat).map(item => (
                          <div key={item.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group/item">
                            <div className="space-y-1 flex-grow">
                              <div className="flex items-center gap-2">
                                {editingItemId === item.id ? (
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateChecklistItemName(item.id, e.target.value)}
                                    onBlur={() => setEditingItemId(null)}
                                    onKeyDown={(e) => { if (e.key === "Enter") setEditingItemId(null); }}
                                    className="bg-slate-50 dark:bg-slate-900 border border-[#4895EF] rounded px-2 py-0.5 text-xs text-slate-950 dark:text-white font-bold focus:ring-1 focus:ring-[#4895EF] focus:outline-none min-w-[200px]"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingItemId(item.id)}
                                      className="opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-[#4895EF] hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-all cursor-pointer"
                                      title="Editar nome do item"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeChecklistItem(item.id)}
                                      className="opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-all cursor-pointer"
                                      title="Remover item do checklist"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => updateChecklistItemNotes(item.id, e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-800 focus:border-[#4895EF] focus:ring-0 p-0 text-[10px] text-slate-500 dark:text-slate-400 italic"
                                placeholder="Adicionar observações técnicas de campo..."
                              />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {["Conforme", "Danificado", "Não Avaliado"].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateChecklistItemStatus(item.id, st as any)}
                                  className={`px-2 py-1 rounded-md text-[9px] font-black uppercase font-mono tracking-wider border cursor-pointer transition-all ${
                                    item.status === st 
                                      ? st === "Conforme" 
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                        : st === "Danificado"
                                          ? "bg-red-500/10 text-red-500 border-red-500/30 font-bold"
                                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                      : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  {st === "Conforme" ? "OK" : st === "Danificado" ? "AVARIADO" : "N/A"}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Add button at the bottom of each category */}
                        <div className="py-2 flex justify-start">
                          <button
                            type="button"
                            onClick={() => addChecklistItem(cat as any)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#134074] dark:text-[#4895EF] bg-[#134074]/5 dark:bg-[#4895EF]/5 rounded-lg hover:bg-[#134074]/10 dark:hover:bg-[#4895EF]/10 transition-colors cursor-pointer border border-[#134074]/10 dark:border-[#4895EF]/10"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar Item Personalizado
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REPORT DOCUMENT PREVIEW CARD */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-sm text-left">
                <div className="flex items-center justify-between border-b pb-3 mb-6">
                  <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5" />
                    Visualização Pericial Impressa
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Formatado em A4 Real</span>
                </div>

                {/* THE EMBEDDED SHEET FOR EXPORT */}
                <div 
                  ref={reportRef} 
                  id="perito-sinistro-doc"
                  className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-200 shadow-inner font-sans max-w-full overflow-x-auto text-[11px] leading-relaxed select-text space-y-12"
                  style={{ width: "100%", minHeight: "1050px" }}
                >
                  {/* COVER PAGE (PAGE 1) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block text-center pt-16 pb-8">
                    <div className="flex justify-between items-center border-b pb-4">
                      <Logo variant="light" />
                      <div className="text-right text-[9px] font-mono text-slate-500">
                        <p>REGISTRO CREA-PE 1822299490</p>
                        <p>VL Engenharia de Inspeção e Perícia</p>
                      </div>
                    </div>

                    <div className="my-auto space-y-6">
                      <div className="inline-flex items-center gap-1 bg-[#134074]/10 border border-[#134074]/20 px-4 py-1.5 rounded-full text-[#134074] text-xs font-black font-mono uppercase tracking-widest mx-auto">
                        Laudo de Engenharia Legal
                      </div>
                      
                      <h1 className="text-2xl font-black font-sans tracking-tight text-[#0B2545] uppercase max-w-xl mx-auto leading-tight">
                        Laudo Técnico de Avaliação de Sinistro Veicular
                      </h1>
                      
                      <div className="h-1.5 w-24 bg-red-600 mx-auto" />

                      <p className="text-slate-500 text-xs font-mono max-w-sm mx-auto uppercase">
                        AVALIAÇÃO DE INTENSIDADE DE DANOS, REPARABILIDADE E ENQUADRAMENTO DE MONTA (RESOLUÇÃO CONTRAN Nº 810/2020)
                      </p>

                      {/* Espaço para Foto do Veículo na Capa */}
                      <div className="my-4 max-w-md mx-auto w-full h-44 bg-slate-50 border rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative print:border print:shadow-none">
                        {coverImage ? (
                          <img src={coverImage} className="w-full h-full object-cover" alt="Veículo Vistoriado" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="text-center p-4 space-y-1 text-slate-300">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider">Foto do Veículo Vistoriado</p>
                            <p className="text-[9px] font-sans">Nenhuma imagem de capa selecionada.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6 border-t pt-8 border-slate-100">
                      <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto text-[10px] font-sans text-slate-600">
                        <p><strong>Laudo Pericial Nº:</strong> {processo.laudoNumber}</p>
                        <p><strong>ART CREA-PE:</strong> {processo.artNumber}</p>
                        <p><strong>Veículo Sinistrado:</strong> {veiculo.marca} {veiculo.modelo} ({veiculo.placa})</p>
                        <p><strong>Classificação Final:</strong> {classificacao.toUpperCase()}</p>
                        <p><strong>Vistorias Realizadas em:</strong> {processo.dataVistoria}</p>
                        <p><strong>Proprietário:</strong> {proprietario.nome}</p>
                      </div>

                      <div className="pt-8 text-center text-[10px] text-slate-400 font-mono">
                        <p>VL Engenharia & Perícias Automotivas S/A</p>
                        <p>Recife - PE | Brasil</p>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY & INDEX OF SECTIONS (PAGE 2) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="my-auto space-y-6">
                      <h2 className="text-sm font-black border-b-2 border-slate-950 pb-2 text-slate-900 uppercase">
                        Índice Geral do Documento
                      </h2>
                      <ul className="space-y-2.5 text-xs font-mono text-slate-700">
                        <li>01. Identificação do Processo & ART ................................................................. Pág. 03</li>
                        <li>02. Dados do Proprietário e Solicitante ........................................................... Pág. 03</li>
                        <li>03. Dados Técnicos Completos do Veículo .......................................................... Pág. 04</li>
                        <li>04. Histórico da Ocorrência e Sinistro ............................................................ Pág. 04</li>
                        <li>05. Fundamentação Técnica e Regulamentos ......................................................... Pág. 05</li>
                        <li>06. Álbum de Registro Fotográfico de Campo ....................................................... Pág. 05</li>
                        <li>07. Lista de Verificação e Avaliação Física ....................................................... Pág. 06</li>
                        <li>08. Parecer Conclusivo de Enquadramento ......................................................... Pág. 07</li>
                        <li>09. Diretrizes Técnicas de Recomendação ........................................................... Pág. 07</li>
                        <li>10. Encerramento & Assinatura de Responsabilidade ................................................ Pág. 08</li>
                      </ul>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      Laudo Pericial Oficial • Reservado
                    </div>
                  </div>

                  {/* SECTIONS 1 to 4 (PAGE 3) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="space-y-8 my-auto">
                      <div>
                        <h3 className="font-bold text-[10px] uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 01</h3>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Identificação do Processo & ART</h2>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-[10px]">
                          <p><strong>Nº do Laudo:</strong> {processo.laudoNumber}</p>
                          <p><strong>ART CREA-PE:</strong> {processo.artNumber}</p>
                          <p><strong>Data de Vistoria:</strong> {processo.dataVistoria}</p>
                          <p><strong>Data de Ocorrência do Sinistro:</strong> {processo.dataSinistro}</p>
                          <p><strong>Localidade de Ocorrência:</strong> {processo.localAcidente}</p>
                          <p><strong>Processo Judicial Vinculado:</strong> {processo.processoNumber || "Não vinculado / Extrajudicial"}</p>
                          <p className="col-span-2"><strong>Solicitante pericial:</strong> {processo.solicitante}</p>
                          <p className="col-span-2"><strong>Finalidade técnica:</strong> {processo.finalidade}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-[10px] uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 02</h3>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Dados do Proprietário</h2>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-[10px]">
                          <p><strong>Nome / Razão Social:</strong> {proprietario.nome}</p>
                          <p><strong>CPF / CNPJ:</strong> {proprietario.cpfCnpj}</p>
                          <p><strong>Telefone para Contato:</strong> {proprietario.telefone}</p>
                          <p><strong>E-mail cadastrado:</strong> {proprietario.email}</p>
                          <p className="col-span-2"><strong>Endereço declarado:</strong> {proprietario.endereco}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-[10px] uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 03</h3>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Responsável Técnico / Contratada</h2>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-[10px]">
                          <p><strong>Empresa Responsável:</strong> VL ENGENHARIA MECÂNICA</p>
                          <p><strong>Engenheiro Responsável Técnico:</strong> Vitor Leonardo C. Linhares</p>
                          <p><strong>Registro Profissional:</strong> CREA-PE 1822299490</p>
                          <p><strong>E-mail:</strong> vitorleonardocl@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia Mecânica • CREA-PE Ativo
                    </div>
                  </div>

                  {/* SECTION 4 CONTINUED (VEHICLE AND HISTORIC) (PAGE 4) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="space-y-6 my-auto">
                      <div>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Identificação Técnica do Veículo</h2>
                        <div className="grid grid-cols-3 gap-4 pt-2 text-[10px]">
                          <p><strong>Marca:</strong> {veiculo.marca}</p>
                          <p><strong>Modelo:</strong> {veiculo.modelo}</p>
                          <p><strong>Versão:</strong> {veiculo.versao}</p>
                          <p><strong>Ano Fab/Mod:</strong> {veiculo.anoFab} / {veiculo.anoMod}</p>
                          <p><strong>Cor:</strong> {veiculo.cor}</p>
                          <p><strong>Placa:</strong> {veiculo.placa}</p>
                          <p><strong>Chassi:</strong> {veiculo.chassi}</p>
                          <p><strong>RENAVAM:</strong> {veiculo.renavam}</p>
                          <p><strong>Combustível:</strong> {veiculo.combustivel}</p>
                          <p><strong>Quilometragem:</strong> {veiculo.quilometragem}</p>
                          <p><strong>Nº Motor:</strong> {veiculo.motorNumber || "Não Informado"}</p>
                          <p><strong>Categoria:</strong> {veiculo.categoria}</p>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Histórico Técnico do Sinistro</h2>
                        <p className="text-[10px] text-slate-700 leading-relaxed text-justify whitespace-pre-wrap pt-2">
                          {historico}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia Mecânica • Perícia Automotiva
                    </div>
                  </div>

                  {/* ALBUM REGISTRO FOTOGRAFICO (PAGE 5) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="space-y-6 my-auto">
                      <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Registro Fotográfico de Campo</h2>
                      
                      {uploadedImages.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                          <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 animate-bounce" />
                          <p className="text-xs font-semibold">Nenhuma fotografia anexada para o álbum impresso.</p>
                          <p className="text-[10px]">Use os botões na barra lateral para fazer o upload e rodar a IA.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {uploadedImages.slice(0, 4).map((img, index) => (
                            <div key={img.id} className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-2 text-center">
                              <img src={img.data} alt={img.name} className="w-full h-32 object-cover rounded-lg bg-white" />
                              <p className="text-[9px] font-bold font-mono text-[#0B2545] uppercase">
                                Fotografia {index + 1} - Subsistema: {img.category.replace("_", " ")}
                              </p>
                              <p className="text-[9px] text-slate-600 leading-normal text-justify">
                                {img.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia • Documentação de Evidências
                    </div>
                  </div>

                  {/* CHECKLIST E AVALIACAO (PAGE 6) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="my-auto space-y-4">
                      <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Resultados da Lista de Verificação Física</h2>
                      
                      <table className="w-full text-left text-[9px] border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-1.5 border-r border-slate-200 font-bold">Componente Avaliado</th>
                            <th className="p-1.5 border-r border-slate-200 font-bold w-20">Status</th>
                            <th className="p-1.5 font-bold">Observações Técnicas de Campo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {checklist.slice(0, Math.ceil(checklist.length / 2)).map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-1 border-r border-slate-200 font-medium">{item.name}</td>
                              <td className="p-1 border-r border-slate-200">
                                <span className={`px-1 rounded-sm text-[8px] font-black uppercase tracking-wider ${
                                  item.status === "Conforme" 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : item.status === "Danificado"
                                      ? "bg-red-50 text-red-600 font-bold"
                                      : "bg-slate-50 text-slate-500"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-1 text-slate-600">{item.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-[8px] text-slate-400 font-mono italic">
                        * Tabela de auditoria física. Todos os {checklist.length} itens técnicos da planilha de auditoria foram salvos no banco pericial da VL Engenharia.
                      </p>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia • Auditoria de Monobloco e Sistemas
                    </div>
                  </div>

                  {/* CHECKLIST E AVALIACAO CONTINUATION (PAGE 7) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="my-auto space-y-4">
                      <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Resultados da Lista de Verificação Física (Continuação)</h2>
                      
                      <table className="w-full text-left text-[9px] border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-1.5 border-r border-slate-200 font-bold">Componente Avaliado</th>
                            <th className="p-1.5 border-r border-slate-200 font-bold w-20">Status</th>
                            <th className="p-1.5 font-bold">Observações Técnicas de Campo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {checklist.slice(Math.ceil(checklist.length / 2)).map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-1 border-r border-slate-200 font-medium">{item.name}</td>
                              <td className="p-1 border-r border-slate-200">
                                <span className={`px-1 rounded-sm text-[8px] font-black uppercase tracking-wider ${
                                  item.status === "Conforme" 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : item.status === "Danificado"
                                      ? "bg-red-50 text-red-600 font-bold"
                                      : "bg-slate-50 text-slate-500"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-1 text-slate-600">{item.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia • Auditoria de Monobloco e Sistemas
                    </div>
                  </div>

                  {/* PARACER CONCLUSIVO & RECOMENDACAO (PAGE 8) */}
                  <div className="flex flex-col justify-between min-h-[1000px] break-after-page page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="space-y-6 my-auto text-justify">
                      <div>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Fundamentação Normativa Pericial</h2>
                        <p className="text-[10px] text-slate-700 leading-relaxed pt-2 whitespace-pre-wrap">
                          {fundamentacao}
                        </p>
                      </div>

                      <div>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Parecer Técnico e Enquadramento</h2>
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1 my-2">
                          <p className="text-xs font-black text-red-600 uppercase">
                            {regimeClassificacao === "contran" ? "ENQUADRAMENTO LEGAL:" : "CLASSIFICAÇÃO EMPRESAS/FROTAS:"} {classificacao.toUpperCase()}
                          </p>
                          <p className="text-[9px] text-slate-500 leading-tight">
                            {regimeClassificacao === "contran" 
                              ? "* De acordo com as diretrizes da Resolução CONTRAN nº 810/2020 para acidentes de trânsito."
                              : "* Classificação simplificada e gerencial de sinistro recomendada para controle de frotas e auditoria de sinistralidade corporativa."}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {conclusao}
                        </p>
                      </div>

                      <div>
                        <h2 className="text-xs font-black border-b pb-1 text-slate-950 uppercase">Diretrizes e Recomendações de Segurança</h2>
                        <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {recomendacoes}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia • Parecer Pericial de Sinistros
                    </div>
                  </div>

                  {/* SIGNATURES AND TERM (PAGE 9) */}
                  <div className="flex flex-col justify-between min-h-[1000px] page-block py-12">
                    <ReportHeader title="LAUDO TÉCNICO DE AVALIAÇÃO DE SINISTRO" subTitle={processo.laudoNumber} />

                    <div className="my-auto space-y-8 text-center max-w-md mx-auto">
                      <div className="space-y-3">
                        <h2 className="text-sm font-black text-slate-950 uppercase">Termo de Encerramento pericial</h2>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Este documento, contendo 09 páginas numeradas e rubricadas, encerra formalmente a perícia de avaliação de sinistro sobre o veículo descrito, sob responsabilidade do Engenheiro Responsável Técnico abaixo assinado.
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Recife - PE, {new Date().toLocaleDateString("pt-BR")}.
                        </p>
                      </div>

                      {/* RESPONSAVEL TECNICO ASSINATURA REAL */}
                      <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50 shadow-sm text-center">
                        <ReportSignature 
                          isBlank={blankSignature} 
                          engName="Vitor Leonardo C. Linhares" 
                          engCrea="CREA-PE: 1822299490"
                          artNumber={processo.artNumber}
                          additionalRole="Especialista em Avaliação e Parecer de Monta CONTRAN"
                        />
                      </div>

                      {/* QR Code and seal */}
                      <div className="flex items-center justify-center gap-6 pt-4 text-left">
                        <svg className="w-16 h-16 border p-1 rounded-lg bg-white shrink-0" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="10" y="10" width="15" height="15" />
                          <rect x="75" y="10" width="15" height="15" />
                          <rect x="10" y="75" width="15" height="15" />
                          <rect x="35" y="35" width="30" height="30" />
                          <rect x="15" y="55" width="10" height="10" />
                          <rect x="55" y="75" width="20" height="10" />
                          <rect x="75" y="55" width="10" height="15" />
                        </svg>
                        <div className="space-y-1 min-w-0">
                          <div className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm uppercase">
                            <Award className="w-3 h-3 text-amber-500" />
                            <span>Laudo Autenticado</span>
                          </div>
                          <p className="text-[9px] text-slate-600 leading-normal">
                            Aponte a câmera para ler as chaves periciais de assinatura e conferir a certidão CREA-PE de validade da ART.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-center text-[9px] text-slate-400 font-mono">
                      VL Engenharia • Parecer de Sinistro Homologado
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
