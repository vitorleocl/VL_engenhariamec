/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import Typewriter from './Typewriter';
import { ArrowRight, NotebookTabs } from 'lucide-react';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked or video error:", err);
      });
    }
  }, []);

  return (
    <section id="inicio" className="relative min-h-[85vh] flex items-center bg-slate-50 dark:bg-[#071933] overflow-hidden pt-8 md:pt-14 pb-16 transition-colors duration-300 scroll-mt-16">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          src="https://vitorleonardo-engmec.netlify.app/hero-teaser.mp4"
          className="w-full h-full object-cover opacity-35 dark:opacity-20 blur-[3px] scale-103 transition-opacity duration-1000"
        >
          <source src="https://vitorleonardo-engmec.netlify.app/hero-teaser.mp4" type="video/mp4" />
          <source src="/hero-teaser.mp4" type="video/mp4" />
          <source src="/video.mp4" type="video/mp4" />
        </video>
        {/* Soft atmospheric gradient masks for elegant blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-transparent to-slate-50 dark:from-[#071933]/70 dark:via-[#071933]/40 dark:to-[#071933] pointer-events-none" />
        <div className="absolute inset-0 bg-slate-50/5 dark:bg-[#0B2545]/15 mix-blend-color pointer-events-none" />
      </div>

      {/* Abstract Design Elements */}
      <div className="absolute top-[15%] left-[-8%] w-[45vw] h-[45vw] rounded-full bg-[#134074]/10 dark:bg-[#4895EF]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-8%] w-[40vw] h-[40vw] rounded-full bg-[#0B2545]/10 dark:bg-[#134074]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 relative z-10 pt-4 pb-8 items-center">
        
        {/* Left copy column */}
        <ScrollReveal className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8" delay={0.1} direction="left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2545]/5 dark:bg-[#134074]/30 border border-[#0B2545]/10 dark:border-[#4895EF]/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#134074] dark:bg-[#4895EF] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B2545] dark:text-[#8DA9C4]">
              Engenharia Mecânica Especializada • CREA-PE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-black text-slate-950 dark:text-white tracking-tight leading-tight min-h-[3.2em] md:min-h-[2.4em]">
            Pareceres Técnicos,{' '}
            <span className="text-[#134074] dark:text-[#4895EF] inline-block md:inline">
              <Typewriter words={[
                "Laudos e ART",
                "Planos PMOC",
                "Projetos NR-12",
                "Laudos de Playground",
                "Inspeções de Frotas",
                "Segurança de Máquinas"
              ]} />
            </span>{' '}
            com Rigor e Segurança.
          </h1>

          <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed max-w-2xl font-normal">
            Soluções completas para Adequação à NR-12, PMOC, Laudos de Playground, Máquinas e Equipamentos Pesados, Inspeções Veiculares em Recife, Região Metropolitana e todo o estado de Pernambuco. Proteja seus ativos e garanta conformidade legal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="#contato"
              className="px-8 py-4 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-[#0B2545]/25 hover:scale-102 active:scale-98 text-center flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
            
            <a
              href="#servicos"
              className="px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all duration-300 hover:border-[#4895EF]/50 hover:scale-102 active:scale-98 text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <NotebookTabs className="w-4 h-4 text-[#134074] dark:text-[#4895EF]" />
              <span>Conhecer Serviços</span>
            </a>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 max-w-lg">
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-[#0B2545] dark:text-[#4895EF] font-mono">100%</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold font-sans">Conformidade Legal</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-[#0B2545] dark:text-[#4895EF] font-mono">PE</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold font-sans">Recife & RMR</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-2xl md:text-3xl font-extrabold text-[#0B2545] dark:text-[#4895EF] font-mono">ART</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold font-sans">Anotação CREA</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Right column with prominent engineer portrait */}
        <ScrollReveal className="lg:col-span-5 flex flex-col justify-center" delay={0.2} direction="right">
          <div className="relative group w-full max-w-md mx-auto lg:max-w-none">
            
            {/* Background design glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#4895EF] rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-700 pointer-events-none" />
            
            {/* Main Premium Portrait Frame */}
            <div className="relative bg-white dark:bg-[#0A1E38] rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl overflow-hidden p-5 sm:p-6 transition-all duration-300">
              
              {/* Fine drafting blueprint markings */}
              <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-slate-100 dark:border-slate-700/60 pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 border-t border-r border-slate-100 dark:border-slate-700/60 pointer-events-none z-10" />
              
              {/* High-impact profile photo */}
              <div className="relative aspect-[4/4.8] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-inner group-hover:border-[#4895EF]/40 transition-colors duration-500">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://vitorleonardo-engmec.netlify.app/assets/vitor-leonardo-Ca17hHDt.png" 
                  alt="Vitor Leonardo Cordeiro Linhares - Engenheiro Mecânico" 
                  className="w-full h-full object-cover object-top scale-101 group-hover:scale-104 transition-transform duration-700 bg-slate-100 dark:bg-slate-900"
                />
                
                {/* Visual Technical Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-6 pt-28 flex flex-col justify-end text-left pointer-events-none">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#4895EF] uppercase block mb-1.5">
                    Responsável Técnico Certificado
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-sans font-black text-white tracking-tight leading-tight mb-2">
                    Vitor Leonardo Cordeiro Linhares
                  </h3>
                  
                  {/* High Contrast CREA Chip */}
                  <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-400/50 px-3 py-1.5 rounded-lg w-fit">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs sm:text-sm text-cyan-300 font-mono font-bold tracking-wider">
                      CREA-PE: 1822299490
                    </span>
                  </div>
                </div>

                {/* Availability indicator badge */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0B2545]/95 backdrop-blur-md text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-white/20 shadow-xl select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Plantão Técnico</span>
                </div>
              </div>

              {/* Support Details & Call to Action below portrait */}
              <div className="p-2 pt-5 space-y-5 text-left">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  Pareceres técnicos, regularizações estruturais de média monta, laudos operacionais de carga e segurança NR-12 chancelados com ART imediata no CREA-PE.
                </p>

                {/* Direct Contact Highlights with high legibility */}
                <div className="grid grid-cols-2 gap-3.5 text-xs border-t border-b border-slate-200 dark:border-slate-700/80 py-4 font-mono">
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">SEDE OPERACIONAL</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Recife - PE</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">SUPORTE DIRETO</span>
                    <a 
                      href="https://wa.me/5581984442592" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-bold text-[#134074] dark:text-[#4895EF] hover:underline text-xs sm:text-sm truncate"
                    >
                      (81) 98444-2592
                    </a>
                  </div>
                </div>

                {/* Portal Link with Smooth Hover Microinteraction */}
                <a
                  href="#acervo"
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-slate-100 hover:bg-[#0B2545] hover:text-white dark:bg-[#0D2647] dark:hover:bg-[#134074] dark:hover:text-white border border-slate-300 dark:border-slate-700 text-[#0B2545] dark:text-cyan-300 text-xs font-bold transition-all duration-300 uppercase tracking-widest font-mono cursor-pointer text-center hover:shadow-lg hover:scale-102 active:scale-98"
                >
                  <NotebookTabs className="w-4 h-4" />
                  <span>Acessar Portal do Cliente</span>
                </a>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
