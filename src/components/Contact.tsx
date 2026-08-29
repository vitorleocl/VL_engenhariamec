/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Instagram } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    servico: 'PMOC',
    mensagem: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Reset after success
      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        servico: 'PMOC',
        mensagem: ''
      });
    }, 1200);
  };

  return (
    <section id="contato" className="py-20 md:py-24 bg-[#F8FAFC] dark:bg-[#051324] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left direct contact details */}
          <ScrollReveal className="lg:col-span-5 space-y-10" delay={0.1} direction="left">
            <div className="space-y-4">
              <span className="text-xs md:text-sm font-bold tracking-widest text-[#134074] dark:text-[#4895EF] uppercase block font-mono">
                Canais de Atendimento
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                Iniciar Orçamento de Engenharia
              </h2>
              <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed font-normal">
                Preencha o formulário técnico para agendar vistorias, solicitar propostas comerciais ou sanar dúvidas de adequação industrial com rapidez.
              </p>
            </div>

            <div className="space-y-5">
              
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A1E38] border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-[#4895EF]/40 transition-colors">
                <span className="p-3 bg-slate-100 dark:bg-[#134074]/30 border border-slate-200 dark:border-slate-700 text-[#134074] dark:text-cyan-300 rounded-xl block shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-sm">E-mail Profissional</h4>
                  <a href="mailto:vitorleonardocl@gmail.com" className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-[#134074] dark:hover:text-cyan-300 transition-colors font-mono font-medium">
                    vitorleonardocl@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A1E38] border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-[#4895EF]/40 transition-colors">
                <span className="p-3 bg-slate-100 dark:bg-[#134074]/30 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl block shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-sm">Plantão Técnico / WhatsApp</h4>
                  <a href="https://wa.me/5581984442592" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono font-medium">
                    (81) 98444-2592
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A1E38] border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-[#4895EF]/40 transition-colors">
                <span className="p-3 bg-slate-100 dark:bg-[#134074]/30 border border-slate-200 dark:border-slate-700 text-pink-500 rounded-xl block shrink-0">
                  <Instagram className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-sm">Perfil no Instagram</h4>
                  <a href="https://www.instagram.com/vlengenharia.mec" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors font-mono font-medium">
                    @vlengenharia.mec
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A1E38] border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                <span className="p-3 bg-slate-100 dark:bg-[#134074]/30 border border-slate-200 dark:border-slate-700 text-[#134074] dark:text-cyan-300 rounded-xl block shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-sm">Sede Operacional</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Recife, Região Metropolitana (RMR) e interior de Pernambuco.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A1E38] border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                <span className="p-3 bg-slate-100 dark:bg-[#134074]/30 border border-slate-200 dark:border-slate-700 text-[#134074] dark:text-cyan-300 rounded-xl block shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-sm">Disponibilidade de Vistorias</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Atendimento ágil em até 24h para emergências regulatórias.
                  </p>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* Right form container */}
          <ScrollReveal className="lg:col-span-7 bg-white dark:bg-[#0A1E38] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative" delay={0.2} direction="right">
            {submitted ? (
              <div id="contato-sucesso-container" className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6 border border-emerald-500/30">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Proposta Recebida com Sucesso!
                </h3>
                <p className="text-slate-700 dark:text-slate-200 text-sm max-w-md mx-auto leading-relaxed">
                  O Eng. Vitor Leonardo recebeu seus parâmetros técnicos e entrará em contato via e-mail ou WhatsApp com o dimensionamento e proposta comercial.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-3 rounded-xl bg-slate-100 dark:bg-[#134074] font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1a559c] transition-all uppercase tracking-widest font-mono cursor-pointer"
                >
                  Enviar Nova Solicitação
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="formulario-contato" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="nome" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                      Seu Nome completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all"
                      placeholder="Ex: Vitor Silva"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="empresa" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                      Nome da Empresa / Condomínio
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all"
                      placeholder="Ex: Condomínio Parque Sol"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                      E-mail Corporativo *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all"
                      placeholder="Ex: contato@empresa.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="telefone" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                      Telefone com DDD *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all"
                      placeholder="Ex: (81) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="servico" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Serviço Pretendido *
                  </label>
                  <select
                    id="servico"
                    value={formData.servico}
                    onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all cursor-pointer"
                  >
                    <option value="PMOC">PMOC (Plano de Climatização)</option>
                    <option value="NR-12">Adequação Mecânica à NR-12</option>
                    <option value="Munck / Guindastes">Inspeção de Munck ou Guindaste</option>
                    <option value="Maquinas Pesadas">Laudos para Máquinas Pesadas</option>
                    <option value="Laudos para Playgrounds">Laudos para Playgrounds</option>
                    <option value="Regularizacao Veicular">Reclassificação de Monta</option>
                    <option value="ART Responsabilidade">ART para Manutenção Periódica</option>
                    <option value="Consultoria Confiabilidade">PCM & Confiabilidade Industrial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mensagem" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Mensagem / Detalhes do Projeto *
                  </label>
                  <textarea
                    id="mensagem"
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#07172E] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#4895EF] text-slate-950 dark:text-white outline-none transition-all resize-none"
                    placeholder="Descreva brevemente a quantidade de equipamentos, localização e objetivos da vistoria..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#0B2545] hover:bg-[#134074] disabled:bg-[#0B2545]/60 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-mono tracking-widest uppercase text-xs cursor-pointer hover:scale-101 active:scale-99"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmitir Solicitação de Orçamento</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
