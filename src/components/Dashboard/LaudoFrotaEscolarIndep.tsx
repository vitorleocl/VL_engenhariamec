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
  Car
} from "lucide-react";

interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  status: "C" | "NC" | "N/A";
  nota: string;
  image?: string;
}

// Default 17 Checklist groups for school bus inspection
const DEFAULT_SCHOOL_BUS_CHECKLIST: ChecklistItem[] = [
  // 1. Hodômetro
  { id: "fe_1_hodometro", category: "1. Hodômetro", name: "Funcionamento do hodômetro e marcação visível", status: "C", nota: "Hodômetro operacional indicando quilometragem de forma nítida." },
  
  // 2. Sistema Elétrico
  { id: "fe_2_farois", category: "2. Sistema Elétrico", name: "Faróis (baixo e alto) regulados e operacionais", status: "C", nota: "Faróis em pleno funcionamento com facho luminoso adequado." },
  { id: "fe_2_faroletes", category: "2. Sistema Elétrico", name: "Faroletes e luzes de posição (lanternas dianteiras/traseiras)", status: "C", nota: "Lanternas e luzes de posição operacionais." },
  { id: "fe_2_setas", category: "2. Sistema Elétrico", name: "Luzes indicadoras de direção (setas dianteiras e traseiras)", status: "C", nota: "Setas piscando no tempo regulamentar em ambos os lados." },
  { id: "fe_2_emergencia", category: "2. Sistema Elétrico", name: "Luzes de emergência (pisca-alerta)", status: "C", nota: "Pisca-alerta aciona todas as lâmpadas simultaneamente." },
  { id: "fe_2_buzina", category: "2. Sistema Elétrico", name: "Buzina operacional com som contínuo e audível", status: "C", nota: "Buzina funcional emitindo som regulamentar." },
  { id: "fe_2_freio_placa_re", category: "2. Sistema Elétrico", name: "Luzes de freio, iluminação de placa e luz de ré", status: "C", nota: "Sistemas luminosos traseiros operacionais." },
  { id: "fe_2_brake_light", category: "2. Sistema Elétrico", name: "Brake-light (luz de freio elevada)", status: "C", nota: "Brake-light funcionando sem Leds queimados." },
  { id: "fe_2_bateria", category: "2. Sistema Elétrico", name: "Bateria (fixação, bornes limpos e sem vazamento)", status: "C", nota: "Bateria selada, fixada no cofre de forma segura." },
  { id: "fe_2_alternador", category: "2. Sistema Elétrico", name: "Alternador, chicotes elétricos e motor de arranque", status: "C", nota: "Tensão de carga estável, chicotes organizados e sem emendas expostas." },
  
  // 3. Equipamentos Obrigatórios
  { id: "fe_3_triangulo", category: "3. Equipamentos Obrigatórios", name: "Triângulo de sinalização de emergência", status: "C", nota: "Disponível no porta-malas em perfeitas condições." },
  { id: "fe_3_chave_roda", category: "3. Equipamentos Obrigatórios", name: "Chave de roda e macaco compatível", status: "C", nota: "Ferramentas presentes e operacionais no veículo." },
  { id: "fe_3_para_sol", category: "3. Equipamentos Obrigatórios", name: "Para-sol para o condutor", status: "C", nota: "Presente e articulando normalmente." },
  { id: "fe_3_retrovisores", category: "3. Equipamentos Obrigatórios", name: "Espelhos retrovisores internos e externos (em ambos os lados)", status: "C", nota: "Retrovisores íntegros com ajuste firme." },
  { id: "fe_3_limpador", category: "3. Equipamentos Obrigatórios", name: "Limpador e lavador do para-brisa", status: "C", nota: "Palhetas em bom estado varrendo adequadamente." },
  { id: "fe_3_placas", category: "3. Equipamentos Obrigatórios", name: "Placas de identificação legíveis e lacradas", status: "C", nota: "Placas Mercosul em perfeitas condições." },
  { id: "fe_3_cinto", category: "3. Equipamentos Obrigatórios", name: "Cinto de segurança para todos os ocupantes (individual)", status: "C", nota: "Cintos retráteis de 3 pontos em perfeito travamento." },
  { id: "fe_3_tacografo", category: "3. Equipamentos Obrigatórios", name: "Registrador instantâneo de velocidade (tacógrafo) verificado", status: "C", nota: "Tacógrafo certificado pelo INMETRO dentro da validade." },
  { id: "fe_3_extintor", category: "3. Equipamentos Obrigatórios", name: "Extintor de incêndio com carga e validade em dia", status: "C", nota: "Extintor de pó ABC operacional no suporte do motorista." },
  
  // 4. Motor
  { id: "fe_4_funcionamento", category: "4. Motor", name: "Funcionamento regular do motor (estabilidade e marcha lenta)", status: "C", nota: "Motor responde bem ao acelerar, sem ruídos anômalos." },
  { id: "fe_4_vazamentos", category: "4. Motor", name: "Ausência de vazamento de fluidos (óleo, líquido de arrefecimento)", status: "C", nota: "Cofre do motor limpo, sem sinais de vazamentos." },
  { id: "fe_4_mangueiras", category: "4. Motor", name: "Mangueiras e conexões de fluidos íntegras", status: "C", nota: "Mangueiras flexíveis sem ressecamentos ou trincas." },
  { id: "fe_4_correias", category: "4. Motor", name: "Correias de acessórios e esticadores regulados", status: "C", nota: "Correia de acessórios sem desgaste aparente." },
  { id: "fe_4_escapamento", category: "4. Motor", name: "Escapamento íntegro, nível de ruído e fumaça sob controle", status: "C", nota: "Silenciador em perfeito estado, gases sem cor ou odor fora do padrão." },
  
  // 5. Caixa de Marchas
  { id: "fe_5_fixacao", category: "5. Caixa de Marchas", name: "Fixação física do conjunto de câmbio", status: "C", nota: "Coxins de suporte íntegros." },
  { id: "fe_5_funcionamento", category: "5. Caixa de Marchas", name: "Engates precisos das marchas e ausência de folga", status: "C", nota: "Transmissão manual/automática respondendo sem patinar." },
  
  // 6. Transmissão
  { id: "fe_6_carda_semi_eixos", category: "6. Transmissão", name: "Semi-eixos, juntas homocinéticas e cardã sem folga", status: "C", nota: "Coifas de proteção íntegras e lubrificadas." },
  { id: "fe_6_rolamentos", category: "6. Transmissão", name: "Rolamentos de roda e cubos sem ruído", status: "C", nota: "Rolamentos testados em pista, livres de folga." },
  { id: "fe_6_embreagem", category: "6. Transmissão", name: "Embreagem (curso, pedal e acionamento macio)", status: "C", nota: "Pedal com curso livre ideal e engate suave." },
  
  // 7. Direção
  { id: "fe_7_caixa", category: "7. Direção", name: "Caixa de direção e terminais sem folgas", status: "C", nota: "Terminais e barras de direção sem desgaste ou folgas nocivas." },
  { id: "fe_7_acao", category: "7. Direção", name: "Ação de esterçamento suave e sem ruído", status: "C", nota: "Direção hidráulica/elétrica operando perfeitamente." },
  
  // 8. Suspensão
  { id: "fe_8_amortecedores", category: "8. Suspensão", name: "Amortecedores (ausência de vazamentos e estabilidade)", status: "C", nota: "Amortecedores retendo oscilação de forma eficiente." },
  { id: "fe_8_molas", category: "8. Suspensão", name: "Molas helicoidais ou feixe de molas, suportes íntegros", status: "C", nota: "Feixes sem lâminas quebradas, buchas reguladas." },
  { id: "fe_8_pivos", category: "8. Suspensão", name: "Pivôs, buchas, leques e barras estabilizadoras", status: "C", nota: "Componentes articulados sem folgas ou desgaste excessivo." },
  
  // 9. Freios
  { id: "fe_9_pedal", category: "9. Freios", name: "Pedal de freio resistente (sem curso elástico)", status: "C", nota: "Pressão hidráulica correta, sem ar no sistema." },
  { id: "fe_9_oleo", category: "9. Freios", name: "Nível de fluido de freio adequado", status: "C", nota: "Reservatório no nível máximo, fluido limpo." },
  { id: "fe_9_servico", category: "9. Freios", name: "Freio de serviço (eficiência em pista de teste)", status: "C", nota: "Frenagem uniforme sem desvios de trajetória." },
  { id: "fe_9_estacionamento", category: "9. Freios", name: "Freio de estacionamento (freio de mão) funcional", status: "C", nota: "Retenção mecânica eficaz na inclinação de teste." },
  
  // 10. Chassi
  { id: "fe_10_estado", category: "10. Chassi", name: "Estado de conservação das longarinas e travessas", status: "C", nota: "Estrutura metálica original de fábrica." },
  { id: "fe_10_trincas", category: "10. Chassi", name: "Ausência total de trincas ou soldas de reparo estrutural", status: "C", nota: "Chassi íntegro, sem marcas de empenamentos." },
  
  // 11. Carroceria
  { id: "fe_11_portas", category: "11. Carroceria", name: "Portas, janelas, vidros de segurança e trincos", status: "C", nota: "Janelas correndo com limitadores de abertura originais." },
  { id: "fe_11_para_choques", category: "11. Carroceria", name: "Para-choques dianteiro e traseiro, grade e molduras", status: "C", nota: "Para-choques homologados e fixados rigidamente." },
  { id: "fe_11_macanetas", category: "11. Carroceria", name: "Maçanetas e fechaduras das portas funcionais", status: "C", nota: "Portas abrem e fecham perfeitamente de fora e de dentro." },
  { id: "fe_11_vedacoes", category: "11. Carroceria", name: "Borrachas de vedação de portas e porta-malas", status: "C", nota: "Borrachas retendo infiltração perfeitamente." },
  
  // 12. Lanternagem
  { id: "fe_12_lataria", category: "12. Lanternagem", name: "Estado geral das chapas de lataria, sem amassados graves", status: "C", nota: "Painéis de lataria alinhados." },
  
  // 13. Pintura
  { id: "fe_13_pintura", category: "13. Pintura", name: "Pintura geral conservada, sem descascados severos", status: "C", nota: "Brilho e tom originais preservados." },
  { id: "fe_13_faixa_escolar", category: "13. Pintura", name: "Faixa amarela com inscrição 'ESCOLAR' preta de 40cm", status: "C", nota: "Faixa regulamentar em toda a extensão do veículo." },
  { id: "fe_13_faixas_refletivas", category: "13. Pintura", name: "Faixas refletivas de segurança traseiras e laterais", status: "C", nota: "Dispositivos retrorrefletivos aplicados e homologados." },
  
  // 14. Capotaria
  { id: "fe_14_bancos", category: "14. Capotaria", name: "Estado de conservação e fixação dos assentos", status: "C", nota: "Bancos estofados higienizados, sem espuma exposta." },
  { id: "fe_14_forracao", category: "14. Capotaria", name: "Forrações de teto, portas e laterais internas", status: "C", nota: "Painéis internos bem afixados e conservados." },
  
  // 15. Pneus/Rodas
  { id: "fe_15_sulcos", category: "15. Pneus/Rodas", name: "Sulcos dos pneus acima de 1,6 mm (TWI não atingido)", status: "C", nota: "Profundidade de sulco ideal em todos os eixos (> 3 mm)." },
  { id: "fe_15_estado_pneus", category: "15. Pneus/Rodas", name: "Pneus sem bolhas, deformações ou cortes na carcaça", status: "C", nota: "Banda de rodagem e ombros sem avarias estruturais." },
  { id: "fe_15_rodas", category: "15. Pneus/Rodas", name: "Rodas sem trincas, amassados ou parafusos faltantes", status: "C", nota: "Rodas de aço originais perfeitamente balanceadas." },
  
  // 16. Limpeza
  { id: "fe_16_limpeza", category: "16. Limpeza", name: "Limpeza interna e externa, polimento e conservação", status: "C", nota: "Veículo limpo e higienizado para transporte coletivo escolar." },
  
  // 17. Idade do veículo
  { id: "fe_17_idade", category: "17. Idade do veículo", name: "Idade máxima do veículo dentro do regulamento municipal", status: "C", nota: "Veículo com idade inferior ao limite de circulação de frotas escolares." }
];

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoFrotaEscolarIndep({ onBack, initialPrefilled = false, clients }: Props) {
  const [activeTab, setActiveTab] = useState<"params" | "checklist" | "pricing" | "preview">("params");
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleCoverPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then(base64 => {
      setCoverPhoto(base64);
    }).catch(err => {
      console.error(err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(undefined);
  };

  const handleChecklistImageUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then(base64 => {
      setChecklist(prev => prev.map(item => item.id === id ? { ...item, image: base64 } : item));
    }).catch(err => {
      console.error(err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, image: reader.result as string } : item));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeChecklistImage = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, image: undefined } : item));
  };

  // Core Parameters state
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LFE-102/2026 Rev. 00",
    clientName: "João da Silva Transportes ME",
    cnpj: "00.000.000/0001-00",
    address: "Rua do Sol, 456, Centro, Recife-PE",
    laudoDate: "08/07/2026",
    inspectionTime: "09:00",
    inspectionCity: "Recife",
    inspectionState: "PE",
    weather: "Ensolarado",
    odometro_km: "128450",
    
    // Vehicle specs
    plate: "ABC-1234",
    renavam: "123456789",
    marca_modelo: "Mercedes-Benz / Caio Apache S21",
    carroceria: "Ônibus Urbano Escolar",
    ano_fabricacao_modelo: "2015/2016",
    chassi: "9BM384029283749281",
    numero_motor: "OM904LA-192837",
    capacidade_passageiros: "47",
    emissao_crv: "14/05/2016",

    // Engineer specs
    engName: "Vitor Leonardo",
    engCpf: "109.876.543-21",
    engCrea: "1822299490 - PE",
    engConfea: "000000",
    artNumber: "ART-PE202619283",
    localPortaria: "Portaria DETRAN/PE nº 1498/2019",
    notes: "",
    normasAdicionais: "Resolução CONTRAN nº 953/2022, Lei nº 9.503/1997 (CTB)"
  });

  // Structural lists and checklists
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_SCHOOL_BUS_CHECKLIST);
  const [conclusao, setConclusao] = useState({
    status: "APROVADO" as "APROVADO" | "REPROVADO",
    parecer: "O veículo foi vistoriado fisicamente sob as normas aplicáveis ao transporte escolar e encontra-se em perfeitas condições mecânicas e de segurança."
  });

  const [secoes, setSecoes] = useState<Record<string, string>>({
    secao_1: "Este Laudo Técnico de Inspeção Veicular tem como objetivo primordial auditar as condições de integridade física, funcionalidade e conformidade de segurança do veículo automotor destinado ao Transporte Escolar para certificar suas plenas condições de circulação e segurança viária ativa e passiva.",
    secao_2: `O presente estudo pericial atende especificamente ao veículo Mercedes-Benz / Caio Apache S21, placa ABC-1234, de propriedade de João da Silva Transportes ME, garantindo o cumprimento rígido das regras de segurança estabelecidas pelas resoluções do CONTRAN e normas da ABNT.`,
    secao_3: "Órgão Pericial Emissor: VL Engenharia. Responsável Técnico de Inspeção: Eng. Mecânico Vitor Leonardo (CREA-PE 1822299490). Especialista em Auditorias Automotivas, Perícia Mecânica de Trânsito e Enquadramento Legal de Transporte Escolar.",
    secao_5: "Evidências analisadas: Registro fotográfico in loco de todos os ângulos estruturais, verificação de pneus, cintos de segurança individuais, saídas de emergência, faixas refletivas obrigatórias e análise documental completa.",
    secao_6: "Normas e legislação balizadoras: Código de Trânsito Brasileiro (CTB - Lei 9.503/1997 - Artigos 136 e 138), Resolução CONTRAN nº 916/2022 (requisitos de segurança para transporte escolar), ABNT NBR 14040 e NBR 17075:2022.",
    secao_17: "Esta avaliação técnica pericial limita-se aos aspectos mecânicos externos e estruturais observados no veículo na data de inspeção. É dever ético e legal do proprietário assegurar a manutenção contínua e semestral do veículo conforme regulamentações locais.",
    secao_18: "Anexos e Documentações de Suporte: Registro de fotos de alta fidelidade dos itens de conformidade, ART emitida sob o número correspondente à respectiva guia de responsabilidade técnica perante o CREA-PE."
  });

  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize prefilled if requested
  useEffect(() => {
    if (initialPrefilled) {
      handlePrefill();
    }
  }, [initialPrefilled]);

  const handlePrefill = () => {
    setChecklist(DEFAULT_SCHOOL_BUS_CHECKLIST.map(item => {
      // simulate all conforme
      return { ...item, status: "C", nota: "Em perfeita conformidade de funcionamento técnico e mecânico." };
    }));
    setConclusao({
      status: "APROVADO",
      parecer: "Após minuciosa vistoria técnica mecânica e estrutural nos 17 blocos de requisitos regulamentados, certifica-se que o veículo se encontra em pleno estado de conservação, apto a circular no transporte escolar sob as resoluções vigentes do CONTRAN e ABNT NBR 17075:2022."
    });
  };

  const handleFieldChange = (field: keyof typeof laudoParams, value: string) => {
    setLaudoParams(p => {
      const updated = { ...p, [field]: value };
      
      // Update dynamic sections locally
      if (field === "marca_modelo" || field === "plate" || field === "clientName") {
        setSecoes(prev => ({
          ...prev,
          secao_2: `O presente estudo pericial atende especificamente ao veículo ${updated.marca_modelo}, placa ${updated.plate}, de propriedade de ${updated.clientName}, garantindo o cumprimento rígido das regras de segurança estabelecidas pelas resoluções do CONTRAN e normas da ABNT.`
        }));
      }
      return updated;
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [
          ...prev,
          {
            name: file.name,
            data: reader.result as string,
            description: "Vista de Inspeção Técnica"
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleChecklistStatusChange = (id: string, status: "C" | "NC" | "N/A") => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        let note = "Em conformidade.";
        if (status === "NC") {
          note = "Não conformidade constatada em vistoria física.";
        } else if (status === "N/A") {
          note = "Não aplicável a este modelo de veículo.";
        }
        return { ...item, status, nota: note };
      }
      return item;
    }));
  };

  const handleChecklistNoteChange = (id: string, nota: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, nota };
      }
      return item;
    }));
  };

  // --- AUTOMATION AI TRIGGER ---
  const triggerAIEngine = async () => {
    if (!laudoParams.marca_modelo || !laudoParams.plate) {
      alert("Por favor, preencha a marca/modelo e placa do veículo antes de acionar a inteligência.");
      return;
    }
    setLoadingAI(true);
    try {
      const payload = {
        ...laudoParams,
        notes: aiPrompt || laudoParams.notes,
        images: uploadedImages.slice(0, 3).map(img => ({
          data: img.data,
          mimeType: img.data.split(";")[0].split(":")[1] || "image/jpeg"
        }))
      };

      // Call vehicle inspection AI with specialized school bus context
      const res = await fetch("/api/gemini/vehicle-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          brand: laudoParams.marca_modelo.split("/")[0]?.trim() || laudoParams.marca_modelo,
          model: laudoParams.marca_modelo.split("/")[1]?.trim() || laudoParams.marca_modelo,
          notes: `[TRANSPORTE ESCOLAR - EXIGÊNCIAS CONTRAN E NBR 17075:2022] ${payload.notes}`
        })
      });

      if (!res.ok) {
        throw new Error("Erro na requisição do servidor.");
      }

      const data = await res.json();
      
      // Map AI results to our 17 school bus items
      if (data.checklist) {
        setChecklist(prev => prev.map((item, i) => {
          // find equivalent index or prompt matches
          const match = data.checklist[`item_${(i % 20) + 1}`];
          if (match) {
            return { 
              ...item, 
              status: match.resposta === "SIM" ? "C" : match.resposta === "NÃO" ? "NC" : "N/A", 
              nota: match.nota 
            };
          }
          return item;
        }));
      }

      if (data.conclusao) {
        setConclusao({
          status: data.conclusao.status === "APROVADO" ? "APROVADO" : "REPROVADO",
          parecer: `[Auditoria Escolar] ${data.conclusao.parecer}`
        });
      }

      if (data.secoes) {
        setSecoes(prev => ({
          ...prev,
          ...data.secoes,
          secao_1: "Este Laudo Técnico de Inspeção de Transporte Escolar tem por finalidade registrar e atestar a integridade operacional e mecânica do veículo escolar conforme as exigências semestrais do Código de Trânsito Brasileiro e normas da ABNT NBR 17075:2022.",
          secao_6: `Base Legal: CTB (Lei 9.503/1997, Artigos 136 e 138), Resolução CONTRAN nº 916/2022, ABNT NBR 14040, NBR 17075:2022 e portarias aplicáveis do DETRAN (${laudoParams.localPortaria}).`
        }));
      }

      alert("Análise pericial realizada com sucesso pela Inteligência Artificial!");
      setActiveTab("preview");
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API da Inteligência Artificial. Usando gerador simulado local.");
      handlePrefill();
    } finally {
      setLoadingAI(false);
    }
  };

  const printLaudoPDF = async () => {
    if (!reportRef.current) return;
    preprocessStylesheets();
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `laudo-escola-${laudoParams.plate}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
    };
    try {
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
    exportToWord("laudo-printable-area", `${laudoParams.laudoNumber.replace(/\//g, "-")}-inspecao-escolar`);
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
            <Car className="w-6 h-6 text-amber-500 animate-pulse" />
            <span>Gerador Laudo Frota Escolar (CONTRAN & NBR 17075)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Inspeção semestral de transporte de escolares conforme Artigos 136 e 138 do CTB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            title="Alternar Modo Foco"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={printLaudoPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Word</span>
          </button>
          <button
            onClick={handleCopyRichText}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* AI AUTOMATION BLOCK */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Motor Inteligência Escolar (CREA)</h3>
            </div>
            <p className="text-slate-300 text-xs">
              Digite observações do teste em campo ou anexe imagens das vistorias. O sistema Gemini auditará as não conformidades normativas específicas da NBR 17075:2022 e CTB.
            </p>

            <div className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Exemplo: Ônibus Caio Apache ano 2015. Pneu traseiro direito desgastado acima do limite TWI. Tacógrafo com calibração vencida há 1 mês, demais itens elétricos e de frenagem estão normais..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Anexar Fotos</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrefill}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                >
                  Simular Tudo Conforme
                </button>
                <button
                  onClick={triggerAIEngine}
                  disabled={loadingAI}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {loadingAI ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Gerar com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 h-16">
                    <img src={img.data} alt="Upload" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDIT TABS */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("params")}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                activeTab === "params" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Parâmetros
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                activeTab === "checklist" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Checklist (17 Blocos)
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "pricing" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              Precificação
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                activeTab === "preview" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Visualização
            </button>
          </div>

          {/* TAB CONTENTS */}
          {activeTab === "pricing" && (
            <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              <LaudoPricingTab 
                clientName={laudoParams.clientName}
                serviceType="Vistoria e Inspeção de Frota Escolar"
                equipmentName={laudoParams.marca_modelo || "Frota Escolar"}
              />
            </div>
          )}

          {activeTab === "params" && (
            <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2">Informações do Veículo e Proprietário</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Número do Laudo</label>
                  <input
                    type="text"
                    value={laudoParams.laudoNumber}
                    onChange={e => handleFieldChange("laudoNumber", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Marca / Modelo</label>
                  <input
                    type="text"
                    value={laudoParams.marca_modelo}
                    onChange={e => handleFieldChange("marca_modelo", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Placa</label>
                  <input
                    type="text"
                    value={laudoParams.plate}
                    onChange={e => handleFieldChange("plate", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">RENAVAM</label>
                  <input
                    type="text"
                    value={laudoParams.renavam}
                    onChange={e => handleFieldChange("renavam", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chassi</label>
                  <input
                    type="text"
                    value={laudoParams.chassi}
                    onChange={e => handleFieldChange("chassi", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nº do Motor</label>
                  <input
                    type="text"
                    value={laudoParams.numero_motor}
                    onChange={e => handleFieldChange("numero_motor", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Capacidade Passageiros</label>
                  <input
                    type="text"
                    value={laudoParams.capacidade_passageiros}
                    onChange={e => handleFieldChange("capacidade_passageiros", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Emissão CRV</label>
                  <input
                    type="text"
                    value={laudoParams.emissao_crv}
                    onChange={e => handleFieldChange("emissao_crv", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Proprietário</label>
                  <input
                    type="text"
                    value={laudoParams.clientName}
                    onChange={e => handleFieldChange("clientName", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={laudoParams.cnpj}
                    onChange={e => handleFieldChange("cnpj", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço</label>
                  <input
                    type="text"
                    value={laudoParams.address}
                    onChange={e => handleFieldChange("address", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
              </div>

              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2 pt-4">Dados Técnicos e Portarias</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Vistoria</label>
                  <input
                    type="text"
                    value={laudoParams.laudoDate}
                    onChange={e => handleFieldChange("laudoDate", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                  <input
                    type="text"
                    value={laudoParams.inspectionTime}
                    onChange={e => handleFieldChange("inspectionTime", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Município da Vistoria</label>
                  <input
                    type="text"
                    value={laudoParams.inspectionCity}
                    onChange={e => handleFieldChange("inspectionCity", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hodômetro (KM)</label>
                  <input
                    type="text"
                    value={laudoParams.odometro_km}
                    onChange={e => handleFieldChange("odometro_km", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Portaria DETRAN / Regulamento Municipal</label>
                  <input
                    type="text"
                    value={laudoParams.localPortaria}
                    onChange={e => handleFieldChange("localPortaria", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Normas de Referência Adicionais / Internacionais</label>
                  <textarea
                    placeholder="Ex: Resolução CONTRAN nº 953/2022, Lei nº 9.503/1997 (CTB), etc. (Separe por vírgulas)"
                    value={laudoParams.normasAdicionais || ""}
                    onChange={e => handleFieldChange("normasAdicionais", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                    rows={2}
                  />
                </div>
              </div>

              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2 pt-4">Assinatura do Engenheiro</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Responsável Técnico</label>
                  <input
                    type="text"
                    value={laudoParams.engName}
                    onChange={e => handleFieldChange("engName", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Registro CREA</label>
                  <input
                    type="text"
                    value={laudoParams.engCrea}
                    onChange={e => handleFieldChange("engCrea", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nº da ART</label>
                  <input
                    type="text"
                    value={laudoParams.artNumber}
                    onChange={e => handleFieldChange("artNumber", e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Resultado Conclusivo</label>
                  <select
                    value={conclusao.status}
                    onChange={e => setConclusao(c => ({ ...c, status: e.target.value as any }))}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  >
                    <option value="APROVADO">APROVADO</option>
                    <option value="REPROVADO">REPROVADO</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Parecer Pericial Conclusivo</label>
                  <textarea
                    value={conclusao.parecer}
                    onChange={e => setConclusao(c => ({ ...c, parecer: e.target.value }))}
                    className="w-full h-24 text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1 col-span-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Foto de Capa do Veículo</label>
                  {coverPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 group">
                      <img src={coverPhoto} alt="Capa" className="w-full h-full object-cover" />
                      <button
                        onClick={removeCoverPhoto}
                        type="button"
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-amber-500 cursor-pointer transition">
                      <Upload className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-500">Enviar Foto para a Capa</span>
                      <span className="text-[10px] text-slate-400 mt-1">Carregar registro fotográfico geral</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase">Lista de Verificação (17 Grupos)</h3>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 border px-2.5 py-1 rounded">
                  {checklist.filter(item => item.status === "C").length} / {checklist.length} Conformes
                </span>
              </div>

              <div className="space-y-6">
                {/* Accordion list */}
                {Array.from(new Set(checklist.map(item => item.category))).map(cat => (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-xs font-black text-[#134074] dark:text-[#4895EF] border-b pb-1 uppercase tracking-wider font-mono">
                      {cat}
                    </h4>
                    <div className="space-y-4">
                      {checklist.filter(item => item.category === cat).map(item => (
                        <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-850 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-sans text-slate-800 dark:text-slate-200 font-medium">
                              {item.name}
                            </span>
                            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
                              {(["C", "NC", "N/A"] as const).map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleChecklistStatusChange(item.id, st)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-black font-sans uppercase transition cursor-pointer ${
                                    item.status === st
                                      ? st === "C"
                                        ? "bg-emerald-500 text-white"
                                        : st === "NC"
                                        ? "bg-red-500 text-white"
                                        : "bg-slate-500 text-white"
                                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-8 space-y-1">
                              <label className="text-[9px] uppercase text-slate-400 font-mono">Nota / Evidência técnica</label>
                              <input
                                type="text"
                                value={item.nota}
                                onChange={e => handleChecklistNoteChange(item.id, e.target.value)}
                                className="w-full text-xs p-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-4 flex items-center justify-end">
                              {item.image ? (
                                <div className="relative w-20 h-10 rounded border border-slate-200 dark:border-slate-800 overflow-hidden group shrink-0">
                                  <img src={item.image} alt="Evidência" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => removeChecklistImage(item.id)}
                                    type="button"
                                    className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 hover:bg-red-700 rounded-full text-white transition shrink-0"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-1 cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Adicionar Foto</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleChecklistImageUpload(item.id, e)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Info className="w-8 h-8 text-[#134074] dark:text-[#4895EF] mx-auto animate-bounce" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">Visualização de Impressão Ativada</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                O painel da direita exibe o laudo renderizado em tempo real no formato oficial de engenharia A4 da <strong>VL Engenharia</strong>.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE PRINTABLE PREVIEW */}
        <div className="lg:col-span-7">
          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border dark:border-slate-850 shadow-inner max-h-[85vh] overflow-y-auto">
            <div 
              ref={reportRef} 
              id="laudo-printable-area"
              className="bg-white text-slate-950 w-full p-[15mm] md:p-[20mm] mx-auto shadow-2xl rounded-sm text-left font-sans text-xs space-y-8"
              style={{ minHeight: "297mm", color: "#000" }}
            >
              {/* PAGE 1: COVER */}
              <div className="space-y-8 min-h-[250mm] flex flex-col justify-between">
                {/* Header branding */}
                <div className="flex justify-between items-center border-b-2 border-[#134074] pb-4">
                  <Logo variant="print" className="h-12" />
                  <div className="text-right text-[8px] font-mono text-slate-500 uppercase text-slate-500">
                    <div>PVE — Frota Escolar</div>
                    <div>Rev. 00 — Confidencial</div>
                  </div>
                </div>

                {/* Main titles */}
                <div className="space-y-4 text-center py-6">
                  <div className="inline-block px-3 py-1 bg-[#134074]/10 rounded-full text-[#134074] font-mono text-[9px] font-black uppercase tracking-widest">
                    Laudo Técnico de Inspeção Veicular
                  </div>
                  <h1 className="text-3xl font-black font-sans text-slate-950 uppercase tracking-tight leading-none">
                    FROTA DE TRANSPORTE ESCOLAR
                  </h1>
                  <h2 className="text-sm font-black font-mono text-slate-500 uppercase tracking-widest text-slate-500">
                    CÓDIGO: {laudoParams.laudoNumber}
                  </h2>
                </div>

                {/* Cover Photo */}
                {coverPhoto && (
                  <div className="flex justify-center my-2 shrink-0">
                    <div className="border border-slate-200 p-2 bg-white shadow-sm rounded-xl max-w-[280px]">
                      <img src={coverPhoto} alt="Foto de Capa do Veículo" className="max-h-48 rounded object-contain mx-auto" />
                      <p className="text-[7px] font-mono text-center text-slate-400 mt-1 uppercase">Registro Fotográfico Principal do Veículo</p>
                    </div>
                  </div>
                )}

                {/* Specs metadata card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-[10px] font-black font-sans uppercase tracking-wider text-[#134074] border-b pb-1.5">
                    Resumo do Veículo e Cliente
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[10px]">
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">PROPRIETÁRIO</span>
                      <strong className="text-slate-900 font-bold uppercase">{laudoParams.clientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">CPF / CNPJ</span>
                      <strong className="text-slate-900 font-bold uppercase">{laudoParams.cnpj}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">MARCA / MODELO</span>
                      <strong className="text-slate-900 font-bold uppercase">{laudoParams.marca_modelo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">PLACA / RENAVAM</span>
                      <strong className="text-slate-900 font-bold uppercase">{laudoParams.plate} | {laudoParams.renavam}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">MUNICÍPIO VISTORIA</span>
                      <strong className="text-slate-900 font-bold uppercase">{laudoParams.inspectionCity}-{laudoParams.inspectionState}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono text-[8px] text-slate-500">HODÔMETRO (KM)</span>
                      <strong className="text-slate-900 font-bold uppercase">{parseInt(laudoParams.odometro_km).toLocaleString("pt-BR")} KM</strong>
                    </div>
                  </div>
                </div>

                {/* Base Normativa Footer block */}
                <div className="border-t border-slate-200 pt-6 space-y-2">
                  <p className="text-[8px] text-slate-500 leading-relaxed uppercase font-mono">
                    Legislações Vigentes Aplicadas: Lei 9.503/1997 (CTB Art. 136/138) • Resolução CONTRAN nº 916/2022 • ABNT NBR 14040 • ABNT NBR 17075:2022 • {laudoParams.localPortaria}
                  </p>
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                    <span>Emissão: {laudoParams.laudoDate}</span>
                    <span>VL ENGENHARIA © 2026</span>
                  </div>
                </div>
              </div>

              {/* PAGE 2: PRESENTATION LETTER */}
              <div className="space-y-8 py-12 min-h-[250mm] page-break-before-always flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">LAUDO INSPEÇÃO ESCOLAR — {laudoParams.laudoNumber}</span>
                    <Logo variant="print" className="h-6" />
                  </div>
                  <div className="mt-8 space-y-6 text-xs text-slate-850 leading-relaxed text-justify text-slate-800">
                    <h2 className="text-sm font-black border-b-2 border-slate-950 pb-2 text-[#134074] uppercase">
                      Carta de Apresentação Técnica
                    </h2>
                    <p>Prezados Senhores,</p>
                    <p>
                      Apresentamos a Vossas Senhorias o presente <strong>Laudo Técnico de Inspeção de Segurança Veicular (Transporte Escolar)</strong>, contendo as avaliações de segurança, integridade física, funcionalidade mecânica e conformidade regulamentar do veículo automotor <strong>{laudoParams.marca_modelo}</strong>, placa <strong>{laudoParams.plate}</strong>, em estrito atendimento à legislação de trânsito brasileira (Código de Trânsito Brasileiro, Artigos 136 e 138), resoluções vigentes do CONTRAN e às normas técnicas aplicáveis da ABNT (NBR 17075:2022).
                    </p>
                    <p>
                      A finalidade técnica deste parecer pericial de engenharia é atestar a conformidade do veículo para autorização e renovação de circulação operacional semestral junto ao DETRAN, prefeituras municipais e órgãos de trânsito locais.
                    </p>
                    <p>
                      Recomendamos a imediata atenção a quaisquer inconformidades listadas neste documento e permanecemos à inteira disposição para prestar esclarecimentos complementares de engenharia mecânica automotiva que se façam necessários.
                    </p>
                    <p className="pt-6">Atenciosamente,</p>
                    <div className="pt-2 space-y-1">
                      <p className="font-bold text-slate-950 uppercase">Eng. Mecânico Vitor Leonardo</p>
                      <p className="text-[10px] font-mono text-slate-500">CREA-PE: 1822299490 | CONFEA: {laudoParams.engConfea}</p>
                      <p className="text-[10px] font-mono text-slate-500">VL ENGENHARIA S/A</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                  <span>Emissão: {laudoParams.laudoDate}</span>
                  <span>VL ENGENHARIA © 2026</span>
                </div>
              </div>

              {/* PAGE 3: SUMMARY */}
              <div className="space-y-6 py-12 min-h-[250mm] page-break-before-always flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">LAUDO INSPEÇÃO ESCOLAR — {laudoParams.laudoNumber}</span>
                    <Logo variant="print" className="h-6" />
                  </div>
                  <div className="mt-8 space-y-6">
                    <h2 className="text-sm font-black border-b-2 border-slate-950 pb-2 text-[#134074] uppercase">Sumário Executivo</h2>
                    <ul className="space-y-3.5 text-[10px] font-mono text-slate-700">
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>01. Introdução, Objetivo e Escopo Pericial</span> <span>Pág. 04</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>02. Órgão Pericial Emissor & Responsabilidade</span> <span>Pág. 04</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>03. Metodologia de Campo e Coleta de Evidências</span> <span>Pág. 04</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>04. Base Regulamentar e Enquadramento Legal</span> <span>Pág. 04</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>05. Checklist Técnico de Inspeção (17 Grupos)</span> <span>Pág. 05</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>06. Parecer Técnico Conclusivo do Engenheiro</span> <span>Pág. 06</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>07. Responsabilidade Ética, Civil e Criminal</span> <span>Pág. 06</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>08. Termo de Encerramento e Assinaturas</span> <span>Pág. 06</span></li>
                      <li className="flex justify-between border-b border-dotted border-slate-200 pb-1"><span>09. Registro Fotográfico Detalhado (Anexo de Evidências)</span> <span>Pág. 07</span></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                  <span>Emissão: {laudoParams.laudoDate}</span>
                  <span>VL ENGENHARIA © 2026</span>
                </div>
              </div>

              {/* PAGE 4: SEÇÕES TÉCNICAS */}
              <div className="space-y-6 pt-12 page-break-before-always">
                <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">LAUDO INSPEÇÃO ESCOLAR — {laudoParams.laudoNumber}</span>
                  <Logo variant="print" className="h-6" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-[#134074] uppercase font-sans tracking-wide">1. Introdução e Contexto Pericial</h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify">{secoes.secao_1}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-[#134074] uppercase font-sans tracking-wide">2. Objetivo do Laudo</h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify">{secoes.secao_2}</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-[#134074] uppercase font-sans tracking-wide">3. Órgão Pericial Emissor</h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify">{secoes.secao_3}</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-[#134074] uppercase font-sans tracking-wide">4. Metodologia de Campo e Evidências</h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify">{secoes.secao_5}</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-[#134074] uppercase font-sans tracking-wide">5. Base Regulamentar e Enquadramento Legal</h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify">{secoes.secao_6}</p>
                  </div>
                </div>
              </div>

              {/* PAGE 3: CHECKLIST COMPLETO */}
              <div className="space-y-6 pt-12 page-break-before-always">
                <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">CHECKLIST DE VISTORIA DETALHADO — {laudoParams.plate}</span>
                  <Logo variant="print" className="h-6" />
                </div>

                <h3 className="text-xs font-black text-[#134074] uppercase font-sans border-b pb-1">
                  6. Checklist Técnico de Inspeção (17 Grupos)
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[#134074] font-black font-sans uppercase">
                        <th className="p-2 w-1/4">Grupo de Inspeção</th>
                        <th className="p-2 w-1/2">Item Verificado</th>
                        <th className="p-2 text-center w-12">Status</th>
                        <th className="p-2">Laudo / Evidência Observada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklist.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="p-2 font-bold font-mono text-[8px] text-[#134074]">{item.category}</td>
                          <td className="p-2 text-slate-800">{item.name}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-black text-[8px] ${
                              item.status === "C" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : item.status === "NC" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2 text-slate-500 italic text-[8.5px]">{item.nota}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAGE 4: PARECER, RESPONSABILIDADE E CERTIFICAÇÃO */}
              <div className="space-y-8 pt-12 page-break-before-always">
                <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">RESULTADOS E ASSINATURA — {laudoParams.laudoNumber}</span>
                  <Logo variant="print" className="h-6" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#134074] uppercase font-sans border-b pb-1">
                    7. Parecer Técnico e Resultados Periciais
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <span className="text-slate-400 block font-mono text-[8px] uppercase">STATUS FINAL</span>
                      <strong className={`text-sm font-black uppercase ${conclusao.status === "APROVADO" ? "text-emerald-600" : "text-red-600"}`}>
                        {conclusao.status}
                      </strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center col-span-2">
                      <span className="text-slate-400 block font-mono text-[8px] uppercase">VALIDADE DO LAUDO</span>
                      <strong className="text-xs font-bold text-slate-800 uppercase">
                        6 Meses Corridos (Exigência Semestral CTB)
                      </strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="text-[9px] font-black font-mono text-[#134074] uppercase">Parecer do Engenheiro Responsável:</h4>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify italic">
                      "{conclusao.parecer}"
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black text-[#134074] uppercase font-sans border-b pb-1">
                    8. Responsabilidade Ética e Legal
                  </h3>
                  <p className="text-[10px] text-slate-800 leading-relaxed text-justify">
                    {secoes.secao_17}
                  </p>
                  <p className="text-[10px] text-slate-800 leading-relaxed text-justify">
                    Declaro sob as penas da lei, para fins de auditoria no DETRAN, CREA-PE e órgãos municipais, que este laudo técnico representa fidedignamente o estado operacional mecânico observado no veículo sob fiscalização ética, civil e criminal nos termos do código de ética profissional e resoluções do CONFEA.
                  </p>
                </div>

                {/* Signatures block */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px]">
                  <div className="space-y-4">
                    <div className="h-10 border-b border-slate-400" />
                    <div>
                      <strong className="block text-slate-900 font-bold">ENG. MECÂNICO VITOR LEONARDO</strong>
                      <span className="text-slate-500 block text-[8px] font-mono">CREA-PE: 1822299490 | CONFEA: {laudoParams.engConfea}</span>
                      <span className="text-slate-500 block text-[8px] font-mono">Guia de ART: {laudoParams.artNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 border-b border-slate-400" />
                    <div>
                      <strong className="block text-slate-900 font-bold">REPRESENTANTE DA EMPRESA</strong>
                      <span className="text-slate-500 block text-[8px] font-mono">PROPRIETÁRIO / OPERADOR DE TRANSPORTE</span>
                      <span className="text-slate-500 block text-[8px] font-mono">CNPJ: {laudoParams.cnpj}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 text-center text-[8px] font-mono text-slate-400 border-t border-slate-100">
                  Laudo gerado a partir dos dados informados. Revisão e assinatura do Engenheiro Responsável são obrigatórias antes da emissão oficial.
                </div>
              </div>

              {/* PAGE 5: REGISTRO FOTOGRÁFICO DE EVIDÊNCIAS */}
              {checklist.some(item => item.image) && (
                <div className="space-y-6 pt-12 page-break-before-always flex flex-col justify-between min-h-[250mm]">
                  <div>
                    <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                      <span className="text-[8px] font-mono text-slate-400 uppercase">ANEXO FOTOGRÁFICO — {laudoParams.plate}</span>
                      <Logo variant="print" className="h-6" />
                    </div>

                    <div className="mt-4 space-y-4">
                      <h3 className="text-xs font-black text-[#134074] uppercase font-sans border-b pb-1">
                        9. Registro Fotográfico de Evidências por Item
                      </h3>
                      <p className="text-[9px] text-slate-500">
                        Registro fotográfico detalhado correspondente aos itens vistoriados que apresentaram destaques técnicos ou não conformidades durante a inspeção física do veículo escolar.
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {checklist.filter(item => item.image).map(item => (
                          <div key={item.id} className="border border-slate-200 rounded-lg p-2 space-y-2 bg-slate-50 flex flex-col justify-between">
                            <div className="h-28 w-full bg-slate-200 rounded overflow-hidden flex items-center justify-center">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-[8px] font-mono font-bold text-[#134074] uppercase">{item.category}</div>
                              <div className="text-[8px] font-semibold text-slate-800 leading-tight">{item.name}</div>
                              <div className="text-[8px] text-slate-500 italic">"{item.nota}"</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                    <span>Emissão: {laudoParams.laudoDate}</span>
                    <span>VL ENGENHARIA © 2026</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
