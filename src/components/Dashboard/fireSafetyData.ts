export interface PPCIChecklistItem {
  id: string;
  categoria: string;
  item: string;
  possui: 'SIM' | 'NAO' | 'NAO_APLICAVEL';
  dimensao?: string;
  normaRef: string;
  observacao: string;
}

export interface AVCBChecklistItem {
  id: string;
  item: string;
  status: 'CONFORME' | 'NAO_CONFORME' | 'NAO_APLICAVEL';
  normaRef: string;
  observacao: string;
  risco?: 'BAIXO' | 'MEDIO' | 'GRAVE' | 'CRITICO';
  acaoCorretiva?: string;
  prazoDias?: number | string;
}

export interface FireSafetyImage {
  id: string;
  url: string;
  title: string;
  itemId?: string;
  obs?: string;
}

export const DEFAULT_PPCI_CHECKLIST: PPCIChecklistItem[] = [
  // 1. DADOS DA EDIFICAÇÃO
  { id: 'ppci_1_nome', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Nome da edificação / Razão Social', possui: 'SIM', dimensao: 'Condomínio Comercial Plaza Tower', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Identificação conferida no local' },
  { id: 'ppci_1_proprietario', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Proprietário / Responsável Legal', possui: 'SIM', dimensao: 'Administração Plaza Tower', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Acompanhado pelo Síndico' },
  { id: 'ppci_1_cnpj_cpf', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'CNPJ ou CPF do proprietário/responsável', possui: 'SIM', dimensao: '12.345.678/0001-99', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Documento ativo e verificado' },
  { id: 'ppci_1_endereco', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Endereço completo da edificação', possui: 'SIM', dimensao: 'Av. Agamenon Magalhães, 4500 - Recife/PE', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Endereço oficial do imóvel' },
  { id: 'ppci_1_coordenadas', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Coordenadas geográficas (GPS / Lat, Long)', possui: 'SIM', dimensao: '-8.0475, -34.8920', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Obtidas por GPS de alta precisão' },
  { id: 'ppci_1_resp_acompanhamento', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Responsável pelo acompanhamento no local', possui: 'SIM', dimensao: 'Sr. Carlos Andrade (Zelador)', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Acompanhou toda a vistoria' },
  { id: 'ppci_1_telefone', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'Telefone de contato do acompanhante', possui: 'SIM', dimensao: '(81) 99887-6655', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'Contato direto do responsável' },
  { id: 'ppci_1_email', categoria: '1. DADOS DA EDIFICAÇÃO', item: 'E-mail de contato', possui: 'SIM', dimensao: 'contato@plazatower.com.br', normaRef: 'IT / NBR do Corpo de Bombeiros', observacao: 'E-mail cadastrado' },

  // 2. DOCUMENTAÇÃO EXISTENTE
  { id: 'ppci_2_planta_arq', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Planta arquitetônica atualizada disponível', possui: 'SIM', dimensao: 'Formatos A1 / DWG', normaRef: 'NBR 6492 / IT CB', observacao: 'Disponibilizada pela administração' },
  { id: 'ppci_2_planta_est', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Planta estrutural disponível', possui: 'SIM', dimensao: 'Projeto em concreto armado', normaRef: 'NBR 6118 / IT CB', observacao: 'Verificada para cargas' },
  { id: 'ppci_2_proj_eletrico', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Projeto elétrico disponível', possui: 'SIM', dimensao: 'Diagrama unifilar atualizado', normaRef: 'NBR 5410 / IT CB', observacao: 'Apresentado na vistoria' },
  { id: 'ppci_2_proj_hidro', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Projeto hidrossanitário disponível', possui: 'SIM', dimensao: 'Prumadas de água e esgoto', normaRef: 'NBR 5626 / IT CB', observacao: 'Verificado' },
  { id: 'ppci_2_proj_gas', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Projeto de gás (GLP/GN) disponível', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 13523 / IT CB', observacao: 'Edificação sem central de gás encanado' },
  { id: 'ppci_2_memorial', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Memorial descritivo da edificação disponível', possui: 'SIM', dimensao: 'Memorial da construção', normaRef: 'IT CB', observacao: 'Disponível' },
  { id: 'ppci_2_art_rrt', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'ART/RRT de projetos e execuções anteriores', possui: 'SIM', dimensao: 'ART PE2026098124', normaRef: 'CREA/CAU', observacao: 'Apresentada' },
  { id: 'ppci_2_avcb_clcb_anterior', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'AVCB ou CLCB anterior existente', possui: 'SIM', dimensao: 'AVCB nº 4812/2023 (vencido)', normaRef: 'IT CB', observacao: 'Em processo de renovação' },
  { id: 'ppci_2_habite_se', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Habite-se / Carta de aceite da prefeitura', possui: 'SIM', dimensao: 'Habite-se nº 2018/041', normaRef: 'Código de Obras', observacao: 'Regular' },
  { id: 'ppci_2_licenca_func', categoria: '2. DOCUMENTAÇÃO EXISTENTE', item: 'Licença/Alvará de funcionamento municipal', possui: 'SIM', dimensao: 'Alvará 2026 vigente', normaRef: 'Legislação Municipal', observacao: 'Em dia' },

  // 3. CLASSIFICAÇÃO DA EDIFICAÇÃO
  { id: 'ppci_3_grupo_divisao', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Grupo e divisão da ocupação (ex: C-2, I-2, E-1)', possui: 'SIM', dimensao: 'Grupo C (Divisão C-2)', normaRef: 'Tabela 1 IT CB', observacao: 'Serviços de escritórios e negócios' },
  { id: 'ppci_3_carga_incendio', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Carga de incêndio estimada (MJ/m²)', possui: 'SIM', dimensao: '300 MJ/m²', normaRef: 'NBR 14432 / IT CB', observacao: 'Risco Médio' },
  { id: 'ppci_3_grau_risco', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Grau de risco (Baixo, Médio, Alto)', possui: 'SIM', dimensao: 'Grau de Risco Médio', normaRef: 'IT CB', observacao: 'Classificação oficial' },
  { id: 'ppci_3_area_construida', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Área construída total (m²)', possui: 'SIM', dimensao: '1.450 m²', normaRef: 'IT CB', observacao: 'Mapeada em projeto' },
  { id: 'ppci_3_area_pavimento', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Área média por pavimento (m²)', possui: 'SIM', dimensao: '362,5 m²', normaRef: 'IT CB', observacao: 'Área tipo dos andares' },
  { id: 'ppci_3_altura', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Altura da edificação (m)', possui: 'SIM', dimensao: '12,80 m', normaRef: 'IT CB', observacao: 'Do piso de saída ao último piso habitável' },
  { id: 'ppci_3_num_pavimentos', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Número total de pavimentos', possui: 'SIM', dimensao: '4 pavimentos (Térreo + 3)', normaRef: 'IT CB', observacao: 'Edificação de médio porte' },
  { id: 'ppci_3_tipo_estrutura', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Tipo de estrutura', possui: 'SIM', dimensao: 'Concreto Armado', normaRef: 'NBR 6118', observacao: 'Estrutura convencional' },
  { id: 'ppci_3_trrf', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Tempo Requerido de Resistência ao Fogo (TRRF em min)', possui: 'SIM', dimensao: 'TRRF = 60 min', normaRef: 'NBR 14432 / IT CB', observacao: 'Conforme tabela regulamentar' },
  { id: 'ppci_3_compartimentacoes', categoria: '3. CLASSIFICAÇÃO DA EDIFICAÇÃO', item: 'Compartimentação horizontal e vertical existente', possui: 'SIM', dimensao: 'Lajes e paredes divisórias', normaRef: 'IT CB', observacao: 'Sem aberturas desprotegidas' },

  // 4. POPULAÇÃO
  { id: 'ppci_4_funcionarios', categoria: '4. POPULAÇÃO', item: 'Quantidade de funcionários fixos', possui: 'SIM', dimensao: '45 funcionários fixos', normaRef: 'IT CB', observacao: 'Contagem operacional' },
  { id: 'ppci_4_publico', categoria: '4. POPULAÇÃO', item: 'Público flutuante estimado', possui: 'SIM', dimensao: '135 pessoas pico', normaRef: 'IT CB', observacao: 'Pico em horário comercial' },
  { id: 'ppci_4_visitantes', categoria: '4. POPULAÇÃO', item: 'Média de visitantes diários', possui: 'SIM', dimensao: '80 visitantes/dia', normaRef: 'IT CB', observacao: 'Controle na portaria' },
  { id: 'ppci_4_turnos', categoria: '4. POPULAÇÃO', item: 'Turnos de trabalho e horários de pico', possui: 'SIM', dimensao: 'Comercial (08h às 18h)', normaRef: 'IT CB', observacao: 'Sem expediente noturno' },
  { id: 'ppci_4_lotacao_maxima', categoria: '4. POPULAÇÃO', item: 'Lotação máxima simultânea calculada', possui: 'SIM', dimensao: '180 pessoas simultâneas', normaRef: 'NBR 9077 / IT CB', observacao: 'Utilizada no dimensionamento de saídas' },
  { id: 'ppci_4_pcd', categoria: '4. POPULAÇÃO', item: 'Presença e circulação de PCD / mobilidade reduzida', possui: 'SIM', dimensao: 'Rampa e elevador acessível', normaRef: 'NBR 9050', observacao: 'Acessibilidade garantida no térreo e andares' },

  // 5. LEVANTAMENTO ARQUITETÔNICO
  { id: 'ppci_5_pe_direito', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Pé-direito médio e pontos críticos', possui: 'SIM', dimensao: '2,80 m livre', normaRef: 'NBR 9077', observacao: 'Adequado para sinalização' },
  { id: 'ppci_5_escadas', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Tipos de escadas existentes', possui: 'SIM', dimensao: '1 Escada Enclausurada Protegida', normaRef: 'NBR 9077 / IT CB', observacao: 'Com porta corta-fogo' },
  { id: 'ppci_5_elevadores', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Elevadores comuns e elevador de emergência', possui: 'SIM', dimensao: '1 Elevador Social (8 pessoas)', normaRef: 'NBR NM 207', observacao: 'Chave de retorno no térreo em teste' },
  { id: 'ppci_5_rampas', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Rampas de acesso e emergência', possui: 'SIM', dimensao: '1 Rampa no acesso principal (8.33%)', normaRef: 'NBR 9050', observacao: 'Com corrimão duplo' },
  { id: 'ppci_5_corredores', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Largura e desobstrução dos corredores principais', possui: 'SIM', dimensao: 'Largura útil 1,40 m', normaRef: 'NBR 9077', observacao: 'Totalmente desobstruídos' },
  { id: 'ppci_5_mezaninos', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Mezaninos existentes e percentual de área', possui: 'NAO', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Sem mezaninos' },
  { id: 'ppci_5_shafts', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Shafts técnicos e selagem corta-fogo nos entrepisos', possui: 'SIM', dimensao: 'Shafts elétricos e hidráulicos', normaRef: 'IT CB', observacao: 'Selados nas passagens de pavimento' },
  { id: 'ppci_5_atrios', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Átrios e vãos centrais integrados', possui: 'NAO', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Sem átrios abertos' },
  { id: 'ppci_5_cobertura', categoria: '5. LEVANTAMENTO ARQUITETÔNICO', item: 'Tipo e material da cobertura', possui: 'SIM', dimensao: 'Laje impermeabilizada + Telha termoacústica', normaRef: 'NBR 15575', observacao: 'Bom estado' },

  // 6. ACESSOS
  { id: 'ppci_6_via_publica', categoria: '6. ACESSOS', item: 'Acesso adequado a partir da via pública', possui: 'SIM', dimensao: 'Avenida de 4 faixas', normaRef: 'IT CB', observacao: 'Acesso desimpedido' },
  { id: 'ppci_6_entrada_viaturas', categoria: '6. ACESSOS', item: 'Portão e via para entrada de viaturas do Corpo de Bombeiros', possui: 'SIM', dimensao: 'Portão de 4,50 m largura x 4,20 m altura', normaRef: 'IT CB', observacao: 'Dimensionado para autobomba' },
  { id: 'ppci_6_area_manobra', categoria: '6. ACESSOS', item: 'Área de manobra e estacionamento de viaturas de emergência', possui: 'SIM', dimensao: 'Recuo frontal de 12m', normaRef: 'IT CB', observacao: 'Permite estacionar viatura grande' },
  { id: 'ppci_6_hidrante_publico', categoria: '6. ACESSOS', item: 'Presença de hidrante público na via num raio de 100m', possui: 'SIM', dimensao: 'Hidrante de coluna a 45m', normaRef: 'IT CB', observacao: 'Operacional e sinalizado' },
  { id: 'ppci_6_distancias_acesso', categoria: '6. ACESSOS', item: 'Distâncias entre acessos e edificações vizinhas', possui: 'SIM', dimensao: 'Afastamento lateral de 3m', normaRef: 'IT CB', observacao: 'Conforme código urbano' },

  // 7. ABASTECIMENTO DE ÁGUA
  { id: 'ppci_7_res_superior', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Reservatório superior de água (RTI)', possui: 'SIM', dimensao: '15.000 Litros de RTI exclusiva', normaRef: 'NBR 13714 / IT CB', observacao: 'Castelo d\'água em concreto' },
  { id: 'ppci_7_res_inferior', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Reservatório inferior de água (RTI)', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 13714', observacao: 'RTI concentrada no reservatório superior' },
  { id: 'ppci_7_cisterna', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Cisterna exclusiva ou compartilhada', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 13714', observacao: 'Apenas reservatório superior' },
  { id: 'ppci_7_volume_rti', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Volume útil da Reserva Técnica de Incêndio (m³)', possui: 'SIM', dimensao: '15 m³ (15.000 Litros)', normaRef: 'NBR 13714', observacao: 'Suficiente para 60 min de autonomia' },
  { id: 'ppci_7_rede_publica', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Abastecimento direto da rede pública', possui: 'SIM', dimensao: 'Conexão da concessionária local', normaRef: 'NBR 5626', observacao: 'Alimenta o reservatório superior' },
  { id: 'ppci_7_casa_bombas', categoria: '7. ABASTECIMENTO DE ÁGUA', item: 'Casa de bombas de incêndio (localização e acesso)', possui: 'SIM', dimensao: 'Barrilete do reservatório superior', normaRef: 'NBR 13714', observacao: 'Acesso restrito e protegido' },

  // 8. SISTEMA DE HIDRANTES
  { id: 'ppci_8_quantidade', categoria: '8. SISTEMA DE HIDRANTES', item: 'Quantidade total de pontos de hidrantes/mangotinhos', possui: 'SIM', dimensao: '2 abrigos duplos', normaRef: 'NBR 13714 / IT CB', observacao: '1 por pavimento técnico' },
  { id: 'ppci_8_tipo', categoria: '8. SISTEMA DE HIDRANTES', item: 'Tipo de sistema de hidrantes', possui: 'SIM', dimensao: 'Sistema de Hidrante de 1 ½” (40mm)', normaRef: 'NBR 13714', observacao: 'Mangueiras de 30m e esguicho regulável' },
  { id: 'ppci_8_mangotinhos', categoria: '8. SISTEMA DE HIDRANTES', item: 'Mangueiras/mangotinhos com esguichos e chaves conexas', possui: 'SIM', dimensao: 'Mangueira Tipo 2 (40mm x 15m - 2 lances)', normaRef: 'NBR 11861', observacao: 'Abrigo nº 02 necessita reposição da chave Storz' },
  { id: 'ppci_8_abrigos', categoria: '8. SISTEMA DE HIDRANTES', item: 'Abrigos de hidrante sinalizados e desobstruídos', possui: 'SIM', dimensao: 'Dimensionados 90x60x30 cm', normaRef: 'NBR 13714', observacao: 'Vermelhos com visor de vidro' },
  { id: 'ppci_8_bombas', categoria: '8. SISTEMA DE HIDRANTES', item: 'Conjunto motobomba (Principal + Jockey) em funcionamento', possui: 'SIM', dimensao: 'Bomba de 5 CV trifásica', normaRef: 'NBR 13714', observacao: 'Acionamento por pressostato' },
  { id: 'ppci_8_tubulacoes', categoria: '8. SISTEMA DE HIDRANTES', item: 'Tubulações e conexões em aço/ferro fundido em vermelho', possui: 'SIM', dimensao: 'Tubulação Aço Galv. 2 ½”', normaRef: 'NBR 5580', observacao: 'Pintura vermelha norma NBR 6493' },
  { id: 'ppci_8_recalque', categoria: '8. SISTEMA DE HIDRANTES', item: 'Registro de recalque na fachada/passeio desobstruído', possui: 'SIM', dimensao: 'Caixa de recalque de passeio 40x40 cm', normaRef: 'NBR 13714', observacao: 'Com adaptador Storz e tampão cego' },

  // 9. EXTINTORES
  { id: 'ppci_9_tipo', categoria: '9. EXTINTORES', item: 'Tipos de extintores instalados', possui: 'SIM', dimensao: 'PQS ABC 6kg e CO2 6kg', normaRef: 'NBR 12693 / IT CB', observacao: '6 unidades instaladas' },
  { id: 'ppci_9_capacidade', categoria: '9. EXTINTORES', item: 'Capacidade extintora adequada para cada risco', possui: 'SIM', dimensao: '2-A:20-B:C (PQS) e 5-B:C (CO2)', normaRef: 'NBR 12693', observacao: 'Protege classe A, B e C' },
  { id: 'ppci_9_classe', categoria: '9. EXTINTORES', item: 'Adequação da classe do extintor ao risco do ambiente', possui: 'SIM', dimensao: 'ABC nos corredores / CO2 nos quadros elétricos', normaRef: 'NBR 12693', observacao: 'Corretamente distribuídos' },
  { id: 'ppci_9_distancia_maxima', categoria: '9. EXTINTORES', item: 'Distância máxima de caminhada respeitada (20m)', possui: 'SIM', dimensao: 'Máximo 15m percorridos', normaRef: 'NBR 12693', observacao: 'Raio de ação 100% coberto' },
  { id: 'ppci_9_estado_conservacao', categoria: '9. EXTINTORES', item: 'Estado de conservação, manômetro, selo INMETRO e lacre', possui: 'SIM', dimensao: 'Validade até Maio/2027', normaRef: 'NBR 12693', observacao: 'Manômetros na faixa verde' },

  // 10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)
  { id: 'ppci_10_existencia', categoria: '10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)', item: 'Existência/Exigência de sistema de Sprinklers', possui: 'NAO_APLICAVEL', dimensao: 'Isento para a ocupação', normaRef: 'NBR 10897 / IT CB', observacao: 'Área < 750m² por pavimento e altura < 12m' },
  { id: 'ppci_10_tipo', categoria: '10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)', item: 'Tipo de sistema de sprinklers', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'NBR 10897', observacao: 'Não aplicável' },
  { id: 'ppci_10_area_protegida', categoria: '10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)', item: 'Área total e setores protegidos por sprinklers', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'NBR 10897', observacao: 'Não aplicável' },
  { id: 'ppci_10_bombas', categoria: '10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)', item: 'Bombas dedicadas e Válvulas de Governo e Alarme (VGA)', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'NBR 10897', observacao: 'Não aplicável' },
  { id: 'ppci_10_reservatorio', categoria: '10. SPRINKLERS (CHUVEIROS AUTOMÁTICOS)', item: 'Reservatório de água exclusivo para sprinklers', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'NBR 10897', observacao: 'Não aplicável' },

  // 11. DETECÇÃO E ALARME
  { id: 'ppci_11_central', categoria: '11. DETECÇÃO E ALARME', item: 'Central de alarme de incêndio em local supervisionado', possui: 'SIM', dimensao: 'Central Convencional 8 laços', normaRef: 'NBR 17240 / IT CB', observacao: 'Localizada na portaria/guarita 24h' },
  { id: 'ppci_11_detectores', categoria: '11. DETECÇÃO E ALARME', item: 'Detectores automáticos de fumaça, calor ou chama', possui: 'SIM', dimensao: '8 detectores de fumaça ópticos', normaRef: 'NBR 17240', observacao: 'Instalados nos halls de circulação' },
  { id: 'ppci_11_acionadores', categoria: '11. DETECÇÃO E ALARME', item: 'Acionadores manuais tipo quebre-o-vidro ou réarme', possui: 'SIM', dimensao: '4 acionadores rearmáveis', normaRef: 'NBR 17240', observacao: '1 por pavimento junto aos hidrantes' },
  { id: 'ppci_11_sirenes', categoria: '11. DETECÇÃO E ALARME', item: 'Sirenes de alarme audíveis em todos os ambientes', possui: 'SIM', dimensao: '4 sirenes bivolt 105 dB', normaRef: 'NBR 17240', observacao: 'Testadas com boa audibilidade' },
  { id: 'ppci_11_avisadores_visuais', categoria: '11. DETECÇÃO E ALARME', item: 'Avisadores visuais (strobos) em ambientes ruidosos', possui: 'SIM', dimensao: 'Strobos LED vermelhos', normaRef: 'NBR 17240', observacao: 'Instalados na recepção e garagem' },

  // 12. ILUMINAÇÃO DE EMERGÊNCIA
  { id: 'ppci_12_tipo', categoria: '12. ILUMINAÇÃO DE EMERGÊNCIA', item: 'Tipo de sistema de iluminação de emergência', possui: 'SIM', dimensao: 'Blocos autônomos LED (350 lumens)', normaRef: 'NBR 10898 / IT CB', observacao: '12 pontos distribuídos' },
  { id: 'ppci_12_autonomia', categoria: '12. ILUMINAÇÃO DE EMERGÊNCIA', item: 'Autonomia mínima do sistema (mínimo de 1h ou 2h)', possui: 'SIM', dimensao: '2 horas contínuas', normaRef: 'NBR 10898', observacao: 'Baterias seladas testadas' },
  { id: 'ppci_12_distribuicao', categoria: '12. ILUMINAÇÃO DE EMERGÊNCIA', item: 'Distribuição dos pontos cobrindo rotas e desníveis', possui: 'SIM', dimensao: 'Corredores, escadas e saídas', normaRef: 'NBR 10898', observacao: 'Distanciamento máximo de 15m' },
  { id: 'ppci_12_estado', categoria: '12. ILUMINAÇÃO DE EMERGÊNCIA', item: 'Estado de conservação e teste de acendimento automático', possui: 'SIM', dimensao: '100% operacionais no teste de corte', normaRef: 'NBR 10898', observacao: 'Acendimento automático instantâneo' },

  // 13. SINALIZAÇÃO DE EMERGÊNCIA
  { id: 'ppci_13_saidas', categoria: '13. SINALIZAÇÃO DE EMERGÊNCIA', item: 'Sinalização fotoluminescente indicativa de saídas', possui: 'SIM', dimensao: 'Placas E5 / E7 (20x10 cm)', normaRef: 'NBR 13434 / IT CB', observacao: 'Afixadas acima das portas' },
  { id: 'ppci_13_equipamentos', categoria: '13. SINALIZAÇÃO DE EMERGÊNCIA', item: 'Sinalização fotoluminescente de equipamentos de combate', possui: 'SIM', dimensao: 'Placas E1 (Extintor) e E2 (Hidrante)', normaRef: 'NBR 13434', observacao: 'Sinalizados a 1,80m do piso' },
  { id: 'ppci_13_rotas', categoria: '13. SINALIZAÇÃO DE EMERGÊNCIA', item: 'Sinalização de rotas de fuga e sentido de evacuação', possui: 'SIM', dimensao: 'Placas de orientação com seta', normaRef: 'NBR 13434', observacao: 'Indicação clara nos corredores' },
  { id: 'ppci_13_proibicao', categoria: '13. SINALIZAÇÃO DE EMERGÊNCIA', item: 'Placas de proibição (Proibido Fumar, Não use elevador)', possui: 'SIM', dimensao: 'Placas P1 e P2 afixadas', normaRef: 'NBR 13434', observacao: 'Localizadas no elevador e recepção' },
  { id: 'ppci_13_orientacao', categoria: '13. SINALIZAÇÃO DE EMERGÊNCIA', item: 'Placas de alerta e orientação de perigo elétrico/gás', possui: 'SIM', dimensao: 'Placas de perigo elétrico nos quadros', normaRef: 'NBR 13434', observacao: 'Afissas nos quadros gerais' },

  // 14. SAÍDAS DE EMERGÊNCIA
  { id: 'ppci_14_quantidade', categoria: '14. SAÍDAS DE EMERGÊNCIA', item: 'Quantidade de saídas de emergência por pavimento/setor', possui: 'SIM', dimensao: '1 saída principal + 1 rota de fuga', normaRef: 'NBR 9077 / IT CB', observacao: 'Adequada para a lotação' },
  { id: 'ppci_14_largura', categoria: '14. SAÍDAS DE EMERGÊNCIA', item: 'Dimensionamento da largura das saídas em unidades de passagem', possui: 'SIM', dimensao: '1,20 m (2 Unidades de Passagem)', normaRef: 'NBR 9077', observacao: 'Calculado para 180 pessoas' },
  { id: 'ppci_14_pcf', categoria: '14. SAÍDAS DE EMERGÊNCIA', item: 'Portas Corta-Fogo (PCF P-60/P-90/P-120) com mola', possui: 'SIM', dimensao: '2 portas P-90 com selo ABNT', normaRef: 'NBR 11742', observacao: 'Fechamento automático ajustado' },
  { id: 'ppci_14_barras_antipanico', categoria: '14. SAÍDAS DE EMERGÊNCIA', item: 'Barras antipânico em portas com lotação > 200 pessoas', possui: 'NAO_APLICAVEL', dimensao: 'Lotação máxima 180 p.', normaRef: 'NBR 11785', observacao: 'Fechadura convencional com abertura por pressão' },
  { id: 'ppci_14_distancias_maximas', categoria: '14. SAÍDAS DE EMERGÊNCIA', item: 'Distância máxima a percorrer (DMP) até uma saída segura', possui: 'SIM', dimensao: 'DMP real de 18,50 m (limite 25m)', normaRef: 'NBR 9077', observacao: 'Totalmente conforme' },

  // 15. CONTROLE DE FUMAÇA
  { id: 'ppci_15_exaustao', categoria: '15. CONTROLE DE FUMAÇA', item: 'Sistema de exaustão mecânica ou natural de fumaça', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Edificação com ventilação natural direta' },
  { id: 'ppci_15_ventilacao', categoria: '15. CONTROLE DE FUMAÇA', item: 'Aberturas permanentes para ventilação natural em rotas', possui: 'SIM', dimensao: 'Janelas de alumínio de 1,20x1,00m', normaRef: 'NBR 9077', observacao: 'Garantem renovação de ar' },
  { id: 'ppci_15_pressurizacao', categoria: '15. CONTROLE DE FUMAÇA', item: 'Sistema de pressurização de escadas de segurança', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Escada enclausurada protegida com duto de ventilação' },
  { id: 'ppci_15_lanternins', categoria: '15. CONTROLE DE FUMAÇA', item: 'Lanternins e venezianas de exaustão em galpões', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Não é galpão industrial' },

  // 16. GÁS E INFLAMÁVEIS
  { id: 'ppci_16_glp', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Central de Gás Liquefeito de Petróleo (GLP)', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 13523', observacao: 'Uso exclusivamente elétrico' },
  { id: 'ppci_16_gn', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Rede de Gás Natural (GN) com válvula de bloqueio', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 15526', observacao: 'Sem fornecimento de GN' },
  { id: 'ppci_16_tanques', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Tanques aéreos ou subterrâneos de combustíveis', possui: 'NAO', dimensao: 'N/A', normaRef: 'NBR 17505', observacao: 'Ausentes' },
  { id: 'ppci_16_diesel', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Armazenamento de óleo diesel para grupo gerador', possui: 'SIM', dimensao: 'Tanque base de 100 Litros', normaRef: 'NBR 17505', observacao: 'Com bacia de contenção metálica' },
  { id: 'ppci_16_produtos_quimicos', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Depósito e bacias de contenção de produtos químicos', possui: 'NAO', dimensao: 'N/A', normaRef: 'IT CB', observacao: 'Sem depósito de químicos' },
  { id: 'ppci_16_armazenamento', categoria: '16. GÁS E INFLAMÁVEIS', item: 'Condições de segurança e distâncias de armazenamento', possui: 'SIM', dimensao: 'Gerador isolado em sala própria no térreo', normaRef: 'IT CB', observacao: 'Paredes e porta corta-fogo' },

  // 17. INSTALAÇÕES ESPECIAIS
  { id: 'ppci_17_geradores', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Grupo gerador de emergência e bacia de contenção', possui: 'SIM', dimensao: 'Gerador Diesel 55 kVA silenciado', normaRef: 'NBR 10898 / NBR 5410', observacao: 'Partida automática em falha de rede' },
  { id: 'ppci_17_transformadores', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Subestação / Transformadores a óleo ou a seco', possui: 'SIM', dimensao: 'Transformador a seco 150 kVA', normaRef: 'NBR 14039', observacao: 'Em cabine abrigada' },
  { id: 'ppci_17_cabines_eletricas', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Cabine primária e quadros elétricos gerais', possui: 'SIM', dimensao: 'QGBT em chapa de aço pintada', normaRef: 'NBR 5410', observacao: 'Sinalizado e com extintor CO2 próximo' },
  { id: 'ppci_17_caldeiras', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Caldeiras e tubulações de vapor com prontuário', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'NR-13', observacao: 'Sem caldeiras' },
  { id: 'ppci_17_vasos_pressao', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Vasos de pressão e compressores com inspeção', possui: 'SIM', dimensao: 'Compressor de ar 100L (Odonto)', normaRef: 'NR-13', observacao: 'Prontuário e válvula de segurança em dia' },
  { id: 'ppci_17_compressores', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Casa de compressores de ar comprimido', possui: 'SIM', dimensao: 'Sala técnica no subsolo', normaRef: 'NR-13', observacao: 'Ventilada e limpa' },
  { id: 'ppci_17_fotovoltaicos', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Sistema de painéis solares fotovoltaicos', possui: 'SIM', dimensao: 'Arranjo de 32 placas na cobertura (15 kWp)', normaRef: 'NBR 16690 / IT CB', observacao: 'Inversor com chave de desligamento rápido' },
  { id: 'ppci_17_carregadores_ev', categoria: '17. INSTALAÇÕES ESPECIAIS', item: 'Carregadores de veículos elétricos (EV)', possui: 'SIM', dimensao: '2 Wallbox 7,4 kW no estacionamento', normaRef: 'IT CB', observacao: 'Com botão de emergência dedicado' },

  // 18. VISTORIA FOTOGRÁFICA
  { id: 'ppci_18_fachadas', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico das fachadas e acessos', possui: 'SIM', dimensao: '4 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_cobertura', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico da cobertura e telhado', possui: 'SIM', dimensao: '2 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_reservatorios', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico dos reservatórios (RTI)', possui: 'SIM', dimensao: '3 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_casa_bombas', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico da casa de bombas de incêndio', possui: 'SIM', dimensao: '3 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_escadas', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico de escadas e patamares', possui: 'SIM', dimensao: '4 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_rotas_fuga', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico das rotas de fuga e corredores', possui: 'SIM', dimensao: '4 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_portas', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico de portas corta-fogo e saídas', possui: 'SIM', dimensao: '2 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_extintores', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico da distribuição de extintores', possui: 'SIM', dimensao: '6 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_hidrantes', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico dos abrigos de hidrantes e recalque', possui: 'SIM', dimensao: '4 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_quadro_eletrico', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico dos quadros elétricos principais', possui: 'SIM', dimensao: '2 fotos registradas', normaRef: 'Procedimento Pericial', observacao: 'Anexadas no relatório' },
  { id: 'ppci_18_central_gas', categoria: '18. VISTORIA FOTOGRÁFICA', item: 'Registro fotográfico da central de gás GLP/GN', possui: 'NAO_APLICAVEL', dimensao: 'N/A', normaRef: 'Procedimento Pericial', observacao: 'Sem central de gás' },

  // 19. MEDIÇÕES E LEVANTAMENTO
  { id: 'ppci_19_areas', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Conferência de áreas e compartimentações in loco', possui: 'SIM', dimensao: '1.450 m² aferidos por trena laser', normaRef: 'Procedimento Pericial', observacao: 'Concordante com planta' },
  { id: 'ppci_19_alturas', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Medição de alturas, pé-direito e pé-direito útil', possui: 'SIM', dimensao: 'Pé-direito 2,80m / Altura total 12,80m', normaRef: 'Procedimento Pericial', observacao: 'Conferido' },
  { id: 'ppci_19_larguras', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Medição das larguras de saídas, portas e corredores', possui: 'SIM', dimensao: 'Corredores 1,40m / Portas 1,20m', normaRef: 'NBR 9077', observacao: 'Conferido' },
  { id: 'ppci_19_distancias_fuga', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Medição de distâncias máximas a percorrer até a saída', possui: 'SIM', dimensao: '18,50 m máximo', normaRef: 'NBR 9077', observacao: 'DMP conforme' },
  { id: 'ppci_19_loc_equipamentos', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Mapeamento das posições exatas dos equipamentos', possui: 'SIM', dimensao: 'Pontos plotados no croqui de campo', normaRef: 'Procedimento Pericial', observacao: 'Mapeado' },
  { id: 'ppci_19_georreferenciamento', categoria: '19. MEDIÇÕES E LEVANTAMENTO', item: 'Georreferenciamento de pontos de interesse', possui: 'SIM', dimensao: 'Pontos GPS salvos', normaRef: 'Procedimento Pericial', observacao: 'Coordenadas anexadas' },

  // 20. VERIFICAÇÃO NORMATIVA
  { id: 'ppci_20_medidas_cb', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Levantamento das medidas exigidas pelo Decreto do CB', possui: 'SIM', dimensao: 'Todas as exigências identificadas', normaRef: 'Decreto Estadual CB', observacao: 'Verificação completa' },
  { id: 'ppci_20_its_aplicaveis', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Identificação detalhada de todas as ITs aplicáveis', possui: 'SIM', dimensao: 'IT-01, IT-11, IT-18, IT-19, IT-20, IT-21, IT-22', normaRef: 'ITs Corpo de Bombeiros', observacao: 'Mapeadas no laudo' },
  { id: 'ppci_20_abnt_pertinentes', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Identificação das Normas ABNT NBR pertinentes', possui: 'SIM', dimensao: 'NBR 9077, 12693, 13714, 17240, 10898, 13434, 5419', normaRef: 'ABNT NBR', observacao: 'Mapeadas' },
  { id: 'ppci_20_laudos_complementares', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Necessidade de laudos complementares (SPDA/Elétrico)', possui: 'SIM', dimensao: 'Laudo de SPDA NBR 5419 recomendado', normaRef: 'NBR 5419 / NBR 5410', observacao: 'Solicitado em recomendações' },
  { id: 'ppci_20_art_rrt', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Necessidade de emissão de ART/RRT de Projeto e Execução', possui: 'SIM', dimensao: 'ART de Engenharia Mecânica / Segurança', normaRef: 'Lei 6.496/77', observacao: 'Registrada e anexada' },
  { id: 'ppci_20_brigada', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Necessidade de formação e dimensionamento de Brigada', possui: 'SIM', dimensao: 'Brigada Nível Intermediário (6 brigadistas)', normaRef: 'NBR 14276 / IT CB', observacao: 'Treinamento válido' },
  { id: 'ppci_20_plano_emergencia', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Exigência de elaboração de Plano de Emergência', possui: 'SIM', dimensao: 'Plano de Emergência elaborado', normaRef: 'NBR 15219 / IT CB', observacao: 'Documento impresso no local' },
  { id: 'ppci_20_plano_abandono', categoria: '20. VERIFICAÇÃO NORMATIVA', item: 'Exigência de elaboração de Plano de Abandono', possui: 'SIM', dimensao: 'Simulado de evacuação semestral', normaRef: 'NBR 15219', observacao: 'Cronograma estabelecido' }
];

export const DEFAULT_AVCB_CHECKLIST: AVCBChecklistItem[] = [
  { id: 'avcb_saidas', item: 'Conformidade das Saídas e Rotas de Emergência', status: 'CONFORME', normaRef: 'NBR 9077 / IT CB', observacao: 'Corredores e portas livres com barras antipânico instaladas.' },
  { id: 'avcb_extintores', item: 'Conformidade de Extintores Portáteis', status: 'CONFORME', normaRef: 'NBR 12693 / IT CB', observacao: 'Extintores sinalizados a 1,60m do piso, lacres intactos e validades vigentes.' },
  { id: 'avcb_hidrantes', item: 'Conformidade do Sistema de Hidrantes', status: 'NAO_CONFORME', normaRef: 'NBR 13714 / IT CB', observacao: 'Abrigo #2 sem chave de mangueira e com acoplamento Storz engripado por oxidação.', risco: 'MEDIO', acaoCorretiva: 'Lubrificar acoplamento Storz e repor chave de mangueira no abrigo #2.', prazoDias: 15 },
  { id: 'avcb_sprinklers', item: 'Conformidade de Chuveiros Automáticos (Sprinklers)', status: 'NAO_APLICAVEL', normaRef: 'NBR 10897 / IT CB', observacao: 'Edificação isenta de chuveiros automáticos conforme IT do Corpo de Bombeiros.' },
  { id: 'avcb_alarme', item: 'Conformidade de Alarme e Detecção de Incêndio', status: 'CONFORME', normaRef: 'NBR 17240 / IT CB', observacao: 'Painel central testado e acionadores de emergência operantes.' },
  { id: 'avcb_iluminacao', item: 'Conformidade da Iluminação de Emergência', status: 'CONFORME', normaRef: 'NBR 10898 / IT CB', observacao: 'Todos os blocos autônomos acenderam na simulação de falta de fase.' },
  { id: 'avcb_sinalizacao', item: 'Conformidade da Sinalização de Emergência', status: 'CONFORME', normaRef: 'NBR 13434 / IT CB', observacao: 'Sinalização fotoluminescente afixada nos locais regulamentares.' },
  { id: 'avcb_pcf', item: 'Conformidade de Portas Corta-Fogo e Fechamentos', status: 'NAO_CONFORME', normaRef: 'NBR 11742 / IT CB', observacao: 'Porta corta-fogo da escada do 1º andar com selo e mola frouxa (não fecha totalmente sozinha).', risco: 'GRAVE', acaoCorretiva: 'Ajustar tensão da mola hidráulica ou substituir dobradiça com mola para garantir selamento hermético.', prazoDias: 7 },
  { id: 'avcb_spda', item: 'Conformidade do Sistema de Proteção Atmosférica (SPDA)', status: 'CONFORME', normaRef: 'NBR 5419 / IT CB', observacao: 'Medição de resistência de aterramento em 4,2 ohms com laudo anexado.' },
  { id: 'avcb_brigada', item: 'Conformidade da Brigada de Incêndio', status: 'CONFORME', normaRef: 'NBR 14276 / IT CB', observacao: 'Certificado de brigada de incêndio apresentado com 80% do efetivo formado.' }
];

export const PREFILLED_PPCI_PARAMS = {
  laudoNumber: "PPCI-2026/089-VL",
  clientName: "Condomínio Comercial Plaza Tower",
  cnpj: "12.345.678/0001-99",
  address: "Av. Agamenon Magalhães, 4500 - Espinheiro",
  city: "Recife",
  state: "PE",
  processoCB: "CBPE-2026-004812",
  projetoAprovado: "PA-7891/2023",
  laudoDate: "01/08/2026",
  responsavelTecnico: "Eng. Vitor Leonardo",
  registroCrea: "CREA-PE 048192-D",
  artRrt: "PE2026098124",
  areaConstruida: "1.450 m²",
  numeroPavimentos: "4 (Térreo + 3 Pavimentos)",
  alturaEdificacao: "12,80 m",
  tipoOcupacao: "Comercial (C-2) - Escritórios e Serviços",
  cargaIncendio: "300 MJ/m² (Média)",
  populacaoEstimada: "180 pessoas",
  fonteAgua: "Reservatório Superior Dedicado (Castelo d'Água)",
  volumeReservaAgua: "15.000 Litros"
};
