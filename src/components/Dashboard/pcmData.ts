export interface PcmParams {
  laudoNumber: string;
  clientName: string;
  cnpj: string;
  address: string;
  inspectionCity: string;
  inspectionDate: string;
  facilityName: string;
  facilityDesc: string;
  totalAssets: string;
  pcmAnalyst: string;
  deliveryType: "A" | "B" | "C" | "D" | "E"; // A: Diagnosis, B: PMP, C: FMEA, D: KPIs, E: Plano Diretor (Combined)
  notes: string;
  normasAdicionais?: string;
}

export interface DiagnosticoItem {
  id: string;
  categoria: string;
  item: string;
  status: "CONFORME" | "NÃO CONFORME" | "PARCIAL" | "N/A";
  criticidade: "CRÍTICA" | "ALTA" | "MÉDIA" | "BAIXA";
  observacao: string;
  recomendacao: string;
}

export interface PmpRotina {
  id: string;
  equipamento: string;
  tag: string;
  rotina: string;
  frequencia: "Diária" | "Semanal" | "Quinzenal" | "Mensal" | "Trimestral" | "Semestral" | "Anual";
  procedimento: string;
  tempoEstimado: string; // e.g. "30 min"
  executante: "Mecânico" | "Eletricista" | "Lubrificador" | "Operador" | "Equipe VL";
}

export interface FmeaItem {
  id: string;
  equipamento: string;
  componente: string;
  modoFalha: string;
  efeitoFalha: string;
  causaFalha: string;
  severidade: number; // 1-10
  ocorrencia: number; // 1-10
  deteccao: number; // 1-10
  rpn: number; // S * O * D
  acaoRecomendada: string;
}

export interface KpiMeta {
  id: string;
  indicador: string;
  descricao: string;
  valorAtual: string;
  meta: string;
  prazo: string;
  planoAcao: string;
}

export interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

export const PREFILLED_PCM_PARAMS: PcmParams = {
  laudoNumber: "LPCM-2026-009 Rev. 00",
  clientName: "Siderúrgica Pernambucana S/A",
  cnpj: "12.345.678/0001-90",
  address: "Rodovia BR-101 Sul, Km 35, Distrito Industrial, Cabo de Santo Agostinho - PE",
  inspectionCity: "Cabo de Santo Agostinho",
  inspectionDate: "2026-07-04",
  facilityName: "Planta de Utilidades e Sistema de Ar Comprimido Central",
  facilityDesc: "Unidade fabril contendo 4 compressores de ar rotativos de parafuso de grande porte, secadores por refrigeração e adsorção, e pulmões de armazenamento.",
  totalAssets: "18 ativos críticos",
  pcmAnalyst: "Vitor Leonardo - Engenheiro Mecânico (CREA-PE 1822299490)",
  deliveryType: "E", // Combined / Plano Diretor
  notes: "Consultoria em Gestão de Manutenção contratada para realizar o diagnóstico de maturidade do PCM atual, estruturar o Plano de Manutenção Preventiva sistemático das utilidades, realizar análise de falhas FMEA nos componentes gargalo e modelar o dashboard de KPIs para aumento da confiabilidade operacional.",
  normasAdicionais: "ABNT NBR ISO 55001, ABNT NBR 5410, ABNT NBR ISO 9001"
};

export const PREFILLED_DIAGNOSTICO: DiagnosticoItem[] = [
  {
    id: "diag_1",
    categoria: "Cadastro de Ativos",
    item: "Inventário físico, árvore lógica e codificação (TAGs) de equipamentos",
    status: "PARCIAL",
    criticidade: "ALTA",
    observacao: "Os compressores principais possuem TAGs físicas, porém o restante do circuito de distribuição e instrumentação de utilidades não está catalogado de forma estruturada no sistema.",
    recomendacao: "Elaborar o recadastro geral estruturado por nível hierárquico (Planta -> Setor -> Sistema -> Ativo -> Componente) seguindo a norma ABNT NBR ISO 14224."
  },
  {
    id: "diag_2",
    categoria: "Planejamento (PMP)",
    item: "Cronogramas de preventivas sistemáticas de 52 semanas estruturados",
    status: "NÃO CONFORME",
    criticidade: "CRÍTICA",
    observacao: "As manutenções preventivas ocorrem de forma reativa, disparadas por contatos informais ou alarmes do painel dos equipamentos, sem cronograma anual ou balanceamento de carga de trabalho.",
    recomendacao: "Implementar o cronograma sistemático anual de 52 semanas para as rotinas mecânicas e elétricas de utilidades, balanceando os recursos homens-hora (HH)."
  },
  {
    id: "diag_3",
    categoria: "Engenharia de Confiabilidade",
    item: "Execução de análises estruturadas de modos de falha (FMEA/RCFA)",
    status: "NÃO CONFORME",
    criticidade: "ALTA",
    observacao: "Inexistência de reuniões de análise de causa de falha após quebras catastróficas. Desgaste recorrente de rolamentos e sobreaquecimento são tratados apenas com troca rápida sem investigação de causa raiz.",
    recomendacao: "Adotar e treinar a equipe operacional na metodologia de análise de falhas FMEA, priorizando os ativos com maior RPN (Risk Priority Number)."
  },
  {
    id: "diag_4",
    categoria: "Controle de Indicadores",
    item: "Coleta e acompanhamento de indicadores de confiabilidade (MTBF, MTTR, Backlog)",
    status: "PARCIAL",
    criticidade: "ALTA",
    observacao: "O tempo de indisponibilidade é anotado em planilhas informais, porém não há cálculo formal do tempo médio entre falhas (MTBF) ou tempo médio para reparo (MTTR).",
    recomendacao: "Estruturar o cálculo automatizado dos indicadores fundamentais de manutenção via ordens de serviço eletrônicas, parametrizando metas auditáveis."
  }
];

export const PREFILLED_PCM_PMP: PmpRotina[] = [
  {
    id: "rot_1",
    equipamento: "Compressor de Parafuso CP-01 (Caterpillar/Atlas Copco)",
    tag: "VL-CMP-01",
    rotina: "Verificação visual de vazamentos de óleo e leitura de parâmetros nos manômetros",
    frequencia: "Diária",
    procedimento: "Inspecionar juntas de vedação, mangueiras flexíveis e visor de nível. Registrar temperatura do elemento e pressão de descarga no painel.",
    tempoEstimado: "15 min",
    executante: "Operador"
  },
  {
    id: "rot_2",
    equipamento: "Compressor de Parafuso CP-01 (Caterpillar/Atlas Copco)",
    tag: "VL-CMP-01",
    rotina: "Limpeza mecânica do trocador de calor de placas de ar/óleo com ar comprimido",
    frequencia: "Mensal",
    procedimento: "Com o equipamento desligado e bloqueado (LOTO), remover grades externas e soprar as aletas no sentido contrário ao fluxo de exaustão.",
    tempoEstimado: "1 hora",
    executante: "Mecânico"
  },
  {
    id: "rot_3",
    equipamento: "Secador de Ar por Refrigeração SEC-02",
    tag: "VL-SEC-02",
    rotina: "Teste funcional do purgador automático capacitivo de condensado",
    frequencia: "Semanal",
    procedimento: "Ativar purga manual para verificar vazão de descarga. Inspecionar sensor de nível de condensado e desmontar filtro Y de proteção se necessário.",
    tempoEstimado: "20 min",
    executante: "Mecânico"
  },
  {
    id: "rot_4",
    equipamento: "Motor Elétrico Principal M-01 (WEG 150HP)",
    tag: "VL-MTR-01",
    rotina: "Lubrificação por graxa de alta velocidade nos rolamentos dianteiro e traseiro",
    frequencia: "Trimestral",
    procedimento: "Limpar bicos de graxeira, aplicar graxa polireia com bomba manual seguindo a quantidade em gramas especificada na placa WEG.",
    tempoEstimado: "45 min",
    executante: "Lubrificador"
  }
];

export const PREFILLED_PCM_FMEA: FmeaItem[] = [
  {
    id: "fmea_1",
    equipamento: "Compressor de Parafuso CP-01",
    componente: "Válvula Termostática",
    modoFalha: "Travada fechada",
    efeitoFalha: "Não circulação de óleo pelo radiador, levando a disparo térmico imediato por sobreaquecimento (>110ºC) com parada de produção.",
    causaFalha: "Contaminação do fluido lubrificante por borras e desgaste do elemento expansor de cera interna.",
    severidade: 8,
    ocorrencia: 4,
    deteccao: 3,
    rpn: 96,
    acaoRecomendada: "Substituição sistemática do cartucho interno da válvula termostática a cada 8.000 horas de operação nas preventivas de grande porte."
  },
  {
    id: "fmea_2",
    equipamento: "Compressor de Parafuso CP-01",
    componente: "Elemento Separador de Ar/Óleo",
    modoFalha: "Saturação prematura / Ruptura",
    efeitoFalha: "Passagem excessiva de névoa de óleo lubrificante para a rede de distribuição fabril, arruinando a qualidade do ar e baixando nível de óleo.",
    causaFalha: "Não cumprimento do prazo de troca (vencido) ou contaminação por óleo não homologado oxidado.",
    severidade: 7,
    ocorrencia: 5,
    deteccao: 2,
    rpn: 70,
    acaoRecomendada: "Substituição preventiva do elemento separador com no máximo 4.000 horas, integrada a monitoramento por sensor de diferencial de pressão."
  },
  {
    id: "fmea_3",
    equipamento: "WEG Motor Elétrico Principal M-01",
    componente: "Rolamento Dianteiro",
    modoFalha: "Fadiga / Desgaste mecânico das esferas",
    efeitoFalha: "Travamento mecânico do eixo em carga, causando quebra estática catastrófica do cabeçote e sobrecarga severa no circuito elétrico.",
    causaFalha: "Falta de lubrificação sistemática periódica ou contaminação por partículas de poeira abrasiva.",
    severidade: 9,
    ocorrencia: 3,
    deteccao: 5,
    rpn: 135,
    acaoRecomendada: "Implementar rota de análise preditiva de vibração mensal por envelope de aceleração e redefinição de ciclo rigoroso de relubrificação."
  }
];

export const PREFILLED_PCM_KPIS: KpiMeta[] = [
  {
    id: "kpi_1",
    indicador: "MTBF (Tempo Médio Entre Falhas)",
    descricao: "Mede a confiabilidade geral do sistema calculando o tempo operado dividido pelas paradas não programadas.",
    valorAtual: "180 horas",
    meta: ">= 450 horas",
    prazo: "90 dias",
    planoAcao: "Iniciar rota de inspeção preventiva sistemática de 52 semanas e calibração fina dos sensores térmicos das unidades."
  },
  {
    id: "kpi_2",
    indicador: "MTTR (Tempo Médio para Reparo)",
    descricao: "Mede a manutenibilidade do sistema, avaliando o tempo de intervenção corretiva.",
    valorAtual: "12.4 horas",
    meta: "<= 4.0 horas",
    prazo: "60 dias",
    planoAcao: "Estruturar o kit de peças sobressalentes críticas no almoxarifado (kit de válvulas, vedações e fusíveis) e criar procedimentos de reparo rápido."
  },
  {
    id: "kpi_3",
    indicador: "Disponibilidade Operacional",
    descricao: "Percentual do tempo em que as utilidades de ar comprimido estiveram aptas a suprir a planta de produção.",
    valorAtual: "88.5%",
    meta: ">= 97.5%",
    prazo: "120 dias",
    planoAcao: "Instalação física de tubulação redundante tipo bypass inteligente para manutenção paralela sem corte de fluxo produtivo."
  },
  {
    id: "kpi_4",
    indicador: "Backlog de Manutenção",
    descricao: "Mede a carga de trabalho acumulada e pendente, expressa em semanas de HH do time.",
    valorAtual: "4.8 semanas",
    meta: "1.5 a 2.5 semanas",
    prazo: "45 dias",
    planoAcao: "Mutirão focado para encerramento de ordens de serviço preventivas atrasadas e eliminação de pequenos desvios prediais cadastrados."
  }
];
