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
    <section id="contato" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 Scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left direct contact details */}
          <ScrollReveal className="lg:col-span-5 space-y-10" delay={0.1} direction="left">
            <div className="space-y-4">
              <span className="text-sm font-semibold tracking-widest text-[#0B2545] dark:text-[#134074] uppercase block font-mono">
                Canais de Atendimento
              </span>
              <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-950 dark:text-white tracking-tight leading-none">
                Iniciar Orçamento de Engenharia
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Preencha o formulário técnico para agendar vistorias, coletar propostas comerciais ou sanar dúvidas de adequação industrial.
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-start gap-5">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[#134074] dark:text-[#4895EF] rounded-2xl block shrink-0">
                  <Mail className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">E-mail Profissional</h4>
                  <a href="mailto:vitorleonardocl@gmail.com" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#134074] dark:hover:text-amber-400 transition-colors font-mono">
                    vitorleonardocl@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[#134074] dark:text-[#4895EF] rounded-2xl block shrink-0">
                  <Phone className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Contato WhatsApp</h4>
                  <a href="https://wa.me/5581984442592" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#134074] transition-colors font-mono">
                    (81) 98444-2592
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-pink-500 rounded-2xl block shrink-0">
                  <Instagram className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Siga no Instagram</h4>
                  <a href="https://www.instagram.com/vlengenharia.mec" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-pink-500 transition-colors font-mono">
                    @vlengenharia.mec
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[#134074] dark:text-[#4895EF] rounded-2xl block shrink-0">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Área Física Principal</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Recife, Região Metropolitana do Recife (RMR), Pernambuco.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[#134074] dark:text-[#4895EF] rounded-2xl block shrink-0">
                  <Clock className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Disponibilidade Operacional</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Agendamento para vistorias e visitas técnicas.
                  </p>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* Right form container */}
          <ScrollReveal className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative" delay={0.2} direction="right">
            {submitted ? (
              <div id="contato-sucesso-container" className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-800/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Proposta Recebida com Sucesso!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Olá! Graças aos nossos fluxos de atendimento estruturados, o Eng. Vitor Leonardo recebeu seus parâmetros técnicos e entrará em contato via e-mail ou WhatsApp nas próximas horas.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-xs dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest font-mono"
                >
                  Enviar Nova Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="formulario-contato" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="nome" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Seu Nome completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none active:border-[#134074] transition-all"
                      placeholder="Ex: Vitor Silva"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="empresa" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Nome da Empresa / Condomínio
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="Ex: Condomínio Parque Sol"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      E-mail Corporativo *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="Ex: contato@empresa.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="telefone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Telefone com DDD *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="Ex: (81) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="servico" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    Serviço Pretendido *
                  </label>
                  <select
                    id="servico"
                    value={formData.servico}
                    onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none transition-all cursor-pointer"
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
                  <label htmlFor="mensagem" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    Mensagem / Detalhes do Projeto *
                  </label>
                  <textarea
                    id="mensagem"
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#134074] text-slate-900 dark:text-white outline-none transition-all resize-none"
                    placeholder="Descreva brevemente a quantidade de equipamentos, restrições ou objetivos da vistoria mecânica..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#134074] disabled:bg-[#0B2545]/60 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#0B2545]/10 hover:shadow-[#134074]/20 transition-all font-mono tracking-widest uppercase text-xs cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmitir Proposta</span>
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
