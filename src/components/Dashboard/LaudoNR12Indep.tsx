import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import Logo from "../Logo";
import { ReportSignature, ReportHeader } from "./ReportBranding";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import LaudoPricingTab from "./LaudoPricingTab";
import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";


interface UploadedImage {
  name: string;
  data: string;
  description: string;
}
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
  Copy
} from "lucide-react";

// --- HRN VALUES ---
const LO_OPTIONS = [
  { value: 0.033, label: "0,033 - Quase Impossível (Não pode ocorrer em nenhuma circunstância)" },
  { value: 1.0, label: "1,000 - Muito Improvável (Entretanto é concebível)" },
  { value: 1.5, label: "1,500 - Improvável (Mas pode ocorrer)" },
  { value: 2.0, label: "2,000 - Possível (Mas é incomum)" },
  { value: 5.0, label: "5,000 - Inesperado (Pode ocorrer)" },
  { value: 8.0, label: "8,000 - Provável (Não surpreende)" },
  { value: 10.0, label: "10,000 - Muito Provável (Esperado)" },
  { value: 15.0, label: "15,000 - Certamente (Sem dúvidas)" }
];

const FE_OPTIONS = [
  { value: 0.5, label: "0,5 - Anualmente" },
  { value: 1.0, label: "1,0 - Mensalmente" },
  { value: 1.5, label: "1,5 - Semanalmente" },
  { value: 2.5, label: "2,5 - Diariamente" },
  { value: 4.0, label: "4,0 - Em Termos de Hora" },
  { value: 5.0, label: "5,0 - Constantemente" }
];

const DPH_OPTIONS = [
  { value: 0.1, label: "0,1 - Arranhão / Contusão Leve" },
  { value: 0.5, label: "0,5 - Laceração / Leves Problemas de Saúde" },
  { value: 1.0, label: "1,0 - Fratura de Ossos Pequenos / Enfermidade Leve" },
  { value: 2.0, label: "2,0 - Fratura de Ossos Grandes / Enfermidade Leve" },
  { value: 4.0, label: "4,0 - Fratura / Enfermidade Grave" },
  { value: 6.0, label: "6,0 - Perda de Um Membro ou Olho / Enfermidade Grave" },
  { value: 8.0, label: "8,0 - Perda de Dois Membros ou Olhos / Enfermidade Grave" },
  { value: 15.0, label: "15,0 - Fatalidade" }
];

const NP_OPTIONS = [
  { value: 1.0, label: "1,0 - 1-2 Pessoas" },
  { value: 2.0, label: "2,0 - 3-7 Pessoas" },
  { value: 4.0, label: "4,0 - 8-15 Pessoas" },
  { value: 8.0, label: "8,0 - 16-50 Pessoas" },
  { value: 12.0, label: "12,0 - Mais de 50 Pessoas" }
];

function getHRNClassification(score: number) {
  if (score <= 1.0) return { label: "Risco Desprezível", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", action: "Aceitável; monitorar continuamente." };
  if (score <= 5.0) return { label: "Risco Muito Baixo", color: "bg-teal-500/10 text-teal-500 border-teal-500/20", action: "Melhorar as condições se possível." };
  if (score <= 10.0) return { label: "Risco Baixo", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", action: "Requer ação a médio prazo." };
  if (score <= 50.0) return { label: "Risco Significante", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", action: "Requer ação técnica a curto prazo." };
  if (score <= 100.0) return { label: "Risco Alto", color: "bg-red-500/10 text-red-500 border-red-500/20", action: "Requer ação imediata e urgente." };
  if (score <= 500.0) return { label: "Risco Muito Alto", color: "bg-rose-600/10 text-rose-600 border-rose-600/20", action: "Parar a atividade operacional até a devida correção." };
  if (score <= 1000.0) return { label: "Risco Extremo", color: "bg-purple-600/10 text-purple-600 border-purple-600/20 animate-pulse", action: "INTERDITAR — Perigo grave e iminente no local." };
  return { label: "Risco Inaceitável", color: "bg-red-700/10 text-red-700 border-red-700/20 animate-ping", action: "INTERDIÇÃO IMEDIATA — Risco iminente de perda de vida." };
}

// --- NBR 14153 CATEGORIZATION ---
function getNBR14153Category(s: string, f: string, p: string) {
  if (s === "S1") {
    if (f === "F1") return { cat: "B", text: "Categoria B: Adequada para sistemas simples de comando relacionados à segurança. A ocorrência de uma falha única pode levar à perda da função de segurança, porém o ferimento esperado é leve e totalmente reversível." };
    return { cat: "1", text: "Categoria 1: Exige que componentes bem ensaiados e princípios de segurança bem estabelecidos sejam aplicados. Oferece resistência maior a falhas, adequada para exposições frequentes com baixa gravidade." };
  } else {
    if (f === "F1") {
      if (p === "P1") return { cat: "2", text: "Categoria 2: Requer verificação periódica da função de segurança pelo sistema de controle. Uma falha pode levar à perda da segurança entre os intervalos de teste, adequada para riscos graves com exposição rara." };
      return { cat: "3", text: "Categoria 3: Estrutura redundante de canal duplo. Projetada de tal forma que uma falha isolada em qualquer de suas partes não leve à perda da função de segurança. Sempre que praticável, a falha isolada deve ser detectada." };
    } else {
      if (p === "P1") return { cat: "3", text: "Categoria 3: Estrutura redundante de canal duplo. Projetada de tal forma que uma falha isolada em qualquer de suas partes não leve à perda da função de segurança. Sempre que praticável, a falha isolada deve ser detectada." };
      return { cat: "4", text: "Categoria 4: Nível máximo de segurança física e lógica. Uma falha isolada não compromete a segurança e o acúmulo de falhas não detectadas também não anula a barreira. Auto-monitoramento contínuo por relés de segurança." };
    }
  }
}

// --- DEFAULT REPORT SECTIONS ---
function generateSectionDrafts(params: any) {
  const eq = params.equipmentName || "Equipamento Industrial";
  const num = params.laudoNumber || "LNR12-2026";
  const cli = params.clientName || "Empresa Contratante S/A";
  const city = params.inspectionCity || "Recife";
  const rawDate = params.inspectionDate || "27/06/2026";
  const date = rawDate.includes("-") ? rawDate.split("-").reverse().join("/") : rawDate;

  return {
    secao_1: `Este Laudo Técnico de Apreciação de Riscos e Diagnóstico de Conformidade visa avaliar as condições de segurança operacional do equipamento "${eq}", sob a égide da Norma Regulamentadora Nº 12 (NR-12) do Ministério do Trabalho e Emprego, e em estrito alinhamento com a ABNT NBR ISO 12100:2013. A metodologia adotada compreende a inspeção física detalhada in loco, análise de documentações técnicas, identificação de perigos biomecânicos e elétricos, e classificação quantitativa do nível de risco residual através do Hazard Rating Number (HRN).`,
    
    secao_2: `O presente estudo técnico foi contratado pela empresa ${cli}, inscrita no CNPJ sob o número ${params.cnpj || "Não informado"}, sediada no endereço: ${params.address || "Não informado"}. A planta industrial apresenta processos de manufatura continuada, submetendo seus ativos a ciclos de trabalho severos, exigindo uma auditoria periódica para salvaguardar a integridade física dos trabalhadores e assegurar o cumprimento integral da legislação trabalhista nacional.`,
    
    secao_3: `A elaboração e responsabilidade jurídica deste laudo pericial competem à empresa VL Engenharia. O Responsável Técnico designado é o Engenheiro Mecânico Vitor Leonardo, inscrito no Conselho Regional de Engenharia e Agronomia de Pernambuco sob o registro CREA-PE 1822299490. A VL Engenharia é especializada em consultoria de segurança de máquinas, elaboração de prontuários técnicos de caldeiras e vasos de pressão (NR-13), laudos elétricos (NR-10), e projetos de adequação estrutural industrial. Contato: vitorleonardocl@gmail.com | (81) 98444-2592.`,
    
    secao_5: `Para a consolidação das análises e pareceres emitidos neste documento técnico pericial, foram consultados e auditados os seguintes itens:
1. Registros fotográficos e observação operacional direta do equipamento in loco em ${city} no dia ${date}.
2. Prontuários e ordens de serviço de manutenção preditiva/corretiva disponibilizados.
3. Entrevistas formais com os operadores responsáveis pelo equipamento técnico.
4. Esquemas elétricos e esquemáticos estruturais disponíveis na data da vistoria técnica.`,
    
    secao_6: `As diretrizes legais e normas técnicas harmonizadas aplicadas para dar suporte à perícia e às recomendações deste laudo compreendem:
- NR-12 (Portaria MTE n.º 916/2019): Segurança no Trabalho em Máquinas e Equipamentos.
- ABNT NBR ISO 12100:2013: Segurança de Máquinas - Princípios Gerais de Projeto - Apreciação e Redução de Riscos.
- ABNT NBR 14153:2013: Segurança de Máquinas - Partes de Sistemas de Comando Relacionadas à Segurança.
- ABNT NBR ISO 14120:2015: Segurança de Máquinas - Proteções (Fixas e Móveis) - Requisitos para Projeto.
- ABNT NBR 5410:2004: Instalações Elétricas de Baixa Tensão.
- ISO 13850:2015: Parada de Emergência - Princípios de Projeto.`,
    
    secao_7: `A análise de riscos foi conduzida utilizando a Metodologia quantitativa Hazard Rating Number (HRN), calculada através da fórmula matemática estrutural:
HRN = LO × FE × DPH × NP
Onde:
- LO (Likelihood of Occurrence): Probabilidade de ocorrência do evento perigoso.
- FE (Frequency of Exposure): Frequência e tempo de exposição ao perigo do operador.
- DPH (Degree of Possible Harm): Grau de possível lesão física resultante da falha de proteção.
- NP (Number of Persons): Número de pessoas expostas simultaneamente ao perigo na zona de atuação.
A classificação resultante estabelece a priorização das intervenções mecânicas ou eletroeletrônicas necessárias de acordo com o score obtido.`,
    
    secao_17: `Esta inspeção técnica e as conclusões dela resultantes limitam-se estritamente às condições físicas, visuais e de engenharia observadas na data de inspeção técnica in loco. Não foi possível confirmar este requisito apenas por meio da inspeção visual, sendo necessária verificação presencial ou documental para os seguintes aspectos técnicos complementares:
1. Integridade interna de reservatórios ocultos e vasos de pressão auxiliares.
2. Medição da espessura de chapas estruturais por ensaio de ultrassom (END-UT).
3. Teste de resistência de isolamento elétrico interno dos cabos utilizando megôhmmetro (Megger).
4. Ensaio de resistência de aterramento elétrico das carcaças através de terrômetro calibrado.
5. Dosimetria de ruído ocupacional contínuo realizada por higienista profissional certificado.`
  };
}

// --- CHECKLIST QUESTIONS ---
const NR12_CHECKLIST_TEMPLATE = [
  { id: "chk_1", text: "Possui plano de manutenção documentado e atualizado?", ref: "12.11.1" },
  { id: "chk_2", text: "Possui sinalização de segurança física, visível e em português?", ref: "12.12.1" },
  { id: "chk_3", text: "Possui informações técnicas visíveis em placa indestrutível de fabricante?", ref: "12.12.7" },
  { id: "chk_4", text: "Possui manual de instrução e segurança da máquina no estabelecimento?", ref: "12.13.1" },
  { id: "chk_5", text: "Os operadores receberam capacitação e treinamento documentados?", ref: "12.16.2" },
  { id: "chk_6", text: "Possui barreiras/proteções físicas eficazes em todas as partes móveis?", ref: "12.38" },
  { id: "chk_7", text: "Possui dispositivo de parada de emergência monitorado por relé?", ref: "12.56" },
  { id: "chk_8", text: "As instalações elétricas internas encontram-se adequadamente blindadas?", ref: "12.3" },
  { id: "chk_9", text: "Possui aterramento elétrico devidamente identificável nas carcaças?", ref: "12.3.2" },
  { id: "chk_10", text: "Mantém as distâncias de segurança adequadas na área de circulação?", ref: "12.38" },
  { id: "chk_11", text: "Existe controle técnico ou físico de acesso às zonas internas de perigo?", ref: "12.5.1" },
  { id: "chk_12", text: "Possui Prontuário Técnico do Equipamento assinado por Profissional Habilitado?", ref: "12.131" }
];

export default function LaudoNR12Indep({ onBack, initialPrefilled = false, clients }: { onBack?: () => void, initialPrefilled?: boolean, clients?: ClientData[] }) {
  const [activeTab, setActiveTab] = useState<"form" | "pricing" | "preview">("form");

  // Automatically prefill and show preview if requested
  useEffect(() => {
    if (initialPrefilled) {
      generateExampleReport();
      setActiveTab("preview");
    }
  }, [initialPrefilled]);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    capa: true,
    carta: true,
    sumario: true,
    secao1: true,
    secao2: true,
    secao3: true,
    secao4: true,
    secao5: true,
    secao6: true,
    secao7: true,
    secao8: true,
    secao9: true,
    secao11: true,
    secao12: true,
    secao13: true,
    secao15: true,
    secao16: true,
    secao17: true,
  });

  const ALL_SECTIONS = [
    { id: "secao1", key: "secao1", title: "Introdução, Escopo e Objetivos do Laudo" },
    { id: "secao2", key: "secao2", title: "Identificação do Estabelecimento Contratante" },
    { id: "secao3", key: "secao3", title: "Qualificação Técnica da Empresa Contratada (VL Engenharia)" },
    { id: "secao4", key: "secao4", title: "Dados Técnicos de Fabricação do Equipamento" },
    { id: "secao5", key: "secao5", title: "Documentos Técnicos Analisados na Perícia" },
    { id: "secao6", key: "secao6", title: "Normas Regulamentadoras e Legislações Aplicáveis" },
    { id: "secao7", key: "secao7", title: "Metodologia Quantitativa Hazard Rating Number (HRN)" },
    { id: "secao8", key: "secao8", title: "Relatório de Inspeção Visual e Fotográfica" },
    { id: "secao9", key: "secao9", title: "Checklist de Conformidade com a NR-12" },
    { id: "secao11", key: "secao11", title: "Categorização dos Sistemas de Comando (NBR 14153)" },
    { id: "secao12", key: "secao12", title: "Apreciação de Riscos — Classificação HRN" },
    { id: "secao13", key: "secao13", title: "Laudo de Não Conformidades Regulamentares" },
    { id: "secao15", key: "secao15", title: "Cronograma de Plano de Ação Recomendado" },
    { id: "secao16", key: "secao16", title: "Conclusão Pericial e Parecer Conclusivo" },
    { id: "secao17", key: "secao17", title: "Limitações e Observações de Campo" },
  ];

  const activeSections = ALL_SECTIONS.filter(s => printConfig[s.key as keyof typeof printConfig] === true);
  const sectionNumbers: Record<string, number> = {};
  activeSections.forEach((s, idx) => {
    sectionNumbers[s.id] = idx + 1;
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // --- GENERAL PARAMETERS STATE ---
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LAR-010/2026 Rev. 00",
    clientName: "Metalúrgica Planalto Nordeste S.A.",
    cnpj: "09.123.456/0001-88",
    address: "Av. Governador Agamenon Magalhães, 2500, Recife - PE",
    equipmentName: "Prensa Excêntrica de Engrenagem Helicoidal",
    brand: "Schuler Mecânica",
    model: "PE-150-T",
    serialNumber: "SCH-2015-8844",
    year: "2015",
    tag: "PR-EX-02",
    operators: "2 operadores por turno",
    power: "22",
    voltage: "380",
    inspectionDate: new Date().toISOString().split("T")[0],
    inspectionCity: "Recife",
    notes: "Equipamento opera com estampagem de chapas grossas. Apresenta pedal mecânico exposto e fiação elétrica antiga no painel de comando secundário.",
    coverImage: "",
    normasAdicionais: "ABNT NBR ISO 12100, ABNT NBR 14153, OSHA 1910.212",
    blankSignature: false
  });

  // --- CHECKLIST ANSWERS STATE ---
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, { answer: "SIM" | "NÃO" | "N/A"; note: string; image?: string }>>(
    NR12_CHECKLIST_TEMPLATE.reduce((acc, q) => {
      acc[q.id] = { answer: "NÃO", note: "Não foi possível confirmar este requisito apenas por meio da inspeção visual." };
      return acc;
    }, {} as any)
  );

  // --- HRN BEFORE SAFETY MEASURES ---
  const [hrnBefore, setHrnBefore] = useState({
    lo: 5.0,
    fe: 5.0,
    dph: 4.0,
    np: 1.0,
    score: 100.0,
    classification: "Risco Alto",
    explicacao: "Perigo de esmagamento severo nas transmissões mecânicas e zona de prensagem desprovida de cortina de luz integrada."
  });

  // --- HRN AFTER SAFETY MEASURES ---
  const [hrnAfter, setHrnAfter] = useState({
    lo: 0.033,
    fe: 5.0,
    dph: 4.0,
    np: 1.0,
    score: 0.66,
    classification: "Risco Desprezível",
    explicacao: "Após enclausuramento fixo mecânico das engrenagens e instalação de cortina de luz categoria 4 com redundância."
  });

  // --- NBR 14153 CATEGORIZATION ---
  const [nbrCategory, setNbrCategory] = useState({
    s: "S2",
    f: "F2",
    p: "P1",
    category: "3",
    explanation: "A categoria 3 é mandatória em virtude de riscos irreversíveis e permanentes na área mecânica exposta."
  });

  // --- MANUAL NÃO CONFORMIDADES ---
  const [naoConformidades, setNaoConformidades] = useState<Array<{ id: string; descricao: string; criticidade: string; risco: string; norma: string }>>([
    {
      id: "NC-01",
      descricao: "Inexistência de proteção física fixa ou móvel dotada de intertravamento na correia e polias de transmissão lateral do motor principal.",
      criticidade: "CRÍTICA",
      risco: "Aprisionamento / Cisalhamento de membros superiores",
      norma: "NR-12 item 12.38 / ABNT NBR ISO 14120"
    },
    {
      id: "NC-02",
      descricao: "Pedal de acionamento mecânico da prensa desprovido de protetor de pé contra acionamento acidental por queda de materiais.",
      criticidade: "ALTA",
      risco: "Descida inesperada do martelo / Esmagamento de mãos",
      norma: "NR-12 item 12.38"
    }
  ]);

  // --- PLANO DE AÇÃO ---
  const [planoAcao, setPlanoAcao] = useState<Array<{ id: string; problema: string; norma: string; recomendacao: string; prioridade: string; responsavel: string; prazo: string }>>([
    {
      id: "AP-01",
      problema: "Polias e correias de transmissão expostas",
      norma: "NR-12 item 12.38",
      recomendacao: "Fabricar e instalar grade fixa de proteção em aço carbono rígido estrutural, parafusada e de remoção somente via ferramentas de segurança.",
      prioridade: "IMEDIATO",
      responsavel: "Equipe de Manutenção / Engenharia VL",
      prazo: "10 dias"
    },
    {
      id: "AP-02",
      problema: "Pedal de acionamento sem guarda física",
      norma: "NR-12 item 12.38",
      recomendacao: "Instalar carenagem robusta de proteção metálica sobre o pedal de acionamento mecânico, garantindo acesso exclusivo ao pé do operador.",
      prioridade: "CURTO PRAZO",
      responsavel: "VL Engenharia / Manutenção Elétrica",
      prazo: "15 dias"
    }
  ]);

  // --- CONCLUSÃO TÉCNICA ---
  const [conclusaoStatus, setConclusaoStatus] = useState<"CONFORME" | "NÃO CONFORME" | "CONFORME COM RESTRIÇÕES">("NÃO CONFORME");
  const [conclusaoParecer, setConclusaoParecer] = useState(
    "Com base nas análises visuais e periciais realizadas, o equipamento encontra-se NÃO CONFORME frente aos requisitos fundamentais de segurança estabelecidos pela Portaria 916/2019 da NR-12. Há necessidade urgente de interdição técnica local preventiva das operações mecânicas até que as guardas físicas e os botões de emergência estejam adequados conforme o Plano de Ação apresentado."
  );

  // --- SEÇÕES DO LAUDO ---
  const [secoesLaudo, setSecoesLaudo] = useState<Record<string, string>>({});

  // Trigger dynamic default interpolation on startup
  useEffect(() => {
    setSecoesLaudo(generateSectionDrafts(laudoParams));
  }, [laudoParams]);

  // Handle HRN calculations in real-time
  useEffect(() => {
    const scoreB = parseFloat((hrnBefore.lo * hrnBefore.fe * hrnBefore.dph * hrnBefore.np).toFixed(2));
    const classB = getHRNClassification(scoreB);
    setHrnBefore(prev => ({ ...prev, score: scoreB, classification: classB.label }));
  }, [hrnBefore.lo, hrnBefore.fe, hrnBefore.dph, hrnBefore.np]);

  useEffect(() => {
    const scoreA = parseFloat((hrnAfter.lo * hrnAfter.fe * hrnAfter.dph * hrnAfter.np).toFixed(2));
    const classA = getHRNClassification(scoreA);
    setHrnAfter(prev => ({ ...prev, score: scoreA, classification: classA.label }));
  }, [hrnAfter.lo, hrnAfter.fe, hrnAfter.dph, hrnAfter.np]);

  // Handle NBR 14153 trigger
  useEffect(() => {
    const res = getNBR14153Category(nbrCategory.s, nbrCategory.f, nbrCategory.p);
    setNbrCategory(prev => ({ ...prev, category: res.cat, explanation: res.text }));
  }, [nbrCategory.s, nbrCategory.f, nbrCategory.p]);

  // --- IMAGE UPLOADING UTILS ---
  const compressImage = (file: File, maxWidth = 640, maxHeight = 640, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      compressImage(file)
        .then((compressedBase64) => {
          setUploadedImages((prev: UploadedImage[]) => [
            ...prev,
            {
              name: file.name,
              data: compressedBase64,
              description: "Fotografia técnica demonstrando detalhes do equipamento durante a auditoria."
            }
          ]);
        })
        .catch((err) => {
          console.error("Compression failed, using fallback reader:", err);
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedImages((prev: UploadedImage[]) => [
              ...prev,
              {
                name: file.name,
                data: reader.result as string,
                description: "Fotografia técnica demonstrando detalhes do equipamento durante a auditoria."
              }
            ]);
          };
          reader.readAsDataURL(file);
        });
    });
  };

  // --- GEMINI CO-PILOT INTEGRATOR ---
  const handleAICopilotTrigger = async () => {
    setLoadingAI(true);
    try {
      // Limit to first 3 images to save bandwidth and prevent exceeding Vercel's payload limits
      const base64ImagesPayload = uploadedImages.slice(0, 3).map(img => ({
        data: img.data,
        mimeType: img.data.split(";")[0].split(":")[1] || "image/jpeg"
      }));

      const res = await fetch("/api/gemini/nr12-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...laudoParams,
          equipmentDesc: aiPrompt || laudoParams.notes,
          images: base64ImagesPayload
        })
      });

      if (!res.ok) {
        let errMsg = "Falha ao comunicar com o servidor de Inteligência.";
        try {
          const rawText = await res.text();
          try {
            const errData = JSON.parse(rawText);
            if (errData && errData.error) {
              errMsg += " Detalhes: " + errData.error;
            } else {
              errMsg += ` (Status: ${res.status}) - ${rawText.substring(0, 150)}`;
            }
          } catch (_) {
            errMsg += ` (Status: ${res.status}) - ${rawText.substring(0, 150)}`;
          }
        } catch (_) {
          errMsg += ` (Status: ${res.status})`;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      // Update states with highly comprehensive expert returns
      if (data.numero) {
        setLaudoParams(prev => ({ ...prev, laudoNumber: data.numero }));
      }
      if (data.checklist) {
        const updatedChecklist = { ...checklistAnswers };
        Object.entries(data.checklist).forEach(([k, val]: any) => {
          if (updatedChecklist[k]) {
            updatedChecklist[k] = { answer: val.resposta, note: val.note };
          }
        });
        setChecklistAnswers(updatedChecklist);
      }
      if (data.hrn_before) {
        setHrnBefore(prev => ({
          ...prev,
          lo: data.hrn_before.lo,
          fe: data.hrn_before.fe,
          dph: data.hrn_before.dph,
          np: data.hrn_before.np,
          explicacao: data.hrn_before.explicacao
        }));
      }
      if (data.hrn_after) {
        setHrnAfter(prev => ({
          ...prev,
          lo: data.hrn_after.lo,
          fe: data.hrn_after.fe,
          dph: data.hrn_after.dph,
          np: data.hrn_after.np,
          explicacao: data.hrn_after.explicacao
        }));
      }
      if (data.nbr14153) {
        setNbrCategory(prev => ({
          ...prev,
          s: data.nbr14153.s,
          f: data.nbr14153.f,
          p: data.nbr14153.p,
          explanation: data.nbr14153.explanation
        }));
      }
      if (data.nao_conformidades) {
        setNaoConformidades(data.nao_conformidades);
      }
      if (data.plano_acao) {
        setPlanoAcao(data.plano_acao);
      }
      if (data.conclusao) {
        setConclusaoStatus(data.conclusao.status);
        setConclusaoParecer(data.conclusao.parecer);
      }
      if (data.secoes) {
        setSecoesLaudo(prev => ({
          ...prev,
          secao_1: data.secoes.secao_1 || prev.secao_1,
          secao_2: data.secoes.secao_2 || prev.secao_2,
          secao_3: data.secoes.secao_3 || prev.secao_3,
          secao_5: data.secoes.secao_5 || prev.secao_5,
          secao_6: data.secoes.secao_6 || prev.secao_6,
          secao_7: data.secoes.secao_7 || prev.secao_7,
          secao_17: data.secoes.secao_17 || prev.secao_17
        }));
      }

      setAiPrompt("");
      setActiveTab("preview"); // direct user view to preview laudo after AI processes successfully!

    } catch (err: any) {
      console.error(err);
      alert(`Erro no assistente de auditoria inteligente: ${err.message || err}`);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const element = document.getElementById("laudo-nr12-printable-area");
      if (!element) return;

      // Add temporary body class for print styling
      document.body.classList.add("generating-pdf");

      // Clean stylesheets of oklch to avoid html2canvas crashing
      await preprocessStylesheets(element);

      // Set options - using margin: 5 combined with container's 12mm padding
      // yields exactly 17mm professional margins and avoids compressing columns.
      const opt = {
        margin:       5,
        filename:     `Laudo_${laudoParams.tag || "NR12"}_${laudoParams.laudoNumber.replace(/\//g, "-")}.pdf`,
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak:    { mode: ["avoid-all", "css", "legacy"] }
      };

      // Get or load html2pdf safely with multiple fallbacks
      let exporter = (window as any).html2pdf;
      if (!exporter) {
        // @ts-ignore
        exporter = html2pdf?.default || html2pdf;
      }

      if (typeof exporter !== "function") {
        // Dynamically load the bundled html2pdf.js from CDN to guarantee resolution
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
      // Restore styles and remove print layout class
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
      setIsDownloadingPdf(false);
    }
  };

  const generateExampleReport = () => {
    // 1. Popular parâmetros gerais com dados genéricos realistas
    setLaudoParams({
      laudoNumber: "LNR12-3209/2026-A",
      clientName: "METALÚRGICA PLANALTO NORDESTE S.A.",
      cnpj: "09.123.456/0001-88",
      address: "Av. Governador Agamenon Magalhães, 2500, Recife - PE",
      equipmentName: "Prensa Excêntrica de Engrenagem Helicoidal",
      brand: "Schuler Mecânica",
      model: "PE-150-T",
      serialNumber: "SCH-2015-8844",
      year: "2015",
      tag: "PR-EX-02",
      operators: "2 operadores por turno",
      power: "22",
      voltage: "380",
      inspectionDate: "2026-07-01",
      inspectionCity: "Recife",
      notes: "Equipamento de estampagem pesada. Encontra-se em excelente estado de conformidade após implantação integral das proteções físicas e sistemas de barreira óptica sob as diretrizes de Vitor Leonardo.",
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop"
    });

    // 2. Imagens reais (sem ser IA) de equipamentos/campo
    setUploadedImages([
      {
        name: "prensa_excentrica_schuler.jpg",
        data: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
        description: "Vista frontal da Prensa Excêntrica Schuler de 150T operando em conformidade com as cortinas de segurança ativas."
      },
      {
        name: "painel_comando.jpg",
        data: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=800&auto=format&fit=crop",
        description: "Painel de comando elétrico com relé de segurança e botão de emergência duplo canal devidamente aterrado."
      },
      {
        name: "protecoes_enclausuramento.jpg",
        data: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop",
        description: "Enclausuramento fixo da transmissão por polia e correia fabricado em chapa de aço rígida."
      }
    ]);

    // 3. Preencher checklist
    setChecklistAnswers({
      chk_1: { answer: "SIM", note: "Plano impresso de manutenção preventiva preventiva de 12 meses assinado." },
      chk_2: { answer: "SIM", note: "Placas amarelas de advertência de perigo de esmagamento bem posicionadas." },
      chk_3: { answer: "SIM", note: "Placa metálica de alumínio do fabricante Schuler com número de série e peso." },
      chk_4: { answer: "SIM", note: "Cópia encadernada do manual original em português disponível no armário do setor." },
      chk_5: { answer: "SIM", note: "Fichas de capacitação da NR-12 com carga horária de 16 horas ativas no RH." },
      chk_6: { answer: "SIM", note: "Grade de metal fixa enclausura toda a transmissão por polias do motor superior." },
      chk_7: { answer: "SIM", note: "Botões de emergência cogumelo de duplo canal integrados com relé categoria 4." },
      chk_8: { answer: "SIM", note: "Fiação nova em conduítes de PVC antichapa e caixa metálica blindada." },
      chk_9: { answer: "SIM", note: "Cabo terra verde conectado à carcaça do motor e medido com terrômetro." },
      chk_10: { answer: "SIM", note: "Demarcação amarela de circulação de 1.2m respeitada ao redor de toda a prensa." },
      chk_11: { answer: "SIM", note: "Cortina de luz de segurança impede descida do martelo se zona de perigo for invadida." },
      chk_12: { answer: "SIM", note: "Prontuário técnico emitido e arquivado assinado por Vitor Leonardo." }
    });

    // 4. Matrizes HRN
    setHrnBefore({
      lo: 5.0,
      fe: 5.0,
      dph: 4.0,
      np: 1.0,
      score: 100.0,
      classification: "Risco Alto",
      explicacao: "Perigo alto de esmagamento mecânico e aprisionamento nas áreas móveis sem sistemas de intertravamento ativo."
    });

    setHrnAfter({
      lo: 0.033,
      fe: 5.0,
      dph: 4.0,
      np: 1.0,
      score: 0.66,
      classification: "Risco Desprezível",
      explicacao: "Mitigação total das zonas de contato por meio de barreiras mecânicas fixas e cortinas de luz monitoradas."
    });

    // 5. Categoria
    setNbrCategory({
      s: "S2",
      f: "F2",
      p: "P1",
      category: "4",
      explanation: "Requisitos de categoria 4 de segurança cumpridos através de redundância total e monitoramento dinâmico de chaves."
    });

    // 6. Não conformidades resolvidas
    setNaoConformidades([
      {
        id: "NC-01",
        descricao: "Pequeno desgaste superficial na demarcação de piso na lateral esquerda da área de alimentação de chapas.",
        criticidade: "LEVE",
        risco: "Escorregamento menor de operador",
        norma: "NR-12 item 12.11"
      }
    ]);

    // 7. Plano de ação
    setPlanoAcao([
      {
        id: "AP-01",
        problema: "Demarcação de piso gasta",
        norma: "NR-12 item 12.11",
        recomendacao: "Realizar pintura de demarcação de piso amarela epóxi antiderrapante ao redor do equipamento perimetral.",
        prioridade: "LONGO PRAZO",
        responsavel: "Equipe de Manutenção de Instalações",
        prazo: "30 dias"
      }
    ]);

    // 8. Parecer
    setConclusaoStatus("CONFORME");
    setConclusaoParecer("Com base nas análises periciais e funcionais executadas sob as diretrizes legais da NR-12, atesta-se que o equipamento Prensa Excêntrica Schuler PR-EX-02 encontra-se TOTALMENTE CONFORME frente aos quesitos da Portaria MTE 916/2019. O ativo está APTO para operar sem restrições de segurança física.");

    // 9. Mudar de aba
    setActiveTab("preview");
  };

  return (
    <div className={
      isFullscreen
        ? "fixed inset-0 z-[999] bg-slate-50 dark:bg-slate-900 w-screen h-screen text-slate-800 dark:text-slate-100 flex flex-col overflow-y-auto"
        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl font-sans min-h-screen text-slate-800 dark:text-slate-100 flex flex-col"
    }>
      {/* Upper Navigation Header */}
      <div className="bg-[#0B2545] p-6 text-white border-b-2 border-[#134074] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-white/10 text-emerald-400 rounded-2xl shadow-lg border border-white/5">
            <Shield className="w-7 h-7" />
          </span>
          <div className="text-left leading-none">
            <h2 className="text-xl font-bold tracking-tight font-sans text-white pt-1">Laudo NR-12 Autônomo</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={generateExampleReport}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 border border-emerald-500 shadow-md animate-bounce"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Gerar Modelo Exemplo</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 border border-white/10"
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 border border-white/10 animate-pulse"
            title={isFullscreen ? "Minimizar visualização" : "Expandir em Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
            <span>{isFullscreen ? "Minimizar" : "Tela Cheia"}</span>
          </button>

          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "form" 
                ? "bg-white text-slate-950 shadow-md" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            Editar Dados / Checklist
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pricing" 
                ? "bg-emerald-500 text-white shadow-md" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            Precificação
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "preview" 
                ? "bg-white text-slate-950 shadow-md" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            Visualizar Laudo Oficial
          </button>
        </div>
      </div>

      {activeTab === "form" && (
        <div className="p-6 md:p-8 flex-grow grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main data input forms */}
          <div className="xl:col-span-8 space-y-8 max-w-full">
            
            {/* 1. General Identification parameters */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#134074]" />
                <span>Identificação Geral do Laudo</span>
              </h3>

              {/* Client Selection Dropdown */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-left">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Número do Laudo / Ref</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.laudoNumber}
                    onChange={e => setLaudoParams({ ...laudoParams, laudoNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Empresa Contratante</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.clientName}
                    onChange={e => setLaudoParams({ ...laudoParams, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">CNPJ / CPF</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.cnpj}
                    onChange={e => setLaudoParams({ ...laudoParams, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Endereço da Planta</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.address}
                    onChange={e => setLaudoParams({ ...laudoParams, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-left pt-2 border-t border-slate-100 dark:border-slate-900">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Nome da Máquina</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.equipmentName}
                    onChange={e => setLaudoParams({ ...laudoParams, equipmentName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Fabricante / Marca</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.brand}
                    onChange={e => setLaudoParams({ ...laudoParams, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Modelo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.model}
                    onChange={e => setLaudoParams({ ...laudoParams, model: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Número de Série</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.serialNumber}
                    onChange={e => setLaudoParams({ ...laudoParams, serialNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Ano Fabricação</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.year}
                    onChange={e => setLaudoParams({ ...laudoParams, year: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">TAG Ativo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.tag}
                    onChange={e => setLaudoParams({ ...laudoParams, tag: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Operadores</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.operators}
                    onChange={e => setLaudoParams({ ...laudoParams, operators: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Potência (kW)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.power}
                    onChange={e => setLaudoParams({ ...laudoParams, power: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-left">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Cidade da Inspeção</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.inspectionCity}
                    onChange={e => setLaudoParams({ ...laudoParams, inspectionCity: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Data da Inspeção</label>
                  <input
                    type="date"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none text-slate-800 dark:text-slate-100"
                    value={laudoParams.inspectionDate}
                    onChange={e => setLaudoParams({ ...laudoParams, inspectionDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Normas Técnicas Adicionais */}
              <div className="space-y-1 text-xs font-medium text-left">
                <label className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  placeholder="Ex: ABNT NBR ISO 12100, ABNT NBR 14153, OSHA 1910.212, etc."
                  className="w-full border dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-xs"
                  value={laudoParams.normasAdicionais || ""}
                  onChange={e => setLaudoParams({ ...laudoParams, normasAdicionais: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Opção de Assinatura em Branco */}
              <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-left">
                <input
                  type="checkbox"
                  id="blankSignature"
                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  checked={laudoParams.blankSignature}
                  onChange={e => setLaudoParams({ ...laudoParams, blankSignature: e.target.checked })}
                />
                <label htmlFor="blankSignature" className="text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Gerar campo de assinatura em branco (para assinatura manual posterior ou de terceiros)
                </label>
              </div>

              {/* Campo para importar foto para a capa */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Foto de Destaque da Capa do Laudo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border dark:border-slate-800">
                  {laudoParams.coverImage ? (
                    <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden border">
                      <img src={laudoParams.coverImage} className="w-full h-full object-cover" alt="Cover preview" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setLaudoParams({ ...laudoParams, coverImage: "" })}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-48 h-28 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border text-slate-300">
                      <FileText className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-normal">
                      Selecione uma imagem para a capa do laudo NR-12. Ela será exibida no centro da capa profissional do PDF.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Selecionar Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLaudoParams(prev => ({ ...prev, coverImage: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Checklist NR-12 */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] border-b pb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Checklist Obrigatório NR-12</span>
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded">12 Requisitos</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] uppercase font-mono text-slate-400">
                      <th className="pb-3 pl-1">Item Norma</th>
                      <th className="pb-3">Requisito Obrigatório</th>
                      <th className="pb-3 text-center">Conformidade</th>
                      <th className="pb-3 pl-4">Nota de Campo / Auditoria</th>
                      <th className="pb-3 text-center w-32">Foto Anexa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {NR12_CHECKLIST_TEMPLATE.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 pl-1 font-mono font-bold text-slate-500">{item.ref}</td>
                        <td className="py-3 pr-4 max-w-xs font-semibold leading-relaxed">{item.text}</td>
                        <td className="py-3 text-center">
                          <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                            {(["SIM", "NÃO", "N/A"] as const).map((opt) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  setChecklistAnswers({
                                    ...checklistAnswers,
                                    [item.id]: { ...checklistAnswers[item.id], answer: opt }
                                  });
                                }}
                                className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                  checklistAnswers[item.id]?.answer === opt
                                    ? opt === "SIM"
                                      ? "bg-emerald-500 text-white shadow-sm"
                                      : opt === "NÃO"
                                      ? "bg-rose-500 text-white shadow-sm"
                                      : "bg-slate-500 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 pl-4">
                          <input
                            type="text"
                            value={checklistAnswers[item.id]?.note || ""}
                            onChange={e => {
                              setChecklistAnswers({
                                ...checklistAnswers,
                                [item.id]: { ...checklistAnswers[item.id], note: e.target.value }
                              });
                            }}
                            placeholder="Adicione observações periciais de conformidade..."
                            className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none"
                          />
                        </td>
                        <td className="py-3 pl-4 text-center">
                          {checklistAnswers[item.id]?.image ? (
                            <div className="relative group inline-block">
                              <img src={checklistAnswers[item.id]?.image} className="w-12 h-12 object-cover rounded-lg border shadow-sm hover:scale-110 transition-all cursor-zoom-in" />
                              <button
                                type="button"
                                onClick={() => {
                                  setChecklistAnswers({
                                    ...checklistAnswers,
                                    [item.id]: { ...checklistAnswers[item.id], image: undefined }
                                  });
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow-md"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1 cursor-pointer px-2 py-1 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-400 font-mono text-[9px] uppercase font-bold transition-all w-24 mx-auto">
                              <Upload className="w-3 h-3 text-slate-400" />
                              <span>Anexar</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setChecklistAnswers({
                                        ...checklistAnswers,
                                        [item.id]: { ...checklistAnswers[item.id], image: reader.result as string }
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Hazard Rating Number (HRN) - Quantitative Risk Appreciation */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] border-b pb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#134074]" />
                <span>Metodologia HRN — Apreciação Quantitativa de Risco (ISO 12100)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Situation 1: Current risk */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 text-left">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black font-mono uppercase text-rose-500">A) Situação Atual (Sem salvaguardas)</h4>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getHRNClassification(hrnBefore.score).color}`}>
                      {getHRNClassification(hrnBefore.score).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">LO - Probabilidade de Ocorrência</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnBefore.lo}
                        onChange={e => setHrnBefore({ ...hrnBefore, lo: parseFloat(e.target.value) })}
                      >
                        {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">FE - Frequência de Exposição</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnBefore.fe}
                        onChange={e => setHrnBefore({ ...hrnBefore, fe: parseFloat(e.target.value) })}
                      >
                        {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">DPH - Grau de Possível Lesão</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnBefore.dph}
                        onChange={e => setHrnBefore({ ...hrnBefore, dph: parseFloat(e.target.value) })}
                      >
                        {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">NP - Pessoas Expostas</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnBefore.np}
                        onChange={e => setHrnBefore({ ...hrnBefore, np: parseFloat(e.target.value) })}
                      >
                        {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border flex items-center justify-between mt-2">
                      <span className="font-mono text-xs font-black">CÁLCULO HRN ATUAL:</span>
                      <span className="text-base font-black font-mono text-rose-500">{hrnBefore.score}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">Descrição Física Observada</label>
                      <textarea
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        rows={2}
                        value={hrnBefore.explicacao}
                        onChange={e => setHrnBefore({ ...hrnBefore, explicacao: e.target.value })}
                        placeholder="Detalhamento operacional da situação atual..."
                      />
                    </div>
                  </div>
                </div>

                {/* Situation 2: Recommended risk after controls */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 text-left">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black font-mono uppercase text-emerald-500">B) Situação Recomendada (Com proteção)</h4>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getHRNClassification(hrnAfter.score).color}`}>
                      {getHRNClassification(hrnAfter.score).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">LO - Probabilidade de Ocorrência</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnAfter.lo}
                        onChange={e => setHrnAfter({ ...hrnAfter, lo: parseFloat(e.target.value) })}
                      >
                        {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">FE - Frequência de Exposição</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnAfter.fe}
                        onChange={e => setHrnAfter({ ...hrnAfter, fe: parseFloat(e.target.value) })}
                      >
                        {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">DPH - Grau de Possível Lesão</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnAfter.dph}
                        onChange={e => setHrnAfter({ ...hrnAfter, dph: parseFloat(e.target.value) })}
                      >
                        {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">NP - Pessoas Expostas</label>
                      <select
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        value={hrnAfter.np}
                        onChange={e => setHrnAfter({ ...hrnAfter, np: parseFloat(e.target.value) })}
                      >
                        {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border flex items-center justify-between mt-2">
                      <span className="font-mono text-xs font-black">CÁLCULO HRN APÓS MEDIDAS:</span>
                      <span className="text-base font-black font-mono text-emerald-500">{hrnAfter.score}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">Descrição Pós-Adequação</label>
                      <textarea
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        rows={2}
                        value={hrnAfter.explicacao}
                        onChange={e => setHrnAfter({ ...hrnAfter, explicacao: e.target.value })}
                        placeholder="Como o risco é mitigado pelas proteções recomendadas..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. NBR 14153 safety category */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] border-b pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#134074]" />
                <span>Classificação das Partes de Comando Relacionadas à Segurança (ABNT NBR 14153)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-left">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">S - Severidade do Ferimento</label>
                  <select
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                    value={nbrCategory.s}
                    onChange={e => setNbrCategory({ ...nbrCategory, s: e.target.value })}
                  >
                    <option value="S1">S1 - Ferimento Leve (Normalmente reversível)</option>
                    <option value="S2">S2 - Ferimento Sério (Irreversível, incluindo amputações e morte)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">F - Frequência / Tempo de Exposição</label>
                  <select
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                    value={nbrCategory.f}
                    onChange={e => setNbrCategory({ ...nbrCategory, f: e.target.value })}
                  >
                    <option value="F1">F1 - Raro a relativamente frequente e/ou baixo tempo de exposição</option>
                    <option value="F2">F2 - Frequente até contínuo e/ou tempo de exposição longo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">P - Possibilidade de Evitar o Perigo</label>
                  <select
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                    value={nbrCategory.p}
                    onChange={e => setNbrCategory({ ...nbrCategory, p: e.target.value })}
                  >
                    <option value="P1">P1 - Possível evitar sob condições específicas</option>
                    <option value="P2">P2 - Quase nunca possível evitar</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase text-[#0B2545] dark:text-[#4895EF]">Categoria Identificada:</span>
                  <span className="text-sm font-black font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Categoria {nbrCategory.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">{nbrCategory.explanation}</p>
              </div>
            </div>

            {/* 5. Não Conformidades e Plano de Ação */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Não Conformidades & Plano de Ação</span>
                </h3>
                <button
                  onClick={() => {
                    const newId = `NC-0${naoConformidades.length + 1}`;
                    setNaoConformidades([...naoConformidades, { id: newId, descricao: "Nova não conformidade mecânica ou elétrica...", criticidade: "ALTA", risco: "Esmagamento", norma: "NR-12 item 12.38" }]);
                    setPlanoAcao([...planoAcao, { id: `AP-0${planoAcao.length + 1}`, problema: "Novo item", norma: "NR-12", recomendacao: "Instalar carenagem", prioridade: "IMEDIATO", responsavel: "Engenheiro", prazo: "15 dias" }]);
                  }}
                  className="flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#134074] text-white px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inserir NC</span>
                </button>
              </div>

              <div className="space-y-4">
                {naoConformidades.map((nc, idx) => (
                  <div key={nc.id} className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/50 text-left text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0B2545] dark:text-[#4895EF] text-sm">{nc.id}</span>
                      <button
                        onClick={() => {
                          setNaoConformidades(naoConformidades.filter(item => item.id !== nc.id));
                          setPlanoAcao(planoAcao.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Deletar Não Conformidade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-mono text-slate-400">Descrição da Infração Observada</label>
                        <input
                          type="text"
                          value={nc.descricao}
                          onChange={e => {
                            const arr = [...naoConformidades];
                            arr[idx].descricao = e.target.value;
                            setNaoConformidades(arr);
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-950 border rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400">Criticidade</label>
                        <select
                          value={nc.criticidade}
                          onChange={e => {
                            const arr = [...naoConformidades];
                            arr[idx].criticidade = e.target.value;
                            setNaoConformidades(arr);
                          }}
                          className="w-full p-1.5 bg-white dark:bg-slate-950 border rounded-lg text-xs font-bold"
                        >
                          <option value="CRÍTICA">CRÍTICA (Perigo Grave Iminente)</option>
                          <option value="ALTA">ALTA (Adequação urgente)</option>
                          <option value="MÉDIA">MÉDIA (Prazo padrão)</option>
                          <option value="BAIXA">BAIXA (Monitoramento)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400">Item Exato da Norma</label>
                        <input
                          type="text"
                          value={nc.norma}
                          onChange={e => {
                            const arr = [...naoConformidades];
                            arr[idx].norma = e.target.value;
                            setNaoConformidades(arr);
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-950 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Associated action plan item */}
                    {planoAcao[idx] && (
                      <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                        <h5 className="font-mono font-bold text-[10px] text-emerald-500 uppercase">Ação Recomendada (Plano de Ação Relacionado)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-mono text-slate-400">Medida de Controle Técnica Recomendada (Hierarquia de Controle)</label>
                            <input
                              type="text"
                              value={planoAcao[idx].recomendacao}
                              onChange={e => {
                                const arr = [...planoAcao];
                                arr[idx].recomendacao = e.target.value;
                                setPlanoAcao(arr);
                              }}
                              className="w-full p-2 bg-white dark:bg-slate-950 border rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-400">Responsável</label>
                            <input
                              type="text"
                              value={planoAcao[idx].responsavel}
                              onChange={e => {
                                const arr = [...planoAcao];
                                arr[idx].responsavel = e.target.value;
                                setPlanoAcao(arr);
                              }}
                              className="w-full p-2 bg-white dark:bg-slate-950 border rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-400">Prazo Sugerido</label>
                            <input
                              type="text"
                              value={planoAcao[idx].prazo}
                              onChange={e => {
                                const arr = [...planoAcao];
                                arr[idx].prazo = e.target.value;
                                setPlanoAcao(arr);
                              }}
                              className="w-full p-2 bg-white dark:bg-slate-950 border rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Conclusão Técnica */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-[#0B2545] dark:text-[#4895EF] border-b pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#134074]" />
                <span>Parecer Conclusivo Técnico do Auditor</span>
              </h3>

              <div className="space-y-4 text-xs font-medium text-left">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Enquadramento Geral de Segurança</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {(["CONFORME", "NÃO CONFORME", "CONFORME COM RESTRIÇÕES"] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setConclusaoStatus(opt)}
                        className={`flex-grow p-3 rounded-xl border text-center font-bold tracking-wider font-mono text-xs uppercase transition-all cursor-pointer ${
                          conclusaoStatus === opt
                            ? opt === "CONFORME"
                              ? "bg-emerald-500 text-white border-emerald-500 shadow"
                              : opt === "NÃO CONFORME"
                              ? "bg-rose-500 text-white border-rose-500 shadow"
                              : "bg-amber-500 text-white border-amber-500 shadow"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Parecer Técnico Fundamentado</label>
                  <textarea
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold leading-relaxed focus:outline-none"
                    rows={4}
                    value={conclusaoParecer}
                    onChange={e => setConclusaoParecer(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar: AI Auditor Co-pilot and File Upload */}
          <div className="xl:col-span-4 space-y-8 max-w-full">
            
            {/* AI Auditor Co-Pilot Tool */}
            <div className="bg-[#05162E] text-white p-6 rounded-2xl border-2 border-[#134074] space-y-5 text-left relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-40 h-40 text-[#4895EF]" />
              </div>

              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Wand2 className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#4895EF] uppercase">ASSISTENTE PERICIAL</span>
                  <h4 className="text-sm font-bold tracking-tight">IA Gemini VL Engenharia</h4>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Insira descrições operacionais ou fotos do equipamento e deixe o Gemini auditar a máquina, preenchendo automaticamente o checklist, calculando o HRN e elaborando as 18 seções regulamentares.
              </p>

              <div className="space-y-3.5">
                <textarea
                  className="w-full p-3 rounded-xl border border-white/15 bg-white/5 text-xs placeholder:text-white/40 focus:outline-none focus:border-[#4895EF] resize-none"
                  rows={4}
                  placeholder="Ex: prensa Schuler PE-150-T, com polias laterais sem grades de enclausuramento e fiação exposta sem aterramento elétrico. Operam duas pessoas diariamente."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />

                {/* File Uploader */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Inserir Imagens Técnico-Periciais</span>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-white/15 bg-white/5 p-4 rounded-xl text-center hover:bg-white/10 transition-colors cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-5 h-5 text-[#4895EF]" />
                    <span className="text-[10px] font-semibold text-slate-300">Selecionar Fotos do Equipamento</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/15 relative group">
                          <img src={img.data} alt="Upload" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImages(uploadedImages.filter((_, idx) => idx !== i));
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAICopilotTrigger}
                  disabled={loadingAI}
                  className="w-full py-3 bg-[#4895EF] hover:bg-[#4895EF]/95 text-slate-950 font-black font-mono tracking-wider text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Processando Auditoria...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>Auditar Equipamento com IA</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500">
                <Shield className="w-3.5 h-3.5 text-[#4895EF]" />
                <span>Modelo de IA: gemini-2.5-flash</span>
              </div>
            </div>

            {/* VL Engenharia Professional Credentials info */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-4">
              <h4 className="font-mono font-black text-[#0B2545] dark:text-[#4895EF] uppercase tracking-wider text-[10px] border-b pb-1">VL Engenharia — Emissor Autorizado</h4>
              <div className="space-y-2 leading-relaxed text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <p><strong>Engenheiro Responsável:</strong> Vitor Leonardo C. Linhares</p>
                <p><strong>CREA Ativo:</strong> 1822299490 - PE</p>
                <p><strong>E-mail Técnico:</strong> vitorleonardocl@gmail.com</p>
                <p><strong>Telefone Comercial:</strong> (81) 98444-2592</p>
                <p><strong>Metodologia de Risco:</strong> ABNT NBR ISO 12100:2013 / ABNT NBR 14153:2013</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "pricing" && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo de Adequação Técnica (NR-12)"
            equipmentName={laudoParams.equipmentName}
          />
        </div>
      )}

      {activeTab === "preview" && (
        /* Visualizer tab: beautiful print-ready document */
        <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex-grow text-slate-950">
          
          {/* CONFIGURAÇÃO DE SEÇÕES DO RELATÓRIO */}
          <div className="max-w-4xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl print:hidden text-left shadow-sm">
            <h3 className="font-mono font-black text-[#0B2545] dark:text-[#4895EF] uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Opções de Visualização e Impressão (Configurar A4)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              O laudo é exportado no formato A4 em alta definição. Selecione quais seções deseja incluir no documento final. Desmarque as seções que não julgar necessárias para deixar o laudo mais limpo, enxuto e focado.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.capa}
                  onChange={(e) => setPrintConfig({ ...printConfig, capa: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Capa do Laudo</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.carta}
                  onChange={(e) => setPrintConfig({ ...printConfig, carta: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Carta de Apres.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.sumario}
                  onChange={(e) => setPrintConfig({ ...printConfig, sumario: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Sumário Geral</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao1}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao1: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 1: Introdução</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao2}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao2: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 2: Contratante</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao3}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao3: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 3: Qualif. da VL</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao4}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao4: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 4: Equipamento</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao5}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao5: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 5: Doc. Analisados</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao6}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao6: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 6: Normas</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao7}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao7: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 7: Metodologia HRN</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao8}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao8: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 8: Fotos Técnicas</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao9}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao9: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 9: Checklist</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao11}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao11: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 11: Sist. Comando</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao12}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao12: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 12: Risco HRN</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao13}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao13: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 13: Não Conform.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao15}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao15: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 15: Cronograma</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao16}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao16: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 16: Parecer Concl.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao17}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao17: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>Seção 17: Limitações/Obs</span>
              </label>
            </div>
          </div>

          {/* Quick utility download button bar */}
          <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-center sm:justify-end gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-850 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer disabled:cursor-not-allowed"
            >
              {isDownloadingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>
            <button
              onClick={async () => {
                const success = await copyRichText("laudo-nr12-printable-area");
                if (success) {
                  alert("Laudo copiado em formato rico! Agora você pode colar (Ctrl+V) no Google Docs ou Word.");
                }
              }}
              className="flex items-center gap-2 bg-slate-100 border text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <Copy className="w-4 h-4 text-indigo-500" />
              <span>Copiar p/ Google Docs</span>
            </button>
            <button
              onClick={() => exportToWord("laudo-nr12-printable-area", `Laudo_NR12_${laudoParams.tag || "equip"}_${laudoParams.laudoNumber.replace(/\//g, "-")}`)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Exportar p/ Word</span>
            </button>
            <button
              onClick={() => {
                const text = `LAUDO TÉCNICO NR-12 - ${laudoParams.laudoNumber}\n\nEQUIPAMENTO: ${laudoParams.equipmentName}\nMARCA: ${laudoParams.brand} MODELO: ${laudoParams.model}\n\nCONTRATANTE: ${laudoParams.clientName}\n\nPARECER TÉCNICO: ${conclusaoParecer}\n\nEmitido por VL Engenharia - Vitor Leonardo (CREA-PE 1822299490)`;
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `laudo_nr12_${laudoParams.tag || "equip"}.txt`;
                a.click();
              }}
              className="flex items-center gap-2 bg-white border text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-emerald-500" />
              <span>Baixar Texto Oficial</span>
            </button>
          </div>

          {/* Core print page container layout */}
          <div id="laudo-nr12-printable-area" className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-8 md:p-14 text-left leading-relaxed text-slate-900 rounded-3xl print:border-none print:shadow-none print:p-0 print:rounded-none">
            
            {/* CAPA PROFISSIONAL */}
            {printConfig.capa && (
              <div className="flex flex-col justify-between text-center border-b pb-8 print:border-b-0 print:pb-0" style={{ pageBreakAfter: "always" }}>
                
                <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-[#134074] pb-6 gap-4">
                  <Logo variant="print" className="h-14" />
                  <div className="text-right text-xs font-mono text-slate-400">
                    <p>Laudo Técnico de Auditoria NR-12</p>
                    <p className="font-bold text-slate-800 pt-0.5">{laudoParams.laudoNumber}</p>
                  </div>
                </div>

                <div className="my-auto py-6 space-y-6">
                  <span className="text-[10px] font-mono tracking-widest text-[#4895EF] uppercase font-black bg-slate-100 px-4 py-1.5 rounded-full">LAUDO TÉCNICO ESPECIALIZADO DE CONFORMIDADE</span>
                  
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-sans py-2 leading-tight">
                    APRECIAÇÃO DE RISCOS & DIAGNÓSTICO NR-12
                  </h1>

                  {/* Espaço para Foto do Equipamento na Capa */}
                  <div className="my-4 max-w-xl mx-auto w-full h-56 bg-slate-50 border rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative print:border print:shadow-none print:my-2">
                    {laudoParams.coverImage ? (
                      <img src={laudoParams.coverImage} className="w-full h-full object-cover" alt="Equipamento Vistoriado" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-300">
                        <p className="text-xs font-mono font-bold uppercase tracking-wider">Foto do Equipamento Vistoriado</p>
                        <p className="text-[10px] font-sans max-w-xs mx-auto">Nenhuma imagem carregada para a capa. Insira no formulário de edição.</p>
                      </div>
                    )}
                  </div>

                  <div className="max-w-lg mx-auto bg-slate-50/50 border rounded-2xl p-5 space-y-3 text-left text-xs font-medium">
                    <p><strong>EQUIPAMENTO AUDITADO:</strong> <span className="uppercase font-bold text-slate-800">{laudoParams.equipmentName}</span></p>
                    <p><strong>FABRICANTE:</strong> {laudoParams.brand} | <strong>MODELO:</strong> {laudoParams.model}</p>
                    <p><strong>TAG DO ATIVO:</strong> <span className="font-mono text-[#134074] font-bold">{laudoParams.tag}</span></p>
                    <p><strong>EMPRESA CONTRATANTE:</strong> {laudoParams.clientName}</p>
                  </div>
                </div>

                <div className="border-t pt-6 text-xs font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p>VL ENGENHARIA • Vitor Leonardo CREA-PE 1822299490</p>
                  <p className="font-bold">{laudoParams.inspectionCity}, {laudoParams.inspectionDate.split("-").reverse().join("/")}</p>
                </div>

              </div>
            )}

            {/* CARTA DE APRESENTAÇÃO */}
            {printConfig.carta && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">Carta de Apresentação</h2>
                <p className="text-xs text-slate-600 font-mono text-right">Recife, {new Date().toLocaleDateString("pt-BR")}</p>
                
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  <p>À Direção Técnica da <strong>{laudoParams.clientName}</strong>,</p>
                  <p>
                    Temos a satisfação de submeter à vossa apreciação técnica o Relatório Pericial Completo de Auditoria NR-12 correspondente ao equipamento <strong>{laudoParams.equipmentName}</strong>, vistoriado in loco por nosso corpo de engenharia em vossas instalações de campo.
                  </p>
                  <p>
                    Este diagnóstico pericial contempla a identificação exaustiva de perigos, riscos estruturais ocultos, e a mensuração de criticidade quantitativa prévia e posterior através da metodologia regulamentada Hazard Rating Number (HRN) em estrita observação aos preceitos da ABNT NBR ISO 12100:2013 e da Norma Regulamentadora Nº 12 da Portaria MTE 916/2019.
                  </p>
                  <p>
                    Colocamo-nos à inteira disposição de vossa diretoria de ativos para eventuais esclarecimentos e acompanhamento técnico das implementações recomendadas.
                  </p>
                  
                  <div className="pt-8 text-center sm:text-left space-y-1.5 font-mono">
                    <p className="font-bold text-slate-900">Eng. Mecânico Vitor Leonardo</p>
                    <p className="text-[10px] text-slate-500">Responsável Técnico • CREA-PE 1822299490</p>
                    <p className="text-[10px] text-slate-400">VL Engenharia • vitorleonardocl@gmail.com</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUMÁRIO */}
            {printConfig.sumario && (
              <div className="py-12 border-b space-y-4" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">Sumário Geral do Documento</h2>
                <div className="space-y-2 font-mono text-[11px] text-slate-600 font-medium">
                  {activeSections.map((s) => (
                    <div key={s.id} className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <span>SEÇÃO {sectionNumbers[s.id]}: {s.title}</span>
                      <span className="font-bold text-[#134074]">Inspeção de Campo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEÇÃO 1: INTRODUÇÃO (PÁGINA DEDICADA NO PDF) */}
            {printConfig.secao1 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao1}: Introdução, Escopo e Metodologia</h2>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_1}</p>
              </div>
            )}

            {/* SEÇÕES 2 E 3 */}
            {(printConfig.secao2 || printConfig.secao3) && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                {printConfig.secao2 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao2}: Dados do Estabelecimento Contratante</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-50 border p-4 rounded-xl leading-relaxed">
                      <p><strong>Razão Social:</strong> {laudoParams.clientName}</p>
                      <p><strong>CNPJ:</strong> {laudoParams.cnpj}</p>
                      <p className="sm:col-span-2"><strong>Endereço Operacional:</strong> {laudoParams.address}</p>
                    </div>
                  </>
                )}

                {printConfig.secao3 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5 pt-6">SEÇÃO {sectionNumbers.secao3}: Qualificação Técnica da Empresa Contratada</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_3}</p>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO 4: DADOS DO EQUIPAMENTO */}
            {printConfig.secao4 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao4}: Dados Técnicos de Fabricação do Equipamento</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border rounded-xl border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#0B2545] text-white">
                        <th className="p-3">Parâmetro Técnico</th>
                        <th className="p-3">Informação / Valor Constatado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="p-3 font-bold bg-slate-50">Equipamento / Máquina</td><td className="p-3">{laudoParams.equipmentName}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Fabricante</td><td className="p-3">{laudoParams.brand}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Modelo</td><td className="p-3">{laudoParams.model}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Número de Série</td><td className="p-3">{laudoParams.serialNumber}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Ano de Fabricação</td><td className="p-3">{laudoParams.year}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Identificador / TAG</td><td className="p-3 font-bold text-[#134074]">{laudoParams.tag}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Potência Instalada</td><td className="p-3">{laudoParams.power} kW</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Tensão Alimentação</td><td className="p-3">{laudoParams.voltage} V</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Operadores Expostos</td><td className="p-3">{laudoParams.operators}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÕES 5, 6, 7 */}
            {(printConfig.secao5 || printConfig.secao6 || printConfig.secao7) && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                {printConfig.secao5 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao5}: Documentos Técnicos Analisados na Perícia</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_5}</p>
                  </>
                )}

                {printConfig.secao6 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5 pt-6">SEÇÃO {sectionNumbers.secao6}: Normas Regulamentadoras e Legislações Aplicáveis</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_6}</p>
                  </>
                )}

                {printConfig.secao7 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5 pt-6">SEÇÃO {sectionNumbers.secao7}: Metodologia Hazard Rating Number (HRN)</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_7}</p>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO 8: INSPEÇÃO VISUAL (UPLOADED IMAGES) */}
            {printConfig.secao8 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao8}: Relatório de Inspeção Visual e Fotográfica</h2>
                
                {uploadedImages.length === 0 ? (
                  <div className="p-6 border border-dashed text-center rounded-xl bg-slate-50 text-xs text-slate-400 font-mono">
                    <span>Nenhum registro fotográfico anexado ao laudo na data de hoje.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="border rounded-xl p-3 bg-slate-50 space-y-3 font-mono text-[10px]">
                        <div className="aspect-video rounded-lg overflow-hidden border">
                          <img src={img.data} alt={`Anexo ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-bold uppercase text-slate-800">Fotografia Técnica {i+1}: {img.name}</p>
                          <p className="text-slate-500 leading-normal">{img.description}</p>
                          <p className="text-emerald-600 font-bold">STATUS DE DIAGNÓSTICO: OBSERVADO</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 9: CHECKLIST DE CONFORMIDADE */}
            {printConfig.secao9 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao9}: Checklist de Conformidade da NR-12</h2>
                
                <div className="overflow-hidden">
                  <table className="w-full text-xs text-left border border-collapse" style={{ tableLayout: "fixed" }}>
                    <thead>
                      <tr className="bg-[#0b2545] text-white uppercase font-mono text-[9px]">
                        <th className="p-3 pl-2 w-[12%]">Norma</th>
                        <th className="p-3 w-[36%]">Requisito Técnico Auditado</th>
                        <th className="p-3 text-center w-[12%]">Conformidade</th>
                        <th className="p-3 pl-4 w-[28%]">Observações Periciais de Campo</th>
                        <th className="p-3 text-center w-[12%]">Foto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium leading-relaxed">
                      {NR12_CHECKLIST_TEMPLATE.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-2 font-mono font-bold text-slate-500 break-all">{item.ref}</td>
                          <td className="p-3 pr-4 break-words">{item.text}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                              checklistAnswers[item.id]?.answer === "SIM"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : checklistAnswers[item.id]?.answer === "NÃO"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                            }`}>
                              {checklistAnswers[item.id]?.answer}
                            </span>
                          </td>
                          <td className="p-3 pl-4 text-slate-500 text-[11px] leading-relaxed italic break-words">
                            {checklistAnswers[item.id]?.note}
                          </td>
                          <td className="p-3 text-center">
                            {checklistAnswers[item.id]?.image ? (
                              <img src={checklistAnswers[item.id]?.image} alt={item.id} className="w-12 h-12 object-cover rounded mx-auto border" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÃO 11 E 12: APRECIAÇÃO DE RISCO (HRN) */}
            {(printConfig.secao11 || printConfig.secao12) && (
              <div className="py-12 border-b space-y-8" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                {printConfig.secao11 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao11}: Categorização conforme ABNT NBR 14153</h2>
                    <div className="p-5 border rounded-xl bg-slate-50/50 font-mono text-xs space-y-2 leading-relaxed">
                      <p><strong>Configuração do Diagrama:</strong> Severidade: <span className="font-bold text-rose-500">{nbrCategory.s}</span> | Frequência: <span className="font-bold text-rose-500">{nbrCategory.f}</span> | Prevenção: <span className="font-bold text-rose-500">{nbrCategory.p}</span></p>
                      <p className="font-bold text-[#134074]">Enquadramento Mínimo Mandatório: Categoria {nbrCategory.category}</p>
                      <p className="text-slate-500 leading-normal">{nbrCategory.explanation}</p>
                    </div>
                  </>
                )}

                {printConfig.secao12 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5 pt-6">SEÇÃO {sectionNumbers.secao12}: Apreciação de Risco (Cálculo HRN Comparativo)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs leading-relaxed">
                      
                      {/* Before */}
                      <div className="border rounded-xl p-4 space-y-3.5 bg-rose-500/[0.02]">
                        <h4 className="font-bold uppercase text-rose-600 border-b pb-1">1) Análise de Risco Inicial (Situação Atual)</h4>
                        <ul className="space-y-1.5 font-medium">
                          <li>Probabilidade Ocorrência (LO): <span className="font-bold">{hrnBefore.lo}</span></li>
                          <li>Frequência Exposição (FE): <span className="font-bold">{hrnBefore.fe}</span></li>
                          <li>Grau de Dano Possível (DPH): <span className="font-bold">{hrnBefore.dph}</span></li>
                          <li>Pessoas Expostas (NP): <span className="font-bold">{hrnBefore.np}</span></li>
                        </ul>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded text-center">
                          <p className="text-[10px] text-rose-600 font-bold uppercase">SCORE HRN:</p>
                          <p className="text-xl font-black text-rose-600">{hrnBefore.score}</p>
                          <p className="text-[10px] font-bold uppercase text-rose-700 pt-0.5">{hrnBefore.classification}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans text-justify leading-normal">{hrnBefore.explicacao}</p>
                      </div>

                      {/* After */}
                      <div className="border rounded-xl p-4 space-y-3.5 bg-emerald-500/[0.02]">
                        <h4 className="font-bold uppercase text-emerald-600 border-b pb-1">2) Análise de Risco Mitigado (Situação Recomendada)</h4>
                        <ul className="space-y-1.5 font-medium">
                          <li>Probabilidade Ocorrência (LO): <span className="font-bold">{hrnAfter.lo}</span></li>
                          <li>Frequência Exposição (FE): <span className="font-bold">{hrnAfter.fe}</span></li>
                          <li>Grau de Dano Possível (DPH): <span className="font-bold">{hrnAfter.dph}</span></li>
                          <li>Pessoas Expostas (NP): <span className="font-bold">{hrnAfter.np}</span></li>
                        </ul>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded text-center">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">SCORE HRN RECOMENDADO:</p>
                          <p className="text-xl font-black text-emerald-600">{hrnAfter.score}</p>
                          <p className="text-[10px] font-bold uppercase text-emerald-700 pt-0.5">{hrnAfter.classification}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans text-justify leading-normal">{hrnAfter.explicacao}</p>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO 13: NÃO CONFORMIDADES */}
            {printConfig.secao13 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao13}: Não Conformidades Identificadas</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-collapse">
                    <thead>
                      <tr className="bg-rose-950/90 text-white uppercase font-mono text-[9px]">
                        <th className="p-3">Ref</th>
                        <th className="p-3">Descrição da Irregularidade Auditada</th>
                        <th className="p-3 text-center">Criticidade</th>
                        <th className="p-3">Perigo / Risco Associado</th>
                        <th className="p-3">Item Norma Violada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium leading-relaxed text-justify">
                      {naoConformidades.map((nc) => (
                        <tr key={nc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-rose-600">{nc.id}</td>
                          <td className="p-3 pr-4 max-w-xs">{nc.descricao}</td>
                          <td className="p-3 text-center">
                            <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                              {nc.criticidade}
                            </span>
                          </td>
                          <td className="p-3">{nc.risco}</td>
                          <td className="p-3 font-mono font-bold text-slate-500">{nc.norma}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÃO 15: PLANO DE AÇÃO */}
            {printConfig.secao15 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao15}: Cronograma de Plano de Ação Recomendado</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-collapse">
                    <thead>
                      <tr className="bg-[#0B2545] text-white uppercase font-mono text-[9px]">
                        <th className="p-3">Item</th>
                        <th className="p-3">Problema Identificado</th>
                        <th className="p-3">Norma Relativa</th>
                        <th className="p-3">Medida de Controle Recomendada (Hierarquia de Controle)</th>
                        <th className="p-3 text-center">Prioridade</th>
                        <th className="p-3">Responsável</th>
                        <th className="p-3">Prazo Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium leading-relaxed">
                      {planoAcao.map((ap) => (
                        <tr key={ap.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-emerald-600">{ap.id}</td>
                          <td className="p-3 font-semibold">{ap.problema}</td>
                          <td className="p-3 font-mono text-slate-500">{ap.norma}</td>
                          <td className="p-3 pr-4 max-w-xs text-justify">{ap.recomendacao}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                              ap.prioridade === "IMEDIATO" 
                                ? "bg-red-500 text-white animate-pulse" 
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}>
                              {ap.prioridade}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{ap.responsavel}</td>
                          <td className="p-3 font-mono font-bold text-[#134074]">{ap.prazo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÃO 16: CONCLUSÃO PERICIAL */}
            {printConfig.secao16 && (
              <div className="py-12 border-b space-y-8" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao16}: Conclusão Pericial e Parecer Conclusivo</h2>
                
                <div className="p-5 border rounded-xl space-y-4 text-justify text-xs font-semibold leading-relaxed bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase font-black">ENQUADRAMENTO JURÍDICO-TRABALHISTA:</span>
                    <span className={`px-3 py-1 rounded font-mono font-black text-xs border uppercase ${
                      conclusaoStatus === "CONFORME"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : conclusaoStatus === "NÃO CONFORME"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {conclusaoStatus}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{conclusaoParecer}</p>
                </div>
              </div>
            )}

            {/* SEÇÃO 17: LIMITAÇÕES */}
            {printConfig.secao17 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <ReportHeader title="LAUDO TÉCNICO DE ENGENHARIA" subTitle={laudoParams.laudoNumber} />
                <h2 className="text-lg font-bold font-mono uppercase text-[#0B2545] border-b pb-1.5">SEÇÃO {sectionNumbers.secao17}: Limitações Técnico-Periciais da Avaliação</h2>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_17}</p>
              </div>
            )}

            {/* CENTERED SIGNATURE BLOCK AS SPECIFIED */}
            <div className="py-12 text-center print-avoid-break border-t border-slate-200 mt-8">
              <ReportSignature 
                isBlank={laudoParams.blankSignature} 
                engName="Vitor Leonardo Cordeiro Linhares" 
                engCrea="CREA-PE: 1822299490" 
                additionalRole="Engenheiro Mecânico • Especialista em Inspeções e Adequações de Ativos"
              />
            </div>

            {/* ANEXOS SECTION (PÁGINA FINAL DO PDF) */}
            <div className="page-break-before py-12 space-y-8 min-h-[85vh] flex flex-col justify-between border-t border-slate-200 print-avoid-break">
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-3">
                  <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">ANEXOS</h2>
                </div>
                <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50 text-center space-y-4 py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Anexo I: Anotação de Responsabilidade Técnica (ART)</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Espaço reservado para inserção e anexação do PDF da **ART (Anotação de Responsabilidade Técnica)** devidamente emitida e quitada junto ao CREA, vinculada a esta inspeção técnica pericial de conformidade NR-12.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    [O PDF da ART assinado e quitado deve ser inserido nesta página]
                  </div>
                </div>
              </div>
              <div className="text-center font-mono text-[9px] text-slate-400">
                <p>Laudo Técnico de Inspeção NR-12 • VL Engenharia • Página de Anexos</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
