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
    title: 'Adequação à NR-12 Torno Universal',
    subtitle: 'Indústrias, Oficinas, Serviços em Geral',
    image: nr12Img,
    description: 'Apreciação de riscos de prensas, blindagem metálica contra acesso a partes móveis, chaves de intertravamento RFID categoria 4 e certificação legal com emissão de ART via CREA-PE.',
    highlights: ['Enquadramento completo na NR-12', 'Dispositivos de segurança à prova de falhas', 'Retorno operacional legalizado imediato'],
    category: 'Segurança NR-12'
  },
  {
    title: 'Laudo de Não-Cormidade Retroescavadeira',
    subtitle: 'Locadoras, Mineradoras, Construtoras em Geral',
    image: hidraulicoImg,
    description: 'Identificação de vazamentos hidráulicos, que comprometem o funcionamento e atestado operacional de máquinas pesadas.',
    highlights: ['Fadiga mecânica monitorada', 'Análise de integridade de chassi (ROPS)', 'Inspeção rápida em pátio operacional'],
    category: 'Máquinas Pesadas'
  },
  {
    title: 'Identificação de Não-Conformidades: Caminhão Munck',
    subtitle: 'Locadoras, Construtoras',
    image: munckImg,
    description: 'Adequação dos adesivos de sinalização e operação, que a sua falta põem em risco a vida do operador e de terceiros, conforme NR-11 e NR-12.',
    highlights: [
      'Laudos e adequações necessárias para uso',
      'Equipamento vistoriado periodicamente',
      'Orientações para uso'
    ],
    category: 'Içamento / Munck'
  },
  {
    title: 'Vistoria e Regularização de Playground de Madeira',
    subtitle: 'Condomínios, Restaurantes, Parques de Diversões',
    image: playgroundImg,
    description: 'Mapeamento dimensional preventivo em brinquedos infantis sob a norma ABNT NBR 16071. Detecção de cantos vivos, risco de aprisionamento e integridade de cabos/fixação.',
    highlights: ['Conformidade total ABNT NBR 16071', 'Ambiente infantil 100% livre de acidentes', 'Relatório gráfico ilustrado enviado ao síndico'],
    category: 'Playgrounds'
  },
  {
    title: 'Gerenciamento do PMOC e Qualidade de Ar Semestral',
    subtitle: 'Restauranes, Hospitais, Sistemas HVAC e Residenciais',
    image: pmocImg,
    description: 'Realização de inspeções, manutenções preventivas e corretivas, limpeza, monitoramento e emissão de relatórios técnicos para garantir a qualidade do ar interior, a eficiência dos sistemas de climatização e a conformidade com a legislação vigente.',
    highlights: ['Emissão integral Lei Federal 13.589/2018', 'Prevenção de riscos respiratórios (ANVISA)', 'Ficha cadastral de climatizadores atualizada'],
    category: 'PMOC Climatização'
  },
  {
    title: 'Laudo de Reclassificação para Média/Baixa Monta',
    subtitle: 'Locadoras, Seguradoras, Frotas de Empresas em Geral',
    image: montaImg,
    description: 'Dossiê veicular analítico de conformidade mecânica de longarinas pós-colisão, aferição eletrônica de suspensão ativa, laudo estrutural aceito formalmente pelo DETRAN.',
    highlights: ['Redução drástica em custos de sinistros', 'Dossiê dimensional chancelado por ART', 'Desimpedimento rápido de restrições de trânsito'],
    category: 'Regularização Veicular'
  }
];

export default function ExecutedServicesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
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
    <section id="servicos-executados" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 scroll-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold tracking-widest text-[#0B2545] dark:text-[#134074] uppercase block mb-3 font-mono">
              Evidências Técnicas
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-950 dark:text-white tracking-tight leading-none mb-6">
              Detalhamento de Serviços
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Detalhamento das ativididades realizadas em conformidade com as leias e normas regulamentadoras.
            </p>
          </div>
        </ScrollReveal>

        {/* Carousel Master Frame */}
        <ScrollReveal delay={0.2} direction="up">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 md:p-10 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visual Screen Carousel Column */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-950 shadow-inner group">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />
              
              {/* Category tags over image */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B2545] text-white rounded-full text-xs font-mono font-bold uppercase shadow-lg">
                <Flame className="w-3.5 h-3.5 text-[#4895EF] animate-pulse" />
                <span>{activeItem.category}</span>
              </div>

              {/* Detail action trigger inside photo */}
              <div className="absolute bottom-4 left-4 right-4 text-white p-2">
                <span className="text-[10px] font-mono tracking-widest text-[#4895EF] uppercase block font-semibold">Nossos Clientes</span>
                <p className="text-sm font-semibold truncate text-white/95">{activeItem.subtitle}</p>
              </div>
            </div>

            {/* Description Details Column */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between h-full py-2">
              
              <div className="space-y-4">
                <div className="flex gap-2.5 items-center text-xs font-mono font-bold text-[#134074] dark:text-[#4895EF] uppercase">
                  <span className="px-2.5 py-1 bg-slate-200/50 dark:bg-slate-800 rounded">EVIDÊNCIA 0{activeIndex + 1}</span>
                  <span>•</span>
                  <span>PE / Pernambuco</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-slate-950 dark:text-white leading-tight">
                  {activeItem.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {activeItem.description}
                </p>

                {/* Bullets points of executed service benefits */}
                <div className="space-y-2.5 pt-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Ganhos & Resultados Alcançados:</span>
                  {activeItem.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-300 leading-normal">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom controls panel */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                
                {/* Dots indicators */}
                <div className="flex items-center gap-2">
                  {carouselItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeIndex === idx 
                          ? 'w-6 bg-[#0B2545] dark:bg-[#4895EF]' 
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-450'
                      }`}
                      title={`Ver slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Next/Prev buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer transition-colors active:scale-95"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer transition-colors active:scale-95"
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
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
