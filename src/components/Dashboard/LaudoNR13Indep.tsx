import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import { 
  Shield, 
  FileText, 
  Wand2, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  FileDown, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Sparkles,
  Info,
  X,
  Upload,
  Maximize2,
  Minimize2,
  Copy,
  ChevronDown,
  Hammer,
  ArrowLeft,
  Calculator
} from "lucide-react";
import LaudoPricingTab from "./LaudoPricingTab";

interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  answer: "SIM" | "NÃO" | "N/A";
  note: string;
  image?: string;
}

export default function LaudoNR13Indep({ onBack, initialPrefilled = false, clients }: { onBack?: () => void, initialPrefilled?: boolean, clients?: ClientData[] }) {
  const [activeTab, setActiveTab] = useState<"params" | "checklist" | "photos" | "pricing" | "preview">(initialPrefilled ? "preview" : "params");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // --- FORM STATES (with high-quality engineering defaults) ---
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LNR13-2026-089",
    equipmentType: "vaso", // vaso, caldeira, tubulacao, tanque
    equipmentName: "Vaso de Pressão Acumulador de Ar Comprimido",
    brand: "Schulz S.A.",
    model: "CSV-20 / 250L",
    serialNumber: "SZ-9844421-B",
    year: "2021",
    tag: "VP-COMP-04",
    category: "V", // I, II, III, IV, V
    fluidClass: "Classe D (Ar Comprimido / Gases não inflamáveis)", // Classe A, B, C, D
    volume: "250 Litros (0,25 m³)",
    pmta: "12,0 kgf/cm² (1.17 MPa)",
    pth: "18,0 kgf/cm² (1.76 MPa)",
    prontuario: "Inexistente", // Disponível, Inexistente, Reconstituído
    livroRegistro: "Inexistente", // Disponível, Inexistente, Reconstituído
    placaIdentificacao: "Conforme", // Conforme, Não Conforme, Inexistente
    visualExterno: "Aprovado", // Aprovado, Reprovado, Não Executado
    visualInterno: "Não Executado", // Aprovado, Reprovado, Não Executado
    espessuraUltrassom: "Aprovado", // Aprovado, Reprovado, Não Executado
    calibracaoValvula: "Reprovado", // Aprovado, Reprovado, Não Executado
    calibracaoManometro: "Reprovado", // Aprovado, Reprovado, Não Executado
    testeEstanqueidade: "Não Executado", // Aprovado, Reprovado, Não Executado
    espessuraMinima: "6.20",
    espessuraNominal: "6.35",
    clientName: "Panificadora e Confeitaria Estrela do Recife Ltda",
    cnpj: "08.452.921/0001-90",
    address: "Av. Conselheiro Aguiar, 4210 - Boa Viagem, Recife - PE",
    inspectionCity: "Recife",
    inspectionDate: new Date().toISOString().split("T")[0],
    notes: "Vaso de pressão acoplado a compressor rotativo de parafusos em sala de máquinas de panificação. PSV descalibrada e com lacre violado. Prontuário técnico não localizado físico na planta.",
    normasAdicionais: "ASME Seção VIII Divisão 1, API 510, ABNT NBR 15417"
  });

  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    if (initialPrefilled) {
      setCoverPhoto("https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop");
      setUploadedImages([
        {
          name: "acumulador_ar_campo.jpg",
          data: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
          description: "Vista lateral do Vaso de Pressão Acumulador de Ar Schulz 250L acoplado em compressor rotativo."
        },
        {
          name: "valvula_seguranca_psv.jpg",
          data: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
          description: "Válvula de segurança (PSV) com mola helicoidal instalada na parte superior com lacre violado."
        }
      ]);
    }
  }, [initialPrefilled]);

  // --- CHECKLIST STATE (10 standard NR-13 items) ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "nr13_1_identificacao", category: "1. IDENTIFICAÇÃO E DOCUMENTAÇÃO", text: "Placa de identificação fixada, legível e com dados obrigatórios (PMTA, PTH, Categoria, Volume)", answer: "SIM", note: "Placa original metálica legível fixada no corpo cilíndrico." },
    { id: "nr13_2_prontuario", category: "1. IDENTIFICAÇÃO E DOCUMENTAÇÃO", text: "Prontuário técnico do fabricante em português e livro de registro de segurança disponíveis e atualizados", answer: "NÃO", note: "Prontuário e livro preto de registro ausentes na sala de utilidades." },
    { id: "nr13_3_psv_calibrada", category: "2. DISPOSITIVOS DE SEGURANÇA E CONTROLE", text: "Válvula de segurança (PSV) instalada, calibrada dentro do prazo legal e com lacre físico íntegro", answer: "NÃO", note: "Válvula de segurança com lacre de chumbo rompido e sem certificado de calibração vigente." },
    { id: "nr13_4_manometro", category: "2. DISPOSITIVOS DE SEGURANÇA E CONTROLE", text: "Manômetro com indicação legível, calibrado e com marcação de pressão máxima de trabalho", answer: "NÃO", note: "Manômetro operacional, porém sem certificado de aferição dentro da validade anual." },
    { id: "nr13_5_drenos_purgadores", category: "3. INTEGRIDADE FÍSICA E ACESSÓRIOS", text: "Drenos, purgadores, visores de nível e demais acessórios de controle em perfeito funcionamento", answer: "SIM", note: "Dreno inferior de expurgo manual operacional e livre de entupimentos." },
    { id: "nr13_6_estrutura_suportes", category: "3. INTEGRIDADE FÍSICA E ACESSÓRIOS", text: "Estrutura metálica de suporte e tubulações interligadas livres de oxidação severa, vazamentos ou deformações", answer: "SIM", note: "Bases de concreto e coxins de borracha antivibração em bom estado." },
    { id: "nr13_7_exame_visual", category: "4. ENSAIOS E INTEGRIDADES", text: "Exame visual externo e interno (se aplicável) livre de trincas, pites, corrosão acentuada ou amassamentos", answer: "SIM", note: "Exame externo aprovado. Exame interno impraticável devido à ausência de bocal de visita acessível (vaso pequeno)." },
    { id: "nr13_8_ultrassom_espessura", category: "4. ENSAIOS E INTEGRIDADES", text: "Medição de espessura por ultrassom realizada e em conformidade com a espessura mínima de projeto", answer: "SIM", note: "Medição de US realizada em tampos e costado. Média encontrada de 6.20mm (Mínima de projeto calculada de 4.85mm)." },
    { id: "nr13_9_instalacao_sala", category: "5. SEGURANÇA OPERACIONAL E AMBIENTE", text: "Local de instalação atende os requisitos de ventilação, acessos, saídas de emergência e sinalização", answer: "SIM", note: "Instalado em área coberta, ventilada e com placa de advertência de alta pressão." },
    { id: "nr13_10_operador_habilitado", category: "5. SEGURANÇA OPERACIONAL E AMBIENTE", text: "Operador devidamente capacitado e habilitado sob as regras da NR-13 (com treinamento teórico e prático)", answer: "SIM", note: "Operador possui certificado de curso de NR-13 arquivado no departamento de RH." }
  ]);

  // --- DYNAMIC RESULTS POPULATED BY IA OR MANUAL ---
  const [naoConformidades, setNaoConformidades] = useState([
    { id: "NC-01", descricao: "Inexistência de Prontuário Técnico original do fabricante do equipamento.", criticidade: "ALTA", risco: "Ausência de parâmetros de projeto para recálculos de PMTA e integridade mecânica", norma: "NR-13 item 13.5.1.6" },
    { id: "NC-02", descricao: "Válvula de segurança (PSV) com lacre rompido e prazo de calibração técnica vencido.", criticidade: "CRÍTICA", risco: "Risco catastrófico de explosão do vaso por falha no alívio de sobrepressão", norma: "NR-13 item 13.5.1.3" },
    { id: "NC-03", descricao: "Manômetro sem certificado de calibração vigente ou aferição periódica.", criticidade: "MÉDIA", risco: "Leitura imprecisa da pressão interna do sistema pelo operador", norma: "NR-13 item 13.5.1.3" }
  ]);

  const [planoAcao, setPlanoAcao] = useState([
    { id: "AP-01", problema: "Ausência do Prontuário Técnico original", norma: "NR-13 item 13.5.1.6", recomendacao: "Proceder à reconstituição do prontuário técnico por meio de profissional habilitado (PH) com emissão de memória de cálculo estrutural baseada em ASME.", prioridade: "CURTO PRAZO", responsavel: "VL Engenharia", prazo: "15 dias" },
    { id: "AP-02", problema: "PSV sem calibração e lacre roto", norma: "NR-13 item 13.5.1.3", recomendacao: "Retirar a válvula de segurança para recalibração em bancada homologada, com instalação de novo lacre e emissão de respectivo certificado.", prioridade: "IMEDIATO", responsavel: "Equipe de Manutenção / Oficina Calibração", prazo: "3 dias" },
    { id: "AP-03", problema: "Manômetro descalibrado", norma: "NR-13 item 13.5.1.3", recomendacao: "Substituir o manômetro atual por um novo aferido de fábrica ou recalibrar o instrumento existente com padrão rastreável.", prioridade: "MÉDIO PRAZO", responsavel: "Setor de Instrumentação", prazo: "7 dias" }
  ]);

  const [especificasNr13, setEspecificasNr13] = useState({
    calculoPv: 12.5, // P(kPa) x V(m3)
    categoriaVerificada: "Vaso de Pressão Categoria V",
    periodicidadeExternaAnos: 5,
    periodicidadeInternaAnos: 10,
    parecerEspessura: "A menor espessura de parede encontrada (6,20 mm) é superior à espessura mínima admissível calculada para PMTA de 10 kgf/cm² (4,85 mm), garantindo vida útil estrutural segura estimulada em mais de 10 anos sob condições de corrosão atuais."
  });

  const [conclusaoStatus, setConclusaoStatus] = useState("CONFORME COM RESTRIÇÕES");
  const [conclusaoParecer, setConclusaoParecer] = useState("O equipamento encontra-se em estado CONFORME COM RESTRIÇÕES perante os requisitos de integridade física da NR-13. A integridade de espessuras de parede medida por ultrassom está perfeitamente conforme. No entanto, o equipamento está reprovado nos itens de calibração de PSV e existência de prontuário do fabricante. A sua operação poderá prosseguir de forma provisória mediante a execução imediata das ações críticas do Plano de Ação, principalmente a calibração da PSV em até 3 dias.");

  const [secoesLaudo, setSecoesLaudo] = useState({
    secao_1: `Este Laudo Técnico de Inspeção de Integridade Física e Segurança tem como escopo principal atestar a conformidade técnica do Vaso de Pressão "Vaso de Pressão Acumulador de Ar Comprimido" em estrita observância à Norma Regulamentadora Nº 13 (NR-13) do Ministério do Trabalho e Emprego, visando garantir a segurança operacional e a integridade estrutural contra riscos decorrentes de sobrepressão ou falhas de juntas metalúrgicas.`,
    secao_2: `Empresa Contratante: Panificadora e Confeitaria Estrela do Recife Ltda (CNPJ: 08.452.921/0001-90, Endereço: Av. Conselheiro Aguiar, 4210 - Boa Viagem, Recife - PE). Unidade operacional contendo instalações de utilidades industriais sujeitas a vaso sob pressão constante ou ciclo térmico variável.`,
    secao_3: `Órgão de Inspeção: VL Engenharia. Profissional Habilitado (PH): Engenheiro Mecânico Vitor Leonardo, inscrito sob o registro CREA-PE 1822299490, atuando como consultor de engenharia mecânica diagnóstica, integridade e teste de equipamentos de pressão, caldeiras e rede de distribuição de vapor/ar comprimido. Tel: (81) 98444-2592, E-mail: vitorleonardocl@gmail.com.`,
    secao_5: `Metodologias e ensaios técnicos realizados nesta auditoria in loco:
1. Exame visual externo detalhado de todas as superfícies metálicas e juntas de solda de fechamento.
2. Exame visual interno (se acessível) buscando pites, deposições, incrustações ou desgaste corrosivo.
3. Medição de espessura de parede por Ultrassom (US) em pontos críticos do corpo e tampos.
4. Verificação funcional e rastreabilidade da calibração da Válvula de Segurança (PSV) e do Manômetro.`,
    secao_6: `As principais referências técnicas que norteiam as avaliações estruturais e diretrizes legais contidas neste laudo pericial são:
- NR-13 (Vasos de Pressão, Caldeiras, Tubulações e Tanques Metálicos de Armazenamento).
- ASME Seção VIII Divisão 1 (Regras para Construção de Vasos de Pressão).
- API 510 (Código de Inspeção de Vasos de Pressão: Manutenção, Inspeção, Classificação e Alteração).
- ABNT NBR 15417 (Vasos de Pressão — Inspeção de Segurança em Serviço).`,
    secao_7: `Para avaliação de integridade física e estimativa de vida residual do vaso, correlacionou-se a taxa de perda de espessura de parede histórica com a espessura mínima admissível calculada por fórmulas ASME. Adotou-se o monitoramento de segurança dos dispositivos de alívio e controle para mitigar riscos catastróficos no ambiente industrial.`
  });

  // --- DYNAMIC PARAMETERS HANDLERS ---
  const handleParamChange = (key: string, value: string) => {
    setLaudoParams(prev => ({ ...prev, [key]: value }));
  };

  const handleChecklistChange = (id: string, key: "answer" | "note", value: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleChecklistImageChange = (id: string, base64: string | undefined) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, image: base64 } : item))
    );
  };

  // --- DYNAMIC LIST EDITORS ---
  const handleAddNC = () => {
    const nextId = `NC-${String(naoConformidades.length + 1).padStart(2, "0")}`;
    setNaoConformidades(prev => [
      ...prev,
      { id: nextId, descricao: "", criticidade: "ALTA", risco: "", norma: "NR-13" }
    ]);
  };

  const handleRemoveNC = (id: string) => {
    setNaoConformidades(prev => prev.filter(nc => nc.id !== id));
  };

  const handleNCFieldChange = (id: string, field: string, value: string) => {
    setNaoConformidades(prev =>
      prev.map(nc => (nc.id === id ? { ...nc, [field]: value } : nc))
    );
  };

  const handleAddAP = () => {
    const nextId = `AP-${String(planoAcao.length + 1).padStart(2, "0")}`;
    setPlanoAcao(prev => [
      ...prev,
      { id: nextId, problema: "", norma: "NR-13", recomendacao: "", prioridade: "CURTO PRAZO", responsavel: "VL Engenharia", prazo: "30 dias" }
    ]);
  };

  const handleRemoveAP = (id: string) => {
    setPlanoAcao(prev => prev.filter(ap => ap.id !== id));
  };

  const handleAPFieldChange = (id: string, field: string, value: string) => {
    setPlanoAcao(prev =>
      prev.map(ap => (ap.id === id ? { ...ap, [field]: value } : ap))
    );
  };

  // --- IMAGE UPLOADS ---
  const handleCoverPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [
            ...prev,
            { name: file.name, data: reader.result as string, description: "Aspecto físico do vaso / tubulação de pressão" }
          ]);
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGalleryDescChange = (index: number, desc: string) => {
    setUploadedImages(prev =>
      prev.map((img, i) => (i === index ? { ...img, description: desc } : img))
    );
  };

  // --- CALL BACKEND GEMINI INSPECTION API ---
  const handleGenerateWithAI = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Pack the payload including up to 3 gallery images for multimodal inspection
      const payloadImages = uploadedImages.slice(0, 3).map(img => ({
        data: img.data,
        mimeType: img.data.substring(img.data.indexOf(":") + 1, img.data.indexOf(";"))
      }));

      const res = await fetch("/api/gemini/nr13-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...laudoParams,
          images: payloadImages
        })
      });

      if (!res.ok) {
        let errText = "";
        try {
          const errObj = await res.json();
          errText = errObj.error || errObj.message || "Erro desconhecido";
        } catch (_) {
          errText = await res.text();
        }
        throw new Error(`Servidor respondeu com erro: ${errText}`);
      }

      const data = await res.json();

      if (data.numero) {
        handleParamChange("laudoNumber", data.numero);
      }

      if (data.checklist) {
        setChecklist(prev =>
          prev.map(item => {
            const aiItem = data.checklist[item.id];
            if (aiItem) {
              return {
                ...item,
                answer: aiItem.resposta || item.answer,
                note: aiItem.nota || item.note
              };
            }
            return item;
          })
        );
      }

      if (data.nao_conformidades) {
        setNaoConformidades(data.nao_conformidades);
      }

      if (data.plano_acao) {
        setPlanoAcao(data.plano_acao);
      }

      if (data.especificas_nr13) {
        setEspecificasNr13({
          calculoPv: data.especificas_nr13.calculoPv || especificasNr13.calculoPv,
          categoriaVerificada: data.especificas_nr13.categoriaVerificada || especificasNr13.categoriaVerificada,
          periodicidadeExternaAnos: data.especificas_nr13.periodicidadeExternaAnos || especificasNr13.periodicidadeExternaAnos,
          periodicidadeInternaAnos: data.especificas_nr13.periodicidadeInternaAnos || especificasNr13.periodicidadeInternaAnos,
          parecerEspessura: data.especificas_nr13.parecerEspessura || especificasNr13.parecerEspessura
        });
      }

      if (data.conclusao) {
        setConclusaoStatus(data.conclusao.status || conclusaoStatus);
        setConclusaoParecer(data.conclusao.parecer || conclusaoParecer);
      }

      if (data.secoes) {
        setSecoesLaudo(prev => ({
          ...prev,
          secao_1: data.secoes.secao_1 || prev.secao_1,
          secao_2: data.secoes.secao_2 || prev.secao_2,
          secao_3: data.secoes.secao_3 || prev.secao_3,
          secao_5: data.secoes.secao_5 || prev.secao_5,
          secao_6: data.secoes.secao_6 || prev.secao_6,
          secao_7: data.secoes.secao_7 || prev.secao_7
        }));
      }

      setSuccessMsg("Laudo pericial NR-13 recalculado com sucesso pela inteligência artificial VL INSPECT AI!");
      setActiveTab("preview");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao gerar laudo com IA.");
    } finally {
      setLoading(false);
    }
  };

  // --- EXPORT TRIGGERS ---
  const triggerPdfDownload = async () => {
    if (!printAreaRef.current) return;
    setLoading(true);

    const element = printAreaRef.current;
    
    try {
      document.body.classList.add("generating-pdf");
      await preprocessStylesheets(element);

      const opt = {
        margin: 5,
        filename: `Laudo_NR13_${laudoParams.tag || "Equipamento"}_${laudoParams.laudoNumber.replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
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
          script.onerror = () => reject(new Error("Não foi possível carregar a biblioteca de geração de PDF."));
          document.body.appendChild(script);
        });
      }

      if (typeof exporter !== "function") {
        throw new Error("A biblioteca html2pdf não pôde ser iniciada.");
      }

      await exporter().set(opt).from(element).save();
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      alert(`Houve um erro ao gerar o PDF: ${err?.message || err}. Por favor, tente novamente.`);
    } finally {
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
      setLoading(false);
    }
  };

  const triggerWordExport = () => {
    const filename = `Laudo_NR13_${laudoParams.laudoNumber.replace(/\//g, "-")}.doc`;
    try {
      exportToWord("nr13-print-area", filename);
      setSuccessMsg("Documento Word exportado com sucesso!");
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao exportar para o Word.");
    }
  };

  const triggerCopyRichText = async () => {
    const success = await copyRichText("nr13-print-area");
    if (success) {
      setSuccessMsg("Laudo copiado em formato Rich Text (com tabelas e cores)! Cole diretamente no Word ou e-mail.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg("Falha ao copiar conteúdo.");
    }
  };

  return (
    <div className={`p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen ${isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : ""}`} id="laudo-nr13-container">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer mr-1"
              id="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shadow-lg">
            <Hammer className="h-6 w-6" id="nr13-icon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-red-500 font-mono uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">VL INSPECT AI</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight" id="nr13-title">
              Integridade Física & Inspeção NR-13
            </h1>
            <p className="text-xs text-slate-400">Vasos de Pressão, Caldeiras, Tubulações e Tanques industriais</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
            id="fullscreen-toggle"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
          </button>

          <button
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            id="ai-generate-button"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 animate-pulse" />
            )}
            Gerar com IA (Gemini)
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {errorMsg && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start gap-2 shadow-inner" id="error-alert">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-start gap-2 shadow-inner" id="success-alert">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("params")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === "params" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="tab-params"
        >
          <FileText className="inline h-4 w-4 mr-1.5" /> Parâmetros Gerais
        </button>
        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === "checklist" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="tab-checklist"
        >
          <Shield className="inline h-4 w-4 mr-1.5" /> Checklist NR-13
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === "photos" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="tab-photos"
        >
          <Upload className="inline h-4 w-4 mr-1.5" /> Anexo Fotográfico
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === "pricing" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="tab-pricing"
        >
          <Calculator className="inline h-4 w-4 mr-1.5 text-emerald-500" /> Precificação
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === "preview" ? "border-red-500 text-red-500" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          id="tab-preview"
        >
          <Printer className="inline h-4 w-4 mr-1.5" /> Visualizar Laudo
        </button>
      </div>

      {/* TAB CONTENT: PARAMETERS */}
      {activeTab === "params" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="params-grid">
          {/* Main Form (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente & Localização */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="h-4 w-4 text-red-500" /> Contratante e Localização da Inspeção
              </h2>

              {/* Client Selection Dropdown */}
              <div className="mb-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                <ClientSelector
                  clients={clients}
                  label="Pesquisar no Cadastro de Clientes"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Razão Social do Cliente</label>
                  <input
                    type="text"
                    value={laudoParams.clientName}
                    onChange={e => handleParamChange("clientName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CNPJ do Cliente</label>
                  <input
                    type="text"
                    value={laudoParams.cnpj}
                    onChange={e => handleParamChange("cnpj", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Endereço da Planta Industrial</label>
                  <input
                    type="text"
                    value={laudoParams.address}
                    onChange={e => handleParamChange("address", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cidade da Inspeção</label>
                  <input
                    type="text"
                    value={laudoParams.inspectionCity}
                    onChange={e => handleParamChange("inspectionCity", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data da Vistoria</label>
                  <input
                    type="date"
                    value={laudoParams.inspectionDate}
                    onChange={e => handleParamChange("inspectionDate", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Identificação do Vaso/Caldeira */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="h-4 w-4 text-red-500" /> Identificação e Dados de Placa do Ativo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Equipamento</label>
                  <select
                    value={laudoParams.equipmentType}
                    onChange={e => handleParamChange("equipmentType", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="vaso">Vaso de Pressão</option>
                    <option value="caldeira">Caldeira</option>
                    <option value="tubulacao">Tubulação</option>
                    <option value="tanque">Tanque Metálico</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Descrição / Nome do Equipamento</label>
                  <input
                    type="text"
                    value={laudoParams.equipmentName}
                    onChange={e => handleParamChange("equipmentName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Número do Laudo</label>
                  <input
                    type="text"
                    value={laudoParams.laudoNumber}
                    onChange={e => handleParamChange("laudoNumber", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={laudoParams.brand}
                    onChange={e => handleParamChange("brand", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={laudoParams.model}
                    onChange={e => handleParamChange("model", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Número de Série</label>
                  <input
                    type="text"
                    value={laudoParams.serialNumber}
                    onChange={e => handleParamChange("serialNumber", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ano de Fabricação</label>
                  <input
                    type="text"
                    value={laudoParams.year}
                    onChange={e => handleParamChange("year", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">TAG / Cód. Interno</label>
                  <input
                    type="text"
                    value={laudoParams.tag}
                    onChange={e => handleParamChange("tag", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Parâmetros Técnicos & Prontuários */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Info className="h-4 w-4 text-red-500" /> Parâmetros de Fluido & Documentação Legal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Volume Interno</label>
                  <input
                    type="text"
                    value={laudoParams.volume}
                    onChange={e => handleParamChange("volume", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Classe de Fluido (NR-13)</label>
                  <select
                    value={laudoParams.fluidClass}
                    onChange={e => handleParamChange("fluidClass", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Classe A (Tóxicos, inflamáveis, combustíveis)">Classe A (Tóxicos, inflamáveis, combustíveis)</option>
                    <option value="Classe B (Gases inflamáveis, tóxicos)">Classe B (Gases inflamáveis, tóxicos)</option>
                    <option value="Classe C (Vapor de água, gases não tóxicos)">Classe C (Vapor de água, gases não tóxicos)</option>
                    <option value="Classe D (Ar Comprimido / Gases não inflamáveis)">Classe D (Ar Comprimido / Gases não inflamáveis)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria NR-13</label>
                  <select
                    value={laudoParams.category}
                    onChange={e => handleParamChange("category", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="I">Categoria I</option>
                    <option value="II">Categoria II</option>
                    <option value="III">Categoria III</option>
                    <option value="IV">Categoria IV</option>
                    <option value="V">Categoria V</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">PMTA (Pressão Máx. Trabalho)</label>
                  <input
                    type="text"
                    value={laudoParams.pmta}
                    onChange={e => handleParamChange("pmta", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">PTH (Pressão Teste Hidrostático)</label>
                  <input
                    type="text"
                    value={laudoParams.pth}
                    onChange={e => handleParamChange("pth", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Placa de Identificação</label>
                  <select
                    value={laudoParams.placaIdentificacao}
                    onChange={e => handleParamChange("placaIdentificacao", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Conforme">Conforme</option>
                    <option value="Não Conforme">Não Conforme</option>
                    <option value="Inexistente">Inexistente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Prontuário Técnico</label>
                  <select
                    value={laudoParams.prontuario}
                    onChange={e => handleParamChange("prontuario", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Inexistente">Inexistente</option>
                    <option value="Reconstituído">Reconstituído</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Livro de Registro de Seg.</label>
                  <select
                    value={laudoParams.livroRegistro}
                    onChange={e => handleParamChange("livroRegistro", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Inexistente">Inexistente</option>
                    <option value="Reconstituído">Reconstituído</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ensaios de Campo */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="h-4 w-4 text-red-500" /> Resultados dos Ensaios de Campo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Exame Visual Externo</label>
                  <select
                    value={laudoParams.visualExterno}
                    onChange={e => handleParamChange("visualExterno", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Exame Visual Interno</label>
                  <select
                    value={laudoParams.visualInterno}
                    onChange={e => handleParamChange("visualInterno", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Medição de Espessura (US)</label>
                  <select
                    value={laudoParams.espessuraUltrassom}
                    onChange={e => handleParamChange("espessuraUltrassom", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Calibração de PSV (Alívio)</label>
                  <select
                    value={laudoParams.calibracaoValvula}
                    onChange={e => handleParamChange("calibracaoValvula", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Aferição de Manômetro</label>
                  <select
                    value={laudoParams.calibracaoManometro}
                    onChange={e => handleParamChange("calibracaoManometro", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Teste de Estanqueidade</label>
                  <select
                    value={laudoParams.testeEstanqueidade}
                    onChange={e => handleParamChange("testeEstanqueidade", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Não Executado">Não Executado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Menor Espessura Encontrada (mm)</label>
                  <input
                    type="text"
                    value={laudoParams.espessuraMinima}
                    onChange={e => handleParamChange("espessuraMinima", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Espessura Nominal de Projeto (mm)</label>
                  <input
                    type="text"
                    value={laudoParams.espessuraNominal}
                    onChange={e => handleParamChange("espessuraNominal", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Notas do Inspetor */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" /> Descrição da Situação Real Observada
              </h2>
              <textarea
                value={laudoParams.notes}
                onChange={e => handleParamChange("notes", e.target.value)}
                rows={4}
                placeholder="Insira notas sobre vazamentos, condições físicas, deformações ou histórico técnico..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Normas Técnicas Adicionais */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" /> Normas de Referência Adicionais / Internacionais
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Insira normas regulamentares, normas internacionais (ASME Seção VIII, API 510, EN, ISO, etc.) ou parâmetros adicionais para guiar a análise com IA.
              </p>
              <textarea
                value={laudoParams.normasAdicionais || ""}
                onChange={e => handleParamChange("normasAdicionais", e.target.value)}
                rows={3}
                placeholder="Ex: ASME Sec VIII Div 1, API 510, ABNT NBR 15417, etc..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Sidebar Info/Calculations (Right column) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5 text-amber-500">
                <Sparkles className="h-4 w-4" /> Inteligência VL INSPECT AI
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Nosso motor generativo cruza os dados do vaso com normas de projeto (ASME, API) e a NR-13 para:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-5 list-disc pl-4">
                <li>Preencher o Checklist NR-13 automaticamente</li>
                <li>Identificar Não Conformidades normativas</li>
                <li>Redigir o plano de ação de integridade mecânica</li>
                <li>Estimar a periodicidade limite das próximas inspeções</li>
              </ul>
              <button
                onClick={handleGenerateWithAI}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-lg transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Processando Auditoria..." : "Auditar Equipamento com IA"}
              </button>
            </div>

            {/* Parâmetros Específicos do Laudo */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Shield className="h-4 w-4 text-red-500" /> Resultados Finais
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status da Conclusão</label>
                <select
                  value={conclusaoStatus}
                  onChange={e => setConclusaoStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="CONFORME">CONFORME</option>
                  <option value="CONFORME COM RESTRIÇÕES">CONFORME COM RESTRIÇÕES</option>
                  <option value="NÃO CONFORME">NÃO CONFORME</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cálculo P x V Adotado</label>
                <input
                  type="number"
                  value={especificasNr13.calculoPv}
                  onChange={e => setEspecificasNr13(prev => ({ ...prev, calculoPv: parseFloat(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Categoria NR-13 Verificada</label>
                <input
                  type="text"
                  value={especificasNr13.categoriaVerificada}
                  onChange={e => setEspecificasNr13(prev => ({ ...prev, categoriaVerificada: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">Per. Ext (Anos)</label>
                  <input
                    type="number"
                    value={especificasNr13.periodicidadeExternaAnos}
                    onChange={e => setEspecificasNr13(prev => ({ ...prev, periodicidadeExternaAnos: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">Per. Int (Anos)</label>
                  <input
                    type="number"
                    value={especificasNr13.periodicidadeInternaAnos}
                    onChange={e => setEspecificasNr13(prev => ({ ...prev, periodicidadeInternaAnos: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CHECKLIST */}
      {activeTab === "checklist" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg" id="checklist-editor">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Checklist de Conformidade Física NR-13</h2>
              <p className="text-xs text-slate-400">Preencha individualmente ou use o botão do Gemini para analisar os dados e preencher automaticamente.</p>
            </div>
            <button
              onClick={handleGenerateWithAI}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Preencher com IA
            </button>
          </div>

          <div className="space-y-4">
            {checklist.map((item, index) => (
              <div key={item.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 md:max-w-[70%]">
                    <span className="text-[10px] font-bold text-red-500 tracking-wider font-mono uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{index + 1}. {item.text}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {["SIM", "NÃO", "N/A"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleChecklistChange(item.id, "answer", opt as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                          item.answer === opt
                            ? opt === "SIM"
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : opt === "NÃO"
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-slate-700 border-slate-600 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="Nota observada (ex.: Equipamento sem vazamento, certificado anexado...)"
                      value={item.note}
                      onChange={(e) => handleChecklistChange(item.id, "note", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {item.image ? (
                      <div className="relative">
                        <img src={item.image} className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                        <button
                          onClick={() => handleChecklistImageChange(item.id, undefined)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-500"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 rounded-lg cursor-pointer transition-all text-[11px] w-full justify-center">
                        <Upload className="h-3 w-3" /> Foto Item
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onloadend = () => {
                                handleChecklistImageChange(item.id, r.result as string);
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PHOTOGRAPHIC RECORD */}
      {activeTab === "photos" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6" id="photos-tab">
          {/* Capa do laudo */}
          <div>
            <h2 className="text-base font-semibold text-white mb-2">Foto Destacada na Capa</h2>
            <p className="text-xs text-slate-400 mb-4">Adicione uma foto panorâmica do vaso ou caldeira para figurar com destaque na primeira página do laudo técnico.</p>
            <div className="flex items-center gap-4">
              {coverPhoto ? (
                <div className="relative w-40 h-28 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <img src={coverPhoto} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverPhoto(null)}
                    className="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-500 p-1 rounded-full text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-28 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 border-dashed rounded-xl cursor-pointer transition-all">
                  <Upload className="h-6 w-6 text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-400">Adicionar Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Galeria de Evidências */}
          <div className="border-t border-slate-800 pt-6">
            <h2 className="text-base font-semibold text-white mb-2">Galeria Geral de Evidências</h2>
            <p className="text-xs text-slate-400 mb-4">Faça o upload de outras fotos de detalhes do vaso (bocal, válvula, manômetro, medição por US) para o Anexo Fotográfico final.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {uploadedImages.map((img, index) => (
                <div key={index} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2 relative">
                  <button
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 p-1 rounded-full text-white z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <img src={img.data} className="w-full h-32 object-cover rounded-lg border border-slate-800" />
                  <input
                    type="text"
                    value={img.description}
                    onChange={(e) => handleGalleryDescChange(index, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Descrição da imagem técnica"
                  />
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 border-dashed rounded-xl h-[216px] cursor-pointer transition-all">
                <Upload className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs text-slate-300 font-medium">Fazer Upload de Fotos</span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG de alta resolução</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRICING TAB */}
      {activeTab === "pricing" && (
        <div className="my-6">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo Técnico e Inspeção de Vaso de Pressão (NR-13)"
            equipmentName={laudoParams.equipmentName}
          />
        </div>
      )}

      {/* TAB CONTENT: PRINT PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6" id="preview-tab">
          {/* Export Controls Header */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <Info className="h-4 w-4 text-amber-500 shrink-0" />
              <span>O laudo final foi consolidado. Revise abaixo as seções de projeto e faça o download.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={triggerCopyRichText}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
                id="copy-rtf-button"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar Formatado
              </button>
              <button
                onClick={triggerWordExport}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
                id="export-word-button"
              >
                <FileDown className="h-3.5 w-3.5" /> Exportar Word
              </button>
              <button
                onClick={triggerPdfDownload}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-all"
                id="export-pdf-button"
              >
                <Printer className="h-3.5 w-3.5" /> Exportar PDF (html2pdf)
              </button>
            </div>
          </div>

          {/* Interactive Non-Conformities & Action Plans Edit Panels on Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Non-Conformities Panel */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Tabela de Não Conformidades (Inspeção Física)
                </h3>
                <button
                  onClick={handleAddNC}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-750"
                >
                  <Plus className="h-3.5 w-3.5" /> NC
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {naoConformidades.map((nc) => (
                  <div key={nc.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg space-y-2 text-xs relative">
                    <button
                      onClick={() => handleRemoveNC(nc.id)}
                      className="absolute top-1 right-1 text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1">
                        <span className="font-mono text-[10px] font-bold text-red-500">{nc.id}</span>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={nc.descricao}
                          onChange={(e) => handleNCFieldChange(nc.id, "descricao", e.target.value)}
                          placeholder="Descrição da irregularidade..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={nc.criticidade}
                          onChange={(e) => handleNCFieldChange(nc.id, "criticidade", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="BAIXA">BAIXA</option>
                          <option value="MÉDIA">MÉDIA</option>
                          <option value="ALTA">ALTA</option>
                          <option value="CRÍTICA">CRÍTICA</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={nc.risco}
                          onChange={(e) => handleNCFieldChange(nc.id, "risco", e.target.value)}
                          placeholder="Risco associado..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={nc.norma}
                          onChange={(e) => handleNCFieldChange(nc.id, "norma", e.target.value)}
                          placeholder="Item Norma..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plans Panel */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Plano de Ação Recomendado (Engenharia)
                </h3>
                <button
                  onClick={handleAddAP}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-750"
                >
                  <Plus className="h-3.5 w-3.5" /> AP
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {planoAcao.map((ap) => (
                  <div key={ap.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg space-y-2 text-xs relative">
                    <button
                      onClick={() => handleRemoveAP(ap.id)}
                      className="absolute top-1 right-1 text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1">
                        <span className="font-mono text-[10px] font-bold text-emerald-500">{ap.id}</span>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={ap.problema}
                          onChange={(e) => handleAPFieldChange(ap.id, "problema", e.target.value)}
                          placeholder="Descreva o problema..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={ap.prioridade}
                          onChange={(e) => handleAPFieldChange(ap.id, "prioridade", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-bold"
                        >
                          <option value="IMEDIATO">IMEDIATO</option>
                          <option value="CURTO PRAZO">CURTO PRAZO</option>
                          <option value="MÉDIO PRAZO">MÉDIO PRAZO</option>
                          <option value="LONGO PRAZO">LONGO PRAZO</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={ap.recomendacao}
                          onChange={(e) => handleAPFieldChange(ap.id, "recomendacao", e.target.value)}
                          placeholder="Ação recomendada..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={ap.prazo}
                          onChange={(e) => handleAPFieldChange(ap.id, "prazo", e.target.value)}
                          placeholder="Prazo limite..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRINTABLE PAGE AREA WITH RIGOROUS VL ENGENHARIA COMPLIANCE */}
          <div className="bg-white text-slate-900 rounded-xl p-4 md:p-10 shadow-2xl overflow-x-auto">
            <div
              ref={printAreaRef}
              id="nr13-print-area"
              className="mx-auto text-slate-900 bg-white"
              style={{
                width: "100%",
                maxWidth: "800px",
                minHeight: "297mm",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.5",
                fontSize: "12px"
              }}
            >
              {/* PAGE 1: COVER PAGE */}
              <div className="flex flex-col justify-between p-10 border border-slate-300 rounded mb-12 bg-white" style={{ height: "270mm" }}>
                {/* Cover Header */}
                <div className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-14" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest">DIAGNÓSTICO & INTEGRIDADE FÍSICA</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">CREA-PE 1822299490</span>
                  </div>
                </div>

                {/* Cover Body */}
                <div className="my-auto space-y-8 text-center">
                  <div className="space-y-2">
                    <span className="text-red-600 text-xs font-bold font-mono tracking-widest uppercase">LAUDO TÉCNICO PERICIAL DE INSPEÇÃO DE SEGURANÇA</span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-tight leading-none" style={{ color: "#1e3a8a" }}>
                      NR-13 — VASOS DE PRESSÃO E INTEGRIDADES
                    </h1>
                    <div className="w-24 h-1 bg-red-600 mx-auto mt-4" />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-lg mx-auto text-left space-y-1.5 text-xs text-slate-700">
                    <div><span className="font-bold text-slate-900">Equipamento:</span> {laudoParams.equipmentName}</div>
                    <div><span className="font-bold text-slate-900">TAG:</span> {laudoParams.tag} | <span className="font-bold text-slate-900 font-mono">Série:</span> {laudoParams.serialNumber}</div>
                    <div><span className="font-bold text-slate-900">Fabricante/Modelo:</span> {laudoParams.brand} / {laudoParams.model}</div>
                    <div><span className="font-bold text-slate-900">Contratante:</span> {laudoParams.clientName}</div>
                    <div><span className="font-bold text-slate-900">Laudo Técnico N°:</span> {laudoParams.laudoNumber}</div>
                  </div>

                  {coverPhoto && (
                    <div className="max-w-md mx-auto h-48 border border-slate-200 rounded-xl overflow-hidden shadow-md">
                      <img src={coverPhoto} alt="Capa" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Cover Footer */}
                <div className="border-t pt-4 text-center text-[10px] text-slate-500 font-mono space-y-1">
                  <div>VL Engenharia — Consultoria Industrial & Perícias Técnicas</div>
                  <div>vitorleonardocl@gmail.com | (81) 98444-2592</div>
                  <div className="text-slate-400">{laudoParams.inspectionCity}, {laudoParams.inspectionDate.split("-").reverse().join("/")}</div>
                </div>
              </div>

              {/* PAGE 2: INTRO & INDEX */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Report Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 2 de 8</div>
                  </div>
                </div>

                {/* Letter of Presentation */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase tracking-tight border-b pb-1" style={{ color: "#1e3a8a" }}>Carta de Apresentação Técnica</h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Prezado cliente, <span className="font-bold">{laudoParams.clientName}</span>,
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Apresentamos o relatório pericial conclusivo de auditoria de integridade física e segurança operacional referente à inspeção in loco executada sob o vaso de pressão identificado sob a <span className="font-bold">TAG: {laudoParams.tag}</span>. As avaliações de engenharia mecânica, ensaios não destrutivos de espessura de costado e verificação de conformidades normativas da <span className="font-bold">NR-13</span> foram coordenadas pelo Engenheiro Mecânico <span className="font-bold">Vitor Leonardo</span>.
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    O escopo deste documento fornece respaldo legal perante os órgãos de fiscalização do trabalho, atestando as condições de integridade residual do vaso, determinando prazos técnicos imperativos de intervenção e prazos de inspeções futuras. Nosso compromisso é mitigar riscos à integridade física de vossos operários e apoiar a máxima integridade produtiva.
                  </p>
                </div>

                {/* Table of Contents */}
                <div className="space-y-3 pt-6">
                  <h2 className="text-sm font-bold text-slate-950 uppercase tracking-tight border-b pb-1" style={{ color: "#1e3a8a" }}>Sumário das Seções Regulamentares</h2>
                  <div className="space-y-2 font-mono text-xs text-slate-700">
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>1. OBJETIVO DO LAUDO (NR-13)</span><span>Pág. 3</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>2. IDENTIFICAÇÃO E DADOS DE PLACA</span><span>Pág. 3</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>3. DADOS DE PROJETO E CÁLCULO P X V</span><span>Pág. 4</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>4. RESULTADO DOS ENSAIOS (METODOLOGIAS)</span><span>Pág. 5</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>5. CHECKLIST DE CONFORMIDADE DA NR-13</span><span>Pág. 6</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>6. QUADRO DE NÃO CONFORMIDADES</span><span>Pág. 7</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>7. PLANO DE AÇÃO E CRONOGRAMAS</span><span>Pág. 7</span></div>
                    <div className="flex justify-between border-b border-dashed border-slate-200"><span>8. PARECER, CONCLUSÃO E TERMO ENCERRAMENTO</span><span>Pág. 8</span></div>
                  </div>
                </div>
              </div>

              {/* PAGE 3: SECTIONS 1, 2, 3 */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 3 de 8</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    1. Objetivo do Laudo Técnico
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {secoesLaudo.secao_1}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    2. Identificação da Empresa Contratante
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {secoesLaudo.secao_2}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    3. Órgão Responsável de Inspeção e Engenheiro de Segurança
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {secoesLaudo.secao_3}
                  </p>
                </div>
              </div>

              {/* PAGE 4: TECHNICAL DATA SHEET */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 4 de 8</div>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                  4. Características Técnicas & Dimensionamento NR-13
                </h2>

                <table className="w-full text-xs text-slate-800 border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 font-bold text-left" colSpan={4}>Ficha de Identificação e Dados Técnicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Equipamento:</td>
                      <td className="border border-slate-300 p-2" colSpan={3}>{laudoParams.equipmentName}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">TAG:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.tag}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Série N°:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.serialNumber}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Fabricante:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.brand}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Ano Fabr.:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.year}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Volume Interno:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.volume}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Classe Fluido:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.fluidClass}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">PMTA Adotado:</td>
                      <td className="border border-slate-300 p-2 font-mono">{laudoParams.pmta}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">PTH Teste:</td>
                      <td className="border border-slate-300 p-2 font-mono">{laudoParams.pth}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Placa Identificação:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.placaIdentificacao}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">Prontuário Técnico:</td>
                      <td className="border border-slate-300 p-2">{laudoParams.prontuario}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Calculations info */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Info className="h-4 w-4 text-red-600" /> Memória de Dimensionamento e Enquadramento NR-13
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    De acordo com o item 13.5 do anexo legal, o enquadramento de Vasos de Pressão depende diretamente da classe de fluido e do produto de seu volume interno (<span className="font-bold">V</span> em m³) pela pressão máxima de trabalho (<span className="font-bold">P</span> em kPa).
                  </p>
                  <div className="font-mono text-xs bg-slate-950 text-emerald-400 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div>P (Pressão PMTA) = {laudoParams.pmta}</div>
                    <div>V (Volume) = {laudoParams.volume}</div>
                    <div>Cálculo P x V Adotado = <span className="font-bold text-white">{especificasNr13.calculoPv.toFixed(2)}</span></div>
                    <div>Categoria de Inspeção Verificada = <span className="font-bold text-white">{especificasNr13.categoriaVerificada}</span></div>
                    <div>Periodicidade de Inspeção: Externa = <span className="font-bold text-white">{especificasNr13.periodicidadeExternaAnos} Anos</span> | Interna = <span className="font-bold text-white">{especificasNr13.periodicidadeInternaAnos} Anos</span></div>
                  </div>
                </div>
              </div>

              {/* PAGE 5: SECTIONS 5, 6 */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 5 de 8</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    5. Ensaios de Campo & Análises Físicas Realizadas
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                    {secoesLaudo.secao_5}
                  </p>

                  <table className="w-full text-xs text-slate-800 border border-slate-300 border-collapse mt-3">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-300 p-2">Metodologia Ensaiada</td>
                        <td className="border border-slate-300 p-2 text-center">Status / Resultado</td>
                        <td className="border border-slate-300 p-2 text-left">Parecer Técnico / Notas</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Exame Visual Externo</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-emerald-600">{laudoParams.visualExterno}</td>
                        <td className="border border-slate-300 p-2">Superfícies pintadas íntegras, sem amassamentos severos.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Exame Visual Interno</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-amber-600">{laudoParams.visualInterno}</td>
                        <td className="border border-slate-300 p-2">Vaso de pequeno diâmetro sem bocal de visita acessível.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Medição Espessura Ultrassom</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-emerald-600">{laudoParams.espessuraUltrassom}</td>
                        <td className="border border-slate-300 p-2">Medição por US indica espessura média de COSTADO = {laudoParams.espessuraMinima} mm.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Calibração da Válvula (PSV)</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-red-600">{laudoParams.calibracaoValvula}</td>
                        <td className="border border-slate-300 p-2 text-red-600">Lacre físico de calibração roto/rompido. Vencido!</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold">Calibração de Manômetro</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-red-600">{laudoParams.calibracaoManometro}</td>
                        <td className="border border-slate-300 p-2 text-red-600">Manômetro indicador sem selo/etiqueta de aferição.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    6. Normas Regulamentadoras & Legislações de Amparo
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                    {secoesLaudo.secao_6}
                  </p>
                </div>
              </div>

              {/* PAGE 6: CHECKLIST RESULTS */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 6 de 8</div>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                  7. Auditoria do Checklist Completo NR-13
                </h2>

                <table className="w-full text-[10px] text-slate-800 border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-300 p-2 w-[40px] text-center">Item</td>
                      <td className="border border-slate-300 p-2 w-[110px]">Categoria</td>
                      <td className="border border-slate-300 p-2">Item Requisitado (NR-13)</td>
                      <td className="border border-slate-300 p-2 w-[45px] text-center">Atingido</td>
                      <td className="border border-slate-300 p-2 w-[220px]">Observações / Parecer do Perito</td>
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 text-[9px] font-bold text-slate-500">{item.category}</td>
                        <td className="border border-slate-300 p-1.5 font-medium">{item.text}</td>
                        <td className={`border border-slate-300 p-1.5 text-center font-bold ${
                          item.answer === "SIM" ? "text-emerald-600" : item.answer === "NÃO" ? "text-red-600" : "text-slate-500"
                        }`}>{item.answer}</td>
                        <td className="border border-slate-300 p-1.5 text-[9px] italic text-slate-600">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGE 7: NON-CONFORMITIES & ACTION PLAN */}
              <div className="p-10 border border-slate-200 rounded mb-12 bg-white space-y-6" style={{ minHeight: "270mm" }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Logo variant="print" className="h-10" />
                    <div className="border-l border-slate-300 pl-3">
                      <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                      <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-400">
                    <div>Ref: {laudoParams.laudoNumber}</div>
                    <div>Página 7 de 8</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    8. Quadro de Não Conformidades Identificadas
                  </h2>
                  <table className="w-full text-xs text-slate-800 border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-300 p-2 w-[40px] text-center">Cód</td>
                        <td className="border border-slate-300 p-2">Desvio / Irregularidade Técnica</td>
                        <td className="border border-slate-300 p-2 w-[70px] text-center">Criticidade</td>
                        <td className="border border-slate-300 p-2">Risco Mecânico Associado</td>
                        <td className="border border-slate-300 p-2 w-[100px]">Item Norma</td>
                      </tr>
                    </thead>
                    <tbody>
                      {naoConformidades.map((nc) => (
                        <tr key={nc.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-bold text-red-600 font-mono">{nc.id}</td>
                          <td className="border border-slate-300 p-2 font-medium">{nc.descricao}</td>
                          <td className={`border border-slate-300 p-2 text-center font-bold ${
                            nc.criticidade === "CRÍTICA" ? "bg-red-100 text-red-700" : nc.criticidade === "ALTA" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-700"
                          }`}>{nc.criticidade}</td>
                          <td className="border border-slate-300 p-2 text-[10px] text-slate-600">{nc.risco}</td>
                          <td className="border border-slate-300 p-2 text-[10px] font-mono text-slate-500">{nc.norma}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                    9. Plano de Ação & Cronograma de Integridade de Engenharia
                  </h2>
                  <table className="w-full text-[10px] text-slate-800 border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-300 p-2 w-[35px] text-center">AP</td>
                        <td className="border border-slate-300 p-2">Problema Corrigido</td>
                        <td className="border border-slate-300 p-2">Ação Técnica Recomendada (Hierarquia de Segurança)</td>
                        <td className="border border-slate-300 p-2 w-[70px] text-center">Prioridade</td>
                        <td className="border border-slate-300 p-2 w-[80px]">Responsável</td>
                        <td className="border border-slate-300 p-2 w-[55px] text-center">Prazo</td>
                      </tr>
                    </thead>
                    <tbody>
                      {planoAcao.map((ap) => (
                        <tr key={ap.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-600 font-mono">{ap.id}</td>
                          <td className="border border-slate-300 p-1.5 font-medium">{ap.problema}</td>
                          <td className="border border-slate-300 p-1.5 text-slate-700">{ap.recomendacao}</td>
                          <td className={`border border-slate-300 p-1.5 text-center font-bold text-[9px] ${
                            ap.prioridade === "IMEDIATO" ? "text-red-600" : ap.prioridade === "CURTO PRAZO" ? "text-orange-600" : "text-slate-600"
                          }`}>{ap.prioridade}</td>
                          <td className="border border-slate-300 p-1.5 text-[9px] text-slate-500">{ap.responsavel}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-bold text-[9px] font-mono text-slate-600">{ap.prazo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAGE 8: CONCLUSION & ART SIGN-OFF */}
              <div className="p-10 border border-slate-200 rounded bg-white space-y-6 flex flex-col justify-between" style={{ height: "270mm" }}>
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start border-b pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Logo variant="print" className="h-10" />
                      <div className="border-l border-slate-300 pl-3">
                        <h2 className="text-xs font-bold text-slate-900 leading-tight">VL ENGENHARIA</h2>
                        <p className="text-[8px] text-slate-500 font-mono">ENGENHARIA DIAGNÓSTICA</p>
                      </div>
                    </div>
                    <div className="text-right text-[9px] font-mono text-slate-400">
                      <div>Ref: {laudoParams.laudoNumber}</div>
                      <div>Página 8 de 8</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                      10. Parecer de Integridade de Espessura (US) & Recomendações
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {especificasNr13.parecerEspessura}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {secoesLaudo.secao_7}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h2 className="text-sm font-bold text-slate-950 uppercase border-b pb-1" style={{ color: "#1e3a8a" }}>
                      11. Conclusão Pericial Técnica Final
                    </h2>
                    <div className={`p-4 rounded-xl border mb-3 flex items-start gap-3 text-xs leading-relaxed ${
                      conclusaoStatus === "CONFORME"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : conclusaoStatus === "NÃO CONFORME"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold uppercase tracking-wide text-xs mb-1">Parecer: {conclusaoStatus}</div>
                        <p className="text-justify">{conclusaoParecer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CREA PE SIGNATURE BLOCK */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono text-slate-400">ASSINADO DIGITALMENTE POR RESPONSÁVEL TÉCNICO (PH):</p>
                      <h4 className="text-sm font-bold text-slate-950">Vitor Leonardo Cordeiro Linhares</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Engenheiro Mecânico | CREA-PE 1822299490</p>
                      <p className="text-[9px] text-slate-400">VL Engenharia Diagnóstica S/S Ltda.</p>
                    </div>

                    <div className="flex justify-end">
                      <div className="border-2 border-slate-900 rounded p-2 flex items-center gap-2 max-w-[210px] bg-slate-50">
                        <div className="border-r border-slate-300 pr-2">
                          <Logo variant="print" className="h-8" />
                        </div>
                        <div className="text-[8px] font-mono leading-tight text-slate-600">
                          <div className="font-bold text-slate-900">CREA-PE CERTIFICADO</div>
                          <div>Reg. 1822299490</div>
                          <div className="text-[7px] text-emerald-600 font-bold">● ASSINATURA ELETRÔNICA</div>
                        </div>
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
