export interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: "SIM" | "NÃO" | "N/A";
  nota: string;
  image?: string;
}

export interface HrnValue {
  lo: number;
  fe: number;
  dph: number;
  np: number;
  score: number;
  classification: string;
  explicacao: string;
}

export interface NaoConformidade {
  id: string;
  descricao: string;
  criticidade: "CRÍTICA" | "ALTA" | "MÉDIA" | "BAIXA";
  risco: string;
  norma: string;
}

export interface PlanoAcao {
  id: string;
  problema: string;
  norma: string;
  recomendacao: string;
  prioridade: "IMEDIATO" | "CURTO PRAZO" | "MÉDIO PRAZO";
  responsavel: string;
  prazo: string;
}

export const LO_OPTIONS = [
  { value: 0.033, label: "0,033 - Quase Impossível" },
  { value: 1.0, label: "1,0 - Muito Improvável" },
  { value: 1.5, label: "1,5 - Improvável" },
  { value: 2.0, label: "2,0 - Possível" },
  { value: 5.0, label: "5,0 - Inesperado" },
  { value: 8.0, label: "8,0 - Provável" },
  { value: 10.0, label: "10,0 - Muito Provável" },
  { value: 15.0, label: "15,0 - Certamente" }
];

export const FE_OPTIONS = [
  { value: 0.5, label: "0,5 - Anualmente" },
  { value: 1.0, label: "1,0 - Mensalmente" },
  { value: 1.5, label: "1,5 - Semanalmente" },
  { value: 2.5, label: "2,5 - Diariamente" },
  { value: 4.0, label: "4,0 - De Hora em Hora" },
  { value: 5.0, label: "5,0 - Constantemente" }
];

export const DPH_OPTIONS = [
  { value: 0.1, label: "0,1 - Arranhão/Contusão Leve" },
  { value: 0.5, label: "0,5 - Laceração/Leves Problemas" },
  { value: 1.0, label: "1,0 - Fratura de Ossos Pequenos" },
  { value: 2.0, label: "2,0 - Fratura de Ossos Grandes" },
  { value: 4.0, label: "4,0 - Fratura/Enfermidade Grave" },
  { value: 6.0, label: "6,0 - Perda de Um Membro/Olho" },
  { value: 8.0, label: "8,0 - Perda de Dois Membros" },
  { value: 15.0, label: "15,0 - Fatalidade" }
];

export const NP_OPTIONS = [
  { value: 1.0, label: "1,0 - 1-2 Pessoas" },
  { value: 2.0, label: "2,0 - 3-7 Pessoas" },
  { value: 4.0, label: "4,0 - 8-15 Pessoas" },
  { value: 8.0, label: "8,0 - 16-50 Pessoas" },
  { value: 12.0, label: "12,0 - Mais de 50 Pessoas" }
];

export function getHRNClassification(score: number) {
  if (score <= 1.0) return { label: "Risco Desprezível", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", action: "Aceitável; monitorar." };
  if (score <= 5.0) return { label: "Risco Muito Baixo", color: "bg-teal-500/10 text-teal-500 border-teal-500/20", action: "Melhorar se possível." };
  if (score <= 10.0) return { label: "Risco Baixo", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", action: "Ação a médio prazo." };
  if (score <= 50.0) return { label: "Risco Significante", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", action: "Ação técnica a curto prazo." };
  if (score <= 100.0) return { label: "Risco Alto", color: "bg-red-500/10 text-red-500 border-red-500/20", action: "Ação imediata." };
  if (score <= 500.0) return { label: "Risco Muito Alto", color: "bg-rose-600/10 text-rose-600 border-rose-600/20", action: "Parar atividade operacional." };
  if (score <= 1000.0) return { label: "Risco Extremo", color: "bg-purple-600/10 text-purple-600 border-purple-600/20", action: "INTERDITAR IMEDIATAMENTE." };
  return { label: "Risco Inaceitável", color: "bg-red-700/10 text-red-700 border-red-700/20", action: "INTERDIÇÃO IMEDIATA." };
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "item_1", name: "Capacidade de carga adequada à categoria pretendida", status: "SIM", nota: "Capacidade de carga deve ser compatível com peso próprio, passageiros e carga útil sob fatores da NBR 16858-2." },
  { id: "item_2", name: "Dimensões mínimas de cabine (ABNT NBR 16858-2)", status: "SIM", nota: "As dimensões da cabine devem permitir circulação confortável e espaço de segurança para passageiros/operadores." },
  { id: "item_3", name: "Altura livre mínima na cabine (≥ 2,00 m)", status: "SIM", nota: "A altura interna útil deve possuir o mínimo de 2,00 metros em toda a área de tráfego de pessoas." },
  { id: "item_4", name: "Para-quedas progressivo instalado e homologado", status: "SIM", nota: "Presença de freio de segurança de ação progressiva ou instantânea com amortecimento para retenção física em guias." },
  { id: "item_5", name: "Limitador de velocidade (governador) ativo", status: "SIM", nota: "Dispositivo mecânico centrífugo calibrado para atuar o para-quedas em caso de sobrevelocidade de descida." },
  { id: "item_6", name: "Intertravamento porta cabine x porta patamar", status: "SIM", nota: "Monitoramento elétrico e travamento físico das portas, impedindo movimento com cabine aberta ou destrancada." },
  { id: "item_7", name: "Portas de patamar com dimensões adequadas", status: "SIM", nota: "Portas de pavimento de altura regulamentar (mínimo 2,00 m) cobrindo totalmente a abertura do poço de percurso." },
  { id: "item_8", name: "Iluminação interna da cabine (≥ 50 lux)", status: "SIM", nota: "Medição de iluminância no interior do habitáculo deve atestar mínimo de 50 lux com luz protegida." },
  { id: "item_9", name: "Luz de emergência instalada e ativa", status: "SIM", nota: "Bloco autônomo de iluminação auxiliar para caso de falta de energia da rede predial." },
  { id: "item_10", name: "Alarme sonoro e botão de emergência", status: "SIM", nota: "Presença de sinalizador acústico de emergência acionável por botão destacado no console." },
  { id: "item_11", name: "Interfone ou dispositivo de comunicação", status: "SIM", nota: "Canal bidirecional de comunicação interligando a cabine com portaria ou central técnica externa de plantão." },
  { id: "item_12", name: "Botão de parada de emergência acessível", status: "SIM", nota: "Botão vermelho tipo cogumelo com trava na botoeira interna para parada imediata do quadro." },
  { id: "item_13", name: "Amortecedores de fundo de poço instalados", status: "SIM", nota: "Presença de amortecedores hidráulicos ou molas helicoidais calibradas de absorção de impacto no poço." },
  { id: "item_14", name: "Sumidouro no fundo do poço", status: "SIM", nota: "Presença de dreno físico ou sumidouro para evitar acúmulo de água no fundo da caixa de corrida." },
  { id: "item_15", name: "Aterramento elétrico verificado", status: "SIM", nota: "Conexão de malha de terra nas estruturas metálicas, motores e quadro elétrico homologada." },
  { id: "item_16", name: "Ventilação adequada na cabine", status: "SIM", nota: "Presença de grelhas de ventilação natural passiva dimensionada ou exaustor mecânico forçado ativo." },
  { id: "item_17", name: "Painel de comandos interno na cabine", status: "SIM", nota: "Presença de botoeira interna com botões de chamada e envio funcionais para controle interno direto." },
  { id: "item_18", name: "Fator de segurança mínimo de cabos (≥ 12)", status: "SIM", nota: "Os cabos de aço ou correntes de suspensão devem cumprir o coeficiente de segurança mínimo de 12 para passageiros." }
];

export const PREFILLED_PARAMS = {
  laudoNumber: "LRM-003/2026 Rev. 01",
  clientName: "Siderúrgica Planalto Nordeste Ltda",
  cnpj: "12.345.678/0001-90",
  address: "Rodovia BR-101, Km 42 - Distrito Industrial, Cabo de Santo Agostinho - PE",
  equipmentType: "Monta-Cargas Industrial",
  manufacturer: "Elevadores Otis Ltda",
  model: "MC-300 Heavy Duty",
  fabYear: "2018",
  serialNumber: "SN-MC849201",
  capacityCurrent: "300 kg",
  speedNominal: "0,25 m/s",
  numParadas: "3",
  heightPercurso: "12,5 m",
  dimensionsCabine: "1,0 x 1,0 x 1,2 metros (CxLxH)",
  driveSystem: "Elétrico com Moto-redutor e Tambor",
  suspensionType: "Cabos de Aço de 3/8\"",
  installationLocation: "Eixo Secundário de Abastecimento da Caldeira",
  lastMaintenance: "12/02/2026",
  lastInspection: "15/04/2025",
  proposedCategory: "Uso por pessoas acompanhando a carga",
  inspectionCity: "Recife",
  inspectionDate: "15/03/2026",
  notes: "O cliente solicita a reclassificação técnica do monta-cargas industrial para transporte de cargas acompanhadas por operador designado, necessitando de auditoria técnica para levantamento de adequações regulamentares e parecer sobre a viabilidade legal."
};

export const PREFILLED_CHECKLIST: ChecklistItem[] = [
  { id: "item_1", name: "Capacidade de carga adequada à categoria pretendida", status: "NÃO", nota: "Capacidade atual (300kg) limita o uso simultâneo de operador e cargas pesadas. Exige readequação de capacidade nominal e reforço do conjunto mecânico." },
  { id: "item_2", name: "Dimensões mínimas de cabine (ABNT NBR 16858-2)", status: "NÃO", nota: "Cabine atual (1,0x1,0 m) possui área aceitável para um operador, mas a estrutura física limita a ergonomia geral." },
  { id: "item_3", name: "Altura livre mínima na cabine (≥ 2,00 m)", status: "NÃO", nota: "A altura interna livre é de apenas 1,20 m, obrigando o operador a curvar-se. Totalmente inadequado para pessoas." },
  { id: "item_4", name: "Para-quedas progressivo instalado e homologado", status: "NÃO", nota: "Ausência total de freio de segurança mecânico automático (para-quedas) associado às guias no chassi." },
  { id: "item_5", name: "Limitador de velocidade (governador) ativo", status: "NÃO", nota: "Inexistência de limitador de velocidade centrífugo no topo do poço para acionamento de emergência." },
  { id: "item_6", name: "Intertravamento porta cabine x porta patamar", status: "NÃO", nota: "Portas não possuem trincos mecânicos com contatos elétricos de segurança redundantes de intertravamento." },
  { id: "item_7", name: "Portas de patamar com dimensões adequadas", status: "NÃO", nota: "Portas de pavimento do tipo veneziana pantográfica de altura reduzida (1,50 m), permitindo acesso perigoso ao poço." },
  { id: "item_8", name: "Iluminação interna da cabine (≥ 50 lux)", status: "NÃO", nota: "Lâmpada de cabine queimada. Nível medido em campo de apenas 5 lux (inadequado)." },
  { id: "item_9", name: "Luz de emergência instalada e ativa", status: "NÃO", nota: "Inexistência de iluminação de emergência autônoma instalada." },
  { id: "item_10", name: "Alarme sonoro e botão de emergência", status: "NÃO", nota: "Não há sistema de alarme ou sirene acústica de pânico operacional." },
  { id: "item_11", name: "Interfone ou dispositivo de comunicação", status: "NÃO", nota: "Ausência de interfone ativo para chamadas externas em caso de pane mecânica." },
  { id: "item_12", name: "Botão de parada de emergência acessível", status: "SIM", nota: "Botão cogumelo inoperante de parada localizado no patamar externo, inexistente na cabine." },
  { id: "item_13", name: "Amortecedores de fundo de poço instalados", status: "SIM", nota: "Para-choques de borracha maciça instalados no fundo do poço, aceitáveis mas sem molas hidráulicas." },
  { id: "item_14", name: "Sumidouro no fundo do poço", status: "NÃO", nota: "Poço acumula água pluvial e umidade por falta de sumidouro ou bomba de dreno automática." },
  { id: "item_15", name: "Aterramento elétrico verificado", status: "SIM", nota: "Aterramento da carcaça do motor e do trilho das guias em bom estado de conservação." },
  { id: "item_16", name: "Ventilação adequada na cabine", status: "NÃO", nota: "Cabine metálica totalmente fechada, sem aberturas ou grelhas de circulação natural." },
  { id: "item_17", name: "Painel de comandos interno na cabine", status: "NÃO", nota: "Operação exclusiva por botões de patamar externos; botoeira interna inexistente." },
  { id: "item_18", name: "Fator de segurança mínimo de cabos (≥ 12)", status: "NÃO", nota: "Fator de segurança dos cabos atuais estimado em 7,5, abaixo do fator normativo 12 exigido para pessoas." }
];

export const PREFILLED_NAO_CONFORMIDADES: NaoConformidade[] = [
  {
    id: "NC-01",
    descricao: "Inexistência de freio de segurança mecânico tipo para-quedas progressivo no chassi e de limitador de velocidade centrífugo acoplado no topo do poço.",
    criticidade: "CRÍTICA",
    risco: "Queda livre da cabine em caso de ruptura dos cabos de suspensão ou quebra do redutor de tração.",
    norma: "ABNT NBR 16858-1 item 5.6"
  },
  {
    id: "NC-02",
    descricao: "Módulo da cabine com altura livre interna útil de apenas 1,20 m, forçando operadores a se curvarem durante o acesso.",
    criticidade: "CRÍTICA",
    risco: "Esmagamento físico de operadores, lesões musculares e fadiga postural grave durante a movimentação.",
    norma: "ABNT NBR 16858-2 item 4.1"
  },
  {
    id: "NC-03",
    descricao: "Ausência de portas de patamar com altura padrão (2,00m) e venezianas de pavimento sem fechaduras de intertravamento mecânico e elétrico monitoradas.",
    criticidade: "CRÍTICA",
    risco: "Queda de pessoas no poço de corrida e esmagamento decorrente da partida voluntária ou involuntária com portas abertas.",
    norma: "ABNT NBR 16858-1 item 5.3"
  },
  {
    id: "NC-04",
    descricao: "Ausência de botoeira de controle interna, iluminação de emergência auxiliar, interfone bidirecional ativo e alarme acústico de pânico.",
    criticidade: "ALTA",
    risco: "Clausura prolongada e falta de capacidade de resgate ou emissão de pedidos de socorro do operador em caso de pane.",
    norma: "ABNT NBR 16858-1 item 5.12"
  }
];

export const PREFILLED_PLANO_ACAO: PlanoAcao[] = [
  {
    id: "AP-01",
    problema: "Inexistência de freio para-quedas mecânico e governador de velocidade",
    norma: "ABNT NBR 16858-1 item 5.6",
    recomendacao: "Elaborar projeto mecânico estrutural de adequação e instalar freio para-quedas de ação progressiva no chassi inferior da cabine acoplado a limitador de velocidade regulamentado.",
    prioridade: "IMEDIATO",
    responsavel: "Equipe de Engenharia / Fornecedor Homologado",
    prazo: "15 dias"
  },
  {
    id: "AP-02",
    problema: "Cabine com altura livre inadequada de 1,20 metros",
    norma: "ABNT NBR 16858-2 item 4.1",
    recomendacao: "Proceder à substituição integral da cabine metálica por um módulo novo em chapas de aço dobradas com altura livre interna útil mínima de 2,00 metros e piso antiderrapante.",
    prioridade: "IMEDIATO",
    responsavel: "Oficina Metalúrgica VL Engenharia",
    prazo: "20 dias"
  },
  {
    id: "AP-03",
    problema: "Portas de pavimento venezianas curtas e desprotegidas",
    norma: "ABNT NBR 16858-1 item 5.3",
    recomendacao: "Instalar portas de patamar metálicas de fechamento total (mínimo 2,00 m de altura) equipadas com trincos de segurança e chaves mecânicas de intertravamento homologadas.",
    prioridade: "IMEDIATO",
    responsavel: "Equipe de Montagem de Elevadores",
    prazo: "10 dias"
  },
  {
    id: "AP-04",
    problema: "Inexistência de alarmes, iluminação e interfone na cabine",
    norma: "ABNT NBR 16858-1 item 5.12",
    recomendacao: "Realizar instalação elétrica interna na cabine englobando botoeira de comandos, interfone bidirecional, bloco de iluminação autônoma de emergência e buzina de pânico.",
    prioridade: "IMEDIATO",
    responsavel: "Técnico de Elétrica de Manutenção",
    prazo: "5 dias"
  }
];

export const PREFILLED_SISTEMAS = {
  cabine: "A cabine atual possui altura útil inadequada de 1,20 metros, revestimento simples em chapa metálica fina de baixa resistência mecânica, sem iluminação operacional, botões internos ou exaustor.",
  poco_casa_maquinas: "Poço de alvenaria íntegro, seco, mas com umidade e falta de sumidouro/dreno de fundo de poço. Casa de máquinas possui pé-direito adequado mas ventilação natural reduzida.",
  sistema_tracao: "Conjunto moto-redutor de acionamento em bom estado de fixação mecânica, cabos de suspensão íntegros, porém cuja bitola atual fornece fator de segurança (7,5) inferior ao limite regulamentar (12).",
  guias_estrutura: "Guias lineares metálicas sem folgas excessivas e com paralelismo de corrida medido em conformidade, requerendo apenas reforços estruturais nas vigas de ancoragem no poço.",
  dispositivos_seguranca: "Ausência total de freio de segurança mecânico (para-quedas), limitador de velocidade, amortecedores hidráulicos calibrados de fundo de poço, sensores de abertura de porta e travas mecânicas.",
  portas_patamar: "As portas pantográficas venezianas de patamar são baixas e desprotegidas de intertravamento, permitindo acesso acidental à área de percurso.",
  sistema_eletrico: "Painel elétrico elementar de comandos montado em caixa metálica, sem relés de segurança de porta aberta ou duplicidade de contatores de força para o motor."
};

export const PREFILLED_CONCLUSÃO = {
  status: "VIÁVEL MEDIANTE ADAPTAÇÕES" as const,
  parecer: "A reclassificação técnica do equipamento monta-cargas para a categoria 'Uso por pessoas acompanhando a carga' é declarada tecnicamente VIÁVEL, condicionada à completa e rigorosa execução de todas as modificações técnicas e elétricas exigidas neste laudo (incluindo a substituição da cabine para altura útil de 2,00m, instalação de freio de segurança mecânico progressivo nas guias e portas de patamar com sistema de intertravamento elétrico redundante)."
};

export const DEFAULT_SECOES = {
  "secao_1": "Carregando introdução técnica...",
  "secao_2": "Carregando dados da contratante...",
  "secao_3": "Carregando dados da contratada...",
  "secao_4": "Carregando dados das especificações do equipamento...",
  "secao_5": "Carregando finalidade técnica da reclassificação...",
  "secao_6": "Carregando documentos periciais analisados...",
  "secao_7": "Carregando normas e referências de elevadores...",
  "secao_8": "Carregando metodologia de análise HRN e riscos...",
  "secao_9": "Carregando registro fotográfico em campo...",
  "secao_10": "Carregando inspeção visual detalhada de macros...",
  "secao_11": "Carregando comparativo normativo de conformidade...",
  "secao_12": "Carregando resultado sistemático do checklist...",
  "secao_13": "Carregando identificação dos perigos veiculados...",
  "secao_14": "Carregando apreciação quantitativa de riscos (HRN)...",
  "secao_15": "Carregando não conformidades normativas...",
  "secao_16": "Carregando lista de adaptações obrigatórias...",
  "secao_17": "Carregando parecer técnico de viabilidade...",
  "secao_18": "Carregando estimativa de intervenções e complexidades...",
  "secao_19": "Carregando plano de ação corretivo e preventivo...",
  "secao_20": "Carregando conclusão técnica pericial de Vitor Leonardo...",
  "secao_21": "Carregando limitações e escopo legal do laudo...",
  "secao_22": "Carregando anexos fotográficos e documentos de suporte..."
};
