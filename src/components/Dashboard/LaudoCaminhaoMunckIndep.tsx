import ClientSelector from "./ClientSelector";
import { ClientData } from "../../types";
import { useState, useEffect, useRef, ChangeEvent } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { preprocessStylesheets, restoreStylesheets, exportToWord, copyRichText } from "../../lib/pdfUtils";
import Logo from "../Logo";
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
  Anchor,
  Truck,
  Copy
} from "lucide-react";

interface UploadedImage {
  name: string;
  data: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
  resposta: "SIM" | "NÃO" | "N/A";
  nota: string;
  image?: string; // Optional image for each specific checklist item
}

interface CapacityRow {
  raio: string;
  angulo: string;
  cnc: string;
}

// --- HRN VALUES ---
const LO_OPTIONS = [
  { value: 0.033, label: "0,033 - Quase Impossível (Não pode ocorrer em nenhuma circunstância)" },
  { value: 1.0, label: "1,000 - Muito Improvável (Entretanto é concebível)" },
  { value: 1.5, label: "1,500 - Improvável (Mas pode ocorrer)" },
  { value: 2.0, label: "2,000 - Possível (Mas é incomum)" },
  { value: 5.0, label: "5,000 - Inesperado (Pode ocorrer)" },
  { value: 8.0, label: "8,000 - Provável (Não surpreende)" },
  { value: 10.0, label: "10,000 - Muito Provável (Esperado)" },
  { value: 15.0, label: "15,000 - Certamente (Sem dúvidas)" }
];

const FE_OPTIONS = [
  { value: 0.5, label: "0,5 - Anualmente" },
  { value: 1.0, label: "1,0 - Mensalmente" },
  { value: 1.5, label: "1,5 - Semanalmente" },
  { value: 2.5, label: "2,5 - Diariamente" },
  { value: 4.0, label: "4,0 - Em Termos de Hora" },
  { value: 5.0, label: "5,0 - Constantemente" }
];

const DPH_OPTIONS = [
  { value: 0.1, label: "0,1 - Arranhão / Contusão Leve" },
  { value: 0.5, label: "0,5 - Laceração / Leves Problemas de Saúde" },
  { value: 1.0, label: "1,0 - Fratura de Ossos Pequenos / Enfermidade Leve" },
  { value: 2.0, label: "2,0 - Fratura de Ossos Grandes / Enfermidade Leve" },
  { value: 4.0, label: "4,0 - Fratura / Enfermidade Grave" },
  { value: 6.0, label: "6,0 - Perda de Um Membro ou Olho / Enfermidade Grave" },
  { value: 8.0, label: "8,0 - Perda de Dois Membros ou Olhos / Enfermidade Grave" },
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
  if (score <= 1.0) return { label: "Risco Desprezível", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", action: "Aceitável; monitorar continuamente." };
  if (score <= 5.0) return { label: "Risco Muito Baixo", color: "bg-teal-500/10 text-teal-500 border-teal-500/20", action: "Melhorar as condições se possível." };
  if (score <= 10.0) return { label: "Risco Baixo", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", action: "Requer ação a médio prazo." };
  if (score <= 50.0) return { label: "Risco Significante", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", action: "Requer ação técnica a curto prazo." };
  if (score <= 100.0) return { label: "Risco Alto", color: "bg-red-500/10 text-red-500 border-red-500/20", action: "Requer ação imediata e urgente." };
  if (score <= 500.0) return { label: "Risco Muito Alto", color: "bg-rose-600/10 text-rose-600 border-rose-600/20", action: "Parar a atividade operacional até a devida correção." };
  if (score <= 1000.0) return { label: "Risco Extremo", color: "bg-purple-600/10 text-purple-600 border-purple-600/20 animate-pulse", action: "INTERDITAR — Perigo grave e iminente no local." };
  return { label: "Risco Inaceitável", color: "bg-red-700/10 text-red-700 border-red-700/20 animate-ping", action: "INTERDIÇÃO IMEDIATA — Risco iminente de perda de vida." };
}

// Check list items
const CRANE_CHECKLIST_TEMPLATE = [
  // 2. DOCUMENTAÇÃO
  { id: "m_2_crlv_valido", category: "2. DOCUMENTAÇÃO", text: "CRLV válido" },
  { id: "m_2_manual_equipamento", category: "2. DOCUMENTAÇÃO", text: "Manual do equipamento disponível" },
  { id: "m_2_manual_veiculo", category: "2. DOCUMENTAÇÃO", text: "Manual do veículo disponível" },
  { id: "m_2_plano_preventiva", category: "2. DOCUMENTAÇÃO", text: "Plano de manutenção preventiva" },
  { id: "m_2_historico_manutencao", category: "2. DOCUMENTAÇÃO", text: "Histórico de manutenção disponível" },
  { id: "m_2_art_laudo_anterior", category: "2. DOCUMENTAÇÃO", text: "ART ou Laudo anterior disponível" },
  { id: "m_2_tabela_carga", category: "2. DOCUMENTAÇÃO", text: "Tabela de carga disponível" },
  { id: "m_2_certificados_acessorios", category: "2. DOCUMENTAÇÃO", text: "Certificados de acessórios de içamento" },

  // 3. CHASSI E ESTRUTURA DO VEÍCULO
  { id: "m_3_longarinas_sem_trincas", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Longarinas sem trincas" },
  { id: "m_3_longarinas_sem_deformacoes", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Longarinas sem deformações" },
  { id: "m_3_estado_chassi", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Estado geral do chassi" },
  { id: "m_3_fixacao_munck", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Fixação do Munck ao chassi" },
  { id: "m_3_estado_suportes", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Estado dos suportes estruturais" },
  { id: "m_3_parafusos_fixacao", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Estado dos parafusos de fixação" },
  { id: "m_3_corrosao_estrutural", category: "3. CHASSI E ESTRUTURA DO VEÍCULO", text: "Corrosão estrutural" },

  // 4. ESTRUTURA DO MUNCK
  { id: "m_4_coluna_principal", category: "4. ESTRUTURA DO MUNCK", text: "Coluna principal sem trincas" },
  { id: "m_4_bracos_articulados", category: "4. ESTRUTURA DO MUNCK", text: "Braços articulados íntegros" },
  { id: "m_4_ausencia_deformacoes", category: "4. ESTRUTURA DO MUNCK", text: "Ausência de deformações" },
  { id: "m_4_estado_soldas", category: "4. ESTRUTURA DO MUNCK", text: "Estado das soldas" },
  { id: "m_4_linhas_articulacao", category: "4. ESTRUTURA DO MUNCK", text: "Estado dos pontos de articulação" },
  { id: "m_4_estado_pinos", category: "4. ESTRUTURA DO MUNCK", text: "Estado dos pinos" },
  { id: "m_4_estado_buchas", category: "4. ESTRUTURA DO MUNCK", text: "Estado das buchas" },

  // 5. SISTEMA HIDRÁULICO
  { id: "m_5_vazamentos_hidraulicos", category: "5. SISTEMA HIDRÁULICO", text: "Vazamentos hidráulicos" },
  { id: "m_5_estado_mangueiras", category: "5. SISTEMA HIDRÁULICO", text: "Estado das mangueiras" },
  { id: "m_5_estado_conexoes", category: "5. SISTEMA HIDRÁULICO", text: "Estado das conexões" },
  { id: "m_5_cilindros_hidraulicos", category: "5. SISTEMA HIDRÁULICO", text: "Estado dos cilindros hidráulicos" },
  { id: "m_5_bomba_hidraulica", category: "5. SISTEMA HIDRÁULICO", text: "Funcionamento da bomba hidráulica" },
  { id: "m_5_funcionamento_valvulas", category: "5. SISTEMA HIDRÁULICO", text: "Funcionamento das válvulas" },
  { id: "m_5_pressao_adequada", category: "5. SISTEMA HIDRÁULICO", text: "Pressão operacional adequada" },

  // 6. LANÇA E EXTENSÕES
  { id: "m_6_integridade_lanca_princ", category: "6. LANÇA E EXTENSÕES", text: "Integridade da lança principal" },
  { id: "m_6_integridade_extensoes", category: "6. LANÇA E EXTENSÕES", text: "Integridade das extensões" },
  { id: "m_6_alinhamento_lanca", category: "6. LANÇA E EXTENSÕES", text: "Alinhamento da lança" },
  { id: "m_6_patins_deslizamento", category: "6. LANÇA E EXTENSÕES", text: "Estado dos patins de deslizamento" },
  { id: "m_6_curso_completo", category: "6. LANÇA E EXTENSÕES", text: "Curso completo operacional" },
  { id: "m_6_folgas_excessivas", category: "6. LANÇA E EXTENSÕES", text: "Folgas excessivas" },

  // 7. CABOS, POLIAS E GANCHO
  { id: "m_7_estado_cabo_aco", category: "7. CABOS, POLIAS E GANCHO", text: "Estado geral do cabo de aço" },
  { id: "m_7_fios_rompidos", category: "7. CABOS, POLIAS E GANCHO", text: "Fios rompidos acima do limite" },
  { id: "m_7_corrosao_cabo", category: "7. CABOS, POLIAS E GANCHO", text: "Corrosão no cabo" },
  { id: "m_7_torcoes_amassamentos", category: "7. CABOS, POLIAS E GANCHO", text: "Torções ou amassamentos" },
  { id: "m_7_lubrificacao_adequada", category: "7. CABOS, POLIAS E GANCHO", text: "Lubrificação adequada" },
  { id: "m_7_estado_polias", category: "7. CABOS, POLIAS E GANCHO", text: "Estado das polias" },
  { id: "m_7_estado_gancho", category: "7. CABOS, POLIAS E GANCHO", text: "Estado do gancho" },
  { id: "m_7_trava_seguranca_gancho", category: "7. CABOS, POLIAS E GANCHO", text: "Trava de segurança do gancho" },

  // 8. PATOLAS E ESTABILIZADORES
  { id: "m_8_funcionamento_patolas", category: "8. PATOLAS E ESTABILIZADORES", text: "Funcionamento das patolas" },
  { id: "m_8_vazamentos_cilindros_patolas", category: "8. PATOLAS E ESTABILIZADORES", text: "Vazamentos nos cilindros das patolas" },
  { id: "m_8_travamento_adequado", category: "8. PATOLAS E ESTABILIZADORES", text: "Travamento adequado" },
  { id: "m_8_integridade_patolas", category: "8. PATOLAS E ESTABILIZADORES", text: "Integridade estrutural das patolas" },
  { id: "m_8_sapatas_apoio_disponiveis", category: "8. PATOLAS E ESTABILIZADORES", text: "Sapatas de apoio disponíveis" },
  { id: "m_8_estado_sapatas", category: "8. PATOLAS E ESTABILIZADORES", text: "Estado das sapatas" },
  { id: "m_8_nivel_estabilizacao", category: "8. PATOLAS E ESTABILIZADORES", text: "Nível de estabilização adequado" },

  // 9. SISTEMAS DE SEGURANÇA
  { id: "m_9_limitador_carga", category: "9. SISTEMAS DE SEGURANÇA", text: "Limitador de carga operacional" },
  { id: "m_9_indicador_carga", category: "9. SISTEMAS DE SEGURANÇA", text: "Indicador de carga operacional" },
  { id: "m_9_sistema_anti_sobrecarga", category: "9. SISTEMAS DE SEGURANÇA", text: "Sistema anti-sobrecarga" },
  { id: "m_9_alarme_sonoro", category: "9. SISTEMAS DE SEGURANÇA", text: "Alarme sonoro operacional" },
  { id: "m_9_botao_emergencia", category: "9. SISTEMAS DE SEGURANÇA", text: "Botão de emergência" },
  { id: "m_9_adesivos_seguranca", category: "9. SISTEMAS DE SEGURANÇA", text: "Adesivos de segurança legíveis" },
  { id: "m_9_tabela_carga_legivel", category: "9. SISTEMAS DE SEGURANÇA", text: "Tabela de carga legível" },
  { id: "m_9_giroflex", category: "9. SISTEMAS DE SEGURANÇA", text: "Giroflex operacional" },

  // 10. SISTEMA ELÉTRICO
  { id: "m_10_estado_bateria", category: "10. SISTEMA ELÉTRICO", text: "Estado da bateria" },
  { id: "m_10_fixacao_bateria", category: "10. SISTEMA ELÉTRICO", text: "Fixação da bateria" },
  { id: "m_10_chicote_eletrico", category: "10. SISTEMA ELÉTRICO", text: "Chicote elétrico" },
  { id: "m_10_painel_controle", category: "10. SISTEMA ELÉTRICO", text: "Painel de controle operacional" },
  { id: "m_10_iluminacao_trabalho", category: "10. SISTEMA ELÉTRICO", text: "Iluminação de trabalho" },
  { id: "m_10_luzes_advertencia", category: "10. SISTEMA ELÉTRICO", text: "Luzes de advertência" },

  // 11. CABINE DO VEÍCULO
  { id: "m_11_estado_cabine", category: "11. CABINE DO VEÍCULO", text: "Estado geral da cabine" },
  { id: "m_11_cinto_seguranca", category: "11. CABINE DO VEÍCULO", text: "Cinto de segurança" },
  { id: "m_11_banco_motorista", category: "11. CABINE DO VEÍCULO", text: "Banco do motorista" },
  { id: "m_11_vidros_integros", category: "11. CABINE DO VEÍCULO", text: "Vidros íntegros" },
  { id: "m_11_retrovisores", category: "11. CABINE DO VEÍCULO", text: "Retrovisores" },
  { id: "m_11_limpadores", category: "11. CABINE DO VEÍCULO", text: "Limpadores de para-brisa" },
  { id: "m_11_buzina", category: "11. CABINE DO VEÍCULO", text: "Buzina" },
  { id: "m_11_ar_condicionado", category: "11. CABINE DO VEÍCULO", text: "Ar-condicionado" },

  // 12. SISTEMA MECÂNICO DO CAMINHÃO
  { id: "m_12_motor_sem_vazamentos", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Motor sem vazamentos" },
  { id: "m_12_sistema_transmissao", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Sistema de transmissão" },
  { id: "m_12_sistema_direcao", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Sistema de direção" },
  { id: "m_12_sistema_freios", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Sistema de freios" },
  { id: "m_12_sistema_suspensao", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Sistema de suspensão" },
  { id: "m_12_sistema_escapamento", category: "12. SISTEMA MECÂNICO DO CAMINHÃO", text: "Sistema de escapamento" },

  // 13. PNEUS E RODADOS
  { id: "m_13_pneus_dianteiros", category: "13. PNEUS E RODADOS", text: "Estado dos pneus dianteiros" },
  { id: "m_13_pneus_traseiros", category: "13. PNEUS E RODADOS", text: "Estado dos pneus traseiros" },
  { id: "m_13_sulco_limite_legal", category: "13. PNEUS E RODADOS", text: "Sulco dentro do limite legal" },
  { id: "m_13_ausencia_cortes", category: "13. PNEUS E RODADOS", text: "Ausência de cortes ou avarias" },
  { id: "m_13_estado_rodas", category: "13. PNEUS E RODADOS", text: "Estado das rodas" },
  { id: "m_13_torque_rodas_adequado", category: "13. PNEUS E RODADOS", text: "Torque das rodas adequado" },

  // 14. TESTE OPERACIONAL
  { id: "m_14_elevacao_carga", category: "14. TESTE OPERACIONAL", text: "Elevação da carga" },
  { id: "m_14_descida_carga", category: "14. TESTE OPERACIONAL", text: "Descida da carga" },
  { id: "m_14_giro_lanca", category: "14. TESTE OPERACIONAL", text: "Giro da lança" },
  { id: "m_14_extensao_lanca", category: "14. TESTE OPERACIONAL", text: "Extensão da lança" },
  { id: "m_14_retracao_lanca", category: "14. TESTE OPERACIONAL", text: "Retração da lança" },
  { id: "m_14_funcionamento_patolas_op", category: "14. TESTE OPERACIONAL", text: "Funcionamento das patolas" },
  { id: "m_14_funcionamento_comandos", category: "14. TESTE OPERACIONAL", text: "Funcionamento dos comandos" },
  { id: "m_14_ausencia_ruidos", category: "14. TESTE OPERACIONAL", text: "Ausência de ruídos anormais" },
  { id: "m_14_ausencia_vibracoes", category: "14. TESTE OPERACIONAL", text: "Ausência de vibrações excessivas" },
  { id: "m_14_desempenho_geral", category: "14. TESTE OPERACIONAL", text: "Desempenho geral" },

  // 15. ENSAIO DE CARGA (QUANDO APLICÁVEL)
  { id: "m_15_carga_aplicada", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Carga aplicada (kg)" },
  { id: "m_15_percentual_carga", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Percentual da carga nominal (%)" },
  { id: "m_15_suportou_carga", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Equipamento suportou a carga" },
  { id: "m_15_deformacao_estrutural", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Houve deformação estrutural" },
  { id: "m_15_falha_operacional", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Houve falha operacional" },
  { id: "m_15_perda_estabilidade", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Houve perda de estabilidade" },
  { id: "m_15_resultado_ensaio", category: "15. ENSAIO DE CARGA (QUANDO APLICÁVEL)", text: "Resultado do ensaio" }
];

// Subsystems text template
const DEFAULT_SYSTEMS = {
  lança_pluma: "Análise visual da lança telescópica revela alinhamento simétrico impecável, ausência de amassamento mecânico ou soldas corretivas improvisadas.",
  içamento: "Sistema de içamento composto por tambor de enrolamento, redutor de engrenagens e cabo de aço opera em velocidade uniforme. Cabo lubrificado.",
  hidraulico: "Circuito de alta pressão estanque, cilindros de elevação da lança principal respondendo rapidamente ao comando hidráulico, sem sinais de vazamento.",
  gancho_moitao: "Moitão do gancho íntegro com placas de desgaste sem folgas excessivas. Trava de segurança ativa com mola de retorno funcional.",
  estabilizadores: "Patolas hidráulicas estendem e recolhem de forma fluida. Válvula de retenção (piloto) testada sob pressão estática sem descida involuntária.",
  rotacao: "Mecanismo de rotação do braço (coroa de giro) engraxado, sem folga radial ou ruído anômalo de dentes na engrenagem do pinhão de acionamento.",
  cabine_comandos: "Cabine com vidros limpos, proporcionando visão de 360° para o operador. Alavancas de comando retornam automaticamente à posição neutra.",
  eletrico: "Fiação elétrica e sensores protegidos por conduítes plásticos corrugados contra abrasão física e intempéries. Lanternas operacionais.",
  chassi_veicular: "Grampos e parafusos de fixação do Munck ao chassi do caminhão encontram-se apertados e sem sinais de deformação mecânica por cisalhamento.",
  dispositivos_seguranca: "O limitador eletrônico de momento de carga (LMI) monitora a carga em tempo real. Dispositivo fim de curso superior atuou perfeitamente nos testes.",
  acessorios: "As manilhas e cintas de nylon sobressalentes apresentam plaquetas com indicação de carga máxima de trabalho perfeitamente legíveis.",
  sinalizacao: "Placa metálica com gráfico/tabela de capacidade de carga afixada na lateral de operação. Faixas zebradas refletivas nas patolas íntegras."
};

function generateSectionDrafts(params: any) {
  const eq = params.equipmentName || "Caminhão Munck";
  const cli = params.clientName || "Empresa Contratante S/A";
  const city = params.inspectionCity || "Recife";
  const rawDate = params.inspectionDate || "01/07/2026";
  const date = rawDate.includes("-") ? rawDate.split("-").reverse().join("/") : rawDate;

  return {
    secao_1: `Este Laudo Técnico de Inspeção e Conformidade de Segurança em Equipamentos de Içamento visa certificar e atestar as condições físicas do ativo "${eq}", à luz das diretrizes normativas das NR-11, NR-12 e NR-18, aplicando-se também os requisitos das normas técnicas ABNT NBR 11139:2019, ABNT NBR ISO 4301, ABNT NBR 6327 e os códigos ASME B30.5. O escopo técnico envolve verificação in loco da lança, moitão, patolas, limitador de carga (LMI), cálculo de riscos Hazard Rating Number (HRN) e emissão de laudo pericial assinado pelo Eng. Vitor Leonardo.`,
    
    secao_2: `A vistoria pericial foi solicitada pela empresa ${cli}, inscrita no CNPJ sob o número ${params.cnpj || "Não informado"}, estabelecida no endereço operacional: ${params.address || "Não informado"}. A contratante opera guindastes e caminhões Munck em movimentação pesada de cargas críticas de engenharia, demandando auditorias rigorosas para mitigar riscos catastróficos.`,
    
    secao_3: `A emissão e o acompanhamento técnico deste laudo são de responsabilidade legal da VL Engenharia, sob responsabilidade do Engenheiro Mecânico Vitor Leonardo, registrado no CREA-PE sob o nº 1822299490. A VL Engenharia fornece serviços especializados de auditoria industrial, laudos de adequação da NR-12 e NR-11, e apreciação quantitativa de riscos. E-mail: vitorleonardocl@gmail.com | Telefone: (81) 98444-2592.`,
    
    secao_5: `Para fundamentar a análise pericial, foram catalogados e examinados os seguintes documentos técnicos:
1. Registro visual fotográfico dos componentes hidráulicos, mecânicos e de elevação in loco no dia ${date} em ${city}.
2. Prontuários eletrônicos de manutenção corretiva e preventiva de mangueiras.
3. Testes funcionais do moitão de carga e limitador fim de curso superior sob vácuo.
4. Certificado de treinamento de operador de guindastes (NR-11) e CNH correspondente.`,
    
    secao_6: `O balizamento normativo aplicável compreende:
- NR-11 (Transporte, Movimentação, Armazenagem de Materiais).
- NR-12 (Segurança de Máquinas) - Portaria 916/2019.
- NR-18 (Segurança e Saúde no Trabalho na Indústria da Construção).
- ABNT NBR 11139 (Guindastes - Requisitos de segurança).
- ABNT NBR ISO 4301 (Classificação de equipamentos de içamento).
- ABNT NBR 6327 (Especificações de cabos de aço).
- ASME B30.5 (Mobile and Locomotive Cranes).`,
    
    secao_7: `A quantificação de perigos foi realizada por meio do algoritmo Hazard Rating Number (HRN) conforme ISO 12100:
HRN = Probabilidade de Ocorrência (LO) x Exposição (FE) x Gravidade (DPH) x Número de Pessoas (NP).
O resultado matemático enquadra os riscos em classes de periculosidade (Desprezível a Inaceitável), direcionando a prioridade de adequação técnica de engenharia.`,
    
    secao_17: `Condições para liberação sem restrições do equipamento:
1. Sanar vazamento de óleo no bloco do comando hidráulico lateral.
2. Substituir cabo de aço que apresente esmagamento ou arames rompidos acima de 10% em um passe.
3. Executar o teste de calibração eletrônica com carga padrão do LMI no prazo máximo de 5 dias.`,
    
    secao_18: `A presente vistoria pericial foi estritamente focada em inspeção visual mecânica e testes funcionais operacionais na data indicada. Não abrange ensaios não destrutivos de ultrassom industrial interno para verificação de micro-fissuras metalúrgicas em eixos e pinos, sendo estas recomendadas preventivamente a cada 24 meses.`
  };
}

export default function LaudoCaminhaoMunckIndep({ onBack, initialPrefilled = false, clients }: { onBack?: () => void, initialPrefilled?: boolean, clients?: ClientData[] }) {
  const [activeTab, setActiveTab] = useState<"form" | "pricing" | "preview">("form");

  // Automatically prefill and show preview if requested
  useEffect(() => {
    if (initialPrefilled) {
      generateExampleReport();
      setActiveTab("preview");
    }
  }, [initialPrefilled]);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    capa: true,
    carta: true,
    sumario: true,
    secao1: true,
    secao2: true,
    secao3: true,
    secao4: true,
    secao5: true,
    secao6: true,
    secao7: true,
    secao8: true,
    secao9: true,
    secao10: true,
    secao11: true,
    secao12: true,
    secao13: true,
    secao14: true,
    secao15: true,
    secao16: true,
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // --- GENERAL PARAMETERS STATE ---
  const [laudoParams, setLaudoParams] = useState({
    laudoNumber: "LMU-001/2026 Rev. 00",
    clientName: "",
    cnpj: "",
    address: "",
    equipmentName: "Caminhão Munck",
    brand: "",
    model: "",
    serialNumber: "",
    year: "2021",
    tag: "",
    capacityNominal: "12 toneladas",
    maxIcationHeight: "18 metros",
    boomLength: "15 metros",
    horimetro: "2400",
    driveType: "Hidráulico tomada de força",
    inspectionCity: "Recife",
    inspectionDate: new Date().toISOString().split("T")[0],
    notes: "",
    coverImage: "",
    loadChartImage: "",
    normasAdicionais: "ASME B30.5, ABNT NBR 14768, OSHA 1926.1412"
  });

  // --- CHECKLIST STATE ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Initialize checklist
  useEffect(() => {
    const initial = CRANE_CHECKLIST_TEMPLATE.map(item => ({
      id: item.id,
      text: item.text,
      category: item.category,
      resposta: "SIM" as const,
      nota: "Observado em condições operacionais perfeitas e seguras durante a auditoria visual.",
      image: undefined
    }));
    setChecklist(initial);
  }, []);

  // --- SYSTEMS INSPECTION STATE (12 specialized systems) ---
  const [sistemasInspecao, setSistemasInspecao] = useState(DEFAULT_SYSTEMS);

  // --- HRN BEFORE STATE ---
  const [hrnBefore, setHrnBefore] = useState({
    lo: 8.0,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 300.0,
    classification: "Risco Muito Alto",
    explicacao: "Perigo de queda catastrófica de carga suspensa sobre colaboradores devido a potencial fadiga de cabo de aço esmagado e inoperância do sistema LMI eletrônico."
  });

  // --- HRN AFTER STATE ---
  const [hrnAfter, setHrnAfter] = useState({
    lo: 0.033,
    fe: 2.5,
    dph: 15.0,
    np: 1.0,
    score: 1.23,
    classification: "Risco Muito Baixo",
    explicacao: "Redução drástica do perigo catastrófico após substituição física do cabo de elevação e aferição precisa com aferição de carga real do sistema LMI."
  });

  // --- LMI / CNC TABLE STATE ---
  const [capacityTable, setCapacityTable] = useState<CapacityRow[]>([
    { raio: "2.0 metros", angulo: "75°", cnc: "CNC: 12.000 kg" },
    { raio: "4.0 metros", angulo: "60°", cnc: "CNC: 5.200 kg" },
    { raio: "6.0 metros", angulo: "45°", cnc: "CNC: 3.100 kg" },
    { raio: "8.0 metros", angulo: "30°", cnc: "CNC: 1.950 kg" },
    { raio: "10.0 metros", angulo: "15°", cnc: "CNC: 1.300 kg" }
  ]);

  const [newRow, setNewRow] = useState<CapacityRow>({ raio: "", angulo: "", cnc: "" });

  const addCapacityRow = () => {
    if (newRow.raio && newRow.cnc) {
      setCapacityTable([...capacityTable, newRow]);
      setNewRow({ raio: "", angulo: "", cnc: "" });
    }
  };

  const removeCapacityRow = (index: number) => {
    setCapacityTable(capacityTable.filter((_, i) => i !== index));
  };

  // --- NON CONFORMITIES STATE ---
  const [naoConformidades, setNaoConformidades] = useState([
    {
      id: "NC-01",
      descricao: "Cabo de aço principal de elevação exibe deformação mecânica do tipo esmagamento por enrolamento inadequado no tambor carretel, contrariando a ABNT NBR 6327.",
      criticidade: "CRÍTICA",
      risco: "Ruptura de cabo metálico e queda catastrófica de material",
      norma: "NR-11 item 11.1.3.1 / NBR 6327"
    },
    {
      id: "NC-02",
      descricao: "Limitador eletrônico de momento de carga (LMI) encontra-se inativo no visor de bordo do operador, sem calibração ou parametrização funcional na data de inspeção.",
      criticidade: "CRÍTICA",
      risco: "Tombamento do guindaste por excesso de momento de carga estática",
      norma: "NR-12 item 12.112 / NBR 11139"
    },
    {
      id: "NC-03",
      descricao: "Vazamento contínuo de fluido hidráulico nas conexões flexíveis da mangueira de alimentação lateral do bloco de válvulas do comando mecânico.",
      criticidade: "MÉDIA",
      risco: "Contaminação local e queda de pressão do sistema operacional",
      norma: "NR-12 item 12.42"
    }
  ]);

  // --- PLAN OF ACTION STATE ---
  const [planoAcao, setPlanoAcao] = useState([
    {
      id: "AP-01",
      problema: "Cabo de aço de elevação danificado",
      norma: "ABNT NBR 6327",
      recomendacao: "Substituir imediatamente o cabo de aço por modelo original certificado fornecido por representante homologado.",
      prioridade: "IMEDIATO",
      responsavel: "Equipe de Manutenção Mecânica VL Engenharia",
      prazo: "2 dias"
    },
    {
      id: "AP-02",
      problema: "LMI descalibrado ou inoperante",
      norma: "ABNT NBR 11139",
      recomendacao: "Instalar placa controladora, calibrar sensores e testar o corte ativo do LMI a 100% da carga útil máxima de projeto.",
      prioridade: "IMEDIATO",
      responsavel: "Técnico especialista em eletrônica de bordo",
      prazo: "3 dias"
    },
    {
      id: "AP-03",
      problema: "Vazamento hidráulico em mangueira",
      norma: "NR-12 item 12.42",
      recomendacao: "Trocar conexões oxidadas e anéis o-ring do bloco de válvulas de controle.",
      prioridade: "MÉDIO PRAZO",
      responsavel: "Equipe de hidráulica pericial",
      prazo: "7 dias"
    }
  ]);

  // --- CONCLUSION STATE ---
  const [conclusao, setConclusao] = useState({
    status: "NÃO CONFORME",
    parecer: "O caminhão Munck encontra-se em condições físicas NÃO CONFORMES frente às exigências obrigatórias de segurança física da NR-11 e NR-12. Fica determinada a INTERDIÇÃO IMEDIATA e preventiva das movimentações de carga suspensa até a substituição completa do cabo de aço de elevação e a calibração com emissão de ensaio funcional dinâmico do limitador eletrônico de momento de carga (LMI)."
  });

  // --- SECTION TEXTS STATE ---
  const [secoesLaudo, setSecoesLaudo] = useState(generateSectionDrafts(laudoParams));

  // Auto update sections on parameter change
  useEffect(() => {
    setSecoesLaudo(generateSectionDrafts(laudoParams));
  }, [laudoParams]);

  // --- INTERACTIVE HRN CALCULATORS ---
  const calculateHRNScore = (lo: number, fe: number, dph: number, np: number) => {
    return Number((lo * fe * dph * np).toFixed(2));
  };

  const handleHrnBeforeChange = (field: "lo" | "fe" | "dph" | "np", value: number) => {
    const updated = { ...hrnBefore, [field]: value };
    const score = calculateHRNScore(updated.lo, updated.fe, updated.dph, updated.np);
    const classification = getHRNClassification(score).label;
    setHrnBefore({ ...updated, score, classification });
  };

  const handleHrnAfterChange = (field: "lo" | "fe" | "dph" | "np", value: number) => {
    const updated = { ...hrnAfter, [field]: value };
    const score = calculateHRNScore(updated.lo, updated.fe, updated.dph, updated.np);
    const classification = getHRNClassification(score).label;
    setHrnAfter({ ...updated, score, classification });
  };

  // --- PHOTO MANAGEMENT FOR EVIDENCES & CHECKLIST POINTS ---
  const handleGeneralImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
            description: "Registro visual fotográfico do estado físico estrutural do equipamento de içamento."
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGeneralImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleChecklistImageUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setChecklist(prev => prev.map((item, i) => {
        if (i === index) {
          return { ...item, image: reader.result as string };
        }
        return item;
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeChecklistImage = (index: number) => {
    setChecklist(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, image: undefined };
      }
      return item;
    }));
  };

  // --- GEMINI AI GENERATION FUNCTION ---
  const callGeminiAuditor = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/gemini/crane-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...laudoParams,
          images: uploadedImages
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor de Inteligência. (Status: ${response.status})`);
      }

      const data = await response.json();

      // Hydrate state from Gemini Response
      if (data.numero) {
        setLaudoParams(prev => ({ ...prev, laudoNumber: data.numero }));
      }

      // Check checklist
      if (data.checklist) {
        setChecklist(prev => prev.map(item => {
          const match = data.checklist[item.id.replace("chk_", "item_")];
          if (match) {
            return {
              ...item,
              resposta: match.resposta,
              nota: match.nota
            };
          }
          return item;
        }));
      }

      // Check HRN
      if (data.hrn_before) {
        setHrnBefore(data.hrn_before);
      }
      if (data.hrn_after) {
        setHrnAfter(data.hrn_after);
      }

      // Systems inspection
      if (data.sistemas_inspecao) {
        setSistemasInspecao(prev => ({
          ...prev,
          ...data.sistemas_inspecao
        }));
      }

      // Capacity table
      if (data.capacity_carga && data.capacity_carga.length > 0) {
        setCapacityTable(data.capacity_carga);
      }

      // Non conformities
      if (data.nao_conformidades) {
        setNaoConformidades(data.nao_conformidades);
      }

      // Action plan
      if (data.plano_action) {
        setPlanoAcao(data.plano_action);
      }

      // Conclusion
      if (data.conclusao) {
        setConclusao(data.conclusao);
      }

      // Sections text
      if (data.secoes) {
        setSecoesLaudo(data.secoes);
      }

      setActiveTab("preview");
    } catch (error: any) {
      console.error(error);
      alert(`Erro no assistente de auditoria inteligente: ${error.message || "Falha desconhecida"}`);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const element = document.getElementById("laudo-crane-printable-area");
      if (!element) return;

      // Add special class to body to alter layout during PDF generation
      document.body.classList.add("generating-pdf");

      // Replace modern unsupported OKLCH colors in styles with standard rgb values temporarily
      await preprocessStylesheets(element);

      // Set options - using a margin of 5mm (with our CSS padding, it becomes very elegant)
      const opt = {
        margin:       5,
        filename:     `Laudo_${laudoParams.tag || "Caminhao_Munck"}_${laudoParams.laudoNumber.replace(/\//g, "-")}.pdf`,
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak:    { mode: ["avoid-all", "css", "legacy"] }
      };

      // Get or load html2pdf safely with multiple fallbacks
      let exporter = (window as any).html2pdf;
      if (!exporter) {
        // @ts-ignore
        exporter = html2pdf?.default || html2pdf;
      }

      if (typeof exporter !== "function") {
        // Dynamically load the bundled html2pdf.js from CDN to guarantee resolution
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.crossOrigin = "anonymous";
          script.onload = () => {
            exporter = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => reject(new Error("Não foi possível carregar a biblioteca de geração de PDF."));
          document.body.appendChild(script);
        });
      }

      if (typeof exporter !== "function") {
        throw new Error("A biblioteca html2pdf não pôde ser iniciada.");
      }

      await exporter().set(opt).from(element).save();
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      alert(`Houve um erro ao gerar o PDF: ${err?.message || err}. Por favor, tente novamente.`);
    } finally {
      // Remove special class from body and restore original stylesheets
      document.body.classList.remove("generating-pdf");
      restoreStylesheets();
      setIsDownloadingPdf(false);
    }
  };

  const generateExampleReport = () => {
    // 1. Popular parâmetros gerais com dados genéricos realistas
    setLaudoParams({
      laudoNumber: "LMG-45007/2026-A",
      clientName: "CONSTRUTORA PERNAMBUCANA LTDA",
      cnpj: "12.345.678/0001-90",
      address: "Av. Governador Agamenon Magalhães, 2500 - Espinheiro, Recife - PE",
      equipmentName: "Caminhão Munck Articulado 45T",
      brand: "Madal Palfinger",
      model: "MD 45007",
      serialNumber: "MP-2023-8842-X",
      year: "2023",
      tag: "MUNCK-14",
      capacityNominal: "45 toneladas-metro (Capacidade máx. 12.500 kg)",
      maxIcationHeight: "22.5 metros",
      boomLength: "19.8 metros",
      horimetro: "1850",
      driveType: "Acoplamento hidráulico por tomada de força (PTO)",
      inspectionCity: "Recife",
      inspectionDate: "2026-07-01",
      notes: "Vistoria técnica presencial ordinária de conformidade mecânica periódica para validação de segurança de guindaste veicular e acessórios de içamento de carga em conformidade com as normas regulamentadoras.",
      coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
      loadChartImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
    });

    // 2. Imagens reais (sem ser IA) de equipamentos/campo
    setUploadedImages([
      {
        name: "caminhao_munck_campo.jpg",
        data: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
        description: "Vista geral do caminhão Munck posicionado para início de testes operacionais em canteiro de obras."
      },
      {
        name: "moitao_inspecao.jpg",
        data: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop",
        description: "Inspeção dimensional do moitão de carga e gancho forjado com respectiva trava de retenção de cabo ativa."
      },
      {
        name: "patolas_estabilizadoras.jpg",
        data: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
        description: "Estabilizadores hidráulicos estendidos sob pranchas de apoio de alta resistência para distribuição de pressão no solo."
      }
    ]);

    // 3. Atualizar sistemas com comentários de engenharia de campo reais
    setSistemasInspecao({
      lança_pluma: "Braço articulado com quatro extensões telescópicas em perfeito alinhamento. Ausência de deformação plástica nas chapas estruturais de aço de alta resistência.",
      içamento: "Guincho de cabo operando suavemente durante testes de elevação e descida. Cabo de aço enrolando uniformemente nas ranhuras do tambor carretel.",
      hidraulico: "Pressão de trabalho nominal estável de 210 bar. Válvulas piloto de bloqueio mecânico de cilindros atuando sem vazamento.",
      gancho_moitao: "Moitão do gancho sem sinais de folga nos rolamentos do pinhão de giro. Gancho forjado com trava de segurança com mola helicoidal de retorno funcional.",
      estabilizadores: "Cilindros estabilizadores de dupla ação estendem e recolhem fluidamente. Sem vazamentos mecânicos ou perda de sustentação em teste estático.",
      rotacao: "Coroa de giro e pinhão de acionamento engraxados, operando with giro macio e contínuo de 360 graus. Sem vibração ou ressaltos anômalos.",
      cabine_comandos: "Mesa de controle lateral de alavancas de comando em excelente estado. Resposta rápida de reversão e botões protegidos contra acidentes.",
      eletrico: "Fiação de comando elétrico protegida por conduítes plásticos sanfonados. Sinaleiras operacionais e faróis de iluminação de lança funcionando.",
      chassi_veicular: "Apoio e fixação estrutural do subchassi do Munck ao chassi do caminhão realizada com grampos de alta tensão perfeitamente ajustados.",
      dispositivos_seguranca: "Limitador de momento de carga (LMI) operando e calibrado, emitindo dados precisos de peso e ângulo na tela digital da cabine operacional.",
      acessorios: "As cintas de poliéster e manilhas de içamento inspecionadas encontram-se em perfeitas condições, com capacidade gravada legível e sem desgaste.",
      sinalizacao: "Sinalização visual das faixas refletivas de segurança das patolas em perfeitas condições de reflexão e tabelas de carga limpas e legíveis."
    });

    // 4. Preencher o checklist de conformidade com comentários técnicos detalhados
    const checklistComentarios: Record<string, { resposta: "SIM" | "NÃO" | "N/A"; nota: string }> = {
      m_2_crlv_valido: { resposta: "SIM", nota: "CRLV impresso com licenciamento vigente." },
      m_2_manual_equipamento: { resposta: "SIM", nota: "Manual original Madal Palfinger guardado na cabine." },
      m_2_tabela_carga: { resposta: "SIM", nota: "Tabela original plastificada disponível na cabine." },
      m_3_longarinas_sem_trincas: { resposta: "SIM", nota: "Chassi inspecionado visualmente e sem trincas detectadas." },
      m_4_coluna_principal: { resposta: "SIM", nota: "Coluna principal íntegra, soldas em perfeito estado." },
      m_5_vazamentos_hidraulicos: { resposta: "SIM", nota: "Nenhum sinal de vazamento ou gotejamento de fluido hidráulico." },
      m_6_integridade_lanca_princ: { resposta: "SIM", nota: "Lança sem amassamentos ou deformações visuais." },
      m_7_estado_gancho: { resposta: "SIM", nota: "Gancho sem sinais de desgaste, com rotação livre." },
      m_8_funcionamento_patolas: { resposta: "SIM", nota: "Estabilizadores abrem e travam normalmente sob pressão." },
      m_9_botao_emergencia: { resposta: "SIM", nota: "Botão cogumelo vermelho interrompe comandos imediatamente." }
    };

    setChecklist(prev => prev.map(item => {
      const match = checklistComentarios[item.id];
      if (match) {
        return {
          ...item,
          resposta: match.resposta,
          nota: match.nota
        };
      }
      return {
        ...item,
        resposta: "SIM" as const,
        nota: "Inspecionado e em perfeitas condições de conformidade operacional."
      };
    }));

    // 5. Matrizes HRN
    setHrnBefore({
      lo: 1.5,
      fe: 2.5,
      dph: 15.0,
      np: 1.0,
      score: 56.25,
      classification: "Risco Alto",
      explicacao: "Probabilidade aceitável de acidentes na movimentação de grandes volumes em canteiro se os limites nominais de carga não fossem rigidamente observados."
    });

    setHrnAfter({
      lo: 0.033,
      fe: 2.5,
      dph: 15.0,
      np: 1.0,
      score: 1.24,
      classification: "Risco Muito Baixo",
      explicacao: "Redução drástica do perigo após calibração total do LMI, fixação de sapatas e isolamento físico de área de segurança de queda."
    });

    // 6. Não conformidades resolvidas
    setNaoConformidades([
      {
        id: "NC-01",
        descricao: "Pequena folga nas proteções laterais de articulação do subchassi, sanada temporariamente por ajuste de parafuso de fixação de aço comum.",
        criticidade: "LEVE",
        risco: " Vibração excessiva em tráfego rodoviário",
        norma: "NR-12 item 12.38"
      }
    ]);

    // 7. Plano de ação
    setPlanoAcao([
      {
        id: "AP-01",
        problema: "Vibração de proteção",
        norma: "NR-12 item 12.38",
        recomendacao: "Manter o aperto periódico preventivo semanal do parafuso limitador de vibração de proteção metálica lateral do subchassi.",
        prioridade: "LONGO PRAZO",
        responsavel: "Operador ou equipe de manutenção diária",
        prazo: "30 dias"
      }
    ]);

    // 8. Conclusão Apto
    setConclusao({
      status: "APTO PARA OPERAÇÃO",
      parecer: "Após análise detalhada visual, funcional e paramétrica do equipamento de içamento Caminhão Munck de TAG MUNCK-14, certifica-se que este encontra-se em conformidade mecânica e operacional com as exigências técnicas da NR-11, NR-12 e NR-18. O ativo está TOTALMENTE APTO para realizar movimentações de carga dentro de sua curva nominal oficial de projeto."
    });

    // 9. Mudar para a aba de visualização
    setActiveTab("preview");
  };

  return (
    <div className={`space-y-8 text-left ${isFullscreen ? 'max-w-full' : 'max-w-7xl mx-auto'}`}>
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="text-xs font-mono font-bold text-[#134074] dark:text-[#4895EF] hover:underline uppercase shrink-0"
            >
              ← Voltar à central
            </button>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-black font-mono tracking-widest text-[#134074] dark:text-[#4895EF] uppercase bg-[#134074]/5 px-2.5 py-0.5 rounded border border-[#134074]/10">
              NR-11 & NBR 11139
            </span>
          </div>
          <h1 className="text-3xl font-black font-sans tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="w-8 h-8 text-[#134074] dark:text-[#4895EF]" />
            Gerador de Laudo de Munck IA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-2xl leading-relaxed">
            Laudo Técnico de Inspeção de Segurança de Caminhões Munck (Guindauto) e Acessórios de Içamento. Elabora relatórios estruturados com seções periciais integradas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            type="button"
            onClick={generateExampleReport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border border-[#134074] dark:border-[#4895EF] rounded-xl bg-[#134074]/5 text-[#134074] dark:text-[#4895EF] hover:bg-[#134074]/10 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Gerar Modelo Exemplo</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            {activeTab === "form" ? (
              <>
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Visualizar Laudo</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 text-[#134074]" />
                <span>Editar Formulário</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            disabled={activeTab === "form"}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-[#134074] hover:bg-[#0B2545] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-xl transition-all shadow-md shadow-[#134074]/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={activeTab === "form" || isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isDownloadingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Baixar PDF</span>
              </>
            )}
          </button>

          <button
            onClick={async () => {
              const success = await copyRichText("laudo-crane-printable-area");
              if (success) {
                alert("Laudo copiado em formato rico! Agora você pode colar (Ctrl+V) no Google Docs ou Word.");
              }
            }}
            disabled={activeTab === "form"}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-slate-100 border hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Copy className="w-4 h-4 text-indigo-500" />
            <span>Copiar p/ Google Docs</span>
          </button>

          <button
            onClick={() => exportToWord("laudo-crane-printable-area", `Laudo_${laudoParams.tag || "Caminhao_Munck"}_${laudoParams.laudoNumber.replace(/\//g, "-")}`)}
            disabled={activeTab === "form"}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Exportar p/ Word</span>
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
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "preview"
              ? "border-[#134074] text-[#134074] dark:border-[#4895EF] dark:text-[#4895EF]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Visualização do Documento Técnico
        </button>
      </div>

      {/* Main Grid content */}
      {activeTab === "pricing" ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <LaudoPricingTab 
            clientName={laudoParams.clientName}
            serviceType="Laudo de Caminhão Munck"
            equipmentName={laudoParams.equipmentName}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT FORM/PREVIEW PANEL */}
        <div className={`lg:col-span-8 space-y-8 ${activeTab === "preview" ? "bg-white text-slate-900 p-8 sm:p-12 border rounded-3xl shadow-sm" : ""}`}>
          
          {activeTab === "form" ? (
            <div className="space-y-10">
              
              {/* BLOCK 1: GENERAL PARAMETERS */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">01</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Parâmetros de Identificação Geral do Laudo</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Número do Laudo / Ref</label>
                    <input
                      type="text"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.laudoNumber}
                      onChange={e => setLaudoParams({ ...laudoParams, laudoNumber: e.target.value })}
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

                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Empresa Contratante</label>
                    <input
                      type="text"
                      placeholder="Ex: Metálica Soluções Industriais"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.clientName}
                      onChange={e => setLaudoParams({ ...laudoParams, clientName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">CNPJ</label>
                    <input
                      type="text"
                      placeholder="Ex: 09.123.456/0001-88"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.cnpj}
                      onChange={e => setLaudoParams({ ...laudoParams, cnpj: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Endereço da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Governador Agamenon Magalhães, 2500, Recife - PE"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.address}
                      onChange={e => setLaudoParams({ ...laudoParams, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Tipo de Equipamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Caminhão Munck ou Guindaste Torre"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.equipmentName}
                      onChange={e => setLaudoParams({ ...laudoParams, equipmentName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Fabricante / Marca</label>
                    <input
                      type="text"
                      placeholder="Ex: Madal Palfinger"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.brand}
                      onChange={e => setLaudoParams({ ...laudoParams, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Modelo do Equipamento</label>
                    <input
                      type="text"
                      placeholder="Ex: MD 30007"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.model}
                      onChange={e => setLaudoParams({ ...laudoParams, model: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Número de Série</label>
                    <input
                      type="text"
                      placeholder="Ex: MUN-2019-9482"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.serialNumber}
                      onChange={e => setLaudoParams({ ...laudoParams, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Ano de Fabricação</label>
                    <input
                      type="text"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.year}
                      onChange={e => setLaudoParams({ ...laudoParams, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Placa / TAG de Ativo</label>
                    <input
                      type="text"
                      placeholder="Ex: PE-ABC1234 / TAG-M-04"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.tag}
                      onChange={e => setLaudoParams({ ...laudoParams, tag: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Capacidade Nominal (CNC)</label>
                    <input
                      type="text"
                      placeholder="Ex: 10 toneladas"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.capacityNominal}
                      onChange={e => setLaudoParams({ ...laudoParams, capacityNominal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Altura Máx. Içamento</label>
                    <input
                      type="text"
                      placeholder="Ex: 18 metros"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.maxIcationHeight}
                      onChange={e => setLaudoParams({ ...laudoParams, maxIcationHeight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Comprimento de Lança</label>
                    <input
                      type="text"
                      placeholder="Ex: 15 metros"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.boomLength}
                      onChange={e => setLaudoParams({ ...laudoParams, boomLength: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Horímetro / KM de Trabalho</label>
                    <input
                      type="text"
                      placeholder="Ex: 2400"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.horimetro}
                      onChange={e => setLaudoParams({ ...laudoParams, horimetro: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Tipo de Acionamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Tomada de força hidráulica"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.driveType}
                      onChange={e => setLaudoParams({ ...laudoParams, driveType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-slate-500">Cidade da Inspeção</label>
                    <input
                      type="text"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                      value={laudoParams.inspectionCity}
                      onChange={e => setLaudoParams({ ...laudoParams, inspectionCity: e.target.value })}
                    />
                  </div>

                  {/* Normas Técnicas Adicionais */}
                  <div className="md:col-span-3 space-y-1.5 pt-2">
                    <label className="font-mono font-bold text-slate-500 block">Normas de Referência Adicionais / Internacionais</label>
                    <textarea
                      placeholder="Ex: ASME B30.5, ABNT NBR 14768, OSHA 1926.1412, etc. (Separe por vírgulas)"
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-mono text-xs"
                      value={laudoParams.normasAdicionais || ""}
                      onChange={e => setLaudoParams({ ...laudoParams, normasAdicionais: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Campo para importar foto para a capa */}
                  <div className="md:col-span-3 space-y-1.5 pt-2">
                    <label className="font-mono font-bold text-slate-500 block">Foto de Destaque da Capa do Laudo</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border dark:border-slate-800">
                      {laudoParams.coverImage ? (
                        <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden border">
                          <img src={laudoParams.coverImage} className="w-full h-full object-cover" alt="Cover preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setLaudoParams({ ...laudoParams, coverImage: "" })}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full sm:w-48 h-28 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border text-slate-300">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-normal">
                          Selecione uma imagem para a capa do laudo técnico. Ela será exibida no centro da capa profissional do PDF.
                        </p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Selecionar Imagem</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLaudoParams(prev => ({ ...prev, coverImage: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: INTERACTIVE CHECKLIST */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">02</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Checklist de Conformidade NR-11 / ABNT NBR 11139</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono border-b dark:border-slate-800">
                        <th className="p-3 w-12 text-center">Ref</th>
                        <th className="p-3">Item a Ser Auditado em Campo</th>
                        <th className="p-3 text-center w-40">Status de Inspeção</th>
                        <th className="p-3 w-48 text-center">Foto Anexa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {checklist.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                          <td className="p-3 text-center font-mono font-bold text-[#134074] dark:text-[#4895EF]">
                            {item.id.replace("chk_", "Nº ")}
                          </td>
                          <td className="p-3 space-y-2">
                            <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">{item.text}</p>
                            <input
                              type="text"
                              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 p-2 rounded-lg"
                              placeholder="Observação detalhada da conformidade física..."
                              value={item.nota}
                              onChange={e => setChecklist(prev => prev.map((ch, idx) => idx === index ? { ...ch, nota: e.target.value } : ch))}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 justify-center">
                              {["SIM", "NÃO", "N/A"].map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setChecklist(prev => prev.map((ch, idx) => idx === index ? { ...ch, resposta: status as any } : ch))}
                                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border transition-all ${
                                    item.resposta === status
                                      ? status === "SIM"
                                        ? "bg-emerald-500 text-white border-emerald-600"
                                        : status === "NÃO"
                                        ? "bg-red-500 text-white border-red-600"
                                        : "bg-slate-400 text-white border-slate-500"
                                      : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {item.image ? (
                              <div className="relative group inline-block">
                                <img src={item.image} className="w-24 h-24 object-cover rounded-xl border shadow-md hover:scale-105 transition-all cursor-zoom-in" />
                                <button
                                  type="button"
                                  onClick={() => removeChecklistImage(index)}
                                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow-md"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 cursor-pointer px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg text-slate-500 hover:text-emerald-600 font-mono text-[10px] uppercase font-bold transition-all mx-auto w-28">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Anexar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleChecklistImageUpload(index, e)}
                                />
                              </label>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BLOCK 3: CNC TABLE EDITOR */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">03</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Tabela de Capacidade de Carga (CNC) por Raio</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 border dark:border-slate-800 rounded-2xl space-y-4">
                  {/* Método de preenchimento da tabela de carga */}
                  <div className="border-b dark:border-slate-800 pb-4">
                    <label className="font-mono font-bold text-xs text-slate-500 uppercase tracking-wider block mb-2">Método de Exibição da Tabela de Carga</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${!laudoParams.loadChartImage ? 'bg-[#134074] text-white border-[#134074]' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        onClick={() => setLaudoParams(prev => ({ ...prev, loadChartImage: "" }))}
                      >
                        Preencher Manualmente (Tabela)
                      </button>
                      <label
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold font-mono text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${laudoParams.loadChartImage ? 'bg-[#134074] text-white border-[#134074]' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>{laudoParams.loadChartImage ? "Foto da Tabela Ativa" : "Upload da Foto da Tabela"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLaudoParams(prev => ({ ...prev, loadChartImage: reader.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {laudoParams.loadChartImage ? (
                    <div className="space-y-3 border dark:border-slate-800 p-4 rounded-xl bg-white dark:bg-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">Foto da Tabela de Carga do Equipamento Carregada:</span>
                        <button
                          type="button"
                          onClick={() => setLaudoParams(prev => ({ ...prev, loadChartImage: "" }))}
                          className="text-xs font-bold font-mono text-red-500 hover:text-red-700"
                        >
                          Remover Foto e Voltar para Tabela
                        </button>
                      </div>
                      <div className="max-w-md mx-auto aspect-video rounded-lg overflow-hidden border dark:border-slate-800">
                        <img src={laudoParams.loadChartImage} className="w-full h-full object-contain bg-slate-50 dark:bg-slate-950" alt="Tabela de Carga do Equipamento" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                        Insira os raios de operação, ângulo de lança e a Capacidade Nominal de Carga (CNC) correspondente informada no manual técnico do fabricante.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <input
                          type="text"
                          placeholder="Raio (ex: Raio de 5.0m)"
                          className="border dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newRow.raio}
                          onChange={e => setNewRow({ ...newRow, raio: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Ângulo (ex: 55°)"
                          className="border dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newRow.angulo}
                          onChange={e => setNewRow({ ...newRow, angulo: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="CNC (ex: CNC: 4.200 kg)"
                          className="border dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                          value={newRow.cnc}
                          onChange={e => setNewRow({ ...newRow, cnc: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={addCapacityRow}
                          className="bg-[#134074] hover:bg-[#0B2545] text-white font-mono font-bold p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-xs text-left border rounded-xl overflow-hidden border-collapse font-mono">
                          <thead>
                            <tr className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              <th className="p-3">Raio de Operação</th>
                              <th className="p-3">Ângulo da Lança</th>
                              <th className="p-3">Capacidade Nominal (CNC)</th>
                              <th className="p-3 text-center w-20">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-800 bg-white dark:bg-slate-950">
                            {capacityTable.map((row, i) => (
                              <tr key={i}>
                                <td className="p-3">{row.raio}</td>
                                <td className="p-3">{row.angulo}</td>
                                <td className="p-3 font-bold text-red-600">{row.cnc}</td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeCapacityRow(i)}
                                    className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* BLOCK 4: INTERACTIVE HRN CALCULATOR BEFORE AND AFTER */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">04</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Cálculo de HRN Interativo (Apreciação de Risco)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
                  
                  {/* HRN BEFORE */}
                  <div className="border border-red-200 dark:border-red-950/40 rounded-2xl p-6 bg-red-500/[0.02] space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-red-200/50 dark:border-red-950/50">
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase">SITUAÇÃO ATUAL (ANTES)</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">LO - PROBABILIDADE</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnBefore.lo}
                          onChange={e => handleHrnBeforeChange("lo", Number(e.target.value))}
                        >
                          {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">FE - EXPOSIÇÃO</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnBefore.fe}
                          onChange={e => handleHrnBeforeChange("fe", Number(e.target.value))}
                        >
                          {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">DPH - GRAVIDADE</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnBefore.dph}
                          onChange={e => handleHrnBeforeChange("dph", Number(e.target.value))}
                        >
                          {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">NP - NÚMERO DE PESSOAS</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnBefore.np}
                          onChange={e => handleHrnBeforeChange("np", Number(e.target.value))}
                        >
                          {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="p-4 bg-red-100/40 dark:bg-red-950/20 rounded-xl border border-red-200/50 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-red-600">SCORE FINAL HRN:</span>
                          <span className="font-black text-lg text-red-700">{hrnBefore.score}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-500">ENQUADRAMENTO:</span>
                          <span className="font-bold uppercase text-red-600">{hrnBefore.classification}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">EXPLICAÇÃO TÉCNICA DO RISCO</label>
                        <textarea
                          rows={2}
                          className="w-full border rounded-lg p-2 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                          value={hrnBefore.explicacao}
                          onChange={e => setHrnBefore({ ...hrnBefore, explicacao: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* HRN AFTER */}
                  <div className="border border-emerald-200 dark:border-emerald-950/40 rounded-2xl p-6 bg-emerald-500/[0.02] space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/50 dark:border-emerald-950/50">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase">SITUAÇÃO PROPOSTA (DEPOIS)</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">LO - PROBABILIDADE</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnAfter.lo}
                          onChange={e => handleHrnAfterChange("lo", Number(e.target.value))}
                        >
                          {LO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">FE - EXPOSIÇÃO</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnAfter.fe}
                          onChange={e => handleHrnAfterChange("fe", Number(e.target.value))}
                        >
                          {FE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">DPH - GRAVIDADE</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnAfter.dph}
                          onChange={e => handleHrnAfterChange("dph", Number(e.target.value))}
                        >
                          {DPH_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">NP - NÚMERO DE PESSOAS</label>
                        <select
                          className="w-full border rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          value={hrnAfter.np}
                          onChange={e => handleHrnAfterChange("np", Number(e.target.value))}
                        >
                          {NP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>

                      <div className="p-4 bg-emerald-100/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-emerald-600">SCORE FINAL HRN:</span>
                          <span className="font-black text-lg text-emerald-700">{hrnAfter.score}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-500">ENQUADRAMENTO:</span>
                          <span className="font-bold uppercase text-emerald-600">{hrnAfter.classification}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">EXPLICAÇÃO TÉCNICA DE MITIGAÇÃO</label>
                        <textarea
                          rows={2}
                          className="w-full border rounded-lg p-2 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                          value={hrnAfter.explicacao}
                          onChange={e => setHrnAfter({ ...hrnAfter, explicacao: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* BLOCK 5: 12 SYSTEMS INSPECTION TEXTS */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">05</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Registro de Vistoria Detalhada por Subsistema</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {Object.keys(sistemasInspecao).map((sysKey) => {
                    const typedKey = sysKey as keyof typeof DEFAULT_SYSTEMS;
                    const cleanLabel = typedKey.replace("_", " ").toUpperCase();
                    return (
                      <div key={sysKey} className="space-y-1.5">
                        <label className="font-mono font-bold text-slate-500 uppercase">Sistema: {cleanLabel}</label>
                        <textarea
                          rows={3}
                          className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white leading-relaxed font-sans"
                          value={sistemasInspecao[typedKey]}
                          onChange={e => setSistemasInspecao({ ...sistemasInspecao, [typedKey]: e.target.value })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BLOCK 6: CONCLUSION PARECER */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-900 border text-slate-600 rounded">06</span>
                  <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight">Parecer Pericial Conclusivo</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 border dark:border-slate-800 rounded-2xl space-y-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">Status da Liberação Operacional</label>
                    <div className="flex gap-2">
                      {["APTO PARA OPERAÇÃO", "NÃO APTO", "APTO COM RESTRIÇÕES"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setConclusao({ ...conclusao, status: st })}
                          className={`flex-1 p-2.5 font-bold rounded-xl border text-[10px] transition-all uppercase ${
                            conclusao.status === st
                              ? st === "APTO PARA OPERAÇÃO"
                                ? "bg-emerald-600 border-emerald-700 text-white"
                                : st === "NÃO APTO"
                                ? "bg-red-600 border-red-700 text-white animate-pulse"
                                : "bg-amber-500 border-amber-600 text-white"
                              : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">Parecer Técnico e Recomendações Críticas</label>
                    <textarea
                      rows={4}
                      className="w-full border dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-white leading-relaxed font-sans"
                      value={conclusao.parecer}
                      onChange={e => setConclusao({ ...conclusao, parecer: e.target.value })}
                    />
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* CONFIGURAÇÃO DE SEÇÕES DO RELATÓRIO */}
              <div className="max-w-4xl mx-auto mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl print:hidden text-left shadow-sm">
                <h3 className="font-mono font-black text-[#0B2545] dark:text-[#4895EF] uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Opções de Visualização e Impressão (Configurar A4)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  O laudo é exportado no formato A4 em alta definição. Selecione quais seções deseja incluir no documento final. Desmarque as seções que não julgar necessárias para deixar o laudo mais limpo, enxuto e focado.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.capa}
                      onChange={(e) => setPrintConfig({ ...printConfig, capa: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>Capa do Laudo</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.carta}
                      onChange={(e) => setPrintConfig({ ...printConfig, carta: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>Carta de Apres.</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.sumario}
                      onChange={(e) => setPrintConfig({ ...printConfig, sumario: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>Sumário Geral</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao1}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao1: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 1: Introdução</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao2}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao2: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 2: Contratante</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao3}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao3: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 3: Contratada</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao4}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao4: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 4: Dados Equip.</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao5}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao5: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 5: Documentos</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao6}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao6: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 6: Normas</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao7}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao7: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 7: Metodologia</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao8}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao8: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 8: Relatório Fotogr.</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao9}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao9: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 9: Subsistemas</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao10}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao10: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 10: Tabela Carga</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao11}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao11: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 11: Checklist</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao12}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao12: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 12: Perigos / HRN</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao13}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao13: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 13: Não Conform.</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao14}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao14: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 14: Plano Ação</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao15}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao15: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 15: Conclusão</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-slate-950 dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={printConfig.secao16}
                      onChange={(e) => setPrintConfig({ ...printConfig, secao16: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-800 w-4 h-4"
                    />
                    <span>SEÇÃO 16: Limitações</span>
                  </label>
                </div>
              </div>

              {/* DETAILED PRINTABLE REPORT VIEW */}
              <div id="laudo-crane-printable-area" className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-8 md:p-14 text-left leading-relaxed text-slate-900 rounded-3xl print:border-none print:shadow-none print:p-0 print:rounded-none">
              
              {/* CAPA DO LAUDO */}
              {printConfig.capa && (
                <div className="py-12 border-b-4 border-[#134074] space-y-8 text-center flex flex-col justify-between" style={{ pageBreakAfter: "always" }}>
                  <div className="flex justify-between items-center border-b pb-4">
                    <div className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-400 space-y-0.5">
                      <p className="font-black text-slate-800">VL Engenharia S/A</p>
                      <p>Crea: 1822299490 – PE</p>
                    </div>
                    
                    <Logo variant="print" className="h-16" />
                  </div>

                  <div className="space-y-4 py-4">
                    <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-slate-900 leading-tight">
                      Laudo Técnico de Inspeção e Integridade Física
                    </h1>
                    <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                      CAMINHÕES MUNCK, GUINDASTES E ACESSÓRIOS DE IÇAMENTO
                    </p>
                  </div>

                  {/* Espaço para Foto do Equipamento na Capa */}
                  <div className="my-6 max-w-xl mx-auto w-full h-64 bg-slate-50 border rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative print:border print:shadow-none print:my-4">
                    {laudoParams.coverImage ? (
                      <img src={laudoParams.coverImage} className="w-full h-full object-cover" alt="Equipamento Vistoriado" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-300">
                        <p className="text-xs font-mono font-bold uppercase tracking-wider">Foto do Equipamento Vistoriado</p>
                        <p className="text-[10px] font-sans max-w-xs mx-auto">Nenhuma imagem carregada para a capa. Insira no formulário de edição.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto border-t border-b py-8 font-mono text-xs leading-relaxed">
                    <p><strong>EQUIPAMENTO:</strong> {laudoParams.equipmentName}</p>
                    <p><strong>FABRICANTE:</strong> {laudoParams.brand}</p>
                    <p><strong>MODELO / SÉRIE:</strong> {laudoParams.model} / {laudoParams.serialNumber}</p>
                    <p><strong>PLACA / TAG:</strong> <span className="text-red-600 font-bold">{laudoParams.tag}</span></p>
                    <p><strong>LAUDO N°:</strong> {laudoParams.laudoNumber}</p>
                    <p><strong>EMISSÃO:</strong> {laudoParams.inspectionDate.split("-").reverse().join("/")}</p>
                    <p><strong>CIDADE:</strong> {laudoParams.inspectionCity}</p>
                    <p><strong>N° ART:</strong> <span className="text-slate-500 underline font-bold">ART-PE-{Math.floor(1000000 + Math.random() * 9000000)}</span></p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Emitido eletronicamente pela VL Engenharia pericial</p>
                    <p className="text-xs text-slate-500 font-mono">Engenheiro Vitor Leonardo — CREA-PE 1822299490</p>
                  </div>
                </div>
              )}

              {/* CARTA DE APRESENTAÇÃO */}
              {printConfig.carta && (
                <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">Carta de Apresentação Técnica</h2>
                  <div className="text-xs text-slate-700 space-y-4 leading-relaxed font-sans">
                    <p>Prezados Senhores,</p>
                    <p>
                      Apresentamos o Relatório Técnico de Auditoria Mecânica e Inspeção de Segurança do equipamento de içamento <strong>{laudoParams.equipmentName}</strong>, de fabricação <strong>{laudoParams.brand}</strong>, modelo <strong>{laudoParams.model}</strong>, sob o TAG identificador <strong>{laudoParams.tag}</strong>.
                    </p>
                    <p>
                      O objetivo desta análise consistiu em inspecionar minuciosamente os subsistemas de sustentação metálica, cilindros hidráulicos de extensão e elevação, condições estruturais do moitão de carga, cabos metálicos de tração e a operacionalidade das patolas de estabilização, além de calibrar quantitativamente os graus de risco operacional através do algoritmo internacional HRN.
                    </p>
                    <p>
                      Este relatório lista as não conformidades normativas diagnosticadas in loco, fornecendo o respectivo enquadramento técnico-jurídico perante as Normas Regulamentadoras do Ministério do Trabalho (MTE) e as resoluções vigentes de fiscalização.
                    </p>
                    <p className="pt-8">Atenciosamente,</p>
                    <div className="space-y-1 font-mono text-xs pt-4">
                      <p className="font-bold">Eng. Mecânico Vitor Leonardo Cordeiro Linhares</p>
                      <p>CREA-PE: 1822299490</p>
                      <p>E-mail: vitorleonardocl@gmail.com | Fone: (81) 98444-2592</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUMÁRIO */}
              {printConfig.sumario && (
                <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">Sumário Geral do Documento</h2>
                  <div className="space-y-2 font-mono text-xs leading-relaxed text-slate-600">
                    <div className="flex justify-between"><span>SEÇÃO 1: Introdução, Escopo e Metodologia de Inspeção</span><span>03</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 2: Dados do Estabelecimento Contratante</span><span>03</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 3: Qualificação Técnica da Empresa Contratada</span><span>03</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 4: Dados do Equipamento e Especificação Operacional</span><span>04</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 5: Documentos Técnicos Analisados na Perícia</span><span>04</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 6: Normas Regulamentadoras e Legislações Aplicáveis</span><span>04</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 7: Metodologia Hazard Rating Number (HRN)</span><span>05</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 8: Relatório de Registro Fotográfico Técnico</span><span>05</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 9: Inspeção Visual Detalhada por Subsistema</span><span>06</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 10: Tabela de Capacidade de Carga (CNC) por Raio</span><span>07</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 11: Checklist de Conformidade da NR-11 / NBR 11139</span><span>08</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 12: Identificação dos Perigos e Apreciação de Risco (HRN)</span><span>09</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 13: Diagnóstico de Não Conformidades Regulamentares</span><span>10</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 14: Cronograma de Plano de Ação Recomendado</span><span>10</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 15: Conclusão Técnica e Parecer Pericial Final</span><span>11</span></div>
                    <div className="flex justify-between"><span>SEÇÃO 16: Limitações e Observações Finais de Campo</span><span>11</span></div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 1: INTRODUÇÃO (PÁGINA DEDICADA NO PDF) */}
              {printConfig.secao1 && (
                <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 1: Introdução, Escopo e Metodologia</h2>
                  <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_1}</p>
                </div>
              )}

              {/* SEÇÕES 2 E 3 */}
              {(printConfig.secao2 || printConfig.secao3) && (
                <div className="py-12 border-b space-y-6" style={{ pageBreakAfter: "always" }}>
                  {printConfig.secao2 && (
                    <>
                      <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 2: Dados do Estabelecimento Contratante</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-50 border p-4 rounded-xl leading-relaxed mb-6">
                        <p><strong>Razão Social:</strong> {laudoParams.clientName || "Não informada"}</p>
                        <p><strong>CNPJ:</strong> {laudoParams.cnpj || "Não informado"}</p>
                        <p className="sm:col-span-2"><strong>Endereço Operacional:</strong> {laudoParams.address || "Não informado"}</p>
                      </div>
                    </>
                  )}

                  {printConfig.secao3 && (
                    <>
                      <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5 pt-4">SEÇÃO 3: Qualificação Técnica da Empresa Contratada</h2>
                      <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans">{secoesLaudo.secao_3}</p>
                    </>
                  )}
                </div>
              )}

              {/* SEÇÃO 4: DADOS DO EQUIPAMENTO */}
              {printConfig.secao4 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 4: Dados Técnicos e Operacionais do Equipamento</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border rounded-xl border-collapse font-mono">
                      <thead>
                        <tr className="bg-[#134074] text-white">
                          <th className="p-3">Parâmetro Técnico de Projeto</th>
                          <th className="p-3">Informação / Valor Constatado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        <tr><td className="p-3 font-bold bg-slate-50">Equipamento / Máquina</td><td className="p-3">{laudoParams.equipmentName}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Fabricante</td><td className="p-3">{laudoParams.brand}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Modelo</td><td className="p-3">{laudoParams.model}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Número de Série</td><td className="p-3">{laudoParams.serialNumber}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Ano de Fabricação</td><td className="p-3">{laudoParams.year}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Capacidade Nominal (CNC)</td><td className="p-3">{laudoParams.capacityNominal}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Altura Máxima Içamento</td><td className="p-3">{laudoParams.maxIcationHeight}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Comprimento de Lança</td><td className="p-3">{laudoParams.boomLength}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Identificador / TAG</td><td className="p-3 font-bold text-red-600">{laudoParams.tag}</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Horímetro / KM Registrados</td><td className="p-3">{laudoParams.horimetro} h</td></tr>
                        <tr><td className="p-3 font-bold bg-slate-50">Tipo de Acionamento</td><td className="p-3">{laudoParams.driveType}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SEÇÕES 5, 6, 7 */}
              {(printConfig.secao5 || printConfig.secao6 || printConfig.secao7) && (
                <div className="py-12 border-b space-y-6">
                  {printConfig.secao5 && (
                    <>
                      <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 5: Documentos Técnicos Analisados na Perícia</h2>
                      <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap mb-6">{secoesLaudo.secao_5}</p>
                    </>
                  )}

                  {printConfig.secao6 && (
                    <>
                      <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5 pt-4">SEÇÃO 6: Normas Regulamentadoras e Legislações Aplicáveis</h2>
                      <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans mb-6">{secoesLaudo.secao_6}</p>
                    </>
                  )}

                  {printConfig.secao7 && (
                    <>
                      <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5 pt-4">SEÇÃO 7: Metodologia Hazard Rating Number (HRN)</h2>
                      <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_7}</p>
                    </>
                  )}
                </div>
              )}

              {/* SEÇÃO 8: EVIDÊNCIAS FOTOGRÁFICAS */}
              {printConfig.secao8 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 8: Relatório de Inspeção Visual e Fotográfica</h2>
                  {uploadedImages.length === 0 ? (
                    <div className="p-6 border border-dashed text-center rounded-xl bg-slate-50 text-xs text-slate-400 font-mono">
                      <span>Nenhum registro fotográfico anexado ao laudo na data de hoje.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="border rounded-xl p-3 bg-slate-50 space-y-3 font-mono text-[10px] text-slate-700">
                          <div className="aspect-video rounded-lg overflow-hidden border bg-white">
                            <img src={img.data} alt={`Anexo ${i+1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left space-y-1">
                            <p className="font-bold uppercase text-slate-800">Fotografia Técnica {i+1}: {img.name}</p>
                            <p className="text-slate-500 leading-normal">{img.description}</p>
                            <p className="text-red-600 font-bold">STATUS DE DIAGNÓSTICO: OBSERVADO</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO 9: REGISTRO DETALHADO DA INSPEÇÃO POR SISTEMA */}
              {printConfig.secao9 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 9: Registro Detalhado da Inspeção por Subsistema</h2>
                  <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed text-justify">
                    <p><strong>9.1 Estrutura da Lança / Pluma:</strong> {sistemasInspecao.lança_pluma}</p>
                    <p><strong>9.2 Sistema de Içamento:</strong> {sistemasInspecao.içamento}</p>
                    <p><strong>9.3 Sistema Hidráulico:</strong> {sistemasInspecao.hidraulico}</p>
                    <p><strong>9.4 Gancho e Moitão:</strong> {sistemasInspecao.gancho_moitao}</p>
                    <p><strong>9.5 Estabilizadores / Extensores:</strong> {sistemasInspecao.estabilizadores}</p>
                    <p><strong>9.6 Sistema de Rotação / Coroa:</strong> {sistemasInspecao.rotacao}</p>
                    <p><strong>9.7 Cabine e Comandos do Operador:</strong> {sistemasInspecao.cabine_comandos}</p>
                    <p><strong>9.8 Sistema Elétrico e Alarmes:</strong> {sistemasInspecao.eletrico}</p>
                    <p><strong>9.9 Chassi Veicular / Longarinas:</strong> {sistemasInspecao.chassi_veicular}</p>
                    <p><strong>9.10 Dispositivos de Segurança:</strong> {sistemasInspecao.dispositivos_seguranca}</p>
                    <p><strong>9.11 Acessórios de Içamento:</strong> {sistemasInspecao.acessorios}</p>
                    <p><strong>9.12 Sinalização e Estado Geral:</strong> {sistemasInspecao.sinalizacao}</p>
                  </div>
                </div>
              )}

              {/* SEÇÃO 10: TABELA DE CAPACIDADE DE CARGA */}
              {printConfig.secao10 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 10: Tabela de Capacidade de Carga (CNC/CNA) por Raio</h2>
                  {laudoParams.loadChartImage ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 font-sans italic text-center">
                        Foto da tabela original de capacidade nominal de carga (CNC) anexada do próprio equipamento:
                      </p>
                      <div className="max-w-xl mx-auto border rounded-xl overflow-hidden shadow-sm bg-white p-2">
                        <img
                          src={laudoParams.loadChartImage}
                          className="w-full max-h-[400px] object-contain mx-auto rounded-lg"
                          alt="Tabela de Capacidade de Carga do Equipamento"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-slate-700">
                      <table className="w-full text-xs text-left border rounded-xl overflow-hidden border-collapse font-mono">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900 text-slate-800">
                            <th className="p-3">Raio de Operação (m)</th>
                            <th className="p-3">Ângulo da Lança (°)</th>
                            <th className="p-3">Capacidade Nominal de Carga (CNC)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {capacityTable.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold">{row.raio}</td>
                              <td className="p-3">{row.angulo}</td>
                              <td className="p-3 font-bold text-red-600">{row.cnc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO 11: CHECKLIST DE INSPEÇÃO */}
              {printConfig.secao11 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 11: Checklist de Conformidade da NR-11 / ABNT NBR 11139</h2>
                  <div className="overflow-hidden text-slate-700">
                    <table className="w-full text-xs text-left border border-collapse" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b text-[10px] uppercase font-mono">
                          <th className="p-3 w-[12%]">Ref</th>
                          <th className="p-3 w-[38%]">Item Inspecionado</th>
                          <th className="p-3 text-center w-[15%]">Conformidade</th>
                          <th className="p-3 w-[23%]">Observação / Nota Técnica</th>
                          <th className="p-3 text-center w-[12%]">Foto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 leading-relaxed text-[11px]">
                        {checklist.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-mono font-bold text-[#134074] break-all">{item.id.replace("chk_", "Nº ")}</td>
                            <td className="p-3 font-semibold text-slate-800 break-words">{item.text}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                                item.resposta === "SIM"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.resposta === "NÃO"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}>
                                {item.resposta}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-sans break-words">{item.nota}</td>
                            <td className="p-3 text-center">
                              {item.image ? (
                                <img src={item.image} className="w-20 h-20 object-cover rounded-xl border shadow-sm mx-auto" />
                              ) : (
                                <span className="text-[9px] font-mono text-slate-300 block whitespace-nowrap">Sem foto</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SEÇÃO 12: APRECIAÇÃO DE RISCO HRN BEFORE/AFTER */}
              {printConfig.secao12 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 12: Identificação dos Perigos e Apreciação de Risco (HRN)</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono text-slate-700">
                    <div className="border rounded-2xl p-4 bg-red-50/50 space-y-3">
                      <p className="font-bold text-red-600 uppercase border-b pb-1">APRECIAÇÃO INICIAL (ANTES)</p>
                      <p><strong>LO (Probabilidade):</strong> {hrnBefore.lo}</p>
                      <p><strong>FE (Exposição):</strong> {hrnBefore.fe}</p>
                      <p><strong>DPH (Gravidade):</strong> {hrnBefore.dph}</p>
                      <p><strong>NP (Pessoas):</strong> {hrnBefore.np}</p>
                      <p className="text-sm"><strong>SCORE HRN:</strong> <span className="font-bold text-red-600 text-base">{hrnBefore.score}</span></p>
                      <p><strong>GRAU DE RISCO:</strong> <span className="font-bold uppercase text-red-600 bg-red-100 px-2.5 py-0.5 rounded text-[10px]">{hrnBefore.classification}</span></p>
                      <p className="text-slate-600 font-sans text-justify pt-2 border-t">{hrnBefore.explicacao}</p>
                    </div>

                    <div className="border rounded-2xl p-4 bg-emerald-50/50 space-y-3">
                      <p className="font-bold text-emerald-600 uppercase border-b pb-1">APRECIAÇÃO FINAL (DEPOIS)</p>
                      <p><strong>LO (Probabilidade):</strong> {hrnAfter.lo}</p>
                      <p><strong>FE (Exposição):</strong> {hrnAfter.fe}</p>
                      <p><strong>DPH (Gravidade):</strong> {hrnAfter.dph}</p>
                      <p><strong>NP (Pessoas):</strong> {hrnAfter.np}</p>
                      <p className="text-sm"><strong>SCORE HRN:</strong> <span className="font-bold text-emerald-600 text-base">{hrnAfter.score}</span></p>
                      <p><strong>GRAU DE RISCO:</strong> <span className="font-bold uppercase text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded text-[10px]">{hrnAfter.classification}</span></p>
                      <p className="text-slate-600 font-sans text-justify pt-2 border-t">{hrnAfter.explicacao}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 13: NÃO CONFORMIDADES */}
              {printConfig.secao13 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 13: Diagnóstico de Não Conformidades Regulamentares</h2>
                  <div className="space-y-4">
                    {naoConformidades.map((nc) => (
                      <div key={nc.id} className="border rounded-xl p-4 bg-slate-50 text-xs font-mono text-slate-700 leading-relaxed">
                        <div className="flex justify-between items-center border-b pb-1.5 mb-2">
                          <span className="font-bold text-[#134074] text-sm">{nc.id}: {nc.norma}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            nc.criticidade === "CRÍTICA" ? "bg-red-600 text-white animate-pulse" : "bg-amber-500 text-white"
                          }`}>{nc.criticidade}</span>
                        </div>
                        <p className="font-sans text-slate-800 pb-1 text-justify"><strong>Descrição:</strong> {nc.descricao}</p>
                        <p className="text-red-600 font-bold"><strong>Risco Associado:</strong> {nc.risco}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEÇÃO 14: PLANO DE AÇÃO */}
              {printConfig.secao14 && (
                <div className="py-12 border-b space-y-6">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 14: Plano de Ação e Cronograma de Adequação</h2>
                  <div className="overflow-hidden text-slate-700">
                    <table className="w-full text-xs text-left border rounded-xl border-collapse font-mono" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr className="bg-slate-200 text-slate-800">
                          <th className="p-3 w-[8%] text-center">Ref</th>
                          <th className="p-3 w-[52%]">Não Conformidade / Medida Corretiva de Engenharia</th>
                          <th className="p-3 text-center w-[15%]">Prioridade</th>
                          <th className="p-3 w-[15%]">Responsável</th>
                          <th className="p-3 w-[10%]">Prazo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-[11px] leading-relaxed">
                        {planoAcao.map((ap) => (
                          <tr key={ap.id}>
                            <td className="p-3 text-center font-bold text-[#134074] break-all">{ap.id}</td>
                            <td className="p-3 space-y-1">
                              <p className="font-bold text-slate-900 break-words">{ap.problema}</p>
                              <p className="text-slate-500 font-sans text-justify break-words">{ap.recomendacao}</p>
                              <p className="text-[#134074] text-[9px] break-words">Fundamentação: {ap.norma}</p>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                ap.prioridade === "IMEDIATO" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                              }`}>{ap.prioridade}</span>
                            </td>
                            <td className="p-3 font-semibold text-slate-600 break-words">{ap.responsavel}</td>
                            <td className="p-3 font-bold text-slate-800 break-all">{ap.prazo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SEÇÃO 15: CONCLUSÃO TÉCNICA E PARECER PERICIAL */}
              {printConfig.secao15 && (
                <div className="py-12 border-b space-y-6" style={{ pageBreakBefore: "always", pageBreakAfter: "always" }}>
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 15: Conclusão Técnica e Parecer Pericial Final</h2>
                  <div className="p-6 border-2 border-[#134074]/30 rounded-2xl bg-[#134074]/5 text-center space-y-4">
                    <span className={`inline-block px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase ${
                      conclusao.status === "APTO PARA OPERAÇÃO"
                        ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
                        : conclusao.status === "NÃO APTO"
                        ? "bg-red-100 border border-red-300 text-red-800 animate-pulse"
                        : "bg-amber-100 border border-amber-300 text-amber-800"
                    }`}>
                      PARECER FINAL: {conclusao.status}
                    </span>
                    <p className="text-xs text-slate-800 font-sans text-justify leading-relaxed">{conclusao.parecer}</p>
                  </div>
                </div>
              )}

              {/* SEÇÃO 16: LIMITAÇÕES DA AVALIAÇÃO */}
              {printConfig.secao16 && (
                <div className="py-12 border-b space-y-6 print-avoid-break">
                  <h2 className="text-lg font-bold font-mono uppercase text-[#134074] border-b pb-1.5">SEÇÃO 16: Limitações e Observações Técnicas Finais</h2>
                  <p className="text-xs text-slate-700 text-justify leading-relaxed font-sans whitespace-pre-wrap">{secoesLaudo.secao_18}</p>
                </div>
              )}

              {/* CENTERED SIGNATURE BLOCK AS SPECIFIED */}
              <div className="py-12 text-center space-y-6 print-avoid-break border-t border-slate-200 mt-8">
                <div className="pt-4 space-y-1">
                  <p className="text-base font-black text-slate-950">Vitor Leonardo Cordeiro Linhares</p>
                  <p className="text-xs text-slate-700 font-medium">Eng. Mecânico | Esp. Projetos Mecânicos | Esp. Engenharia da Manutenção</p>
                  <p className="text-xs text-slate-700 font-medium">Esp.Adequações  de  máquinas e equipamentos.</p>
                  <p className="text-xs text-slate-600 font-bold font-mono uppercase">CREA PE</p>
                  <p className="text-xs text-slate-900 font-extrabold uppercase tracking-wider">VL Engenharia</p>
                </div>
              </div>

              {/* ANEXOS SECTION (PÁGINA FINAL DO PDF) */}
              <div className="page-break-before py-12 space-y-8 min-h-[85vh] flex flex-col justify-between border-t border-slate-200 print-avoid-break">
                <div className="space-y-6 text-left">
                  <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-3">
                    <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">ANEXOS</h2>
                  </div>
                  <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50 text-center space-y-4 py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Anexo I: Anotação de Responsabilidade Técnica (ART)</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Espaço reservado para inserção e anexação do PDF da **ART (Anotação de Responsabilidade Técnica)** devidamente emitida e quitada junto ao CREA, vinculada a esta inspeção técnica pericial.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      [O PDF da ART assinado e quitado deve ser inserido nesta página]
                    </div>
                  </div>
                </div>
                <div className="text-center font-mono text-[9px] text-slate-400">
                  <p>Laudo Técnico de Inspeção • VL Engenharia • Página de Anexos</p>
                </div>
              </div>

            </div>
          </div>
        )}

        </div>

        {/* RIGHT SIDEBAR CONTROL PANEL */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* ASSISTENTE INTELIGENTE GEMINI */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0B2545] text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-20 h-20 text-yellow-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-mono tracking-widest uppercase font-black">
                <Sparkles className="w-3 h-3 animate-spin text-yellow-500" />
                <span>Auditor Autónomo Munck</span>
              </div>
              <h3 className="text-xl font-bold font-sans tracking-tight">Perito de Içamento IA</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Forneça informações operacionais do caminhão Munck ou faça upload de fotografias estruturais (cabo, gancho, patola) e deixe a IA da VL Engenharia redigir as não conformidades regulamentadoras do MTE de forma totalmente autónoma.
              </p>
            </div>

            {/* IMAGES UPLOAD ACCORDION */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Fotos do Equipamento em Campo</label>
              
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative aspect-square border border-slate-700 bg-slate-950 rounded-xl overflow-hidden group">
                    <img src={img.data} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGeneralImage(i)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[8px] font-mono truncate text-slate-300 text-center">
                      Foto {i+1}
                    </div>
                  </div>
                ))}

                {uploadedImages.length < 3 && (
                  <label className="aspect-square border border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-900 rounded-xl flex flex-col items-center justify-center cursor-pointer text-slate-400 font-mono text-[9px] uppercase font-bold transition-all">
                    <Upload className="w-4 h-4 mb-1 text-slate-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGeneralImageUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Max 3 imagens (cabo, moitão, patola ou placa).</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={callGeminiAuditor}
                disabled={loadingAI}
                className="w-full py-3 bg-[#4895EF] hover:bg-[#3f85d9] disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-slate-950 flex items-center justify-center gap-2"
              >
                {loadingAI ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redigindo Laudo...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span>Gerar Diagnóstico IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* HRN PARAMETERS INFOGRAPHICS */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center gap-1.5 border-b pb-2">
              <Calculator className="w-4 h-4 text-[#134074] dark:text-[#4895EF]" />
              Matriz Paramétrica HRN
            </h4>
            <div className="space-y-3 font-mono text-[10px] text-slate-500 leading-relaxed">
              <p><strong>HRN = LO × FE × DPH × NP</strong></p>
              <p className="text-slate-400">Classificação final do grau de periculosidade técnica:</p>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between p-1 rounded bg-emerald-500/10 text-emerald-600"><span>0 a 1 — Desprezível</span><span>Aceitável</span></div>
                <div className="flex justify-between p-1 rounded bg-teal-500/10 text-teal-600"><span>2 a 5 — Muito Baixo</span><span>Melhorar</span></div>
                <div className="flex justify-between p-1 rounded bg-amber-500/10 text-amber-600"><span>6 a 10 — Baixo</span><span>Médio prazo</span></div>
                <div className="flex justify-between p-1 rounded bg-orange-500/10 text-orange-600"><span>11 a 50 — Significante</span><span>Curto prazo</span></div>
                <div className="flex justify-between p-1 rounded bg-red-500/10 text-red-600"><span>51 a 100 — Alto</span><span>Urgência</span></div>
                <div className="flex justify-between p-1 rounded bg-rose-600/10 text-rose-600"><span>101 a 500 — Muito Alto</span><span>Parar</span></div>
                <div className="flex justify-between p-1 rounded bg-purple-600/10 text-purple-600"><span>501 a 1000 — Extremo</span><span>Interditar</span></div>
                <div className="flex justify-between p-1 rounded bg-red-700/10 text-red-700"><span>&gt;1000 — Inaceitável</span><span>Parada Imediata</span></div>
              </div>
            </div>
          </div>

          {/* INTEGRIDADE DE ACESSÓRIOS E COMPONENTES CRÍTICOS */}
          <div className="bg-[#134074]/5 dark:bg-[#4895EF]/5 p-6 rounded-3xl border border-[#134074]/10 dark:border-[#4895EF]/10 space-y-3 text-xs leading-relaxed text-justify text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-[#134074] dark:text-[#4895EF]" />
              Fatores de Queda Crítica
            </h4>
            <p>
              Equipamentos de içamento possuem potencial de acidentes severos ou catastróficos imediatos. Diante de qualquer desgaste visível superior a 10% de espessura original ou arames rompidos acumulados, determine a parada imediata e recomende a substituição de materiais.
            </p>
          </div>

        </div>

      </div>
      )}

    </div>
  );
}
