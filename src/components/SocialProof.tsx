/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ScrollReveal from './ScrollReveal';
import { 
  Building2, 
  Truck, 
  Factory, 
  Hospital, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  FileCheck2,
  Clock3,
  Award
} from 'lucide-react';

const clientSegments = [
  {
    icon: Truck,
    name: 'Locadoras & Içamento',
    desc: 'Laudos de Munck, guindastes e testes de carga com ART imediata.',
    tag: 'Frotas & Carga'
  },
  {
    icon: Factory,
    name: 'Indústrias & Metalmecânica',
    desc: 'Adequações completas à NR-12 e apreciação de riscos técnicos.',
    tag: 'Segurança NR-12'
  },
  {
    icon: Building2,
    name: 'Condomínios & Shopping Centers',
    desc: 'Planos PMOC e laudos de segurança infantil para playgrounds.',
    tag: 'PMOC & Lazer'
  },
  {
    icon: Hospital,
    name: 'Hospitais & Clínicas',
    desc: 'Monitoramento da qualidade do ar e conformidade com a ANVISA.',
    tag: 'Qualidade do Ar'
  }
];

const testimonials = [
  {
    author: 'Carlos Eduardo Santos',
    role: 'Gerente de Manutenção e Frotas',
    company: 'Locadora de Equipamentos Pesados (RMR)',
    content: 'O atendimento do Eng. Vitor foi decisivo para a liberação dos nossos caminhões Munck em obra pública. Laudos de estanqueidade e integridade estrutural emitidos com rigor e ART no CREA-PE em tempo recorde.',
    highlight: 'Inspeção de Munck & ART Imediata',
    rating: 5
  },
  {
    author: 'Mariana Albuquerque',
    role: 'Síndica Profissional',
    company: 'Condomínio Residencial Parque dos Coqueiros (Boa Viagem, Recife)',
    content: 'Implementamos o PMOC dos nossos chillers e o laudo de conformidade do playground conforme a ABNT NBR 16071. Documentação impecável, clara para apresentar em assembleia e com total respaldo legal.',
    highlight: 'PMOC & Laudo de Playground',
    rating: 5
  },
  {
    author: 'Roberto Mendonça',
    role: 'Diretor Industrial',
    company: 'Indústria Metalúrgica (Pernambuco)',
    content: 'Realizamos a apreciação de riscos e o inventário de máquinas para adequação à NR-12. O diagnóstico apontou exatamente os pontos críticos e as soluções de engenharia mais eficientes sem travar a produção.',
    highlight: 'Adequação Completa à NR-12',
    rating: 5
  }
];

const metrics = [
  {
    value: '+350',
    label: 'Laudos & ARTs Emitidos',
    subtext: 'Chancelados via CREA-PE'
  },
  {
    value: '100%',
    label: 'Aprovação Regulatória',
    subtext: 'ANVISA, MTE e DETRAN-PE'
  },
  {
    value: '24h',
    label: 'Agilidade Operacional',
    subtext: 'Vistorias e emissões ágeis'
  },
  {
    value: '10+',
    label: 'Anos de Experiência',
    subtext: 'Engenharia Mecânica & PCM'
  }
];

export default function SocialProof() {
  return (
    <section id="prova-social" className="py-20 md:py-24 bg-[#F1F6FA] dark:bg-[#0A1E38] border-t border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs md:text-sm font-bold tracking-widest text-[#134074] dark:text-[#4895EF] uppercase block mb-3 font-mono">
              Credibilidade & Prova Social
            </span>
            <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-5">
              Empresas e Setores que Confiam na VL Engenharia
            </h2>
            <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              Atendimento técnico com alto padrão de engenharia, responsabilidade civil e jurídica para empresas de todos os portes em Pernambuco.
            </p>
          </div>
        </ScrollReveal>

        {/* Sectors Served Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {clientSegments.map((segment, idx) => {
            const Icon = segment.icon;
            return (
              <ScrollReveal 
                key={idx} 
                delay={0.1 * idx} 
                direction="up"
                className="h-full"
              >
                <div 
                  id={`segmento-${idx}`}
                  className="bg-white dark:bg-[#0D2647] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-xl hover:border-[#4895EF]/50 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#134074]/10 dark:bg-[#134074]/30 text-[#134074] dark:text-[#4895EF] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#134074] group-hover:text-cyan-300 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                        {segment.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2 group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors">
                      {segment.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {segment.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conformidade Garantida</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Testimonials Cards */}
        <div className="mb-16">
          <ScrollReveal delay={0.2}>
            <div className="text-center mb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B2545] dark:text-[#8DA9C4]">
                Depoimentos de Parceiros
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white mt-1">
                O que dizem os nossos clientes
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <ScrollReveal 
                key={idx} 
                delay={0.15 * idx} 
                direction="up"
                className="h-full"
              >
                <div 
                  id={`depoimento-card-${idx}`}
                  className="bg-white dark:bg-[#0D2647] p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-lg hover:shadow-2xl hover:border-[#4895EF]/60 transition-all duration-300 flex flex-col justify-between h-full relative group hover:-translate-y-1.5"
                >
                  <div>
                    {/* Stars Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(item.rating)].map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-2 text-xs font-bold font-mono text-slate-600 dark:text-slate-300">5.0</span>
                    </div>

                    {/* Badge Highlight */}
                    <div className="inline-block bg-[#0B2545]/5 dark:bg-[#134074]/30 border border-[#0B2545]/15 dark:border-[#4895EF]/30 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-[#134074] dark:text-[#4895EF] mb-4">
                      {item.highlight}
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic mb-6">
                      "{item.content}"
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                      {item.author}
                    </h4>
                    <p className="text-xs text-[#134074] dark:text-[#4895EF] font-medium mt-0.5">
                      {item.role}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {item.company}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Quick Numbers / Trust Bar */}
        <ScrollReveal delay={0.3} direction="up">
          <div className="bg-[#0B2545] text-white rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#4895EF]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-72 h-72 bg-[#134074]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              {metrics.map((m, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-6 md:pt-0' : ''} space-y-1.5`}>
                  <div className="text-3xl md:text-4xl font-extrabold font-mono text-cyan-300 tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-xs md:text-sm font-bold text-white uppercase tracking-wider font-sans">
                    {m.label}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    {m.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-300" />
                <span>Engenheiro Responsável: Vitor Leonardo Cordeiro Linhares — CREA-PE 1822299490</span>
              </div>
              <a 
                href="#contato"
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-5 py-2 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 text-xs font-mono uppercase tracking-wider"
              >
                <span>Solicitar Vistoria Técnica</span>
              </a>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
