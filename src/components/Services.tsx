/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { 
  ShieldAlert, 
  Construction, 
  Truck, 
  Car, 
  Activity, 
  Wind, 
  FileText, 
  Settings, 
  CheckCircle, 
  X,
  FileBadge,
  ArrowRight
} from 'lucide-react';

interface ServiceItem {
  id: string;
  icon: any;
  title: string;
  shortDesc: string;
  images: string[];
  details: {
    overview: string;
    norms: string[];
    deliverables: string[];
    workflow: string[];
  };
}

export const servicesList: ServiceItem[] = [
  {
    id: 'nr12',
    icon: ShieldAlert,
    title: 'Adequação à NR-12',
    shortDesc: 'Análise de conformidade de máquinas e equipamentos, relatórios técnicos e plano completo de adequação.',
    images: [
      '/src/assets/images/adequacao_nr12_1780250819354.png',
      '/src/assets/images/maquinas_pesadas_1780250836786.png',
      '/src/assets/images/munck_guindaste_1780250856059.png'
    ],
    details: {
      overview: 'Garantimos a segurança física dos operadores por meio da adequação completa das máquinas e equipamentos industriais em conformidade absoluta com a Norma Regulamentadora Nº 12 (NR-12) do Ministério do Trabalho.',
      norms: ['PORTARIA MTE Nº 3.214/1978', 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos', 'ABNT NBR ISO 12100 - Apreciação de Riscos'],
      deliverables: ['Inventário de Máquinas', 'Análise de Riscos com cálculo de Categoria/PLr', 'Diagnóstico Técnico de Não-Conformidades', 'ART (Anotação de Responsabilidade Técnica) emitida via CREA-PE'],
      workflow: ['Visita técnica presencial para inspeção de sistemas mecânicos e elétricos', 'Cálculo de riscos reais utilizando metodologias como HRN ou SIL', 'Desenho técnico de barreiras físicas e grades optoeletrônicas', 'Emissão do laudo técnico certificado e acompanhamento de obra']
    }
  },
  {
    id: 'maquinas-pesadas',
    icon: Construction,
    title: 'Laudos para Máquinas Pesadas',
    shortDesc: 'Avaliação técnica qualificada, inspeção mecânica de frota e emissão de laudos de estabilidade com ART.',
    images: [
      '/src/assets/images/maquinas_pesadas_1780250836786.png',
      '/src/assets/images/munck_guindaste_1780250856059.png',
      '/src/assets/images/reclassificacao_monta_1780250911530.png'
    ],
    details: {
      overview: 'Inspeção mecânica detalhada, avaliação estrutural e emissão de laudos de estabilidade focado em retroescavadeiras, pás carregadeiras, escavadeiras hidráulicas e tratores de esteira.',
      norms: ['NR-11 - Transporte, Movimentação e Armazenamento', 'ABNT NBR NM ISO 3471 - Estruturas Protetoras contra Capotamento (ROPS)'],
      deliverables: ['Laudo Técnico de Estabilidade Estrutural', 'Checklist detalhado de 50 itens de segurança mecânica', 'Laudo Conclusivo de Status de Confiabilidade', 'Emissão da correspondente ART profissional'],
      workflow: ['Avaliação detalhada da integridade do chassi e pontos de solda críticas', 'Inspeção dos cilindros hidráulicos e linhas de pressão', 'Teste operacional prático de força e estanqueidade', 'Processamento fotográfico de anomalias e assinatura eletrônica']
    }
  },
  {
    id: 'munck-guindastes',
    icon: Truck,
    title: 'Inspeções em Caminhões Munck e Guindastes',
    shortDesc: 'Inspeções periódicas preventivas, avaliação estrutural, testes de carga hidráulicos e laudos de içamento.',
    images: [
      '/src/assets/images/munck_evidencia_1.png',
      '/src/assets/images/munck_evidencia_2.png',
      '/src/assets/images/munck_evidencia_3.png'
    ],
    details: {
      overview: 'Verificação periódica preventiva essencial de caminhões com braço hidráulico articulado (Munck) e guindastes telescópicos para assegurar içamentos seguros contra riscos de fadiga e tombamento.',
      norms: ['NR-11 - Movimentação de Cargas', 'ABNT NBR 14768 - Guindastes de Carga Articulados Hydraulicos', 'ANNT NBR ISO 4301 - Equipamentos de Elevação'],
      deliverables: ['Laudo de Estanqueidade e Verificação Estrutural', 'Tabela de Carga Operacional validada', 'Ensaio fotográfico detalhado das mangueiras e conexões', 'ART do Engenheiro Mecânico credenciado'],
      workflow: ['Inspeção visual em busca de trincas, soldas danificadas e empenamentos no braço telescópico', 'Medição de folga nas sapatas estabilizadoras e torque do rolamento de giro', 'Teste prático de estanqueidade das válvulas de segurança sob pressão nominal', 'Upload instantâneo das fotos cadastrais e confecção final do laudo no sistema']
    }
  },
  {
    id: 'inspecao-veicular',
    icon: Car,
    title: 'Inspeção Veicular e Reclassificação de Monta',
    shortDesc: 'Avaliação técnica profunda para regularização estrutural, reclassificação de sinistros no DETRAN.',
    images: [
      '/src/assets/images/reclassificacao_monta_1780250911530.png',
      '/src/assets/images/adequacao_nr12_1780250819354.png',
      '/src/assets/images/maquinas_pesadas_1780250836786.png'
    ],
    details: {
      overview: 'Consultoria e homologação jurídica para reverter a classificação de danos (Média ou Grande Monta) atribuída por agentes públicos de trânsito em boletins de acidente, desimpedindo o documento do veículo.',
      norms: ['Resolução CONTRAN Nº 810/2020 (Crucial para reclassificação)', 'Manual de Inspeção DETRAN-PE'],
      deliverables: ['Laudo Técnico de Recuperabilidade Veicular', 'Análise dimensional fotográfica estrutural das longarinas', 'Atestado de conformidade de suspensão, freios e pneus', 'ART para regularização imediata no DETRAN'],
      workflow: ['Análise documental do Boletim de Acidente e Relatório de Avarias', 'Medição mecânica da estrutura central e alinhamento do monobloco', 'Ensaios práticos em sistemas de direção e segurança passiva', 'Criação do dossiê fotográfico formal contendo todos os reparos realizados']
    }
  },
  {
    id: 'playgrounds',
    icon: Activity,
    title: 'Laudos para Playgrounds',
    shortDesc: 'Avaliação detalhada de segurança infantil, conformidade com a ABNT NBR 16071 e recomendações práticas.',
    images: [
      '/src/assets/images/playground_vistoria_1780250875380.png',
      '/src/assets/images/pmoc_climatizacao_1780250892380.png',
      '/src/assets/images/maquinas_pesadas_1780250836786.png'
    ],
    details: {
      overview: 'Vistoriamos exaustivamente parques infantis públicos e privados em condomínios, escolas e praças, garantindo ambientes de lazer protegidos e seguros contra quedas, aprisionamento de dedos e cantos vivos.',
      norms: ['ABNT NBR 16071 - Playgrounds (Partes 1 a 7)', 'Lei Municipal da Jaqueira/Pernambuco para brinquedos de praça'],
      deliverables: ['Certidão de Conformidade de Instalação e Conservação', 'Relatório detalhado sobre o piso de absorção de impacto', 'Plano de ações corretivas prioritárias com desenhos explicativos', 'ART de Laudo de Playground'],
      workflow: ['Varredura geométrica com gabaritos de teste para aprisionamentos (cabeça, pescoço e dedos)', 'Medição da integridade estrutural das correntes, madeiras, plásticos e corrimãos', 'Avaliação da profundidade ideal da areia ou espessura do piso emborrachado', 'Assinatura digital e envio do laudo para registro condominial']
    }
  },
  {
    id: 'pmoc',
    icon: Wind,
    title: 'Plano de Manutenção, Operação e Controle (PMOC)',
    shortDesc: 'Elaboração e acompanhamento de PMOC para climatizadores industriais e corporativos sob as leis vigentes.',
    images: [
      '/src/assets/images/pmoc_climatizacao_1780250892380.png',
      '/src/assets/images/playground_vistoria_1780250875380.png',
      '/src/assets/images/adequacao_nr12_1780250819354.png'
    ],
    details: {
      overview: 'Implementação de processos operacionais completos, vistorias mensais e controle microbiológico de sistemas de ar condicionado centrais e splits, visando excelente qualidade do ar para prevenção de patologias respiratórias.',
      norms: ['Lei Federal nº 13.589/2018 (PMOC Obrigatório)', 'Portaria MS n.º 3.523/1998', 'Resolução RE nº 9 da ANVISA'],
      deliverables: ['Plano de Manutenção, Operação e Controle estruturado em planilha setorial', 'Laudo Técnico de Qualidade do Ar Semestral', 'Ficha Cadastral dos Climatizadores e Histórico de Intervenções', 'ART de Responsabilidade Técnica de Gestão PMOC'],
      workflow: ['Mapeamento total da carga térmica e inventário de todas as evaporadoras/condensadoras', 'Elaboração do plano de ação técnica mensal para higienização e trocas de filtros', 'Gestão integrada de alarmes de vencimento de limpezas no portal administrativo', 'Assinatura eletrônica e liberação automática de PDFs para fiscalizações da ANVISA']
    }
  },
  {
    id: 'art-manutencao',
    icon: FileText,
    title: 'ART para Serviços de Manutenção',
    shortDesc: 'Articulação de Anotação de Responsabilidade Técnica para manutenção predial, fabril e mecânica corporativa.',
    images: [
      '/src/assets/images/adequacao_nr12_1780250819354.png',
      '/src/assets/images/munck_guindaste_1780250856059.png',
      '/src/assets/images/pmoc_climatizacao_1780250892380.png'
    ],
    details: {
      overview: 'Emissão e chancela de responsabilidade técnica legal frente ao CREA-PE sobre cronogramas de reparos em pontes rolantes, caldeiras, vasos de pressão, elevadores de carga e sistemas automatizados corporativos.',
      norms: ['Lei Federal Nº 6.496/1977', 'Regulamento Nacional de Fiscalização do Sistema CONFEA/CREA'],
      deliverables: ['Emissão rápida da ART de Execução ou Prestação de Serviço', 'Laudo de validação periódica assinado eletronicamente', 'Prontuário de intervenções assinado pelo engenheiro mecânico', 'Certificado de conformidade legal de operação mecanizada'],
      workflow: ['Exame detalhado dos relatórios executivos das equipes de manutenção do cliente', 'Verificação presencial aleatória da qualidade dos reparos e aferições mecânicas', 'Identificação de perigos operacionais remanescentes pós-manutenção', 'Validação no CREA-PE e upload do espelho no portal do cliente para arquivamento legal']
    }
  },
  {
    id: 'consultoria-pcm',
    icon: Settings,
    title: 'Consultoria em Gestão da Manutenção (PCM)',
    shortDesc: 'Otimização com foco em PCM, KPIs (MTBF, MTTR), disponibilidade e alta confiabilidade de ativos corporativos.',
    images: [
      '/src/assets/images/reclassificacao_monta_1780250911530.png',
      '/src/assets/images/maquinas_pesadas_1780250836786.png',
      '/src/assets/images/pmoc_climatizacao_1780250892380.png'
    ],
    details: {
      overview: 'Modernizamos o setor de manutenção interna de indústrias e transportadoras, reestruturando o PCM (Planejamento e Controle da Manutenção) para reduzir drasticamente paradas inesperadas e gargalos produtivos.',
      norms: ['Métodos de Confiabilidade RCM (Reliability Centered Maintenance)', 'Indicadores de Manutenção NBR ISO 55000 - Gestão de Ativos'],
      deliverables: ['Diagnóstico Geral de Confiabilidade e Maturidade de Fábrica', 'Desenho de Árvores de Falhas e Análises FMEA de Ativos Críticos', 'Dashboard de KPIs integrado (MTBF, MTTR, Backlog)', 'Plano Preventivo Otimizado com redução de até 30% em custos reativos'],
      workflow: ['Entrevistas com a equipe técnica e análise crítica das Ordens de Serviço históricas', 'Classificação de ativos através da Matriz de Criticidade (ABC)', 'Cálculo de lacunas operacionais preventivas e mapeamento de rotinas operacionais', 'Treinamento presencial/remoto de PCM e acompanhamento semanal de indicadores chave']
    }
  }
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section id="servicos" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold tracking-widest text-[#0B2545] dark:text-[#134074] uppercase block mb-3 font-mono">
              Especialidades Técnicas
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-950 dark:text-white tracking-tight leading-none mb-6">
              Nossos Serviços de Engenharia
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Atuação técnica especializada orientada à segurança legal, aumento de disponibilidade, conformidade normativa e alta confiabilidade mecânica.
            </p>
          </div>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <ScrollReveal 
                key={service.id} 
                delay={(index % 4) * 0.1} 
                direction="up"
                className="h-full"
              >
                <div
                  id={`card-servico-${service.id}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.99] group cursor-pointer relative h-full"
                  onClick={() => setSelectedService(service)}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#134074]/10 text-[#134074] dark:bg-[#134074]/20 dark:text-[#8DA9C4] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3 tracking-tight group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {service.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#134074] dark:text-[#4895EF] group-hover:gap-3 transition-all">
                    <span>Saber mais</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Interactive Modal / Mini Page representation */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div 
              id="detalhe-servico-modal"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Box */}
              <div className="bg-[#0B2545] text-white p-8 relative">
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute right-6 top-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-2 rounded-full transition-all"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-3">
                  <span className="p-2 border border-white/20 bg-white/10 rounded-xl text-[#4895EF]">
                    <selectedService.icon className="w-6 h-6" />
                  </span>
                  <span className="text-xs tracking-widest font-mono uppercase text-[#4895EF]">Engenharia Mecânica</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-sans font-bold tracking-tight">
                  {selectedService.title}
                </h3>
              </div>

              {/* Body Content */}
              <div className="p-8 md:p-10 space-y-10">
                
                {/* Overview */}
                <div className="space-y-3">
                  <h4 className="text-sm tracking-wider uppercase font-mono text-[#134074] dark:text-[#4895EF] font-bold">
                    Visão Geral do Serviço
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base md:text-lg">
                    {selectedService.details.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {/* Regulatory Norms */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <FileBadge className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                      <h4 className="font-bold text-slate-900 dark:text-white font-sans text-base">
                        Normatização & Legislação Key
                      </h4>
                    </div>
                    <ul className="space-y-2.5">
                      {selectedService.details.norms.map((norm, idx) => (
                        <li key={idx} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-400 items-start">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{norm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operational Deliverables */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-[#134074] dark:text-[#4895EF]" />
                      <h4 className="font-bold text-slate-900 dark:text-white font-sans text-base">
                        Entregáveis do Projeto
                      </h4>
                    </div>
                    <ul className="space-y-2.5">
                      {selectedService.details.deliverables.map((del, idx) => (
                        <li key={idx} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-400 items-start">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Scope Workflow */}
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm tracking-wider uppercase font-mono text-[#134074] dark:text-[#4895EF] font-bold">
                    Etapas de Execução do Diagnóstico
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {selectedService.details.workflow.map((flow, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/40 relative">
                        <span className="absolute right-4 top-3 text-2xl font-black text-slate-200 dark:text-slate-700/60 font-mono">
                          0{idx + 1}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-sans pr-4 pt-2">
                          {flow}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-slate-500 text-xs dark:text-slate-400 font-mono text-center md:text-left">
                    Todos os trabalhos acompanham laudo e ART assinados por Vitor Leonardo Cordeiro Linhares (CREA-PE).
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium transition-colors"
                    >
                      Fechar
                    </button>
                    <a
                      href="#contato"
                      onClick={() => setSelectedService(null)}
                      className="px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-white text-sm font-medium transition-colors text-center"
                    >
                      Solicitar Orçamento
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
