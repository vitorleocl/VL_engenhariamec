export interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

export type ChecklistStatus = "OK" | "DM" | "DG" | "NI" | "NA";

export interface ChecklistItem {
  id: string;
  name: string;
  status: ChecklistStatus;
  nota: string;
  bloco: string;
}

export interface DanoCartao {
  id: string;
  fotoRef: string;
  localizacao: string;
  componente: string;
  descricaoDano: string;
  tipoDano: string;
  enquadramento: string;
  classificacao: "PEQUENA" | "MÉDIA" | "GRANDE";
  grauConfianca: "★★★★★" | "★★★★☆" | "★★★☆☆" | "★★☆☆☆" | "★☆☆☆☆";
  grauConfiancaPercentual: number;
  justificativa: string;
  impactoSeguranca: "CRÍTICO" | "ALTO" | "MÉDIO" | "BAIXO";
  reparabilidade: "RECUPERÁVEL" | "SUBSTITUIÇÃO NECESSÁRIA" | "PERDA TOTAL PROVÁVEL" | "A AVALIAR PRESENCIALMENTE";
}

export const BLOCOS_LABELS: Record<string, string> = {
  bloco_1: "BLOCO 1 — ESTRUTURA DIANTEIRA",
  bloco_2: "BLOCO 2 — HABITÁCULO (CÉLULA DE SOBREVIVÊNCIA)",
  bloco_3: "BLOCO 3 — PORTAS",
  bloco_4: "BLOCO 4 — ESTRUTURA TRASEIRA",
  bloco_5: "BLOCO 5 — SISTEMA DE RETENÇÃO E SEGURANÇA PASSIVA",
  bloco_6: "BLOCO 6 — SISTEMA MECÂNICO",
  bloco_7: "BLOCO 7 — SISTEMA ELÉTRICO E ELETRÔNICO",
  bloco_8: "BLOCO 8 — COMPONENTES EXTERNOS",
  bloco_9: "BLOCO 9 — IDENTIFICAÇÃO DO VEÍCULO"
};

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // BLOCO 1
  { id: "b1_1", name: "Longarina dianteira esquerda", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_2", name: "Longarina dianteira direita", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_3", name: "Travessa dianteira superior", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_4", name: "Travessa dianteira inferior (subframe/berço)", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_5", name: "Painel dianteiro (frontal/radiador)", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_6", name: "Torre de suspensão dianteira esquerda", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_7", name: "Torre de suspensão dianteira direita", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_8", name: "Caixa de roda dianteira esquerda", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_9", name: "Caixa de roda dianteira direita", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_10", name: "Para-lama dianteiro esquerdo", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_11", name: "Para-lama dianteiro direito", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_12", name: "Capô (chapa e estrutura)", status: "OK", nota: "", bloco: "bloco_1" },
  { id: "b1_13", name: "Para-choque dianteiro", status: "OK", nota: "", bloco: "bloco_1" },

  // BLOCO 2
  { id: "b2_1", name: "Coluna A esquerda", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_2", name: "Coluna A direita", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_3", name: "Coluna B esquerda", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_4", name: "Coluna B direita", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_5", name: "Coluna C esquerda", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_6", name: "Coluna C direita", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_7", name: "Soleira esquerda", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_8", name: "Soleira direita", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_9", name: "Assoalho dianteiro", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_10", name: "Assoalho traseiro", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_11", name: "Túnel central do assoalho", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_12", name: "Teto (estrutura e chapa)", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_13", name: "Firewall / painel corta-fogo", status: "OK", nota: "", bloco: "bloco_2" },
  { id: "b2_14", name: "Painel de instrumentos (deformação por invasão)", status: "OK", nota: "", bloco: "bloco_2" },

  // BLOCO 3
  { id: "b3_1", name: "Porta dianteira esquerda (chapa + reforço interno)", status: "OK", nota: "", bloco: "bloco_3" },
  { id: "b3_2", name: "Porta dianteira direita (chapa + reforço interno)", status: "OK", nota: "", bloco: "bloco_3" },
  { id: "b3_3", name: "Porta traseira esquerda (chapa + reforço interno)", status: "OK", nota: "", bloco: "bloco_3" },
  { id: "b3_4", name: "Porta traseira direita (chapa + reforço interno)", status: "OK", nota: "", bloco: "bloco_3" },
  { id: "b3_5", name: "Batente de porta esquerdo", status: "OK", nota: "", bloco: "bloco_3" },
  { id: "b3_6", name: "Batente de porta direito", status: "OK", nota: "", bloco: "bloco_3" },

  // BLOCO 4
  { id: "b4_1", name: "Longarina traseira esquerda", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_2", name: "Longarina traseira direita", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_3", name: "Travessa traseira", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_4", name: "Painel traseiro (tampa porta-malas / painel de fechamento)", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_5", name: "Caixa de roda traseira esquerda", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_6", name: "Caixa de roda traseira direita", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_7", name: "Tampa do porta-malas / tampa traseira", status: "OK", nota: "", bloco: "bloco_4" },
  { id: "b4_8", name: "Para-choque traseiro", status: "OK", nota: "", bloco: "bloco_4" },

  // BLOCO 5
  { id: "b5_1", name: "Airbag do motorista (volante) — acionado ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_2", name: "Airbag do passageiro (painel) — acionado ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_3", name: "Airbags laterais (torax) — acionados ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_4", name: "Airbags de cortina — acionados ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_5", name: "Pré-tensionador do motorista — acionado ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_6", name: "Pré-tensionador do passageiro — acionado ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_7", name: "Pré-tensionadores traseiros — acionados ou não", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_8", name: "Cintos de segurança — estado de todos os pontos", status: "OK", nota: "", bloco: "bloco_5" },
  { id: "b5_9", name: "Módulo SRS (Supplemental Restraint System) — danos", status: "OK", nota: "", bloco: "bloco_5" },

  // BLOCO 6
  { id: "b6_1", name: "Motor — posição e danos externos visíveis", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_2", name: "Câmbio / transmissão — danos externos visíveis", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_3", name: "Suspensão dianteira (braços, molas, amortecedores, pivôs)", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_4", name: "Suspensão traseira (braços, molas, amortecedores)", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_5", name: "Caixa de direção e coluna de direção", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_6", name: "Sistema de freios (discos, tambores, pinças, cilindros visíveis)", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_7", name: "Eixos e semieixos", status: "OK", nota: "", bloco: "bloco_6" },
  { id: "b6_8", name: "Rodas e pneus (todos os pontos)", status: "OK", nota: "", bloco: "bloco_6" },

  // BLOCO 7
  { id: "b7_1", name: "Fiação visível — estado e danos", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_2", name: "Módulos eletrônicos — danos visíveis", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_3", name: "Bateria — estado e posicionamento", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_4", name: "Alternador e sistema de carga", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_5", name: "Quadro de fusíveis", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_6", name: "Danos por alagamento (linha d'água, oxidação de conectores)", status: "OK", nota: "", bloco: "bloco_7" },
  { id: "b7_7", name: "Danos por incêndio (fiação e módulos)", status: "OK", nota: "", bloco: "bloco_7" },

  // BLOCO 8
  { id: "b8_1", name: "Vidro do para-brisa", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_2", name: "Vidros laterais", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_3", name: "Vidro traseiro", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_4", name: "Faróis dianteiros", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_5", name: "Lanternas traseiras", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_6", name: "Retrovisores externos", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_7", name: "Maçanetas e ferragens externas", status: "OK", nota: "", bloco: "bloco_8" },
  { id: "b8_8", name: "Emblemas e acabamentos", status: "OK", nota: "", bloco: "bloco_8" },

  // BLOCO 9
  { id: "b9_1", name: "Número do chassi (VIN) — visível e legível", status: "OK", nota: "", bloco: "bloco_9" },
  { id: "b9_2", name: "Plaqueta de identificação — presente e íntegra", status: "OK", nota: "", bloco: "bloco_9" },
  { id: "b9_3", name: "Número do motor — visível (quando acessível)", status: "OK", nota: "", bloco: "bloco_9" },
  { id: "b9_4", name: "Placa de identificação — estado", status: "OK", nota: "", bloco: "bloco_9" }
];

export const PREFILLED_PARAMS = {
  laudoNumber: "LRM-047/2026 Rev. 00",
  clientName: "TransLogística Pernambuco Ltda",
  cnpj: "42.921.848/0001-72",
  address: "Av. Marechal Mascarenhas de Morais, 2901 - Imbiribeira, Recife - PE",
  telephone: "(81) 3444-9090",
  email: "contato@translogisticapereira.com.br",
  ownerName: "Pedro Albuquerque Pereira",
  ownerDoc: "099.482.904-88",
  brand: "Toyota",
  model: "Hilux CD SRV 4x4 2.8 Diesel",
  fabYear: "2023",
  modelYear: "2023",
  color: "Prata Metálico",
  plate: "QYF-9H20",
  vin: "8AJHA82G0PJ482991",
  renavam: "01349820491",
  motorNumber: "1GD-FTV-849201",
  fuel: "DIESEL",
  category: "PARTICULAR",
  bodyType: "PICKUP",
  mileage: "42.500 km",
  conditionPre: "Excelente estado de conservação, sem registro de sinistros anteriores no prontuário.",
  conditionActual: "O veículo apresenta colisão frontal-lateral esquerda de média intensidade, com deformação da torre de suspensão esquerda, para-lama esquerdo e danos em para-choque.",
  insuranceCompany: "Porto Seguro Companhia de Seguros Gerais",
  claimNumber: "CLAIM-90492-2026",
  claimDate: "12/05/2026",
  claimType: "Colisão frontal-lateral",
  inspectionCity: "Recife",
  inspectionState: "PE",
  inspectionDate: "20/05/2026",
  notes: "O veículo foi classificado inicialmente como Grande Monta devido ao acionamento dos airbags e deformação parcial na soleira esquerda. O proprietário contesta a classificação inicial fundamentando-se na inexistência de deformações permanentes nas colunas principais A, B, C e sem invasão de habitáculo. O presente laudo visa a reclassificação técnica sob as diretrizes da Resolução CONTRAN nº 810/2020."
};

export const PREFILLED_CHECKLIST_UPDATES: Record<string, ChecklistStatus> = {
  b1_1: "DM", // Longarina dianteira esquerda - dano parcial recuperável
  b1_5: "DM", // Painel dianteiro - dano parcial
  b1_6: "DM", // Torre suspensão esq - dano recuperável
  b1_10: "NI", // Para-lama esq - Pequena Monta
  b1_12: "NI", // Capô - Pequena Monta
  b1_13: "NI", // Para-choque - Pequena Monta
  b2_7: "DM", // Soleira esq - dano estrutural (Média Monta)
  b5_1: "DM", // Airbag motorista acionado (Média Monta isolado)
  b5_2: "DM", // Airbag passageiro acionado (Média Monta isolado)
  b5_5: "DM", // Pré-tensionador acionado
  b6_3: "DM", // Suspensão dianteira esq - braços/amortecedor danificados
  b8_1: "NI", // Para-brisas trincado (Pequena Monta)
  b8_4: "NI", // Farol dianteiro esq (Pequena Monta)
  b9_1: "OK"  // Chassi íntegro
};

export const PREFILLED_DANOS: DanoCartao[] = [
  {
    id: "dano_1",
    fotoRef: "Foto 1 — Vista Frontal-Lateral Esquerda",
    localizacao: "Quadrante dianteiro esquerdo, região da caixa de roda e torre",
    componente: "Torre de Suspensão Dianteira Esquerda",
    descricaoDano: "Torção parcial do caixilho de fixação do amortecedor sem fraturas na solda estrutural e sem deformação do caixilho do motor.",
    tipoDano: "Deformação",
    enquadramento: "Resolução CONTRAN 810/2020 — Anexo II (Média Monta)",
    classificacao: "MÉDIA",
    grauConfianca: "★★★★★",
    grauConfiancaPercentual: 98,
    justificativa: "Dano visível e isolado na torre esquerda. Não há transmissão de esforços para as travessas do habitáculo.",
    impactoSeguranca: "ALTO",
    reparabilidade: "SUBSTITUIÇÃO NECESSÁRIA"
  },
  {
    id: "dano_2",
    fotoRef: "Foto 3 — Detalhe Soleira Esquerda",
    localizacao: "Região inferior abaixo da porta dianteira esquerda",
    componente: "Soleira Estrutural Esquerda",
    descricaoDano: "Amassamento localizado no perfil metálico da soleira, provocado por impacto mecânico direto contra obstáculo rígido, sem comprometer a integridade da coluna A ou assoalho.",
    tipoDano: "Amassamento",
    enquadramento: "Resolução CONTRAN 810/2020 — Anexo II (Média Monta)",
    classificacao: "MÉDIA",
    grauConfianca: "★★★★☆",
    grauConfiancaPercentual: 92,
    justificativa: "Deformação localizada com boa visibilidade lateral. Não há torção do habitáculo principal.",
    impactoSeguranca: "MÉDIO",
    reparabilidade: "RECUPERÁVEL"
  },
  {
    id: "dano_3",
    fotoRef: "Foto 5 — Interior do Habitáculo",
    localizacao: "Volante e console frontal do passageiro",
    componente: "Airbags Dianteiros e Pré-tensionadores",
    descricaoDano: "Acionamento completo das bolsas de ar (SRS) do motorista e passageiro decorrente da desaceleração do impacto frontal.",
    tipoDano: "Acionamento",
    enquadramento: "Resolução CONTRAN 810/2020 — Anexo II (Média Monta)",
    classificacao: "MÉDIA",
    grauConfianca: "★★★★★",
    grauConfiancaPercentual: 100,
    justificativa: "As bolsas de ar aparecem infladas e expostas, sem indícios de colapso estrutural do habitáculo associado.",
    impactoSeguranca: "ALTO",
    reparabilidade: "SUBSTITUIÇÃO NECESSÁRIA"
  },
  {
    id: "dano_4",
    fotoRef: "Foto 2 — Detalhe Para-lama Esquerdo",
    localizacao: "Lateral externa dianteira esquerda",
    componente: "Para-lama Dianteiro Esquerdo",
    descricaoDano: "Amassamento superficial da folha externa sem afetar os pontos internos de união estrutural principais.",
    tipoDano: "Amassamento",
    enquadramento: "Resolução CONTRAN 810/2020 — Anexo I (Pequena Monta)",
    classificacao: "PEQUENA",
    grauConfianca: "★★★★★",
    grauConfiancaPercentual: 99,
    justificativa: "Componente puramente estético e de fechamento externo de fácil substituição por parafusamento.",
    impactoSeguranca: "BAIXO",
    reparabilidade: "SUBSTITUIÇÃO NECESSÁRIA"
  }
];

export const DEFAULT_LEGISLACAO = `
| Norma | Emissor | Descrição |
|---|---|---|
| **Resolução CONTRAN nº 810/2020** | CONTRAN | Regulamenta o art. 126 do CTB; Define procedimentos para classificação e reclassificação de monta de veículos sinistrados. |
| **Lei nº 9.503/1997 (CTB)** | Congresso Nacional | Código de Trânsito Brasileiro: Art. 126 (Comunicação de acidente), Art. 127 (Cancelamento de registro). |
| **ABNT NBR 14447:2008** | ABNT | Estabelece diretrizes gerais para a inspeção técnica de segurança em veículos rodoviários sinistrados. |
| **ABNT NBR ISO 3833** | ABNT | Define nomenclaturas e classificações padronizadas de tipos de carrocerias veiculares. |
`;

export const DEFAULT_SECOES = {
  introducao: `O presente laudo técnico pericial tem por finalidade a avaliação criteriosa e sistemática da extensão dos danos sofridos pelo veículo acima identificado após evento de sinistro rodoviário. Com base nos preceitos da Resolução CONTRAN nº 810/2020, o processo de reclassificação visa analisar individualmente os elementos de segurança passiva e ativa, bem como a integridade da célula de sobrevivência do habitáculo, a fim de ratificar ou retificar administrativamente a classificação provisória de monta inserida nos cadastros do RENAVAM.`,
  metodologia: `A metodologia empregada envolveu inspeção visual detalhada das partes estruturais, chassi e habitáculo do veículo, registro fotográfico pormenorizado dos pontos de impacto e aplicação rigorosa da tabela classificatória de danos contida nos Anexos I, II e III da Resolução CONTRAN nº 810/2020. Foi utilizada varredura digital por modelo de linguagem com fins de confirmação de padrões de danos por imagem de inteligência artificial, seguida de chancela técnica de engenharia mecânica.`,
  limitacoes: `A avaliação estrutural e dos componentes mecânicos internos está sujeita às limitações de visualização por imagem. Itens não aparentes ou ocultos sob carenagens protetoras, como fiação interna do módulo de injeção secundário e componentes do subframe inferior, deverão ser confirmados em inspeção presencial detalhada durante a etapa de desmontagem técnica e reparo mecânico, se necessário.`,
  conclusao: `Ante o exposto e considerando a análise técnica exaustiva dos componentes afetados, conclui-se que os danos estruturais de maior gravidade identificados enquadram-se na categoria de **MÉDIA MONTA**, conforme o Anexo II da Resolução CONTRAN nº 810/2020. O habitáculo e as colunas principais de segurança (A, B e C) mantiveram-se perfeitamente íntegros e sem deformação estrutural, não havendo enquadramento em nenhum item do Anexo III (Grande Monta). O veículo é, portanto, classificado tecnicamente como **RECUPERÁVEL**, estando apto a retornar à circulação após a execução dos devidos reparos e consequente aprovação em inspeção de segurança veicular para emissão do Certificado de Segurança Veicular (CSV).`
};
