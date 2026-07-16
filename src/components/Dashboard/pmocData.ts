export interface PMOCChecklistItem {
  id: string;
  category: string;
  text: string;
  status: "OK" | "NOK" | "N/A";
  nota: string;
}

export interface PMOCNaoConformidade {
  id: string;
  equipamento: string;
  problema: string;
  norma: string;
  recomendacao: string;
  prioridade: "IMEDIATO" | "CURTO PRAZO" | "MÉDIO PRAZO" | "LONGO PRAZO";
  responsavel: string;
  prazo: string;
}

export interface UploadedImage {
  name: string;
  data: string; // base64
  description: string;
}

export const DEFAULT_PMOC_CHECKLIST: PMOCChecklistItem[] = [
  {
    id: "item_1",
    category: "Filtros de Ar",
    text: "Filtros limpos, íntegros, sem saturação ou rasgos visíveis (Portaria MS 3.523/98)",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_2",
    category: "Serpentinas",
    text: "Serpentinas evaporadoras limpas, sem biofilme, sujeira acumulada ou oxidação excessiva (ANVISA RE 09/2003)",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_3",
    category: "Bandejas",
    text: "Bandejas de condensado limpas, higienizadas e sem acúmulo de água parada ou biofilmes",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_4",
    category: "Drenos",
    text: "Dreno de condensado completamente desobstruído e com caimento adequado para escoamento",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_5",
    category: "Unidade Externa",
    text: "Serpentinas condensadoras limpas e livres de obstruções físicas para o fluxo de ar",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_6",
    category: "Gabinetes",
    text: "Gabinetes com perfeita estanqueidade, livres de corrosões estruturais ou frestas na carcaça",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_7",
    category: "Ventilação",
    text: "Ventiladores e rotores limpos, balanceados e sem ruídos anormais de rolamento",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_8",
    category: "Circuito Frigorífico",
    text: "Circuitos frigoríficos estanques, sem indícios de vazamento de fluido ou óleo compressor",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_9",
    category: "Elétrica",
    text: "Aterramento funcional e quadros elétricos limpos, organizados e identificados (NR-10)",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_10",
    category: "Captação Externa",
    text: "Tomada de ar externo livre de focos de contaminação e protegida por grelhas integras (NBR 16401)",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_11",
    category: "Dutos",
    text: "Rede de dutos de ar limpa interna e externamente, sem rasgos no isolamento ou furos",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_12",
    category: "Grelhas e Difusores",
    text: "Grelhas e difusores de ar limpos, sem oxidação e regulados uniformemente",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_13",
    category: "Controles",
    text: "Termostatos e sensores operacionais, regulados nos limites de conforto térmico",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_14",
    category: "Isolamento Térmico",
    text: "Isolamento das tubulações de expansão direta e linhas de sucção em perfeitas condições",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_15",
    category: "Casa de Máquinas",
    text: "Casas de máquinas de climatização limpas, desimpedidas e com controle restrito de acesso",
    status: "OK",
    nota: "Inspeção visual padrão"
  },
  {
    id: "item_16",
    category: "Torre de Resfriamento",
    text: "Torres de resfriamento com bacias higienizadas, enchimento limpo e controle químico ativo",
    status: "N/A",
    nota: "Inexistente na planta de expansão direta analisada"
  },
  {
    id: "item_17",
    category: "Qualidade do Ar (QAI)",
    text: "Laudos semestrais/anuais de QAI físico-químico e microbiológico vigentes (RE 09 ANVISA)",
    status: "OK",
    nota: "Apresentado e arquivado para consulta"
  },
  {
    id: "item_18",
    category: "Registros",
    text: "Livro ou diário físico/digital de manutenções disponível para fiscalização sanitária local",
    status: "OK",
    nota: "Vias do PMOC arquivadas em formato digital"
  }
];

export const PREFILLED_PMOC_PARAMS = {
  laudoNumber: "PMOC-105/2026 Rev. 00",
  clientName: "Teatro & Centro Cultural Boa Vista",
  cnpj: "12.345.678/0001-90",
  address: "Rua do Hospício, nº 450",
  bairro: "Boa Vista",
  city: "Recife",
  uf: "PE",
  telefone: "(81) 3422-9900",
  email: "contato@teatroboavista.org.br",
  buildingType: "Centro Cultural e Teatro de Uso Coletivo",
  climatizedArea: "450 m²",
  numEnvironments: "6",
  estimatedUsers: "350 pessoas (lotação total)",
  refrigerantType: "R-410A (Ecológico)",
  issueDate: "04/07/2026",
  validityDate: "03/07/2027",
  rtName: "Eng. Mecânico Vitor Leonardo",
  rtCrea: "1822299490 - PE",
  rtArt: "PE202600495",
  notes: "Auditoria do PMOC cobrindo o sistema split e fancoils do palco e plateia principal do Teatro.",
  normasAdicionais: "Lei nº 13.589/2018, Resolução RE nº 9/2003 da ANVISA"
};

export const PREFILLED_PMOC_ENVIRONMENTS = [
  {
    id: "env_1",
    identificacao: "Plateia Principal (Pavimento Térreo)",
    numOcupantesFixo: "10",
    numOcupantesFlutuante: "300",
    areaM2: "320",
    cargaTermica: "180.000 BTU/h",
    tagEquipamento: "FC-01, FC-02"
  },
  {
    id: "env_2",
    identificacao: "Palco / Camarins",
    numOcupantesFixo: "15",
    numOcupantesFlutuante: "30",
    areaM2: "80",
    cargaTermica: "60.000 BTU/h",
    tagEquipamento: "SP-01, SP-02"
  },
  {
    id: "env_3",
    identificacao: "Foyer de Entrada / Bilheteria",
    numOcupantesFixo: "4",
    numOcupantesFlutuante: "100",
    areaM2: "50",
    cargaTermica: "36.000 BTU/h",
    tagEquipamento: "SP-03"
  }
];

export const PREFILLED_PMOC_APPLIANCES = [
  {
    id: "ap_1",
    tag: "FC-01",
    marca: "Carrier",
    modelo: "Fancoil Built-In",
    capacidade: "90.000 BTU/h",
    localizacao: "Plateia Lado Esquerdo",
    tipo: "Fancoil Unit (Água Gelada)",
    atividades: [
      { id: "act_1_1", descricao: "Limpar e higienizar filtros de ar (G4 + F7)", periodicidade: "Mensal", statusJan: "E", statusFev: "E", statusMar: "E", statusAbr: "E", statusMai: "E", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_1_2", descricao: "Higienizar serpentina de resfriamento com biocida", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_1_3", descricao: "Limpar dreno e desinfectar bandeja de condensado", periodicidade: "Mensal", statusJan: "E", statusFev: "E", statusMar: "E", statusAbr: "E", statusMai: "E", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_1_4", descricao: "Verificar corrente e conexões do motor de ventilação", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_1_5", descricao: "Verificar estanqueidade das válvulas de água e duto", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" }
    ]
  },
  {
    id: "ap_2",
    tag: "FC-02",
    marca: "Carrier",
    modelo: "Fancoil Built-In",
    capacidade: "90.000 BTU/h",
    localizacao: "Plateia Lado Direito",
    tipo: "Fancoil Unit (Água Gelada)",
    atividades: [
      { id: "act_2_1", descricao: "Limpar e higienizar filtros de ar (G4 + F7)", periodicidade: "Mensal", statusJan: "E", statusFev: "E", statusMar: "E", statusAbr: "E", statusMai: "E", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_2_2", descricao: "Higienizar serpentina de resfriamento com biocida", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_2_3", descricao: "Limpar dreno e desinfectar bandeja de condensado", periodicidade: "Mensal", statusJan: "E", statusFev: "E", statusMar: "E", statusAbr: "E", statusMai: "E", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_2_4", descricao: "Verificar corrente e conexões do motor de ventilação", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" }
    ]
  },
  {
    id: "ap_3",
    tag: "SP-01",
    marca: "Daikin",
    modelo: "Split Inverter SkyAir",
    capacidade: "30.000 BTU/h",
    localizacao: "Camarim A",
    tipo: "Cassete 4 vias",
    atividades: [
      { id: "act_3_1", descricao: "Higienizar filtros de tela plástica e grelha frontal", periodicidade: "Mensal", statusJan: "E", statusFev: "E", statusMar: "E", statusAbr: "E", statusMai: "E", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_3_2", descricao: "Verificar dreno e duto de saída", periodicidade: "Trimestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "E", statusMai: "P", statusJun: "P", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" },
      { id: "act_3_3", descricao: "Inspecionar circuito de refrigerante e pressões", periodicidade: "Semestral", statusJan: "E", statusFev: "P", statusMar: "P", statusAbr: "P", statusMai: "P", statusJun: "E", statusJul: "P", statusAgo: "P", statusSet: "P", statusOut: "P", statusNov: "P", statusDez: "P" }
    ]
  }
];

export const PREFILLED_PMOC_NAO_CONFORMIDADES: PMOCNaoConformidade[] = [
  {
    id: "NC-01",
    equipamento: "Plateia Principal (FC-01)",
    problema: "Acomodação excessiva de água na bandeja do fancoil FC-01 por pequena obstrução no dreno e desnivelamento físico da bandeja.",
    norma: "Portaria MS 3.523/1998 Requisito 3 e ANVISA RE 09/2003",
    recomendacao: "Efetuar o desentupimento técnico do sifão do dreno e realizar o ajuste estrutural nos calços de nivelamento da bandeja.",
    prioridade: "IMEDIATO",
    responsavel: "Técnico Climatização VL Engenharia",
    prazo: "3 dias"
  },
  {
    id: "NC-02",
    equipamento: "Camarim A (SP-01)",
    problema: "Filtros de ar do Split SP-01 com leve saturação de poeira residual e felpas têxteis decorrentes de roupas de cena.",
    norma: "Portaria MS 3.523/1998 Anexo I e Lei 13.589/2018",
    recomendacao: "Efetuar a lavagem mecânica dos filtros com detergente neutro e pulverização de biocida sanitizante VL.",
    prioridade: "CURTO PRAZO",
    responsavel: "Equipe de Manutenção Interna",
    prazo: "5 dias"
  },
  {
    id: "NC-03",
    equipamento: "Casa de Máquinas do Foyer",
    problema: "Porta da casa de máquinas do chiller e fan-coils destrancada, permitindo acesso acidental de pessoas não autorizadas e acúmulo de materiais de limpeza secos.",
    norma: "Portaria MS 3.523/1998 item 4.2",
    recomendacao: "Efetuar a limpeza imediata do espaço, remover os objetos alheios ao sistema e trancar a casa de máquinas, mantendo a chave sob responsabilidade da gerência técnica.",
    prioridade: "IMEDIATO",
    responsavel: "Gerente Operacional",
    prazo: "2 dias"
  }
];

export const DEFAULT_PMOC_SECOES: Record<string, string> = {
  introducao: "O presente Plano de Manutenção, Operação e Controle (PMOC) foi elaborado em estrito cumprimento às exigências da Lei nº 13.589 de 12 de janeiro de 2018 e da Portaria nº 3.523/GM de 28 de agosto de 1998 do Ministério da Saúde. O escopo primordial do documento consiste em estabelecer as diretrizes regulamentares de higienização, manutenção técnica preventiva e parâmetros físico-químicos e biológicos da qualidade do ar interior (QAI), visando garantir o conforto térmico, a eficiência energética e a prevenção de riscos à saúde pública dos ocupantes das áreas climatizadas.",
  metodologia: "A metodologia técnica para estruturação deste PMOC fundamenta-se nos preceitos da ABNT NBR 16401 (Partes 1, 2 e 3) e na Resolução RE nº 09 de 16 de janeiro de 2003 da ANVISA. Foram mapeadas todas as células climatizadas e realizado o inventário mecânico completo de cada evaporadora, condensadora, central de fancoil e suas ramificações. O acompanhamento das rotinas é registrado mensalmente no diário de bordo através de checklists físicos e assinatura dos operadores responsáveis.",
  sistemas_climatizacao: "O estabelecimento possui um sistema centralizado de climatização híbrido. A plateia principal é atendida por unidades Fan-Coil (FC-01 e FC-02) que operam em circuito fechado de água gelada, proporcionando alta capacidade de climatização e filtragem em níveis superiores com elementos do tipo G4 combinados a filtros finos F7. As demais dependências de apoio, camarins e foyer utilizam condicionadores de ar autônomos por expansão direta de alta performance, dotados de fluido refrigerante ecológico R-410A de baixa agressão ambiental.",
  conclusao_text: "Com base nas auditorias mecânicas e sanitárias conduzidas pela equipe técnica da VL Engenharia, declara-se que as instalações de climatização do estabelecimento encontram-se em perfeitas condições operacionais, adequando-se inteiramente aos requisitos impostos pela Lei Federal 13.589/2018. Fica recomendada a estrita observância das datas de execução das rotinas preventivas descritas no cronograma anual e o arquivamento sistemático dos registros para eventual fiscalização da Vigilância Sanitária (VISA)."
};

export interface PMOCCustomActivity {
  id: string;
  descricao: string;
  periodicidade: "Mensal" | "Trimestral" | "Semestral";
}

export const INITIAL_PMOC_ACTIVITIES: PMOCCustomActivity[] = [
  { id: "pact_1", descricao: "Inspeção geral na instalação do equipamento, curto circuito de ar, distribuição de insuflamento nas unidades, bloqueamento na entrada e saída de ar do condensador, unidade condensadora exposta à carga térmica.", periodicidade: "Mensal" },
  { id: "pact_2", descricao: "Verificar instalação elétrica", periodicidade: "Mensal" },
  { id: "pact_3", descricao: "Lavar e secar o filtro de ar (se necessário trocar)", periodicidade: "Mensal" },
  { id: "pact_4", descricao: "Medir tensão e corrente de funcionamento e comparar com a nominal.", periodicidade: "Mensal" },
  { id: "pact_5", descricao: "Verificar aperto de todos os terminais elétricos das unidades, evitar possíveis maus contatos", periodicidade: "Mensal" },
  { id: "pact_6", descricao: "Verificar obstrução de sujeira e aletas amassadas", periodicidade: "Mensal" },
  { id: "pact_7", descricao: "Verificar possíveis entupimentos ou amassamentos na mangueira do dreno.", periodicidade: "Mensal" },
  { id: "pact_8", descricao: "Efetuar a limpeza das serpentinas do evaporador;", periodicidade: "Trimestral" },
  { id: "pact_9", descricao: "Efetuar a limpeza do ventilador/rotor do evaporador;", periodicidade: "Trimestral" },
  { id: "pact_10", descricao: "Efetuar a limpeza da bandeja de condensado;", periodicidade: "Trimestral" },
  { id: "pact_11", descricao: "Fazer limpeza dos gabinetes", periodicidade: "Trimestral" },
  { id: "pact_12", descricao: "Verificar pressão de funcionamento;", periodicidade: "Semestral" },
  { id: "pact_13", descricao: "Efetuar a limpeza do condensador;", periodicidade: "Semestral" },
  { id: "pact_14", descricao: "Verificar estado dos compressores;", periodicidade: "Semestral" },
  { id: "pact_15", descricao: "Verificar operação do sensor de temperatura;", periodicidade: "Semestral" },
  { id: "pact_16", descricao: "Verificar estado dos suportes/coxins e corrigir caso necessário;", periodicidade: "Semestral" },
  { id: "pact_17", descricao: "Verificar posicionamento, fixação e balanceamento da hélice ou turbina;", periodicidade: "Semestral" },
  { id: "pact_18", descricao: "Verificar e corrigir isolante térmico das linhas de cobre", periodicidade: "Semestral" },
  { id: "pact_19", descricao: "Analise da Qualidade do Ar (Conforme a RES. /09);", periodicidade: "Semestral" }
];

export function generateActivitySchedule(act: PMOCCustomActivity) {
  const isMensal = act.periodicidade === "Mensal";
  const isTrimestral = act.periodicidade === "Trimestral";
  const isSemestral = act.periodicidade === "Semestral";

  return {
    id: act.id,
    descricao: act.descricao,
    periodicidade: act.periodicidade,
    statusJan: "P",
    statusFev: isMensal ? "P" : "-",
    statusMar: isMensal ? "P" : "-",
    statusAbr: isMensal || isTrimestral ? "P" : "-",
    statusMai: isMensal ? "P" : "-",
    statusJun: isMensal ? "P" : "-",
    statusJul: isMensal || isSemestral || isTrimestral ? "P" : "-",
    statusAgo: isMensal ? "P" : "-",
    statusSet: isMensal ? "P" : "-",
    statusOut: isMensal || isTrimestral ? "P" : "-",
    statusNov: isMensal ? "P" : "-",
    statusDez: isMensal ? "P" : "-"
  };
}
