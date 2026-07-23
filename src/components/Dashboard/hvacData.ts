export interface HVACJanela {
  id: string;
  descricao: string;
  orientacao: "Norte" | "Nordeste" | "Leste" | "Sudeste" | "Sul" | "Sudoeste" | "Oeste" | "Noroeste";
  largura: number;
  altura: number;
  protecao: "Sem Proteção" | "Proteção Interna" | "Proteção Externa";
  tipoVidro: "comum" | "duplo_tijolo";
}

export interface HVACParede {
  id: string;
  descricao: string;
  largura: number;
  altura: number;
  areaJanelas: number; // For subtraction
  orientacao: "Sul" | "Outras" | "Interna";
  construcao: "Leve" | "Pesada";
}

export interface HVACTeto {
  comprimento: number;
  largura: number;
  tipo: "laje_exposta" | "laje_isolada" | "entre_andares" | "telhado_isolado" | "telhado_sem_isolado";
}

export interface HVACPiso {
  comprimento: number;
  largura: number;
  sobreSolo: boolean;
}

export interface HVACPessoas {
  quantidade: number;
  atividade: "normal" | "intensa";
}

export interface HVACEquipamentos {
  incandescenteW: number;
  fluorescenteW: number;
  aparelhosKW: number;
  motoresHP: number;
  computadores: {
    id: string;
    tipo: "led" | "crt" | "desktop_basico" | "desktop_gamer" | "notebook" | "servidor_rack" | "outro";
    quantidade: number;
    wattsUnitario: number;
    descricao: string;
  }[];
}

export interface HVACPortaVao {
  id: string;
  descricao: string;
  largura: number;
  altura: number;
}

export interface HVACProjetoData {
  cliente: string;
  endereco: string;
  cidade: string;
  uf: string;
  ambiente: string;
  comprimento: number;
  largura: number;
  peDireito: number;
  numeroProjeto: string;
  data: string;
  fatorClimaticoManual: number | null;
  normasAdicionais?: string;
}

export interface HVACCompletoState {
  projeto: HVACProjetoData;
  janelas: HVACJanela[];
  paredes: HVACParede[];
  teto: HVACTeto;
  piso: HVACPiso;
  pessoas: HVACPessoas;
  equipamentos: HVACEquipamentos;
  portasVaos: HVACPortaVao[];
}

// Factors Tables
export const FATORES_INSOLACAO: Record<string, Record<string, number>> = {
  Norte: { "Sem Proteção": 1000, "Proteção Interna": 480, "Proteção Externa": 290 },
  Nordeste: { "Sem Proteção": 1000, "Proteção Interna": 400, "Proteção Externa": 290 },
  Leste: { "Sem Proteção": 1130, "Proteção Interna": 550, "Proteção Externa": 360 },
  Sudeste: { "Sem Proteção": 840, "Proteção Interna": 360, "Proteção Externa": 290 },
  Sul: { "Sem Proteção": 0, "Proteção Interna": 0, "Proteção Externa": 0 },
  Sudoeste: { "Sem Proteção": 1680, "Proteção Interna": 670, "Proteção Externa": 480 },
  Oeste: { "Sem Proteção": 2100, "Proteção Interna": 920, "Proteção Externa": 630 },
  Noroeste: { "Sem Proteção": 1500, "Proteção Interna": 630, "Proteção Externa": 400 }
};

export const FATORES_TRANSMISSAO_VIDRO = {
  comum: 210,
  duplo_tijolo: 105
};

export const FATORES_PAREDE = {
  Sul: { Leve: 55, Pesada: 42 },
  Outras: { Leve: 84, Pesada: 50 },
  Interna: { Leve: 33, Pesada: 33 }
};

export const FATORES_TETO = {
  laje_exposta: 315,
  laje_isolada: 125,
  entre_andares: 52,
  telhado_isolado: 72,
  telhado_sem_isolado: 160
};

export const FATOR_PISO_PILOTIS = 52;
export const FATOR_PISO_SOLO = 0;

export const FATORES_PESSOAS = {
  normal: 630,
  intensa: 1000
};

export const FATORES_PORTA_VAO = 630;

export interface CidadeClimatico {
  cidade: string;
  uf: string;
  fator: number;
}

export const CIDADES_REFERENCIA: CidadeClimatico[] = [
  { cidade: "Recife", uf: "PE", fator: 1.15 },
  { cidade: "Paulista", uf: "PE", fator: 1.15 },
  { cidade: "Olinda", uf: "PE", fator: 1.15 },
  { cidade: "Jaboatão dos Guararapes", uf: "PE", fator: 1.15 },
  { cidade: "Caruaru", uf: "PE", fator: 1.10 },
  { cidade: "Petrolina", uf: "PE", fator: 1.20 },
  { cidade: "São Paulo", uf: "SP", fator: 1.00 },
  { cidade: "Rio de Janeiro", uf: "RJ", fator: 1.10 },
  { cidade: "Salvador", uf: "BA", fator: 1.15 },
  { cidade: "Fortaleza", uf: "CE", fator: 1.15 },
  { cidade: "Belém", uf: "PA", fator: 1.20 },
  { cidade: "Manaus", uf: "AM", fator: 1.20 },
  { cidade: "Curitiba", uf: "PR", fator: 1.00 },
  { cidade: "Porto Alegre", uf: "RS", fator: 1.00 },
  { cidade: "Brasília", uf: "DF", fator: 1.10 },
  { cidade: "Belo Horizonte", uf: "MG", fator: 1.00 },
  { cidade: "Goiânia", uf: "GO", fator: 1.10 },
  { cidade: "Cuiabá", uf: "MT", fator: 1.20 },
  { cidade: "Teresina", uf: "PI", fator: 1.20 },
  { cidade: "Aracaju", uf: "SE", fator: 1.15 },
  { cidade: "João Pessoa", uf: "PB", fator: 1.15 },
  { cidade: "Natal", uf: "RN", fator: 1.15 },
  { cidade: "Maceió", uf: "AL", fator: 1.15 },
  { cidade: "São Luís", uf: "MA", fator: 1.20 },
  { cidade: "Palmas", uf: "TO", fator: 1.20 },
  { cidade: "Porto Velho", uf: "RO", fator: 1.20 },
  { cidade: "Rio Branco", uf: "AC", fator: 1.20 },
  { cidade: "Macapá", uf: "AP", fator: 1.20 },
  { cidade: "Boa Vista", uf: "RR", fator: 1.20 },
  { cidade: "Florianópolis", uf: "SC", fator: 1.00 },
  { cidade: "Vitória", uf: "ES", fator: 1.10 }
];

export const TIPO_COMPUTADOR_PADRAO = [
  { tipo: "led", wattsUnitario: 25, descricao: "Monitor LED/LCD" },
  { tipo: "crt", wattsUnitario: 150, descricao: "Monitor CRT antigo" },
  { tipo: "desktop_basico", wattsUnitario: 200, descricao: "Computador Desktop Comum" },
  { tipo: "desktop_gamer", wattsUnitario: 400, descricao: "Computador High-End / Gamer" },
  { tipo: "notebook", wattsUnitario: 65, descricao: "Notebook" },
  { tipo: "servidor_rack", wattsUnitario: 500, descricao: "Servidor em Rack" }
];

export const INITIAL_HVAC_DATA: HVACCompletoState = {
  projeto: {
    cliente: "Clínica Médica Bem Estar Ltda",
    endereco: "Av. Governador Agamenon Magalhães, 2500 - Derby",
    cidade: "Recife",
    uf: "PE",
    ambiente: "Sala de Espera e Recepção Principal",
    comprimento: 7.5,
    largura: 6.0,
    peDireito: 3.0,
    numeroProjeto: "PHVAC-087/2026",
    data: "2026-07-05",
    fatorClimaticoManual: null,
    normasAdicionais: "ABNT NBR 16401-1, ABNT NBR 16401-2, ASHRAE Standard 55"
  },
  janelas: [
    {
      id: "j_1",
      descricao: "Janela Frontal Direita",
      orientacao: "Leste",
      largura: 2.5,
      altura: 1.8,
      protecao: "Proteção Interna",
      tipoVidro: "comum"
    },
    {
      id: "j_2",
      descricao: "Janela Lateral",
      orientacao: "Norte",
      largura: 1.5,
      altura: 1.8,
      protecao: "Sem Proteção",
      tipoVidro: "comum"
    }
  ],
  paredes: [
    {
      id: "p_1",
      descricao: "Parede Leste (Fachada Principal)",
      largura: 6.0,
      altura: 3.0,
      areaJanelas: 4.5, // Janela Frontal Direita area
      orientacao: "Outras",
      construcao: "Leve"
    },
    {
      id: "p_2",
      descricao: "Parede Norte (Lateral)",
      largura: 7.5,
      altura: 3.0,
      areaJanelas: 2.7, // Janela Lateral area
      orientacao: "Outras",
      construcao: "Leve"
    },
    {
      id: "p_3",
      descricao: "Parede Sul (Divisória)",
      largura: 6.0,
      altura: 3.0,
      areaJanelas: 0,
      orientacao: "Sul",
      construcao: "Pesada"
    },
    {
      id: "p_4",
      descricao: "Parede Oeste (Divisória Corredor)",
      largura: 7.5,
      altura: 3.0,
      areaJanelas: 0,
      orientacao: "Interna",
      construcao: "Leve"
    }
  ],
  teto: {
    comprimento: 7.5,
    largura: 6.0,
    tipo: "laje_exposta"
  },
  piso: {
    comprimento: 7.5,
    largura: 6.0,
    sobreSolo: false // Está sobre subsolo/garagem
  },
  pessoas: {
    quantidade: 12,
    atividade: "normal"
  },
  equipamentos: {
    incandescenteW: 0,
    fluorescenteW: 240, // 8 lâmpadas de 30W
    aparelhosKW: 1.2, // Cafeteira + Bebedouro + TV
    motoresHP: 0,
    computadores: [
      {
        id: "c_1",
        tipo: "desktop_basico",
        quantidade: 2,
        wattsUnitario: 200,
        descricao: "Desktops da recepção"
      },
      {
        id: "c_2",
        tipo: "notebook",
        quantidade: 1,
        wattsUnitario: 65,
        descricao: "Notebook triagem"
      }
    ]
  },
  portasVaos: [
    {
      id: "v_1",
      descricao: "Vão de Acesso Principal (Sem Porta)",
      largura: 1.2,
      altura: 2.1
    }
  ]
};

// Calculations Helper Function
export function calcularCargaTermica(state: HVACCompletoState) {
  // 1. TIPO I — Janelas (Insolação)
  let subtotalTipoI = 0;
  const listTipoI = state.janelas.map(j => {
    const area = j.largura * j.altura;
    const fator = FATORES_INSOLACAO[j.orientacao]?.[j.protecao] || 0;
    const btu = area * fator;
    subtotalTipoI += btu;
    return {
      ...j,
      area,
      fator,
      btu
    };
  });

  // 2. TIPO II — Janelas (Transmissão)
  let subtotalTipoII = 0;
  const listTipoII = state.janelas.map(j => {
    const area = j.largura * j.altura;
    const fator = FATORES_TRANSMISSAO_VIDRO[j.tipoVidro] || 0;
    const btu = area * fator;
    subtotalTipoII += btu;
    return {
      id: j.id,
      descricao: j.descricao,
      area,
      tipoVidro: j.tipoVidro,
      fator,
      btu
    };
  });

  // 3. TIPO III — Paredes
  let subtotalTipoIII = 0;
  const listTipoIII = state.paredes.map(p => {
    const areaTotal = p.largura * p.altura;
    const areaLiquida = Math.max(0, areaTotal - p.areaJanelas);
    const fator = FATORES_PAREDE[p.orientacao]?.[p.construcao] || 0;
    const btu = areaLiquida * fator;
    subtotalTipoIII += btu;
    return {
      ...p,
      areaTotal,
      areaLiquida,
      fator,
      btu
    };
  });

  // 4. TIPO IV — Teto
  const areaTeto = state.teto.comprimento * state.teto.largura;
  const fatorTeto = FATORES_TETO[state.teto.tipo] || 0;
  const btuTeto = areaTeto * fatorTeto;

  // 5. TIPO V — Piso
  const areaPiso = state.piso.comprimento * state.piso.largura;
  const fatorPiso = state.piso.sobreSolo ? FATOR_PISO_SOLO : FATOR_PISO_PILOTIS;
  const btuPiso = areaPiso * fatorPiso;

  // 6. TIPO VI — Pessoas
  const fatorPessoas = FATORES_PESSOAS[state.pessoas.atividade] || 0;
  const btuPessoas = state.pessoas.quantidade * fatorPessoas;

  // 7. TIPO VII — Iluminação e Aparelhos
  const btuIncandescente = state.equipamentos.incandescenteW * 4;
  const btuFluorescente = state.equipamentos.fluorescenteW * 2;
  const btuAparelhos = state.equipamentos.aparelhosKW * 860;
  const btuMotores = state.equipamentos.motoresHP * 645;
  
  let btuComputadores = 0;
  const listComputadoresCalculated = state.equipamentos.computadores.map(c => {
    const btuComp = c.quantidade * c.wattsUnitario * 3.412;
    btuComputadores += btuComp;
    return {
      ...c,
      btu: btuComp
    };
  });

  const btuTipoVII = btuIncandescente + btuFluorescente + btuAparelhos + btuMotores + btuComputadores;

  // 8. TIPO VIII — Portas e Vãos
  let subtotalTipoVIII = 0;
  const listTipoVIII = state.portasVaos.map(v => {
    const area = v.largura * v.altura;
    const btu = area * FATORES_PORTA_VAO;
    subtotalTipoVIII += btu;
    return {
      ...v,
      area,
      fator: FATORES_PORTA_VAO,
      btu
    };
  });

  // Subtotal
  const subtotalGeral = 
    subtotalTipoI + 
    subtotalTipoII + 
    subtotalTipoIII + 
    btuTeto + 
    btuPiso + 
    btuPessoas + 
    btuTipoVII + 
    subtotalTipoVIII;

  // Climate Factor
  let fatorClimatico = 1.15; // Paulista/Recife Default
  if (state.projeto.fatorClimaticoManual !== null) {
    fatorClimatico = state.projeto.fatorClimaticoManual;
  } else {
    const cidadeEncontrada = CIDADES_REFERENCIA.find(
      c => c.cidade.toLowerCase().trim() === state.projeto.cidade.toLowerCase().trim()
    );
    if (cidadeEncontrada) {
      fatorClimatico = cidadeEncontrada.fator;
    }
  }

  const cargaTotalFinal = subtotalGeral * fatorClimatico;

  return {
    listTipoI,
    subtotalTipoI,
    listTipoII,
    subtotalTipoII,
    listTipoIII,
    subtotalTipoIII,
    areaTeto,
    fatorTeto,
    btuTeto,
    areaPiso,
    fatorPiso,
    btuPiso,
    fatorPessoas,
    btuPessoas,
    btuIncandescente,
    btuFluorescente,
    btuAparelhos,
    btuMotores,
    listComputadoresCalculated,
    btuComputadores,
    btuTipoVII,
    listTipoVIII,
    subtotalTipoVIII,
    subtotalGeral,
    fatorClimatico,
    cargaTotalFinal
  };
}
