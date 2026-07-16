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
  Layers as LayersIcon
} from "lucide-react";
import {
  UploadedImage,
  ChecklistItem,
  HrnValue,
  NaoConformidade,
  PlanoAcao,
  LO_OPTIONS,
  FE_OPTIONS,
  DPH_OPTIONS,
  NP_OPTIONS,
  getHRNClassification,
  DEFAULT_CHECKLIST,
  PREFILLED_PARAMS,
  PREFILLED_CHECKLIST,
  PREFILLED_NAO_CONFORMIDADES,
  PREFILLED_PLANO_ACAO,
  PREFILLED_SISTEMAS,
  PREFILLED_CONCLUSÃO,
  DEFAULT_SECOES
} from "./montacargasData";

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoMontacargasIndep({ onBack, initialPrefilled = false, clients }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "pricing" | "preview">("form");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // Core Parameters state
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LRM-001/2026 Rev. 00",
    clientName: "Empresa Contratante S/A",
    cnpj: "00.000.000/0001-00",
    address: "Endereço Operacional Completo",
    equipmentType: "Monta-Cargas",
    manufacturer: "Não especificado",
    model: "Não especificado",
    fabYear: "2020",
    serialNumber: "A confirmar",
    capacityCurrent: "150 kg",
    speedNominal: "0,2 m/s",
    numParadas: "2",
    heightPercurso: "6,0 m",
    dimensionsCabine: "0,8 x 0,8 x 1,1 metros",
    driveSystem: "Elétrico com Tração",
    suspensionType: "Cabo de aço",
    installationLocation: "Linha de Produção Industrial",
    lastMaintenance: "Não especificado",
    lastInspection: "Não especificado",
    proposedCategory: "Uso por pessoas acompanhando a carga",
    inspectionCity: "Recife",
    inspectionDate: "15/05/2026",
    notes: "",
    normasAdicionais: "ABNT NBR 14712, ABNT NBR NM 267"
  });

  // Structural checklists, hazards, control matrices
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([]);
  const [planoAcao, setPlanoAcao] = useState<PlanoAcao[]>([]);
  const [sistemasInspecao, setSistemasInspecao] = useState({
    cabine: "Pendente de vistoria e avaliação estrutural...",
    poco_casa_maquinas: "Pendente de vistoria física no poço...",
    sistema_tracao: "Pendente de inspeção de tração...",
    guias_estrutura: "Pendente de alinhamento e ancoragem...",
    dispositivos_seguranca: "Pendente de ensaios em limitador e freio...",
    portas_patamar: "Pendente de teste de intertravamento e fechamento...",
    sistema_eletrico: "Pendente de medições elétricas e lógica de relés..."
  });

  const [hrnBefore, setHrnBefore] = useState<HrnValue>({
    lo: 10.0,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 375.0,
    classification: "Risco Muito Alto",
    explicacao: "Ausência de freio de segurança mecânico (para-quedas) e limitador de velocidade em cabine utilizada para transporte com pessoas."
  });

  const [hrnAfter, setHrnAfter] = useState<HrnValue>({
    lo: 0.033,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 1.23,
    classification: "Risco Muito Baixo",
    explicacao: "Risco reduzido através de proteções mecânicas, freios progressivos automáticos e chaves com monitoramento eletrônico."
  });

  const [conclusao, setConclusao] = useState({
    status: "VIÁVEL MEDIANTE ADAPTAÇÕES" as "VIÁVEL MEDIANTE ADAPTAÇÕES" | "VIÁVEL SEM ADAPTAÇÕES" | "NÃO VIÁVEL",
    parecer: "Preencha a vistoria técnica e clique em simular ou gerar com IA para gerar o parecer conclusivo oficial com o carimbo do CREA."
  });

  const [secoes, setSecoes] = useState<Record<string, string>>(DEFAULT_SECOES);
  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize prefilled if requested
  useEffect(() => {
    if (initialPrefilled) {
      loadSimulatedData();
    }
  }, [initialPrefilled]);

  // Handle live mathematical calculation of HRN Before
  const handleCalcBefore = (key: keyof Omit<HrnValue, "score" | "classification" | "explicacao">, val: number) => {
    setHrnBefore(prev => {
      const updated = { ...prev, [key]: val };
      const score = Number((updated.lo * updated.fe * updated.dph * updated.np).toFixed(2));
      const classification = getHRNClassification(score).label;
      return { ...updated, score, classification };
    });
  };

  // Handle live mathematical calculation of HRN After
  const handleCalcAfter = (key: keyof Omit<HrnValue, "score" | "classification" | "explicacao">, val: number) => {
    setHrnAfter(prev => {
      const updated = { ...prev, [key]: val };
      const score = Number((updated.lo * updated.fe * updated.dph * updated.np).toFixed(2));
      const classification = getHRNClassification(score).label;
      return { ...updated, score, classification };
    });
  };

  // Update dynamic sections locally based on manual parameters when not generated by AI
  useEffect(() => {
    if (!loadingAI && secoes["secao_1"] === "Carregando introdução técnica...") {
      setSecoes({
        "secao_1": `Este Laudo Técnico de Reclassificação e Conformidade Técnica tem por escopo principal avaliar a viabilidade mecânica e estrutural do equipamento tipo "${laudoParams.equipmentType}" para operação em nova categoria regulamentar. O procedimento foi desenvolvido sob conformidade estrita com a NR-12 e as diretrizes das normas ABNT NBR 14712 e NBR 16858.`,
        "secao_2": `O presente documento foi encomendado pela empresa ${laudoParams.clientName}, CNPJ ${laudoParams.cnpj}, estabelecida em: ${laudoParams.address}. A contratante busca a conformidade legal para eliminar riscos civis e criminais de operação.`,
        "secao_3": `Emitido por: VL Engenharia. Perito Responsável: Engenheiro Mecânico Vitor Leonardo (CREA-PE 1822299490), especialista em laudos de elevadores e monta-cargas. Recife-PE. Contato: (81) 98444-2592.`,
        "secao_4": `Vistoria técnica conduzida no ${laudoParams.equipmentType} série ${laudoParams.serialNumber}, modelo ${laudoParams.model}. O equipamento possui capacidade atual de ${laudoParams.capacityCurrent}, velocidade de ${laudoParams.speedNominal}, ${laudoParams.numParadas} paradas, percurso de ${laudoParams.heightPercurso}m, cabine medindo ${laudoParams.dimensionsCabine}, suspensão tipo ${laudoParams.suspensionType} e acionamento ${laudoParams.driveSystem}.`,
        "secao_5": `Finalidade da Alteração Pretendida: Obter enquadramento na categoria de "${laudoParams.proposedCategory}". Tal mudança exige o atendimento de requisitos de segurança física de pessoas, equiparando-se em segurança ativa aos elevadores convencionais.`,
        "secao_6": "Projetos mecânicos e registros de inspeções passadas fornecidos pela gerência técnica local.",
        "secao_7": "NR-12 (Máquinas), ABNT NBR 14712 (Carga e Monta-cargas) e ABNT NBR 16858-1/2 (Elevadores de Passageiros).",
        "secao_8": "A quantificação de perigos foi estimada pela fórmula clássica do Hazard Rating Number (HRN) conforme a ABNT NBR ISO 12100.",
        "secao_9": "Levantamento fotográfico in loco de todos os subsistemas críticos.",
        "secao_10": "A avaliação visual detalhada cobriu a cabine, poço, sistema de tração, guias lineares de corrida e freio para-quedas.",
        "secao_11": `Apresenta-se na tabela comparativa as lacunas técnicas identificadas entre o monta-cargas atual e as regras da NBR 16858-1 para a categoria de "${laudoParams.proposedCategory}".`,
        "secao_12": "Resultado sistemático do checklist regulamentar composto de 18 requisitos mandatórios.",
        "secao_13": "Os perigos críticos identificados referem-se a queda livre de cabine, esmagamento em percurso aberto e aprisionamento em caso de pane.",
        "secao_14": "O índice de risco inicial do equipamento é elevado (Risco Muito Alto), sendo reduzido para patamares Desprezíveis após adequação estrutural.",
        "secao_15": "Relação de Não Conformidades observadas com enquadramento normativo preciso.",
        "secao_16": "Adaptações e projetos mecânicos adicionais necessários para a efetiva reclassificação de tráfego.",
        "secao_17": `A viabilidade técnica é declarada como "${conclusao.status}" condicionado à reforma descrita.`,
        "secao_18": "Intervenções de alta complexidade com necessidade de projeto detalhado, ensaios de soldas estruturais e recolhimento de ART.",
        "secao_19": "Cronograma de intervenções, prazos propostos e responsáveis técnicos recomendados.",
        "secao_20": `Parecer Técnico Pericial Conclusivo: Vitor Leonardo declara o equipamento "${conclusao.status}" dependendo da execução integral das melhorias descritas.`,
        "secao_21": "Vistoria mecânica de integridade visual e estática, não englobando vícios ocultos do redutor.",
        "secao_22": "Evidências fotográficas e guias de ART."
      });
    }
  }, [laudoParams, conclusao.status]);

  // Load beautiful, highly comprehensive real simulated data matching the specifications
  const loadSimulatedData = () => {
    setLaudoParams(PREFILLED_PARAMS);
    setChecklist(PREFILLED_CHECKLIST);
    setNaoConformidades(PREFILLED_NAO_CONFORMIDADES);
    setPlanoAcao(PREFILLED_PLANO_ACAO);
    setSistemasInspecao(PREFILLED_SISTEMAS);
    setConclusao(PREFILLED_CONCLUSÃO);
    
    // Generate simulated dynamic sections
    const params = PREFILLED_PARAMS;
    setSecoes({
      "secao_1": `Este Laudo Técnico de Reclassificação e Conformidade Técnica tem por escopo principal avaliar, auditar e certificar a viabilidade mecânica e estrutural do equipamento de transporte vertical de cargas tipo "${params.equipmentType}" para operação em nova categoria regulamentar de uso. O procedimento pericial foi desenvolvido em conformidade estrita com a NR-12 (Segurança em Máquinas e Equipamentos) e com as diretrizes específicas estabelecidas nas normas técnicas ABNT NBR 14712 (Elevadores de carga e monta-cargas) e ABNT NBR 16858-1/2 (Elevadores de passageiros).`,
      "secao_2": `O presente documento de auditoria técnica foi encomendado pela empresa ${params.clientName}, inscrita no CNPJ sob o número ${params.cnpj}, estabelecida em: ${params.address}. A contratante busca a regularização jurídica e operacional do sistema de transporte vertical existente, visando garantir proteção integral e de alto padrão a seus operadores e técnicos em conformidade com as exigências civis e criminais de responsabilidade técnica.`,
      "secao_3": `Emitido por: VL Engenharia. Perito Responsável: Engenheiro Mecânico Vitor Leonardo (CREA-PE 1822299490), especialista em auditoria de elevadores de carga, monta-cargas, plataformas industriais e enquadramento estrito de segurança veicular e industrial. Endereço Técnico: Recife-PE. Tel: (81) 98444-2592, E-mail: vitorleonardocl@gmail.com.`,
      "secao_4": `O equipamento sob vistoria consiste em um sistema de ${params.equipmentType} com número de série ${params.serialNumber}, fabricado por ${params.manufacturer}, modelo ${params.model}. O equipamento apresenta atualmente capacidade de carga declarada de ${params.capacityCurrent}, velocidade de percurso de ${params.speedNominal}, ${params.numParadas} paradas ao longo de percurso vertical de ${params.heightPercurso} metros. O acionamento é ${params.driveSystem} utilizando suspensão tipo ${params.suspensionType}. O equipamento está instalado no setor: ${params.installationLocation}.`,
      "secao_5": `Finalidade da Alteração Pretendida: O projeto visa obter o enquadramento do equipamento na categoria de "${params.proposedCategory}". Tal reclassificação exige o atendimento imediato de requisitos normativos severos para transporte de pessoas, equiparando-se em segurança ativa aos elevadores convencionais de passageiros sob as regras da ABNT NBR 16858.`,
      "secao_6": `Os documentos técnicos analisados para fundamentação desta auditoria incluem: projetos civis e mecânicos originais do poço de elevador, folhas de manutenção periódica fornecidas pela gerência do site, prontuário elétrico do quadro de força, histórico de revisões de cabos e cabine, e relatórios de medições mecânicas em campo.`,
      "secao_7": `O balizamento normativo e as referências periciais adotadas são compostas por: NR-12 (Segurança de Máquinas - Anexos I e VII), ABNT NBR 14712 (Monta-Cargas de Carga), ABNT NBR 16858-1 (Requisitos de segurança para elevadores), ABNT NBR 16858-2 (Regras de projeto), ABNT NBR ISO 12100 (Apreciação de risco), e normas municipais relativas ao tráfego vertical de passageiros.`,
      "secao_8": `Metodologia de Estimativa e Classificação de Risco: Aplicação do método numérico Hazard Rating Number (HRN) conforme estabelecido pela ABNT NBR ISO 12100 para a quantificação do perigo. A fórmula matemática aplicada é: HRN = LO (Probabilidade de Ocorrência) x FE (Frequência de Exposição) x DPH (Gravidade da Lesão) x NP (Número de Pessoas Expostas). Os graus resultantes determinam a aceitabilidade e fundamentam o plano de ação regulamentar.`,
      "secao_9": `O levantamento visual in loco capturou registros detalhados das instalações físicas de percurso, compreendendo o estado estrutural do poço de alvenaria, o quadro elétrico de comandos de patamar, as soleiras de entrada, o fechamento da cabine e os pontos de fixação dos cabos e polias de tração traseiros.`,
      "secao_10": `A avaliação visual detalhada cobriu exaustivamente os 7 macro-sistemas estruturais do monta-cargas, detalhando a integridade física da cabine (altura e piso), as condições de profundidade e dreno do fundo do poço, os componentes dinâmicos do sistema de tração, as guias lineares de aço, a existência de dispositivos mecânicos de segurança ativos (freio de segurança e limitador de velocidade), o fechamento rígido das portas de patamar e a montagem do sistema elétrico de força e lógica.`,
      "secao_11": `Comparativo de Requisitos Normativos: Apresenta-se uma tabela técnica comparativa entre os requisitos instalados no monta-cargas original e as exigências mandatórias para a categoria "${params.proposedCategory}" sob a ABNT NBR 16858, identificando desvios críticos e lacunas de segurança industrial que demandam reestruturação técnica.`,
      "secao_12": `Auditoria Sistemática do Checklist: Realização de inspeção técnica pormenorizada sobre os 18 requisitos de segurança para monta-cargas e elevadores adaptados, atestando a presença ou a ausência total dos dispositivos regulamentares e registrando observações explicativas com foco pericial.`,
      "secao_13": `Identificação dos Perigos: Concentram-se os riscos no perigo de esmagamento contra as paredes internas do poço durante a movimentação por falta de fechamento completo da cabine, queda livre decorrente de sobrecarga ou falha no cabo e ausência de dispositivos automáticos redundantes de frenagem secundária em guias.`,
      "secao_14": `Apreciação e Mitigação de Riscos (HRN): A quantificação inicial do monta-cargas em seu estado de operação atual resultou em um score de HRN elevado (Risco Muito Alto). Através da execução integral do cronograma de adequações exigido nesta peça, o risco estimado é reduzido para patamares Desprezíveis/Muito Baixos, garantindo viabilidade jurídica e segurança operacional.`,
      "secao_15": `Não Conformidades Identificadas: São relacionadas as infrações observadas em campo (NC-01 a NC-04), com indicação clara da sua criticidade técnica e citação exata de artigos das normas violadas para fins de fiscalização e responsabilidade técnica civil.`,
      "secao_16": `Adaptações Necessárias para Reclassificação: Detalha o conjunto de modificações mecânicas e elétricas indispensáveis para habilitar legalmente a alteração de categoria, as quais deverão ser acompanhadas de memorial de cálculo e laudos de ensaios não destrutivos.`,
      "secao_17": `Viabilidade Técnica da Reclassificação: Haja vista os resultados da vistoria mecânica e o dimensionamento estrutural do poço, a reclassificação do monta-cargas é declarada tecnicamente VIÁVEL MEDIANTE EXECUÇÃO DE ADAPTAÇÕES OBRIGATÓRIAS, sendo inviável sua liberação sob o arranjo físico original atual.`,
      "secao_18": `Estimativa e Complexidade de Intervenções: Classifica-se o conjunto de adequações necessárias como de alta complexidade de engenharia, exigindo mão de obra certificada, emissão de ART de fabricação/reforma por profissional registrado e testes de carga simulada com peso padrão sob supervisão de engenheiro mecânico.`,
      "secao_19": `Plano de Ação para Regularização: Apresentação de tabela operacional com ações mecânicas urgentes (AP-01 a AP-04), prazos específicos de execução sugeridos, responsáveis industriais recomendados e referência normativa direta para cada intervenção.`,
      "secao_20": `Conclusão Técnica e Parecer de Reclassificação: Emissão de parecer pericial conclusivo, declarando as condições indispensáveis de certificação final do monta-cargas e determinando os requisitos de conformidade documental e mecânica exigidos para o registro da alteração perante os órgãos de fiscalização do trabalho.`,
      "secao_21": `Limitações e Validade da Avaliação: Esta vistoria pericial possui caráter exclusivamente mecânico e eletromecânico superficial e estático das peças na data de inspeção. Quaisquer alterações operacionais, falta de manutenção periódica preventiva ou excesso de carga desautorizado invalidam integralmente as conclusões constantes neste parecer de engenharia.`,
      "secao_22": `Anexos e Registros Auxiliares: Listagem de fotos digitais identificadas, guias de ART assinadas digitalmente e diagramas unifilares básicos do painel elétrico de comando reestruturado para consulta.`
    });
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
            description: "Análise técnica visual do subsistema: " + file.name.split(".")[0]
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

  // Trigger Gemini AI Reclassification Auditor
  const triggerGeminioAudit = async () => {
    setLoadingAI(true);
    try {
      const payload = {
        ...laudoParams,
        checklist,
        hrn_before: hrnBefore,
        hrn_after: hrnAfter,
        nao_conformidades: naoConformidades,
        plano_action: planoAcao,
        images: uploadedImages.slice(0, 3) // Send first 3 images with base64 data
      };

      const res = await fetch("/api/gemini/montacargas-audit", {
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
        setChecklist(prev => prev.map((item, i) => {
          const match = data.checklist[`item_${i + 1}`];
          if (match) {
            return { ...item, status: match.resposta, nota: match.nota };
          }
          return item;
        }));
      }

      if (data.hrn_before) setHrnBefore(data.hrn_before);
      if (data.hrn_after) setHrnAfter(data.hrn_after);
      if (data.nao_conformidades) setNaoConformidades(data.nao_conformidades);
      if (data.plano_action) setPlanoAcao(data.plano_action);
      if (data.conclusao) setConclusao(data.conclusao);
      if (data.sistemas_inspecao) setSistemasInspecao(data.sistemas_inspecao);
      if (data.secoes) setSecoes(data.secoes);

    } catch (err) {
      console.error(err);
      alert("Conexão com a IA indisponível. Dados de simulação pericial carregados com sucesso.");
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
        filename: `${laudoParams.laudoNumber.replace(/\//g, "-")}-reclassificacao-montacargas.pdf`,
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
    exportToWord("laudo-printable-area", `${laudoParams.laudoNumber.replace(/\//g, "-")}-reclassificacao-montacargas`);
  };

  // Helpers to add manually
  const addNaoConformidade = () => {
    const nextId = `NC-0${naoConformidades.length + 1}`;
    setNaoConformidades(prev => [
      ...prev,
      {
        id: nextId,
        descricao: "Descreva a não conformidade encontrada...",
        criticidade: "MÉDIA",
        risco: "Descreva o perigo relacionado...",
        norma: "Item exato da norma..."
      }
    ]);
  };

  const removeNaoConformidade = (id: string) => {
    setNaoConformidades(prev => prev.filter(nc => nc.id !== id));
  };

  const addPlanoAcao = () => {
    const nextId = `AP-0${planoAcao.length + 1}`;
    setPlanoAcao(prev => [
      ...prev,
      {
        id: nextId,
        problema: "Identifique a pendência...",
        norma: "Item exato da norma...",
        recomendacao: "Descreva a recomendação técnica de intervenção...",
        prioridade: "MÉDIO PRAZO",
        responsavel: "Equipe VL Engenharia / Cliente",
        prazo: "10 dias"
      }
    ]);
  };

  const removePlanoAcao = (id: string) => {
    setPlanoAcao(prev => prev.filter(ap => ap.id !== id));
  };

  return (
    <div className={`space-y-8 animate-fade-in text-left ${fullscreen ? "fixed inset-0 z-50 bg-slate-900 overflow-y-auto p-6 md:p-12" : ""}`}>
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-[#134074] dark:text-[#4895EF] hover:underline mb-1 flex items-center gap-1">
            ← Voltar para Central
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <LayersIcon className="w-6 h-6 text-[#134074] dark:text-[#4895EF]" />
            <span>Laudo de Reclassificação de Monta-Cargas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Estudo de viabilidade de alteração para transporte de pessoas (acompanhante/passageiros) sob a NR-12 e NBR 16858.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            title="Alternar Modo Tela Cheia"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={printLaudoPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={handleCopyRichText}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar p/ Docs</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar Word</span>
          </button>
        </div>
      </div>

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
          Formulário & Reclassificação
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
          className={`px-5 py-3 font-bold text-xs border-b-2 tracking-wide uppercase cursor-pointer lg:hidden ${
            activeTab === "preview"
              ? "border-[#134074] dark:border-[#4895EF] text-[#134074] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Visualizar Parecer (A4)
        </button>
      </div>

      {activeTab === "pricing" ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo de Reclassificação de Monta-Cargas"
            equipmentName={laudoParams.fabricante_marca || "Monta-Cargas"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left pane: Inputs Form */}
          <div className={`lg:col-span-5 space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar ${activeTab === "preview" ? "hidden lg:block" : ""}`}>
          
          {/* Quick simulation bar */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-sans">Simulador de Projeto</h4>
              <p className="text-[11px] text-slate-500">Prefencha instantaneamente com dados de projeto real de elevador industrial.</p>
            </div>
            <button
              onClick={loadSimulatedData}
              className="px-3 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase shadow"
            >
              Simular Caso Real
            </button>
          </div>

          {/* AI Trigger */}
          <div className="bg-gradient-to-r from-[#134074]/10 to-indigo-600/10 border border-[#134074]/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-[#134074] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">Gerador de Laudo com IA</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Utilize o Gemini para redigir a justificativa técnica de reclassificação, auditar o checklist com as normas vigentes, sugerir as adaptações exigidas e calcular as reduções de perigos no HRN.
                </p>
              </div>
            </div>

            <button
              onClick={triggerGeminioAudit}
              disabled={loadingAI}
              className="w-full py-2.5 bg-gradient-to-r from-[#134074] to-indigo-600 hover:from-[#134074]/90 hover:to-indigo-600/90 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {loadingAI ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>Analisando e Redigindo com IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Auditar & Redigir com IA</span>
                </>
              )}
            </button>
          </div>

          {/* Form Section: Client Data */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>1. Dados do Cliente & Local</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

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

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Razão Social Contratante</label>
                <input
                  type="text"
                  value={laudoParams.clientName}
                  onChange={e => setLaudoParams({ ...laudoParams, clientName: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">CNPJ do Cliente</label>
                <input
                  type="text"
                  value={laudoParams.cnpj}
                  onChange={e => setLaudoParams({ ...laudoParams, cnpj: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Número do Laudo</label>
                <input
                  type="text"
                  value={laudoParams.laudoNumber}
                  onChange={e => setLaudoParams({ ...laudoParams, laudoNumber: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Endereço de Instalação</label>
                <input
                  type="text"
                  value={laudoParams.address}
                  onChange={e => setLaudoParams({ ...laudoParams, address: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Cidade da Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionCity}
                  onChange={e => setLaudoParams({ ...laudoParams, inspectionCity: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Data da Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionDate}
                  onChange={e => setLaudoParams({ ...laudoParams, inspectionDate: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  placeholder="Ex: ABNT NBR 14712, ABNT NBR NM 267, etc. (Separe por vírgulas)"
                  value={laudoParams.normasAdicionais || ""}
                  onChange={e => setLaudoParams({ ...laudoParams, normasAdicionais: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Section: Equipment Specifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <LayersIcon className="w-4 h-4" />
              <span>2. Especificações do Equipamento</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tipo Equipamento</label>
                <input
                  type="text"
                  value={laudoParams.equipmentType}
                  onChange={e => setLaudoParams({ ...laudoParams, equipmentType: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Fabricante</label>
                <input
                  type="text"
                  value={laudoParams.manufacturer}
                  onChange={e => setLaudoParams({ ...laudoParams, manufacturer: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Modelo</label>
                <input
                  type="text"
                  value={laudoParams.model}
                  onChange={e => setLaudoParams({ ...laudoParams, model: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Número de Série</label>
                <input
                  type="text"
                  value={laudoParams.serialNumber}
                  onChange={e => setLaudoParams({ ...laudoParams, serialNumber: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Capacidade Atual</label>
                <input
                  type="text"
                  value={laudoParams.capacityCurrent}
                  onChange={e => setLaudoParams({ ...laudoParams, capacityCurrent: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Velocidade Nominal</label>
                <input
                  type="text"
                  value={laudoParams.speedNominal}
                  onChange={e => setLaudoParams({ ...laudoParams, speedNominal: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Número de Paradas</label>
                <input
                  type="text"
                  value={laudoParams.numParadas}
                  onChange={e => setLaudoParams({ ...laudoParams, numParadas: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Percurso Vertical (m)</label>
                <input
                  type="text"
                  value={laudoParams.heightPercurso}
                  onChange={e => setLaudoParams({ ...laudoParams, heightPercurso: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Dimensões Cabine</label>
                <input
                  type="text"
                  value={laudoParams.dimensionsCabine}
                  onChange={e => setLaudoParams({ ...laudoParams, dimensionsCabine: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Sistema Suspensão</label>
                <input
                  type="text"
                  value={laudoParams.suspensionType}
                  onChange={e => setLaudoParams({ ...laudoParams, suspensionType: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Categoria de Reclassificação Pretendida</label>
                <select
                  value={laudoParams.proposedCategory}
                  onChange={e => setLaudoParams({ ...laudoParams, proposedCategory: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Uso por pessoas acompanhando a carga">Uso por pessoas acompanhando a carga (Carga e Operador)</option>
                  <option value="Elevador de passageiros">Elevador de passageiros (Reclassificação Total)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Section: Photograph Upload */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>3. Fotos da Vistoria Técnica</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                Máx. 3
              </span>
            </h3>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Arraste ou clique para adicionar</p>
              <p className="text-[10px] text-slate-400 mt-1">Imagens em base64 prontas para a IA analisar no laudo.</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="space-y-3 pt-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <img src={img.data} alt="Upload preview" className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 truncate">{img.name}</p>
                      <textarea
                        value={img.description}
                        onChange={e => updateImageDescription(idx, e.target.value)}
                        placeholder="Escreva a descrição e legenda técnica desta imagem..."
                        className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Section: Checklist Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>4. Checklist de Reclassificação (18 itens)</span>
              </span>
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {checklist.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
                      {idx + 1}. {item.name}
                    </span>
                    <select
                      value={item.status}
                      onChange={e => {
                        const next = [...checklist];
                        next[idx].status = e.target.value as "SIM" | "NÃO" | "N/A";
                        setChecklist(next);
                      }}
                      className={`text-[10px] font-bold py-1 px-1.5 rounded border ${
                        item.status === "SIM" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200" :
                        item.status === "NÃO" ? "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200" :
                        "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200"
                      }`}
                    >
                      <option value="SIM">SIM</option>
                      <option value="NÃO">NÃO</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <textarea
                    value={item.nota}
                    onChange={e => {
                      const next = [...checklist];
                      next[idx].nota = e.target.value;
                      setChecklist(next);
                    }}
                    placeholder="Nota explicativa ou enquadramento legal..."
                    className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Section: HRN Before (Interactive calculation) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>5. HRN Inicial (Antes do Controle)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">LO - Probabilidade</label>
                <select
                  value={hrnBefore.lo}
                  onChange={e => handleCalcBefore("lo", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">FE - Exposição</label>
                <select
                  value={hrnBefore.fe}
                  onChange={e => handleCalcBefore("fe", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">DPH - Gravidade</label>
                <select
                  value={hrnBefore.dph}
                  onChange={e => handleCalcBefore("dph", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">NP - Pessoas Expostas</label>
                <select
                  value={hrnBefore.np}
                  onChange={e => handleCalcBefore("np", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-red-500 font-bold uppercase">Score HRN Calculado</p>
                <p className="text-xl font-black text-red-700 dark:text-red-400 font-mono leading-none mt-1">{hrnBefore.score}</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                {hrnBefore.classification}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Descrição pericial do risco inicial</label>
              <textarea
                value={hrnBefore.explicacao}
                onChange={e => setHrnBefore({ ...hrnBefore, explicacao: e.target.value })}
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                rows={2}
              />
            </div>
          </div>

          {/* Form Section: HRN After (Interactive calculation) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>6. HRN Residual (Após Implementar Controles)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">LO - Probabilidade</label>
                <select
                  value={hrnAfter.lo}
                  onChange={e => handleCalcAfter("lo", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">FE - Exposição</label>
                <select
                  value={hrnAfter.fe}
                  onChange={e => handleCalcAfter("fe", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">DPH - Gravidade</label>
                <select
                  value={hrnAfter.dph}
                  onChange={e => handleCalcAfter("dph", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">NP - Pessoas Expostas</label>
                <select
                  value={hrnAfter.np}
                  onChange={e => handleCalcAfter("np", Number(e.target.value))}
                  className="w-full text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                >
                  {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Score HRN Calculado</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono leading-none mt-1">{hrnAfter.score}</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg">
                {hrnAfter.classification}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Descrição pericial do risco mitigado</label>
              <textarea
                value={hrnAfter.explicacao}
                onChange={e => setHrnAfter({ ...hrnAfter, explicacao: e.target.value })}
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                rows={2}
              />
            </div>
          </div>

          {/* Form Section: Non-Conformities */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>7. Não Conformidades Detectadas</span>
              </h3>
              <button
                onClick={addNaoConformidade}
                className="p-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-white rounded"
              >
                + Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {naoConformidades.map((nc, idx) => (
                <div key={nc.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 px-2 py-0.5 rounded">
                      {nc.id}
                    </span>
                    <button
                      onClick={() => removeNaoConformidade(nc.id)}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={nc.descricao}
                      onChange={e => {
                        const next = [...naoConformidades];
                        next[idx].descricao = e.target.value;
                        setNaoConformidades(next);
                      }}
                      className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={nc.criticidade}
                        onChange={e => {
                          const next = [...naoConformidades];
                          next[idx].criticidade = e.target.value as any;
                          setNaoConformidades(next);
                        }}
                        className="text-[10px] font-bold p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      >
                        <option value="CRÍTICA">CRÍTICA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="MÉDIA">MÉDIA</option>
                        <option value="BAIXA">BAIXA</option>
                      </select>
                      <input
                        type="text"
                        value={nc.norma}
                        onChange={e => {
                          const next = [...naoConformidades];
                          next[idx].norma = e.target.value;
                          setNaoConformidades(next);
                        }}
                        placeholder="Item exato norma..."
                        className="text-[10px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Section: Action Plan */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>8. Plano de Ação de Adequações</span>
              </h3>
              <button
                onClick={addPlanoAcao}
                className="p-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-white rounded"
              >
                + Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {planoAcao.map((ap, idx) => (
                <div key={ap.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded">
                      {ap.id}
                    </span>
                    <button
                      onClick={() => removePlanoAcao(ap.id)}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={ap.problema}
                      onChange={e => {
                        const next = [...planoAcao];
                        next[idx].problema = e.target.value;
                        setPlanoAcao(next);
                      }}
                      className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                    />
                    <textarea
                      value={ap.recomendacao}
                      onChange={e => {
                        const next = [...planoAcao];
                        next[idx].recomendacao = e.target.value;
                        setPlanoAcao(next);
                      }}
                      placeholder="Medidas de engenharia recomendadas..."
                      className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={ap.norma}
                        onChange={e => {
                          const next = [...planoAcao];
                          next[idx].norma = e.target.value;
                          setPlanoAcao(next);
                        }}
                        className="text-[10px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      />
                      <input
                        type="text"
                        value={ap.prazo}
                        onChange={e => {
                          const next = [...planoAcao];
                          next[idx].prazo = e.target.value;
                          setPlanoAcao(next);
                        }}
                        placeholder="Prazo..."
                        className="text-[10px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Section: Final Conclusion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#134074] dark:text-[#4895EF] uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>9. Viabilidade & Conclusão Técnica</span>
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Status Viabilidade</label>
              <select
                value={conclusao.status}
                onChange={e => setConclusao({ ...conclusao, status: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
              >
                <option value="VIÁVEL MEDIANTE ADAPTAÇÕES">VIÁVEL MEDIANTE ADAPTAÇÕES</option>
                <option value="VIÁVEL SEM ADAPTAÇÕES">VIÁVEL SEM ADAPTAÇÕES</option>
                <option value="NÃO VIÁVEL">NÃO VIÁVEL</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Parecer Conclusivo Final</label>
              <textarea
                value={conclusao.parecer}
                onChange={e => setConclusao({ ...conclusao, parecer: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg leading-relaxed resize-none"
                rows={4}
              />
            </div>
          </div>

        </div>

        {/* Right pane: Real-time high-fidelity PDF printable area */}
        {/* Right pane: Real-time Live A4 Preview */}
        <div className={`lg:col-span-7 bg-slate-500/5 dark:bg-slate-900/5 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 ${activeTab === "form" ? "hidden lg:block" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase">Visualização de Impressão A4 (Fidelidade Máxima)</span>
            <span className="text-[10px] bg-[#134074]/10 text-[#134074] dark:bg-[#4895EF]/10 dark:text-[#4895EF] font-bold px-2 py-0.5 rounded uppercase">22 Seções periciais</span>
          </div>

          {/* Interactive Report Stage */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white text-slate-900 overflow-hidden shadow-2xl p-8 max-h-[85vh] overflow-y-auto">
            <div id="laudo-printable-area" ref={reportRef} className="bg-white text-slate-900 space-y-12 font-sans text-sm leading-relaxed p-2 md:p-6 select-text">
              
              {/* PAGE 1: CAPA */}
              <div className="min-h-[297mm] flex flex-col justify-between border-b pb-8 relative page-break">
                <div className="flex items-center justify-between border-b-2 border-[#134074] pb-4">
                  <Logo variant="print" className="h-12" />
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-[#134074]">VL Engenharia S/A</p>
                    <p className="text-[9px] text-slate-500 font-mono">CNPJ: 18.222.994/0001-90</p>
                    <p className="text-[9px] text-slate-500">CREA-PE: 1822299490</p>
                  </div>
                </div>

                <div className="my-auto text-center space-y-8 py-16">
                  <h1 className="text-3xl font-black text-slate-950 uppercase tracking-wider leading-tight">
                    Laudo Técnico de Reclassificação e Conformidade
                  </h1>
                  <p className="text-xl font-bold text-[#134074] uppercase tracking-wide bg-slate-100 py-3 px-6 rounded-xl inline-block">
                    Equipamento: {laudoParams.equipmentType}
                  </p>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Estudo técnico pericial de viabilidade para alteração de categoria regulamentar de tráfego de cargas para transporte vertical de pessoas em conformidade com as regras da NR-12, ABNT NBR 14712 e NBR 16858-1/2.
                  </p>
                </div>

                <div className="border-t pt-6 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400">Contratante</p>
                    <p className="font-bold text-slate-800">{laudoParams.clientName}</p>
                    <p className="text-slate-500">CNPJ: {laudoParams.cnpj}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-slate-400">Documento de Controle</p>
                    <p className="font-bold text-slate-800">Laudo Nº: {laudoParams.laudoNumber}</p>
                    <p className="text-slate-500">{laudoParams.inspectionCity}, {laudoParams.inspectionDate}</p>
                  </div>
                </div>
              </div>

              {/* CARTA DE APRESENTAÇÃO */}
              <div className="min-h-[297mm] flex flex-col justify-between border-b pb-8 page-break pt-8">
                <div className="space-y-6">
                  <h2 className="text-lg font-black text-[#134074] uppercase tracking-wider border-b pb-2">Carta de Apresentação Oficial</h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    À Diretoria Técnica de Engenharia da <strong>{laudoParams.clientName}</strong>.
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Apresentamos a V. S.ª o Laudo Técnico de Auditoria e Conformidade com foco na Reclassificação do monta-cargas industrial com número de série <strong>{laudoParams.serialNumber}</strong>. Este documento pericial, de autoria do perito Engenheiro Mecânico Vitor Leonardo, apresenta a análise física, os ensaios de campo, o checklist de requisitos, o cálculo probabilístico de risco Hazard Rating Number (HRN), e as adequações mandatórias para viabilizar juridicamente a nova categoria de uso pretendida de: <strong>"{laudoParams.proposedCategory}"</strong>.
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Em virtude das responsabilidades civis e criminais inerentes à reclassificação de sistemas de transporte vertical de pessoas, este parecer emite as recomendações cruciais de engenharia para assegurar a conformidade com as normas regulamentadoras federais e diretrizes de projeto da ABNT.
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    Permanecemos à disposição para quaisquer esclarecimentos periciais ou técnicos necessários.
                  </p>
                </div>

                <div className="text-center pt-12 space-y-2">
                  <div className="w-48 h-1 mx-auto bg-slate-300"></div>
                  <p className="font-bold text-xs text-slate-900">Eng. Mecânico Vitor Leonardo</p>
                  <p className="text-[10px] text-slate-500">Responsável Técnico de Inspeção - CREA-PE 1822299490</p>
                  <p className="text-[9px] text-slate-400 font-mono">VL Engenharia Ltda</p>
                </div>
              </div>

              {/* SECTIONS LISTING */}
              <div className="space-y-12">
                
                {/* 1. Introdução */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 1. Introdução & Fundamentação Técnica
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-700 space-y-3 leading-relaxed text-justify">
                    <p>{secoes["secao_1"]}</p>
                    <p>{secoes["secao_5"]}</p>
                  </div>
                </div>

                {/* 2 & 3. Dados das Empresas */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seções 2 & 3. Identificação das Partes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                      <p className="font-bold uppercase text-[#134074] text-[10px]">Contratante (Solicitante)</p>
                      <p><strong>Empresa:</strong> {laudoParams.clientName}</p>
                      <p><strong>CNPJ:</strong> {laudoParams.cnpj}</p>
                      <p><strong>Endereço:</strong> {laudoParams.address}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                      <p className="font-bold uppercase text-[#134074] text-[10px]">Contratada (Emissora)</p>
                      <p><strong>Empresa:</strong> VL Engenharia S/A</p>
                      <p><strong>Engenheiro Responsável:</strong> Vitor Leonardo</p>
                      <p><strong>CREA-PE:</strong> 1822299490</p>
                      <p><strong>E-mail:</strong> vitorleonardocl@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* 4. Dados do Equipamento */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 4. Especificações Técnicas Atuais do Equipamento
                  </h3>
                  <p className="text-xs text-slate-700 text-justify">{secoes["secao_4"]}</p>
                  <table className="w-full text-xs border border-collapse border-slate-200">
                    <tbody>
                      <tr className="bg-slate-50"><td className="border p-2 font-bold w-1/3 text-slate-600">Tipo Equipamento</td><td className="border p-2">{laudoParams.equipmentType}</td></tr>
                      <tr><td className="border p-2 font-bold text-slate-600">Fabricante / Modelo</td><td className="border p-2">{laudoParams.manufacturer} / {laudoParams.model}</td></tr>
                      <tr className="bg-slate-50"><td className="border p-2 font-bold text-slate-600">Número Série / Ano</td><td className="border p-2">{laudoParams.serialNumber} / {laudoParams.fabYear}</td></tr>
                      <tr><td className="border p-2 font-bold text-slate-600">Capacidade / Velocidade</td><td className="border p-2">{laudoParams.capacityCurrent} / {laudoParams.speedNominal}</td></tr>
                      <tr className="bg-slate-50"><td className="border p-2 font-bold text-slate-600">Número Paradas / Percurso</td><td className="border p-2">{laudoParams.numParadas} / {laudoParams.heightPercurso}m</td></tr>
                      <tr><td className="border p-2 font-bold text-slate-600">Dimensões Cabine (CxLxH)</td><td className="border p-2">{laudoParams.dimensionsCabine}</td></tr>
                      <tr className="bg-slate-50"><td className="border p-2 font-bold text-slate-600">Sistema Suspensão / Acionamento</td><td className="border p-2">{laudoParams.suspensionType} / {laudoParams.driveSystem}</td></tr>
                      <tr><td className="border p-2 font-bold text-slate-600">Última Inspeção / Manutenção</td><td className="border p-2">{laudoParams.lastInspection} / {laudoParams.lastMaintenance}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 5, 6, 7 & 8. Fundamentação e Metodologia */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seções 5-8. Metodologia e Base Normativa
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3 text-xs text-slate-700 text-justify">
                    <p><strong>Documentos Analisados:</strong> {secoes["secao_6"]}</p>
                    <p><strong>Normas de Referência:</strong> {secoes["secao_7"]}</p>
                    <p><strong>Metodologia Hazard Rating Number (HRN):</strong> {secoes["secao_8"]}</p>
                  </div>
                </div>

                {/* 10. Inspeção Visual de Macrosistemas */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 10. Vistoria Física e Inspeção de Macrosistemas
                  </h3>
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.1 Cabine / Plataforma de Carga</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.cabine}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.2 Caixa de Corrida, Poço e Casa de Máquinas</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.poco_casa_maquinas}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.3 Sistema de Tração e Cabos de Suspensão</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.sistema_tracao}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.4 Guias Lineares e Alinhamento Estrutural</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.guias_estrutura}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.5 Dispositivos de Segurança e Intertravamento</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.dispositivos_seguranca}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.6 Portas de Patamar e Fechamento de Pavimento</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.portas_patamar}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#134074] text-[10px] uppercase">10.7 Quadro Elétrico de Comandos e Aterramento</p>
                      <p className="mt-1 leading-relaxed">{sistemasInspecao.sistema_eletrico}</p>
                    </div>
                  </div>
                </div>

                {/* 11. Tabela Comparativa Normativa */}
                <div className="space-y-4 page-break">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 11. Tabela de Enquadramento Comparativo Normativo
                  </h3>
                  <table className="w-full text-xs border border-collapse border-slate-200">
                    <thead>
                      <tr className="bg-slate-150 text-slate-800">
                        <th className="border p-2 text-left font-bold w-1/3">Item Requisitado (ABNT NBR 16858-1)</th>
                        <th className="border p-2 text-left font-bold">Estado do Monta-Cargas Original</th>
                        <th className="border p-2 text-center font-bold w-1/6">Conformidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-50">
                        <td className="border p-2 font-bold text-slate-700">Altura livre útil (≥ 2,00m)</td>
                        <td className="border p-2">Apenas 1,20m de altura livre, obrigando o operador a fletir o tronco.</td>
                        <td className="border p-2 text-center text-red-600 font-bold">NÃO</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold text-slate-700">Dispositivo para-quedas em guias</td>
                        <td className="border p-2">Inexistência de freio de segurança mecânico para segurar em queda.</td>
                        <td className="border p-2 text-center text-red-600 font-bold">NÃO</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border p-2 font-bold text-slate-700">Limitador de velocidade centrífugo</td>
                        <td className="border p-2">Ausência de governador mecânico associado ao freio de guias.</td>
                        <td className="border p-2 text-center text-red-600 font-bold">NÃO</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold text-slate-700">Portas de pavimento de altura completa</td>
                        <td className="border p-2">Portas venezianas curtas (1,50 m) que permitem acesso perigoso.</td>
                        <td className="border p-2 text-center text-red-600 font-bold">NÃO</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="border p-2 font-bold text-slate-700">Intertravamento eletromecânico portas</td>
                        <td className="border p-2">Ausência de fechaduras físicas acopladas a contatos de segurança redundantes.</td>
                        <td className="border p-2 text-center text-red-600 font-bold">NÃO</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 12. Checklist de Reclassificação */}
                <div className="space-y-4 page-break">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 12. Checklist Completo de Auditoria Sistemática (18 Requisitos)
                  </h3>
                  <table className="w-full text-xs border border-collapse border-slate-200">
                    <thead>
                      <tr className="bg-slate-150 text-slate-800">
                        <th className="border p-2 text-left font-bold w-1/12">Nº</th>
                        <th className="border p-2 text-left font-bold w-5/12">Requisito de Segurança</th>
                        <th className="border p-2 text-center font-bold w-1/12">Status</th>
                        <th className="border p-2 text-left font-bold">Avaliação Técnica em Vistoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklist.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-slate-50" : ""}>
                          <td className="border p-2 text-center font-mono">{idx + 1}</td>
                          <td className="border p-2 font-bold text-slate-700">{item.name}</td>
                          <td className={`border p-2 text-center font-black ${
                            item.status === "SIM" ? "text-emerald-600" :
                            item.status === "NÃO" ? "text-red-600" :
                            "text-slate-500"
                          }`}>{item.status}</td>
                          <td className="border p-2 text-slate-600 leading-relaxed text-[11px]">{item.nota}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 14. Apreciação de Risco (HRN before/after) */}
                <div className="space-y-4 page-break">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 14. Quantificação Numérica de Perigo (Método HRN)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
                      <p className="font-bold text-red-700 text-xs uppercase flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Estado Operacional Atual (Sem Ajustes)</span>
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">{hrnBefore.explicacao}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-red-200/50">
                        <span className="text-[10px] font-mono text-red-500">Score: {hrnBefore.lo} x {hrnBefore.fe} x {hrnBefore.dph} x {hrnBefore.np}</span>
                        <span className="text-sm font-black text-red-700 font-mono">{hrnBefore.score} ({hrnBefore.classification})</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <p className="font-bold text-emerald-700 text-xs uppercase flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Estado Operacional Recomendado (Após Adequar)</span>
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">{hrnAfter.explicacao}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-emerald-200/50">
                        <span className="text-[10px] font-mono text-emerald-500">Score: {hrnAfter.lo} x {hrnAfter.fe} x {hrnAfter.dph} x {hrnAfter.np}</span>
                        <span className="text-sm font-black text-emerald-700 font-mono">{hrnAfter.score} ({hrnAfter.classification})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 15. Não Conformidades */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 15. Relação de Desvios e Não Conformidades Regulamentares
                  </h3>
                  {naoConformidades.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhuma não conformidade cadastrada no laudo.</p>
                  ) : (
                    <div className="space-y-3">
                      {naoConformidades.map(nc => (
                        <div key={nc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between border-b pb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              Código: {nc.id}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">Enquadramento: {nc.norma}</span>
                          </div>
                          <p className="text-xs text-slate-800"><strong>Descrição:</strong> {nc.descricao}</p>
                          <p className="text-xs text-slate-600"><strong>Risco Provável:</strong> {nc.risco}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Criticidade</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              nc.criticidade === "CRÍTICA" ? "bg-red-100 text-red-700" :
                              nc.criticidade === "ALTA" ? "bg-orange-100 text-orange-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>{nc.criticidade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 19. Plano de Ação */}
                <div className="space-y-4 page-break">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 19. Plano de Ação para Adequação Obrigatória
                  </h3>
                  {planoAcao.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhum plano de ação definido.</p>
                  ) : (
                    <table className="w-full text-xs border border-collapse border-slate-200">
                      <thead>
                        <tr className="bg-slate-150 text-slate-800">
                          <th className="border p-2 text-center font-bold w-1/12">ID</th>
                          <th className="border p-2 text-left font-bold w-1/3">Problema / Desvio Técnico</th>
                          <th className="border p-2 text-left font-bold">Ação e Medida de Engenharia Recomendada</th>
                          <th className="border p-2 text-center font-bold w-1/6">Prioridade</th>
                          <th className="border p-2 text-center font-bold w-1/6">Prazo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planoAcao.map((ap, idx) => (
                          <tr key={ap.id} className={idx % 2 === 0 ? "bg-slate-50" : ""}>
                            <td className="border p-2 text-center font-mono font-bold">{ap.id}</td>
                            <td className="border p-2 font-bold text-slate-700">{ap.problema} <span className="block text-[9px] text-slate-400 font-normal">Ref: {ap.norma}</span></td>
                            <td className="border p-2 text-slate-600 text-[11px] leading-relaxed">{ap.recomendacao}</td>
                            <td className="border p-2 text-center">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                ap.prioridade === "IMEDIATO" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>{ap.prioridade}</span>
                            </td>
                            <td className="border p-2 text-center text-slate-500 font-bold">{ap.prazo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 20. Conclusão Técnica e Parecer de Reclassificação */}
                <div className="space-y-4 page-break pt-8">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 20. Conclusão Pericial e Parecer de Viabilidade
                  </h3>
                  <div className={`p-5 rounded-2xl border ${
                    conclusao.status === "VIÁVEL MEDIANTE ADAPTAÇÕES" ? "bg-blue-50 border-blue-200" :
                    conclusao.status === "VIÁVEL SEM ADAPTAÇÕES" ? "bg-emerald-50 border-emerald-200" :
                    "bg-red-50 border-red-200"
                  } space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Resultado da Avaliação Pericial</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl shadow-sm ${
                        conclusao.status === "VIÁVEL MEDIANTE ADAPTAÇÕES" ? "bg-blue-600 text-white" :
                        conclusao.status === "VIÁVEL SEM ADAPTAÇÕES" ? "bg-emerald-600 text-white" :
                        "bg-red-600 text-white"
                      }`}>{conclusao.status}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed text-justify font-bold font-sans">
                      {conclusao.parecer}
                    </p>
                  </div>
                </div>

                {/* 22. Anexos Fotográficos */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4 page-break pt-8">
                    <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                      Seção 22. Anexos e Evidências Fotográficas da Vistoria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                          <img src={img.data} alt="Anexo de Vistoria" className="w-full h-48 object-cover rounded-xl border dark:border-slate-700" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Fig. {idx + 1} - Registro in loco</p>
                          <p className="text-xs text-slate-600 leading-relaxed text-justify">{img.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 21. Limitações & Termos Legais */}
                <div className="space-y-4 pt-12">
                  <h3 className="text-sm font-black text-[#134074] uppercase tracking-wider border-b pb-1.5">
                    Seção 21. Limitações e Âmbito de Validade do Laudo
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed text-justify">
                    {secoes["secao_21"] || "Este laudo técnico pericial de engenharia limita-se exclusivamente aos termos de integridade superficial e conformidade visível."}
                  </p>
                </div>

                {/* SIGNATURE BLOCK */}
                <div className="pt-16 flex flex-col items-center space-y-3">
                  <div className="w-56 h-[1px] bg-slate-300"></div>
                  <p className="font-bold text-xs text-slate-900 font-sans uppercase tracking-wider">Eng. Mecânico Vitor Leonardo</p>
                  <p className="text-[10px] text-slate-500 font-semibold font-mono">CREA-PE: 1822299490</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Resp. Técnico VL Engenharia S/A</p>
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
