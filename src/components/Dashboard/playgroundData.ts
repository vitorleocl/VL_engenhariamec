export interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

export interface PlaygroundChecklistItem {
  id: string;
  item: string;
  status: "OK" | "NOK" | "N/A";
  local: string;
  nota: string;
}

export interface EquipmentClassification {
  id: string;
  name: string;
  estado: string;
  condicao: "VERDE" | "AMARELO" | "LARANJA" | "VERMELHO";
  acaoRecomendada: string;
}

export interface PlaygroundNaoConformidade {
  id: string;
  equipamento: string;
  problema: string;
  norma: string;
  recomendacao: string;
  prioridade: "IMEDIATO" | "CURTO PRAZO" | "MÉDIO PRAZO" | "LONGO PRAZO";
  responsavel: string;
  prazo: string;
}

export interface PlaygroundPerigo {
  id: string;
  equipamento: string;
  perigo: string;
  risco: string;
  gravidade: "ALTA" | "MÉDIA" | "BAIXA";
}

export const DEFAULT_PLAYGROUND_CHECKLIST: PlaygroundChecklistItem[] = [
  {
    id: "item_1",
    item: "Ausência de aberturas entre 89 mm e 230 mm (Risco de aprisionamento de cabeça/pescoço)",
    status: "OK",
    local: "Geral",
    nota: "As barreiras de proteção e vãos de acesso devem impedir a entrada da cabeça da criança se o corpo passar."
  },
  {
    id: "item_2",
    item: "Ausência de pontas, bordas afiadas e rebarbas",
    status: "OK",
    local: "Geral",
    nota: "Cantos de chapa e madeira arredondados para evitar lacerações mecânicas em quedas e contatos."
  },
  {
    id: "item_3",
    item: "Ausência de parafusos protuberantes",
    status: "OK",
    local: "Geral",
    nota: "Parafusos passantes com porcas cegas ou embutidas em nichos protetores plásticos planos."
  },
  {
    id: "item_4",
    item: "Ausência de cordas com laços ou comprimento livre > 560mm",
    status: "OK",
    local: "Geral",
    nota: "Cordas de escalada fixadas em ambas as pontas para coibir estrangulamento acidental."
  },
  {
    id: "item_5",
    item: "Piso amortecedor com espessura adequada",
    status: "OK",
    local: "Piso",
    nota: "Espessura de camada de absorção de impacto coerente com a altura crítica de queda calculada."
  },
  {
    id: "item_6",
    item: "Piso amortecedor cobrindo toda a Área de Queda Crítica (AQC)",
    status: "OK",
    local: "Piso",
    nota: "Extensão da cobertura do piso de impacto deve ser de no mínimo 1,5m em torno de estruturas estacionárias."
  },
  {
    id: "item_7",
    item: "Distância mínima de 2,0 m entre equipamentos",
    status: "OK",
    local: "Espaçamento",
    nota: "As zonas de queda e movimentação dinâmica não podem se interceptar para mitigar riscos de colisão."
  },
  {
    id: "item_8",
    item: "Sinalização de faixa etária em todos os equipamentos",
    status: "OK",
    local: "Sinalização",
    nota: "Identificação legível indicando idade recomendada e capacidade máxima nominal."
  },
  {
    id: "item_9",
    item: "Estrutura sem corrosão que comprometa a integridade",
    status: "OK",
    local: "Metal",
    nota: "Tubulados estruturais de balanços e suportes livres de fadiga galvânica e ferrugem profunda."
  },
  {
    id: "item_10",
    item: "Madeira sem lascas, podridão ou pregos expostos",
    status: "OK",
    local: "Eucalipto / Pinus",
    nota: "Madeira tratada lixada, sem nós abertos, fendas profundas longitudinais ou elementos pontiagudos expostos."
  },
  {
    id: "item_11",
    item: "Plástico sem fraturas com bordas cortantes",
    status: "OK",
    local: "Rotomoldados",
    nota: "Peças plásticas e escorregadores íntegros, sem ressecamento por intempéries ou rachaduras afiadas."
  },
  {
    id: "item_12",
    item: "Parafusos e fixações sem folgas ou ausências",
    status: "OK",
    local: "Conexões",
    nota: "Aperto estrutural mecânico e presença de arruelas de pressão e contra-porcas autotravantes."
  },
  {
    id: "item_13",
    item: "Balanços com correntes ou cabos sem desgaste excessivo",
    status: "OK",
    local: "Balanços",
    nota: "Elos de correntes com desgaste inferior a 10% da espessura original e pontos de pivô lubrificados."
  },
  {
    id: "item_14",
    item: "Escorregador com bordas laterais e saída segura",
    status: "OK",
    local: "Escorregadores",
    nota: "Seção de saída plana e arredondada horizontalmente a uma altura entre 200mm e 350mm do solo."
  },
  {
    id: "item_15",
    item: "Gangorra com amortecedor de impacto sob os assentos",
    status: "OK",
    local: "Gangorras",
    nota: "Borrachas de impacto integradas na parte inferior para amortecer impactos bruscos de descida no solo."
  },
  {
    id: "item_16",
    item: "Cercamento com altura ≥ 1,20 m e portão com fechamento automático",
    status: "OK",
    local: "Cercas",
    nota: "Grade de delimitação externa íntegra que impede a saída intempestiva e entrada de animais vetores."
  },
  {
    id: "item_17",
    item: "Área visível e supervisionável por responsáveis",
    status: "OK",
    local: "Entorno",
    nota: "Linha de visão desimpedida a partir de bancos ou passarelas para facilitação da tutela ativa de adultos."
  },
  {
    id: "item_18",
    item: "Plano de manutenção e inspeção periódica existente",
    status: "OK",
    local: "Operacional",
    nota: "Controle formalizado de inspeções rotineiras registradas pelo condomínio ou empresa."
  }
];

export const PREFILLED_PLAYGROUND_PARAMS = {
  laudoNumber: "LPG-104/2026 Rev. 00",
  clientName: "Condomínio Residencial Bella Vista",
  cnpj: "12.345.678/0001-90",
  address: "Avenida das Palmeiras, nº 1450, Boa Viagem, Recife - PE",
  laudoDate: "04/07/2026",
  city: "Recife",
  targetAgeGroup: "02 a 10 anos",
  totalArea: "120 m²",
  numEquipments: "4",
  materialType: "Misto (Eucalipto Autoclavado, Metal Galvanizado e Plástico Rotomoldado)",
  installYearEst: "2021 (Aprox. 5 anos de uso)",
  floorType: "Grama Sintética sobre camada asfáltica (Espessura de 12mm)",
  fencingStatus: "Presente, altura de 1,10m com portão manual (sem auto-fechamento)",
  lightingStatus: "Inexistente (Falta de projetores de luz voltados para o playground)",
  shadowStatus: "Inexistente (Exposição solar direta nos equipamentos metálicos)",
  maintenanceStatus: "Não informada (Ausência de livro de registros de inspeções diárias)"
};

export const PREFILLED_PLAYGROUND_CHECKLIST: PlaygroundChecklistItem[] = [
  {
    id: "item_1",
    item: "Ausência de aberturas entre 89 mm e 230 mm (Risco de aprisionamento de cabeça/pescoço)",
    status: "NOK",
    local: "Torre do Brinquedo Combinado",
    nota: "Vão vertical entre o assoalho e o corrimão da escada mede exatamente 140 mm, apresentando risco grave de aprisionamento de cabeça de crianças de 2 a 5 anos."
  },
  {
    id: "item_2",
    item: "Ausência de pontas, bordas afiadas e rebarbas",
    status: "NOK",
    local: "Escorregador Metálico",
    nota: "Lateral inferior da chapa de deslizamento em aço inox apresenta rebarba cortante por desgaste mecânico, necessitando lixamento urgente."
  },
  {
    id: "item_3",
    item: "Ausência de parafusos protuberantes",
    status: "NOK",
    local: "Gangorras de Madeira",
    nota: "Parafusos de fixação dos punhos das gangorras estão salientes em mais de 15 mm acima da porca sem ponteira plástica protetora."
  },
  {
    id: "item_4",
    item: "Ausência de cordas com laços ou comprimento livre > 560mm",
    status: "OK",
    local: "Escalada",
    nota: "Cordas de nylon instaladas estão tensionadas e fixas na base de ancoragem de forma segura."
  },
  {
    id: "item_5",
    item: "Piso amortecedor com espessura adequada",
    status: "NOK",
    local: "Área de Queda",
    nota: "O piso atual é composto por grama sintética de 12mm sobre concreto. Não possui amortecimento de borracha ou areia. A altura crítica do escorregador é de 1,60 m, o que exige piso com capacidade de impacto homologada pela NBR 16071-4."
  },
  {
    id: "item_6",
    item: "Piso amortecedor cobrindo toda a Área de Queda Crítica (AQC)",
    status: "NOK",
    local: "Geral",
    nota: "A área revestida com grama sintética estende-se por apenas 1,0 m após as seções de saída dos escorregadores, o regulamentar é de no mínimo 1,5 m de área livre de queda."
  },
  {
    id: "item_7",
    item: "Distância mínima de 2,0 m entre equipamentos",
    status: "OK",
    local: "Espaçamento",
    nota: "Distâncias medidas entre o balanço e a torre combinada atendem ao distanciamento regulamentar de 2,15 metros."
  },
  {
    id: "item_8",
    item: "Sinalização de faixa etária em todos os equipamentos",
    status: "NOK",
    local: "Geral",
    nota: "Ausência de placa de identificação no acesso ao playground com regras de uso, telefone de emergência, faixa etária e responsabilidade de supervisão."
  },
  {
    id: "item_9",
    item: "Estrutura sem corrosão que comprometa a integridade",
    status: "OK",
    local: "Balanços",
    nota: "Pórtico metálico do balanço apresenta pontos superficiais de oxidação, porém sem perda de massa metálica estrutural."
  },
  {
    id: "item_10",
    item: "Madeira sem lascas, podridão ou pregos expostos",
    status: "NOK",
    local: "Pórtico do Balanço de Eucalipto",
    nota: "Eucalipto apresenta fendilhamento longitudinal de 25mm de profundidade na viga superior horizontal, com acúmulo de umidade interna. Risco médio de propagação de trinca estrutural."
  },
  {
    id: "item_11",
    item: "Plástico sem fraturas com bordas cortantes",
    status: "OK",
    local: "Fechamentos",
    nota: "Plásticos rotomoldados da casinha e painéis estão íntegros, sem quebras."
  },
  {
    id: "item_12",
    item: "Parafusos e fixações sem folgas ou ausências",
    status: "NOK",
    local: "Fixação das Sapatas",
    nota: "Falta de porcas de travamento em dois parabolts de fixação do pé de ancoragem da torre de madeira ao solo."
  },
  {
    id: "item_13",
    item: "Balanços com correntes ou cabos sem desgaste excessivo",
    status: "OK",
    local: "Balanço",
    nota: "Correntes galvanizadas de 6mm com desgaste mínimo de elos, ganchos tipo 'S' fechados e seguros."
  },
  {
    id: "item_14",
    item: "Escorregador com bordas laterais e saída segura",
    status: "OK",
    local: "Escorregadores",
    nota: "Borda de proteção lateral de 180mm de altura e seção de saída perfeitamente arredondada."
  },
  {
    id: "item_15",
    item: "Gangorra com amortecedor de impacto sob os assentos",
    status: "NOK",
    local: "Gangorras de Eucalipto",
    nota: "Batentes de borracha (pneus de amortecimento) sob os assentos das gangorras estão rompidos, permitindo impacto direto da madeira com o piso de concreto duro."
  },
  {
    id: "item_16",
    item: "Cercamento com altura ≥ 1,20 m e portão com fechamento automático",
    status: "NOK",
    local: "Cercado Externo",
    nota: "Grade possui altura de 1,10m e o portão não possui mola hidráulica de fechamento automático. Crianças pequenas conseguem acessar a rua interna do condomínio livremente."
  },
  {
    id: "item_17",
    item: "Área visível e supervisionável por responsáveis",
    status: "OK",
    local: "Entorno",
    nota: "Bancos de alvenaria estão posicionados de frente para os brinquedos, garantindo ótima visibilidade de tutela."
  },
  {
    id: "item_18",
    item: "Plano de manutenção e inspeção periódica existente",
    status: "NOK",
    local: "Administração",
    nota: "O condomínio não apresentou nenhum plano formal de inspeções rotineiras, ferindo os requisitos da NBR 16071-7."
  }
];

export const PREFILLED_PLAYGROUND_CLASSIFICATION: EquipmentClassification[] = [
  {
    id: "C-01",
    name: "Brinquedo Combinado Multiplay (Torre, Escorregador, Escalada)",
    estado: "Apresenta aprisionamento no vão da escada e parabolts de fixação soltos na sapata.",
    condicao: "LARANJA",
    acaoRecomendada: "Substituir o vão de acesso para atender o dimensional correto (<89mm) e reapertar fixadores de solo."
  },
  {
    id: "C-02",
    name: "Conjunto de Balanços de Eucalipto (2 Assentos)",
    estado: "Madeira com rachaduras longitudinais profundas na viga de carga e desgaste de selador protetivo.",
    condicao: "AMARELO",
    acaoRecomendada: "Tratamento de vedação de fendas em madeira, aplicação de verniz filtro solar e monitoramento mensal."
  },
  {
    id: "C-03",
    name: "Gangorras de Madeira (2 Unidades)",
    estado: "Ausência absoluta de pneus amortecedores sob os assentos e parafusos de empunhadura expostos.",
    condicao: "VERMELHO",
    acaoRecomendada: "INTERDITAR IMEDIATAMENTE. Instalar amortecedores sob as extremidades e cobrir roscas salientes com capuzes plásticos."
  },
  {
    id: "C-04",
    name: "Piso de Grama Sintética de 12mm sobre concreto",
    estado: "Não possui material de amortecimento. Base de concreto sob grama gera índice G-Max inaceitável em quedas de altura.",
    condicao: "VERMELHO",
    acaoRecomendada: "INTERDITAR PLAYGROUND INTEGRALMENTE até instalação de manta de borracha de alta absorção ou troca para piso emborrachado moldado."
  }
];

export const PREFILLED_PLAYGROUND_PERIGOS: PlaygroundPerigo[] = [
  {
    id: "P-01",
    equipamento: "Multiplay (Escada)",
    perigo: "Abertura de 140 mm entre corrimão e degrau",
    risco: "Aprisionamento de cabeça com risco iminente de asfixia mecânica por suspensão corporal.",
    gravidade: "ALTA"
  },
  {
    id: "P-02",
    equipamento: "Escorregador Metálico",
    perigo: "Rebarba metálica de chapa de aço desgastada",
    risco: "Corte e laceração profunda de tecidos em membros superiores das crianças durante deslizamento.",
    gravidade: "ALTA"
  },
  {
    id: "P-03",
    equipamento: "Piso Geral do Playground",
    perigo: "Base de concreto sem camada de amortecimento elástica sob grama decorativa",
    risco: "Traumatismo cranioencefálico (TCE) grave em quedas das plataformas superiores (h = 1,60 m).",
    gravidade: "ALTA"
  },
  {
    id: "P-04",
    equipamento: "Gangorras de Madeira",
    perigo: "Falta de limitador/amortecedor de fim de curso inferior",
    risco: "Lesão por impacto por esmagamento dos pés sob o assento e choque na coluna vertebral.",
    gravidade: "MÉDIA"
  }
];

export const PREFILLED_PLAYGROUND_NAO_CONFORMIDADES: PlaygroundNaoConformidade[] = [
  {
    id: "NC-01",
    equipamento: "Piso de Recreação",
    problema: "Uso de grama sintética de 12mm colada sobre base rígida de concreto, gerando ausência de atenuação de impactos de queda livre.",
    norma: "ABNT NBR 16071-4 item 4.2 (Ensaios de absorção de impacto / Critério HIC < 1000 e G-Max < 200)",
    recomendacao: "Remover a grama atual ou aplicar manta de borracha expandida de amortecimento com espessura de no mínimo 40mm antes da recolocação da grama sintética, ou substituir por piso emborrachado contínuo drenante.",
    prioridade: "IMEDIATO",
    responsavel: "VL Engenharia / Fornecedor de Pisos Homologado",
    prazo: "10 dias"
  },
  {
    id: "NC-02",
    equipamento: "Escada do Multiplay",
    problema: "Abertura no corrimão de subida com largura de 140 mm, enquadrando-se no intervalo de perigo normatizado (entre 89 mm e 230 mm).",
    norma: "ABNT NBR 16071-1 item 4.2.1.2 (Critérios de aprisionamento de cabeça e pescoço)",
    recomendacao: "Modificar o espaçamento instalando barras intermediárias verticais adicionais de forma que nenhum espaço livre possua largura superior a 89 mm.",
    prioridade: "IMEDIATO",
    responsavel: "Oficina Metalúrgica VL Engenharia",
    prazo: "5 dias"
  },
  {
    id: "NC-03",
    equipamento: "Gangorras de Madeira",
    problema: "Extremidade inferior do assento da gangorra bate direto contra o solo duro sem pneu limitador de percurso.",
    norma: "ABNT NBR 16071-6 item 4.6 (Requisitos adicionais para gangorras - amortecimento inferior)",
    recomendacao: "Instalar pneus de amortecimento de impacto parcialmente enterrados sob cada assento de gangorra para diminuir a aceleração brusca de descida.",
    prioridade: "IMEDIATO",
    responsavel: "Equipe de Montagem de Playgrounds",
    prazo: "3 dias"
  },
  {
    id: "NC-04",
    equipamento: "Cercado e Portão",
    problema: "Grade externa com altura de 1,10m e portão sem mola de fechamento mecânico automático.",
    norma: "ABNT NBR 16071-5 item 4.1 (Acessibilidade, cercamento e contenção lateral)",
    recomendacao: "Adequar a grade para altura mínima de 1,20 m e instalar dobradiça com mola hidráulica ou mola aérea para garantir fechamento automático do portão para fora.",
    prioridade: "CURTO PRAZO",
    responsavel: "Serralheria do Condomínio",
    prazo: "15 dias"
  }
];

export const DEFAULT_PLAYGROUND_SECOES = {
  introducao: `O presente Laudo Técnico visa realizar a vistoria pericial e apreciação detalhada de segurança na área recreativa destinada ao lazer infantil (playground) do contratante. A análise fundamenta-se nos preceitos legais e normativos nacionais vigentes, com ênfase absoluta na prevenção de sinistros envolvendo o público infantil, cuja integridade física exige rigorosa aplicação de engenharia de segurança preventiva.`,
  metodologia: `A metodologia adotada compreendeu a realização de vistoria visual detalhada no local, ensaios dimensionais de aberturas com gabaritos regulamentares (sondas de cabeça e pescoço conforme preconiza a NBR 16071), medição de distâncias livres de segurança entre equipamentos e inspeção mecânica dos componentes de madeira, fixação metálica e plásticos. Não foram realizados ensaios destrutivos estruturais, limitando-se a análise às condições superficiais observáveis e ensaios não destrutivos de funcionamento dinâmico normal dos brinquedos.`,
  equipamentos_analisados: `Os brinquedos inspecionados consistem em:
1. Brinquedo Combinado Multiplay (Torre de Madeira, Rampa de Escorregador Plástico e Escalada em cordas).
2. Conjunto de Balanço de 2 Lugares estruturado em colunas de madeira tratada.
3. Duas Gangorras Simples em madeira sobre base fixa de articulação central.
4. Piso do playground em grama sintética estendida sobre laje rígida de concreto armado.`,
  conclusao_text: `Diante de todas as não conformidades constatadas nesta perícia, classificamos o playground em questão como **REPROVADO** para utilização operacional em seu estado atual. A presença de fatores graves de perigo como o vão de aprisionamento de cabeça na escada do Multiplay e a total ausência de amortecimento crítico no piso (grama sintética colada diretamente sobre laje de concreto duro) geram riscos severos de asfixia mecânica e traumatismo cranioencefálico por queda livre das plataformas elevadas. Recomenda-se a INTERDIÇÃO INTEGRAL IMEDIATA do espaço recreativo, com isolamento físico por fitas zebradas e barreiras, até que o Plano de Ação seja executado de forma auditada pela VL Engenharia.`
};
