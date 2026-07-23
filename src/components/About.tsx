/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ScrollReveal from './ScrollReveal';

export default function About() {
  return (
    <section id="sobre" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <ScrollReveal delay={0.1}>
          <span className="text-sm font-semibold tracking-widest text-[#0B2545] dark:text-[#4895EF] uppercase block font-mono mb-4">
            Quem Somos
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h2 className="text-3xl md:text-4xl font-sans font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-8">
            Confiabilidade Humana, Rigor Tecnológico e Respaldo Legal
          </h2>
        </ScrollReveal>

        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed text-justify md:text-center max-w-3xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 text-left max-w-3xl mx-auto border-t border-slate-100 dark:border-slate-900 mt-10">
          <ScrollReveal delay={0.5} direction="left">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 h-full">
              <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2 text-md">
                <span className="w-1.5 h-6 bg-[#134074] rounded-full inline-block" />
                Experiência Ampla
              </h4>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Experiência profunda em Planejamento e Controle de Manutenção (PCM), gestão ágil de paradas planejadas industriais e modelagem de confiabilidade mecânica.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.6} direction="right">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 h-full">
              <h4 className="font-bold text-slate-950 dark:text-white flex items-center gap-2 text-md">
                <span className="w-1.5 h-6 bg-[#134074] rounded-full inline-block" />
                Emissão Ágil de ART
              </h4>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Sem burocracia. Nossos processos digitais otimizados permitem a emissão imediata da correspondente ART profissional junto ao CREA-PE após vistoria conclusiva.
              </p>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
