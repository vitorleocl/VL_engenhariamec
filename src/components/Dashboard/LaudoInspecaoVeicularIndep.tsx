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
  name: string;
  status: "SIM" | "NÃO" | "N/A";
  nota: string;
  image?: string;
}

// --- HRN VALUES ---
const LO_OPTIONS = [
  { value: 0.033, label: "0,033 - Quase Impossível" },
  { value: 1.0, label: "1,0 - Muito Improvável" },
  { value: 1.5, label: "1,5 - Improvável" },
  { value: 2.0, label: "2,0 - Possível" },
  { value: 5.0, label: "5,0 - Inesperado" },
  { value: 8.0, label: "8,0 - Provável" },
  { value: 10.0, label: "10,0 - Muito Provável" },
  { value: 15.0, label: "15,0 - Certamente" }
];

const FE_OPTIONS = [
  { value: 0.5, label: "0,5 - Anualmente" },
  { value: 1.0, label: "1,0 - Mensalmente" },
  { value: 1.5, label: "1,5 - Semanalmente" },
  { value: 2.5, label: "2,5 - Diariamente" },
  { value: 4.0, label: "4,0 - De Hora em Hora" },
  { value: 5.0, label: "5,0 - Constantemente" }
];

const DPH_OPTIONS = [
  { value: 0.1, label: "0,1 - Arranhão/Contusão Leve" },
  { value: 0.5, label: "0,5 - Laceração/Leves Problemas" },
  { value: 1.0, label: "1,0 - Fratura de Ossos Pequenos" },
  { value: 2.0, label: "2,0 - Fratura de Ossos Grandes" },
  { value: 4.0, label: "4,0 - Fratura/Enfermidade Grave" },
  { value: 6.0, label: "6,0 - Perda de Um Membro/Olho" },
  { value: 8.0, label: "8,0 - Perda de Dois Membros" },
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
  if (score <= 1.0) return { label: "Risco Desprezível", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", action: "Aceitável; monitorar." };
  if (score <= 5.0) return { label: "Risco Muito Baixo", color: "bg-teal-500/10 text-teal-500 border-teal-500/20", action: "Melhorar se possível." };
  if (score <= 10.0) return { label: "Risco Baixo", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", action: "Ação a médio prazo." };
  if (score <= 50.0) return { label: "Risco Significante", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", action: "Ação técnica a curto prazo." };
  if (score <= 100.0) return { label: "Risco Alto", color: "bg-red-500/10 text-red-500 border-red-500/20", action: "Ação imediata." };
  if (score <= 500.0) return { label: "Risco Muito Alto", color: "bg-rose-600/10 text-rose-600 border-rose-600/20", action: "Parar atividade operacional." };
  if (score <= 1000.0) return { label: "Risco Extremo", color: "bg-purple-600/10 text-purple-600 border-purple-600/20", action: "INTERDITAR IMEDIATAMENTE." };
  return { label: "Risco Inaceitável", color: "bg-red-700/10 text-red-700 border-red-700/20", action: "INTERDIÇÃO IMEDIATA." };
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "item_1", name: "CRLV vigente", status: "SIM", nota: "CRLV digital vigente e sem bloqueios no sistema nacional." },
  { id: "item_2", name: "Placa dianteira e traseira legíveis", status: "SIM", nota: "Placas dianteira e traseira legíveis, com lacre e em conformidade." },
  { id: "item_3", name: "Faróis dianteiros funcionando", status: "SIM", nota: "Faróis dianteiros regulados e operando sem avarias." },
  { id: "item_4", name: "Luzes de freio funcionando", status: "SIM", nota: "Luzes de freio operacionais, incluindo o break-light superior." },
  { id: "item_5", name: "Pisca-alerta funcionando", status: "SIM", nota: "Pisca-alerta respondendo adequadamente ao acionamento no console." },
  { id: "item_6", name: "Luz de ré funcionando", status: "SIM", nota: "Luz de ré funcionando normalmente quando engatada a marcha." },
  { id: "item_7", name: "Buzina funcionando", status: "SIM", nota: "Buzina emitindo sinal audível de forma nítida e contínua." },
  { id: "item_8", name: "Pneus sem careca (profundidade > 1,6 mm)", status: "SIM", nota: "Pneus em bom estado, com sulcos superiores ao limite de 1,6mm." },
  { id: "item_9", name: "Pneus sem bolhas ou cortes", status: "SIM", nota: "Ausência de bolhas, rasgos ou cortes na banda lateral de rodagem." },
  { id: "item_10", name: "Cintos de segurança em todos os assentos", status: "SIM", nota: "Cintos de segurança operacionais com travas retráteis íntegras em todos os assentos." },
  { id: "item_11", name: "Espelhos retrovisores presentes e regulados", status: "SIM", nota: "Espelhos retrovisores presentes, com boa regulagem e espelhos sem trincas." },
  { id: "item_12", name: "Vidros sem trincas que comprometam visão", status: "SIM", nota: "Para-brisa dianteiro sem trincas ou danos que afetem o campo de visão do condutor." },
  { id: "item_13", name: "Triângulo de sinalização presente", status: "SIM", nota: "Triângulo de sinalização presente no porta-malas." },
  { id: "item_14", name: "Macaco e chave de roda presentes", status: "SIM", nota: "Macaco hidráulico tipo sanfona e chave de roda presentes e funcionais." },
  { id: "item_15", name: "Extintor com validade (frota/coletivo)", status: "SIM", nota: "Extintor de pó químico com carga e pressão verde dentro da validade." },
  { id: "item_16", name: "Pedal de freio com resistência adequada", status: "SIM", nota: "Pedal de freio firme, sem indício de ar no sistema ou curso excessivo." },
  { id: "item_17", name: "Freio de mão funcionando", status: "SIM", nota: "Freio de estacionamento segurando o veículo de maneira perfeita." },
  { id: "item_18", name: "Ausência de luzes de advertência no painel", status: "SIM", nota: "Painel de instrumentos sem nenhuma luz de erro (check engine, airbag, ABS)." },
  { id: "item_19", name: "Lataria sem corrosão estrutural", status: "SIM", nota: "Estrutura e longarinas inferiores sem corrosão profunda ou amassados severos." },
  { id: "item_20", name: "Escapamento fixado e sem vazamento interno", status: "SIM", nota: "Sistema de escapamento sem vazamento de gases ou furos na tubulação traseira." }
];

interface Props {
  clients?: ClientData[];
  onBack: () => void;
  initialPrefilled?: boolean;
}

export default function LaudoInspecaoVeicularIndep({ onBack, initialPrefilled = false, clients }: Props) {
  const [activeTab, setActiveTab] = useState<"form" | "pricing">("form");
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // States
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LIV-001/2026 Rev. 00",
    clientName: "VL Engenharia S/A",
    cnpj: "18.222.994/9001-PE",
    address: "Av. Governador Agamenon Magalhães, 444 - Derby, Recife - PE",
    brand: "Toyota",
    model: "Hilux CD 4x4 SRV",
    fabYear: "2023",
    modelYear: "2024",
    color: "Prata Metálico",
    plate: "VL-ENG-26",
    chassi: "9BR83748293847293",
    renavam: "0123456789",
    fuelType: "Diesel S10",
    kmCurrent: "35.200",
    lotacao: "5",
    pbt: "3.100 kg",
    cargoCapacity: "1.000 kg",
    carroceriaType: "Aberta / Pick-up",
    lastRevision: "30.000 km",
    generalStatus: "Ótimo estado de conservação mecânica e estrutural",
    finalidade: "Frota Corporativa",
    inspectionCity: "Recife",
    inspectionDate: "2026-07-04",
    notes: "",
    normasAdicionais: "NBR 13971, NBR 14040, Portaria INMETRO nº 140/2022"
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  const [hrnBefore, setHrnBefore] = useState({
    lo: 1.5,
    fe: 2.5,
    dph: 2.0,
    np: 1.0,
    score: 3.75,
    classification: "Risco Muito Baixo",
    explicacao: "Condições mecânicas aceitáveis com apenas pequenos ajustes corretivos recomendados."
  });

  const [hrnAfter, setHrnAfter] = useState({
    lo: 0.033,
    fe: 2.5,
    dph: 2.0,
    np: 1.0,
    score: 0.165,
    classification: "Risco Desprezível",
    explicacao: "Após aplicação das revisões recomendadas, o risco residual de falhas ou colisões se torna desprezível."
  });

  const [sistemasInspecao, setSistemasInspecao] = useState({
    estrutura_carroceria: "Lataria e para-choques íntegros sem pontos de corrosão. Vidros originais Toyota sem trincas. Película solar instalada dentro dos limites de transmissão luminosa da Resolução CONTRAN 432/2013.",
    freios: "Sistema de frenagem íntegro, pastilhas e discos dianteiros com desgaste nominal adequado. Fluido de freio com teor de umidade aceitável. Luz do ABS inativa no painel após partida.",
    suspensao_direcao: "Amortecedores e coxins dianteiros secos, sem vazamento de fluido. Alinhamento direcional nominal observado, sem desvios laterais ativos de direção em pista plana.",
    motor_transmissao: "Motor Turbodiesel 2.8 operando de forma regular, ausência de vazamentos externos de óleo de motor ou líquido de arrefecimento. Caixa de câmbio automática com engates precisos.",
    eletrico_eletronico: "Faróis de LED, lanternas traseiras, setas direcionais, luzes de ré e freio funcionando perfeitamente. Painel analógico e digital operacional, bateria com tensão nominal em 12.6V.",
    seguranca_obrigatoria: "Cintos de segurança de três pontos em todas as 5 posições funcionais. Triângulo, macaco e chave de roda presentes no compartimento traseiro.",
    documentacao: "Documentação digital (CRLV-e) regularizada para o exercício atual. Seguro obrigatório e taxas de licenciamento quitados."
  });

  const [naoConformidades, setNaoConformidades] = useState([
    {
      id: "NC-01",
      descricao: "Pequena lâmpada de lanterna de posição dianteira direita inoperante, violando o CTB.",
      criticidade: "BAIXA" as "BAIXA" | "MÉDIA" | "ALTA" | "CRÍTICA",
      risco: "Baixa visibilidade noturna lateral",
      norma: "Resolução CONTRAN N° 14/1998 e CTB Artigo 230"
    }
  ]);

  const [planoAcao, setPlanoAcao] = useState([
    {
      id: "AP-01",
      problema: "Lâmpada de posição queimada",
      norma: "Resolução CONTRAN N° 14/1998",
      recomendacao: "Substituir a lâmpada de posição dianteira direita por peça original equivalente.",
      prioridade: "CURTO PRAZO" as "IMEDIATO" | "CURTO PRAZO" | "MÉDIO PRAZO" | "LONGO PRAZO",
      responsavel: "Supervisor de Manutenção da VL Engenharia",
      prazo: "2 dias"
    }
  ]);

  const [conclusao, setConclusao] = useState({
    status: "APROVADO COM RESSALVAS",
    parecer: "O veículo Hilux analisado encontra-se APROVADO COM RESSALVAS devido à inoperância de uma lâmpada auxiliar de lanterna. Recomenda-se a imediata substituição para garantir a perfeita regularização perante os regulamentos do CONTRAN."
  });

  const [secoes, setSecoes] = useState<any>({});

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate base report sections
    updateReportSections();
  }, [laudoParams]);

  useEffect(() => {
    if (initialPrefilled) {
      loadSimulatedData();
    }
  }, [initialPrefilled]);

  const updateReportSections = () => {
    const brand = laudoParams.brand || "Veículo";
    const model = laudoParams.model || "Modelo";
    setSecoes({
      secao_1: `Este Laudo Técnico de Inspeção Veicular tem como objetivo primordial auditar as condições de integridade física, funcionalidade e conformidade de segurança do veículo automotor ${brand} ${model} para certificar suas plenas condições de circulação e segurança viária ativa e passiva.`,
      secao_2: `Empresa ou Proprietário Solicitante: ${laudoParams.clientName || "Cliente Contratante Ltda"} (CNPJ/CPF: ${laudoParams.cnpj || "Não informado"}, Endereço: ${laudoParams.address || "Não informado"}), focado na gestão segura de frotas e cumprimento das regras periciais de transporte.`,
      secao_3: "Órgão Pericial Emissor: VL Engenharia. Responsável Técnico de Inspeção: Eng. Mecânico Vitor Leonardo (CREA-PE 1822299490). Especialista em Auditorias Automotivas, Perícia Mecânica de Trânsito e Enquadramento Legal. Tel: (81) 98444-2592, E-mail: vitorleonardocl@gmail.com.",
      secao_5: "Evidências analisadas: Registro fotográfico in loco de todos os ângulos estruturais, verificação eletrônica dos módulos do painel, leitura de TWI dos pneus traseiros e dianteiros, e análise documental do Certificado de Registro e Licenciamento de Veículo (CRLV).",
      secao_6: "Normas e legislação balizadoras: Código de Trânsito Brasileiro (CTB - Lei 9.503/1997), Resoluções CONTRAN n.º 14/1998 (itens obrigatórios), 315/2009 (inspeção de frota), 774/2019 (desgaste de pneus) e a ABNT NBR 14447 (Inspeção Técnica Veicular).",
      secao_7: "Metodologia: Vistoria presencial visual por meio de roteiro padronizado NBR 14447, com quantificação matemática de perigo pelo algoritmo HRN (Hazard Rating Number) correlacionando Probabilidade (LO), Exposição (FE), Gravidade da Lesão (DPH) e Número de pessoas (NP).",
      secao_17: "Esta avaliação técnica pericial limita-se única e estritamente aos aspectos mecânicos externos e estruturais aparentes observados no veículo na data de inspeção. Não se responsabiliza por vícios ocultos do motor ou desgaste invisível de conexões profundas sem testes metalúrgicos destrutivos.",
      secao_18: "Anexos e Documentações de Suporte: Registro de fotos de alta fidelidade dos itens de conformidade e não conformidade, ART emitida sob o número correspondente à respectiva guia de responsabilidade técnica."
    });
  };

  const loadSimulatedData = () => {
    setLaudoParams({
      laudoNumber: "LIV-082/2026 Rev. 01",
      clientName: "Construtora Alfa de Pernambuco Ltda",
      cnpj: "45.892.411/0001-92",
      address: "Av. Boa Viagem, 1050 - Boa Viagem, Recife - PE",
      brand: "Chevrolet",
      model: "S10 Blazer Executive 4x4",
      fabYear: "2019",
      modelYear: "2020",
      color: "Preto Eclipse",
      plate: "ALF-4X44",
      chassi: "9BGKJ4348239048329",
      renavam: "0987654321",
      fuelType: "Flex / GNV",
      kmCurrent: "148.500",
      lotacao: "7",
      pbt: "2.850 kg",
      cargoCapacity: "850 kg",
      carroceriaType: "Fechada / SUV",
      lastRevision: "140.000 km",
      generalStatus: "Regular com não conformidades graves em segurança ativa",
      finalidade: "Transporte de Engenharia de Campo",
      inspectionCity: "Jaboatão dos Guararapes",
      inspectionDate: "2026-07-04",
      notes: "Veículo utilizado severamente em estradas de terra e canteiros de obras."
    });

    setChecklist([
      { id: "item_1", name: "CRLV vigente", status: "SIM", nota: "CRLV digital em situação regular perante o DETRAN-PE." },
      { id: "item_2", name: "Placa dianteira e traseira legíveis", status: "SIM", nota: "Placas legíveis, com refletividade aceitável." },
      { id: "item_3", name: "Faróis dianteiros funcionando", status: "SIM", nota: "Faróis alto/baixo operacionais, foco alinhado visualmente." },
      { id: "item_4", name: "Luzes de freio funcionando", status: "SIM", nota: "Luzes de freio acendendo sem falhas de circuito." },
      { id: "item_5", name: "Pisca-alerta funcionando", status: "SIM", nota: "Relé de pisca operacional." },
      { id: "item_6", name: "Luz de ré funcionando", status: "SIM", nota: "Luz de ré operacional." },
      { id: "item_7", name: "Buzina funcionando", status: "SIM", nota: "Buzina emitida conforme exigência do CTB." },
      { id: "item_8", name: "Pneus sem careca (profundidade > 1,6 mm)", status: "NÃO", nota: "Ambos os pneus traseiros com profundidade de sulco em 1,1 mm (carecas) no TWI." },
      { id: "item_9", name: "Pneus sem bolhas ou cortes", status: "SIM", nota: "Bordas de pneus íntegras, sem deformações visíveis." },
      { id: "item_10", name: "Cintos de segurança em todos os assentos", status: "SIM", nota: "Cintos de todos os 7 assentos presentes e travando." },
      { id: "item_11", name: "Espelhos retrovisores presentes e regulados", status: "SIM", nota: "Retrovisores externos íntegros e firmes." },
      { id: "item_12", name: "Vidros sem trincas que comprometam visão", status: "NÃO", nota: "Para-brisa dianteiro com trinca em arco superior a 20 cm, interferindo na área do condutor." },
      { id: "item_13", name: "Triângulo de sinalização presente", status: "SIM", nota: "Triângulo presente no porta-malas." },
      { id: "item_14", name: "Macaco e chave de roda presentes", status: "SIM", nota: "Acessórios de troca presentes." },
      { id: "item_15", name: "Extintor com validade (frota/coletivo)", status: "SIM", nota: "Extintor presente e com ponteiro no verde." },
      { id: "item_16", name: "Pedal de freio com resistência adequada", status: "SIM", nota: "Atuação sem vazamentos de pressão." },
      { id: "item_17", name: "Freio de mão funcionando", status: "SIM", nota: "Atua bem sobre as rodas traseiras." },
      { id: "item_18", name: "Ausência de luzes de advertência no painel", status: "NÃO", nota: "Luz do Airbag permanece ligada constantemente após partida do motor." },
      { id: "item_19", name: "Lataria sem corrosão estrutural", status: "SIM", nota: "Sem furos ou oxidações graves no assoalho." },
      { id: "item_20", name: "Escapamento fixado e sem vazamento interno", status: "SIM", nota: "Surdina e abafador sem furos visíveis." }
    ]);

    setHrnBefore({
      lo: 8.0,
      fe: 2.5,
      dph: 15.0,
      np: 2.0,
      score: 600.0,
      classification: "Risco Extremo",
      explicacao: "Perigo extremo de aquaplanagem, perda de aderência e colisão grave devido aos pneus traseiros carecas e falha ativa de airbag."
    });

    setHrnAfter({
      lo: 0.033,
      fe: 2.5,
      dph: 15.0,
      np: 2.0,
      score: 2.475,
      classification: "Risco Muito Baixo",
      explicacao: "Com a substituição imediata dos pneus, do para-brisa e reparo do airbag, o risco residual de acidente é mitigado para níveis aceitáveis de segurança."
    });

    setSistemasInspecao({
      estrutura_carroceria: "A lataria possui pequenos amassados de uso severo urbano, sem comprometer a estrutura das portas ou tampas. O para-brisa frontal encontra-se trincado por impacto de pedra, com avaria de aproximadamente 20 cm.",
      freios: "Pedal responde bem com boa vazão de óleo hidráulico. Discos dianteiros finos, porém sem deformação radial. Lonas traseiras em bom estado funcional.",
      suspensao_direcao: "Amortecedores originais com alta fadiga visual, sem vazamentos de fluido porém demandando preventiva. Terminais de direção firmes.",
      motor_transmissao: "Motor 2.5 Turbodiesel com marcas de gotejamento de lubrificante na tampa de válvulas. Caixa de marchas 4x4 reduzida engatando corretamente.",
      eletrico_eletronico: "Faróis e luzes operando regularmente. O módulo de painel exibe de forma permanente a luz indicativa de erro de segurança ativa (Airbag).",
      seguranca_obrigatoria: "Cintos de segurança operacionais. Triângulo e macaco presentes e em conformidade.",
      documentacao: "Licenciamento digital regularizado e seguro DPVAT quitado."
    });

    setNaoConformidades([
      {
        id: "NC-01",
        descricao: "Pneus do eixo traseiro com sulcos abaixo de 1,6 mm de limite mínimo de segurança, violando o CTB e a Resolução CONTRAN N° 774/2019.",
        criticidade: "CRÍTICA",
        risco: "Aquaplanagem, colisão fatal por derrapamento",
        norma: "Resolução CONTRAN N° 774/2019 e CTB Art. 230, Inciso XVIII"
      },
      {
        id: "NC-02",
        descricao: "Trinca no para-brisa dianteiro superior a 15 cm de comprimento, interferindo diretamente na visibilidade do motorista.",
        criticidade: "ALTA",
        risco: "Estilhaçamento e colisão frontal por ponto cego",
        norma: "Resolução CONTRAN N° 432/2013"
      },
      {
        id: "NC-03",
        descricao: "Luz de advertência do Airbag ligada constantemente no painel, acusando falha de ativação no sistema passivo.",
        criticidade: "CRÍTICA",
        risco: "Inoperância dos airbags em caso de colisão frontal",
        norma: "Resolução CONTRAN N° 14/1998"
      }
    ]);

    setPlanoAcao([
      {
        id: "AP-01",
        problema: "Pneus traseiros carecas",
        norma: "Resolução CONTRAN N° 774/2019",
        recomendacao: "Substituir ambos os pneus do eixo traseiro por novos homologados e alinhar as rodas.",
        prioridade: "IMEDIATO",
        responsavel: "Proprietário / Equipe de Manutenção",
        prazo: "1 dia"
      },
      {
        id: "AP-02",
        problema: "Para-brisa trincado",
        norma: "Resolução CONTRAN N° 432/2013",
        recomendacao: "Efetuar a troca integral do para-brisa dianteiro em oficina homologada.",
        prioridade: "IMEDIATO",
        responsavel: "Proprietário",
        prazo: "2 dias"
      },
      {
        id: "AP-03",
        problema: "Falha de ativação do Airbag",
        norma: "Resolução CONTRAN N° 14/1998",
        recomendacao: "Realizar varredura eletrônica por scanner e efetuar o reparo dos conectores do airbag.",
        prioridade: "IMEDIATO",
        responsavel: "Auto Elétrica Autorizada",
        prazo: "3 dias"
      }
    ]);

    setConclusao({
      status: "REPROVADO",
      parecer: "O veículo Blazer analisado encontra-se REPROVADO para circulação operacional imediata. Os pneus traseiros com desgaste de banda severo (carecas), associados à falha ativa de acionamento do airbag e para-brisa quebrado constituem perigos de alto potencial de gravidade viária."
    });
  };

  const handleInputChange = (field: string, val: string) => {
    setLaudoParams(prev => ({ ...prev, [field]: val }));
  };

  const handleChecklistStatusChange = (index: number, status: "SIM" | "NÃO" | "N/A") => {
    setChecklist(prev => prev.map((item, idx) => idx === index ? { ...item, status } : item));
  };

  const handleChecklistNotaChange = (index: number, nota: string) => {
    setChecklist(prev => prev.map((item, idx) => idx === index ? { ...item, nota } : item));
  };

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      compressImage(file)
        .then((compressedBase64) => {
          setUploadedImages(prev => [
            ...prev,
            {
              name: file.name,
              data: compressedBase64,
              description: "Registro fotográfico capturado em campo pelo auditor Vitor Leonardo."
            }
          ]);
        })
        .catch(() => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedImages(prev => [
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

  const handleChecklistImageUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then(base64 => {
      setChecklist(prev => prev.map((item, idx) => idx === index ? { ...item, image: base64 } : item));
    });
  };

  const removeChecklistImage = (index: number) => {
    setChecklist(prev => prev.map((item, idx) => idx === index ? { ...item, image: undefined } : item));
  };

  const recalculateHRNBefore = (lo: number, fe: number, dph: number, np: number) => {
    const score = +(lo * fe * dph * np).toFixed(3);
    const classification = getHRNClassification(score).label;
    setHrnBefore({ lo, fe, dph, np, score, classification, explicacao: hrnBefore.explicacao });
  };

  const recalculateHRNAfter = (lo: number, fe: number, dph: number, np: number) => {
    const score = +(lo * fe * dph * np).toFixed(3);
    const classification = getHRNClassification(score).label;
    setHrnAfter({ lo, fe, dph, np, score, classification, explicacao: hrnAfter.explicacao });
  };

  const addNaoConformidade = () => {
    setNaoConformidades(prev => [
      ...prev,
      {
        id: `NC-0${prev.length + 1}`,
        descricao: "Infração técnica identificada",
        criticidade: "BAIXA",
        risco: "Risco associado",
        norma: "CTB / Resoluções CONTRAN"
      }
    ]);
  };

  const removeNaoConformidade = (id: string) => {
    setNaoConformidades(prev => prev.filter(nc => nc.id !== id));
  };

  const addPlanoAcao = () => {
    setPlanoAcao(prev => [
      ...prev,
      {
        id: `AP-0${prev.length + 1}`,
        problema: "Avaria constatada",
        norma: "Regulamento aplicável",
        recomendacao: "Ação de reparo",
        prioridade: "IMEDIATO",
        responsavel: "Proprietário",
        prazo: "5 dias"
      }
    ]);
  };

  const removePlanoAcao = (id: string) => {
    setPlanoAcao(prev => prev.filter(pa => pa.id !== id));
  };

  // --- AUTOMATION AI TRIGGER ---
  const triggerAIEngine = async () => {
    if (!laudoParams.brand || !laudoParams.model) {
      alert("Por favor, preencha a marca e modelo do veículo antes de acionar a inteligência.");
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

      const res = await fetch("/api/gemini/vehicle-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erro na requisição do servidor.");
      }

      const data = await res.json();
      
      // Update states
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
      alert("Erro na conexão com a inteligência artificial. Carregando dados simulados.");
      loadSimulatedData();
    } finally {
      setLoadingAI(false);
    }
  };

  const printLaudoPDF = async () => {
    if (!reportRef.current) return;
    try {
      await preprocessStylesheets(reportRef.current);
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${laudoParams.laudoNumber.replace(/\//g, "-")}-inspecao-veicular.pdf`,
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
    exportToWord("laudo-printable-area", `${laudoParams.laudoNumber.replace(/\//g, "-")}-inspecao-veicular`);
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
            <Car className="w-6 h-6 text-emerald-500" />
            <span>Gerador Laudo Inspeção Veicular</span>
          </h2>
          <p className="text-xs text-slate-500">
            Sistemas de integridade física, funcionalidade mecânica e apreciação de risco viário.
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar PDF</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Word</span>
          </button>
          <button
            onClick={handleCopyRichText}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("form")}
          className={`px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "form"
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Formulário de Auditoria de Campo
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "pricing"
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          Precificação
        </button>
      </div>

      {activeTab === "pricing" ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo de Inspeção Veicular"
            equipmentName={`${laudoParams.brand} ${laudoParams.model}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: EDITOR */}
          <div className="lg:col-span-5 space-y-8">
          
          {/* AI AUTOMATION BLOCK */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Motor Inteligente IA</h3>
            </div>
            <p className="text-slate-300 text-xs">
              Escreva observações de campo ou envie fotos do veículo. O assistente preencherá o checklist de 20 itens, calculará o HRN e preencherá as análises de sistemas de forma automática.
            </p>

            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Ex: Pneus traseiros carecas, para-brisa trincado à esquerda e luz de injeção ligada no painel."
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />

            <div className="space-y-2">
              <label className="block text-[10px] font-bold font-mono uppercase text-slate-500 tracking-wider">
                Anexar Fotos de Campo ({uploadedImages.length})
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
              />
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800">
                      <img src={img.data} className="w-full h-16 object-cover" />
                      <button
                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-600 p-0.5 rounded-full text-white hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={loadingAI}
              onClick={triggerAIEngine}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              {loadingAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analisando Veículo...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Acionar IA VL Engenharia</span>
                </>
              )}
            </button>
          </div>

          {/* PARAMS ACCORDION */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase">Dados do Veículo & Cliente</h3>
              <button 
                onClick={loadSimulatedData} 
                className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold px-2 py-1 rounded-lg uppercase hover:bg-amber-500 hover:text-white transition"
              >
                Carregar Exemplo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Laudo Número</label>
                <input
                  type="text"
                  value={laudoParams.laudoNumber}
                  onChange={e => handleInputChange("laudoNumber", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Marca</label>
                <input
                  type="text"
                  value={laudoParams.brand}
                  onChange={e => handleInputChange("brand", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Modelo</label>
                <input
                  type="text"
                  value={laudoParams.model}
                  onChange={e => handleInputChange("model", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Ano Fabr.</label>
                <input
                  type="text"
                  value={laudoParams.fabYear}
                  onChange={e => handleInputChange("fabYear", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Ano Mod.</label>
                <input
                  type="text"
                  value={laudoParams.modelYear}
                  onChange={e => handleInputChange("modelYear", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Cor</label>
                <input
                  type="text"
                  value={laudoParams.color}
                  onChange={e => handleInputChange("color", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Placa</label>
                <input
                  type="text"
                  value={laudoParams.plate}
                  onChange={e => handleInputChange("plate", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Chassi</label>
                <input
                  type="text"
                  value={laudoParams.chassi}
                  onChange={e => handleInputChange("chassi", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">KM Atual</label>
                <input
                  type="text"
                  value={laudoParams.kmCurrent}
                  onChange={e => handleInputChange("kmCurrent", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
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

              <div className="col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Cliente / Solicitante</label>
                <input
                  type="text"
                  value={laudoParams.clientName}
                  onChange={e => handleInputChange("clientName", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Cidade de Inspeção</label>
                <input
                  type="text"
                  value={laudoParams.inspectionCity}
                  onChange={e => handleInputChange("inspectionCity", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Normas de Referência Adicionais / Internacionais</label>
                <textarea
                  placeholder="Ex: NBR 13971, NBR 14040, Portaria INMETRO nº 140/2022, etc. (Separe por vírgulas)"
                  value={laudoParams.normasAdicionais || ""}
                  onChange={e => handleInputChange("normasAdicionais", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* CHECKLIST TABLE */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2">Roteiro Inspeção (Checklist)</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {checklist.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {idx + 1}. {item.name}
                    </span>
                    <div className="flex bg-slate-200 dark:bg-slate-850 p-0.5 rounded-lg text-[10px]">
                      {(["SIM", "NÃO", "N/A"] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleChecklistStatusChange(idx, s)}
                          className={`px-2 py-1 rounded-md font-bold ${item.status === s ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-950"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.nota}
                    onChange={e => handleChecklistNotaChange(idx, e.target.value)}
                    placeholder="Nota / Observação"
                    className="w-full bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none"
                  />

                  {/* Photo row attachment */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">Anexo item:</span>
                    {item.image ? (
                      <div className="relative inline-block">
                        <img src={item.image} className="w-16 h-12 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeChecklistImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-1 cursor-pointer px-2 py-1 bg-white dark:bg-slate-800 border rounded text-[10px] text-slate-500 hover:text-emerald-600">
                        <Upload className="w-3 h-3" />
                        <span>Anexar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleChecklistImageUpload(idx, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RISK ANALYSIS (HRN) */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase border-b pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#134074]" />
              <span>Cálculo de Risco (HRN)</span>
            </h3>

            {/* Before control */}
            <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
              <h4 className="text-xs font-black text-red-600 dark:text-red-400 uppercase">1. Risco Inicial (Sem Controles)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] uppercase text-slate-500">LO - Probabilidade</label>
                  <select
                    value={hrnBefore.lo}
                    onChange={e => recalculateHRNBefore(+e.target.value, hrnBefore.fe, hrnBefore.dph, hrnBefore.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">FE - Exposição</label>
                  <select
                    value={hrnBefore.fe}
                    onChange={e => recalculateHRNBefore(hrnBefore.lo, +e.target.value, hrnBefore.dph, hrnBefore.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">DPH - Gravidade</label>
                  <select
                    value={hrnBefore.dph}
                    onChange={e => recalculateHRNBefore(hrnBefore.lo, hrnBefore.fe, +e.target.value, hrnBefore.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">NP - Pessoas</label>
                  <select
                    value={hrnBefore.np}
                    onChange={e => recalculateHRNBefore(hrnBefore.lo, hrnBefore.fe, hrnBefore.dph, +e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="font-bold">Score HRN: {hrnBefore.score}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHRNClassification(hrnBefore.score).color}`}>
                  {hrnBefore.classification}
                </span>
              </div>
              <textarea
                value={hrnBefore.explicacao}
                onChange={e => setHrnBefore(p => ({ ...p, explicacao: e.target.value }))}
                placeholder="Explicação do Risco Inicial"
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
              />
            </div>

            {/* After control */}
            <div className="space-y-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">2. Risco Residual (Com Controles)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] uppercase text-slate-500">LO - Probabilidade</label>
                  <select
                    value={hrnAfter.lo}
                    onChange={e => recalculateHRNAfter(+e.target.value, hrnAfter.fe, hrnAfter.dph, hrnAfter.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">FE - Exposição</label>
                  <select
                    value={hrnAfter.fe}
                    onChange={e => recalculateHRNAfter(hrnAfter.lo, +e.target.value, hrnAfter.dph, hrnAfter.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">DPH - Gravidade</label>
                  <select
                    value={hrnAfter.dph}
                    onChange={e => recalculateHRNAfter(hrnAfter.lo, hrnAfter.fe, +e.target.value, hrnAfter.np)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-slate-500">NP - Pessoas</label>
                  <select
                    value={hrnAfter.np}
                    onChange={e => recalculateHRNAfter(hrnAfter.lo, hrnAfter.fe, hrnAfter.dph, +e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-800 p-1.5 rounded"
                  >
                    {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="font-bold">Score HRN: {hrnAfter.score}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHRNClassification(hrnAfter.score).color}`}>
                  {hrnAfter.classification}
                </span>
              </div>
              <textarea
                value={hrnAfter.explicacao}
                onChange={e => setHrnAfter(p => ({ ...p, explicacao: e.target.value }))}
                placeholder="Explicação do Risco Residual"
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* NON-CONFORMITIES & ACTION PLAN */}
          <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase">Não Conformidades ({naoConformidades.length})</h3>
              <button onClick={addNaoConformidade} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border p-1.5 rounded flex items-center gap-1 font-bold">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-4">
              {naoConformidades.map((nc, idx) => (
                <div key={nc.id} className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl space-y-2 relative">
                  <button onClick={() => removeNaoConformidade(nc.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">{nc.id}</span>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-400 block">Descrição</label>
                    <input
                      type="text"
                      value={nc.descricao}
                      onChange={e => setNaoConformidades(prev => prev.map(item => item.id === nc.id ? { ...item, descricao: e.target.value } : item))}
                      className="w-full text-xs bg-white dark:bg-slate-950 border p-1 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase text-slate-400">Criticidade</label>
                      <select
                        value={nc.criticidade}
                        onChange={e => setNaoConformidades(prev => prev.map(item => item.id === nc.id ? { ...item, criticidade: e.target.value as any } : item))}
                        className="w-full text-xs bg-white dark:bg-slate-950 border p-1 rounded"
                      >
                        <option value="BAIXA">BAIXA</option>
                        <option value="MÉDIA">MÉDIA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="CRÍTICA">CRÍTICA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase text-slate-400">Norma</label>
                      <input
                        type="text"
                        value={nc.norma}
                        onChange={e => setNaoConformidades(prev => prev.map(item => item.id === nc.id ? { ...item, norma: e.target.value } : item))}
                        className="w-full text-xs bg-white dark:bg-slate-950 border p-1 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (A4 STYLED) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl flex items-center justify-between border dark:border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest px-3">Visualização A4 Impressão</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">Pronto para Exportar</span>
            </div>
          </div>

          <div 
            ref={reportRef} 
            id="laudo-printable-area"
            className="bg-white text-slate-900 border shadow-2xl p-12 md:p-16 space-y-12 max-w-[800px] mx-auto text-sm leading-relaxed font-sans"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* PAGE 1: CAPA */}
            <div className="space-y-16 py-12 border-b-2 border-slate-900 pb-24 relative min-h-[1050px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Logo variant="print" className="h-12" />
                <div className="text-right font-mono text-[10px] text-slate-500">
                  <p>CÓDIGO: {laudoParams.laudoNumber}</p>
                  <p>DATA: {laudoParams.inspectionDate.split("-").reverse().join("/")}</p>
                </div>
              </div>

              <div className="space-y-6 text-center py-12">
                <span className="text-xs bg-[#134074]/10 text-[#134074] px-4 py-1.5 rounded-full font-black uppercase tracking-wider">
                  Laudo Técnico de Inspeção
                </span>
                <h1 className="text-3xl font-black tracking-tight font-sans text-slate-950 uppercase pt-4">
                  INSPEÇÃO VEICULAR (INTEGRIDADE FÍSICA)
                </h1>
                <p className="text-slate-500 text-xs tracking-widest uppercase font-mono">
                  Gerador Automático de Laudos Técnicos com Inteligência Artificial
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border space-y-3 text-xs">
                <h3 className="font-bold font-mono text-slate-400 uppercase tracking-widest">Identificação do Objeto</h3>
                <div className="grid grid-cols-2 gap-3">
                  <p><strong>Veículo:</strong> {laudoParams.brand} {laudoParams.model}</p>
                  <p><strong>Placa:</strong> {laudoParams.plate}</p>
                  <p><strong>Proprietário:</strong> {laudoParams.clientName}</p>
                  <p><strong>Data Inspeção:</strong> {laudoParams.inspectionDate.split("-").reverse().join("/")}</p>
                </div>
              </div>

              <div className="pt-12 text-center text-[10px] text-slate-400 font-mono">
                <p>VL Engenharia & Assessoria de Segurança Industrial Ltda</p>
                <p>Recife - PE | Brasil</p>
              </div>
            </div>

            {/* PAGE 2: PRESENTATION LETTER */}
            <div className="space-y-8 py-12 min-h-[1050px]">
              <h2 className="text-lg font-black border-b-2 border-slate-950 pb-2 text-slate-900 uppercase">
                Carta de Apresentação
              </h2>
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify">
                <p>Prezados Senhores,</p>
                <p>
                  Apresentamos a Vossas Senhorias o presente <strong>Laudo Técnico de Inspeção Veicular</strong>, contendo as avaliações de segurança, integridade estrutural e funcionalidade ativa/passiva do veículo automotor <strong>{laudoParams.brand} {laudoParams.model}</strong>, placa <strong>{laudoParams.plate}</strong>, em estrito atendimento à legislação de trânsito brasileira (Código de Trânsito Brasileiro) e normas técnicas vigentes (ABNT NBR 14447).
                </p>
                <p>
                  A finalidade técnica deste documento pericial é atestar a conformidade física e mecânica do veículo perante auditorias de frotas, segurança operacional do trabalho, transporte escolar ou vistorias de regularização cadastral.
                </p>
                <p>
                  Permanecemos à inteira disposição para prestar quaisquer esclarecimentos complementares de engenharia mecânica que se façam necessários.
                </p>
                <p className="pt-8">Atenciosamente,</p>
                <div className="pt-4 space-y-1">
                  <p className="font-bold text-slate-950">Eng. Mecânico Vitor Leonardo</p>
                  <p className="text-[10px] font-mono text-slate-500">CREA-PE: 1822299490</p>
                  <p className="text-[10px] font-mono text-slate-500">Responsável Técnico - VL Engenharia</p>
                  <p className="text-[10px] font-mono text-slate-500">vitorleonardocl@gmail.com | (81) 98444-2592</p>
                </div>
              </div>
            </div>

            {/* PAGE 3: SUMMARY */}
            <div className="space-y-6 py-12 min-h-[1050px]">
              <h2 className="text-lg font-black border-b-2 border-slate-950 pb-2 text-slate-900 uppercase">Sumário</h2>
              <ul className="space-y-2 text-xs font-mono text-slate-700">
                <li>01. Introdução, Objetivo e Escopo ............................................................................ Pág. 04</li>
                <li>02. Dados do Proprietário / Solicitante ........................................................................ Pág. 04</li>
                <li>03. Dados da Empresa Contratada (VL Engenharia) ............................................................. Pág. 05</li>
                <li>04. Dados Técnicos do Veículo Automotor .................................................................... Pág. 05</li>
                <li>05. Documentações e Prontuários Analisados .................................................................. Pág. 06</li>
                <li>06. Legislação e Normas Técnicas Aplicáveis .................................................................. Pág. 06</li>
                <li>07. Metodologia de Inspeção e Enquadramento .............................................................. Pág. 07</li>
                <li>08. Registro Fotográfico Geral de Campo ...................................................................... Pág. 07</li>
                <li>09. Detalhamento Técnico das Áreas Inspecionadas .......................................................... Pág. 08</li>
                <li>10. Checklist de Requisitos Obrigatórios CONTRAN ............................................................. Pág. 09</li>
                <li>11. Identificação dos Perigos Potenciais ........................................................................ Pág. 10</li>
                <li>12. Apreciação Quantitativa de Risco (HRN) ................................................................... Pág. 11</li>
                <li>13. Não Conformidades Legais e Técnicas ...................................................................... Pág. 12</li>
                <li>14. Recomendações de Engenharia ............................................................................... Pág. 13</li>
                <li>15. Plano de Ação Estruturado .................................................................................... Pág. 14</li>
                <li>16. Conclusão Técnica e Parecer de Regularização ............................................................ Pág. 15</li>
                <li>17. Limitações Metodológicas do Estudo ...................................................................... Pág. 16</li>
                <li>18. Termo de Encerramento e Anexos ART .................................................................. Pág. 16</li>
              </ul>
            </div>

            {/* SECTION 1 - 7 */}
            <div className="space-y-8 py-12">
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 1</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Introdução, Objetivo e Escopo</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_1}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 2</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Dados do Proprietário / Solicitante</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_2}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 3</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Dados da Empresa Contratada (VL Engenharia)</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_3}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 4</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Dados Técnicos do Veículo</h2>
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <p><strong>Marca / Modelo:</strong> {laudoParams.brand} {laudoParams.model}</p>
                  <p><strong>Ano Fabr / Modelo:</strong> {laudoParams.fabYear} / {laudoParams.modelYear}</p>
                  <p><strong>Cor:</strong> {laudoParams.color}</p>
                  <p><strong>Placa:</strong> {laudoParams.plate}</p>
                  <p><strong>Chassi:</strong> {laudoParams.chassi}</p>
                  <p><strong>RENAVAM:</strong> {laudoParams.renavam}</p>
                  <p><strong>Combustível:</strong> {laudoParams.fuelType}</p>
                  <p><strong>KM Atual:</strong> {laudoParams.kmCurrent}</p>
                  <p><strong>Lotação:</strong> {laudoParams.lotacao} pass.</p>
                  <p><strong>Peso Bruto Total (PBT):</strong> {laudoParams.pbt}</p>
                  <p><strong>Capacidade Carga:</strong> {laudoParams.cargoCapacity}</p>
                  <p><strong>Tipo Carroceria:</strong> {laudoParams.carroceriaType}</p>
                  <p><strong>Última Revisão:</strong> {laudoParams.lastRevision}</p>
                  <p><strong>Estado Geral Observado:</strong> {laudoParams.generalStatus}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 5</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Documentações Analisadas</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_5}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 6</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Legislação e Normas Aplicáveis</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_6}</p>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 7</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Metodologia</h2>
                <p className="text-xs text-slate-700 text-justify pt-2">{secoes.secao_7}</p>
              </div>
            </div>

            {/* SECTION 8: PHOTOS */}
            {uploadedImages.length > 0 && (
              <div className="space-y-6 py-12">
                <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 8</h3>
                <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Registro Fotográfico de Campo</h2>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="border p-2 rounded-xl bg-slate-50 text-center space-y-2">
                      <img src={img.data} className="w-full h-32 object-cover rounded-lg" />
                      <p className="text-[10px] text-slate-500 font-mono italic">
                        Foto {idx + 1}: {img.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 9: SYSTEMS ANALYSIS */}
            <div className="space-y-6 py-12">
              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 9</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Inspeção Detalhada por Subsistema</h2>
              
              <div className="space-y-4 text-xs text-slate-700 text-justify">
                <p><strong>9.1 Estrutura e Carroceria:</strong> {sistemasInspecao.estrutura_carroceria}</p>
                <p><strong>9.2 Sistema de Freios:</strong> {sistemasInspecao.freios}</p>
                <p><strong>9.3 Suspensão e Direção:</strong> {sistemasInspecao.suspensao_direcao}</p>
                <p><strong>9.4 Sistema Motor e Transmissão:</strong> {sistemasInspecao.motor_transmissao}</p>
                <p><strong>9.5 Sistema Elétrico e Eletrônico:</strong> {sistemasInspecao.eletrico_eletronico}</p>
                <p><strong>9.6 Itens de Segurança Obrigatórios:</strong> {sistemasInspecao.seguranca_obrigatoria}</p>
                <p><strong>9.7 Documentação Cadastral:</strong> {sistemasInspecao.documentacao}</p>
              </div>
            </div>

            {/* SECTION 10: CHECKLIST PRINTABLE */}
            <div className="space-y-6 py-12">
              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 10</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Checklist de Conformidade de Trânsito</h2>
              <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 font-mono">N°</th>
                    <th className="border border-slate-300 p-2">Item de Inspeção</th>
                    <th className="border border-slate-300 p-2 text-center">Status</th>
                    <th className="border border-slate-300 p-2">Parecer Técnico / Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{item.name}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${item.status === "SIM" ? "bg-emerald-100 text-emerald-800" : item.status === "NÃO" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        {item.nota}
                        {item.image && (
                          <div className="mt-1">
                            <span className="text-[9px] font-mono font-bold text-emerald-600">★ Foto de Evidência Anexa no Checklist</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECTION 11 & 12: HAZARDS & HRN */}
            <div className="space-y-6 py-12">
              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 11</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Identificação de Perigos Potenciais</h2>
              <p className="text-xs text-slate-700 text-justify">
                Com base no roteiro analítico da ABNT NBR 14447, foram mapeados perigos específicos associados ao uso diário de frotas corporativas, com foco em falhas mecânicas repentinas de alta criticidade (ex: pneus em desacordo com TWI mínimo, trincas no para-brisa frontal reduzindo ângulo de percepção, e alarmes eletrônicos inativos no painel).
              </p>

              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 12</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Apreciação Quantitativa de Risco (HRN)</h2>
              
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="border p-4 rounded-xl bg-red-500/5">
                  <h4 className="font-bold text-red-600 uppercase">A) Situação Atual (Antes)</h4>
                  <p className="pt-2"><strong>LO:</strong> {hrnBefore.lo} | <strong>FE:</strong> {hrnBefore.fe} | <strong>DPH:</strong> {hrnBefore.dph} | <strong>NP:</strong> {hrnBefore.np}</p>
                  <p className="pt-1"><strong>Score Calculado:</strong> {hrnBefore.score}</p>
                  <p className="font-bold text-red-700">Classificação: {hrnBefore.classification}</p>
                  <p className="pt-2 text-slate-500 italic">"{hrnBefore.explicacao}"</p>
                </div>

                <div className="border p-4 rounded-xl bg-emerald-500/5">
                  <h4 className="font-bold text-emerald-600 uppercase">B) Situação Recomendada (Depois)</h4>
                  <p className="pt-2"><strong>LO:</strong> {hrnAfter.lo} | <strong>FE:</strong> {hrnAfter.fe} | <strong>DPH:</strong> {hrnAfter.dph} | <strong>NP:</strong> {hrnAfter.np}</p>
                  <p className="pt-1"><strong>Score Residual:</strong> {hrnAfter.score}</p>
                  <p className="font-bold text-emerald-700">Classificação: {hrnAfter.classification}</p>
                  <p className="pt-2 text-slate-500 italic">"{hrnAfter.explicacao}"</p>
                </div>
              </div>
            </div>

            {/* SECTION 13 & 14 & 15: NC, RECOMENDAÇÕES, PLANO AÇÃO */}
            <div className="space-y-6 py-12">
              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 13</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Não Conformidades Legais e Técnicas</h2>
              <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 font-mono">ID</th>
                    <th className="border border-slate-300 p-2">Descrição Técnica da Irregularidade</th>
                    <th className="border border-slate-300 p-2">Criticidade</th>
                    <th className="border border-slate-300 p-2">Dispositivo Legal Violado</th>
                  </tr>
                </thead>
                <tbody>
                  {naoConformidades.map(nc => (
                    <tr key={nc.id}>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-center">{nc.id}</td>
                      <td className="border border-slate-300 p-2">{nc.descricao}</td>
                      <td className="border border-slate-300 p-2 font-black text-red-600">{nc.criticidade}</td>
                      <td className="border border-slate-300 p-2 font-mono text-slate-500">{nc.norma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 14</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Recomendações Técnicas</h2>
              <p className="text-xs text-slate-700 text-justify">
                Toda e qualquer intervenção corretiva para regularização deve seguir estritamente as especificações do manual do fabricante, utilizando componentes certificados de reposição para não anular as garantias de colisão ativa e passiva do veículo.
              </p>

              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 15</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Plano de Ação Corretivo (VL Engenharia)</h2>
              <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 font-mono">Cód.</th>
                    <th className="border border-slate-300 p-2">Irregularidade</th>
                    <th className="border border-slate-300 p-2">Ação Recomendada</th>
                    <th className="border border-slate-300 p-2">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {planoAcao.map(pa => (
                    <tr key={pa.id}>
                      <td className="border border-slate-300 p-2 font-mono text-center">{pa.id}</td>
                      <td className="border border-slate-300 p-2 font-bold">{pa.problema}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">{pa.recomendacao}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-slate-800">{pa.prazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECTION 16 & 17 & 18: CONCLUSÃO & FIM */}
            <div className="space-y-6 py-12">
              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 16</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Conclusão Técnica Pericial</h2>
              
              <div className="border-4 p-6 rounded-2xl space-y-4 text-xs bg-slate-50 border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black uppercase text-[10px] text-slate-400">Resultado Oficial</span>
                  <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider ${conclusao.status === "APROVADO" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
                    {conclusao.status}
                  </span>
                </div>
                <p className="text-justify leading-relaxed">
                  {conclusao.parecer}
                </p>
              </div>

              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 17</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Limitações Metodológicas</h2>
              <p className="text-xs text-slate-700 text-justify italic">
                {secoes.secao_17}
              </p>

              <h3 className="font-bold text-xs uppercase text-slate-400 font-mono tracking-wider">SEÇÃO 18</h3>
              <h2 className="text-base font-black border-b pb-1 text-slate-950 uppercase">Termo de Encerramento e Assinatura</h2>
              
              <div className="pt-12 text-center text-xs space-y-2 max-w-sm mx-auto">
                <div className="border-b-2 border-slate-900 pb-1.5" />
                <p className="font-black text-slate-950 font-sans">Eng. Mecânico Vitor Leonardo</p>
                <p className="font-mono text-[10px] text-slate-500">CREA-PE: 1822299490</p>
                <p className="font-mono text-[10px] text-[#134074] font-black">VL ENGENHARIA LTDA</p>
              </div>
            </div>

          </div>
        </div>

      </div>
      )}
    </div>
  );
}
