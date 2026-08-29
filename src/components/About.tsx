/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ScrollReveal from './ScrollReveal';

export default function About() {
  return (
    <section id="sobre" className="py-20 md:py-24 bg-white dark:bg-[#061426] transition-colors duration-300 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <ScrollReveal delay={0.1}>
          <span className="text-xs md:text-sm font-bold tracking-widest text-[#134074] dark:text-[#4895EF] uppercase block font-mono mb-3">
            Quem Somos
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h2 className="text-3xl md:text-5xl font-sans font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-8">
            Confiabilidade Humana, Rigor Tecnológico e Respaldo Legal
          </h2>
        </ScrollReveal>

        <div className="space-y-6 text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed text-justify md:text-center max-w-3xl mx-auto font-normal">
          <ScrollReveal delay={0.3}>
            <p>
              Oferecemos consultoria técnica especializada em Pernambuco para atender à demanda por laudos de conformidade, Plano de Manutenção, Operação e Controle (PMOC) e segurança operacional de ativos mecânicos e térmicos.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <p>
              Trabalhamos em estreita parceria com locadoras de equipamentos, indústrias, condomínios e administradoras comerciais, oferecendo soluções que neutralizam riscos trabalhistas (NR-12, NR-11), asseguram responsabilidade técnica em frotas e ar-condicionado de forma ágil e descomplicada.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 text-left max-w-3xl mx-auto border-t border-slate-200 dark:border-slate-800/80 mt-10">
          <ScrollReveal delay={0.5} direction="left">
            <div className="space-y-3 bg-slate-50 dark:bg-[#0A1E38] p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 h-full shadow-sm hover:shadow-lg hover:border-[#4895EF]/40 transition-all duration-300 hover:-translate-y-1">
              <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2.5 text-lg">
                <span className="w-1.5 h-6 bg-[#134074] dark:bg-[#4895EF] rounded-full inline-block" />
                Experiência Ampla em PCM
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Experiência profunda em Planejamento e Controle de Manutenção (PCM), gestão ágil de paradas planejadas industriais e modelagem de confiabilidade mecânica.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.6} direction="right">
            <div className="space-y-3 bg-slate-50 dark:bg-[#0A1E38] p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 h-full shadow-sm hover:shadow-lg hover:border-[#4895EF]/40 transition-all duration-300 hover:-translate-y-1">
              <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2.5 text-lg">
                <span className="w-1.5 h-6 bg-[#134074] dark:bg-[#4895EF] rounded-full inline-block" />
                Emissão Ágil de ART no CREA-PE
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Sem burocracia. Nossos processos digitais otimizados permitem a emissão imediata da correspondente ART profissional junto ao CREA-PE após vistoria conclusiva.
              </p>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
