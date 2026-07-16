/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChecklistData, ClientData, EquipmentData, ChecklistType, ChecklistQuestion, QuestionResponseType } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, Clipboard, Save, HelpCircle, Printer, Check, X, Shield, Lock, Edit2, RotateCcw, AlertTriangle, Camera, Image, Upload } from 'lucide-react';
import Logo from '../Logo';

const QUESTIONS_BY_TYPE: Record<ChecklistType, ChecklistQuestion[]> = {
  nr12: [
    // 1. IDENTIFICAÇÃO DA MÁQUINA
    { id: 'n1_data_inspecao', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Data da inspeção', responseType: 'date' },
    { id: 'n1_local_inspecao', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Local da inspeção', responseType: 'text' },
    { id: 'n1_setor', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Setor', responseType: 'text' },
    { id: 'n1_maquina_equipamento', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Máquina/Equipamento', responseType: 'text' },
    { id: 'n1_marca', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Marca', responseType: 'text' },
    { id: 'n1_modelo', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Modelo', responseType: 'text' },
    { id: 'n1_num_serie', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Número de Série', responseType: 'text' },
    { id: 'n1_ano_fabricacao', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Ano de fabricação', responseType: 'number' },
    { id: 'n1_fabricante', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Fabricante', responseType: 'text' },
    { id: 'n1_potencia_instalada', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Potência instalada (kW)', responseType: 'number' },
    { id: 'n1_responsavel_inspecao', category: '1. IDENTIFICAÇÃO DA MÁQUINA', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO TÉCNICA
    { id: 'n2_manual_operacao_pt', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Manual de operação disponível em português', responseType: 'default' },
    { id: 'n2_manual_manutencao', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Manual de manutenção disponível', responseType: 'default' },
    { id: 'n2_diagramas_eletricos', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Diagramas elétricos disponíveis', responseType: 'default' },
    { id: 'n2_diagramas_hidraulicos', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Diagramas hidráulicos disponíveis', responseType: 'default' },
    { id: 'n2_diagramas_pneumaticos', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Diagramas pneumáticos disponíveis', responseType: 'default' },
    { id: 'n2_procedimento_operacional', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Procedimento operacional documentado', responseType: 'default' },
    { id: 'n2_procedimento_manutencao', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Procedimento de manutenção documentado', responseType: 'default' },
    { id: 'n2_inventario_maquina', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Inventário da máquina atualizado', responseType: 'default' },
    { id: 'n2_analise_risco', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Análise de risco disponível', responseType: 'default' },
    { id: 'n2_observacoes', category: '2. DOCUMENTAÇÃO TÉCNICA', text: 'Observações', responseType: 'text' },

    // 3. IDENTIFICAÇÃO E SINALIZAÇÃO
    { id: 'n3_maquina_identificada', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Máquina identificada', responseType: 'c_nc' },
    { id: 'n3_placa_identificacao', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Placa de identificação legível', responseType: 'c_nc' },
    { id: 'n3_capacidade_operacional', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Capacidade operacional identificada', responseType: 'default' },
    { id: 'n3_sinalizacao_seguranca', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Sinalização de segurança instalada', responseType: 'c_nc' },
    { id: 'n3_etiquetas_advertencia', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Etiquetas de advertência legíveis', responseType: 'c_nc' },
    { id: 'n3_sinalizacao_areas_risco', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Sinalização de áreas de risco', responseType: 'c_nc' },
    { id: 'n3_identificacao_comandos', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Identificação dos comandos', responseType: 'c_nc' },
    { id: 'n3_observacoes', category: '3. IDENTIFICAÇÃO E SINALIZAÇÃO', text: 'Observações', responseType: 'text' },

    // 4. ARRANJO FÍSICO E INSTALAÇÕES
    { id: 'n4_area_circulacao', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Área de circulação adequada', responseType: 'c_nc' },
    { id: 'n4_espaco_operacao', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Espaço suficiente para operação', responseType: 'c_nc' },
    { id: 'n4_iluminacao', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Iluminação adequada', responseType: 'c_nc' },
    { id: 'n4_piso_condicoes', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Piso em boas condições', responseType: 'c_nc' },
    { id: 'n4_ausencia_obstaculos', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Ausência de obstáculos', responseType: 'c_nc' },
    { id: 'n4_organizacao_local', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Organização do local', responseType: 'bom_reg_ruim' },
    { id: 'n4_observacoes', category: '4. ARRANJO FÍSICO E INSTALAÇÕES', text: 'Observações', responseType: 'text' },

    // 5. SISTEMA ELÉTRICO
    { id: 'n5_painel_eletrico_id', category: '5. SISTEMA ELÉTRICO', text: 'Painel elétrico identificado', responseType: 'c_nc' },
    { id: 'n5_painel_eletrico_prot', category: '5. SISTEMA ELÉTRICO', text: 'Painel elétrico protegido', responseType: 'c_nc' },
    { id: 'n5_grau_protecao_ip', category: '5. SISTEMA ELÉTRICO', text: 'Grau de proteção adequado (IP)', responseType: 'c_nc' },
    { id: 'n5_dispositivo_bloqueio', category: '5. SISTEMA ELÉTRICO', text: 'Dispositivo de bloqueio disponível', responseType: 'c_nc' },
    { id: 'n5_chaves_seccionadoras', category: '5. SISTEMA ELÉTRICO', text: 'Chaves seccionadoras identificadas', responseType: 'c_nc' },
    { id: 'n5_aterramento', category: '5. SISTEMA ELÉTRICO', text: 'Aterramento adequado', responseType: 'c_nc' },
    { id: 'n5_cabos_protegidos', category: '5. SISTEMA ELÉTRICO', text: 'Cabos elétricos protegidos', responseType: 'c_nc' },
    { id: 'n5_ausencia_emendas', category: '5. SISTEMA ELÉTRICO', text: 'Ausência de emendas irregulares', responseType: 'c_nc' },
    { id: 'n5_observacoes', category: '5. SISTEMA ELÉTRICO', text: 'Observações', responseType: 'text' },

    // 6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA
    { id: 'n6_botao_partida', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Botão de partida identificado', responseType: 'c_nc' },
    { id: 'n6_botao_parada', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Botão de parada identificado', responseType: 'c_nc' },
    { id: 'n6_acionamento_involuntario', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Acionamento involuntário impedido', responseType: 'c_nc' },
    { id: 'n6_rearme_manual', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Rearme manual exigido após falha', responseType: 'c_nc' },
    { id: 'n6_comandos_adequados', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Comandos em condições adequadas', responseType: 'c_nc' },
    { id: 'n6_observacoes', category: '6. DISPOSITIVOS DE PARTIDA, ACIONAMENTO E PARADA', text: 'Observações', responseType: 'text' },

    // 7. PARADA DE EMERGÊNCIA
    { id: 'n7_possui_emergencia', category: '7. PARADA DE EMERGÊNCIA', text: 'Possui parada de emergência', responseType: 'c_nc' },
    { id: 'n7_acessivel_operador', category: '7. PARADA DE EMERGÊNCIA', text: 'Dispositivo acessível ao operador', responseType: 'c_nc' },
    { id: 'n7_identificado_vermelho', category: '7. PARADA DE EMERGÊNCIA', text: 'Dispositivo identificado em vermelho', responseType: 'c_nc' },
    { id: 'n7_dispositivo_funcional', category: '7. PARADA DE EMERGÊNCIA', text: 'Dispositivo funcional', responseType: 'c_nc' },
    { id: 'n7_rearme_obrigatorio', category: '7. PARADA DE EMERGÊNCIA', text: 'Rearme manual obrigatório', responseType: 'c_nc' },
    { id: 'n7_quantidade_dispositivos', category: '7. PARADA DE EMERGÊNCIA', text: 'Quantidade adequada de dispositivos', responseType: 'c_nc' },
    { id: 'n7_observacoes', category: '7. PARADA DE EMERGÊNCIA', text: 'Observações', responseType: 'text' },

    // 8. PROTEÇÕES FIXAS
    { id: 'n8_protecao_pontos_risco', category: '8. PROTEÇÕES FIXAS', text: 'Proteção instalada nos pontos de risco', responseType: 'c_nc' },
    { id: 'n8_fixacao_adequada', category: '8. PROTEÇÕES FIXAS', text: 'Fixação adequada', responseType: 'c_nc' },
    { id: 'n8_resistencia_mecanica', category: '8. PROTEÇÕES FIXAS', text: 'Resistência mecânica adequada', responseType: 'c_nc' },
    { id: 'n8_nao_permite_acesso', category: '8. PROTEÇÕES FIXAS', text: 'Não permite acesso à zona de perigo', responseType: 'c_nc' },
    { id: 'n8_sem_partes_cortantes', category: '8. PROTEÇÕES FIXAS', text: 'Sem partes cortantes ou perigosas', responseType: 'c_nc' },
    { id: 'n8_observacoes', category: '8. PROTEÇÕES FIXAS', text: 'Observações', responseType: 'text' },

    // 9. PROTEÇÕES MÓVEIS
    { id: 'n9_protecoes_moveis', category: '9. PROTEÇÕES MÓVEIS', text: 'Proteções móveis instaladas', responseType: 'default' },
    { id: 'n9_intertravamento_funcional', category: '9. PROTEÇÕES MÓVEIS', text: 'Intertravamento funcional', responseType: 'default' },
    { id: 'n9_impede_funcionamento', category: '9. PROTEÇÕES MÓVEIS', text: 'Impede funcionamento com proteção aberta', responseType: 'default' },
    { id: 'n9_sistema_adequado', category: '9. PROTEÇÕES MÓVEIS', text: 'Sistema em condições adequadas', responseType: 'default' },
    { id: 'n9_observacoes', category: '9. PROTEÇÕES MÓVEIS', text: 'Observações', responseType: 'text' },

    // 10. SISTEMAS DE SEGURANÇA
    { id: 'n10_cortina_luz', category: '10. SISTEMAS DE SEGURANÇA', text: 'Cortina de luz instalada', responseType: 'default' },
    { id: 'n10_scanner_seguranca', category: '10. SISTEMAS DE SEGURANÇA', text: 'Scanner de segurança instalado', responseType: 'default' },
    { id: 'n10_tapete_seguranca', category: '10. SISTEMAS DE SEGURANÇA', text: 'Tapete de segurança instalado', responseType: 'default' },
    { id: 'n10_chave_seguranca', category: '10. SISTEMAS DE SEGURANÇA', text: 'Chave de segurança instalada', responseType: 'default' },
    { id: 'n10_rele_seguranca', category: '10. SISTEMAS DE SEGURANÇA', text: 'Relé de segurança instalado', responseType: 'default' },
    { id: 'n10_clp_seguranca', category: '10. SISTEMAS DE SEGURANÇA', text: 'CLP de segurança instalado', responseType: 'default' },
    { id: 'n10_categoria_compativel', category: '10. SISTEMAS DE SEGURANÇA', text: 'Categoria de segurança compatível', responseType: 'default' },
    { id: 'n10_observacoes', category: '10. SISTEMAS DE SEGURANÇA', text: 'Observações', responseType: 'text' },

    // 11. TRANSMISSÕES DE FORÇA
    { id: 'n11_correias_protegidas', category: '11. TRANSMISSÕES DE FORÇA', text: 'Correias protegidas', responseType: 'default' },
    { id: 'n11_polias_protegidas', category: '11. TRANSMISSÕES DE FORÇA', text: 'Polias protegidas', responseType: 'default' },
    { id: 'n11_correntes_protegidas', category: '11. TRANSMISSÕES DE FORÇA', text: 'Correntes protegidas', responseType: 'default' },
    { id: 'n11_engrenagens_protegidas', category: '11. TRANSMISSÕES DE FORÇA', text: 'Engrenagens protegidas', responseType: 'default' },
    { id: 'n11_eixos_protegidos', category: '11. TRANSMISSÕES DE FORÇA', text: 'Eixos protegidos', responseType: 'default' },
    { id: 'n11_acoplamentos_protegidos', category: '11. TRANSMISSÕES DE FORÇA', text: 'Acoplamentos protegidos', responseType: 'default' },
    { id: 'n11_observacoes', category: '11. TRANSMISSÕES DE FORÇA', text: 'Observações', responseType: 'text' },

    // 12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS
    { id: 'n12_mangueiras_identificadas', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Mangueiras identificadas', responseType: 'default' },
    { id: 'n12_ausencia_vazamentos', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Ausência de vazamentos', responseType: 'default' },
    { id: 'n12_componentes_protegidos', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Componentes protegidos', responseType: 'default' },
    { id: 'n12_valvulas_boas_condicoes', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Válvulas em boas condições', responseType: 'default' },
    { id: 'n12_dispositivo_alivio', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Dispositivo de alívio instalado', responseType: 'default' },
    { id: 'n12_observacoes', category: '12. SISTEMAS HIDRÁULICOS E PNEUMÁTICOS', text: 'Observações', responseType: 'text' },

    // 13. ERGONOMIA
    { id: 'n13_posto_operacao', category: '13. ERGONOMIA', text: 'Posto de operação adequado', responseType: 'c_nc' },
    { id: 'n13_visibilidade', category: '13. ERGONOMIA', text: 'Visibilidade adequada', responseType: 'c_nc' },
    { id: 'n13_comandos_ergonomicos', category: '13. ERGONOMIA', text: 'Comandos ergonomicamente posicionados', responseType: 'c_nc' },
    { id: 'n13_esforco_fisico', category: '13. ERGONOMIA', text: 'Esforço físico compatível', responseType: 'c_nc' },
    { id: 'n13_assento_adequado', category: '13. ERGONOMIA', text: 'Assento adequado (quando aplicável)', responseType: 'default' },
    { id: 'n13_observacoes', category: '13. ERGONOMIA', text: 'Observações', responseType: 'text' },

    // 14. MANUTENÇÃO E BLOQUEIO (LOTO)
    { id: 'n14_procedimento_bloqueio', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Procedimento de bloqueio documentado', responseType: 'c_nc' },
    { id: 'n14_pontos_bloqueio_id', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Pontos de bloqueio identificados', responseType: 'c_nc' },
    { id: 'n14_dispositivos_bloqueio', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Dispositivos de bloqueio disponíveis', responseType: 'c_nc' },
    { id: 'n14_etiquetagem_bloqueio', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Etiquetagem de bloqueio disponível', responseType: 'c_nc' },
    { id: 'n14_equipe_treinada', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Equipe treinada em bloqueio', responseType: 'c_nc' },
    { id: 'n14_observacoes', category: '14. MANUTENÇÃO E BLOQUEIO (LOTO)', text: 'Observações', responseType: 'text' },

    // 15. CAPACITAÇÃO E TREINAMENTO
    { id: 'n15_operadores_treinados', category: '15. CAPACITAÇÃO E TREINAMENTO', text: 'Operadores treinados', responseType: 'c_nc' },
    { id: 'n15_registros_treinamento', category: '15. CAPACITAÇÃO E TREINAMENTO', text: 'Registros de treinamento disponíveis', responseType: 'c_nc' },
    { id: 'n15_treinamento_periodico', category: '15. CAPACITAÇÃO E TREINAMENTO', text: 'Treinamento periódico realizado', responseType: 'c_nc' },
    { id: 'n15_procedimentos_conhecidos', category: '15. CAPACITAÇÃO E TREINAMENTO', text: 'Procedimentos conhecidos pelos operadores', responseType: 'c_nc' },
    { id: 'n15_observacoes', category: '15. CAPACITAÇÃO E TREINAMENTO', text: 'Observações', responseType: 'text' },

    // 16. ANÁLISE DE RISCOS
    { id: 'n16_perigos_mecanicos', category: '16. ANÁLISE DE RISCOS', text: 'Perigos mecânicos identificados', responseType: 'c_nc' },
    { id: 'n16_perigos_eletricos', category: '16. ANÁLISE DE RISCOS', text: 'Perigos elétricos identificados', responseType: 'c_nc' },
    { id: 'n16_perigos_ergonomicos', category: '16. ANÁLISE DE RISCOS', text: 'Perigos ergonômicos identificados', responseType: 'c_nc' },
    { id: 'n16_perigos_termicos', category: '16. ANÁLISE DE RISCOS', text: 'Perigos térmicos identificados', responseType: 'c_nc' },
    { id: 'n16_medidas_controle', category: '16. ANÁLISE DE RISCOS', text: 'Medidas de controle implementadas', responseType: 'c_nc' },
    { id: 'n16_observacoes', category: '16. ANÁLISE DE RISCOS', text: 'Observações', responseType: 'text' },

    // 17. REGISTRO FOTOGRÁFICO
    { id: 'n17_foto_vista_geral', category: '17. REGISTRO FOTOGRÁFICO', text: 'Vista geral da máquina', responseType: 'photo' },
    { id: 'n17_foto_painel_eletrico', category: '17. REGISTRO FOTOGRÁFICO', text: 'Painel elétrico', responseType: 'photo' },
    { id: 'n17_foto_protecoes_fixas', category: '17. REGISTRO FOTOGRÁFICO', text: 'Proteções fixas', responseType: 'photo' },
    { id: 'n17_foto_protecoes_moveis', category: '17. REGISTRO FOTOGRÁFICO', text: 'Proteções móveis', responseType: 'photo' },
    { id: 'n17_foto_sistemas_seguranca', category: '17. REGISTRO FOTOGRÁFICO', text: 'Sistemas de segurança', responseType: 'photo' },
    { id: 'n17_foto_transmissoes_forca', category: '17. REGISTRO FOTOGRÁFICO', text: 'Transmissões de força', responseType: 'photo' },
    { id: 'n17_foto_paradas_emergencia', category: '17. REGISTRO FOTOGRÁFICO', text: 'Paradas de emergência', responseType: 'photo' },
    { id: 'n17_foto_sinalizacoes', category: '17. REGISTRO FOTOGRÁFICO', text: 'Sinalizações', responseType: 'photo' },
    { id: 'n17_foto_nao_conformidades', category: '17. REGISTRO FOTOGRÁFICO', text: 'Não conformidades identificadas', responseType: 'photo' }
  ],
  munck: [
    // 1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)
    { id: 'm_1_data_vistoria', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Data da vistoria', responseType: 'date' },
    { id: 'm_1_local_vistoria', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Local da vistoria', responseType: 'text' },
    { id: 'm_1_proprietario', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Proprietário', responseType: 'text' },
    { id: 'm_1_marca_caminhao', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Marca do caminhão', responseType: 'text' },
    { id: 'm_1_modelo_caminhao', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Modelo do caminhão', responseType: 'text' },
    { id: 'm_1_ano_modelo_caminhao', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Ano/modelo do caminhão', responseType: 'text' },
    { id: 'm_1_placa', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Placa', responseType: 'text' },
    { id: 'm_1_renavam', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'RENAVAM', responseType: 'text' },
    { id: 'm_1_marca_munck', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Marca do Munck', responseType: 'text' },
    { id: 'm_1_modelo_munck', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Modelo do Munck', responseType: 'text' },
    { id: 'm_1_num_serie_munck', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Número de série do Munck', responseType: 'text' },
    { id: 'm_1_capacidade_maxima', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Capacidade máxima de carga (tm)', responseType: 'number' },
    { id: 'm_1_horimetro_munck', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Horímetro do Munck', responseType: 'number' },
    { id: 'm_1_quilometragem', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Quilometragem do veículo', responseType: 'number' },
    { id: 'm_1_responsavel_vistoria', category: '1. IDENTIFICAÇÃO DO CONJUNTO (VEÍCULO + GUINDAUTO)', text: 'Responsável pela vistoria', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'm_2_crlv_valido', category: '2. DOCUMENTAÇÃO', text: 'CRLV válido', responseType: 'default' },
    { id: 'm_2_manual_equipamento', category: '2. DOCUMENTAÇÃO', text: 'Manual do equipamento disponível', responseType: 'default' },
    { id: 'm_2_manual_veiculo', category: '2. DOCUMENTAÇÃO', text: 'Manual do veículo disponível', responseType: 'default' },
    { id: 'm_2_plano_preventiva', category: '2. DOCUMENTAÇÃO', text: 'Plano de manutenção preventiva', responseType: 'default' },
    { id: 'm_2_historico_manutencao', category: '2. DOCUMENTAÇÃO', text: 'Histórico de manutenção disponível', responseType: 'default' },
    { id: 'm_2_art_laudo_anterior', category: '2. DOCUMENTAÇÃO', text: 'ART ou Laudo anterior disponível', responseType: 'default' },
    { id: 'm_2_tabela_carga', category: '2. DOCUMENTAÇÃO', text: 'Tabela de carga disponível', responseType: 'default' },
    { id: 'm_2_certificados_acessorios', category: '2. DOCUMENTAÇÃO', text: 'Certificados de acessórios de içamento', responseType: 'default' },
    { id: 'm_2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações de Documentação', responseType: 'text' },

    // 3. CHASSI E ESTRUTURA DO VEÍCULO
    { id: 'm_3_longarinas_sem_trincas', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Longarinas sem trincas', responseType: 'ok_nok' },
    { id: 'm_3_longarinas_sem_deformacoes', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Longarinas sem deformações', responseType: 'ok_nok' },
    { id: 'm_3_estado_chassi', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Estado geral do chassi', responseType: 'bom_reg_ruim' },
    { id: 'm_3_fixacao_munck', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Fixação do Munck ao chassi', responseType: 'ok_nok' },
    { id: 'm_3_estado_suportes', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Estado dos suportes estruturais', responseType: 'bom_reg_ruim' },
    { id: 'm_3_parafusos_fixacao', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Estado dos parafusos de fixação', responseType: 'bom_reg_ruim' },
    { id: 'm_3_corrosao_estrutural', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Corrosão estrutural', responseType: 'ok_nok' },
    { id: 'm_3_observacoes', category: '3. CHASSI E ESTRUTURA DO VEÍCULO', text: 'Observações de Chassi e Estrutura', responseType: 'text' },

    // 4. ESTRUTURA DO MUNCK
    { id: 'm_4_coluna_principal', category: '4. ESTRUTURA DO MUNCK', text: 'Coluna principal sem trincas', responseType: 'ok_nok' },
    { id: 'm_4_bracos_articulados', category: '4. ESTRUTURA DO MUNCK', text: 'Braços articulados íntegros', responseType: 'ok_nok' },
    { id: 'm_4_ausencia_deformacoes', category: '4. ESTRUTURA DO MUNCK', text: 'Ausência de deformações', responseType: 'ok_nok' },
    { id: 'm_4_estado_soldas', category: '4. ESTRUTURA DO MUNCK', text: 'Estado das soldas', responseType: 'bom_reg_ruim' },
    { id: 'm_4_linhas_articulacao', category: '4. ESTRUTURA DO MUNCK', text: 'Estado dos pontos de articulação', responseType: 'bom_reg_ruim' },
    { id: 'm_4_estado_pinos', category: '4. ESTRUTURA DO MUNCK', text: 'Estado dos pinos', responseType: 'bom_reg_ruim' },
    { id: 'm_4_estado_buchas', category: '4. ESTRUTURA DO MUNCK', text: 'Estado das buchas', responseType: 'bom_reg_ruim' },
    { id: 'm_4_observacoes', category: '4. ESTRUTURA DO MUNCK', text: 'Observações de Estrutura do Munck', responseType: 'text' },

    // 5. SISTEMA HIDRÁULICO
    { id: 'm_5_vazamentos_hidraulicos', category: '5. SISTEMA HIDRÁULICO', text: 'Vazamentos hidráulicos', responseType: 'ok_nok' },
    { id: 'm_5_estado_mangueiras', category: '5. SISTEMA HIDRÁULICO', text: 'Estado das mangueiras', responseType: 'bom_reg_ruim' },
    { id: 'm_5_estado_conexoes', category: '5. SISTEMA HIDRÁULICO', text: 'Estado das conexões', responseType: 'bom_reg_ruim' },
    { id: 'm_5_cilindros_hidraulicos', category: '5. SISTEMA HIDRÁULICO', text: 'Estado dos cilindros hidráulicos', responseType: 'bom_reg_ruim' },
    { id: 'm_5_bomba_hidraulica', category: '5. SISTEMA HIDRÁULICO', text: 'Funcionamento da bomba hidráulica', responseType: 'ok_nok' },
    { id: 'm_5_funcionamento_valvulas', category: '5. SISTEMA HIDRÁULICO', text: 'Funcionamento das válvulas', responseType: 'ok_nok' },
    { id: 'm_5_pressao_adequada', category: '5. SISTEMA HIDRÁULICO', text: 'Pressão operacional adequada', responseType: 'ok_nok' },
    { id: 'm_5_observacoes', category: '5. SISTEMA HIDRÁULICO', text: 'Observações de Sistema Hidráulico', responseType: 'text' },

    // 6. LANÇA E EXTENSÕES
    { id: 'm_6_integridade_lanca_princ', category: '6. LANÇA E EXTENSÕES', text: 'Integridade da lança principal', responseType: 'ok_nok' },
    { id: 'm_6_integridade_extensoes', category: '6. LANÇA E EXTENSÕES', text: 'Integridade das extensões', responseType: 'ok_nok' },
    { id: 'm_6_alinhamento_lanca', category: '6. LANÇA E EXTENSÕES', text: 'Alinhamento da lança', responseType: 'ok_nok' },
    { id: 'm_6_patins_deslizamento', category: '6. LANÇA E EXTENSÕES', text: 'Estado dos patins de deslizamento', responseType: 'bom_reg_ruim' },
    { id: 'm_6_curso_completo', category: '6. LANÇA E EXTENSÕES', text: 'Curso completo operacional', responseType: 'ok_nok' },
    { id: 'm_6_folgas_excessivas', category: '6. LANÇA E EXTENSÕES', text: 'Folgas excessivas', responseType: 'ok_nok' },
    { id: 'm_6_observacoes', category: '6. LANÇA E EXTENSÕES', text: 'Observações de Lança e Extensões', responseType: 'text' },

    // 7. CABOS, POLIAS E GANCHO
    { id: 'm_7_estado_cabo_aco', category: '7. CABOS, POLIAS E GANCHO', text: 'Estado geral do cabo de aço', responseType: 'bom_reg_ruim' },
    { id: 'm_7_fios_rompidos', category: '7. CABOS, POLIAS E GANCHO', text: 'Fios rompidos acima do limite', responseType: 'c_nc' },
    { id: 'm_7_corrosao_cabo', category: '7. CABOS, POLIAS E GANCHO', text: 'Corrosão no cabo', responseType: 'c_nc' },
    { id: 'm_7_torcoes_amassamentos', category: '7. CABOS, POLIAS E GANCHO', text: 'Torções ou amassamentos', responseType: 'c_nc' },
    { id: 'm_7_lubrificacao_adequada', category: '7. CABOS, POLIAS E GANCHO', text: 'Lubrificação adequada', responseType: 'c_nc' },
    { id: 'm_7_estado_polias', category: '7. CABOS, POLIAS E GANCHO', text: 'Estado das polias', responseType: 'bom_reg_ruim' },
    { id: 'm_7_estado_gancho', category: '7. CABOS, POLIAS E GANCHO', text: 'Estado do gancho', responseType: 'bom_reg_ruim' },
    { id: 'm_7_trava_seguranca_gancho', category: '7. CABOS, POLIAS E GANCHO', text: 'Trava de segurança do gancho', responseType: 'c_nc' },
    { id: 'm_7_observacoes', category: '7. CABOS, POLIAS E GANCHO', text: 'Observações de Cabos, Polias e Gancho', responseType: 'text' },

    // 8. PATOLAS E ESTABILIZADORES
    { id: 'm_8_funcionamento_patolas', category: '8. PATOLAS E ESTABILIZADORES', text: 'Funcionamento das patolas', responseType: 'ok_nok' },
    { id: 'm_8_vazamentos_cilindros_patolas', category: '8. PATOLAS E ESTABILIZADORES', text: 'Vazamentos nos cilindros das patolas', responseType: 'ok_nok' },
    { id: 'm_8_travamento_adequado', category: '8. PATOLAS E ESTABILIZADORES', text: 'Travamento adequado', responseType: 'ok_nok' },
    { id: 'm_8_integridade_patolas', category: '8. PATOLAS E ESTABILIZADORES', text: 'Integridade estrutural das patolas', responseType: 'ok_nok' },
    { id: 'm_8_sapatas_apoio_disponiveis', category: '8. PATOLAS E ESTABILIZADORES', text: 'Sapatas de apoio disponíveis', responseType: 'c_nc' },
    { id: 'm_8_estado_sapatas', category: '8. PATOLAS E ESTABILIZADORES', text: 'Estado das sapatas', responseType: 'bom_reg_ruim' },
    { id: 'm_8_nivel_estabilizacao', category: '8. PATOLAS E ESTABILIZADORES', text: 'Nível de estabilização adequado', responseType: 'ok_nok' },
    { id: 'm_8_observacoes', category: '8. PATOLAS E ESTABILIZADORES', text: 'Observações de Patolas', responseType: 'text' },

    // 9. SISTEMAS DE SEGURANÇA
    { id: 'm_9_limitador_carga', category: '9. SISTEMAS DE SEGURANÇA', text: 'Limitador de carga operacional', responseType: 'c_nc' },
    { id: 'm_9_indicador_carga', category: '9. SISTEMAS DE SEGURANÇA', text: 'Indicador de carga operacional', responseType: 'c_nc' },
    { id: 'm_9_sistema_anti_sobrecarga', category: '9. SISTEMAS DE SEGURANÇA', text: 'Sistema anti-sobrecarga', responseType: 'c_nc' },
    { id: 'm_9_alarme_sonoro', category: '9. SISTEMAS DE SEGURANÇA', text: 'Alarme sonoro operacional', responseType: 'c_nc' },
    { id: 'm_9_botao_emergencia', category: '9. SISTEMAS DE SEGURANÇA', text: 'Botão de emergência', responseType: 'c_nc' },
    { id: 'm_9_adesivos_seguranca', category: '9. SISTEMAS DE SEGURANÇA', text: 'Adesivos de segurança legíveis', responseType: 'c_nc' },
    { id: 'm_9_tabela_carga_legivel', category: '9. SISTEMAS DE SEGURANÇA', text: 'Tabela de carga legível', responseType: 'c_nc' },
    { id: 'm_9_giroflex', category: '9. SISTEMAS DE SEGURANÇA', text: 'Giroflex operacional', responseType: 'c_nc' },
    { id: 'm_9_observacoes', category: '9. SISTEMAS DE SEGURANÇA', text: 'Observações de Sistemas de Segurança', responseType: 'text' },

    // 10. SISTEMA ELÉTRICO
    { id: 'm_10_estado_bateria', category: '10. SISTEMA ELÉTRICO', text: 'Estado da bateria', responseType: 'bom_reg_ruim' },
    { id: 'm_10_fixacao_bateria', category: '10. SISTEMA ELÉTRICO', text: 'Fixação da bateria', responseType: 'ok_nok' },
    { id: 'm_10_chicote_eletrico', category: '10. SISTEMA ELÉTRICO', text: 'Chicote elétrico', responseType: 'bom_reg_ruim' },
    { id: 'm_10_painel_controle', category: '10. SISTEMA ELÉTRICO', text: 'Painel de controle operacional', responseType: 'ok_nok' },
    { id: 'm_10_iluminacao_trabalho', category: '10. SISTEMA ELÉTRICO', text: 'Iluminação de trabalho', responseType: 'ok_nok' },
    { id: 'm_10_luzes_advertencia', category: '10. SISTEMA ELÉTRICO', text: 'Luzes de advertência', responseType: 'ok_nok' },
    { id: 'm_10_observacoes', category: '10. SISTEMA ELÉTRICO', text: 'Observações de Sistema Elétrico', responseType: 'text' },

    // 11. CABINE DO VEÍCULO
    { id: 'm_11_estado_cabine', category: '11. CABINE DO VEÍCULO', text: 'Estado geral da cabine', responseType: 'bom_reg_ruim' },
    { id: 'm_11_cinto_seguranca', category: '11. CABINE DO VEÍCULO', text: 'Cinto de segurança', responseType: 'c_nc' },
    { id: 'm_11_banco_motorista', category: '11. CABINE DO VEÍCULO', text: 'Banco do motorista', responseType: 'bom_reg_ruim' },
    { id: 'm_11_vidros_integros', category: '11. CABINE DO VEÍCULO', text: 'Vidros íntegros', responseType: 'ok_nok' },
    { id: 'm_11_retrovisores', category: '11. CABINE DO VEÍCULO', text: 'Retrovisores', responseType: 'ok_nok' },
    { id: 'm_11_limpadores', category: '11. CABINE DO VEÍCULO', text: 'Limpadores de para-brisa', responseType: 'ok_nok' },
    { id: 'm_11_buzina', category: '11. CABINE DO VEÍCULO', text: 'Buzina', responseType: 'ok_nok' },
    { id: 'm_11_ar_condicionado', category: '11. CABINE DO VEÍCULO', text: 'Ar-condicionado', responseType: 'ok_nok' },
    { id: 'm_11_observacoes', category: '11. CABINE DO VEÍCULO', text: 'Observações de Cabine do Veículo', responseType: 'text' },

    // 12. SISTEMA MECÂNICO DO CAMINHÃO
    { id: 'm_12_motor_sem_vazamentos', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Motor sem vazamentos', responseType: 'ok_nok' },
    { id: 'm_12_sistema_transmissao', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Sistema de transmissão', responseType: 'ok_nok' },
    { id: 'm_12_sistema_direcao', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Sistema de direção', responseType: 'ok_nok' },
    { id: 'm_12_sistema_freios', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Sistema de freios', responseType: 'ok_nok' },
    { id: 'm_12_sistema_suspensao', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Sistema de suspensão', responseType: 'bom_reg_ruim' },
    { id: 'm_12_sistema_escapamento', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Sistema de escapamento', responseType: 'bom_reg_ruim' },
    { id: 'm_12_observacoes', category: '12. SISTEMA MECÂNICO DO CAMINHÃO', text: 'Observações de Mecânica', responseType: 'text' },

    // 13. PNEUS E RODADOS
    { id: 'm_13_pneus_dianteiros', category: '13. PNEUS E RODADOS', text: 'Estado dos pneus dianteiros', responseType: 'bom_reg_ruim' },
    { id: 'm_13_pneus_traseiros', category: '13. PNEUS E RODADOS', text: 'Estado dos pneus traseiros', responseType: 'bom_reg_ruim' },
    { id: 'm_13_sulco_limite_legal', category: '13. PNEUS E RODADOS', text: 'Sulco dentro do limite legal', responseType: 'c_nc' },
    { id: 'm_13_ausencia_cortes', category: '13. PNEUS E RODADOS', text: 'Ausência de cortes ou avarias', responseType: 'ok_nok' },
    { id: 'm_13_estado_rodas', category: '13. PNEUS E RODADOS', text: 'Estado das rodas', responseType: 'bom_reg_ruim' },
    { id: 'm_13_torque_rodas_adequado', category: '13. PNEUS E RODADOS', text: 'Torque das rodas adequado', responseType: 'ok_nok' },
    { id: 'm_13_observacoes', category: '13. PNEUS E RODADOS', text: 'Observações de Rodado', responseType: 'text' },

    // 14. TESTE OPERACIONAL
    { id: 'm_14_elevacao_carga', category: '14. TESTE OPERACIONAL', text: 'Elevação da carga', responseType: 'ok_nok' },
    { id: 'm_14_descida_carga', category: '14. TESTE OPERACIONAL', text: 'Descida da carga', responseType: 'ok_nok' },
    { id: 'm_14_giro_lanca', category: '14. TESTE OPERACIONAL', text: 'Giro da lança', responseType: 'ok_nok' },
    { id: 'm_14_extensao_lanca', category: '14. TESTE OPERACIONAL', text: 'Extensão da lança', responseType: 'ok_nok' },
    { id: 'm_14_retracao_lanca', category: '14. TESTE OPERACIONAL', text: 'Retração da lança', responseType: 'ok_nok' },
    { id: 'm_14_funcionamento_patolas', category: '14. TESTE OPERACIONAL', text: 'Funcionamento das patolas', responseType: 'ok_nok' },
    { id: 'm_14_funcionamento_comandos', category: '14. TESTE OPERACIONAL', text: 'Funcionamento dos comandos', responseType: 'ok_nok' },
    { id: 'm_14_ausencia_ruidos', category: '14. TESTE OPERACIONAL', text: 'Ausência de ruídos anormais', responseType: 'ok_nok' },
    { id: 'm_14_ausencia_vibracoes', category: '14. TESTE OPERACIONAL', text: 'Ausência de vibrações excessivas', responseType: 'ok_nok' },
    { id: 'm_14_desempenho_geral', category: '14. TESTE OPERACIONAL', text: 'Desempenho geral', responseType: 'bom_reg_ruim' },
    { id: 'm_14_observacoes', category: '14. TESTE OPERACIONAL', text: 'Observações de Teste Operacional', responseType: 'text' },

    // 15. ENSAIO DE CARGA (QUANDO APLICÁVEL)
    { id: 'm_15_carga_aplicada', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Carga aplicada (kg)', responseType: 'number' },
    { id: 'm_15_percentual_carga', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Percentual da carga nominal (%)', responseType: 'number' },
    { id: 'm_15_suportou_carga', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Equipamento suportou a carga', responseType: 'sim_nao' },
    { id: 'm_15_deformacao_estrutural', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Houve deformação estrutural', responseType: 'sim_nao' },
    { id: 'm_15_falha_operacional', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Houve falha operacional', responseType: 'sim_nao' },
    { id: 'm_15_perda_estabilidade', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Houve perda de estabilidade', responseType: 'sim_nao' },
    { id: 'm_15_resultado_ensaio', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Resultado do ensaio', responseType: 'aprovado_reprovado' },
    { id: 'm_15_observacoes', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Observações de Ensaio de Carga', responseType: 'text' },

    // 16. REGISTRO FOTOGRÁFICO
    { id: 'm_16_vista_frontal', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista frontal do caminhão', responseType: 'photo' },
    { id: 'm_16_vista_traseira', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista traseira do caminhão', responseType: 'photo' },
    { id: 'm_16_vista_lat_dir', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral direita', responseType: 'photo' },
    { id: 'm_16_vista_lat_esq', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral esquerda', responseType: 'photo' },
    { id: 'm_16_placa_veiculo', category: '16. REGISTRO FOTOGRÁFICO', text: 'Placa do veículo', responseType: 'photo' },
    { id: 'm_16_num_serie_munck', category: '16. REGISTRO FOTOGRÁFICO', text: 'Número de série do Munck', responseType: 'photo' },
    { id: 'm_16_horimetro', category: '16. REGISTRO FOTOGRÁFICO', text: 'Horímetro', responseType: 'photo' },
    { id: 'm_16_cabine', category: '16. REGISTRO FOTOGRÁFICO', text: 'Cabine', responseType: 'photo' },
    { id: 'm_16_patolas', category: '16. REGISTRO FOTOGRÁFICO', text: 'Patolas', responseType: 'photo' },
    { id: 'm_16_lanca', category: '16. REGISTRO FOTOGRÁFICO', text: 'Lança', responseType: 'photo' },
    { id: 'm_16_cabo_gancho', category: '16. REGISTRO FOTOGRÁFICO', text: 'Cabo e gancho', responseType: 'photo' },
    { id: 'm_16_nao_conformidades', category: '16. REGISTRO FOTOGRÁFICO', text: 'Não conformidades encontradas', responseType: 'photo' }
  ],
  guindaste: [
    // 1. IDENTIFICAÇÃO DO EQUIPAMENTO
    { id: 'g_1_data_vistoria', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Data da vistoria', responseType: 'date' },
    { id: 'g_1_local_vistoria', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Local da vistoria', responseType: 'text' },
    { id: 'g_1_proprietario', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Proprietário', responseType: 'text' },
    { id: 'g_1_marca', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Marca', responseType: 'text' },
    { id: 'g_1_modelo', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Modelo', responseType: 'text' },
    { id: 'g_1_ano_fabricacao', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Ano de fabricação', responseType: 'number' },
    { id: 'g_1_num_serie', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Número de série', responseType: 'text' },
    { id: 'g_1_horimetro', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Horímetro', responseType: 'number' },
    { id: 'g_1_placa', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Placa (quando aplicável)', responseType: 'text' },
    { id: 'g_1_capacidade_nominal', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Capacidade nominal de carga (t)', responseType: 'number' },
    { id: 'g_1_comprimento_max_lanca', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Comprimento máximo da lança (m)', responseType: 'number' },
    { id: 'g_1_responsavel_vistoria', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Responsável pela vistoria', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'g_2_manual_operacao', category: '2. DOCUMENTAÇÃO', text: 'Manual de operação disponível', responseType: 'default' },
    { id: 'g_2_manual_manutencao', category: '2. DOCUMENTAÇÃO', text: 'Manual de manutenção disponível', responseType: 'default' },
    { id: 'g_2_plano_preventiva', category: '2. DOCUMENTAÇÃO', text: 'Plano de manutenção preventiva', responseType: 'default' },
    { id: 'g_2_registro_inspecoes', category: '2. DOCUMENTAÇÃO', text: 'Registro de inspeções periódicas', responseType: 'default' },
    { id: 'g_2_certificados_cabos', category: '2. DOCUMENTAÇÃO', text: 'Certificados de cabos e acessórios', responseType: 'default' },
    { id: 'g_2_art_laudo_anterior', category: '2. DOCUMENTAÇÃO', text: 'ART ou Laudo anterior disponível', responseType: 'default' },
    { id: 'g_2_tabela_carga', category: '2. DOCUMENTAÇÃO', text: 'Tabela de carga disponível na cabine', responseType: 'default' },
    { id: 'g_2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações de Documentação', responseType: 'text' },

    // 3. ESTRUTURA DO GUINDASTE
    { id: 'g_3_integridade_lanca', category: '3. ESTRUTURA DO GUINDASTE', text: 'Integridade estrutural da lança', responseType: 'ok_nok' },
    { id: 'g_3_ausencia_trincas', category: '3. ESTRUTURA DO GUINDASTE', text: 'Ausência de trincas na lança', responseType: 'ok_nok' },
    { id: 'g_3_ausencia_deformacoes', category: '3. ESTRUTURA DO GUINDASTE', text: 'Ausência de deformações estruturais', responseType: 'ok_nok' },
    { id: 'g_3_estado_soldas', category: '3. ESTRUTURA DO GUINDASTE', text: 'Estado das soldas', responseType: 'bom_reg_ruim' },
    { id: 'g_3_estado_chassi', category: '3. ESTRUTURA DO GUINDASTE', text: 'Estado do chassi', responseType: 'bom_reg_ruim' },
    { id: 'g_3_estado_fixacoes', category: '3. ESTRUTURA DO GUINDASTE', text: 'Estado das fixações', responseType: 'bom_reg_ruim' },
    { id: 'g_3_corrosao_estrutural', category: '3. ESTRUTURA DO GUINDASTE', text: 'Corrosão estrutural', responseType: 'ok_nok' },
    { id: 'g_3_observacoes', category: '3. ESTRUTURA DO GUINDASTE', text: 'Observações de Estrutura do Guindaste', responseType: 'text' },

    // 4. LANÇA TELESCÓPICA
    { id: 'g_4_extensao_lanca', category: '4. LANÇA TELESCÓPICA', text: 'Funcionamento da extensão da lança', responseType: 'ok_nok' },
    { id: 'g_4_alinhamento_lanca', category: '4. LANÇA TELESCÓPICA', text: 'Alinhamento da lança', responseType: 'ok_nok' },
    { id: 'g_4_desgaste_segmentos', category: '4. LANÇA TELESCÓPICA', text: 'Desgaste dos segmentos', responseType: 'bom_reg_ruim' },
    { id: 'g_4_patins_deslizantes', category: '4. LANÇA TELESCÓPICA', text: 'Estado dos patins deslizantes', responseType: 'bom_reg_ruim' },
    { id: 'g_4_vazamentos_hidraulicos', category: '4. LANÇA TELESCÓPICA', text: 'Vazamentos hidráulicos', responseType: 'ok_nok' },
    { id: 'g_4_curso_completo', category: '4. LANÇA TELESCÓPICA', text: 'Curso completo operacional', responseType: 'ok_nok' },
    { id: 'g_4_observacoes', category: '4. LANÇA TELESCÓPICA', text: 'Observações de Lança Telescópica', responseType: 'text' },

    // 5. SISTEMA DE ELEVAÇÃO
    { id: 'g_5_guincho_principal', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Funcionamento do guincho principal', responseType: 'ok_nok' },
    { id: 'g_5_guincho_auxiliar', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Funcionamento do guincho auxiliar', responseType: 'ok_nok_na' },
    { id: 'g_5_freio_guincho', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Freio do guincho', responseType: 'ok_nok' },
    { id: 'g_5_tambor_cabo', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Tambor do cabo', responseType: 'bom_reg_ruim' },
    { id: 'g_5_enrolamento_cabo', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Enrolamento correto do cabo', responseType: 'ok_nok' },
    { id: 'g_5_observacoes', category: '5. SISTEMA DE ELEVAÇÃO', text: 'Observações de Sistema de Elevação', responseType: 'text' },

    // 6. CABOS DE AÇO
    { id: 'g_6_fios_rompidos', category: '6. CABOS DE AÇO', text: 'Ausência de fios rompidos excessivos', responseType: 'default' },
    { id: 'g_6_amassamentos', category: '6. CABOS DE AÇO', text: 'Ausência de amassamentos', responseType: 'default' },
    { id: 'g_6_corrosao_severa', category: '6. CABOS DE AÇO', text: 'Ausência de corrosão severa', responseType: 'default' },
    { id: 'g_6_torcoes', category: '6. CABOS DE AÇO', text: 'Ausência de torções', responseType: 'default' },
    { id: 'g_6_fixacao_cabo', category: '6. CABOS DE AÇO', text: 'Fixação do cabo adequada', responseType: 'default' },
    { id: 'g_6_lubrificacao_adequada', category: '6. CABOS DE AÇO', text: 'Lubrificação adequada', responseType: 'default' },
    { id: 'g_6_estado_geral', category: '6. CABOS DE AÇO', text: 'Estado geral do cabo', responseType: 'bom_reg_ruim' },
    { id: 'g_6_observacoes', category: '6. CABOS DE AÇO', text: 'Observações de Cabos de Aço', responseType: 'text' },

    // 7. GANCHO E MOITÃO
    { id: 'g_7_gancho_deformacao', category: '7. GANCHO E MOITÃO', text: 'Gancho sem deformação', responseType: 'ok_nok' },
    { id: 'g_7_trava_seguranca', category: '7. GANCHO E MOITÃO', text: 'Trava de segurança instalada', responseType: 'default' },
    { id: 'g_7_desgaste_aceitavel', category: '7. GANCHO E MOITÃO', text: 'Desgaste do gancho aceitável', responseType: 'ok_nok' },
    { id: 'g_7_estado_moitao', category: '7. GANCHO E MOITÃO', text: 'Estado do moitão', responseType: 'bom_reg_ruim' },
    { id: 'g_7_giro_livre', category: '7. GANCHO E MOITÃO', text: 'Giro livre do gancho', responseType: 'ok_nok' },
    { id: 'g_7_observacoes', category: '7. GANCHO E MOITÃO', text: 'Observações de Gancho e Moitão', responseType: 'text' },

    // 8. SISTEMA HIDRÁULICO
    { id: 'g_8_vazamentos_hidraulicos', category: '8. SISTEMA HIDRÁULICO', text: 'Vazamentos hidráulicos', responseType: 'ok_nok' },
    { id: 'g_8_estado_mangueiras', category: '8. SISTEMA HIDRÁULICO', text: 'Estado das mangueiras', responseType: 'bom_reg_ruim' },
    { id: 'g_8_estado_cilindros', category: '8. SISTEMA HIDRÁULICO', text: 'Estado dos cilindros', responseType: 'bom_reg_ruim' },
    { id: 'g_8_estado_conexoes', category: '8. SISTEMA HIDRÁULICO', text: 'Estado das conexões', responseType: 'bom_reg_ruim' },
    { id: 'g_8_pressao_adequada', category: '8. SISTEMA HIDRÁULICO', text: 'Pressão operacional adequada', responseType: 'ok_nok' },
    { id: 'g_8_funcionamento_comandos', category: '8. SISTEMA HIDRÁULICO', text: 'Funcionamento dos comandos', responseType: 'ok_nok' },
    { id: 'g_8_observacoes', category: '8. SISTEMA HIDRÁULICO', text: 'Observações de Sistema Hidráulico', responseType: 'text' },

    // 9. PATOLAMENTO E ESTABILIZAÇÃO
    { id: 'g_9_funcionamento_estabilizadores', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Funcionamento dos estabilizadores', responseType: 'ok_nok' },
    { id: 'g_9_integridade_patolas', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Integridade das patolas', responseType: 'ok_nok' },
    { id: 'g_9_ausencia_vazamentos', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'g_9_travamento_adequado', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Travamento adequado', responseType: 'ok_nok' },
    { id: 'g_9_sapatas_apoio', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Sapatas de apoio disponíveis', responseType: 'default' },
    { id: 'g_9_nivel_estabilizacao', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Nível de estabilização adequado', responseType: 'ok_nok' },
    { id: 'g_9_observacoes', category: '9. PATOLAMENTO E ESTABILIZAÇÃO', text: 'Observações de Patolamento e Estabilização', responseType: 'text' },

    // 10. SISTEMA DE SEGURANÇA OPERACIONAL
    { id: 'g_10_lmi_operacional', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Limitador de carga (LMI) operacional', responseType: 'default' },
    { id: 'g_10_indicador_carga', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Indicador de carga operacional', responseType: 'default' },
    { id: 'g_10_angulo_lanca', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Indicador de ângulo da lança', responseType: 'default' },
    { id: 'g_10_comprimento_lanca', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Indicador de comprimento da lança', responseType: 'default' },
    { id: 'g_10_alarme_sonoro', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Alarme sonoro operacional', responseType: 'default' },
    { id: 'g_10_botao_emergencia', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Botão de emergência operacional', responseType: 'default' },
    { id: 'g_10_anti_two_block', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Dispositivo anti-duas-bloqueio (Anti Two Block)', responseType: 'default' },
    { id: 'g_10_bloqueio_sobrecarga', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Sistema de bloqueio de sobrecarga', responseType: 'default' },
    { id: 'g_10_observacoes', category: '10. SISTEMA DE SEGURANÇA OPERACIONAL', text: 'Observações de Segurança Operacional', responseType: 'text' },

    // 11. SISTEMA ELÉTRICO
    { id: 'g_11_estado_bateria', category: '11. SISTEMA ELÉTRICO', text: 'Estado da bateria', responseType: 'bom_reg_ruim' },
    { id: 'g_11_fixacao_bateria', category: '11. SISTEMA ELÉTRICO', text: 'Fixação da bateria', responseType: 'ok_nok' },
    { id: 'g_11_alternador', category: '11. SISTEMA ELÉTRICO', text: 'Alternador', responseType: 'ok_nok' },
    { id: 'g_11_chicotes_eletricos', category: '11. SISTEMA ELÉTRICO', text: 'Chicotes elétricos', responseType: 'bom_reg_ruim' },
    { id: 'g_11_painel_operacional', category: '11. SISTEMA ELÉTRICO', text: 'Painel operacional', responseType: 'ok_nok' },
    { id: 'g_11_luzes_advertencia', category: '11. SISTEMA ELÉTRICO', text: 'Luzes de advertência', responseType: 'ok_nok' },
    { id: 'g_11_observacoes', category: '11. SISTEMA ELÉTRICO', text: 'Observações de Sistema Elétrico', responseType: 'text' },

    // 12. CABINE DO OPERADOR
    { id: 'g_12_estado_cabine', category: '12. CABINE DO OPERADOR', text: 'Estado geral da cabine', responseType: 'bom_reg_ruim' },
    { id: 'g_12_banco_operador', category: '12. CABINE DO OPERADOR', text: 'Banco do operador', responseType: 'bom_reg_ruim' },
    { id: 'g_12_cinto_seguranca', category: '12. CABINE DO OPERADOR', text: 'Cinto de segurança', responseType: 'default' },
    { id: 'g_12_vidros_integros', category: '12. CABINE DO OPERADOR', text: 'Vidros íntegros', responseType: 'ok_nok' },
    { id: 'g_12_limpador_parabrisa', category: '12. CABINE DO OPERADOR', text: 'Limpador de para-brisa', responseType: 'ok_nok' },
    { id: 'g_12_retrovisores', category: '12. CABINE DO OPERADOR', text: 'Retrovisores', responseType: 'ok_nok' },
    { id: 'g_12_ar_condicionado', category: '12. CABINE DO OPERADOR', text: 'Ar-condicionado', responseType: 'ok_nok' },
    { id: 'g_12_buzina', category: '12. CABINE DO OPERADOR', text: 'Buzina', responseType: 'ok_nok' },
    { id: 'g_12_observacoes', category: '12. CABINE DO OPERADOR', text: 'Observações de Cabine do Operador', responseType: 'text' },

    // 13. SEGURANÇA E NR-12
    { id: 'g_13_sinalizacao_seguranca', category: '13. SEGURANÇA E NR-12', text: 'Sinalização de segurança', responseType: 'default' },
    { id: 'g_13_adesivos_advertencia', category: '13. SEGURANÇA E NR-12', text: 'Adesivos de advertência', responseType: 'default' },
    { id: 'g_13_extintor_valido', category: '13. SEGURANÇA E NR-12', text: 'Extintor válido', responseType: 'default' },
    { id: 'g_13_protecoes_mecanicas', category: '13. SEGURANÇA E NR-12', text: 'Proteções mecânicas instaladas', responseType: 'default' },
    { id: 'g_13_tabela_carga_legivel', category: '13. SEGURANÇA E NR-12', text: 'Tabela de carga legível', responseType: 'default' },
    { id: 'g_13_procedimentos_disponiveis', category: '13. SEGURANÇA E NR-12', text: 'Procedimentos operacionais disponíveis', responseType: 'default' },
    { id: 'g_13_observacoes', category: '13. SEGURANÇA E NR-12', text: 'Observações de Segurança e NR-12', responseType: 'text' },

    // 14. TESTE OPERACIONAL
    { id: 'g_14_giro_superestrutura', category: '14. TESTE OPERACIONAL', text: 'Giro da superestrutura', responseType: 'ok_nok' },
    { id: 'g_14_elevacao_carga', category: '14. TESTE OPERACIONAL', text: 'Elevação da carga', responseType: 'ok_nok' },
    { id: 'g_14_descida_carga', category: '14. TESTE OPERACIONAL', text: 'Descida da carga', responseType: 'ok_nok' },
    { id: 'g_14_extensao_lanca', category: '14. TESTE OPERACIONAL', text: 'Extensão da lança', responseType: 'ok_nok' },
    { id: 'g_14_retracao_lanca', category: '14. TESTE OPERACIONAL', text: 'Retração da lança', responseType: 'ok_nok' },
    { id: 'g_14_funcionamento_estabilizadores_op', category: '14. TESTE OPERACIONAL', text: 'Funcionamento dos estabilizadores', responseType: 'ok_nok' },
    { id: 'g_14_ausenceia_ruidos', category: '14. TESTE OPERACIONAL', text: 'Ausência de ruídos anormais', responseType: 'ok_nok' },
    { id: 'g_14_ausencia_vibracoes', category: '14. TESTE OPERACIONAL', text: 'Ausência de vibrações excessivas', responseType: 'ok_nok' },
    { id: 'g_14_desempenho_geral', category: '14. TESTE OPERACIONAL', text: 'Desempenho geral', responseType: 'bom_reg_ruim' },
    { id: 'g_14_observacoes', category: '14. TESTE OPERACIONAL', text: 'Observações de Teste Operacional', responseType: 'text' },

    // 15. ENSAIO DE CARGA (QUANDO APLICÁVEL)
    { id: 'g_15_carga_teste', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Carga de teste aplicada (kg)', responseType: 'number' },
    { id: 'g_15_percentual_carga', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Percentual da carga nominal (%)', responseType: 'number' },
    { id: 'g_15_suportou_carga', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Equipamento suportou a carga', responseType: 'sim_nao' },
    { id: 'g_15_deformacao_estrutural', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Houve deformação estrutural', responseType: 'sim_nao' },
    { id: 'g_15_falhas_operacionais', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Houve falhas operacionais', responseType: 'sim_nao' },
    { id: 'g_15_resultado_ensaio', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Resultado do ensaio', responseType: 'aprovado_reprovado' },
    { id: 'g_15_observacoes', category: '15. ENSAIO DE CARGA (QUANDO APLICÁVEL)', text: 'Observações de Ensaio de Carga', responseType: 'text' },

    // 16. REGISTRO FOTOGRÁFICO
    { id: 'g_16_vista_frontal', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista frontal', responseType: 'photo' },
    { id: 'g_16_vista_traseira', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista traseira', responseType: 'photo' },
    { id: 'g_16_vista_lat_dir', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral direita', responseType: 'photo' },
    { id: 'g_16_vista_lat_esq', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral esquerda', responseType: 'photo' },
    { id: 'g_16_num_serie_foto', category: '16. REGISTRO FOTOGRÁFICO', text: 'Número de série', responseType: 'photo' },
    { id: 'g_16_cabine', category: '16. REGISTRO FOTOGRÁFICO', text: 'Cabine', responseType: 'photo' },
    { id: 'g_16_lanca', category: '16. REGISTRO FOTOGRÁFICO', text: 'Lança', responseType: 'photo' },
    { id: 'g_16_cabo_aco', category: '16. REGISTRO FOTOGRÁFICO', text: 'Cabo de aço', responseType: 'photo' },
    { id: 'g_16_gancho_moitao', category: '16. REGISTRO FOTOGRÁFICO', text: 'Gancho/Moitão', responseType: 'photo' },
    { id: 'g_16_patolas', category: '16. REGISTRO FOTOGRÁFICO', text: 'Patolas', responseType: 'photo' },
    { id: 'g_16_sistema_hidraulico', category: '16. REGISTRO FOTOGRÁFICO', text: 'Sistema hidráulico', responseType: 'photo' },
    { id: 'g_16_nao_conformidades', category: '16. REGISTRO FOTOGRÁFICO', text: 'Não conformidades encontradas', responseType: 'photo' }
  ],
  maquinas_pesadas: [
    // 1. IDENTIFICAÇÃO DO EQUIPAMENTO
    { id: 'mp_1_data_vistoria', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Data da vistoria', responseType: 'date' },
    { id: 'mp_1_local_vistoria', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Local da vistoria', responseType: 'text' },
    { id: 'mp_1_proprietario', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Proprietário', responseType: 'text' },
    { id: 'mp_1_marca', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Marca', responseType: 'text' },
    { id: 'mp_1_modelo', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Modelo', responseType: 'text' },
    { id: 'mp_1_ano_fabricacao', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Ano de fabricação', responseType: 'number' },
    { id: 'mp_1_num_serie', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Número de série', responseType: 'text' },
    { id: 'mp_1_horimetro', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Horímetro', responseType: 'number' },
    { id: 'mp_1_placa', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Placa', responseType: 'text' },
    { id: 'mp_1_implemento_acoplado', category: '1. IDENTIFICAÇÃO DO EQUIPAMENTO', text: 'Implemento acoplado', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'mp_2_manual_operacao', category: '2. DOCUMENTAÇÃO', text: 'Manual de operação disponível', responseType: 'default' },
    { id: 'mp_2_manual_manutencao', category: '2. DOCUMENTAÇÃO', text: 'Manual de manutenção disponível', responseType: 'default' },
    { id: 'mp_2_plano_preventiva', category: '2. DOCUMENTAÇÃO', text: 'Plano de manutenção preventiva', responseType: 'default' },
    { id: 'mp_2_historico_atualizado', category: '2. DOCUMENTAÇÃO', text: 'Histórico de manutenção atualizado', responseType: 'default' },
    { id: 'mp_2_certificados_inspecao', category: '2. DOCUMENTAÇÃO', text: 'Certificados de inspeção disponíveis', responseType: 'default' },
    { id: 'mp_2_art_laudo_anterior', category: '2. DOCUMENTAÇÃO', text: 'ART ou Laudo anterior disponível', responseType: 'default' },
    { id: 'mp_2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações de Documentação', responseType: 'text' },

    // 3. ESTRUTURA GERAL
    { id: 'mp_3_chassi_sem_trincas', category: '3. ESTRUTURA GERAL', text: 'Chassi sem trincas', responseType: 'ok_nok' },
    { id: 'mp_3_chassi_sem_deformacoes', category: '3. ESTRUTURA GERAL', text: 'Chassi sem deformações', responseType: 'ok_nok' },
    { id: 'mp_3_ausencia_corrosao', category: '3. ESTRUTURA GERAL', text: 'Ausência de corrosão severa', responseType: 'ok_nok' },
    { id: 'mp_3_integridade_soldas', category: '3. ESTRUTURA GERAL', text: 'Integridade das soldas', responseType: 'bom_reg_ruim' },
    { id: 'mp_3_estado_geral_estrutura', category: '3. ESTRUTURA GERAL', text: 'Estado geral da estrutura', responseType: 'bom_reg_ruim' },
    { id: 'mp_3_fixacoes_parafusos', category: '3. ESTRUTURA GERAL', text: 'Fixações e parafusos', responseType: 'bom_reg_ruim' },
    { id: 'mp_3_observacoes', category: '3. ESTRUTURA GERAL', text: 'Observações de Estrutura', responseType: 'text' },

    // 4. MOTOR
    { id: 'mp_4_vazamento_oleo', category: '4. MOTOR', text: 'Vazamento de óleo', responseType: 'ok_nok' },
    { id: 'mp_4_vazamento_combustivel', category: '4. MOTOR', text: 'Vazamento de combustível', responseType: 'ok_nok' },
    { id: 'mp_4_vazamento_arrefecimento', category: '4. MOTOR', text: 'Vazamento de arrefecimento', responseType: 'ok_nok' },
    { id: 'mp_4_correias', category: '4. MOTOR', text: 'Correias em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'mp_4_mangueiras', category: '4. MOTOR', text: 'Mangueiras em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'mp_4_partida_normal', category: '4. MOTOR', text: 'Partida normal', responseType: 'ok_nok' },
    { id: 'mp_4_marcha_lenta', category: '4. MOTOR', text: 'Marcha lenta estável', responseType: 'ok_nok' },
    { id: 'mp_4_ruidos_anormais', category: '4. MOTOR', text: 'Ruídos anormais', responseType: 'ok_nok' },
    { id: 'mp_4_emissao_fumaca', category: '4. MOTOR', text: 'Emissão excessiva de fumaça', responseType: 'ok_nok' },
    { id: 'mp_4_temperatura_normal', category: '4. MOTOR', text: 'Temperatura operacional normal', responseType: 'ok_nok' },
    { id: 'mp_4_observacoes', category: '4. MOTOR', text: 'Observações de Motor', responseType: 'text' },

    // 5. SISTEMA HIDRÁULICO
    { id: 'mp_5_vazamentos_hidraulicos', category: '5. SISTEMA HIDRÁULICO', text: 'Vazamentos hidráulicos', responseType: 'ok_nok' },
    { id: 'mp_5_estado_mangueiras', category: '5. SISTEMA HIDRÁULICO', text: 'Estado das mangueiras', responseType: 'bom_reg_ruim' },
    { id: 'mp_5_estado_tubulacoes', category: '5. SISTEMA HIDRÁULICO', text: 'Estado das tubulações', responseType: 'bom_reg_ruim' },
    { id: 'mp_5_estado_cilindros', category: '5. SISTEMA HIDRÁULICO', text: 'Estado dos cilindros', responseType: 'bom_reg_ruim' },
    { id: 'mp_5_pressao_adequada', category: '5. SISTEMA HIDRÁULICO', text: 'Pressão adequada', responseType: 'ok_nok' },
    { id: 'mp_5_funcionamento_comandos', category: '5. SISTEMA HIDRÁULICO', text: 'Funcionamento dos comandos', responseType: 'ok_nok' },
    { id: 'mp_5_observacoes', category: '5. SISTEMA HIDRÁULICO', text: 'Observações de Hidráulico', responseType: 'text' },

    // 6. IMPLEMENTOS
    { id: 'mp_6_integridade_lanca', category: '6. IMPLEMENTOS', text: 'Integridade da lança', responseType: 'ok_nok' },
    { id: 'mp_6_integridade_braco', category: '6. IMPLEMENTOS', text: 'Integridade do braço', responseType: 'ok_nok' },
    { id: 'mp_6_estado_soldas', category: '6. IMPLEMENTOS', text: 'Estado das soldas', responseType: 'bom_reg_ruim' },
    { id: 'mp_6_folga_pinos_buchas', category: '6. IMPLEMENTOS', text: 'Folga de pinos e buchas', responseType: 'bom_reg_ruim' },
    { id: 'mp_6_lubrificacao_adequada', category: '6. IMPLEMENTOS', text: 'Lubrificação adequada', responseType: 'ok_nok' },
    { id: 'mp_6_estado_cacamba', category: '6. IMPLEMENTOS', text: 'Estado da caçamba/concha', responseType: 'bom_reg_ruim' },
    { id: 'mp_6_estado_dentes', category: '6. IMPLEMENTOS', text: 'Estado dos dentes', responseType: 'bom_reg_ruim' },
    { id: 'mp_6_observacoes', category: '6. IMPLEMENTOS', text: 'Observações de Implementos', responseType: 'text' },

    // 7. TRANSMISSÃO
    { id: 'mp_7_vazamentos', category: '7. TRANSMISSÃO', text: 'Vazamentos', responseType: 'ok_nok' },
    { id: 'mp_7_funcionamento_transmissao', category: '7. TRANSMISSÃO', text: 'Funcionamento da transmissão', responseType: 'ok_nok' },
    { id: 'mp_7_troca_marchas', category: '7. TRANSMISSÃO', text: 'Troca de marchas', responseType: 'ok_nok' },
    { id: 'mp_7_diferenciais', category: '7. TRANSMISSÃO', text: 'Diferenciais', responseType: 'bom_reg_ruim' },
    { id: 'mp_7_redutores_finais', category: '7. TRANSMISSÃO', text: 'Redutores finais', responseType: 'bom_reg_ruim' },
    { id: 'mp_7_observacoes', category: '7. TRANSMISSÃO', text: 'Observações de Transmissão', responseType: 'text' },

    // 8. DIREÇÃO
    { id: 'mp_8_funcionamento_direcao', category: '8. DIREÇÃO', text: 'Funcionamento da direção', responseType: 'ok_nok' },
    { id: 'mp_8_folgas_excessivas', category: '8. DIREÇÃO', text: 'Folgas excessivas', responseType: 'ok_nok' },
    { id: 'mp_8_vazamentos', category: '8. DIREÇÃO', text: 'Vazamentos', responseType: 'ok_nok' },
    { id: 'mp_8_estado_componentes', category: '8. DIREÇÃO', text: 'Estado dos componentes', responseType: 'bom_reg_ruim' },
    { id: 'mp_8_observacoes', category: '8. DIREÇÃO', text: 'Observações de Direção', responseType: 'text' },

    // 9. SISTEMA DE FREIOS
    { id: 'mp_9_freio_servico', category: '9. SISTEMA DE FREIOS', text: 'Freio de serviço', responseType: 'ok_nok' },
    { id: 'mp_9_freio_estacionamento', category: '9. SISTEMA DE FREIOS', text: 'Freio de estacionamento', responseType: 'ok_nok' },
    { id: 'mp_9_freio_emergencia', category: '9. SISTEMA DE FREIOS', text: 'Freio de emergência', responseType: 'ok_nok' },
    { id: 'mp_9_vazamentos', category: '9. SISTEMA DE FREIOS', text: 'Vazamentos', responseType: 'ok_nok' },
    { id: 'mp_9_observacoes', category: '9. SISTEMA DE FREIOS', text: 'Observações de Freios', responseType: 'text' },

    // 10. SISTEMA ELÉTRICO
    { id: 'mp_10_estado_bateria', category: '10. SISTEMA ELÉTRICO', text: 'Estado da bateria', responseType: 'bom_reg_ruim' },
    { id: 'mp_10_fixacao_bateria', category: '10. SISTEMA ELÉTRICO', text: 'Fixação da bateria', responseType: 'ok_nok' },
    { id: 'mp_10_alternador', category: '10. SISTEMA ELÉTRICO', text: 'Alternador', responseType: 'ok_nok' },
    { id: 'mp_10_motor_partida', category: '10. SISTEMA ELÉTRICO', text: 'Motor de partida', responseType: 'ok_nok' },
    { id: 'mp_10_chicote_eletrico', category: '10. SISTEMA ELÉTRICO', text: 'Chicote elétrico', responseType: 'bom_reg_ruim' },
    { id: 'mp_10_painel_instrumentos', category: '10. SISTEMA ELÉTRICO', text: 'Painel de instrumentos', responseType: 'ok_nok' },
    { id: 'mp_10_luzes_indicadoras', category: '10. SISTEMA ELÉTRICO', text: 'Luzes indicadoras', responseType: 'ok_nok' },
    { id: 'mp_10_alarmes_operacionais', category: '10. SISTEMA ELÉTRICO', text: 'Alarmes operacionais', responseType: 'ok_nok' },
    { id: 'mp_10_observacoes', category: '10. SISTEMA ELÉTRICO', text: 'Observações de Elétrico', responseType: 'text' },

    // 11. CABINE
    { id: 'mp_11_estrutura_cabine', category: '11. CABINE', text: 'Estrutura da cabine', responseType: 'bom_reg_ruim' },
    { id: 'mp_11_vidros', category: '11. CABINE', text: 'Vidros', responseType: 'bom_reg_ruim' },
    { id: 'mp_11_portas', category: '11. CABINE', text: 'Portas', responseType: 'ok_nok' },
    { id: 'mp_11_banco_operador', category: '11. CABINE', text: 'Banco do operador', responseType: 'bom_reg_ruim' },
    { id: 'mp_11_cinto_seguranca', category: '11. CABINE', text: 'Cinto de segurança', responseType: 'default' },
    { id: 'mp_11_espelhos_retrovisores', category: '11. CABINE', text: 'Espelhos retrovisores', responseType: 'ok_nok' },
    { id: 'mp_11_limpador_parabrisa', category: '11. CABINE', text: 'Limpador de para-brisa', responseType: 'ok_nok' },
    { id: 'mp_11_ar_condicionado', category: '11. CABINE', text: 'Ar-condicionado', responseType: 'ok_nok' },
    { id: 'mp_11_buzina', category: '11. CABINE', text: 'Buzina', responseType: 'ok_nok' },
    { id: 'mp_11_observacoes', category: '11. CABINE', text: 'Observações de Cabine', responseType: 'text' },

    // 12. SEGURANÇA (NR-12)
    { id: 'mp_12_sinalizacoes_seguranca', category: '12. SEGURANÇA (NR-12)', text: 'Sinalizações de segurança', responseType: 'default' },
    { id: 'mp_12_etiquetas_advertencia', category: '12. SEGURANÇA (NR-12)', text: 'Etiquetas de advertência', responseType: 'default' },
    { id: 'mp_12_protecoes_mecanicas', category: '12. SEGURANÇA (NR-12)', text: 'Proteções mecânicas', responseType: 'default' },
    { id: 'mp_12_estrutura_rops_fops', category: '12. SEGURANÇA (NR-12)', text: 'Estrutura ROPS/FOPS', responseType: 'default' },
    { id: 'mp_12_alarme_re', category: '12. SEGURANÇA (NR-12)', text: 'Alarme de ré', responseType: 'ok_nok' },
    { id: 'mp_12_giroflex', category: '12. SEGURANÇA (NR-12)', text: 'Giroflex', responseType: 'ok_nok' },
    { id: 'mp_12_luzes_trabalho', category: '12. SEGURANÇA (NR-12)', text: 'Luzes de trabalho', responseType: 'ok_nok' },
    { id: 'mp_12_extintor_valido', category: '12. SEGURANÇA (NR-12)', text: 'Extintor válido', responseType: 'default' },
    { id: 'mp_12_saida_emergencia', category: '12. SEGURANÇA (NR-12)', text: 'Saída de emergência', responseType: 'default' },
    { id: 'mp_12_observacoes', category: '12. SEGURANÇA (NR-12)', text: 'Observações de Segurança', responseType: 'text' },

    // 13. PNEUS / MATERIAL RODANTE
    { id: 'mp_13_pneu_estado', category: '13. PNEUS / MATERIAL RODANTE', text: 'Estado dos pneus (Máquinas Pneumáticas)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_pneu_desgaste', category: '13. PNEUS / MATERIAL RODANTE', text: 'Desgaste uniforme (Máquinas Pneumáticas)', responseType: 'ok_nok' },
    { id: 'mp_13_pneu_cortes', category: '13. PNEUS / MATERIAL RODANTE', text: 'Cortes ou avarias (Máquinas Pneumáticas)', responseType: 'ok_nok' },
    { id: 'mp_13_roda_estado', category: '13. PNEUS / MATERIAL RODANTE', text: 'Estado das rodas (Máquinas Pneumáticas)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_esteira_sapatas', category: '13. PNEUS / MATERIAL RODANTE', text: 'Sapatas (Máquinas de Esteira)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_esteira_correntes', category: '13. PNEUS / MATERIAL RODANTE', text: 'Correntes (Máquinas de Esteira)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_esteira_roletes', category: '13. PNEUS / MATERIAL RODANTE', text: 'Roletes (Máquinas de Esteira)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_esteira_rodas_guia', category: '13. PNEUS / MATERIAL RODANTE', text: 'Rodas-guia (Máquinas de Esteira)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_esteira_tensionadores', category: '13. PNEUS / MATERIAL RODANTE', text: 'Tensionadores (Máquinas de Esteira)', responseType: 'bom_reg_ruim' },
    { id: 'mp_13_observacoes', category: '13. PNEUS / MATERIAL RODANTE', text: 'Observações de Rodamento', responseType: 'text' },

    // 14. TESTE OPERACIONAL
    { id: 'mp_14_deslocamento', category: '14. TESTE OPERACIONAL', text: 'Deslocamento', responseType: 'ok_nok' },
    { id: 'mp_14_elevacao', category: '14. TESTE OPERACIONAL', text: 'Elevação', responseType: 'ok_nok' },
    { id: 'mp_14_giro', category: '14. TESTE OPERACIONAL', text: 'Giro', responseType: 'ok_nok' },
    { id: 'mp_14_movimentos_hidraulicos', category: '14. TESTE OPERACIONAL', text: 'Movimentos hidráulicos', responseType: 'ok_nok' },
    { id: 'mp_14_vibracoes_excessivas', category: '14. TESTE OPERACIONAL', text: 'Vibrações excessivas', responseType: 'ok_nok' },
    { id: 'mp_14_ruidos_anormais', category: '14. TESTE OPERACIONAL', text: 'Ruídos anormais', responseType: 'ok_nok' },
    { id: 'mp_14_desempenho_geral', category: '14. TESTE OPERACIONAL', text: 'Desempenho geral', responseType: 'bom_reg_ruim' },
    { id: 'mp_14_observacoes', category: '14. TESTE OPERACIONAL', text: 'Observações de Teste', responseType: 'text' },

    // 15. REGISTRO FOTOGRÁFICO
    { id: 'mp_15_foto_frontal', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto frontal', responseType: 'photo' },
    { id: 'mp_15_foto_traseira', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto traseira', responseType: 'photo' },
    { id: 'mp_15_foto_lat_dir', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto lateral direita', responseType: 'photo' },
    { id: 'mp_15_foto_lat_esq', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto lateral esquerda', responseType: 'photo' },
    { id: 'mp_15_foto_num_serie', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto do número de série', responseType: 'photo' },
    { id: 'mp_15_foto_horimetro', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto do horímetro', responseType: 'photo' },
    { id: 'mp_15_foto_cabine', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto da cabine', responseType: 'photo' },
    { id: 'mp_15_foto_motor', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto do motor', responseType: 'photo' },
    { id: 'mp_15_foto_sistema_hidraulico', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto do sistema hidráulico', responseType: 'photo' },
    { id: 'mp_15_foto_pneus_esteiras', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto dos pneus/esteiras', responseType: 'photo' },
    { id: 'mp_15_foto_nao_conformidades', category: '15. REGISTRO FOTOGRÁFICO', text: 'Foto das não conformidades', responseType: 'photo' }
  ],
  playground: [
    // 1. IDENTIFICAÇÃO DO PLAYGROUND
    { id: 'play_1_data_inspecao', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Data da inspeção', responseType: 'date' },
    { id: 'play_1_local_inspecao', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Local da inspeção', responseType: 'text' },
    { id: 'play_1_proprietario_responsavel', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Proprietário/Responsável', responseType: 'text' },
    { id: 'play_1_nome_unidade', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Nome da unidade', responseType: 'text' },
    { id: 'play_1_area_total', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Área total do playground (m²)', responseType: 'number' },
    { id: 'play_1_ambiente', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Ambiente', responseType: 'ambiente_playground' },
    { id: 'play_1_faixa_etaria', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Faixa etária prevista', responseType: 'text' },
    { id: 'play_1_qtd_brinquedos', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Quantidade de brinquedos', responseType: 'number' },
    { id: 'play_1_responsavel_inspecao', category: '1. IDENTIFICAÇÃO DO PLAYGROUND', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'play_2_projeto', category: '2. DOCUMENTAÇÃO', text: 'Projeto disponível', responseType: 'c_nc_na' },
    { id: 'play_2_manual', category: '2. DOCUMENTAÇÃO', text: 'Manual dos equipamentos disponível', responseType: 'c_nc_na' },
    { id: 'play_2_certificados', category: '2. DOCUMENTAÇÃO', text: 'Certificados dos equipamentos disponíveis', responseType: 'c_nc_na' },
    { id: 'play_2_plano_manutencao', category: '2. DOCUMENTAÇÃO', text: 'Plano de manutenção disponível', responseType: 'c_nc_na' },
    { id: 'play_2_registro_inspecoes', category: '2. DOCUMENTAÇÃO', text: 'Registro de inspeções anteriores', responseType: 'c_nc_na' },
    { id: 'play_2_identificacao_fabricantes', category: '2. DOCUMENTAÇÃO', text: 'Identificação dos fabricantes disponível', responseType: 'c_nc_na' },
    { id: 'play_2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 3. CONDIÇÕES GERAIS DA ÁREA
    { id: 'play_3_limpa_organizada', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Área limpa e organizada', responseType: 'c_nc' },
    { id: 'play_3_ausencia_residuos', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Ausência de resíduos perigosos', responseType: 'c_nc' },
    { id: 'play_3_ausencia_cortantes', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Ausência de objetos cortantes', responseType: 'c_nc' },
    { id: 'play_3_ausencia_obstaculos', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Ausência de obstáculos perigosos', responseType: 'c_nc' },
    { id: 'play_3_cercamento', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Cercamento adequado (quando aplicável)', responseType: 'c_nc_na' },
    { id: 'play_3_controle_acesso', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Controle de acesso adequado', responseType: 'c_nc_na' },
    { id: 'play_3_estado_geral', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Estado geral da área', responseType: 'bom_reg_ruim' },
    { id: 'play_3_observacoes', category: '3. CONDIÇÕES GERAIS DA ÁREA', text: 'Observações', responseType: 'text_long' },

    // 4. PISO DE AMORTECIMENTO DE IMPACTO
    { id: 'play_4_instalado_toda_area', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Piso instalado em toda área de queda', responseType: 'c_nc' },
    { id: 'play_4_sem_falhas', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Piso sem falhas ou buracos', responseType: 'c_nc' },
    { id: 'play_4_sem_desgaste', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Piso sem desgaste excessivo', responseType: 'c_nc' },
    { id: 'play_4_antiderrapante', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Piso antiderrapante', responseType: 'c_nc' },
    { id: 'play_4_espessura_adequada', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Espessura adequada para altura de queda', responseType: 'c_nc' },
    { id: 'play_4_estado_geral', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Estado geral do piso', responseType: 'bom_reg_ruim' },
    { id: 'play_4_observacoes', category: '4. PISO DE AMORTECIMENTO DE IMPACTO', text: 'Observações', responseType: 'text_long' },

    // 5. ESTRUTURA DOS EQUIPAMENTOS
    { id: 'play_5_sem_trincas', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estruturas sem trincas', responseType: 'ok_nok' },
    { id: 'play_5_sem_deformacoes', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estruturas sem deformações', responseType: 'ok_nok' },
    { id: 'play_5_sem_corrosao', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estruturas sem corrosão excessiva', responseType: 'ok_nok' },
    { id: 'play_5_sem_apodrecimento', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estruturas sem apodrecimento (madeira)', responseType: 'ok_nok' },
    { id: 'play_5_fixacoes_adequadas', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Fixações adequadas', responseType: 'c_nc' },
    { id: 'play_5_estabilidade', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estabilidade adequada', responseType: 'c_nc' },
    { id: 'play_5_estado_geral', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Estado geral das estruturas', responseType: 'bom_reg_ruim' },
    { id: 'play_5_observacoes', category: '5. ESTRUTURA DOS EQUIPAMENTOS', text: 'Observações', responseType: 'text_long' },

    // 6. PARAFUSOS, FIXADORES E CONEXÕES
    { id: 'play_6_parafusos_apertados', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Parafusos apertados', responseType: 'c_nc' },
    { id: 'play_6_porcas_protegidas', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Porcas protegidas', responseType: 'c_nc' },
    { id: 'play_6_sem_partes_salientes', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Ausência de partes salientes', responseType: 'c_nc' },
    { id: 'play_6_sem_arestas_cortantes', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Ausência de arestas cortantes', responseType: 'c_nc' },
    { id: 'play_6_tampas_protecao', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Tampas de proteção instaladas', responseType: 'c_nc' },
    { id: 'play_6_estado_geral', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Estado geral das conexões', responseType: 'bom_reg_ruim' },
    { id: 'play_6_observacoes', category: '6. PARAFUSOS, FIXADORES E CONEXÕES', text: 'Observações', responseType: 'text_long' },

    // 7. ESCORREGADORES
    { id: 'play_7_estrutura_integra', category: '7. ESCORREGADORES', text: 'Estrutura íntegra', responseType: 'c_nc_na' },
    { id: 'play_7_superficie_sem_rachaduras', category: '7. ESCORREGADORES', text: 'Superfície sem rachaduras', responseType: 'c_nc_na' },
    { id: 'play_7_laterais_protecao', category: '7. ESCORREGADORES', text: 'Laterais de proteção adequadas', responseType: 'c_nc_na' },
    { id: 'play_7_area_saida_segura', category: '7. ESCORREGADORES', text: 'Área de saída segura', responseType: 'c_nc_na' },
    { id: 'play_7_fixacao_adequada', category: '7. ESCORREGADORES', text: 'Fixação adequada', responseType: 'c_nc_na' },
    { id: 'play_7_estado_geral', category: '7. ESCORREGADORES', text: 'Estado geral', responseType: 'bom_reg_ruim_na' },
    { id: 'play_7_observacoes', category: '7. ESCORREGADORES', text: 'Observações', responseType: 'text_long' },

    // 8. BALANÇOS
    { id: 'play_8_correntes_cabos', category: '8. BALANÇOS', text: 'Correntes ou cabos íntegros', responseType: 'c_nc_na' },
    { id: 'play_8_assentos_integros', category: '8. BALANÇOS', text: 'Assentos íntegros', responseType: 'c_nc_na' },
    { id: 'play_8_fixacoes_adequadas', category: '8. BALANÇOS', text: 'Fixações adequadas', responseType: 'c_nc_na' },
    { id: 'play_8_sem_desgaste', category: '8. BALANÇOS', text: 'Ausência de desgaste excessivo', responseType: 'c_nc_na' },
    { id: 'play_8_distanciamento', category: '8. BALANÇOS', text: 'Distanciamento adequado', responseType: 'c_nc_na' },
    { id: 'play_8_estado_geral', category: '8. BALANÇOS', text: 'Estado geral', responseType: 'bom_reg_ruim_na' },
    { id: 'play_8_observacoes', category: '8. BALANÇOS', text: 'Observações', responseType: 'text_long' },

    // 9. GANGORRAS
    { id: 'play_9_estrutura_integra', category: '9. GANGORRAS', text: 'Estrutura íntegra', responseType: 'c_nc_na' },
    { id: 'play_9_assentos_integros', category: '9. GANGORRAS', text: 'Assentos íntegros', responseType: 'c_nc_na' },
    { id: 'play_9_limitadores_impacto', category: '9. GANGORRAS', text: 'Limitadores de impacto presentes', responseType: 'c_nc_na' },
    { id: 'play_9_pegadores', category: '9. GANGORRAS', text: 'Pegadores adequados', responseType: 'c_nc_na' },
    { id: 'play_9_fixacao_adequada', category: '9. GANGORRAS', text: 'Fixação adequada', responseType: 'c_nc_na' },
    { id: 'play_9_estado_geral', category: '9. GANGORRAS', text: 'Estado geral', responseType: 'bom_reg_ruim_na' },
    { id: 'play_9_observacoes', category: '9. GANGORRAS', text: 'Observações', responseType: 'text_long' },

    // 10. BRINQUEDOS DE ESCALADA E TORRES
    { id: 'play_10_plataformas_integras', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Plataformas íntegras', responseType: 'c_nc_na' },
    { id: 'play_10_guarda_corpos', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Guarda-corpos adequados', responseType: 'c_nc_na' },
    { id: 'play_10_corrimaos', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Corrimãos adequados', responseType: 'c_nc_na' },
    { id: 'play_10_escadas_seguras', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Escadas seguras', responseType: 'c_nc_na' },
    { id: 'play_10_redes_cordas', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Redes e cordas íntegras', responseType: 'c_nc_na' },
    { id: 'play_10_estado_geral', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Estado geral', responseType: 'bom_reg_ruim_na' },
    { id: 'play_10_observacoes', category: '10. BRINQUEDOS DE ESCALADA E TORRES', text: 'Observações', responseType: 'text_long' },

    // 11. SEGURANÇA INFANTIL
    { id: 'play_11_sem_esmagamento', category: '11. SEGURANÇA INFANTIL', text: 'Ausência de pontos de esmagamento', responseType: 'c_nc' },
    { id: 'play_11_sem_aprisionamento', category: '11. SEGURANÇA INFANTIL', text: 'Ausência de pontos de aprisionamento', responseType: 'c_nc' },
    { id: 'play_11_sem_estrangulamento', category: '11. SEGURANÇA INFANTIL', text: 'Ausência de pontos de estrangulamento', responseType: 'c_nc' },
    { id: 'play_11_sem_arestas_vivas', category: '11. SEGURANÇA INFANTIL', text: 'Ausência de arestas vivas', responseType: 'c_nc' },
    { id: 'play_11_sem_rebarbas', category: '11. SEGURANÇA INFANTIL', text: 'Ausência de rebarbas', responseType: 'c_nc' },
    { id: 'play_11_espacamentos_seguros', category: '11. SEGURANÇA INFANTIL', text: 'Espaçamentos seguros entre componentes', responseType: 'c_nc' },
    { id: 'play_11_observacoes', category: '11. SEGURANÇA INFANTIL', text: 'Observações', responseType: 'text_long' },

    // 12. ACESSIBILIDADE
    { id: 'play_12_acesso_adequado', category: '12. ACESSIBILIDADE', text: 'Acesso adequado ao playground', responseType: 'c_nc' },
    { id: 'play_12_circulacao_acessivel', category: '12. ACESSIBILIDADE', text: 'Circulação acessível', responseType: 'c_nc' },
    { id: 'play_12_equipamentos_inclusivos', category: '12. ACESSIBILIDADE', text: 'Equipamentos inclusivos disponíveis', responseType: 'c_nc_na' },
    { id: 'play_12_sinalizacao_acessivel', category: '12. ACESSIBILIDADE', text: 'Sinalização acessível', responseType: 'c_nc_na' },
    { id: 'play_12_observacoes', category: '12. ACESSIBILIDADE', text: 'Observações', responseType: 'text_long' },

    // 13. SINALIZAÇÃO E ORIENTAÇÃO
    { id: 'play_13_faixa_etaria', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Identificação da faixa etária', responseType: 'c_nc' },
    { id: 'play_13_regras_utilizacao', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Regras de utilização visíveis', responseType: 'c_nc' },
    { id: 'play_13_telefone_emergencia', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Telefone para emergência disponível', responseType: 'c_nc' },
    { id: 'play_13_dados_responsavel', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Dados do responsável disponíveis', responseType: 'c_nc' },
    { id: 'play_13_placas_estado', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Placas em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'play_13_observacoes', category: '13. SINALIZAÇÃO E ORIENTAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 14. INSPEÇÃO AMBIENTAL
    { id: 'play_14_drenagem_adequada', category: '14. INSPEÇÃO AMBIENTAL', text: 'Drenagem adequada', responseType: 'c_nc' },
    { id: 'play_14_sem_areas_alagadas', category: '14. INSPEÇÃO AMBIENTAL', text: 'Ausência de áreas alagadas', responseType: 'c_nc' },
    { id: 'play_14_sem_riscos_eletricos', category: '14. INSPEÇÃO AMBIENTAL', text: 'Ausência de riscos elétricos', responseType: 'c_nc' },
    { id: 'play_14_sem_vegetacao_perigosa', category: '14. INSPEÇÃO AMBIENTAL', text: 'Ausência de vegetação perigosa', responseType: 'c_nc' },
    { id: 'play_14_iluminacao_adequada', category: '14. INSPEÇÃO AMBIENTAL', text: 'Iluminação adequada', responseType: 'c_nc' },
    { id: 'play_14_observacoes', category: '14. INSPEÇÃO AMBIENTAL', text: 'Observações', responseType: 'text_long' },

    // 15. REGISTRO FOTOGRÁFICO
    { id: 'play_15_foto_vista_geral', category: '15. REGISTRO FOTOGRÁFICO', text: 'Vista geral da área', responseType: 'photo' },
    { id: 'play_15_foto_piso_amortecedor', category: '15. REGISTRO FOTOGRÁFICO', text: 'Piso amortecedor', responseType: 'photo' },
    { id: 'play_15_foto_escorregadores', category: '15. REGISTRO FOTOGRÁFICO', text: 'Escorregadores', responseType: 'photo' },
    { id: 'play_15_foto_balancos', category: '15. REGISTRO FOTOGRÁFICO', text: 'Balanços', responseType: 'photo' },
    { id: 'play_15_foto_gangorras', category: '15. REGISTRO FOTOGRÁFICO', text: 'Gangorras', responseType: 'photo' },
    { id: 'play_15_foto_torres_plataformas', category: '15. REGISTRO FOTOGRÁFICO', text: 'Torres e plataformas', responseType: 'photo' },
    { id: 'play_15_foto_placas_sinalizacao', category: '15. REGISTRO FOTOGRÁFICO', text: 'Placas de sinalização', responseType: 'photo' },
    { id: 'play_15_foto_nao_conformidades', category: '15. REGISTRO FOTOGRÁFICO', text: 'Não conformidades identificadas', responseType: 'photo' }
  ],
  pmoc: [
    // 1. IDENTIFICAÇÃO DO SISTEMA
    { id: 'p1_data_inspecao', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Data da inspeção', responseType: 'date' },
    { id: 'p1_cliente_empresa', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Cliente/Empresa', responseType: 'text' },
    { id: 'p1_endereco', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Endereço', responseType: 'text' },
    { id: 'p1_ambiente_atendido', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Ambiente atendido', responseType: 'text' },
    { id: 'p1_equipamento', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Equipamento', responseType: 'text' },
    { id: 'p1_marca', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Marca', responseType: 'text' },
    { id: 'p1_modelo', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Modelo', responseType: 'text' },
    { id: 'p1_num_serie', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Número de série', responseType: 'text' },
    { id: 'p1_capacidade', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Capacidade (BTU/h)', responseType: 'number' },
    { id: 'p1_tipo_equipamento', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Tipo de equipamento', responseType: 'tipo_ar_condicionado' },
    { id: 'p1_responsavel_inspecao', category: '1. IDENTIFICAÇÃO DO SISTEMA', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'p2_pmoc_existente', category: '2. DOCUMENTAÇÃO', text: 'PMOC existente', responseType: 'c_nc' },
    { id: 'p2_pmoc_atualizado', category: '2. DOCUMENTAÇÃO', text: 'PMOC atualizado', responseType: 'c_nc' },
    { id: 'p2_art_responsavel', category: '2. DOCUMENTAÇÃO', text: 'ART do responsável técnico', responseType: 'c_nc' },
    { id: 'p2_registro_manutencoes', category: '2. DOCUMENTAÇÃO', text: 'Registro das manutenções disponível', responseType: 'c_nc' },
    { id: 'p2_plano_manutencao', category: '2. DOCUMENTAÇÃO', text: 'Plano de manutenção disponível', responseType: 'c_nc' },
    { id: 'p2_relatorios_anteriores', category: '2. DOCUMENTAÇÃO', text: 'Relatórios anteriores arquivados', responseType: 'c_nc' },
    { id: 'p2_identificacao_equip', category: '2. DOCUMENTAÇÃO', text: 'Identificação do equipamento atualizada', responseType: 'c_nc' },
    { id: 'p2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações', responseType: 'text' },

    // 3. CONDIÇÕES GERAIS DO EQUIPAMENTO
    { id: 'p3_estado_geral', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Estado geral do equipamento', responseType: 'bom_reg_ruim' },
    { id: 'p3_integridade_gabinete', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Integridade estrutural do gabinete', responseType: 'bom_reg_ruim' },
    { id: 'p3_presenca_corrosao', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Presença de corrosão', responseType: 'ok_nok' },
    { id: 'p3_presenca_vibracao', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Presença de vibração excessiva', responseType: 'ok_nok' },
    { id: 'p3_presenca_ruidos', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Presença de ruídos anormais', responseType: 'ok_nok' },
    { id: 'p3_limpeza_geral', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Limpeza geral do equipamento', responseType: 'bom_reg_ruim' },
    { id: 'p3_observacoes', category: '3. CONDIÇÕES GERAIS DO EQUIPAMENTO', text: 'Observações', responseType: 'text' },

    // 4. FILTROS DE AR
    { id: 'p4_filtros_instalados', category: '4. FILTROS DE AR', text: 'Filtros instalados', responseType: 'c_nc' },
    { id: 'p4_filtros_limpos', category: '4. FILTROS DE AR', text: 'Filtros limpos', responseType: 'c_nc' },
    { id: 'p4_filtros_integros', category: '4. FILTROS DE AR', text: 'Filtros íntegros', responseType: 'c_nc' },
    { id: 'p4_filtros_fixados', category: '4. FILTROS DE AR', text: 'Filtros corretamente fixados', responseType: 'c_nc' },
    { id: 'p4_necessidade_substituicao', category: '4. FILTROS DE AR', text: 'Necessidade de substituição', responseType: 'sim_nao' },
    { id: 'p4_estado_geral_filtros', category: '4. FILTROS DE AR', text: 'Estado geral dos filtros', responseType: 'bom_reg_ruim' },
    { id: 'p4_observacoes', category: '4. FILTROS DE AR', text: 'Observações', responseType: 'text' },

    // 5. EVAPORADORA
    { id: 'p5_serpentina_limpa', category: '5. EVAPORADORA', text: 'Serpentina limpa', responseType: 'c_nc' },
    { id: 'p5_serpentina_integra', category: '5. EVAPORADORA', text: 'Serpentina íntegra', responseType: 'c_nc' },
    { id: 'p5_bandeja_condensado', category: '5. EVAPORADORA', text: 'Bandeja de condensado limpa', responseType: 'c_nc' },
    { id: 'p5_bandeja_sem_corrosao', category: '5. EVAPORADORA', text: 'Bandeja sem corrosão', responseType: 'c_nc' },
    { id: 'p5_ausencia_biofilme', category: '5. EVAPORADORA', text: 'Ausência de biofilme', responseType: 'c_nc' },
    { id: 'p5_ausencia_odores', category: '5. EVAPORADORA', text: 'Ausência de odores desagradáveis', responseType: 'c_nc' },
    { id: 'p5_isolamento_termico', category: '5. EVAPORADORA', text: 'Isolamento térmico adequado', responseType: 'c_nc' },
    { id: 'p5_observacoes', category: '5. EVAPORADORA', text: 'Observações', responseType: 'text' },

    // 6. CONDENSADORA
    { id: 'p6_serpentina_limpa', category: '6. CONDENSADORA', text: 'Serpentina limpa', responseType: 'c_nc' },
    { id: 'p6_serpentina_integra', category: '6. CONDENSADORA', text: 'Serpentina íntegra', responseType: 'c_nc' },
    { id: 'p6_ventilador_funcionando', category: '6. CONDENSADORA', text: 'Ventilador funcionando', responseType: 'ok_nok' },
    { id: 'p6_motor_ventilador', category: '6. CONDENSADORA', text: 'Motor do ventilador funcionando', responseType: 'ok_nok' },
    { id: 'p6_ausencia_vibracoes', category: '6. CONDENSADORA', text: 'Ausência de vibrações excessivas', responseType: 'ok_nok' },
    { id: 'p6_limpeza_adequada', category: '6. CONDENSADORA', text: 'Limpeza geral adequada', responseType: 'bom_reg_ruim' },
    { id: 'p6_observacoes', category: '6. CONDENSADORA', text: 'Observações', responseType: 'text' },

    // 7. DRENO DE CONDENSADO
    { id: 'p7_dreno_desobstruido', category: '7. DRENO DE CONDENSADO', text: 'Dreno desobstruído', responseType: 'c_nc' },
    { id: 'p7_ausencia_vazamentos', category: '7. DRENO DE CONDENSADO', text: 'Ausência de vazamentos', responseType: 'c_nc' },
    { id: 'p7_tubulacao_bom_estado', category: '7. DRENO DE CONDENSADO', text: 'Tubulação em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'p7_caimento_adequado', category: '7. DRENO DE CONDENSADO', text: 'Caimento adequado', responseType: 'c_nc' },
    { id: 'p7_ausencia_retorno', category: '7. DRENO DE CONDENSADO', text: 'Ausência de retorno de água', responseType: 'c_nc' },
    { id: 'p7_observacoes', category: '7. DRENO DE CONDENSADO', text: 'Observações', responseType: 'text' },

    // 8. SISTEMA ELÉTRICO
    { id: 'p8_tensao_especificada', category: '8. SISTEMA ELÉTRICO', text: 'Tensão dentro do especificado', responseType: 'ok_nok' },
    { id: 'p8_corrente_especificada', category: '8. SISTEMA ELÉTRICO', text: 'Corrente dentro do especificado', responseType: 'ok_nok' },
    { id: 'p8_terminais_apertados', category: '8. SISTEMA ELÉTRICO', text: 'Terminais apertados', responseType: 'c_nc' },
    { id: 'p8_cabos_bom_estado', category: '8. SISTEMA ELÉTRICO', text: 'Cabos em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'p8_disjuntores_adequados', category: '8. SISTEMA ELÉTRICO', text: 'Disjuntores adequados', responseType: 'c_nc' },
    { id: 'p8_contatores_bom_estado', category: '8. SISTEMA ELÉTRICO', text: 'Contatores em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'p8_aterramento_adequado', category: '8. SISTEMA ELÉTRICO', text: 'Aterramento adequado', responseType: 'c_nc' },
    { id: 'p8_observacoes', category: '8. SISTEMA ELÉTRICO', text: 'Observações', responseType: 'text' },

    // 9. SISTEMA FRIGORÍFICO
    { id: 'p9_ausencia_vazamento_gas', category: '9. SISTEMA FRIGORÍFICO', text: 'Ausência de vazamento de gás refrigerante', responseType: 'c_nc' },
    { id: 'p9_pressao_succao', category: '9. SISTEMA FRIGORÍFICO', text: 'Pressão de sucção adequada', responseType: 'ok_nok' },
    { id: 'p9_pressao_descarga', category: '9. SISTEMA FRIGORÍFICO', text: 'Pressão de descarga adequada', responseType: 'ok_nok' },
    { id: 'p9_isolamento_tubulacoes', category: '9. SISTEMA FRIGORÍFICO', text: 'Isolamento das tubulações adequado', responseType: 'c_nc' },
    { id: 'p9_tubulacoes_bom_estado', category: '9. SISTEMA FRIGORÍFICO', text: 'Tubulações em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'p9_valvulas_sem_vazamentos', category: '9. SISTEMA FRIGORÍFICO', text: 'Válvulas sem vazamentos', responseType: 'c_nc' },
    { id: 'p9_observacoes', category: '9. SISTEMA FRIGORÍFICO', text: 'Observações', responseType: 'text' },

    // 10. COMPRESSOR
    { id: 'p10_funcionamento_normal', category: '10. COMPRESSOR', text: 'Funcionamento normal', responseType: 'ok_nok' },
    { id: 'p10_ausencia_ruidos', category: '10. COMPRESSOR', text: 'Ausência de ruídos anormais', responseType: 'ok_nok' },
    { id: 'p10_ausencia_superaquecimento', category: '10. COMPRESSOR', text: 'Ausência de superaquecimento', responseType: 'ok_nok' },
    { id: 'p10_corrente_especificacao', category: '10. COMPRESSOR', text: 'Corrente dentro da especificação', responseType: 'ok_nok' },
    { id: 'p10_vibracao_aceitavel', category: '10. COMPRESSOR', text: 'Vibração aceitável', responseType: 'ok_nok' },
    { id: 'p10_estado_geral', category: '10. COMPRESSOR', text: 'Estado geral', responseType: 'bom_reg_ruim' },
    { id: 'p10_observacoes', category: '10. COMPRESSOR', text: 'Observações', responseType: 'text' },

    // 11. QUALIDADE DO AR INTERIOR
    { id: 'p11_ambiente_livre_odores', category: '11. QUALIDADE DO AR INTERIOR', text: 'Ambiente livre de odores', responseType: 'c_nc' },
    { id: 'p11_ambiente_sem_mofo', category: '11. QUALIDADE DO AR INTERIOR', text: 'Ambiente sem mofo aparente', responseType: 'c_nc' },
    { id: 'p11_renovacao_ar_adequada', category: '11. QUALIDADE DO AR INTERIOR', text: 'Renovação de ar adequada', responseType: 'default' },
    { id: 'p11_difusores_limpos', category: '11. QUALIDADE DO AR INTERIOR', text: 'Difusores limpos', responseType: 'c_nc' },
    { id: 'p11_grelhas_limpos', category: '11. QUALIDADE DO AR INTERIOR', text: 'Grelhas limpas', responseType: 'c_nc' },
    { id: 'p11_nivel_limpeza_satisfatorio', category: '11. QUALIDADE DO AR INTERIOR', text: 'Nível de limpeza satisfatório', responseType: 'bom_reg_ruim' },
    { id: 'p11_observacoes', category: '11. QUALIDADE DO AR INTERIOR', text: 'Observações', responseType: 'text' },

    // 12. MEDIÇÕES OPERACIONAIS
    { id: 'p12_temp_insuflamento', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Temperatura insuflamento (°C)', responseType: 'number' },
    { id: 'p12_temp_retorno', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Temperatura retorno (°C)', responseType: 'number' },
    { id: 'p12_dif_temperatura', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Diferença de temperatura (ΔT)', responseType: 'number' },
    { id: 'p12_umidade_relativa', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Umidade relativa (%)', responseType: 'number' },
    { id: 'p12_tensao_eletrica', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Tensão elétrica (V)', responseType: 'number' },
    { id: 'p12_corrente_eletrica', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Corrente elétrica (A)', responseType: 'number' },
    { id: 'p12_pressao_succao', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Pressão sucção (psi/bar)', responseType: 'number' },
    { id: 'p12_pressao_descarga', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Pressão descarga (psi/bar)', responseType: 'number' },
    { id: 'p12_vazao_ar', category: '12. MEDIÇÕES OPERACIONAIS', text: 'Vazão de ar (quando aplicável)', responseType: 'number' },

    // 13. LIMPEZA E HIGIENIZAÇÃO
    { id: 'p13_limpeza_evaporadora', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Limpeza da evaporadora realizada', responseType: 'sim_nao' },
    { id: 'p13_limpeza_condensadora', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Limpeza da condensadora realizada', responseType: 'sim_nao' },
    { id: 'p13_limpeza_filtros', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Limpeza dos filtros realizada', responseType: 'sim_nao' },
    { id: 'p13_higienizacao_bandeja', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Higienização da bandeja realizada', responseType: 'sim_nao' },
    { id: 'p13_higienizacao_difusores', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Higienização dos difusores realizada', responseType: 'sim_nao' },
    { id: 'p13_aplicacao_bactericida', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Aplicação de produto bactericida/fungicida', responseType: 'sim_nao' },
    { id: 'p13_observacoes', category: '13. LIMPEZA E HIGIENIZAÇÃO', text: 'Observações', responseType: 'text' },

    // 14. REGISTRO FOTOGRÁFICO
    { id: 'p14_foto_equipamento', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto do equipamento', responseType: 'photo' },
    { id: 'p14_foto_evaporadora', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto da evaporadora', responseType: 'photo' },
    { id: 'p14_foto_condensadora', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto da condensadora', responseType: 'photo' },
    { id: 'p14_foto_filtros', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto dos filtros', responseType: 'photo' },
    { id: 'p14_foto_bandeja', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto da bandeja de condensado', responseType: 'photo' },
    { id: 'p14_foto_dreno', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto do dreno', responseType: 'photo' },
    { id: 'p14_foto_medicoes', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto das medições', responseType: 'photo' },
    { id: 'p14_foto_nao_conformidades', category: '14. REGISTRO FOTOGRÁFICO', text: 'Foto das não conformidades', responseType: 'photo' }
  ],
  reclassificacao_monta: [
    // 1. IDENTIFICAÇÃO DO VEÍCULO
    { id: 'rm_1_data_inspecao', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Data da inspeção', responseType: 'date' },
    { id: 'rm_1_proprietario', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Proprietário', responseType: 'text' },
    { id: 'rm_1_marca', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Marca', responseType: 'text' },
    { id: 'rm_1_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Modelo', responseType: 'text' },
    { id: 'rm_1_ano_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Ano/Modelo', responseType: 'text' },
    { id: 'rm_1_placa', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Placa', responseType: 'text' },
    { id: 'rm_1_renavam', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'RENAVAM', responseType: 'text' },
    { id: 'rm_1_chassi', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Chassi (VIN)', responseType: 'text' },
    { id: 'rm_1_cor_predominante', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Cor predominante', responseType: 'text' },
    { id: 'rm_1_quilometragem', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Quilometragem', responseType: 'number' },
    { id: 'rm_1_categoria', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Categoria do veículo', responseType: 'tipo_veiculo_reclassificacao' },
    { id: 'rm_1_responsavel', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO
    { id: 'rm_2_crlv', category: '2. DOCUMENTAÇÃO', text: 'CRLV disponível', responseType: 'c_nc' },
    { id: 'rm_2_boletim', category: '2. DOCUMENTAÇÃO', text: 'Boletim de ocorrência disponível', responseType: 'c_nc_na' },
    { id: 'rm_2_baixa_sinistro', category: '2. DOCUMENTAÇÃO', text: 'Baixa de sinistro registrada', responseType: 'c_nc_na' },
    { id: 'rm_2_compativel', category: '2. DOCUMENTAÇÃO', text: 'Documentação compatível com o veículo', responseType: 'c_nc' },
    { id: 'rm_2_etiquetas', category: '2. DOCUMENTAÇÃO', text: 'Etiquetas de identificação presentes', responseType: 'c_nc' },
    { id: 'rm_2_observacoes', category: '2. DOCUMENTAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 3. IDENTIFICAÇÃO VEICULAR
    { id: 'rm_3_chassi_legivel', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Chassi legível', responseType: 'c_nc' },
    { id: 'rm_3_chassi_sem_adulteracao', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Chassi sem indícios de adulteração', responseType: 'c_nc' },
    { id: 'rm_3_etiqueta_fabricante', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Etiqueta do fabricante íntegra', responseType: 'c_nc' },
    { id: 'rm_3_num_motor_compativel', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Número do motor compatível', responseType: 'c_nc' },
    { id: 'rm_3_plaquetas_preservadas', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Plaquetas de identificação preservadas', responseType: 'c_nc' },
    { id: 'rm_3_observacoes', category: '3. IDENTIFICAÇÃO VEICULAR', text: 'Observações', responseType: 'text_long' },

    // 4. ESTRUTURA MONOBLOCO / CHASSI
    { id: 'rm_4_longarinas_alinhadas', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Longarinas alinhadas', responseType: 'ok_nok' },
    { id: 'rm_4_travessas_alinhadas', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Travessas alinhadas', responseType: 'ok_nok' },
    { id: 'rm_4_ausencia_trincas', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Ausência de trincas estruturais', responseType: 'ok_nok' },
    { id: 'rm_4_ausencia_deformacoes', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Ausência de deformações críticas', responseType: 'ok_nok' },
    { id: 'rm_4_pontos_fixacao', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Pontos de fixação preservados', responseType: 'ok_nok' },
    { id: 'rm_4_geometria_estrutural', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Geometria estrutural compatível', responseType: 'ok_nok' },
    { id: 'rm_4_estado_geral', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Estado geral da estrutura', responseType: 'bom_reg_ruim' },
    { id: 'rm_4_observacoes', category: '4. ESTRUTURA MONOBLOCO / CHASSI', text: 'Observações', responseType: 'text_long' },

    // 5. COLUNAS E TETO
    { id: 'rm_5_coluna_a', category: '5. COLUNAS E TETO', text: 'Coluna A íntegra', responseType: 'ok_nok' },
    { id: 'rm_5_coluna_b', category: '5. COLUNAS E TETO', text: 'Coluna B íntegra', responseType: 'ok_nok' },
    { id: 'rm_5_coluna_c', category: '5. COLUNAS E TETO', text: 'Coluna C íntegra', responseType: 'ok_nok' },
    { id: 'rm_5_teto_alinhado', category: '5. COLUNAS E TETO', text: 'Teto alinhado', responseType: 'ok_nok' },
    { id: 'rm_5_ausencia_deformacoes', category: '5. COLUNAS E TETO', text: 'Ausência de deformações estruturais', responseType: 'ok_nok' },
    { id: 'rm_5_reparos_adequados', category: '5. COLUNAS E TETO', text: 'Reparos executados adequadamente', responseType: 'c_nc' },
    { id: 'rm_5_observacoes', category: '5. COLUNAS E TETO', text: 'Observações', responseType: 'text_long' },

    // 6. COMPARTIMENTO DO MOTOR
    { id: 'rm_6_painel_frontal', category: '6. COMPARTIMENTO DO MOTOR', text: 'Painel frontal alinhado', responseType: 'ok_nok' },
    { id: 'rm_6_caixa_rodas', category: '6. COMPARTIMENTO DO MOTOR', text: 'Caixa de rodas preservada', responseType: 'ok_nok' },
    { id: 'rm_6_torre_amortecedores', category: '6. COMPARTIMENTO DO MOTOR', text: 'Torre dos amortecedores preservada', responseType: 'ok_nok' },
    { id: 'rm_6_travessa_frontal', category: '6. COMPARTIMENTO DO MOTOR', text: 'Travessa frontal alinhada', responseType: 'ok_nok' },
    { id: 'rm_6_ausencia_deformacoes', category: '6. COMPARTIMENTO DO MOTOR', text: 'Ausência de deformações estruturais', responseType: 'ok_nok' },
    { id: 'rm_6_observacoes', category: '6. COMPARTIMENTO DO MOTOR', text: 'Observações', responseType: 'text_long' },

    // 7. ASSOALHO E PORTA-MALAS
    { id: 'rm_7_assoalho_alinhado', category: '7. ASSOALHO E PORTA-MALAS', text: 'Assoalho alinhado', responseType: 'ok_nok' },
    { id: 'rm_7_ausencia_dobras', category: '7. ASSOALHO E PORTA-MALAS', text: 'Ausência de dobras estruturais', responseType: 'ok_nok' },
    { id: 'rm_7_compartimento_traseiro', category: '7. ASSOALHO E PORTA-MALAS', text: 'Compartimento traseiro alinhado', responseType: 'ok_nok' },
    { id: 'rm_7_caixa_estepe', category: '7. ASSOALHO E PORTA-MALAS', text: 'Caixa de estepe preservada', responseType: 'ok_nok' },
    { id: 'rm_7_reparos_adequados', category: '7. ASSOALHO E PORTA-MALAS', text: 'Reparos executados adequadamente', responseType: 'c_nc' },
    { id: 'rm_7_observacoes', category: '7. ASSOALHO E PORTA-MALAS', text: 'Observações', responseType: 'text_long' },

    // 8. SISTEMA DE SUSPENSÃO
    { id: 'rm_8_pontos_ancoragem', category: '8. SISTEMA DE SUSPENSÃO', text: 'Pontos de ancoragem preservados', responseType: 'ok_nok' },
    { id: 'rm_8_bandejas_sem_deformacao', category: '8. SISTEMA DE SUSPENSÃO', text: 'Bandejas sem deformações', responseType: 'ok_nok' },
    { id: 'rm_8_amortecedores', category: '8. SISTEMA DE SUSPENSÃO', text: 'Amortecedores em condições adequadas', responseType: 'bom_reg_ruim' },
    { id: 'rm_8_molas', category: '8. SISTEMA DE SUSPENSÃO', text: 'Molas em condições adequadas', responseType: 'bom_reg_ruim' },
    { id: 'rm_8_geometria_compativel', category: '8. SISTEMA DE SUSPENSÃO', text: 'Geometria compatível', responseType: 'ok_nok' },
    { id: 'rm_8_observacoes', category: '8. SISTEMA DE SUSPENSÃO', text: 'Observações', responseType: 'text_long' },

    // 9. SISTEMA DE DIREÇÃO
    { id: 'rm_9_caixa_direcao', category: '9. SISTEMA DE DIREÇÃO', text: 'Caixa de direção sem danos', responseType: 'ok_nok' },
    { id: 'rm_9_terminais', category: '9. SISTEMA DE DIREÇÃO', text: 'Terminais em condições adequadas', responseType: 'bom_reg_ruim' },
    { id: 'rm_9_coluna_direcao', category: '9. SISTEMA DE DIREÇÃO', text: 'Coluna de direção preservada', responseType: 'ok_nok' },
    { id: 'rm_9_ausencia_folgas', category: '9. SISTEMA DE DIREÇÃO', text: 'Ausência de folgas excessivas', responseType: 'ok_nok' },
    { id: 'rm_9_observacoes', category: '9. SISTEMA DE DIREÇÃO', text: 'Observações', responseType: 'text_long' },

    // 10. SISTEMA DE FREIOS
    { id: 'rm_10_sistema_operacional', category: '10. SISTEMA DE FREIOS', text: 'Sistema operacional', responseType: 'ok_nok' },
    { id: 'rm_10_tubulacoes_integras', category: '10. SISTEMA DE FREIOS', text: 'Tubulações íntegras', responseType: 'ok_nok' },
    { id: 'rm_10_flexiveis', category: '10. SISTEMA DE FREIOS', text: 'Flexíveis em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'rm_10_freio_estacionamento', category: '10. SISTEMA DE FREIOS', text: 'Freio de estacionamento funcional', responseType: 'ok_nok' },
    { id: 'rm_10_observacoes', category: '10. SISTEMA DE FREIOS', text: 'Observações', responseType: 'text_long' },

    // 11. SISTEMA DE SEGURANÇA
    { id: 'rm_11_cintos_seguranca', category: '11. SISTEMA DE SEGURANÇA', text: 'Cintos de segurança funcionais', responseType: 'c_nc' },
    { id: 'rm_11_airbags', category: '11. SISTEMA DE SEGURANÇA', text: 'Airbags instalados (quando aplicável)', responseType: 'c_nc_na' },
    { id: 'rm_11_painel_sem_luzes', category: '11. SISTEMA DE SEGURANÇA', text: 'Painel sem luzes críticas acesas', responseType: 'c_nc' },
    { id: 'rm_11_fechaduras_operacionais', category: '11. SISTEMA DE SEGURANÇA', text: 'Fechaduras operacionais', responseType: 'c_nc' },
    { id: 'rm_11_vidros_seguranca', category: '11. SISTEMA DE SEGURANÇA', text: 'Vidros de segurança adequados', responseType: 'c_nc' },
    { id: 'rm_11_observacoes', category: '11. SISTEMA DE SEGURANÇA', text: 'Observações', responseType: 'text_long' },

    // 12. SISTEMA ELÉTRICO
    { id: 'rm_12_farois', category: '12. SISTEMA ELÉTRICO', text: 'Faróis operacionais', responseType: 'ok_nok' },
    { id: 'rm_12_lanternas', category: '12. SISTEMA ELÉTRICO', text: 'Lanternas operacionais', responseType: 'ok_nok' },
    { id: 'rm_12_setas', category: '12. SISTEMA ELÉTRICO', text: 'Setas operacionais', responseType: 'ok_nok' },
    { id: 'rm_12_luz_freio', category: '12. SISTEMA ELÉTRICO', text: 'Luz de freio operacional', responseType: 'ok_nok' },
    { id: 'rm_12_chicote_preservado', category: '12. SISTEMA ELÉTRICO', text: 'Chicote elétrico preservado', responseType: 'ok_nok' },
    { id: 'rm_12_observacoes', category: '12. SISTEMA ELÉTRICO', text: 'Observações', responseType: 'text_long' },

    // 13. CARROCERIA E ACABAMENTO
    { id: 'rm_13_portas_alinhadas', category: '13. CARROCERIA E ACABAMENTO', text: 'Portas alinhadas', responseType: 'ok_nok' },
    { id: 'rm_13_capo_alinhado', category: '13. CARROCERIA E ACABAMENTO', text: 'Capô alinhado', responseType: 'ok_nok' },
    { id: 'rm_13_tampa_traseira', category: '13. CARROCERIA E ACABAMENTO', text: 'Tampa traseira alinhada', responseType: 'ok_nok' },
    { id: 'rm_13_para_lamas', category: '13. CARROCERIA E ACABAMENTO', text: 'Para-lamas alinhados', responseType: 'ok_nok' },
    { id: 'rm_13_para_choques', category: '13. CARROCERIA E ACABAMENTO', text: 'Para-choques adequadamente instalados', responseType: 'ok_nok' },
    { id: 'rm_13_estado_geral', category: '13. CARROCERIA E ACABAMENTO', text: 'Estado geral da carroceria', responseType: 'bom_reg_ruim' },
    { id: 'rm_13_observacoes', category: '13. CARROCERIA E ACABAMENTO', text: 'Observações', responseType: 'text_long' },

    // 14. INSPEÇÃO DOS REPAROS
    { id: 'rm_14_substituicao_pecas', category: '14. INSPEÇÃO DOS REPAROS', text: 'Substituição de peças adequada', responseType: 'c_nc' },
    { id: 'rm_14_soldas', category: '14. INSPEÇÃO DOS REPAROS', text: 'Soldas executadas corretamente', responseType: 'c_nc' },
    { id: 'rm_14_alinhamento_estrutural', category: '14. INSPEÇÃO DOS REPAROS', text: 'Alinhamento estrutural adequado', responseType: 'c_nc' },
    { id: 'rm_14_acabamento_reparos', category: '14. INSPEÇÃO DOS REPAROS', text: 'Acabamento dos reparos adequado', responseType: 'c_nc' },
    { id: 'rm_14_sem_comprometimento', category: '14. INSPEÇÃO DOS REPAROS', text: 'Ausência de comprometimento estrutural', responseType: 'c_nc' },
    { id: 'rm_14_observacoes', category: '14. INSPEÇÃO DOS REPAROS', text: 'Observações', responseType: 'text_long' },

    // 15. REGISTRO FOTOGRÁFICO
    { id: 'rm_15_foto_vista_frontal', category: '15. REGISTRO FOTOGRÁFICO', text: 'Vista frontal', responseType: 'photo' },
    { id: 'rm_15_foto_vista_traseira', category: '15. REGISTRO FOTOGRÁFICO', text: 'Vista traseira', responseType: 'photo' },
    { id: 'rm_15_foto_lateral_direita', category: '15. REGISTRO FOTOGRÁFICO', text: 'Vista lateral direita', responseType: 'photo' },
    { id: 'rm_15_foto_lateral_esquerda', category: '15. REGISTRO FOTOGRÁFICO', text: 'Vista lateral esquerda', responseType: 'photo' },
    { id: 'rm_15_foto_chassi_vin', category: '15. REGISTRO FOTOGRÁFICO', text: 'Chassi/VIN', responseType: 'photo' },
    { id: 'rm_15_foto_num_motor', category: '15. REGISTRO FOTOGRÁFICO', text: 'Número do motor', responseType: 'photo' },
    { id: 'rm_15_foto_motor_compartimento', category: '15. REGISTRO FOTOGRÁFICO', text: 'Compartimento do motor', responseType: 'photo' },
    { id: 'rm_15_foto_estrutura_inferior', category: '15. REGISTRO FOTOGRÁFICO', text: 'Estrutura inferior', responseType: 'photo' },
    { id: 'rm_15_foto_reparos_executados', category: '15. REGISTRO FOTOGRÁFICO', text: 'Reparos executados', responseType: 'photo' },
    { id: 'rm_15_foto_nao_conformidades', category: '15. REGISTRO FOTOGRÁFICO', text: 'Não conformidades encontradas', responseType: 'photo' },

    // 16. CLASSIFICAÇÃO DOS DANOS
    { id: 'rm_16_danos_estruturais', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Danos estruturais identificados', responseType: 'sim_nao' },
    { id: 'rm_16_danos_seguranca', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Danos em elementos de segurança', responseType: 'sim_nao' },
    { id: 'rm_16_danos_longarinas', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Danos em longarinas', responseType: 'sim_nao' },
    { id: 'rm_16_danos_colunas', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Danos em colunas estruturais', responseType: 'sim_nao' },
    { id: 'rm_16_danos_monobloco', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Danos no monobloco/chassi', responseType: 'sim_nao' },
    { id: 'rm_16_classificacao_sugerida', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Classificação sugerida', responseType: 'classificacao_monta' },
    { id: 'rm_16_justificativa_tecnica', category: '16. CLASSIFICAÇÃO DOS DANOS', text: 'Justificativa técnica', responseType: 'text_long' }
  ],
  integridade_fisica: [
    // 1. IDENTIFICAÇÃO DO VEÍCULO
    { id: 'if_1_data_inspecao', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Data da inspeção', responseType: 'date' },
    { id: 'if_1_local_inspecao', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Local da inspeção', responseType: 'text' },
    { id: 'if_1_proprietario', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Proprietário', responseType: 'text' },
    { id: 'if_1_marca', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Marca', responseType: 'text' },
    { id: 'if_1_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Modelo', responseType: 'text' },
    { id: 'if_1_ano_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Ano/Modelo', responseType: 'text' },
    { id: 'if_1_categoria', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Categoria', responseType: 'tipo_veiculo_integridade' },
    { id: 'if_1_placa', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Placa', responseType: 'text' },
    { id: 'if_1_renavam', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'RENAVAM', responseType: 'text' },
    { id: 'if_1_chassi', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Chassi (VIN)', responseType: 'text' },
    { id: 'if_1_num_motor', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Número do motor', responseType: 'text' },
    { id: 'if_1_cor_predominante', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Cor predominante', responseType: 'text' },
    { id: 'if_1_quilometragem', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Quilometragem', responseType: 'number' },
    { id: 'if_1_responsavel', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO E IDENTIFICAÇÃO
    { id: 'if_2_crlv', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'CRLV apresentado', responseType: 'c_nc' },
    { id: 'if_2_chassi_legivel', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Chassi legível', responseType: 'c_nc' },
    { id: 'if_2_chassi_compativel', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Chassi compatível com documento', responseType: 'c_nc' },
    { id: 'if_2_num_motor_compativel', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Número do motor compatível', responseType: 'c_nc' },
    { id: 'if_2_etiquetas_fabricante', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Etiquetas do fabricante preservadas', responseType: 'c_nc' },
    { id: 'if_2_plaquetas_presentes', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Plaquetas de identificação presentes', responseType: 'c_nc' },
    { id: 'if_2_indicios_adulteracao', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Indícios de adulteração', responseType: 'sim_nao' },
    { id: 'if_2_observacoes', category: '2. DOCUMENTAÇÃO E IDENTIFICAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 3. ESTRUTURA E CARROCERIA
    { id: 'if_3_longarinas_integras', category: '3. ESTRUTURA E CARROCERIA', text: 'Longarinas íntegras', responseType: 'ok_nok' },
    { id: 'if_3_travessas_integras', category: '3. ESTRUTURA E CARROCERIA', text: 'Travessas íntegras', responseType: 'ok_nok' },
    { id: 'if_3_monobloco_sem_deformacao', category: '3. ESTRUTURA E CARROCERIA', text: 'Monobloco sem deformações', responseType: 'ok_nok' },
    { id: 'if_3_ausencia_trincas', category: '3. ESTRUTURA E CARROCERIA', text: 'Ausência de trincas estruturais', responseType: 'ok_nok' },
    { id: 'if_3_ausencia_corrosao', category: '3. ESTRUTURA E CARROCERIA', text: 'Ausência de corrosão estrutural', responseType: 'ok_nok' },
    { id: 'if_3_estado_geral', category: '3. ESTRUTURA E CARROCERIA', text: 'Estado geral da carroceria', responseType: 'bom_reg_ruim' },
    { id: 'if_3_alinhamento_portas', category: '3. ESTRUTURA E CARROCERIA', text: 'Alinhamento das portas', responseType: 'bom_reg_ruim' },
    { id: 'if_3_alinhamento_capo', category: '3. ESTRUTURA E CARROCERIA', text: 'Alinhamento do capô', responseType: 'bom_reg_ruim' },
    { id: 'if_3_alinhamento_tampa_traseira', category: '3. ESTRUTURA E CARROCERIA', text: 'Alinhamento da tampa traseira', responseType: 'bom_reg_ruim' },
    { id: 'if_3_observacoes', category: '3. ESTRUTURA E CARROCERIA', text: 'Observações', responseType: 'text_long' },

    // 4. PINTURA E CONSERVAÇÃO
    { id: 'if_4_estado_pintura', category: '4. PINTURA E CONSERVAÇÃO', text: 'Estado da pintura', responseType: 'bom_reg_ruim' },
    { id: 'if_4_presenca_amassados', category: '4. PINTURA E CONSERVAÇÃO', text: 'Presença de amassados', responseType: 'sim_nao' },
    { id: 'if_4_presenca_riscos', category: '4. PINTURA E CONSERVAÇÃO', text: 'Presença de riscos', responseType: 'sim_nao' },
    { id: 'if_4_presenca_corrosao', category: '4. PINTURA E CONSERVAÇÃO', text: 'Presença de corrosão', responseType: 'sim_nao' },
    { id: 'if_4_estado_geral_conservacao', category: '4. PINTURA E CONSERVAÇÃO', text: 'Estado geral de conservação', responseType: 'bom_reg_ruim' },
    { id: 'if_4_observacoes', category: '4. PINTURA E CONSERVAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 5. SISTEMA DE DIREÇÃO
    { id: 'if_5_caixa_direcao', category: '5. SISTEMA DE DIREÇÃO', text: 'Caixa de direção', responseType: 'bom_reg_ruim' },
    { id: 'if_5_terminais', category: '5. SISTEMA DE DIREÇÃO', text: 'Terminais de direção', responseType: 'bom_reg_ruim' },
    { id: 'if_5_barras', category: '5. SISTEMA DE DIREÇÃO', text: 'Barras de direção', responseType: 'bom_reg_ruim' },
    { id: 'if_5_ausencia_folgas', category: '5. SISTEMA DE DIREÇÃO', text: 'Ausência de folgas excessivas', responseType: 'ok_nok' },
    { id: 'if_5_ausencia_vazamentos', category: '5. SISTEMA DE DIREÇÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'if_5_funcionamento_adequado', category: '5. SISTEMA DE DIREÇÃO', text: 'Funcionamento adequado', responseType: 'ok_nok' },
    { id: 'if_5_observacoes', category: '5. SISTEMA DE DIREÇÃO', text: 'Observações', responseType: 'text_long' },

    // 6. SISTEMA DE SUSPENSÃO
    { id: 'if_6_molas', category: '6. SISTEMA DE SUSPENSÃO', text: 'Molas', responseType: 'bom_reg_ruim' },
    { id: 'if_6_amortecedores', category: '6. SISTEMA DE SUSPENSÃO', text: 'Amortecedores', responseType: 'bom_reg_ruim' },
    { id: 'if_6_bandejas', category: '6. SISTEMA DE SUSPENSÃO', text: 'Bandejas', responseType: 'bom_reg_ruim' },
    { id: 'if_6_buchas', category: '6. SISTEMA DE SUSPENSÃO', text: 'Buchas', responseType: 'bom_reg_ruim' },
    { id: 'if_6_barra_estabilizadora', category: '6. SISTEMA DE SUSPENSÃO', text: 'Barra estabilizadora', responseType: 'bom_reg_ruim' },
    { id: 'if_6_ausencia_vazamentos', category: '6. SISTEMA DE SUSPENSÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'if_6_observacoes', category: '6. SISTEMA DE SUSPENSÃO', text: 'Observações', responseType: 'text_long' },

    // 7. SISTEMA DE FREIOS
    { id: 'if_7_freio_servico', category: '7. SISTEMA DE FREIOS', text: 'Freio de serviço', responseType: 'ok_nok' },
    { id: 'if_7_freio_estacionamento', category: '7. SISTEMA DE FREIOS', text: 'Freio de estacionamento', responseType: 'ok_nok' },
    { id: 'if_7_discos_freio', category: '7. SISTEMA DE FREIOS', text: 'Discos de freio', responseType: 'bom_reg_ruim' },
    { id: 'if_7_tambores_freio', category: '7. SISTEMA DE FREIOS', text: 'Tambores de freio', responseType: 'bom_reg_ruim_na' },
    { id: 'if_7_pastilhas', category: '7. SISTEMA DE FREIOS', text: 'Pastilhas', responseType: 'bom_reg_ruim' },
    { id: 'if_7_lonas', category: '7. SISTEMA DE FREIOS', text: 'Lonas', responseType: 'bom_reg_ruim_na' },
    { id: 'if_7_tubulacoes', category: '7. SISTEMA DE FREIOS', text: 'Tubulações', responseType: 'bom_reg_ruim' },
    { id: 'if_7_ausencia_vazamentos', category: '7. SISTEMA DE FREIOS', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'if_7_observacoes', category: '7. SISTEMA DE FREIOS', text: 'Observações', responseType: 'text_long' },

    // 8. MOTOR
    { id: 'if_8_partida_normal', category: '8. MOTOR', text: 'Partida normal', responseType: 'ok_nok' },
    { id: 'if_8_marcha_lenta', category: '8. MOTOR', text: 'Marcha lenta estável', responseType: 'ok_nok' },
    { id: 'if_8_ausencia_vazamento_oleo', category: '8. MOTOR', text: 'Ausência de vazamento de óleo', responseType: 'ok_nok' },
    { id: 'if_8_ausencia_vazamento_combustivel', category: '8. MOTOR', text: 'Ausência de vazamento de combustível', responseType: 'ok_nok' },
    { id: 'if_8_ausencia_vazamento_arrefecimento', category: '8. MOTOR', text: 'Ausência de vazamento de arrefecimento', responseType: 'ok_nok' },
    { id: 'if_8_ruidos_anormais', category: '8. MOTOR', text: 'Ruídos anormais', responseType: 'ok_nok' },
    { id: 'if_8_emissao_excessiva_fumaca', category: '8. MOTOR', text: 'Emissão excessiva de fumaça', responseType: 'ok_nok' },
    { id: 'if_8_estado_geral', category: '8. MOTOR', text: 'Estado geral do motor', responseType: 'bom_reg_ruim' },
    { id: 'if_8_observacoes', category: '8. MOTOR', text: 'Observações', responseType: 'text_long' },

    // 9. SISTEMA DE TRANSMISSÃO
    { id: 'if_9_caixa_cambio', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Caixa de câmbio', responseType: 'bom_reg_ruim' },
    { id: 'if_9_embreagem', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Embreagem', responseType: 'bom_reg_ruim' },
    { id: 'if_9_diferencial', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Diferencial', responseType: 'bom_reg_ruim' },
    { id: 'if_9_semi_eixos', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Semi-eixos', responseType: 'bom_reg_ruim' },
    { id: 'if_9_ausencia_vazamentos', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'if_9_funcionamento_adequado', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Funcionamento adequado', responseType: 'ok_nok' },
    { id: 'if_9_observacoes', category: '9. SISTEMA DE TRANSMISSÃO', text: 'Observações', responseType: 'text_long' },

    // 10. SISTEMA ELÉTRICO
    { id: 'if_10_bateria', category: '10. SISTEMA ELÉTRICO', text: 'Bateria', responseType: 'bom_reg_ruim' },
    { id: 'if_10_alternador', category: '10. SISTEMA ELÉTRICO', text: 'Alternador', responseType: 'ok_nok' },
    { id: 'if_10_motor_partida', category: '10. SISTEMA ELÉTRICO', text: 'Motor de partida', responseType: 'ok_nok' },
    { id: 'if_10_chicote_eletrico', category: '10. SISTEMA ELÉTRICO', text: 'Chicote elétrico', responseType: 'bom_reg_ruim' },
    { id: 'if_10_painel_instrumentos', category: '10. SISTEMA ELÉTRICO', text: 'Painel de instrumentos', responseType: 'ok_nok' },
    { id: 'if_10_luzes_indicadoras', category: '10. SISTEMA ELÉTRICO', text: 'Luzes indicadoras', responseType: 'ok_nok' },
    { id: 'if_10_observacoes', category: '10. SISTEMA ELÉTRICO', text: 'Observações', responseType: 'text_long' },

    // 11. ILUMINAÇÃO E SINALIZAÇÃO
    { id: 'if_11_farois_baixos', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Faróis baixos', responseType: 'ok_nok' },
    { id: 'if_11_farois_altos', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Faróis altos', responseType: 'ok_nok' },
    { id: 'if_11_lanternas_traseiras', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Lanternas traseiras', responseType: 'ok_nok' },
    { id: 'if_11_luzes_freio', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Luzes de freio', responseType: 'ok_nok' },
    { id: 'if_11_setas_dianteiras', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Setas dianteiras', responseType: 'ok_nok' },
    { id: 'if_11_setas_traseiras', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Setas traseiras', responseType: 'ok_nok' },
    { id: 'if_11_luz_re', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Luz de ré', responseType: 'ok_nok' },
    { id: 'if_11_luz_placa', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Luz de placa', responseType: 'ok_nok' },
    { id: 'if_11_observacoes', category: '11. ILUMINAÇÃO E SINALIZAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 12. PNEUS E RODAS
    { id: 'if_12_pneus_dianteiros', category: '12. PNEUS E RODAS', text: 'Estado dos pneus dianteiros', responseType: 'bom_reg_ruim' },
    { id: 'if_12_pneus_traseiros', category: '12. PNEUS E RODAS', text: 'Estado dos pneus traseiros', responseType: 'bom_reg_ruim' },
    { id: 'if_12_sulco_legal', category: '12. PNEUS E RODAS', text: 'Sulco dentro do limite legal', responseType: 'c_nc' },
    { id: 'if_12_desgaste_uniforme', category: '12. PNEUS E RODAS', text: 'Desgaste uniforme', responseType: 'ok_nok' },
    { id: 'if_12_estepe_disponivel', category: '12. PNEUS E RODAS', text: 'Estepe disponível', responseType: 'sim_nao' },
    { id: 'if_12_estado_rodas', category: '12. PNEUS E RODAS', text: 'Estado das rodas', responseType: 'bom_reg_ruim' },
    { id: 'if_12_observacoes', category: '12. PNEUS E RODAS', text: 'Observações', responseType: 'text_long' },

    // 13. CABINE E INTERIOR
    { id: 'if_13_banco_motorista', category: '13. CABINE E INTERIOR', text: 'Banco do motorista', responseType: 'bom_reg_ruim' },
    { id: 'if_13_banco_passageiros', category: '13. CABINE E INTERIOR', text: 'Banco dos passageiros', responseType: 'bom_reg_ruim' },
    { id: 'if_13_cintos_seguranca', category: '13. CABINE E INTERIOR', text: 'Cintos de segurança', responseType: 'c_nc' },
    { id: 'if_13_retrovisores', category: '13. CABINE E INTERIOR', text: 'Retrovisores', responseType: 'ok_nok' },
    { id: 'if_13_para_brisa', category: '13. CABINE E INTERIOR', text: 'Para-brisa', responseType: 'bom_reg_ruim' },
    { id: 'if_13_vidros_laterais', category: '13. CABINE E INTERIOR', text: 'Vidros laterais', responseType: 'bom_reg_ruim' },
    { id: 'if_13_limpadores', category: '13. CABINE E INTERIOR', text: 'Limpadores de para-brisa', responseType: 'ok_nok' },
    { id: 'if_13_buzina', category: '13. CABINE E INTERIOR', text: 'Buzina', responseType: 'ok_nok' },
    { id: 'if_13_ar_condicionado', category: '13. CABINE E INTERIOR', text: 'Ar-condicionado', responseType: 'ok_nok' },
    { id: 'if_13_observacoes', category: '13. CABINE E INTERIOR', text: 'Observações', responseType: 'text_long' },

    // 14. EQUIPAMENTOS OBRIGATÓRIOS
    { id: 'if_14_triangulo', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Triângulo de sinalização', responseType: 'c_nc' },
    { id: 'if_14_macaco', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Macaco', responseType: 'c_nc' },
    { id: 'if_14_chave_roda', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Chave de roda', responseType: 'c_nc' },
    { id: 'if_14_extintor', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Extintor (quando exigido)', responseType: 'c_nc_na' },
    { id: 'if_14_estepe', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Estepe', responseType: 'c_nc' },
    { id: 'if_14_observacoes', category: '14. EQUIPAMENTOS OBRIGATÓRIOS', text: 'Observações', responseType: 'text_long' },

    // 15. ITENS DE SEGURANÇA
    { id: 'if_15_airbags_presentes', category: '15. ITENS DE SEGURANÇA', text: 'Airbags presentes', responseType: 'c_nc_na' },
    { id: 'if_15_luz_airbag_apagada', category: '15. ITENS DE SEGURANÇA', text: 'Luz de airbag apagada', responseType: 'c_nc_na' },
    { id: 'if_15_luz_abs_apagada', category: '15. ITENS DE SEGURANÇA', text: 'Luz de ABS apagada', responseType: 'c_nc_na' },
    { id: 'if_15_sistema_abs', category: '15. ITENS DE SEGURANÇA', text: 'Sistema ABS funcional', responseType: 'c_nc_na' },
    { id: 'if_15_travas_portas', category: '15. ITENS DE SEGURANÇA', text: 'Travas das portas funcionais', responseType: 'ok_nok' },
    { id: 'if_15_observacoes', category: '15. ITENS DE SEGURANÇA', text: 'Observações', responseType: 'text_long' },

    // 16. REGISTRO FOTOGRÁFICO
    { id: 'if_16_foto_vista_frontal', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista frontal', responseType: 'photo' },
    { id: 'if_16_foto_vista_traseira', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista traseira', responseType: 'photo' },
    { id: 'if_16_foto_lateral_direita', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral direita', responseType: 'photo' },
    { id: 'if_16_foto_lateral_esquerda', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral esquerda', responseType: 'photo' },
    { id: 'if_16_foto_placa', category: '16. REGISTRO FOTOGRÁFICO', text: 'Placa', responseType: 'photo' },
    { id: 'if_16_foto_chassi', category: '16. REGISTRO FOTOGRÁFICO', text: 'Chassi', responseType: 'photo' },
    { id: 'if_16_foto_motor', category: '16. REGISTRO FOTOGRÁFICO', text: 'Motor', responseType: 'photo' },
    { id: 'if_16_foto_painel', category: '16. REGISTRO FOTOGRÁFICO', text: 'Painel', responseType: 'photo' },
    { id: 'if_16_foto_pneus', category: '16. REGISTRO FOTOGRÁFICO', text: 'Pneus', responseType: 'photo' },
    { id: 'if_16_foto_nao_conformidades', category: '16. REGISTRO FOTOGRÁFICO', text: 'Não conformidades', responseType: 'photo' },

    // 17. AVALIAÇÃO DE INTEGRIDADE FÍSICA
    { id: 'if_17_integridade_preservada', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Integridade estrutural preservada', responseType: 'sim_nao' },
    { id: 'if_17_sem_reparos_inadequados', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Ausência de reparos estruturais inadequados', responseType: 'sim_nao' },
    { id: 'if_17_sem_sinistro_grave', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Ausência de sinais de sinistro grave', responseType: 'sim_nao' },
    { id: 'if_17_sem_adulteracao', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Ausência de adulteração identificadora', responseType: 'sim_nao' },
    { id: 'if_17_condicao_fisica', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Condição física geral', responseType: 'condicao_fisica_geral' },
    { id: 'if_17_observacoes', category: '17. AVALIAÇÃO DE INTEGRIDADE FÍSICA', text: 'Observações', responseType: 'text_long' }
  ],
  frota_escolar: [
    // 1. IDENTIFICAÇÃO DO VEÍCULO
    { id: 'fe_1_data_inspecao', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Data da inspeção', responseType: 'date' },
    { id: 'fe_1_municipio', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Município', responseType: 'text' },
    { id: 'fe_1_proprietario', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Proprietário', responseType: 'text' },
    { id: 'fe_1_empresa_permissionario', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Empresa/Permissionário', responseType: 'text' },
    { id: 'fe_1_marca', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Marca', responseType: 'text' },
    { id: 'fe_1_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Modelo', responseType: 'text' },
    { id: 'fe_1_ano_modelo', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Ano/Modelo', responseType: 'text' },
    { id: 'fe_1_placa', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Placa', responseType: 'text' },
    { id: 'fe_1_renavam', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'RENAVAM', responseType: 'text' },
    { id: 'fe_1_chassi', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Chassi', responseType: 'text' },
    { id: 'fe_1_num_motor', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Número do motor', responseType: 'text' },
    { id: 'fe_1_quilometragem', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Quilometragem', responseType: 'number' },
    { id: 'fe_1_capacidade_passageiros', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Capacidade de passageiros', responseType: 'number' },
    { id: 'fe_1_responsavel_inspecao', category: '1. IDENTIFICAÇÃO DO VEÍCULO', text: 'Responsável pela inspeção', responseType: 'text' },

    // 2. DOCUMENTAÇÃO OBRIGATÓRIA
    { id: 'fe_2_crlv_valido', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'CRLV válido', responseType: 'c_nc' },
    { id: 'fe_2_licenca_valida', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Licença para transporte escolar válida', responseType: 'c_nc' },
    { id: 'fe_2_certificado_inspecao', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Certificado de inspeção veicular válido', responseType: 'c_nc' },
    { id: 'fe_2_apolice_seguro', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Apólice de seguro disponível', responseType: 'c_nc_na' },
    { id: 'fe_2_cadastro_permissionario', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Cadastro do permissionário atualizado', responseType: 'c_nc' },
    { id: 'fe_2_documentacao_condutor', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Documentação do condutor disponível', responseType: 'c_nc' },
    { id: 'fe_2_observacoes', category: '2. DOCUMENTAÇÃO OBRIGATÓRIA', text: 'Observações', responseType: 'text_long' },

    // 3. IDENTIFICAÇÃO EXTERNA
    { id: 'fe_3_faixa_escolar_instalada', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Faixa "ESCOLAR" instalada', responseType: 'c_nc' },
    { id: 'fe_3_faixa_boas_condicoes', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Faixa em boas condições', responseType: 'c_nc' },
    { id: 'fe_3_cor_padrao', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Cor padrão conforme legislação local', responseType: 'c_nc_na' },
    { id: 'fe_3_num_identificacao', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Número de identificação visível', responseType: 'c_nc' },
    { id: 'fe_3_placas_legiveis', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Placas legíveis', responseType: 'c_nc' },
    { id: 'fe_3_observacoes', category: '3. IDENTIFICAÇÃO EXTERNA', text: 'Observações', responseType: 'text_long' },

    // 4. ESTRUTURA E CARROCERIA
    { id: 'fe_4_estrutura_sem_trincas', category: '4. ESTRUTURA E CARROCERIA', text: 'Estrutura sem trincas', responseType: 'ok_nok' },
    { id: 'fe_4_sem_corrosao_estrutural', category: '4. ESTRUTURA E CARROCERIA', text: 'Ausência de corrosão estrutural', responseType: 'ok_nok' },
    { id: 'fe_4_carroceria_integra', category: '4. ESTRUTURA E CARROCERIA', text: 'Carroceria íntegra', responseType: 'ok_nok' },
    { id: 'fe_4_portas_alinhadas', category: '4. ESTRUTURA E CARROCERIA', text: 'Portas alinhadas', responseType: 'ok_nok' },
    { id: 'fe_4_tampa_traseira_alinhada', category: '4. ESTRUTURA E CARROCERIA', text: 'Tampa traseira alinhada', responseType: 'ok_nok' },
    { id: 'fe_4_estado_geral', category: '4. ESTRUTURA E CARROCERIA', text: 'Estado geral da carroceria', responseType: 'bom_reg_ruim' },
    { id: 'fe_4_observacoes', category: '4. ESTRUTURA E CARROCERIA', text: 'Observações', responseType: 'text_long' },

    // 5. SISTEMA DE DIREÇÃO
    { id: 'fe_5_caixa_direcao', category: '5. SISTEMA DE DIREÇÃO', text: 'Caixa de direção', responseType: 'bom_reg_ruim' },
    { id: 'fe_5_terminais_direcao', category: '5. SISTEMA DE DIREÇÃO', text: 'Terminais de direção', responseType: 'bom_reg_ruim' },
    { id: 'fe_5_barras_direcao', category: '5. SISTEMA DE DIREÇÃO', text: 'Barras de direção', responseType: 'bom_reg_ruim' },
    { id: 'fe_5_sem_folgas_excessivas', category: '5. SISTEMA DE DIREÇÃO', text: 'Ausência de folgas excessivas', responseType: 'ok_nok' },
    { id: 'fe_5_funcionamento_adequado', category: '5. SISTEMA DE DIREÇÃO', text: 'Funcionamento adequado', responseType: 'ok_nok' },
    { id: 'fe_5_observacoes', category: '5. SISTEMA DE DIREÇÃO', text: 'Observações', responseType: 'text_long' },

    // 6. SISTEMA DE SUSPENSÃO
    { id: 'fe_6_molas', category: '6. SISTEMA DE SUSPENSÃO', text: 'Molas', responseType: 'bom_reg_ruim' },
    { id: 'fe_6_amortecedores', category: '6. SISTEMA DE SUSPENSÃO', text: 'Amortecedores', responseType: 'bom_reg_ruim' },
    { id: 'fe_6_buchas', category: '6. SISTEMA DE SUSPENSÃO', text: 'Buchas', responseType: 'bom_reg_ruim' },
    { id: 'fe_6_barra_estabilizadora', category: '6. SISTEMA DE SUSPENSÃO', text: 'Barra estabilizadora', responseType: 'bom_reg_ruim' },
    { id: 'fe_6_sem_vazamentos', category: '6. SISTEMA DE SUSPENSÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'fe_6_observacoes', category: '6. SISTEMA DE SUSPENSÃO', text: 'Observações', responseType: 'text_long' },

    // 7. SISTEMA DE FREIOS
    { id: 'fe_7_freio_servico', category: '7. SISTEMA DE FREIOS', text: 'Freio de serviço eficiente', responseType: 'ok_nok' },
    { id: 'fe_7_freio_estacionamento', category: '7. SISTEMA DE FREIOS', text: 'Freio de estacionamento eficiente', responseType: 'ok_nok' },
    { id: 'fe_7_discos_tambores', category: '7. SISTEMA DE FREIOS', text: 'Discos/tambores em condições adequadas', responseType: 'bom_reg_ruim' },
    { id: 'fe_7_pastilhas_lonas', category: '7. SISTEMA DE FREIOS', text: 'Pastilhas/lonas em condições adequadas', responseType: 'bom_reg_ruim' },
    { id: 'fe_7_tubulacoes_integras', category: '7. SISTEMA DE FREIOS', text: 'Tubulações íntegras', responseType: 'ok_nok' },
    { id: 'fe_7_sem_vazamentos', category: '7. SISTEMA DE FREIOS', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'fe_7_observacoes', category: '7. SISTEMA DE FREIOS', text: 'Observações', responseType: 'text_long' },

    // 8. MOTOR E TRANSMISSÃO
    { id: 'fe_8_partida_normal', category: '8. MOTOR E TRANSMISSÃO', text: 'Partida normal', responseType: 'ok_nok' },
    { id: 'fe_8_marcha_lenta', category: '8. MOTOR E TRANSMISSÃO', text: 'Marcha lenta estável', responseType: 'ok_nok' },
    { id: 'fe_8_sem_vazamentos', category: '8. MOTOR E TRANSMISSÃO', text: 'Ausência de vazamentos', responseType: 'ok_nok' },
    { id: 'fe_8_arrefecimento_adequado', category: '8. MOTOR E TRANSMISSÃO', text: 'Sistema de arrefecimento adequado', responseType: 'ok_nok' },
    { id: 'fe_8_emissao_fumaca', category: '8. MOTOR E TRANSMISSÃO', text: 'Emissão excessiva de fumaça', responseType: 'ok_nok' },
    { id: 'fe_8_transmissao_adequada', category: '8. MOTOR E TRANSMISSÃO', text: 'Transmissão funcionando adequadamente', responseType: 'ok_nok' },
    { id: 'fe_8_estado_geral', category: '8. MOTOR E TRANSMISSÃO', text: 'Estado geral du conjunto mecânico', responseType: 'bom_reg_ruim' },
    { id: 'fe_8_observacoes', category: '8. MOTOR E TRANSMISSÃO', text: 'Observações', responseType: 'text_long' },

    // 9. PNEUS E RODADOS
    { id: 'fe_9_pneus_dianteiros', category: '9. PNEUS E RODADOS', text: 'Pneus dianteiros', responseType: 'bom_reg_ruim' },
    { id: 'fe_9_pneus_traseiros', category: '9. PNEUS E RODADOS', text: 'Pneus traseiros', responseType: 'bom_reg_ruim' },
    { id: 'fe_9_sulco_legal', category: '9. PNEUS E RODADOS', text: 'Sulco dentro do limite legal', responseType: 'c_nc' },
    { id: 'fe_9_sem_avarias', category: '9. PNEUS E RODADOS', text: 'Ausência de avarias', responseType: 'ok_nok' },
    { id: 'fe_9_estepe_disponivel', category: '9. PNEUS E RODADOS', text: 'Estepe disponível', responseType: 'c_nc' },
    { id: 'fe_9_rodas_estado', category: '9. PNEUS E RODADOS', text: 'Rodas em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'fe_9_observacoes', category: '9. PNEUS E RODADOS', text: 'Observações', responseType: 'text_long' },

    // 10. SISTEMA ELÉTRICO E ILUMINAÇÃO
    { id: 'fe_10_farois_baixos', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Faróis baixos', responseType: 'ok_nok' },
    { id: 'fe_10_farois_altos', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Faróis altos', responseType: 'ok_nok' },
    { id: 'fe_10_lanternas_traseiras', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Lanternas traseiras', responseType: 'ok_nok' },
    { id: 'fe_10_luzes_freio', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Luzes de freio', responseType: 'ok_nok' },
    { id: 'fe_10_direcao_setas', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Luzes indicadoras de direção', responseType: 'ok_nok' },
    { id: 'fe_10_luz_re', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Luz de ré', responseType: 'ok_nok' },
    { id: 'fe_10_luz_interna', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Luz interna do salão', responseType: 'ok_nok' },
    { id: 'fe_10_painel_instrumentos', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Painel de instrumentos', responseType: 'ok_nok' },
    { id: 'fe_10_observacoes', category: '10. SISTEMA ELÉTRICO E ILUMINAÇÃO', text: 'Observações', responseType: 'text_long' },

    // 11. PORTAS E SAÍDAS DE EMERGÊNCIA
    { id: 'fe_11_porta_principal', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Porta principal operacional', responseType: 'ok_nok' },
    { id: 'fe_11_sistema_travamento', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Sistema de travamento funcional', responseType: 'ok_nok' },
    { id: 'fe_11_saida_emergencia_id', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Saída de emergência identificada', responseType: 'c_nc' },
    { id: 'fe_11_saida_emergencia_op', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Saída de emergência operacional', responseType: 'c_nc' },
    { id: 'fe_11_janelas_emergencia', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Janelas de emergência sinalizadas', responseType: 'c_nc_na' },
    { id: 'fe_11_observacoes', category: '11. PORTAS E SAÍDAS DE EMERGÊNCIA', text: 'Observações', responseType: 'text_long' },

    // 12. INTERIOR E CONFORTO
    { id: 'fe_12_bancos_estado', category: '12. INTERIOR E CONFORTO', text: 'Bancos em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'fe_12_fixacao_bancos', category: '12. INTERIOR E CONFORTO', text: 'Fixação dos bancos adequada', responseType: 'c_nc' },
    { id: 'fe_12_revestimentos', category: '12. INTERIOR E CONFORTO', text: 'Revestimentos em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'fe_12_piso_interno', category: '12. INTERIOR E CONFORTO', text: 'Piso interno íntegro', responseType: 'bom_reg_ruim' },
    { id: 'fe_12_corrimaos', category: '12. INTERIOR E CONFORTO', text: 'Corrimãos em bom estado', responseType: 'bom_reg_ruim' },
    { id: 'fe_12_limpeza_interna', category: '12. INTERIOR E CONFORTO', text: 'Limpeza interna adequada', responseType: 'bom_reg_ruim' },
    { id: 'fe_12_observacoes', category: '12. INTERIOR E CONFORTO', text: 'Observações', responseType: 'text_long' },

    // 13. SEGURANÇA DOS PASSAGEIROS
    { id: 'fe_13_cintos_disponiveis', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Cintos de segurança disponíveis', responseType: 'c_nc' },
    { id: 'fe_13_cintos_operacionais', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Cintos operacionais', responseType: 'c_nc' },
    { id: 'fe_13_extintor_valido', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Extintor válido (quando aplicável)', responseType: 'c_nc' },
    { id: 'fe_13_martelos_emergencia', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Martelos de emergência disponíveis', responseType: 'c_nc_na' },
    { id: 'fe_13_kit_primeiros_socorros', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Kit de primeiros socorros (quando exigido)', responseType: 'c_nc_na' },
    { id: 'fe_13_tacografo', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Tacógrafo operacional', responseType: 'c_nc_na' },
    { id: 'fe_13_observacoes', category: '13. SEGURANÇA DOS PASSAGEIROS', text: 'Observações', responseType: 'text_long' },

    // 14. ACESSIBILIDADE (QUANDO APLICÁVEL)
    { id: 'fe_14_elevador_plataforma', category: '14. ACESSIBILIDADE (QUANDO APLICÁVEL)', text: 'Elevador/plataforma operacional', responseType: 'c_nc_na' },
    { id: 'fe_14_espaco_cadeirante', category: '14. ACESSIBILIDADE (QUANDO APLICÁVEL)', text: 'Espaço reservado para cadeirante', responseType: 'c_nc_na' },
    { id: 'fe_14_ancoragem_cadeira', category: '14. ACESSIBILIDADE (QUANDO APLICÁVEL)', text: 'Sistema de ancoragem disponível', responseType: 'c_nc_na' },
    { id: 'fe_14_sinalizacao_acessibilidade', category: '14. ACESSIBILIDADE (QUANDO APLICÁVEL)', text: 'Sinalização de acessibilidade', responseType: 'c_nc_na' },
    { id: 'fe_14_observacoes', category: '14. ACESSIBILIDADE (QUANDO APLICÁVEL)', text: 'Observações', responseType: 'text_long' },

    // 15. CONDUTOR
    { id: 'fe_15_cnh_compativel', category: '15. CONDUTOR', text: 'CNH compatível com a categoria', responseType: 'c_nc' },
    { id: 'fe_15_curso_transporte_escolar', category: '15. CONDUTOR', text: 'Curso de transporte escolar válido', responseType: 'c_nc' },
    { id: 'fe_15_exame_toxicologico', category: '15. CONDUTOR', text: 'Exame toxicológico válido (quando aplicável)', responseType: 'c_nc_na' },
    { id: 'fe_15_apresentacao_adequada', category: '15. CONDUTOR', text: 'Apresentação adequada', responseType: 'bom_reg_ruim' },
    { id: 'fe_15_observacoes', category: '15. CONDUTOR', text: 'Observações', responseType: 'text_long' },

    // 16. REGISTRO FOTOGRÁFICO
    { id: 'fe_16_foto_frontal', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista frontal', responseType: 'photo' },
    { id: 'fe_16_foto_traseira', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista traseira', responseType: 'photo' },
    { id: 'fe_16_foto_lateral_dir', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral direita', responseType: 'photo' },
    { id: 'fe_16_foto_lateral_esq', category: '16. REGISTRO FOTOGRÁFICO', text: 'Vista lateral esquerda', responseType: 'photo' },
    { id: 'fe_16_foto_faixa_escolar', category: '16. REGISTRO FOTOGRÁFICO', text: 'Faixa escolar', responseType: 'photo' },
    { id: 'fe_16_foto_placa', category: '16. REGISTRO FOTOGRÁFICO', text: 'Placa', responseType: 'photo' },
    { id: 'fe_16_foto_interior', category: '16. REGISTRO FOTOGRÁFICO', text: 'Interior do veículo', responseType: 'photo' },
    { id: 'fe_16_foto_bancos', category: '16. REGISTRO FOTOGRÁFICO', text: 'Bancos', responseType: 'photo' },
    { id: 'fe_16_foto_saidas_emergencia', category: '16. REGISTRO FOTOGRÁFICO', text: 'Saídas de segurança', responseType: 'photo' },
    { id: 'fe_16_foto_pneus', category: '16. REGISTRO FOTOGRÁFICO', text: 'Pneus', responseType: 'photo' },
    { id: 'fe_16_foto_nao_conformidades', category: '16. REGISTRO FOTOGRÁFICO', text: 'Não conformidades encontradas', responseType: 'photo' }
  ],
  nr13: [
    { id: 'nr13_1_identificacao', category: '1. IDENTIFICAÇÃO E DOCUMENTAÇÃO', text: 'Placa de identificação fixada, legível e com dados obrigatórios (PMTA, PTH, Categoria, Volume)', responseType: 'c_nc' },
    { id: 'nr13_2_prontuario', category: '1. IDENTIFICAÇÃO E DOCUMENTAÇÃO', text: 'Prontuário técnico do fabricante em português e livro de registro de segurança disponíveis e atualizados', responseType: 'c_nc_na' },
    { id: 'nr13_3_psv_calibrada', category: '2. DISPOSITIVOS DE SEGURANÇA E CONTROLE', text: 'Válvula de segurança (PSV) instalada, calibrada dentro do prazo legal e com lacre físico íntegro', responseType: 'c_nc' },
    { id: 'nr13_4_manometro', category: '2. DISPOSITIVOS DE SEGURANÇA E CONTROLE', text: 'Manômetro com indicação legível, calibrado e com marcação de pressão máxima de trabalho', responseType: 'c_nc' },
    { id: 'nr13_5_drenos_purgadores', category: '3. INTEGRIDADE FÍSICA E ACESSÓRIOS', text: 'Drenos, purgadores, visores de nível e demais acessórios de controle em perfeito funcionamento', responseType: 'c_nc_na' },
    { id: 'nr13_6_estrutura_suportes', category: '3. INTEGRIDADE FÍSICA E ACESSÓRIOS', text: 'Estrutura metálica de suporte e tubulações interligadas livres de oxidação severa, vazamentos ou deformações', responseType: 'c_nc' },
    { id: 'nr13_7_exame_visual', category: '4. ENSAIOS E INTEGRIDADES', text: 'Exame visual externo e interno (se aplicável) livre de trincas, pites, corrosão acentuada ou amassamentos', responseType: 'c_nc' },
    { id: 'nr13_8_ultrassom_espessura', category: '4. ENSAIOS E INTEGRIDADES', text: 'Medição de espessura por ultrassom realizada e em conformidade com a espessura mínima de projeto', responseType: 'c_nc' },
    { id: 'nr13_9_instalacao_sala', category: '5. SEGURANÇA OPERACIONAL E AMBIENTE', text: 'Local de instalação atende os requisitos de ventilação, acessos, saídas de emergência e sinalização', responseType: 'c_nc' },
    { id: 'nr13_10_operador_habilitado', category: '5. SEGURANÇA OPERACIONAL E AMBIENTE', text: 'Operador devidamente capacitado e habilitado sob as regras da NR-13 (com treinamento teórico e prático)', responseType: 'c_nc_na' }
  ]
};

const CHECKLIST_GROUPS = [
  {
    category: 'Laudos Gerais',
    types: [
      { type: 'nr12', label: 'NR-12' },
      { type: 'nr13', label: 'NR-13 (Vasos e Caldeiras)' },
      { type: 'pmoc', label: 'PMOC (Ar Condicionado)' },
      { type: 'munck', label: 'Munck (Guindauto)' },
      { type: 'guindaste', label: 'Guindaste' },
      { type: 'maquinas_pesadas', label: 'Máquinas Pesadas' },
      { type: 'playground', label: 'Playgrounds' }
    ] as { type: ChecklistType; label: string }[]
  },
  {
    category: 'Inspeção Veicular',
    types: [
      { type: 'reclassificacao_monta', label: 'Reclassificação de Monta' },
      { type: 'integridade_fisica', label: 'Integridade Física' },
      { type: 'frota_escolar', label: 'Frota Escolar' }
    ] as { type: ChecklistType; label: string }[]
  }
];

const getCategoryNumber = (cat: string): number => {
  const match = cat.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
};

const sortQuestionsByNumberedCategory = (questions: ChecklistQuestion[]): ChecklistQuestion[] => {
  if (!questions) return [];
  return [...questions].sort((a, b) => {
    const numA = getCategoryNumber(a.category);
    const numB = getCategoryNumber(b.category);
    
    if (numA !== numB) {
      return numA - numB;
    }
    
    const catCompare = a.category.localeCompare(b.category, 'pt-BR', { numeric: true });
    if (catCompare !== 0) return catCompare;
    
    return a.id.localeCompare(b.id, 'pt-BR', { numeric: true });
  });
};

interface ChecklistManagerProps {
  checklists?: ChecklistData[];
  clients?: ClientData[];
  equipments?: EquipmentData[];
  loading?: boolean;
  onDataChanged?: () => void;
}

export default function ChecklistManager({
  checklists: propChecklists,
  clients: propClients,
  equipments: propEquipments,
  loading: propLoading,
  onDataChanged
}: ChecklistManagerProps = {}) {
  const [checklists, setChecklists] = useState<ChecklistData[]>(propChecklists || []);
  const [clients, setClients] = useState<ClientData[]>(propClients || []);
  const [equipments, setEquipments] = useState<EquipmentData[]>(propEquipments || []);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [printingChecklist, setPrintingChecklist] = useState<ChecklistData | null>(null);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);

  // Custom confirmation modal state to prevent iframe window.confirm blocks
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Custom questions map state
  const [questionsMap, setQuestionsMap] = useState<Record<ChecklistType, ChecklistQuestion[]>>(QUESTIONS_BY_TYPE);
  const [activeTab, setActiveTab] = useState<'history' | 'setup'>('history');

  // Editor states
  const [selectedSetupType, setSelectedSetupType] = useState<ChecklistType>('nr12');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState('');
  const [editingText, setEditingText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionResponseType, setNewQuestionResponseType] = useState<QuestionResponseType>('default');
  const [editingResponseType, setEditingResponseType] = useState<QuestionResponseType>('default');

  // New Checklist Form fields
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEq, setSelectedEq] = useState('');
  const [checklistType, setChecklistType] = useState<ChecklistType>('nr12');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inspectorName, setInspectorName] = useState('Eng. Vitor Leonardo C. Linhares');

  // NR-12 metadata fields
  const [nr12Empresa, setNr12Empresa] = useState('');
  const [nr12Maquina, setNr12Maquina] = useState('');
  const [nr12Fabricante, setNr12Fabricante] = useState('');
  const [nr12Tag, setNr12Tag] = useState('');
  const [nr12Qtd, setNr12Qtd] = useState('');
  const [nr12QtdOperador, setNr12QtdOperador] = useState('');
  const [nr12Setor, setNr12Setor] = useState('');
  const [nr12ResponsavelServico, setNr12ResponsavelServico] = useState('');
  const [nr12Contato, setNr12Contato] = useState('');
  const [nr12DataChecklist, setNr12DataChecklist] = useState('');

  // PMOC metadata fields
  const [pmocObs01, setPmocObs01] = useState('Existe apenas o projeto arquitetonico do salão de festas');
  const [pmocObs02, setPmocObs02] = useState('');
  const [pmocObs03, setPmocObs03] = useState('');
  const [pmocObs04, setPmocObs04] = useState('');
  const [pmocAnotacoes, setPmocAnotacoes] = useState('');

  // Per-item photos and notes
  const [questionPhotos, setQuestionPhotos] = useState<Record<string, string[]>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Camera stream and frame capturing states
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{ questionId: string; isSupplementary: boolean } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.error("Error playing video stream:", err));
    }
  }, [cameraModalOpen, cameraStream]);

  const startCamera = async (questionId: string, isSupplementary: boolean) => {
    setCameraTarget({ questionId, isSupplementary });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      setCameraModalOpen(true);
    } catch (err: any) {
      console.warn("Retrying camera with generic constraints:", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setCameraStream(stream);
        setCameraModalOpen(true);
      } catch (camErr: any) {
        console.error(camErr);
        alert("Não foi possível acessar a câmera do dispositivo. Por favor, libere a permissão de câmera nas configurações do seu navegador para este site.");
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraModalOpen(false);
    setCameraTarget(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraTarget) return;
    const video = videoRef.current;
    try {
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (cameraTarget.isSupplementary) {
          const currentPhotos = questionPhotos[cameraTarget.questionId] || [];
          if (currentPhotos.length >= 3) {
            alert("Máximo de 3 fotos de evidência alcançado.");
          } else {
            setQuestionPhotos(prev => ({
              ...prev,
              [cameraTarget.questionId]: [...(prev[cameraTarget.questionId] || []), dataUrl]
            }));
          }
        } else {
          handleAnswerChange(cameraTarget.questionId, dataUrl);
        }
      }
      stopCamera();
    } catch (err) {
      console.error("Erro ao capturar foto pela câmera:", err);
      alert("Erro ao capturar e processar imagem da câmera.");
    }
  };

  const loadCustomQuestions = async () => {
    try {
      // Start with a clean deep copy of the modern, code-defined QUESTIONS_BY_TYPE
      const mergedMap = JSON.parse(JSON.stringify(QUESTIONS_BY_TYPE)) as Record<ChecklistType, ChecklistQuestion[]>;

      if (isRealFirebase) {
        const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
        const dbQuestions: any[] = [];
        querySnapshot.forEach(docSnap => dbQuestions.push(docSnap.data()));
        
        if (dbQuestions.length > 0) {
          dbQuestions.forEach(q => {
            const type = q.type as ChecklistType;
            if (mergedMap[type]) {
              if (q.text === 'DELETED') {
                // Remove the question from our modern blueprint
                mergedMap[type] = mergedMap[type].filter(item => item.id !== q.id);
              } else {
                const updatedQ: ChecklistQuestion = {
                  id: q.id,
                  category: q.category || 'Geral',
                  text: q.text || '',
                  responseType: (q.responseType as QuestionResponseType) || 'default'
                };
                
                const existingIdx = mergedMap[type].findIndex(item => item.id === q.id);
                if (existingIdx !== -1) {
                  // If it's a current default question, apply the user's custom edit (category, text, or responseType)
                  mergedMap[type][existingIdx] = updatedQ;
                } else if (q.id && q.id.startsWith('q_')) {
                  // Only append new questions if they are user-created custom questions (starts with 'q_')
                  mergedMap[type].push(updatedQ);
                }
                // Legacy default questions that are no longer part of our code-defined QUESTIONS_BY_TYPE are silently ignored!
              }
            }
          });
        }
      } else {
        const saved = localStorage.getItem('vitor_engmec_custom_questions');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Record<ChecklistType, ChecklistQuestion[]>;
            
            (Object.keys(parsed) as ChecklistType[]).forEach(type => {
              if (parsed[type] && parsed[type].length > 0 && mergedMap[type]) {
                parsed[type].forEach(q => {
                  if (q.text === 'DELETED') {
                    // Remove if marked deleted
                    mergedMap[type] = mergedMap[type].filter(item => item.id !== q.id);
                  } else {
                    const existingIdx = mergedMap[type].findIndex(item => item.id === q.id);
                    if (existingIdx !== -1) {
                      // Check if it's actually edited to prevent overwriting new modern defaults with old cached unmodified ones
                      const defaultQ = QUESTIONS_BY_TYPE[type].find(item => item.id === q.id);
                      const isEdited = defaultQ && (defaultQ.text !== q.text || defaultQ.category !== q.category || defaultQ.responseType !== q.responseType);
                      if (isEdited) {
                        mergedMap[type][existingIdx] = q;
                      }
                    } else if (q.id && q.id.startsWith('q_')) {
                      // Append custom questions
                      mergedMap[type].push(q);
                    }
                  }
                });
              }
            });
          } catch (e) {
            console.warn("Could not parse saved custom questions from localStorage", e);
          }
        }
      }

      // Fallback guard: Ensure checklists are never overridden to empty states
      (Object.keys(QUESTIONS_BY_TYPE) as ChecklistType[]).forEach(type => {
        if (!mergedMap[type] || mergedMap[type].length === 0) {
          mergedMap[type] = QUESTIONS_BY_TYPE[type];
        }
      });

      // Apply locally stored deleted default questions
      const savedDeleted = localStorage.getItem('vitor_engmec_deleted_questions');
      if (savedDeleted) {
        try {
          const deletedList = JSON.parse(savedDeleted) as string[];
          deletedList.forEach(itemKey => {
            const parts = itemKey.split('_');
            if (parts.length >= 2) {
              const type = parts[0] as ChecklistType;
              const qId = parts.slice(1).join('_');
              if (mergedMap[type]) {
                mergedMap[type] = mergedMap[type].filter(item => item.id !== qId);
              }
            }
          });
        } catch (e) {
          console.warn("Could not parse saved deleted questions list", e);
        }
      }

      setQuestionsMap(mergedMap);
    } catch (e) {
      console.warn("Could not load custom questions, using defaults:", e);
      setQuestionsMap(QUESTIONS_BY_TYPE);
    }
  };

  useEffect(() => {
    if (propChecklists) setChecklists(propChecklists);
    if (propClients) {
      setClients(propClients);
      if (propClients.length > 0 && !selectedClient) setSelectedClient(propClients[0].id);
    }
    if (propEquipments) setEquipments(propEquipments);
    if (propLoading !== undefined) setLoading(propLoading);
  }, [propChecklists, propClients, propEquipments, propLoading]);

  useEffect(() => {
    if (!propChecklists) {
      loadData();
    }
    loadCustomQuestions();
  }, [propChecklists]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const [querySnapshot, clientsSnap, eqSnap] = await Promise.all([
          getDocs(collection(db, 'checklists')),
          getDocs(collection(db, 'clients')),
          getDocs(collection(db, 'equipments'))
        ]);

        const arr: ChecklistData[] = [];
        querySnapshot.forEach(docSnap => arr.push(docSnap.data() as ChecklistData));
        setChecklists(arr);

        const cliArray: ClientData[] = [];
        clientsSnap.forEach(docSnap => cliArray.push(docSnap.data() as ClientData));
        setClients(cliArray);
        if (cliArray.length > 0) setSelectedClient(cliArray[0].id);

        const eqArray: EquipmentData[] = [];
        eqSnap.forEach(docSnap => eqArray.push(docSnap.data() as EquipmentData));
        setEquipments(eqArray);
      } else {
        setChecklists(mockDb.getChecklists());
        const mockClis = mockDb.getClients();
        setClients(mockClis);
        if (mockClis.length > 0) setSelectedClient(mockClis[0].id);
        setEquipments(mockDb.getEquipments());
      }
      onDataChanged?.();
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'checklists');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      const activeEqs = equipments.filter(e => e.clientId === selectedClient);
      const matchedClient = clients.find(c => c.id === selectedClient);
      if (matchedClient) {
        setNr12Empresa(matchedClient.company);
      }
      if (activeEqs.length > 0) {
        const firstEq = activeEqs[0];
        setSelectedEq(firstEq.id);
        setNr12Maquina(`${firstEq.type} (${firstEq.model})`);
        setNr12Fabricante(firstEq.brand);
      } else {
        setSelectedEq('');
        setNr12Maquina('');
        setNr12Fabricante('');
      }
      setNr12DataChecklist(new Date().toISOString().split('T')[0]);
      setNr12ResponsavelServico(inspectorName);
    }
  }, [selectedClient, equipments, clients, inspectorName]);

  useEffect(() => {
    if (selectedEq) {
      const matchedEq = equipments.find(e => e.id === selectedEq);
      if (matchedEq) {
        setNr12Maquina(`${matchedEq.type} (${matchedEq.model})`);
        setNr12Fabricante(matchedEq.brand);
      }
    }
  }, [selectedEq, equipments]);

  // Handle drawing on signature canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#134074';
    ctx.lineWidth = 2;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  // Handle touch events on signature canvas (mobile and tablets)
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#134074';
    ctx.lineWidth = 2;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSignatureSaved(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  // Auto-save draft on changes (only when modal is open and we have actual user interactions)
  useEffect(() => {
    if (modalOpen) {
      const draftObj = {
        checklistType,
        selectedClient,
        selectedEq,
        answers,
        questionNotes,
        questionPhotos,
        inspectorName,
        nr12Empresa,
        nr12Maquina,
        nr12Fabricante,
        nr12Tag,
        nr12Qtd,
        nr12QtdOperador,
        nr12Setor,
        nr12ResponsavelServico,
        nr12Contato,
        nr12DataChecklist,
        pmocObs01,
        pmocObs02,
        pmocObs03,
        pmocObs04,
        pmocAnotacoes
      };
      
      const hasContent = Object.keys(answers).length > 0 || 
                         selectedClient || 
                         selectedEq || 
                         nr12Empresa || 
                         pmocAnotacoes;
                         
      if (hasContent) {
        localStorage.setItem('checklist_draft', JSON.stringify(draftObj));
      }
    }
  }, [
    modalOpen,
    checklistType,
    selectedClient,
    selectedEq,
    answers,
    questionNotes,
    questionPhotos,
    inspectorName,
    nr12Empresa,
    nr12Maquina,
    nr12Fabricante,
    nr12Tag,
    nr12Qtd,
    nr12QtdOperador,
    nr12Setor,
    nr12ResponsavelServico,
    nr12Contato,
    nr12DataChecklist,
    pmocObs01,
    pmocObs02,
    pmocObs03,
    pmocObs04,
    pmocAnotacoes
  ]);

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem('checklist_draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.checklistType) setChecklistType(draft.checklistType);
        if (draft.selectedClient) setSelectedClient(draft.selectedClient);
        if (draft.selectedEq) setSelectedEq(draft.selectedEq);
        if (draft.answers) setAnswers(draft.answers);
        if (draft.questionNotes) setQuestionNotes(draft.questionNotes);
        if (draft.questionPhotos) setQuestionPhotos(draft.questionPhotos);
        if (draft.inspectorName) setInspectorName(draft.inspectorName);
        if (draft.nr12Empresa) setNr12Empresa(draft.nr12Empresa);
        if (draft.nr12Maquina) setNr12Maquina(draft.nr12Maquina);
        if (draft.nr12Fabricante) setNr12Fabricante(draft.nr12Fabricante);
        if (draft.nr12Tag) setNr12Tag(draft.nr12Tag);
        if (draft.nr12Qtd) setNr12Qtd(draft.nr12Qtd);
        if (draft.nr12QtdOperador) setNr12QtdOperador(draft.nr12QtdOperador);
        if (draft.nr12Setor) setNr12Setor(draft.nr12Setor);
        if (draft.nr12ResponsavelServico) setNr12ResponsavelServico(draft.nr12ResponsavelServico);
        if (draft.nr12Contato) setNr12Contato(draft.nr12Contato);
        if (draft.nr12DataChecklist) setNr12DataChecklist(draft.nr12DataChecklist);
        if (draft.pmocObs01) setPmocObs01(draft.pmocObs01);
        if (draft.pmocObs02) setPmocObs02(draft.pmocObs02);
        if (draft.pmocObs03) setPmocObs03(draft.pmocObs03);
        if (draft.pmocObs04) setPmocObs04(draft.pmocObs04);
        if (draft.pmocAnotacoes) setPmocAnotacoes(draft.pmocAnotacoes);
      }
    } catch (e) {
      console.error("Error restoring draft:", e);
    }
    setHasDraft(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('checklist_draft');
    setHasDraft(false);
    clearForm();
  };

  // Build Answers model
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getCardStatusClasses = (qId: string) => {
    const ans = answers[qId];
    if (ans === undefined || ans === '') {
      return 'border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-450 dark:border-l-amber-500 bg-white dark:bg-slate-900/60';
    }
    if (ans === 'C' || ans === 'OK' || ans === 'BOM' || ans === 'SIM' || ans === 'APROVADO') {
      return 'border border-emerald-100 dark:border-emerald-900/30 border-l-4 border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10';
    }
    if (ans === 'NC' || ans === 'NOK' || ans === 'RUIM' || ans === 'NÃO' || ans === 'REPROVADO') {
      return 'border border-rose-100 dark:border-rose-900/30 border-l-4 border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/10';
    }
    if (ans === 'NA' || ans === 'N/A' || ans === 'N.A.') {
      return 'border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-400 bg-slate-50/50 dark:bg-slate-900/30';
    }
    return 'border border-blue-100 dark:border-blue-900/30 border-l-4 border-l-[#134074] bg-blue-50/10 dark:bg-blue-950/10';
  };

  const getOptionButtonClass = (qId: string, option: string) => {
    const isSelected = answers[qId] === option;
    const opt = option.toUpperCase();
    
    // Positive options
    if (['C', 'OK', 'BOM', 'SIM', 'APROVADO', 'EXCELENTE', 'BOA', 'INTERNO', 'PEQUENA MONTA', 'PASSEIO', 'SPLIT', 'CASSETE', 'BOM / SIM'].includes(opt)) {
      return isSelected
        ? 'px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer bg-emerald-500 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
        : 'px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-emerald-500/5';
    }
    
    // Negative options
    if (['NC', 'NOK', 'RUIM', 'NÃO', 'REPROVADO', 'GRANDE MONTA', 'N.C / NÃO'].includes(opt)) {
      return isSelected
        ? 'px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-500/20'
        : 'px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-500/5';
    }
    
    // Warning/Neutral options
    if (['REGULAR', 'MÉDIA MONTA'].includes(opt)) {
      return isSelected
        ? 'px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-500/20'
        : 'px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-300 dark:hover:bg-amber-500/5';
    }
    
    // N.A. options
    if (['NA', 'N/A', 'N.A.'].includes(opt)) {
      return isSelected
        ? 'px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer bg-slate-500 text-white border-slate-500 shadow-sm ring-2 ring-slate-500/20'
        : 'px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-slate-500/10 hover:text-slate-600 hover:border-slate-300 dark:hover:bg-slate-500/5';
    }
    
    // Default blue selected options
    return isSelected
      ? 'px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer bg-[#134074] text-white border-[#134074] shadow-sm ring-2 ring-[#134074]/20'
      : 'px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-blue-500/10 hover:text-[#134074] hover:border-blue-300 dark:hover:bg-blue-500/5';
  };

  const cleanUndefined = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefined).filter(val => val !== undefined);
    }
    const cleanObj: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleanObj[key] = cleanUndefined(obj[key]);
      }
    }
    return cleanObj;
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedClient || !selectedEq) {
      setError('Por favor, selecione um Cliente Real e um Ativo correspondente.');
      return;
    }

    if (!signatureSaved) {
      setError('Por favor, assine eletronicamente com o Mouse ou Toque no painel de assinatura antes de Registrar a Vistoria.');
      return;
    }

    setLoading(true);
    const matchedClient = clients.find(c => c.id === selectedClient);
    const matchedEq = equipments.find(eq => eq.id === selectedEq);
    const chkId = editingChecklistId || ('chk_' + Math.random().toString(36).substr(2, 9));

    // Grab canvas drawing representation
    let signatureUrl = '';
    const canvas = canvasRef.current;
    if (canvas && signatureSaved) {
      signatureUrl = canvas.toDataURL('image/png');
    }

    const compiledAnswers: Record<string, string | boolean> = {};
    questionsMap[checklistType].forEach(q => {
      compiledAnswers[q.id] = answers[q.id] || 'NA'; // Stores 'C', 'NC', or 'NA'
    });

    const saveObj: ChecklistData = {
      id: chkId,
      type: checklistType,
      clientId: selectedClient,
      clientName: matchedClient ? matchedClient.company : 'Cliente',
      equipmentId: selectedEq,
      equipmentModel: matchedEq ? `${matchedEq.type} (${matchedEq.model})` : 'Equipamento',
      questions: compiledAnswers,
      signatureUrl: signatureUrl || (editingChecklistId ? (checklists.find(c => c.id === editingChecklistId)?.signatureUrl || '') : ''),
      digitalSignature: editingChecklistId ? (checklists.find(c => c.id === editingChecklistId)?.digitalSignature || 'MD5:' + Math.random().toString(36).substr(2, 5) + Date.now().toString(36)) : 'MD5:' + Math.random().toString(36).substr(2, 5) + Date.now().toString(36),
      inspectorName: inspectorName,
      createdAt: editingChecklistId ? (checklists.find(c => c.id === editingChecklistId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nr12Metadata: checklistType === 'nr12' ? {
        empresa: nr12Empresa,
        maquina: nr12Maquina,
        fabricante: nr12Fabricante,
        tag: nr12Tag,
        qtd: nr12Qtd,
        qtdOperador: nr12QtdOperador,
        setor: nr12Setor,
        responsavelServico: nr12ResponsavelServico,
        contato: nr12Contato,
        dataChecklist: nr12DataChecklist || new Date().toISOString().split('T')[0]
      } : undefined,
      pmocMetadata: checklistType === 'pmoc' ? {
        obs01: pmocObs01,
        obs02: pmocObs02,
        obs03: pmocObs03,
        obs04: pmocObs04,
        anotacoes: pmocAnotacoes
      } : undefined,
      questionPhotos: questionPhotos,
      questionNotes: questionNotes
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout_error')), 5000)
    );

    try {
      const sanitizedSaveObj = cleanUndefined(saveObj);
      if (isRealFirebase) {
        await Promise.race([
          setDoc(doc(db, 'checklists', chkId), sanitizedSaveObj),
          timeoutPromise
        ]);
      } else {
        mockDb.saveChecklist(sanitizedSaveObj);
      }
      setModalOpen(false);
      setSuccess(editingChecklistId ? 'Vistoria técnica atualizada com sucesso!' : 'Vistoria técnica cadastrada com sucesso!');
      setTimeout(() => setSuccess(null), 4500);
      localStorage.removeItem('checklist_draft');
      setHasDraft(false);
      clearForm();
      loadData();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Erro de permissão ou conexão ao salvar seu checklist de vistoria no Firestore.';
      if (err.message === 'timeout_error') {
        errMsg = 'A gravação de dados expirou (Timeout de 5s). O Google Firestore parece estar inacessível ou bloqueado por cookies de terceiros neste iFrame. Ative o "Modo Sandbox Offline" no menu lateral para salvar localmente sem restrições.';
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            errMsg = `Erro de Permissão (${parsed.operationType}): ${parsed.error}. Apenas engenheiros do nível 'GESTÃO' podem cadastrar vistorias no Firestore.`;
          }
        } catch (_) {
          if (err.message) errMsg = err.message;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (questionId: string, files: FileList | null) => {
    if (!files) return;
    const currentPhotos = questionPhotos[questionId] || [];
    if (currentPhotos.length >= 3) {
      alert("Você pode adicionar no máximo 3 fotos por item de inspeção.");
      return;
    }

    const loaders = Array.from(files).slice(0, 3 - currentPhotos.length).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then(base64s => {
      setQuestionPhotos(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), ...base64s]
      }));
    });
  };

  const handleRemovePhoto = (questionId: string, index: number) => {
    setQuestionPhotos(prev => {
      const updated = [...(prev[questionId] || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        [questionId]: updated
      };
    });
  };

  const handleNoteChange = (questionId: string, val: string) => {
    setQuestionNotes(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const clearForm = () => {
    setAnswers({});
    setSignatureSaved(false);
    setChecklistType('nr12');
    setPmocObs01('Existe apenas o projeto arquitetonico do salão de festas');
    setPmocObs02('');
    setPmocObs03('');
    setPmocObs04('');
    setPmocAnotacoes('');
    setQuestionPhotos({});
    setQuestionNotes({});
    setEditingChecklistId(null);
  };

  const startEditChecklist = (chk: ChecklistData) => {
    setEditingChecklistId(chk.id);
    setSelectedClient(chk.clientId);
    setSelectedEq(chk.equipmentId);
    setChecklistType(chk.type);
    setAnswers(chk.questions || {});
    setInspectorName(chk.inspectorName || '');
    setQuestionPhotos(chk.questionPhotos || {});
    setQuestionNotes(chk.questionNotes || {});
    
    if (chk.nr12Metadata) {
      setNr12Empresa(chk.nr12Metadata.empresa || '');
      setNr12Maquina(chk.nr12Metadata.maquina || '');
      setNr12Fabricante(chk.nr12Metadata.fabricante || '');
      setNr12Tag(chk.nr12Metadata.tag || '');
      setNr12Qtd(chk.nr12Metadata.qtd || '');
      setNr12QtdOperador(chk.nr12Metadata.qtdOperador || '');
      setNr12Setor(chk.nr12Metadata.setor || '');
      setNr12ResponsavelServico(chk.nr12Metadata.responsavelServico || '');
      setNr12Contato(chk.nr12Metadata.contato || '');
      setNr12DataChecklist(chk.nr12Metadata.dataChecklist || '');
    }
    
    if (chk.pmocMetadata) {
      setPmocObs01(chk.pmocMetadata.obs01 || '');
      setPmocObs02(chk.pmocMetadata.obs02 || '');
      setPmocObs03(chk.pmocMetadata.obs03 || '');
      setPmocObs04(chk.pmocMetadata.obs04 || '');
      setPmocAnotacoes(chk.pmocMetadata.anotacoes || '');
    }

    if (chk.signatureUrl) {
      setSignatureSaved(true);
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
            };
            img.src = chk.signatureUrl;
          }
        }
      }, 200);
    } else {
      setSignatureSaved(false);
    }

    setModalOpen(true);
  };

  const handleSaveQuestion = async (type: ChecklistType, questionId: string, updatedCategory: string, updatedText: string, responseType: QuestionResponseType = 'default') => {
    if (!updatedCategory.trim() || !updatedText.trim()) return;
    
    const updatedList = questionsMap[type].map(q => {
      if (q.id === questionId) {
        return { ...q, category: updatedCategory, text: updatedText, responseType };
      }
      return q;
    });
    
    const newQuestionsMap = {
      ...questionsMap,
      [type]: updatedList
    };
    
    setQuestionsMap(newQuestionsMap);
    setEditingQuestionId(null);
    
    try {
      if (isRealFirebase) {
        const qDocId = `${type}_${questionId}`;
        await setDoc(doc(db, 'checklist_questions', qDocId), {
          id: questionId,
          type,
          category: updatedCategory,
          text: updatedText,
          responseType,
          createdAt: new Date().toISOString()
        });
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      if (isRealFirebase) {
        handleFirestoreError(err, OperationType.WRITE, `checklist_questions/${type}_${questionId}`);
      }
    }
  };

  const handleAddQuestion = async (type: ChecklistType, category: string, text: string, responseType: QuestionResponseType = 'default') => {
    if (!category.trim() || !text.trim()) return;
    const newId = 'q_' + Math.random().toString(36).substr(2, 9);
    const newQuestion: ChecklistQuestion = {
      id: newId,
      category,
      text,
      responseType
    };
    
    const updatedList = [...questionsMap[type], newQuestion];
    const newQuestionsMap = {
      ...questionsMap,
      [type]: updatedList
    };
    
    setQuestionsMap(newQuestionsMap);
    setNewQuestionCategory('');
    setNewQuestionText('');
    setNewQuestionResponseType('default');
    
    try {
      if (isRealFirebase) {
        const qDocId = `${type}_${newId}`;
        await setDoc(doc(db, 'checklist_questions', qDocId), {
          id: newId,
          type,
          category,
          text,
          responseType,
          createdAt: new Date().toISOString()
        });
      } else {
        localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
      }
    } catch (err) {
      if (isRealFirebase) {
        handleFirestoreError(err, OperationType.WRITE, `checklist_questions/${type}_${newId}`);
      }
    }
  };

  const handleDeleteQuestion = (type: ChecklistType, questionId: string) => {
    setConfirmState({
      title: 'Remover Item de Inspeção',
      message: 'Tem certeza que deseja remover este item de inspeção deste checklist?',
      onConfirm: async () => {
        const updatedList = questionsMap[type].filter(q => q.id !== questionId);
        const newQuestionsMap = {
          ...questionsMap,
          [type]: updatedList
        };
        
        setQuestionsMap(newQuestionsMap);
        
        try {
          if (isRealFirebase) {
            const qDocId = `${type}_${questionId}`;
            const isDefault = QUESTIONS_BY_TYPE[type]?.some(q => q.id === questionId);
            if (isDefault) {
              await setDoc(doc(db, 'checklist_questions', qDocId), {
                id: questionId,
                type,
                category: 'DELETED',
                text: 'DELETED',
                createdAt: new Date().toISOString()
              });
            } else {
              await deleteDoc(doc(db, 'checklist_questions', qDocId));
            }
          }

          // ALWAYS update local storage deleted tracking list
          const isDefault = QUESTIONS_BY_TYPE[type]?.some(q => q.id === questionId);
          if (isDefault) {
            const savedDeleted = localStorage.getItem('vitor_engmec_deleted_questions');
            let deletedList: string[] = [];
            if (savedDeleted) {
              try {
                deletedList = JSON.parse(savedDeleted);
              } catch (e) {}
            }
            const itemKey = `${type}_${questionId}`;
            if (!deletedList.includes(itemKey)) {
              deletedList.push(itemKey);
              localStorage.setItem('vitor_engmec_deleted_questions', JSON.stringify(deletedList));
            }
          }

          localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
        } catch (err) {
          if (isRealFirebase) {
            handleFirestoreError(err, OperationType.DELETE, `checklist_questions/${type}_${questionId}`);
          }
        }
      }
    });
  };

  const handleResetToDefault = (type: ChecklistType) => {
    setConfirmState({
      title: 'Restaurar Questões Padrão',
      message: `Tem certeza que deseja restaurar as questões padrão para ${type.toUpperCase()}? Isso apagará todas as suas edições e acréscimos nesta categoria.`,
      onConfirm: async () => {
        const newQuestionsMap = {
          ...questionsMap,
          [type]: QUESTIONS_BY_TYPE[type]
        };
        setQuestionsMap(newQuestionsMap);
        
        try {
          if (isRealFirebase) {
            const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
            querySnapshot.forEach(async (docSnap) => {
              const data = docSnap.data();
              if (data.type === type) {
                await deleteDoc(doc(db, 'checklist_questions', docSnap.id));
              }
            });
          }
          
          // Clear deleted list in localStorage for this type
          const savedDeleted = localStorage.getItem('vitor_engmec_deleted_questions');
          if (savedDeleted) {
            try {
              let deletedList: string[] = JSON.parse(savedDeleted);
              deletedList = deletedList.filter(item => !item.startsWith(`${type}_`));
              localStorage.setItem('vitor_engmec_deleted_questions', JSON.stringify(deletedList));
            } catch (e) {}
          }
          
          localStorage.setItem('vitor_engmec_custom_questions', JSON.stringify(newQuestionsMap));
        } catch (err) {
          console.error("Erro ao resetar padrão:", err);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      title: 'Excluir Checklist',
      message: 'Excluir este checklist permanentemente?',
      onConfirm: async () => {
        setLoading(true);
        try {
          if (isRealFirebase) {
            await deleteDoc(doc(db, 'checklists', id));
          } else {
            mockDb.deleteChecklist(id);
          }
          setSuccess('Checklist de vistoria removido com sucesso!');
          setTimeout(() => setSuccess(null), 4500);
          loadData();
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `checklists/${id}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const triggerPrint = (chk: ChecklistData) => {
    setPrintingChecklist(chk);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  return (
    <div className="space-y-6">
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-100 md:text-slate-900 dark:text-white">Módulo de Checklists Operacionais</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Instaurar vistorias táticas para NR-12, PMOC, Máquinas de Guindar, Inspeção Veicular e outras categorias regulamentadas, coletando assinaturas digitais e gerando relatórios técnicos estruturados em PDF para impressão.</p>
        </div>

        <button
          onClick={() => {
            setError(null);
            const draft = localStorage.getItem('checklist_draft');
            if (draft) {
              setHasDraft(true);
            } else {
              setHasDraft(false);
              clearForm();
            }
            setModalOpen(true);
          }}
          disabled={clients.length === 0 || equipments.length === 0}
          className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Realizar Vistoria</span>
        </button>
      </div>

      {/* Tabs Switcher for History & Checklists Setup Editor */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 pb-px gap-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'history'
              ? 'border-[#134074] text-[#134074] dark:text-[#4895EF]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          Histórico de Vistorias
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-[#4895EF]" />}
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`py-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'setup'
              ? 'border-[#134074] text-[#134074] dark:text-[#4895EF]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span>Configuração dos Itens dos Checklists</span>
          {activeTab === 'setup' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-[#4895EF]" />}
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
              <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
              <span>Processando auditorias...</span>
            </div>
          ) : checklists.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Nenhuma vistoria ou checklist cadastrado até o momento.
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Tipo checklist</th>
                  <th className="p-4">Cliente / Dispositivo</th>
                  <th className="p-4">Inspetor de Atividade</th>
                  <th className="p-4 font-mono">Assinatura Digital</th>
                  <th className="p-4 text-right">Laudo PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {checklists.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 text-[10px] font-black font-mono uppercase border border-slate-200/50">
                        {chk.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{chk.clientName}</div>
                      <div className="text-xs text-slate-500 font-sans">{chk.equipmentModel}</div>
                    </td>
                    <td className="p-4 space-y-0.5 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{chk.inspectorName}</div>
                      <div className="text-slate-400 font-mono text-[10px]">{new Date(chk.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {chk.signatureUrl ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                            <Lock className="w-3.5 h-3.5" />
                            <span>ASSINADO</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sem assinatura</span>
                        )}
                        <span className="text-[9px] text-slate-400/80 font-mono italic select-all block truncate max-w-[120px]" title={chk.digitalSignature}>
                          {chk.digitalSignature}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0 flex items-center justify-end">
                      <button
                        onClick={() => startEditChecklist(chk)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Editar Checklist"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => triggerPrint(chk)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-[#134074] hover:text-[#0B2545] hover:scale-105 transition-all inline-block cursor-pointer border border-[#134074]/20"
                        title="Imprimir Checklist"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(chk.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciador de Itens de Inspeção</h3>
              <p className="text-xs text-slate-400">Adicione, edite ou exclua itens das planilhas de vistoria por tipo de laudo.</p>
            </div>
            <button
              type="button"
              onClick={() => handleResetToDefault(selectedSetupType)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-rose-500 border border-slate-200 dark:border-slate-700 hover:border-rose-200 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Perguntas Padrão</span>
            </button>
          </div>

          <div className="space-y-4">
            {CHECKLIST_GROUPS.map((group) => (
              <div key={group.category} className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono pl-1">{group.category}</span>
                <div className="flex flex-wrap gap-2">
                  {group.types.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedSetupType(type);
                        setEditingQuestionId(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                        selectedSetupType === type
                          ? 'bg-[#134074] text-white border-[#134074] shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

             {/* New Item addition helper card */}
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase font-mono flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Adicionar Novo Item para Checklist {selectedSetupType.toUpperCase()}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Categoria</label>
                <input
                  type="text"
                  placeholder="EX: Riscos Mecânicos"
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-[#334255] rounded-lg px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Tipo de Resposta</label>
                <select
                  value={newQuestionResponseType}
                  onChange={(e) => setNewQuestionResponseType(e.target.value as QuestionResponseType)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-[#334255] rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="default" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">C / NC / NA (Padrão)</option>
                  <option value="ok_nok" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OK / NOK</option>
                  <option value="ok_nok_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OK / NOK / N/A</option>
                  <option value="bom_reg_ruim" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bom / Regular / Ruim</option>
                  <option value="text" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Campo de Texto</option>
                  <option value="number" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Número</option>
                  <option value="date" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Data</option>
                  <option value="photo" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Foto</option>
                  <option value="sim_nao" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sim / Não</option>
                  <option value="aprovado_reprovado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Aprovado / Reprovado</option>
                  <option value="c_nc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">C / NC (Conforme / Não Conforme)</option>
                  <option value="tipo_ar_condicionado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Ar Condicionado (PMOC)</option>
                  <option value="tipo_veiculo_reclassificacao" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Veículo (Reclassificação)</option>
                  <option value="tipo_veiculo_integridade" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Veículo (Integridade)</option>
                  <option value="classificacao_monta" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Classificação de Monta</option>
                  <option value="condicao_fisica_geral" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Condição Física Geral</option>
                  <option value="text_long" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Campo de Texto Longo</option>
                  <option value="c_nc_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Conforme / Não Conforme / N.A</option>
                  <option value="bom_reg_ruim_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bom / Regular / Ruim / N.A</option>
                  <option value="ambiente_playground" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ambiente (Interno / Externo)</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Texto do Item da Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="EX: Existem proteções físicas fixas nas áreas de esmagamento?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-[#334255] rounded-lg px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(selectedSetupType, newQuestionCategory || 'Geral', newQuestionText, newQuestionResponseType)}
                    className="shrink-0 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List items block */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Lista de Itens Atuais</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {questionsMap[selectedSetupType].length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum item cadastrado nesta categoria. Adicione no formulário acima.
                </div>
              ) : (
                sortQuestionsByNumberedCategory(questionsMap[selectedSetupType]).map((q) => (
                  <div key={q.id} className="pt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {editingQuestionId === q.id ? (
                      <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-350 font-mono uppercase">Categoria</label>
                          <input
                            type="text"
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-705 rounded p-1.5 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-455 dark:text-slate-345 font-mono uppercase">Resposta</label>
                          <select
                            value={editingResponseType}
                            onChange={(e) => setEditingResponseType(e.target.value as QuestionResponseType)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-[#334255] rounded p-1.5 text-xs text-slate-900 dark:text-white h-[32px] cursor-pointer outline-none"
                          >
                            <option value="default" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">C / NC / NA</option>
                            <option value="ok_nok" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OK / NOK</option>
                            <option value="ok_nok_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OK / NOK / N/A</option>
                            <option value="bom_reg_ruim" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bom / Regular / Ruim</option>
                            <option value="text" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Campo de Texto</option>
                            <option value="number" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Número</option>
                            <option value="date" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Data</option>
                            <option value="photo" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Foto</option>
                            <option value="sim_nao" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sim / Não</option>
                            <option value="aprovado_reprovado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Aprovado / Reprovado</option>
                            <option value="c_nc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">C / NC (Conforme / Não Conforme)</option>
                            <option value="tipo_ar_condicionado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Ar Condicionado (PMOC)</option>
                            <option value="tipo_veiculo_reclassificacao" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Veículo (Reclassificação)</option>
                            <option value="tipo_veiculo_integridade" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tipo de Veículo (Integridade)</option>
                            <option value="classificacao_monta" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Classificação de Monta</option>
                            <option value="condicao_fisica_geral" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Condição Física Geral</option>
                            <option value="text_long" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Campo de Texto Longo</option>
                            <option value="c_nc_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Conforme / Não Conforme / N.A</option>
                            <option value="bom_reg_ruim_na" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bom / Regular / Ruim / N.A</option>
                            <option value="ambiente_playground" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ambiente (Interno / Externo)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-455 dark:text-slate-345 font-mono uppercase">Texto do Item</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-705 rounded p-1.5 text-xs text-slate-900 dark:text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuestion(selectedSetupType, q.id, editingCategory, editingText, editingResponseType)}
                              className="bg-[#134074] hover:bg-[#0B2545] text-white px-3 py-1.5 rounded font-bold text-xs cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="bg-slate-200 dark:bg-slate-705 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-semibold text-xs cursor-pointer hover:bg-slate-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="inline-block text-[9px] font-mono font-bold text-[#134074] dark:text-[#4895EF] uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200/40">
                              {q.category}
                            </span>
                            <span className="inline-block text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-805 px-2 py-0.5 rounded border border-slate-250/50">
                              Tipo: {
                                q.responseType === 'text' ? 'Campo de Texto' :
                                q.responseType === 'ok_nok' ? 'OK / NOK' :
                                q.responseType === 'ok_nok_na' ? 'OK / NOK / N/A' :
                                q.responseType === 'bom_reg_ruim' ? 'Bom / Regular / Ruim' :
                                q.responseType === 'number' ? 'Número' :
                                q.responseType === 'date' ? 'Data' :
                                q.responseType === 'photo' ? 'Foto' :
                                q.responseType === 'sim_nao' ? 'Sim / Não' :
                                q.responseType === 'aprovado_reprovado' ? 'Aprovado / Reprovado' :
                                q.responseType === 'c_nc' ? 'C / NC (Conforme / Não Conforme)' :
                                q.responseType === 'tipo_ar_condicionado' ? 'Tipo de Ar Condicionado (PMOC)' :
                                q.responseType === 'tipo_veiculo_reclassificacao' ? 'Tipo de Veículo (Reclassificação)' :
                                q.responseType === 'tipo_veiculo_integridade' ? 'Tipo de Veículo (Integridade)' :
                                q.responseType === 'classificacao_monta' ? 'Classificação de Monta' :
                                q.responseType === 'condicao_fisica_geral' ? 'Condição Física Geral' :
                                q.responseType === 'text_long' ? 'Campo de Texto Longo' :
                                q.responseType === 'c_nc_na' ? 'C / NC / NA' :
                                q.responseType === 'bom_reg_ruim_na' ? 'Bom / Regular / Ruim / NA' :
                                q.responseType === 'ambiente_playground' ? 'Ambiente (Interno / Externo)' :
                                'C / NC / NA (Padrão)'
                              }
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 leading-normal">{q.text}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setEditingCategory(q.category);
                              setEditingText(q.text);
                              setEditingResponseType(q.responseType || 'default');
                            }}
                            className="p-1.5 text-slate-450 hover:text-sky-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(selectedSetupType, q.id)}
                            className="p-1.5 text-slate-455 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checklist generation Drawer / Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
            
            <div className="bg-[#0B2545] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>{editingChecklistId ? 'Editar Vistoria de Conformidade Mecânica' : 'Nova Vistoria de Conformidade Mecânica'}</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer"
                aria-label="Close checklist setup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChecklist} className="p-6 space-y-6">
              {hasDraft && (
                <div className="bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/15 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold flex items-center gap-1.5 uppercase font-sans">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Rascunho de Vistoria Encontrado</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                      Você possui respostas e fotos de um rascunho anterior preenchido que não foi finalizado. Deseja restaurar essas informações?
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleRestoreDraft}
                      className="bg-[#134074] hover:bg-[#0B2545] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow"
                    >
                      Restaurar
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div id="checklist-error-banner" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono font-bold">
                  <span className="p-1 bg-rose-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center shrink-0">!</span>
                  <div>
                    <strong className="block font-sans uppercase font-black tracking-wider text-[10px] mb-0.5">Pendência de Permissão / Conexão</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {/* Client & Device select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Cliente Real *</label>
                  <select
                    required
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Equipamento Ativo *</label>
                  <select
                    required
                    value={selectedEq}
                    onChange={(e) => setSelectedEq(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                  >
                    {equipments.filter(eq => eq.clientId === selectedClient).map(e => (
                      <option key={e.id} value={e.id}>{e.type}</option>
                    ))}
                    {equipments.filter(eq => eq.clientId === selectedClient).length === 0 && (
                      <option value="">Sem ativos cadastrados para este cliente</option>
                    )}
                  </select>
                </div>
              </div>

              {/* NR-12 Specific Metadata fields */}
              {checklistType === 'nr12' && (
                <div className="bg-[#134074]/5 border border-[#134074]/15 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#134074]/10 pb-2 mb-2">
                    <Clipboard className="w-4 h-4 text-[#134074]" />
                    <span className="text-xs font-bold uppercase font-mono text-[#134074] tracking-wider">Identificação dos Dados do Equipamento (NR-12)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-500 font-mono">EMPRESA *</label>
                      <input type="text" required value={nr12Empresa} onChange={e => setNr12Empresa(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="font-bold text-slate-500 font-mono">MÁQUINA *</label>
                      <input type="text" required value={nr12Maquina} onChange={e => setNr12Maquina(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">FABRICANTE *</label>
                      <input type="text" required value={nr12Fabricante} onChange={e => setNr12Fabricante(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">TAG / ID</label>
                      <input type="text" value={nr12Tag} onChange={e => setNr12Tag(e.target.value)} placeholder="Ex: TAG-102" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">QUANTIDADE</label>
                      <input type="text" value={nr12Qtd} onChange={e => setNr12Qtd(e.target.value)} placeholder="Ex: 1" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">QTD OPERADORES</label>
                      <input type="text" value={nr12QtdOperador} onChange={e => setNr12QtdOperador(e.target.value)} placeholder="Ex: 1 por turno" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">DATA INSPEÇÃO *</label>
                      <input type="date" required value={nr12DataChecklist} onChange={e => setNr12DataChecklist(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">SETOR / ÁREA</label>
                      <input type="text" value={nr12Setor} onChange={e => setNr12Setor(e.target.value)} placeholder="Ex: Galpão A" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">CONTATO RESPONSÁVEL</label>
                      <input type="text" value={nr12Contato} onChange={e => setNr12Contato(e.target.value)} placeholder="Ex: (81) 99999-9999" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 font-mono">RESPONSÁVEL PELO SERVIÇO *</label>
                      <input type="text" required value={nr12ResponsavelServico} onChange={e => setNr12ResponsavelServico(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none font-medium text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* PMOC Specific Metadata fields */}
              {checklistType === 'pmoc' && (
                <div className="bg-[#134074]/5 border border-[#134074]/15 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#134074]/10 pb-2 mb-2">
                    <Clipboard className="w-4 h-4 text-[#134074]" />
                    <span className="text-xs font-bold uppercase font-mono text-[#134074] tracking-wider">Observações do Checklist Preliminar (PMOC)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 01</label>
                      <textarea
                        rows={2}
                        value={pmocObs01}
                        onChange={e => setPmocObs01(e.target.value)}
                        placeholder="Ex: Existe apenas o projeto arquitetonico do salão de festas"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 02</label>
                      <textarea
                        rows={2}
                        value={pmocObs02}
                        onChange={e => setPmocObs02(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 03</label>
                      <textarea
                        rows={2}
                        value={pmocObs03}
                        onChange={e => setPmocObs03(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono uppercase">OBSERVAÇÃO 04</label>
                      <textarea
                        rows={2}
                        value={pmocObs04}
                        onChange={e => setPmocObs04(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 font-mono uppercase">Anotações</label>
                    <textarea
                      rows={3}
                      value={pmocAnotacoes}
                      onChange={e => setPmocAnotacoes(e.target.value)}
                      placeholder="Descreva quaisquer outras observações..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Checklist regulatory selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono pl-1">Categoria de Regulamentação *</label>
                <div className="space-y-4">
                  {CHECKLIST_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-2 border border-slate-100 dark:border-slate-800 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono pl-0.5">{group.category}</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {group.types.map(({ type, label }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setChecklistType(type);
                              setAnswers({});
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              checklistType === type 
                                ? 'bg-[#134074] text-white border-[#134074] shadow-md' 
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection Matrix Answers */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">Itens de Inspeção Regulamentar</h4>
                
                {(() => {
                  const sortedFormQuestions = sortQuestionsByNumberedCategory(questionsMap[checklistType]);
                  const answeredCount = sortedFormQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
                  const totalCount = sortedFormQuestions.length;
                  const percentComplete = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">Progresso do Preenchimento</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {answeredCount} de {totalCount} itens inspecionados ({percentComplete}%)
                        </p>
                      </div>
                      <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${percentComplete}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-4 flex flex-col gap-1.5">
                  {sortQuestionsByNumberedCategory(questionsMap[checklistType]).map((q) => {
                    const photos = questionPhotos[q.id] || [];
                    const cardClass = getCardStatusClasses(q.id);
                    return (
                      <div key={q.id} className={`p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md space-y-4 ${cardClass}`}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-1.5 pr-4 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#134074] dark:text-[#4895EF] uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {q.category}
                              </span>
                              {answers[q.id] !== undefined && answers[q.id] !== '' && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  <span>Respondido</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 leading-relaxed">{q.text}</p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {(!q.responseType || q.responseType === 'default') && (
                              <div className="flex gap-2 shrink-0">
                                {['C', 'NC', 'NA'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option === 'C' ? 'C / SIM' : option === 'NC' ? 'N.C / NÃO' : 'N.A.'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'ok_nok_na' && (
                              <div className="flex gap-2 shrink-0">
                                {['OK', 'NOK', 'NA'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'bom_reg_ruim' && (
                              <div className="flex gap-2 shrink-0">
                                {['BOM', 'REGULAR', 'RUIM'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option === 'BOM' ? 'BOM' : option === 'REGULAR' ? 'REGULAR' : 'RUIM'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'text' && (
                              <div className="flex gap-2 shrink-0 w-full md:w-64">
                                <input
                                  type="text"
                                  placeholder="Digite a resposta principal..."
                                  value={answers[q.id] === undefined ? '' : String(answers[q.id])}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                                />
                              </div>
                            )}

                            {q.responseType === 'ok_nok' && (
                              <div className="flex gap-2 shrink-0">
                                {['OK', 'NOK'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'number' && (
                              <div className="flex gap-2 shrink-0 w-full md:w-64">
                                <input
                                  type="number"
                                  placeholder="Digite o número..."
                                  value={answers[q.id] === undefined ? '' : String(answers[q.id])}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                                />
                              </div>
                            )}

                            {q.responseType === 'date' && (
                              <div className="flex gap-2 shrink-0 w-full md:w-64">
                                <input
                                  type="date"
                                  value={answers[q.id] === undefined ? '' : String(answers[q.id])}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                                />
                              </div>
                            )}

                            {q.responseType === 'sim_nao' && (
                              <div className="flex gap-2 shrink-0">
                                {['SIM', 'NÃO'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'aprovado_reprovado' && (
                              <div className="flex gap-2 shrink-0">
                                {['APROVADO', 'REPROVADO'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'c_nc' && (
                              <div className="flex gap-2 shrink-0">
                                {['C', 'NC'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option === 'C' ? 'C' : 'N.C'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'tipo_ar_condicionado' && (
                              <div className="flex flex-wrap gap-2 shrink-0 md:max-w-xl">
                                {['Split', 'Cassete', 'Piso Teto', 'VRF', 'Chiller', 'Fan Coil', 'Outro'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'photo' && (
                              <div className="flex flex-col gap-2 shrink-0 w-full md:w-64">
                                {answers[q.id] ? (
                                  <div className="relative w-24 h-16 rounded-lg border border-slate-250 dark:border-slate-700 overflow-hidden group">
                                    <img src={String(answers[q.id])} alt="Foto de resposta" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <button
                                      type="button"
                                      onClick={() => handleAnswerChange(q.id, '')}
                                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-[10px]"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Action 1: Take Photo via Camera */}
                                    <button
                                      type="button"
                                      onClick={() => startCamera(q.id, false)}
                                      className="flex items-center justify-center gap-1 border border-slate-250 dark:border-slate-800 hover:border-[#134074] dark:hover:border-sky-500 rounded-xl bg-slate-50 dark:bg-slate-900 shadow-sm p-2 text-center text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 transition-all cursor-pointer"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-[#134074] dark:text-sky-400 shrink-0" />
                                      <span>Tirar Foto</span>
                                    </button>

                                    {/* Action 2: Pick from Album */}
                                    <label className="flex items-center justify-center gap-1 border border-dashed border-slate-250 dark:border-slate-800 hover:border-[#134074] dark:hover:border-sky-500 rounded-xl bg-slate-50 dark:bg-slate-900 shadow-sm p-2 text-center text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 transition-all cursor-pointer">
                                      <Image className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                      <span>Do Álbum</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                              if (ev.target?.result) {
                                                handleAnswerChange(q.id, String(ev.target.result));
                                              }
                                            };
                                            reader.readAsDataURL(e.target.files[0]);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}

                            {q.responseType === 'text_long' && (
                              <div className="flex gap-2 shrink-0 w-full md:w-96">
                                <textarea
                                  placeholder="Digite as observações detalhadas ou justificativa..."
                                  value={answers[q.id] === undefined ? '' : String(answers[q.id])}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  rows={3}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white resize-y"
                                />
                              </div>
                            )}

                            {q.responseType === 'c_nc_na' && (
                              <div className="flex gap-2 shrink-0">
                                {['C', 'NC', 'NA'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option === 'C' ? 'C' : option === 'NC' ? 'N.C' : 'N.A'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'bom_reg_ruim_na' && (
                              <div className="flex gap-2 shrink-0">
                                {['BOM', 'REGULAR', 'RUIM', 'NA'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'ambiente_playground' && (
                              <div className="flex gap-2 shrink-0">
                                {['Interno', 'Externo'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'tipo_veiculo_reclassificacao' && (
                              <div className="flex flex-wrap gap-2 shrink-0 md:max-w-xl">
                                {['Passeio', 'Utilitário', 'Caminhão', 'Ônibus', 'Outro'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'tipo_veiculo_integridade' && (
                              <div className="flex flex-wrap gap-2 shrink-0 md:max-w-xl">
                                {['Passeio', 'Utilitário', 'Caminhão', 'Ônibus', 'Reboque', 'Outro'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'classificacao_monta' && (
                              <div className="flex flex-wrap gap-2 shrink-0 md:max-w-xl">
                                {['Pequena Monta', 'Média Monta', 'Grande Monta'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {q.responseType === 'condicao_fisica_geral' && (
                              <div className="flex flex-wrap gap-2 shrink-0 md:max-w-xl">
                                {['Excelente', 'Boa', 'Regular', 'Ruim'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, option)}
                                    className={getOptionButtonClass(q.id, option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Note & Photos Block */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                          {/* Note text field */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Anotação / Valor (Ex: QTD: 5)</label>
                            <input
                              type="text"
                              value={questionNotes[q.id] || ''}
                              onChange={(e) => handleNoteChange(q.id, e.target.value)}
                              placeholder="Adicione observações ou valores adicionais..."
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Photos container */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 flex justify-between items-center">
                              <span>Fotos de Evidência ({photos.length}/3)</span>
                            </label>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {photos.map((ph, idx) => (
                                <div key={idx} className="relative w-12 h-12 rounded border border-slate-250 dark:border-slate-700 overflow-hidden group">
                                  <img src={ph} alt="Evidência" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(q.id, idx)}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-[10px]"
                                    aria-label="Remover foto"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              ))}

                              {photos.length < 3 && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Camera choice */}
                                  <button
                                    type="button"
                                    onClick={() => startCamera(q.id, true)}
                                    title="Tirar foto com câmera"
                                    className="w-11 h-11 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-[#134074] dark:hover:border-sky-500 rounded-lg cursor-pointer bg-white dark:bg-slate-900 text-slate-650 hover:text-[#134074] transition-all shrink-0"
                                  >
                                    <Camera className="w-4 h-4 text-[#134074] dark:text-sky-400" />
                                    <span className="text-[7px] font-sans font-bold leading-none mt-1 uppercase text-slate-500 dark:text-slate-400">Câmera</span>
                                  </button>

                                  {/* Album Upload Choice */}
                                  <label
                                    title="Escolher do Álbum / Arquivo"
                                    className="w-11 h-11 flex flex-col items-center justify-center border border-dashed border-slate-250 dark:border-slate-800 hover:border-emerald-500 rounded-lg cursor-pointer bg-white dark:bg-slate-900 text-slate-450 hover:text-emerald-500 transition-all shrink-0"
                                  >
                                    <Image className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[7px] font-sans font-bold leading-none mt-1 uppercase text-slate-500 dark:text-slate-400">Álbum</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => handlePhotoUpload(q.id, e.target.files)}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Human Digital Signature Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono block">Assinatura Digital do Engenheiro Inspetor *</label>
                <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="aspect-video max-h-32 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={128}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawingTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full cursor-crosshair block"
                    />
                    <div className="absolute right-3 bottom-2 flex gap-2">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[9px] font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 px-2 py-1 rounded cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                    {!signatureSaved && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-350 pointer-events-none text-xs font-mono font-light select-none">
                        Assine eletronicamente com o Mouse ou Toque para validar
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Nome do Inspetor Responsável</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-[#134074] hover:bg-[#0B2545] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Processando...' : (editingChecklistId ? 'Salvar Alterações' : 'Registrar Vistoria')}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Embedded hidden print display specifically styled for A4 formatting prints! */}
      {printingChecklist && (
        <div 
          id="print-container-checklist" 
          className="fixed inset-0 z-[99999] bg-white text-slate-950 p-12 overflow-y-auto hidden print:block space-y-8"
        >
          {/* Header */}
          <div className="border-b-4 border-slate-900 pb-6 flex justify-between items-start">
            <div className="space-y-2">
              <Logo variant="print" className="h-20" />
              <p className="text-[10px] font-bold font-mono tracking-wide text-slate-500 uppercase mt-2">Registro Profissional: CREA-PE 1822299490 • Recife, Pernambuco</p>
            </div>
            <div className="text-right space-y-1 text-xs font-mono">
              <div className="font-bold">DOCUMENTO: CHECKLIST TÉCNICO</div>
              <div>ID: {printingChecklist.id}</div>
              <div>EMITIDO EM: {new Date(printingChecklist.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Core Info table details */}
          {printingChecklist.type === 'nr12' && printingChecklist.nr12Metadata ? (
            <div className="border border-slate-400 text-xs font-sans rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 font-bold uppercase tracking-wider text-center p-2.5 border-b border-slate-400 text-xs">
                Dados do Equipamento (NR-12)
              </div>
              <div className="grid grid-cols-4 border-b border-slate-350">
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">EMPRESA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.empresa || printingChecklist.clientName}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">MÁQUINA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.maquina || printingChecklist.equipmentModel}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">FABRICANTE:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.fabricante || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">TAG:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.tag || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-slate-350">
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">QTD:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.qtd || '1'}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">QTD OPERADOR:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.qtdOperador || '1'}</span>
                </div>
                <div className="p-2.5 border-r border-slate-300">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">DATA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.dataChecklist || new Date(printingChecklist.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="p-2.5">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">SETOR/ÁREA:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.setor || 'Geral'}</span>
                </div>
              </div>
              <div className="grid grid-cols-4">
                <div className="p-2.5 border-r border-slate-300 col-span-3">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">RESPONSÁVEL PELO SERVIÇO:</span>
                  <span className="font-semibold text-slate-900">{printingChecklist.nr12Metadata.responsavelServico || printingChecklist.inspectorName}</span>
                  {printingChecklist.nr12Metadata.contato && (
                    <span className="text-[10px] text-slate-500 block font-mono">Contato: {printingChecklist.nr12Metadata.contato}</span>
                  )}
                </div>
                <div className="p-2.5 bg-slate-50 flex flex-col justify-center items-center text-center">
                  <span className="font-bold text-[9px] font-mono text-slate-500 block uppercase">LEGENDA</span>
                  <span className="font-bold text-[10px] text-slate-800">N.A - Não se aplica</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-lg border border-slate-300">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold font-mono uppercase text-slate-400">Cliente / Organização</h3>
                  <p className="text-base font-bold text-slate-900">{printingChecklist.clientName}</p>
                </div>
                <div className="space-y-1 border-l border-slate-200 pl-6">
                  <h3 className="text-[10px] font-bold font-mono uppercase text-slate-400">Ativo / Equipamento</h3>
                  <p className="text-base font-bold text-slate-900">{printingChecklist.equipmentModel}</p>
                </div>
              </div>

              {/* PMOC Specific Metadata fields on print */}
              {printingChecklist.type === 'pmoc' && printingChecklist.pmocMetadata && (
                <div className="border border-slate-400 text-xs font-sans rounded-xl overflow-hidden shadow-sm p-4 bg-slate-50 space-y-3">
                  <div className="font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 text-xs">
                    Observações do Checklist Preliminar (PMOC)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-white/70 p-2.5 rounded border border-slate-250">
                      <p className="mb-1"><strong>OBS 01:</strong> {printingChecklist.pmocMetadata.obs01 || 'N/A'}</p>
                      <p><strong>OBS 02:</strong> {printingChecklist.pmocMetadata.obs02 || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 bg-white/70 p-2.5 rounded border border-slate-250">
                      <p className="mb-1"><strong>OBS 03:</strong> {printingChecklist.pmocMetadata.obs03 || 'N/A'}</p>
                      <p><strong>OBS 04:</strong> {printingChecklist.pmocMetadata.obs04 || 'N/A'}</p>
                    </div>
                  </div>
                  {printingChecklist.pmocMetadata.anotacoes && (
                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                      <strong>Anotações Adicionais:</strong><br />
                      {printingChecklist.pmocMetadata.anotacoes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form items results */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold border-b-2 border-slate-900 pb-2 flex justify-between items-center text-slate-900">
              <span>Diagnóstico Detalhado de Itens Regulamentares ({printingChecklist.type.toUpperCase()})</span>
              <span className="text-xs font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-300 uppercase">Laudo de Vistoria</span>
            </h2>
            
            {(() => {
              const groupedQuestions = questionsMap[printingChecklist.type].reduce((acc, q) => {
                if (!acc[q.category]) {
                  acc[q.category] = [];
                }
                acc[q.category].push(q);
                return acc;
              }, {} as Record<string, ChecklistQuestion[]>);

              return (Object.entries(groupedQuestions) as [string, ChecklistQuestion[]][]).map(([category, qList]) => (
                <div key={category} className="space-y-4 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex justify-between items-center shadow-sm">
                    <span>{category}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{qList.length} itens avaliados</span>
                  </div>

                  <table className="w-full text-left font-sans text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold bg-slate-50 text-[10px] font-mono uppercase text-slate-600">
                        <th className="p-3 border-r border-slate-300">Item / Requisito Normativo</th>
                        <th className="p-3 text-center w-36 shrink-0">Parecer Técnico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {qList.map((q) => {
                        const ans = printingChecklist.questions[q.id];
                        const photos = (printingChecklist.questionPhotos?.[q.id] || []) as string[];
                        return (
                          <tr key={q.id} className="hover:bg-slate-50/50">
                            <td className="p-3 space-y-3">
                              <div className="font-semibold text-slate-900 text-xs leading-relaxed">{q.text}</div>
                              
                              {/* Show per-item notes in print */}
                              {printingChecklist.questionNotes?.[q.id] && (
                                <div className="text-xs text-slate-700 bg-amber-500/5 p-2 rounded border border-amber-500/15 font-mono leading-relaxed mt-1">
                                  <strong className="text-amber-800 uppercase text-[9px] tracking-wide block mb-0.5">Nota de Campo:</strong>
                                  {printingChecklist.questionNotes[q.id]}
                                </div>
                              )}

                              {/* Show per-item photos in print */}
                              {photos.length > 0 && (
                                <div className="space-y-1.5 mt-2">
                                  <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Registros Fotográficos (Evidências):</span>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {photos.map((photo, pIdx) => (
                                      <div key={pIdx} className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-250 flex flex-col justify-between shadow-sm">
                                        <img
                                          src={photo}
                                          alt={`Item ${q.id} foto ${pIdx + 1}`}
                                          className="w-full h-40 object-cover rounded-lg border border-slate-300 shadow-sm"
                                          referrerPolicy="no-referrer"
                                        />
                                        <span className="text-[9px] font-bold text-slate-500 text-center block font-mono pt-1">
                                          Foto {pIdx + 1} - Item ID: {q.id}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center border-l border-slate-200 shrink-0 align-middle">
                              {(() => {
                                if (ans === undefined || ans === null || ans === '') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-400 text-xs border border-dashed border-slate-300 rounded">NÃO RESPONDIDO</span>;
                                }

                                if (q.responseType === 'text') {
                                  return <span className="inline-block px-3 py-1 font-bold text-slate-800 text-xs bg-slate-100 rounded max-w-full break-words">{String(ans)}</span>;
                                }

                                if (q.responseType === 'ok_nok_na') {
                                  if (ans === 'OK') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">OK</span>;
                                  } else if (ans === 'NOK') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NÃO OK</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">N.A</span>;
                                  }
                                }

                                if (q.responseType === 'bom_reg_ruim') {
                                  if (ans === 'BOM') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">BOM</span>;
                                  } else if (ans === 'REGULAR') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-amber-800 text-xs bg-amber-100 rounded border border-amber-200">REGULAR</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">RUIM</span>;
                                  }
                                }

                                if (q.responseType === 'ok_nok') {
                                  if (ans === 'OK') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">OK</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NÃO OK (NOK)</span>;
                                  }
                                }

                                if (q.responseType === 'sim_nao') {
                                  if (ans === 'SIM') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">SIM</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NÃO</span>;
                                  }
                                }

                                if (q.responseType === 'aprovado_reprovado') {
                                  if (ans === 'APROVADO') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">APROVADO</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">REPROVADO</span>;
                                  }
                                }

                                if (q.responseType === 'c_nc') {
                                  if (ans === 'C' || ans === true || String(ans).toUpperCase() === 'C') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">C</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NC</span>;
                                  }
                                }

                                if (q.responseType === 'tipo_ar_condicionado') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-blue-800 text-xs bg-blue-100 rounded border border-blue-200">{String(ans).toUpperCase()}</span>;
                                }

                                if (q.responseType === 'number') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">{String(ans)}</span>;
                                }

                                if (q.responseType === 'date') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">{String(ans)}</span>;
                                }

                                if (q.responseType === 'photo') {
                                  return ans ? (
                                    <img src={String(ans)} alt="Evidência" className="w-16 h-12 object-cover rounded border border-slate-300 mx-auto" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="inline-block px-3 py-1 font-bold font-mono text-slate-400 text-xs border border-dashed border-slate-200 rounded">SEM FOTO</span>
                                  );
                                }

                                if (q.responseType === 'text_long') {
                                  return <span className="inline-block px-3 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded text-xs whitespace-pre-wrap text-left max-w-sm break-words leading-relaxed">{String(ans)}</span>;
                                }

                                if (q.responseType === 'c_nc_na') {
                                  if (ans === 'C') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">CONFORME (C)</span>;
                                  } else if (ans === 'NC') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NÃO CONFORME (NC)</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">N.A</span>;
                                  }
                                }

                                if (q.responseType === 'bom_reg_ruim_na') {
                                  if (ans === 'BOM') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">BOM</span>;
                                  } else if (ans === 'REGULAR') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-amber-800 text-xs bg-amber-100 rounded border border-amber-200">REGULAR</span>;
                                  } else if (ans === 'RUIM') {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">RUIM</span>;
                                  } else {
                                    return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">N.A</span>;
                                  }
                                }

                                if (q.responseType === 'ambiente_playground') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-[#134074] text-xs bg-blue-50 rounded border border-blue-100">{String(ans).toUpperCase()}</span>;
                                }

                                if (q.responseType === 'tipo_veiculo_reclassificacao' || q.responseType === 'tipo_veiculo_integridade') {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-blue-800 text-xs bg-blue-100 rounded border border-blue-200">{String(ans).toUpperCase()}</span>;
                                }

                                if (q.responseType === 'classificacao_monta') {
                                  const colorClass = ans === 'Pequena Monta' ? 'text-emerald-800 bg-emerald-100 border-emerald-200' : ans === 'Média Monta' ? 'text-amber-800 bg-amber-100 border-amber-200' : 'text-rose-800 bg-rose-100 border-rose-200';
                                  return <span className={`inline-block px-3 py-1 font-bold font-mono text-xs rounded border ${colorClass}`}>{String(ans).toUpperCase()}</span>;
                                }

                                if (q.responseType === 'condicao_fisica_geral') {
                                  const colorClass = ans === 'Excelente' ? 'text-emerald-900 bg-emerald-200 border-emerald-300' : ans === 'Boa' ? 'text-emerald-800 bg-emerald-100 border-emerald-200' : ans === 'Regular' ? 'text-amber-800 bg-amber-100 border-amber-200' : 'text-rose-800 bg-rose-100 border-rose-200';
                                  return <span className={`inline-block px-3 py-1 font-bold font-mono text-xs rounded border ${colorClass}`}>{String(ans).toUpperCase()}</span>;
                                }

                                // Default C / NC / NA
                                if (ans === 'C' || ans === true) {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-emerald-800 text-xs bg-emerald-100 rounded border border-emerald-200">CONFORME</span>;
                                } else if (ans === 'NC' || ans === false) {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-rose-800 text-xs bg-rose-100 rounded border border-rose-200">NÃO CONFORME</span>;
                                } else {
                                  return <span className="inline-block px-3 py-1 font-bold font-mono text-slate-800 text-xs bg-slate-100 rounded border border-slate-200">N.A (NÃO SE APLICA)</span>;
                                }
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ));
            })()}
          </div>

          {/* Signature and Digital footprint footer */}
          <div className="pt-20 grid grid-cols-2 gap-16 items-start">
            <div className="space-y-2 border-t border-slate-400 pt-3 text-center">
              {printingChecklist.signatureUrl && (
                <img 
                  src={printingChecklist.signatureUrl} 
                  alt="Assinatura técnica" 
                  className="mx-auto max-h-16 border border-slate-200 bg-white rounded"
                  referrerPolicy="no-referrer"
                />
              )}
              <h4 className="font-bold text-md text-slate-900">{printingChecklist.inspectorName}</h4>
              <p className="text-xs text-slate-500 font-mono">Engenheiro Mecânico • CREA-PE 1822299490</p>
            </div>

            <div className="space-y-2 pt-12">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-[10px] font-mono space-y-1.5 leading-normal">
                <div className="font-bold text-slate-700">INTEGRIDADE DE CERTIFICADO ELETRÔNICO:</div>
                <div className="break-all">Assinado com certificado redundante sob hash único: <strong className="text-slate-900">{printingChecklist.digitalSignature}</strong></div>
                <div>Os pareceres técnicos expressos neste documento cumprem com os regulamentos vigentes do CREA-PE.</div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 text-[10px] font-mono text-slate-400 print:block hidden">
            Parâmetros impressos via Plataforma Integrada de Laudos • VL ENGENHARIA
          </div>
          
          <button 
            type="button" 
            onClick={() => setPrintingChecklist(null)}
            className="fixed bottom-6 left-6 px-4 py-2 bg-slate-900 text-white rounded font-bold text-xs font-mono uppercase tracking-wider print:hidden cursor-pointer"
          >
            Voltar ao painel
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <span className="p-2 bg-rose-500/10 rounded-full text-base">⚠️</span>
              <h3 className="text-sm font-black dark:text-white uppercase tracking-wider font-mono">{confirmState.title || 'Atenção'}</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
              {confirmState.message}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-black cursor-pointer transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 rounded-xl">
                  <Camera className="w-5 h-5 text-[#134074] dark:text-sky-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Câmera de Inspeção</h3>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono">REGISTRO DE EVIDÊNCIA EM TEMPO REAL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Minimizar câmera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video container */}
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover min-h-[220px]"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[9px] text-emerald-400 font-mono font-black uppercase rounded shadow-sm tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>AO VIVO</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
