import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import Logo from "../Logo";
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
  Cpu,
  Copy
} from "lucide-react";

// --- STRUCTS & TYPES ---
interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  resposta: "SIM" | "NÃO" | "N/A";
  nota: string;
  image?: string;
}

interface NaoConformidade {
  id: string;
  descricao: string;
  criticidade: "CRÍTICA" | "ALTA" | "MÉDIA" | "BAIXA";
  risco: string;
  norma: string;
}

interface PlanoAcao {
  id: string;
  problema: string;
  norma: string;
  recomendacao: string;
  prioridade: "IMEDIATO" | "CURTO PRAZO" | "MÉDIO PRAZO" | "LONGO PRAZO";
  responsavel: string;
  prazo: string;
}

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

// --- HEAVY MACHINERY DEFAULT CHECKLIST TEMPLATE ---
const HEAVY_CHECKLIST_TEMPLATE = [
  { id: "chk_1", text: "Placa de identificação / TAG visível", ref: "Item 1" },
  { id: "chk_2", text: "Horímetro funcionando", ref: "Item 2" },
  { id: "chk_3", text: "ROPS instalado e homologado (Estrutura de Proteção contra Capotamento)", ref: "Item 3" },
  { id: "chk_4", text: "FOPS instalado (Estrutura de Proteção contra Queda de Objetos)", ref: "Item 4" },
  { id: "chk_5", text: "Cinto de segurança na cabine em bom estado", ref: "Item 5" },
  { id: "chk_6", text: "Alarme de ré sonoro operando automaticamente", ref: "Item 6" },
  { id: "chk_7", text: "Luzes de trabalho e sinalização operantes", ref: "Item 7" },
  { id: "chk_8", text: "Extintor de incêndio pressurizado e com validade em dia", ref: "Item 8" },
  { id: "chk_9", text: "Espelhos retrovisores presentes, íntegros e regulados", ref: "Item 9" },
  { id: "chk_10", text: "Ausência de vazamentos hidráulicos visíveis", ref: "Item 10" },
  { id: "chk_11", text: "Mangueiras hidráulicas sem abrasão, trincas ou danos", ref: "Item 11" },
  { id: "chk_12", text: "Estrutura do chassi e lança livre de trincas ou soldas trincadas", ref: "Item 12" },
  { id: "chk_13", text: "Pneus / esteiras em bom estado, sem cortes ou desgastes limites", ref: "Item 13" },
  { id: "chk_14", text: "Freios de serviço e estacionamento funcionando perfeitamente", ref: "Item 14" },
  { id: "chk_15", text: "Documentação do operador habilitado (CNH / Treinamento)", ref: "Item 15" },
  { id: "chk_16", text: "ART de responsabilidade técnica emitida e vinculada", ref: "Item 16" },
  { id: "chk_17", text: "Plano de manutenção preventiva registrado e atualizado", ref: "Item 17" },
  { id: "chk_18", text: "Sinalização de segurança na área de operação e giro", ref: "Item 18" }
];

// --- HEAVY EQUIPMENT SUGGESTION OPTIONS ---
const HEAVY_EQUIP_OPTIONS = [
  "Escavadeira Hidráulica",
  "Retroescavadeira",
  "Pá Carregadeira",
  "Motoniveladora",
  "Trator de Esteiras",
  "Compactador / Rolo Compressor",
  "Caminhão Fora de Estrada (Off-Road)",
  "Perfuratriz Rotativa",
  "Britador Móvel",
  "Correia Transportadora Industrial",
  "Misturador / Betoneira Industrial",
  "Guindaste sobre Esteiras",
  "Ponte Rolante",
  "Bate-Estacas Mecânico",
  "Equipamento de Fundações"
];

// --- DEFAULT REPORT SECTIONS ---
function generateSectionDrafts(params: any) {
  const eq = params.equipmentName || "Equipamento Pesado";
  const cli = params.clientName || "Empresa Contratante S/A";
  const city = params.inspectionCity || "Recife";
  const rawDate = params.inspectionDate || "27/06/2026";
  const date = rawDate.includes("-") ? rawDate.split("-").reverse().join("/") : rawDate;

  return {
    secao_1: `Este Laudo Técnico de Inspeção e Segurança de Máquinas Pesadas visa auditar e atestar as condições físicas de conformidade do ativo "${eq}", à luz das diretrizes legais estabelecidas pelas Normas Regulamentadoras NR-12, NR-11 e NR-18, aplicando-se também os ensaios normativos internacionais ABNT NBR ISO 12100 e sistemas de proteção veicular ROPS (ISO 3471) e FOPS (ISO 3449). O escopo técnico abrange vistorias físicas in loco, ensaio funcional mecânico, verificação dos sistemas de frenagem, circuito de alta pressão hidráulica, e quantificação de riscos pelo algoritmo Hazard Rating Number (HRN).`,
    
    secao_2: `O presente estudo técnico de engenharia pericial foi encomendado pela empresa ${cli}, inscrita no CNPJ sob o número ${params.cnpj || "Não informado"}, estabelecida no endereço operacional de campo: ${params.address || "Não informado"}. A contratante opera máquinas de grande porte em ambiente severo de movimentação de terra, mineração ou pavimentação, exigindo alto índice de confiabilidade e adequação protetiva para evitar acidentes graves ou fatais.`,
    
    secao_3: `A emissão legal deste documento é de responsabilidade técnica da VL Engenharia, liderada pelo Engenheiro Mecânico Vitor Leonardo, registrado sob o CREA-PE 1822299490. A VL Engenharia possui expertise consolidada no monitoramento e auditoria de grandes ativos, máquinas de mineração, terraplenagem, pontes rolantes e guindastes, unindo tecnologia de inteligência artificial de ponta com rigor analítico pericial de campo. E-mail: vitorleonardocl@gmail.com | Fone: (81) 98444-2592.`,
    
    secao_5: `Para a fundamentação deste relatório, foram levantados, catalogados e auditados os seguintes documentos e subsídios:
1. Inspeção fotográfica visual e acompanhamento dinâmico do motor e cilindros hidráulicos in loco no dia ${date} na cidade de ${city}.
2. Prontuários e fichas de controle operacional (checklists do fabricante).
3. Cronograma de manutenção mecânica preventiva e corretiva de fluidos.
4. Carteira de habilitação (CNH) e ficha de treinamento certificado do operador designado.`,
    
    secao_6: `O arcabouço normativo que subsidia esta análise técnica pericial compreende:
- NR-12 (Segurança de Máquinas e Equipamentos) - Portaria 916/2019.
- NR-11 (Transporte, Movimentação e Armazenagem de Materiais).
- NR-18 (Segurança e Saúde no Trabalho na Indústria da Construção).
- ABNT NBR ISO 12100:2013 (Apreciação de Riscos).
- ISO 3471 (ROPS - Proteção contra Capotamento) & ISO 3449 (FOPS - Proteção contra Quedas).
- Manual do Fabricante original do equipamento.`,
    
    secao_7: `A severidade e probabilidade de lesão para cada fator de risco foram quantificadas matematicamente pela metodologia consagrada Hazard Rating Number (HRN), calculada como:
HRN = Probabilidade (LO) x Exposição (FE) x Gravidade da Lesão (DPH) x Número de Pessoas (NP).
Os valores paramétricos utilizados seguem estritamente as matrizes internacionais, gerando um valor de score final que determina o enquadramento em graus que vão de Risco Desprezível a Risco Inaceitável, definindo o nível de ação corretiva de engenharia necessária.`,
    
    secao_17: `Para que este equipamento receba a liberação operacional definitiva sem restrições legais perante a engenharia civil e mecânica da VL Engenharia, deverão ser atendidas integralmente as seguintes condições:
1. Sanar vazamentos hidráulicos ativos no cilindro do braço e substituir mangueiras que apresentem abrasão profunda.
2. Comprovar instalação e pleno funcionamento acústico do alarme sonoro de marcha à ré.
3. Substituir imediatamente qualquer cinto de segurança que exiba fadiga na fivela ou fita rompida.`,
    
    secao_18: `A presente avaliação restringe-se às condições estruturais, mecânicas, hidráulicas e de segurança visualmente constatadas na data da inspeção técnica in loco. Não foi possível confirmar este requisito apenas por meio da inspeção visual, sendo necessária verificação presencial ou documental de itens estruturais internos e espessuras das ligas de metal através de ultrassom industrial e ensaio não destrutivo de partículas magnéticas.`
  };
}

export default function LaudoMaquinasPesadasIndep({ onBack, initialPrefilled = false, clients }: { onBack?: () => void, initialPrefilled?: boolean, clients?: ClientData[] }) {
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
    secao10: true,
    secao11: true,
    secao12: true,
    secao13: true,
    secao14: true,
    secao15: true
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // --- GENERAL PARAMETERS STATE ---
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LMP-001/2026 Rev. 00",
    clientName: "",
    cnpj: "",
    address: "",
    equipmentName: "Escavadeira Hidráulica",
    brand: "",
    model: "",
    serialNumber: "",
    year: "2020",
    tag: "",
    horimetro: "3500",
    inspectionCity: "Recife",
    inspectionDate: new Date().toISOString().split("T")[0],
    notes: "",
    coverImage: "",
    normasAdicionais: "ABNT NBR ISO 12100, ABNT NBR ISO 3471, OSHA 1926.602"
  });

  // --- CHECKLIST STATE ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Initialize checklist
  useEffect(() => {
    const initial = HEAVY_CHECKLIST_TEMPLATE.map(item => ({
      id: item.id,
      text: item.text,
      resposta: "SIM" as const,
      nota: "Observado em perfeitas condições funcionais durante a vistoria visual."
    }));
    setChecklist(initial);
  }, []);

  // --- SYSTEMS INSPECTION STATE (10 specialized subsystems) ---
  const [sistemasInspecao, setSistemasInspecao] = useState({
    propulsao: "Transmissão mecânica e propulsão a diesel operando regularmente, sem ruídos incomuns nas caixas redutoras.",
    hidraulico: "Cilindros de dupla ação respondendo bem aos testes de estanqueidade. Sem indício de fissuras de vedação.",
    eletrico: "Instalação de baixa tensão protegida. Chicotes elétricos amarrados de forma segura e painel de bordo intacto.",
    freios: "Sistema de frenagem hidropneumático atuando perfeitamente nos testes de desaceleração controlada.",
    estrutura: "Estrutura do chassi principal e longarinas de sustentação sem deformações permanentes detectáveis.",
    cabine: "Cabine fechada equipada com estrutura ROPS certificada. Espaço interno higienizado para o condutor.",
    implementos: "Implementos de escavação instalados de forma rígida, sem fadiga metálica ou folgas graves no acoplamento.",
    rodagem: "Sapatas metálicas das esteiras e roletes guias sem sinais de desgaste extremo.",
    seguranca: "Giroscópio visual, buzina e faróis de longo alcance operando. Alarme de ré automático ativo.",
    motor: "Motor de combustão interna lubrificado, sem oscilações de rotação ou fumaça preta no escape."
  });

  // --- HRN BEFORE STATE ---
  const [hrnBefore, setHrnBefore] = useState({
    lo: 5.0,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 187.5,
    explicacao: "Perigo de atropelamento severo ou esmagamento devido à movimentação do maquinário pesado no canteiro de obras."
  });

  // --- HRN AFTER STATE ---
  const [hrnAfter, setHrnAfter] = useState({
    lo: 0.033,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 1.23,
    explicacao: "Risco mitigado a níveis desprezíveis através de treinamento do operador, sinalização de isolamento e alarme acústico ativo."
  });

  // --- NON CONFORMITIES STATE ---
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([
    {
      id: "NC-01",
      descricao: "Cinto de segurança de 3 pontos com desgaste excessivo e travamento inoperante na cabine principal.",
      criticidade: "CRÍTICA",
      risco: "Esmagamento / Projeção em capotamento",
      norma: "NR-12 item 12.38 / ISO 6683"
    },
    {
      id: "NC-02",
      descricao: "Alarme acústico de marcha à ré desligado ou queimado na traseira do chassi.",
      criticidade: "ALTA",
      risco: "Atropelamento de pedestres no canteiro",
      norma: "NR-12 item 12.112 / NR-18"
    }
  ]);

  // --- ACTION PLAN STATE ---
  const [planoAcao, setPlanoAcao] = useState<PlanoAcao[]>([
    {
      id: "AP-01",
      problema: "Cinto de segurança defeituoso",
      norma: "NR-12 item 12.38",
      recomendacao: "Efetuar a imediata substituição por um novo cinto de segurança de 3 pontos homologado.",
      prioridade: "IMEDIATO",
      responsavel: "VL Engenharia / Manutenção",
      prazo: "2 dias"
    },
    {
      id: "AP-02",
      problema: "Alarme de ré queimado",
      norma: "NR-12 item 12.112",
      recomendacao: "Instalar nova sirene de marcha à ré à prova de intempéries e intertravá-la na alavanca de marchas.",
      prioridade: "IMEDIATO",
      responsavel: "Setor Elétrico VL Engenharia",
      prazo: "3 dias"
    }
  ]);

  // --- CONCLUSION & SECTIONS STATE ---
  const [conclusaoStatus, setConclusaoStatus] = useState<"APTO PARA OPERAÇÃO" | "NÃO APTO — INTERDIÇÃO IMEDIATA" | "APTO COM RESTRIÇÕES">("APTO COM RESTRIÇÕES");
  const [conclusaoParecer, setConclusaoParecer] = useState("O equipamento pesado encontra-se em condições operacionais regulares, porém APTO COM RESTRIÇÕES devido a irregularidades em seus itens de emergência (cinto de segurança e alarme de ré). A liberação final fica condicionada às adequações imediatas citadas no plano de ação.");

  const [secoesLaudo, setSecoesLaudo] = useState<any>({
    secao_1: "",
    secao_2: "",
    secao_3: "",
    secao_5: "",
    secao_6: "",
    secao_7: "",
    secao_17: "",
    secao_18: ""
  });

  // Calculate scores on changes
  useEffect(() => {
    const bScore = Number((hrnBefore.lo * hrnBefore.fe * hrnBefore.dph * hrnBefore.np).toFixed(2));
    setHrnBefore(prev => ({ ...prev, score: bScore }));
  }, [hrnBefore.lo, hrnBefore.fe, hrnBefore.dph, hrnBefore.np]);

  useEffect(() => {
    const aScore = Number((hrnAfter.lo * hrnAfter.fe * hrnAfter.dph * hrnAfter.np).toFixed(2));
    setHrnAfter(prev => ({ ...prev, score: aScore }));
  }, [hrnAfter.lo, hrnAfter.fe, hrnAfter.dph, hrnAfter.np]);

  // Update sections text dynamically
  useEffect(() => {
    setSecoesLaudo(generateSectionDrafts(laudoParams));
  }, [laudoParams.equipmentName, laudoParams.clientName, laudoParams.cnpj, laudoParams.address, laudoParams.inspectionCity, laudoParams.inspectionDate]);

  // --- HANDLERS ---
  const handleChecklistChange = (id: string, key: "resposta" | "nota" | "image", val: any) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, [key]: val } : item));
  };

  const handleAddNC = () => {
    const nextId = `NC-0${naoConformidades.length + 1}`;
    const newNC: NaoConformidade = {
      id: nextId,
      descricao: "Nova irregularidade técnica observada na inspeção de campo.",
      criticidade: "MÉDIA",
      risco: "Acidente mecânico / perda de eficiência",
      norma: "NR-12"
    };
    setNaoConformidades([...naoConformidades, newNC]);
  };

  const handleRemoveNC = (id: string) => {
    setNaoConformidades(prev => prev.filter(x => x.id !== id));
  };

  const handleUpdateNC = (id: string, key: keyof NaoConformidade, val: string) => {
    setNaoConformidades(prev => prev.map(x => x.id === id ? { ...x, [key]: val } : x));
  };

  const handleAddAP = () => {
    const nextId = `AP-0${planoAcao.length + 1}`;
    const newAP: PlanoAcao = {
      id: nextId,
      problema: "Defeito / Irregularidade identificada",
      norma: "NR-12",
      recomendacao: "Instalar proteção ou efetuar reparo mecânico imediato.",
      prioridade: "CURTO PRAZO",
      responsavel: "Equipe técnica da contratante",
      prazo: "15 dias"
    };
    setPlanoAcao([...planoAcao, newAP]);
  };

  const handleRemoveAP = (id: string) => {
    setPlanoAcao(prev => prev.filter(x => x.id !== id));
  };

  const handleUpdateAP = (id: string, key: keyof PlanoAcao, val: string) => {
    setPlanoAcao(prev => prev.map(x => x.id === id ? { ...x, [key]: val } : x));
  };

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
              description: "Registro fotográfico capturado em campo pelo auditor Vitor Leonardo."
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
                description: "Registro fotográfico capturado em campo pelo auditor Vitor Leonardo."
              }
            ]);
          };
          reader.readAsDataURL(file);
        });
    });
  };

  const handleUpdateImageDesc = (index: number, desc: string) => {
    setUploadedImages(prev => prev.map((img, idx) => idx === index ? { ...img, description: desc } : img));
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // --- AUTOMATION AI TRIGGER ---
  const triggerAIEngine = async () => {
    if (!laudoParams.equipmentName) {
      alert("Por favor, preencha o nome do equipamento pesado antes de acionar a inteligência.");
      return;
    }
    setLoadingAI(true);
    try {
      const payload = {
        equipmentName: laudoParams.equipmentName,
        brand: laudoParams.brand,
        model: laudoParams.model,
        serialNumber: laudoParams.serialNumber,
        year: laudoParams.year,
        clientName: laudoParams.clientName,
        cnpj: laudoParams.cnpj,
        address: laudoParams.address,
        tag: laudoParams.tag,
        laudoNumber: laudoParams.laudoNumber,
        horimetro: laudoParams.horimetro,
        inspectionCity: laudoParams.inspectionCity,
        inspectionDate: laudoParams.inspectionDate,
        normasAdicionais: laudoParams.normasAdicionais || "",
        notes: aiPrompt || laudoParams.notes,
        images: uploadedImages.slice(0, 3).map(img => ({
          data: img.data,
          mimeType: img.data.split(";")[0].split(":")[1] || "image/jpeg"
        }))
      };

      const res = await fetch("/api/gemini/heavy-machinery-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = "Erro na resposta do servidor.";
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

      if (data) {
        if (data.numero) setLaudoParams(prev => ({ ...prev, laudoNumber: data.numero }));
        
        // Update checklist
        if (data.checklist) {
          setChecklist(prev => prev.map(item => {
            const match = data.checklist[`item_${item.id.split("_")[1]}`];
            if (match) {
              return {
                ...item,
                resposta: match.resposta,
                nota: match.nota
              };
            }
            return item;
          }));
        }

        // Update HRN
        if (data.hrn_before) {
          setHrnBefore({
            lo: data.hrn_before.lo,
            fe: data.hrn_before.fe,
            dph: data.hrn_before.dph,
            np: data.hrn_before.np,
            score: data.hrn_before.score,
            explicacao: data.hrn_before.explicacao
          });
        }
        if (data.hrn_after) {
          setHrnAfter({
            lo: data.hrn_after.lo,
            fe: data.hrn_after.fe,
            dph: data.hrn_after.dph,
            np: data.hrn_after.np,
            score: data.hrn_after.score,
            explicacao: data.hrn_after.explicacao
          });
        }

        // Systems
        if (data.sistemas_inspecao) {
          setSistemasInspecao(prev => ({ ...prev, ...data.sistemas_inspecao }));
        }

        // Non Conformities
        if (data.nao_conformidades) {
          setNaoConformidades(data.nao_conformidades);
        }

        // Action Plan
        if (data.plano_action) {
          const formatted = data.plano_action.map((ap: any) => ({
            id: ap.id,
            problema: ap.problema,
            norma: ap.norma,
            recomendacao: ap.recomendacao,
            prioridade: ap.prioridade,
            responsavel: ap.responsavel,
            prazo: ap.prazo
          }));
          setPlanoAcao(formatted);
        }

        // Conclusao
        if (data.conclusao) {
          setConclusaoStatus(data.conclusao.status);
          setConclusaoParecer(data.conclusao.parecer);
        }

        // Sections
        if (data.secoes) {
          setSecoesLaudo(prev => ({ ...prev, ...data.secoes }));
        }

        setActiveTab("preview");
      }
    } catch (err: any) {
      console.error(err);
      alert("Falha técnica ao tentar acionar o auditor de Máquinas Pesadas: " + err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const element = document.getElementById("laudo-heavy-printable-area");
      if (!element) return;

      // Add special class to body to alter layout during PDF generation
      document.body.classList.add("generating-pdf");

      // Replace modern unsupported OKLCH colors in styles with standard rgb values temporarily
      await preprocessStylesheets(element);

      // Set options - using a margin of 5mm (with our CSS padding, it becomes very elegant)
      const opt = {
        margin:       5,
        filename:     `Laudo_${laudoParams.tag || "Maquina_Pesada"}_${laudoParams.laudoNumber.replace(/\//g, "-")}.pdf`,
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
      // Remove special class from body and restore original stylesheets
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
      setIsDownloadingPdf(false);
    }
  };

  const generateExampleReport = () => {
    // 1. Popular parâmetros gerais com dados genéricos realistas
    setLaudoParams({
      laudoNumber: "LMP-88321/2026-A",
      clientName: "MINERAÇÃO SERRA DA BOREMA S.A.",
      cnpj: "33.987.654/0001-21",
      address: "Fazenda Caraíba, s/n - Zona Rural, Caruaru - PE",
      equipmentName: "Escavadeira Hidráulica 36T",
      brand: "Caterpillar",
      model: "CAT 336",
      serialNumber: "CAT336HEX2024-0019",
      year: "2024",
      tag: "ESC-08",
      operators: "3 operadores em escala",
      power: "235",
      voltage: "24",
      inspectionDate: "2026-07-01",
      inspectionCity: "Caruaru",
      notes: "Equipamento de escavação pesada de alta performance. Encontra-se em excelente estado de conservação mecânica e conformidade protetiva sob inspeção pericial de Vitor Leonardo.",
      coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
    });

    // 2. Imagens reais (sem ser IA) de equipamentos/campo
    setUploadedImages([
      {
        name: "escavadeira_cat_campo.jpg",
        data: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?q=80&w=800&auto=format&fit=crop",
        description: "Vista lateral da Escavadeira Hidráulica CAT 336 operando em escavação de talude."
      },
      {
        name: "cabine_rops_fops.jpg",
        data: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
        description: "Cabine blindada com estrutura ROPS/FOPS certificada integrada sem deformações visuais."
      },
      {
        name: "inspecao_material.jpg",
        data: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
        description: "Inspeção dimensional visual das esteiras de tração e cilindros de elevação do braço hidráulico."
      }
    ]);

    // 3. Atualizar sistemas com comentários de engenharia de campo reais
    setSistemasInspecao({
      propulsao: "Motor Caterpillar C7.1 em perfeitas condições mecânicas. Ausência de gases anômalos no escapamento.",
      hidraulico: "Circuito de alta pressão calibrado a 350 bar estável. Mangueiras de dupla trama sem desgaste ou vazamentos.",
      eletrico: "Fiação nova em conduítes vedados antichama. Sem folga em conectores ou bornes de bateria.",
      freios: "Frenagem mecânica hidráulica de estacionamento atuando perfeitamente nos testes estáticos.",
      estrutura: "Estrutura do chassi principal e longarinas de sustentação sem deformações permanentes detectáveis.",
      cabine: "Cabine fechada equipada com estrutura ROPS certificada. Espaço interno higienizado para o condutor.",
      implementos: "Implementos de escavação instalados de forma rígida, sem fadiga metálica ou folgas graves no acoplamento.",
      rodagem: "Sapatas metálicas das esteiras e roletes guias sem sinais de desgaste extremo.",
      seguranca: "Giroscópio visual, buzina e faróis de longo alcance operando. Alarme de ré automático ativo.",
      motor: "Motor de combustão interna lubrificado, sem oscilações de rotação ou fumaça preta no escape."
    });

    // 4. Preencher checklist
    const checklistComentarios = {
      chk_1: "Alarme sonoro interligado operando e ativo com 97 dB a 1 metro.",
      chk_2: "Cinto de segurança retrátil de 3 pontos com recolhimento rápido funcional.",
      chk_3: "Vidros temperados originais Caterpillar intactos e sem trincas de esforço.",
      chk_4: "Estrutura metálica ROPS de cabine devidamente gravada de fábrica.",
      chk_5: "Proteção contra objetos cadentes FOPS ativa, sem amassados ou furos.",
      chk_6: "Manômetros de óleo e água de arrefecimento calibrados e limpos.",
      chk_7: "Espelhos esféricos e retrovisores planos sem quebras.",
      chk_8: "Extintor de pó químico ABC pressurizado de 4kg com validade em dia.",
      chk_9: "Sapatas antiderrapantes e guarda-corpos laterais rígidos instalados.",
      chk_10: "Dispositivo corta-fluxo geral do sistema hidráulico atuando rápido.",
      chk_11: "Chave geral de corte de bateria estanque na lateral do chassi.",
      chk_12: "Proteções mecânicas em todas as polias do motor aparafusadas.",
      chk_13: "Sinalizadores de perigo e tabelas de carga de fácil visualização.",
      chk_14: "Manual de operação Caterpillar original em português na cabine.",
      chk_15: "Operador de escavadeira habilitado e com ficha de treinamento NR-12.",
      chk_16: "ART pericial emitida e recolhida para esta inspeção ordinária.",
      chk_17: "Plano físico de manutenções preventivas Caterpillar assinado.",
      chk_18: "Sinalização de área de giro com cones listrados vermelhos e brancos."
    };

    setChecklist(prev => prev.map(item => ({
      ...item,
      resposta: "SIM",
      nota: checklistComentarios[item.id as keyof typeof checklistComentarios] || item.nota
    })));

    // 5. Matrizes HRN
    setHrnBefore({
      lo: 5.0,
      fe: 2.5,
      dph: 15.0,
      np: 1.0,
      score: 187.5,
      explicacao: "Perigo de atropelamento severo ou esmagamento devido à movimentação do maquinário pesado no canteiro de obras sem sinalização."
    });

    setHrnAfter({
      lo: 0.033,
      fe: 2.5,
      dph: 15.0,
      np: 1.0,
      score: 1.23,
      explicacao: "Risco mitigado a níveis desprezíveis através de treinamento do operador, sinalização de isolamento e alarme acústico ativo."
    });

    // 6. Não conformidades resolvidas
    setNaoConformidades([
      {
        id: "NC-01",
        descricao: "Pequeno desgaste superficial na demarcação de piso antiderrapante no degrau de acesso principal.",
        criticidade: "LEVE",
        risco: "Escorregamento ao subir na cabine",
        norma: "NR-12 item 12.11"
      }
    ]);

    // 7. Plano de ação
    setPlanoAcao([
      {
        id: "AP-01",
        problema: "Degrau gasta",
        norma: "NR-12 item 12.11",
        recomendacao: "Limpar e aplicar fita adesiva antiderrapante zebrada de alta aderência sobre o primeiro degrau de acesso à cabine.",
        prioridade: "LONGO PRAZO",
        responsavel: "Equipe de Manutenção Local",
        prazo: "15 dias"
      }
    ]);

    // 8. Parecer
    setConclusaoStatus("APTO PARA OPERAÇÃO");
    setConclusaoParecer("Após minuciosa inspeção técnica visual, ensaios funcionais mecânicos e análise detalhada dos itens de conformidade da NR-12, NR-11 e NR-18, atesta-se que a Escavadeira Hidráulica CAT 336 (ESC-08) encontra-se em perfeitas condições mecânicas e de segurança física operacionais, estando TOTALMENTE APTA para os trabalhos ordinários de escavação e terraplenagem.");

    // 9. Mudar para preview
    setActiveTab("preview");
  };

  return (
    <div className={
      isFullscreen
        ? "fixed inset-0 z-[999] bg-slate-50 dark:bg-slate-900 w-screen h-screen text-slate-800 dark:text-slate-100 flex flex-col overflow-y-auto"
        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl font-sans min-h-screen text-slate-800 dark:text-slate-100 flex flex-col"
    }>
      {/* Upper Navigation Header */}
      <div className="bg-[#1C3144] p-6 text-white border-b-2 border-[#A00000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg">
            <Cpu className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h1 className="text-sm font-black font-mono uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <span>GERADOR LMP</span>
              <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">PESADOS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold font-mono">VL Engenharia • Inspeção de Equipamentos Pesados</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={generateExampleReport}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 border border-red-500 shadow-md animate-bounce"
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
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 border border-white/10"
            title={isFullscreen ? "Minimizar" : "Expandir em Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-red-500" />}
            <span>{isFullscreen ? "Minimizar" : "Tela Cheia"}</span>
          </button>

          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "form" 
                ? "bg-red-600 text-white shadow-md" 
                : "text-white/85 hover:bg-white/10"
            }`}
          >
            Editar Formulário
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pricing" 
                ? "bg-emerald-500 text-white shadow-md" 
                : "text-white/85 hover:bg-white/10"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            Precificação
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "preview" 
                ? "bg-red-600 text-white shadow-md" 
                : "text-white/85 hover:bg-white/10"
            }`}
          >
            Ver Laudo Oficial
          </button>
        </div>
      </div>

      {activeTab === "form" && (
        <div className="p-6 md:p-8 flex-grow grid grid-cols-1 xl:grid-cols-12 gap-8 text-left">
          
          {/* Form left sidebar */}
          <div className="xl:col-span-8 space-y-8 max-w-full">
            
            {/* 1. General Info */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Identificação Geral do Laudo LMP</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Número do Laudo / Ref</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.laudoNumber}
                    onChange={e => setLaudoParams({ ...laudoParams, laudoNumber: e.target.value })}
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
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Endereço Operacional</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.address}
                    onChange={e => setLaudoParams({ ...laudoParams, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium pt-4 border-t border-slate-100 dark:border-slate-900">
                <div className="space-y-1 col-span-2">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Nome / Tipo do Equipamento</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.equipmentName}
                    onChange={e => setLaudoParams({ ...laudoParams, equipmentName: e.target.value })}
                  >
                    {HEAVY_EQUIP_OPTIONS.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Fabricante / Marca</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.brand}
                    placeholder="Ex: Caterpillar"
                    onChange={e => setLaudoParams({ ...laudoParams, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Modelo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.model}
                    placeholder="Ex: 320D"
                    onChange={e => setLaudoParams({ ...laudoParams, model: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Número de Série</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.serialNumber}
                    placeholder="Ex: CAT320DJ9..."
                    onChange={e => setLaudoParams({ ...laudoParams, serialNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Ano</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.year}
                    onChange={e => setLaudoParams({ ...laudoParams, year: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">TAG Máquina</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.tag}
                    placeholder="Ex: LMP-ESC-01"
                    onChange={e => setLaudoParams({ ...laudoParams, tag: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Horímetro (h)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={laudoParams.horimetro}
                    onChange={e => setLaudoParams({ ...laudoParams, horimetro: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
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
                  placeholder="Ex: ABNT NBR ISO 12100, ABNT NBR ISO 3471, OSHA 1926.602, etc."
                  className="w-full border dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-xs"
                  value={laudoParams.normasAdicionais || ""}
                  onChange={e => setLaudoParams({ ...laudoParams, normasAdicionais: e.target.value })}
                  rows={2}
                />
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
                      Selecione uma imagem para a capa do laudo de ativos pesados. Ela será exibida no centro da capa profissional do PDF.
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

            {/* 2. Checklist LMP */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-red-600" />
                  <span>Checklist de Segurança do Equipamento Pesado</span>
                </span>
                <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-mono px-2.5 py-0.5 rounded font-black">18 Requisitos</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] uppercase font-mono text-slate-400">
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Parâmetro de Inspeção Obrigatório</th>
                      <th className="pb-3 text-center">Resposta</th>
                      <th className="pb-3 pl-4">Nota Explicativa de Campo</th>
                      <th className="pb-3 text-center w-32">Foto Anexa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {checklist.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-slate-500">{item.id.replace("chk_", "Nº ")}</td>
                        <td className="py-3.5 pr-4 max-w-xs font-semibold leading-relaxed">{item.text}</td>
                        <td className="py-3.5 text-center">
                          <select
                            className={`p-1.5 rounded-lg border text-[11px] font-bold font-mono focus:outline-none ${
                              item.resposta === "SIM" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                                : item.resposta === "NÃO" 
                                ? "bg-red-500/10 text-red-600 border-red-500/30" 
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                            value={item.resposta}
                            onChange={e => handleChecklistChange(item.id, "resposta", e.target.value)}
                          >
                            <option value="SIM">OK</option>
                            <option value="NÃO">NOK</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </td>
                        <td className="py-3.5 pl-4">
                          <input
                            type="text"
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                            value={item.nota}
                            onChange={e => handleChecklistChange(item.id, "nota", e.target.value)}
                          />
                        </td>
                        <td className="py-3.5 pl-4 text-center">
                          {item.image ? (
                            <div className="relative group inline-block">
                              <img src={item.image} className="w-12 h-12 object-cover rounded-lg border shadow-sm hover:scale-110 transition-all cursor-zoom-in" />
                              <button
                                type="button"
                                onClick={() => handleChecklistChange(item.id, "image", undefined)}
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
                                      handleChecklistChange(item.id, "image", reader.result as string);
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

            {/* 3. Detailed Systems Inspection (10 Subsystems) */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Inspeção Técnica Detalhada por Subsistema</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-left">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.1 Sistema de Propulsão e Transmissão</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.propulsao}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, propulsao: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.2 Sistema Hidráulico (cilindros, mangueiras)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.hidraulico}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, hidraulico: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.3 Sistema Elétrico e Eletrônico</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.eletrico}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, eletrico: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.4 Sistema de Freios e Direção</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.freios}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, freios: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.5 Estrutura e Chassi (soldas, corrosão)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.estrutura}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, estrutura: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.6 Cabine do Operador (ROPS/FOPS, cinto)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.cabine}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, cabine: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.7 Implementos e Acessórios</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.implementos}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, implementos: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.8 Rodagem (Pneus / Esteiras / Sapatas)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.rodagem}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, rodagem: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.9 Dispositivos de Segurança (alarme, buzina)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.seguranca}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, seguranca: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[9px] uppercase">9.10 Sistema de Escape e Motor Diesel</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    value={sistemasInspecao.motor}
                    onChange={e => setSistemasInspecao({ ...sistemasInspecao, motor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 4. Hazard Rating Number (HRN) Calculator */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-600" />
                <span>Cálculo do Grau de Risco de Máquinas Pesadas (HRN)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* HRN Before */}
                <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-4 space-y-4 text-left">
                  <span className="text-[10px] bg-red-600 text-white font-mono px-2 py-0.5 rounded font-black tracking-wider uppercase">Antes das Adequações</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">LO (Probabilidade)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnBefore.lo}
                        onChange={e => setHrnBefore({ ...hrnBefore, lo: Number(e.target.value) })}
                      >
                        {LO_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">FE (Exposição)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnBefore.fe}
                        onChange={e => setHrnBefore({ ...hrnBefore, fe: Number(e.target.value) })}
                      >
                        {FE_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">DPH (Lesão)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnBefore.dph}
                        onChange={e => setHrnBefore({ ...hrnBefore, dph: Number(e.target.value) })}
                      >
                        {DPH_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">NP (Pessoas)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnBefore.np}
                        onChange={e => setHrnBefore({ ...hrnBefore, np: Number(e.target.value) })}
                      >
                        {NP_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-red-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">HRN SCORE</p>
                      <p className="text-2xl font-black font-mono text-red-600">{hrnBefore.score}</p>
                    </div>
                    <div className={`border px-3 py-1.5 rounded-xl font-bold text-xs ${getHRNClassification(hrnBefore.score).color}`}>
                      {getHRNClassification(hrnBefore.score).label}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400 font-mono text-[9px] uppercase">Análise de Risco Preliminar</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-[11px]"
                      value={hrnBefore.explicacao}
                      onChange={e => setHrnBefore({ ...hrnBefore, explicacao: e.target.value })}
                    />
                  </div>
                </div>

                {/* HRN After */}
                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 space-y-4 text-left">
                  <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded font-black tracking-wider uppercase">Após Adequações Recomendadas</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">LO (Probabilidade)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnAfter.lo}
                        onChange={e => setHrnAfter({ ...hrnAfter, lo: Number(e.target.value) })}
                      >
                        {LO_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">FE (Exposição)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnAfter.fe}
                        onChange={e => setHrnAfter({ ...hrnAfter, fe: Number(e.target.value) })}
                      >
                        {FE_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">DPH (Lesão)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnAfter.dph}
                        onChange={e => setHrnAfter({ ...hrnAfter, dph: Number(e.target.value) })}
                      >
                        {DPH_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase font-bold">NP (Pessoas)</label>
                      <select
                        className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                        value={hrnAfter.np}
                        onChange={e => setHrnAfter({ ...hrnAfter, np: Number(e.target.value) })}
                      >
                        {NP_OPTIONS.map((item, idx) => (
                          <option key={idx} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">HRN SCORE</p>
                      <p className="text-2xl font-black font-mono text-emerald-600">{hrnAfter.score}</p>
                    </div>
                    <div className={`border px-3 py-1.5 rounded-xl font-bold text-xs ${getHRNClassification(hrnAfter.score).color}`}>
                      {getHRNClassification(hrnAfter.score).label}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400 font-mono text-[9px] uppercase">Análise de Risco Residual</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-[11px]"
                      value={hrnAfter.explicacao}
                      onChange={e => setHrnAfter({ ...hrnAfter, explicacao: e.target.value })}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 5. Non Conformities & Risks */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b pb-2 flex items-center justify-between gap-4">
                <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Não Conformidades & Riscos (NR-12 / NR-18)</span>
                </h3>
                <button
                  onClick={handleAddNC}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase transition-all bg-[#1C3144] hover:bg-[#1C3144]/85 text-white flex items-center gap-1 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova NC</span>
                </button>
              </div>

              <div className="space-y-4">
                {naoConformidades.map((nc) => (
                  <div key={nc.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50 relative space-y-3">
                    <button
                      onClick={() => handleRemoveNC(nc.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-left">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Código</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={nc.id}
                          onChange={e => handleUpdateNC(nc.id, "id", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Risco Associado</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={nc.risco}
                          onChange={e => handleUpdateNC(nc.id, "risco", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Criticidade</label>
                        <select
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-bold text-red-600"
                          value={nc.criticidade}
                          onChange={e => handleUpdateNC(nc.id, "criticidade", e.target.value as any)}
                        >
                          <option value="CRÍTICA">CRÍTICA</option>
                          <option value="ALTA">ALTA</option>
                          <option value="MÉDIA">MÉDIA</option>
                          <option value="BAIXA">BAIXA</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-left">
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Descrição Técnica de Campo</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={nc.descricao}
                          onChange={e => handleUpdateNC(nc.id, "descricao", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Item exato da Norma</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-mono"
                          value={nc.norma}
                          onChange={e => handleUpdateNC(nc.id, "norma", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Action Plan */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b pb-2 flex items-center justify-between gap-4">
                <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Plano de Ação Corretiva & Prazos</span>
                </h3>
                <button
                  onClick={handleAddAP}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase transition-all bg-[#1C3144] hover:bg-[#1C3144]/85 text-white flex items-center gap-1 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Ação</span>
                </button>
              </div>

              <div className="space-y-4">
                {planoAcao.map((ap) => (
                  <div key={ap.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50 relative space-y-3 text-left">
                    <button
                      onClick={() => handleRemoveAP(ap.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Item do Plano</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={ap.id}
                          onChange={e => handleUpdateAP(ap.id, "id", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Problema Constatado</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={ap.problema}
                          onChange={e => handleUpdateAP(ap.id, "problema", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Prioridade</label>
                        <select
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-bold text-slate-800"
                          value={ap.prioridade}
                          onChange={e => handleUpdateAP(ap.id, "prioridade", e.target.value as any)}
                        >
                          <option value="IMEDIATO">IMEDIATO</option>
                          <option value="CURTO PRAZO">CURTO PRAZO</option>
                          <option value="MÉDIO PRAZO">MÉDIO PRAZO</option>
                          <option value="LONGO PRAZO">LONGO PRAZO</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Recomendação / Adequação na Hierarquia</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none"
                          value={ap.recomendacao}
                          onChange={e => handleUpdateAP(ap.id, "recomendacao", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Responsável Execução</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-medium"
                          value={ap.responsavel}
                          onChange={e => handleUpdateAP(ap.id, "responsavel", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Prazo Estimado</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-[11px] focus:outline-none font-mono"
                          value={ap.prazo}
                          onChange={e => handleUpdateAP(ap.id, "prazo", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Conclusion */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-red-600" />
                <span>Conclusão Pericial & Parecer do Eng. Vitor Leonardo</span>
              </h3>

              <div className="space-y-4 text-xs font-medium text-left">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Resultado Final da Auditoria</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
                    value={conclusaoStatus}
                    onChange={e => setConclusaoStatus(e.target.value as any)}
                  >
                    <option value="APTO PARA OPERAÇÃO">APTO PARA OPERAÇÃO</option>
                    <option value="APTO COM RESTRIÇÕES">APTO COM RESTRIÇÕES</option>
                    <option value="NÃO APTO — INTERDIÇÃO IMEDIATA">NÃO APTO — INTERDIÇÃO IMEDIATA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px] uppercase">Parecer Técnico Detalhado</label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none text-xs font-medium"
                    value={conclusaoParecer}
                    onChange={e => setConclusaoParecer(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Form right sidebar (A.I & Image uploading) */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* A.I Auditor Automation Widget */}
            <div className="bg-gradient-to-br from-[#1C3144] to-[#000e1a] text-white p-6 rounded-2xl border border-red-500/20 shadow-xl space-y-4 text-left">
              <div className="flex items-center gap-2 text-red-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h3 className="text-xs font-black font-mono tracking-widest uppercase">AUDITOR INTEGRADO IA</h3>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
                Insira as fotos do equipamento pesado na área de anexos abaixo e use o prompt opcional para instruir a IA. O assistente preencherá o checklist de 18 itens, calculará o HRN e gerará todas as seções periciais sob as diretrizes de Vitor Leonardo.
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Foco Adicional da IA (Opcional)</label>
                <textarea
                  placeholder="Ex: Focar na análise de vazamentos e trincas estruturais na lança hidráulica..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-black/40 text-slate-100 text-[11px] placeholder-slate-500 focus:outline-none"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>

              <button
                onClick={triggerAIEngine}
                disabled={loadingAI}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/20 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loadingAI ? "Auditando com IA..." : "Gerar Laudo Completo"}</span>
              </button>
            </div>

            {/* Field Photos Attachment */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-left">
              <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-red-600" />
                  <span>Evidências Fotográficas</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{uploadedImages.length} anexo(s)</span>
              </h3>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-red-500 py-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Fazer Upload de Fotos de Campo</span>
                <span className="text-[8px] text-slate-400 font-mono">Arquivos PNG, JPG ou JPEG</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="space-y-4">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                      <img src={img.data} alt="Anexo" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase">Legenda Técnica da Foto</label>
                      <input
                        type="text"
                        className="w-full p-1.5 border rounded bg-white dark:bg-slate-950 text-[10px]"
                        value={img.description}
                        onChange={e => handleUpdateImageDesc(i, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "pricing" && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo de Máquinas Pesadas"
            equipmentName={laudoParams.equipmentName}
          />
        </div>
      )}

      {activeTab === "preview" && (
        <div className="p-6 md:p-10 flex-grow bg-slate-100 dark:bg-slate-950 font-sans overflow-y-auto">
          
          {/* Quick Download Buttons */}
          <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-center sm:justify-end gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
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
                const success = await copyRichText("laudo-heavy-printable-area");
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
              onClick={() => exportToWord("laudo-heavy-printable-area", `Laudo_LMP_${laudoParams.tag || "pesados"}_${laudoParams.laudoNumber.replace(/\//g, "-")}`)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Exportar p/ Word</span>
            </button>
            <button
              onClick={() => {
                const text = `LAUDO TÉCNICO DE INSPEÇÃO DE MÁQUINAS PESADAS - LMP\nREGISTRO: ${laudoParams.laudoNumber}\n\nCONTRATANTE: ${laudoParams.clientName}\nEQUIPAMENTO: ${laudoParams.equipmentName} (${laudoParams.brand} ${laudoParams.model})\nSÉRIE: ${laudoParams.serialNumber} | TAG: ${laudoParams.tag}\n\nPARECER TÉCNICO: ${conclusaoParecer}\n\nEmitido por VL Engenharia - Vitor Leonardo (CREA-PE 1822299490)`;
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `laudo_lmp_${laudoParams.tag || "pesados"}.txt`;
                a.click();
              }}
              className="flex items-center gap-2 bg-white border text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-red-600" />
              <span>Baixar Texto Oficial</span>
            </button>
          </div>

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
                <span>SEÇÃO 1: Introdução</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao2}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao2: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 2: Contratante</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao3}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao3: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 3: Contratada</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao4}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao4: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 4: Dados Equip.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao5}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao5: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 5: Documentos</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao6}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao6: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 6: Normas</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao7}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao7: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 7: Metodologia</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao8}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao8: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 8: Relatório Fotogr.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao9}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao9: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 9: Subsistemas</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao10}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao10: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 10: Checklist</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao11}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao11: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 11: Perigos / HRN</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao12}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao12: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 12: Não Conform.</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao13}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao13: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 13: Plano Ação</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao14}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao14: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 14: Conclusão</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={printConfig.secao15}
                  onChange={(e) => setPrintConfig({ ...printConfig, secao15: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                />
                <span>SEÇÃO 15: Limitações</span>
              </label>
            </div>
          </div>

          {/* Core print page container layout */}
          <div id="laudo-heavy-printable-area" className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-8 md:p-14 text-left leading-relaxed text-slate-900 rounded-3xl print:border-none print:shadow-none print:p-0 print:rounded-none">
            
            {/* CAPA PROFISSIONAL */}
            {printConfig.capa && (
              <div className="flex flex-col justify-between text-center border-b pb-8 print:border-b-0 print:pb-0" style={{ pageBreakAfter: "always" }}>
                
                <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-red-600 pb-6 gap-4">
                  <Logo variant="print" className="h-14" />
                  <div className="text-right text-xs font-mono text-slate-400">
                    <p>Laudo de Inspeção LMP</p>
                    <p className="font-bold text-slate-800 pt-0.5">{laudoParams.laudoNumber}</p>
                  </div>
                </div>

                <div className="my-auto py-6 space-y-6">
                  <span className="text-[10px] font-mono tracking-widest text-red-600 uppercase font-black bg-red-50 px-4 py-1.5 rounded-full">LAUDO TÉCNICO PERICIAL DE ATIVO PESADO</span>
                  
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-sans py-2 leading-tight">
                    INSPEÇÃO & LAUDO TÉCNICO DE SEGURANÇA MÁQUINAS PESADAS
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
                    <p><strong>ANO FABRICAÇÃO:</strong> {laudoParams.year} | <strong>HORÍMETRO:</strong> {laudoParams.horimetro} h</p>
                    <p><strong>TAG DO ATIVO:</strong> <span className="font-mono text-red-600 font-bold">{laudoParams.tag}</span></p>
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
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">Carta de Apresentação</h2>
                <p className="text-xs text-slate-600 font-mono text-right">Recife, {new Date().toLocaleDateString("pt-BR")}</p>
                
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  <p>À Direção de Ativos da <strong>{laudoParams.clientName}</strong>,</p>
                  <p>
                    Apresentamos para vossa auditoria o Relatório Pericial Completo de Segurança e Inspeção de Máquinas Pesadas LMP correspondente ao ativo <strong>{laudoParams.equipmentName}</strong>, vistoriado minuciosamente por nosso corpo técnico em vossas operações de campo.
                  </p>
                  <p>
                    Este diagnóstico técnico avalia a integridade dos sistemas mecânicos, hidráulicos sob pressão, freios, motores e conformidade protetiva ROPS/FOPS, aplicando a metodologia quantitativa internacional Hazard Rating Number (HRN) em alinhamento aos preceitos da NR-12, NR-11 e NR-18.
                  </p>
                  <p>
                    Ficamos à inteira disposição para suporte técnico sobre as intervenções e controles descritos no plano de ação cronológico.
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
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">Sumário Geral do Documento</h2>
                <div className="space-y-2 font-mono text-[11px] text-slate-600 font-medium">
                  <div className="flex justify-between"><span>SEÇÃO 1: Introdução, Escopo e Metodologia Pericial</span><span>03</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 2: Dados da Empresa Contratante</span><span>03</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 3: Dados da Empresa Contratada (VL Engenharia)</span><span>03</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 4: Dados Técnicos de Fabricação do Equipamento</span><span>04</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 5: Documentos Técnicos Analisados na Perícia</span><span>04</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 6: Normas Regulamentadoras e Legislações Aplicáveis</span><span>04</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 7: Metodologia Hazard Rating Number (HRN)</span><span>05</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 8: Relatório de Inspeção Visual e Fotográfica</span><span>05</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 9: Registro Detalhado da Inspeção por Subsistema</span><span>06</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 10: Checklist de Conformidade com a NR-12 / NR-18</span><span>07</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 11: Identificação dos Perigos e Apreciação de Risco (HRN)</span><span>08</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 12: Diagnóstico de Não Conformidades Regulamentares</span><span>09</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 13: Cronograma de Plano de Ação Recomendado</span><span>09</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 14: Conclusão Técnica e Parecer Pericial</span><span>10</span></div>
                  <div className="flex justify-between"><span>SEÇÃO 15: Limitações e Observações de Campo</span><span>10</span></div>
                </div>
              </div>
            )}

            {/* SEÇÃO 1: INTRODUÇÃO (PÁGINA DEDICADA NO PDF) */}
            {printConfig.secao1 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 1: Introdução, Escopo e Metodologia</h2>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_1}</p>
              </div>
            )}

            {/* SEÇÕES 2 E 3 */}
            {(printConfig.secao2 || printConfig.secao3) && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                {printConfig.secao2 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 2: Dados do Estabelecimento Contratante</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-50 border p-4 rounded-xl leading-relaxed">
                      <p><strong>Razão Social:</strong> {laudoParams.clientName}</p>
                      <p><strong>CNPJ:</strong> {laudoParams.cnpj}</p>
                      <p className="sm:col-span-2"><strong>Endereço Operacional:</strong> {laudoParams.address}</p>
                    </div>
                  </>
                )}

                {printConfig.secao3 && (
                  <>
                    <h2 className={`text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5 ${printConfig.secao2 ? "pt-6" : ""}`}>SEÇÃO 3: Qualificação Técnica da Empresa Contratada</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_3}</p>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO 4: DADOS DO EQUIPAMENTO */}
            {printConfig.secao4 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 4: Dados Técnicos de Fabricação do Equipamento</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border rounded-xl border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#1C3144] text-white">
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
                      <tr><td className="p-3 font-bold bg-slate-50">Identificador / TAG</td><td className="p-3 font-bold text-red-600">{laudoParams.tag}</td></tr>
                      <tr><td className="p-3 font-bold bg-slate-50">Horímetro de Trabalho</td><td className="p-3">{laudoParams.horimetro} h</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÕES 5, 6, 7 */}
            {(printConfig.secao5 || printConfig.secao6 || printConfig.secao7) && (
              <div className="py-12 border-b space-y-6">
                {printConfig.secao5 && (
                  <>
                    <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 5: Documentos Técnicos Analisados na Perícia</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_5}</p>
                  </>
                )}

                {printConfig.secao6 && (
                  <>
                    <h2 className={`text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5 ${printConfig.secao5 ? "pt-6" : ""}`}>SEÇÃO 6: Normas Regulamentadoras e Legislações Aplicáveis</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_6}</p>
                  </>
                )}

                {printConfig.secao7 && (
                  <>
                    <h2 className={`text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5 ${(printConfig.secao5 || printConfig.secao6) ? "pt-6" : ""}`}>SEÇÃO 7: Metodologia Hazard Rating Number (HRN)</h2>
                    <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_7}</p>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO 8: EVIDÊNCIAS FOTOGRÁFICAS */}
            {printConfig.secao8 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 8: Relatório de Inspeção Visual e Fotográfica</h2>
                
                {uploadedImages.length === 0 ? (
                  <div className="p-6 border border-dashed text-center rounded-xl bg-slate-50 text-xs text-slate-400 font-mono">
                    <span>Nenhum registro fotográfico anexado ao laudo na data de hoje.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="border rounded-xl p-3 bg-slate-50 space-y-3 font-mono text-[10px]">
                        <div className="aspect-video rounded-lg overflow-hidden border bg-white">
                          <img src={img.data} alt={`Anexo ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-bold uppercase text-slate-800">Fotografia Técnica {i+1}: {img.name}</p>
                          <p className="text-slate-500 leading-normal">{img.description}</p>
                          <p className="text-red-600 font-bold">STATUS DE DIAGNÓSTICO: OBSERVADO</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 9: SISTEMAS DE INSPEÇÃO */}
            {printConfig.secao9 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 9: Registro Detalhado da Inspeção por Subsistema</h2>
                
                <div className="space-y-4 text-xs font-sans text-slate-700">
                  <p><strong>9.1 Sistema de Propulsão e Transmissão:</strong> {sistemasInspecao.propulsao}</p>
                  <p><strong>9.2 Sistema Hidráulico:</strong> {sistemasInspecao.hidraulico}</p>
                  <p><strong>9.3 Sistema Elétrico e Eletrônico:</strong> {sistemasInspecao.eletrico}</p>
                  <p><strong>9.4 Sistema de Freios e Direção:</strong> {sistemasInspecao.freios}</p>
                  <p><strong>9.5 Estrutura e Chassi:</strong> {sistemasInspecao.estrutura}</p>
                  <p><strong>9.6 Cabine do Operador (ROPS/FOPS):</strong> {sistemasInspecao.cabine}</p>
                  <p><strong>9.7 Implementos e Acessórios:</strong> {sistemasInspecao.implementos}</p>
                  <p><strong>9.8 Rodagem (Pneus / Esteiras):</strong> {sistemasInspecao.rodagem}</p>
                  <p><strong>9.9 Dispositivos de Segurança:</strong> {sistemasInspecao.seguranca}</p>
                  <p><strong>9.10 Sistema de Escape e Motor Diesel:</strong> {sistemasInspecao.motor}</p>
                </div>
              </div>
            )}

            {/* SEÇÃO 10: CHECKLIST DE CONFORMIDADE */}
            {printConfig.secao10 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 10: Checklist de Conformidade da NR-12 / NR-18</h2>
                
                <div className="overflow-hidden">
                  <table className="w-full text-xs text-left border border-collapse" style={{ tableLayout: "fixed" }}>
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b text-[10px] uppercase font-mono">
                        <th className="p-3 w-[10%]">Ref</th>
                        <th className="p-3 w-[38%]">Item Inspecionado</th>
                        <th className="p-3 text-center w-[15%]">Conformidade</th>
                        <th className="p-3 w-[25%]">Observação / Nota Técnica</th>
                        <th className="p-3 text-center w-[12%]">Foto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {checklist.map((item) => (
                        <tr key={item.id} className="text-[11px] leading-relaxed">
                          <td className="p-3 font-mono font-bold break-all">{item.id.replace("chk_", "Nº ")}</td>
                          <td className="p-3 font-semibold text-slate-800 break-words">{item.text}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-black ${
                              item.resposta === "SIM" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : item.resposta === "NÃO" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {item.resposta === "SIM" ? "CONFORME" : item.resposta === "NÃO" ? "IRREGULAR" : "N/A"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium break-words">{item.nota}</td>
                          <td className="p-3 text-center">
                            {item.image ? (
                              <img src={item.image} alt={item.id} className="w-12 h-12 object-cover rounded mx-auto border" />
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

            {/* SEÇÃO 11: APRECIAÇÃO DE RISCO HRN */}
            {printConfig.secao11 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 11: Identificação dos Perigos e Apreciação de Risco (HRN)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <p className="font-mono font-bold uppercase text-red-600">GRAU DE RISCO SEM PROTEÇÃO (SITUAÇÃO PRÉVIA)</p>
                    <div className="font-mono text-[11px] space-y-1">
                      <p>LO (Probabilidade de Ocorrência): <strong>{hrnBefore.lo}</strong></p>
                      <p>FE (Frequência de Exposição): <strong>{hrnBefore.fe}</strong></p>
                      <p>DPH (Grau de Possível Lesão): <strong>{hrnBefore.dph}</strong></p>
                      <p>NP (Número de Pessoas Expostas): <strong>{hrnBefore.np}</strong></p>
                      <p className="text-lg text-red-600 font-black">SCORE HRN: {hrnBefore.score}</p>
                      <p className="uppercase text-[11px]">Classificação: <strong>{getHRNClassification(hrnBefore.score).label}</strong></p>
                    </div>
                    <p className="pt-2 border-t font-sans text-slate-600 text-[11px]">{hrnBefore.explicacao}</p>
                  </div>

                  <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <p className="font-mono font-bold uppercase text-emerald-600">GRAU DE RISCO ADEQUADO (SITUAÇÃO RESIDUAL)</p>
                    <div className="font-mono text-[11px] space-y-1">
                      <p>LO (Probabilidade de Ocorrência): <strong>{hrnAfter.lo}</strong></p>
                      <p>FE (Frequência de Exposição): <strong>{hrnAfter.fe}</strong></p>
                      <p>DPH (Grau de Possível Lesão): <strong>{hrnAfter.dph}</strong></p>
                      <p>NP (Número de Pessoas Expostas): <strong>{hrnAfter.np}</strong></p>
                      <p className="text-lg text-emerald-600 font-black">SCORE HRN: {hrnAfter.score}</p>
                      <p className="uppercase text-[11px]">Classificação: <strong>{getHRNClassification(hrnAfter.score).label}</strong></p>
                    </div>
                    <p className="pt-2 border-t font-sans text-slate-600 text-[11px]">{hrnAfter.explicacao}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 12: NÃO CONFORMIDADES */}
            {printConfig.secao12 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 12: Diagnóstico de Não Conformidades Regulamentares</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b text-[10px] uppercase font-mono">
                        <th className="p-3">ID</th>
                        <th className="p-3">Irregularidade Identificada</th>
                        <th className="p-3">Norma Violada</th>
                        <th className="p-3 text-center">Criticidade</th>
                        <th className="p-3">Risco Associado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium text-[11px]">
                      {naoConformidades.map((nc) => (
                        <tr key={nc.id} className="hover:bg-slate-50/30">
                          <td className="p-3 font-mono font-bold text-red-600">{nc.id}</td>
                          <td className="p-3 text-slate-800 leading-relaxed">{nc.descricao}</td>
                          <td className="p-3 font-mono text-slate-500">{nc.norma}</td>
                          <td className="p-3 text-center">
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded text-[9px] font-black uppercase font-mono">
                              {nc.criticidade}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{nc.risco}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÃO 13: PLANO DE AÇÃO */}
            {printConfig.secao13 && (
              <div className="py-12 border-b space-y-6">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 13: Cronograma de Plano de Ação Recomendado</h2>
                
                <div className="overflow-hidden">
                  <table className="w-full text-xs text-left border border-collapse" style={{ tableLayout: "fixed" }}>
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b text-[10px] uppercase font-mono">
                        <th className="p-3 w-[8%]">Ação</th>
                        <th className="p-3 w-[32%]">Irregularidade / Problema</th>
                        <th className="p-3 w-[35%]">Medida de Controle Recomendada</th>
                        <th className="p-3 text-center w-[15%]">Prioridade</th>
                        <th className="p-3 w-[10%]">Prazo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-medium text-[11px]">
                      {planoAcao.map((ap) => (
                        <tr key={ap.id} className="hover:bg-slate-50/30">
                          <td className="p-3 font-mono font-bold text-[#1C3144] break-all">{ap.id}</td>
                          <td className="p-3 text-slate-800 font-semibold break-words">{ap.problema}</td>
                          <td className="p-3 text-slate-600 leading-relaxed break-words">{ap.recomendacao}</td>
                          <td className="p-3 text-center">
                            <span className="bg-slate-100 text-slate-800 border px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                              {ap.prioridade}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#1C3144] break-all">{ap.prazo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEÇÃO 14: CONCLUSÃO */}
            {printConfig.secao14 && (
              <div className="py-12 border-b space-y-6" style={{ pageBreakBefore: "always", pageBreakAfter: "always" }}>
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 14: Conclusão Técnica e Parecer Pericial</h2>
                
                <div className="p-6 border-2 border-red-600 bg-red-50/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-red-600/20">
                    <span className="font-mono text-xs uppercase font-bold text-slate-500">Resultado da Avaliação do Ativo:</span>
                    <span className="text-base font-black font-mono text-red-600 bg-red-50 border border-red-200 px-4 py-1 rounded-xl">
                      {conclusaoStatus}
                    </span>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-slate-800 font-sans font-medium whitespace-pre-wrap">
                    {conclusaoParecer}
                  </p>

                </div>
              </div>
            )}

            {/* SEÇÃO 15: LIMITAÇÕES */}
            {printConfig.secao15 && (
              <div className="py-12 space-y-4 print-avoid-break">
                <h2 className="text-lg font-bold font-mono uppercase text-[#1C3144] border-b pb-1.5">SEÇÃO 15: Limitações e Observações Técnicas de Campo</h2>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_18}</p>
              </div>
            )}

            {/* CENTERED SIGNATURE BLOCK AS SPECIFIED */}
            <div className="py-12 text-center space-y-6 print-avoid-break border-t border-slate-200 mt-8">
              <div className="pt-4 space-y-1">
                <p className="text-base font-black text-slate-950">Vitor Leonardo Cordeiro Linhares</p>
                <p className="text-xs text-slate-700 font-medium">Eng. Mecânico | Esp. Projetos Mecânicos | Esp. Engenharia da Manutenção</p>
                <p className="text-xs text-slate-700 font-medium">Esp.Adequações  de  máquinas e equipamentos.</p>
                <p className="text-xs text-slate-600 font-bold font-mono uppercase">CREA PE</p>
                <p className="text-xs text-slate-900 font-extrabold uppercase tracking-wider">VL Engenharia</p>
              </div>
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
                      Espaço reservado para inserção e anexação do PDF da **ART (Anotação de Responsabilidade Técnica)** devidamente emitida e quitada junto ao CREA, vinculada a esta inspeção técnica pericial de conformidade para máquinas pesadas.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    [O PDF da ART assinado e quitado deve ser inserido nesta página]
                  </div>
                </div>
              </div>
              <div className="text-center font-mono text-[9px] text-slate-400">
                <p>Laudo Técnico de Inspeção • VL Engenharia • Página de Anexos</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
