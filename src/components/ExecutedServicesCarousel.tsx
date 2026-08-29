/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { ChevronLeft, ChevronRight, CheckCircle, Flame, Eye, ArrowRight } from 'lucide-react';

import nr12Img from '../assets/images/nr12.jpg';
import hidraulicoImg from '../assets/images/hidraulico.jpg';
import munckImg from '../assets/images/munck.png';
import playgroundImg from '../assets/images/playground.jpg';
import pmocImg from '../assets/images/pmoc.webp';
import montaImg from '../assets/images/monta.avif';

const carouselItems = [
  {
    title: 'Adequação à NR-12: Torno Universal & Maquinário Industrial',
    subtitle: 'Indústrias Metalmecânicas, Oficinas & Fábricas',
    image: nr12Img,
    fallback: '/nr12.jpg',
    description: 'Apreciação de riscos em máquinas operatrizes e prensas, instalação de proteções físicas e enclausuramento, chaves de intertravamento de segurança Categoria 4 e certificação legal com emissão de ART via CREA-PE.',
    highlights: ['Enquadramento integral na NR-12 e normas ABNT', 'Dispositivos de segurança à prova de falhas', 'Liberação operacional imediata com respaldo legal'],
    category: 'Segurança NR-12'
  },
  {
    title: 'Diagnóstico Hidráulico & Integridade: Retroescavadeira',
    subtitle: 'Locadoras, Construtoras & Mineradoras',
    image: hidraulicoImg,
    fallback: '/hidraulico.jpg',
    description: 'Identificação de não-conformidades críticas em circuitos hidráulicos, fadiga estrutural de lanças e atestado operacional de segurança para máquinas pesadas em canteiros de obras.',
    highlights: ['Fadiga mecânica e estanqueidade monitoradas', 'Análise de integridade de chassi e cabine ROPS/FOPS', 'Inspeção ágil em pátio com laudo conclusivo'],
    category: 'Máquinas Pesadas'
  },
  {
    title: 'Inspeção e Conformidade Técnica: Caminhão Munck',
    subtitle: 'Locadoras de Guindautos & Içamento',
    image: munckImg,
    fallback: '/munck.png',
    description: 'Inspeção de estabilizadores, patolas, gráfico de carga, cabos e adequação dos adesivos de sinalização e operação conforme exigido pelas normas NR-11 e NR-12.',
    highlights: [
      'Laudo com memorial de cálculo e tabela de carga',
      'Verificação completa de válvulas e travas de segurança',
      'ART emitida para liberação em contratos e obras'
    ],
    category: 'Içamento / Munck'
  },
  {
    title: 'Vistoria e Regularização de Playgrounds Infantis',
    subtitle: 'Condomínios, Escolas, Restaurantes & Parques',
    image: playgroundImg,
    fallback: '/playground.jpg',
    description: 'Mapeamento dimensional e estrutural preventivo em brinquedos infantis sob a norma ABNT NBR 16071. Detecção de cantos vivos, risco de aprisionamento, estado da madeira e fixações.',
    highlights: ['Conformidade total com a ABNT NBR 16071', 'Ambiente infantil seguro e livre de riscos', 'Relatório fotográfico detalhado e ART no CREA-PE'],
    category: 'Playgrounds'
  },
  {
    title: 'Gerenciamento do PMOC & Qualidade do Ar Climatizado',
    subtitle: 'Restaurantes, Hospitais, Clínicas, Shoppings & Edifícios',
    image: pmocImg,
    fallback: '/pmoc.webp',
    description: 'Elaboração e execução do Plano de Manutenção, Operação e Controle (PMOC), vistorias periódicas, controle higiênico dos dutos e climatizadores, assegurando conformidade com a Lei Federal 13.589/2018 e ANVISA.',
    highlights: ['Emissão integral conforme Lei Federal 13.589/2018', 'Prevenção de riscos respiratórios e normas ANVISA', 'Livro de registro e cronograma de manutenção'],
    category: 'PMOC Climatização'
  },
  {
    title: 'Laudo de Reclassificação de Dano Veicular (Média Monta)',
    subtitle: 'Locadoras, Seguradoras & Gestores de Frotas',
    image: montaImg,
    fallback: '/monta.avif',
    description: 'Dossiê técnico pericial e dimensional de longarinas, chassi e sistemas mecânicos pós-sinistro, viabilizando o desbloqueio rápido e regularização documental do veículo junto ao DETRAN-PE.',
    highlights: ['Redução significativa de prejuízos em sinistros', 'Dossiê estrutural com ensaios e chancelado por ART', 'Desimpedimento ágil de restrições administrativas'],
    category: 'Regularização Veicular'
  }
];

export default function ExecutedServicesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const activeItem = carouselItems[activeIndex];

  return (
    <section id="servicos-executados" className="py-20 md:py-24 bg-white dark:bg-[#07172E] border-t border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 scroll-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs md:text-sm font-bold tracking-widest text-[#134074] dark:text-[#4895EF] uppercase block mb-3 font-mono">
              Evidências Técnicas em Campo
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-5">
              Detalhamento de Serviços
            </h2>
            <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed font-normal">
              Detalhamento das atividades técnicas realizadas em conformidade com as leis e normas regulamentadoras vigentes.
            </p>
          </div>
        </ScrollReveal>

        {/* Carousel Master Frame */}
        <ScrollReveal delay={0.2} direction="up">
          <div className="bg-slate-50 dark:bg-[#0A1E38] rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl p-6 md:p-8 lg:p-10 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
              {/* Visual Screen Carousel Column */}
              <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[360px] md:min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-950 shadow-inner group flex flex-col justify-between">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== activeItem.fallback && !target.src.endsWith(activeItem.fallback)) {
                      target.src = activeItem.fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />
                
                {/* Category tags over image */}
                <div className="relative z-10 p-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0B2545]/95 backdrop-blur-md text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-lg border border-white/10">
                    <Flame className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>{activeItem.category}</span>
                  </div>
                </div>

                {/* Detail action trigger inside photo */}
                <div className="relative z-10 p-5 pt-12 text-white">
                  <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase block font-bold mb-1">Segmentos Atendidos</span>
                  <p className="text-sm md:text-base font-semibold text-white/95">{activeItem.subtitle}</p>
                </div>
              </div>

              {/* Description Details Column */}
              <div className="lg:col-span-6 flex flex-col justify-between py-1 space-y-6">
                
                <div className="space-y-5">
                  <div className="flex gap-2.5 items-center text-xs font-mono font-bold text-[#134074] dark:text-[#4895EF] uppercase">
                    <span className="px-3 py-1 bg-slate-200/70 dark:bg-[#134074]/40 rounded-lg border border-slate-300/60 dark:border-slate-700">
                      EVIDÊNCIA 0{activeIndex + 1} DE 0{carouselItems.length}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-300">Pernambuco</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight text-slate-950 dark:text-white leading-tight">
                    {activeItem.title}
                  </h3>

                  <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed font-normal">
                    {activeItem.description}
                  </p>

                  {/* Bullets points of executed service benefits */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                      Ganhos & Resultados Alcançados:
                    </span>
                    {activeItem.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom controls panel */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  
                  {/* Dots indicators */}
                  <div className="flex items-center gap-2">
                    {carouselItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                          activeIndex === idx 
                            ? 'w-8 bg-[#0B2545] dark:bg-[#4895EF]' 
                            : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                        }`}
                        title={`Ver evidência ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Next/Prev buttons with smooth hover feedback */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrev}
                      className="p-3 bg-white dark:bg-[#0D2647] text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#134074] shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                      aria-label="Slide anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-3 bg-white dark:bg-[#0D2647] text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#134074] shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                      aria-label="Próximo slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
