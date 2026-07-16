import { useState } from 'react';
import { Shield, Cpu, Sparkles, Wand2, Truck, FileText, ArrowRight, Car, Layers, Wrench, Activity, BarChart3, Calculator, Hammer, Anchor } from 'lucide-react';
import { ClientData } from '../../types';
import LaudoNR12Indep from './LaudoNR12Indep';
import LaudoNR13Indep from './LaudoNR13Indep';
import LaudoMaquinasPesadasIndep from './LaudoMaquinasPesadasIndep';
import LaudoCaminhaoMunckIndep from './LaudoCaminhaoMunckIndep';
import LaudoGuindasteIndep from './LaudoGuindasteIndep';
import LaudoInspecaoVeicularIndep from './LaudoInspecaoVeicularIndep';
import LaudoMontaVeicularIndep from './LaudoMontaVeicularIndep';
import LaudoPlaygroundIndep from './LaudoPlaygroundIndep';
import LaudoPMOCIndep from './LaudoPMOCIndep';
import LaudoArtManutencaoIndep from './LaudoArtManutencaoIndep';
import LaudoPCMIndep from './LaudoPCMIndep';
import LaudoCargaTermicaIndep from './LaudoCargaTermicaIndep';
import LaudoFrotaEscolarIndep from './LaudoFrotaEscolarIndep';

interface LaudoGeneratorsProps {
  clients?: ClientData[];
}

export default function LaudoGenerators({ clients }: LaudoGeneratorsProps = {}) {
  const [selected, setSelected] = useState<'none' | 'nr12' | 'nr13' | 'heavy' | 'munck' | 'guindaste' | 'vehicle' | 'montacargas' | 'playground' | 'pmoc' | 'art_manutencao' | 'pcm' | 'hvac_carga_termica' | 'school_bus'>('none');
  const [prefilled, setPrefilled] = useState(false);
  const [category, setCategory] = useState<'all' | 'laudos' | 'projetos'>('all');

  const selectPrefilled = (type: 'heavy' | 'munck' | 'guindaste' | 'vehicle' | 'montacargas' | 'playground' | 'pmoc' | 'art_manutencao' | 'pcm' | 'hvac_carga_termica' | 'school_bus' | 'nr13') => {
    setPrefilled(true);
    setSelected(type);
  };

  if (selected === 'nr12') {
    return <LaudoNR12Indep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'heavy') {
    return <LaudoMaquinasPesadasIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'munck') {
    return <LaudoCaminhaoMunckIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'guindaste') {
    return <LaudoGuindasteIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'vehicle') {
    return <LaudoInspecaoVeicularIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'montacargas') {
    return <LaudoMontaVeicularIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'playground') {
    return <LaudoPlaygroundIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'pmoc') {
    return <LaudoPMOCIndep onBack={() => { setSelected('none'); setPrefilled(false); }} clients={clients} />;
  }

  if (selected === 'art_manutencao') {
    return <LaudoArtManutencaoIndep onBack={() => { setSelected('none'); setPrefilled(false); }} clients={clients} />;
  }

  if (selected === 'pcm') {
    return <LaudoPCMIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'hvac_carga_termica') {
    return <LaudoCargaTermicaIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'school_bus') {
    return <LaudoFrotaEscolarIndep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  if (selected === 'nr13') {
    return <LaudoNR13Indep onBack={() => { setSelected('none'); setPrefilled(false); }} initialPrefilled={prefilled} clients={clients} />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title block */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#134074]/10 dark:bg-[#4895EF]/10 border border-[#134074]/20 dark:border-[#4895EF]/20 rounded-full text-[#134074] dark:text-[#4895EF] text-xs font-black font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
          <span>Sistemas Autónomos IA</span>
        </div>
        <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900 dark:text-white">Central de Geradores de Laudo</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Gere laudos técnicos robustos, relatórios fotográficos de campo e apreciação de risco regulamentar através de nossos motores de Inteligência Artificial especializados.
        </p>
      </div>

      {/* SEPARATE BUTTONS SECTION: MODELO DE LAUDO EXEMPLO */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-48 h-48 text-[#4895EF]" />
        </div>
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4895EF]/20 border border-[#4895EF]/30 rounded-full text-[#4895EF] text-[10px] font-bold font-mono tracking-wider uppercase">
              NOVO RECURSO DE DEMONSTRAÇÃO
            </span>
            <h3 className="text-2xl font-black tracking-tight font-sans">Visualizar Laudo Técnico de Exemplo</h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-sans">
              Explore o modelo de laudo preenchido com dados fictícios técnicos e imagens reais para testar a qualidade visual do formato final antes de iniciar o seu laudo real. O documento foi aperfeiçoado para **Tamanho A4 padrão de impressão**, com **controle inteligente de quebra de páginas por seção**, assinatura centralizada oficial da **VL Engenharia** e uma **página final dedicada para os Anexos da ART**.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => selectPrefilled('munck')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#134074]" />
                <span className="font-sans text-left">Exemplo: Caminhão Munck</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button 
              onClick={() => selectPrefilled('guindaste')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Anchor className="w-5 h-5 text-indigo-600" />
                <span className="font-sans text-left">Exemplo: Guindaste Telescópico</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button 
              onClick={() => selectPrefilled('nr13')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer animate-pulse"
            >
              <div className="flex items-center gap-2.5">
                <Hammer className="w-5 h-5 text-white animate-bounce" />
                <span className="font-sans text-left">Exemplo: NR-13 Vaso de Pressão</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button 
              onClick={() => selectPrefilled('heavy')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span className="font-sans text-left">Exemplo: Ativos e Máquinas Pesadas</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>

            <button 
              onClick={() => selectPrefilled('vehicle')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-[#134074]/20"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-emerald-400" />
                <span className="font-sans text-left">Exemplo: Inspeção Veicular</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>

            <button 
              onClick={() => selectPrefilled('school_bus')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-[#134074]/20"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-amber-400" />
                <span className="font-sans text-left">Exemplo: Frota Escolar</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>

            <button 
              onClick={() => selectPrefilled('montacargas')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-indigo-800"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-sky-400" />
                <span className="font-sans text-left">Exemplo: Reclassificação Monta Veicular</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>

            <button 
              onClick={() => selectPrefilled('playground')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-500"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-200" />
                <span className="font-sans text-left">Exemplo: Inspeção de Playground</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-100" />
            </button>

            <button 
              onClick={() => selectPrefilled('pmoc')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-teal-600"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-teal-200" />
                <span className="font-sans text-left">Exemplo: Auditoria e Plano de PMOC</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-100" />
            </button>

            <button 
              onClick={() => selectPrefilled('art_manutencao')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-indigo-600"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-indigo-200" />
                <span className="font-sans text-left">Exemplo: ART de Manutenção</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-100" />
            </button>

            <button 
              onClick={() => selectPrefilled('pcm')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-600"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-amber-200" />
                <span className="font-sans text-left">Exemplo: Gestão de Manutenção (PCM)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-100" />
            </button>

            <button 
              onClick={() => selectPrefilled('hvac_carga_termica')}
              className="flex items-center justify-between gap-3 px-6 py-4 bg-[#134074] hover:bg-[#134074]/95 text-white font-bold text-xs rounded-2xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-[#134074]/30"
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-sky-300" />
                <span className="font-sans text-left">Exemplo: Cálculo Carga Térmica HVAC</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Submenu de Categorias */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-6 pt-4">
        <button
          onClick={() => setCategory('all')}
          className={`pb-4 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            category === 'all' 
              ? 'text-[#134074] dark:text-sky-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Todos os Sistemas</span>
          {category === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setCategory('laudos')}
          className={`pb-4 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            category === 'laudos' 
              ? 'text-[#134074] dark:text-sky-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Laudos & Auditorias</span>
          {category === 'laudos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setCategory('projetos')}
          className={`pb-4 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            category === 'projetos' 
              ? 'text-[#134074] dark:text-sky-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-sky-500" />
          <span>Projetos e Dimensionamentos</span>
          <span className="text-[8px] bg-sky-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">NOVO</span>
          {category === 'projetos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Grid of generators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        
        {/* NR-12 Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('nr12')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-36 h-36 text-[#0B2545]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-[#0B2545]/5 dark:bg-white/5 border border-[#0B2545]/10 dark:border-white/10 rounded-2xl w-fit text-[#0B2545] dark:text-[#4895EF]">
              <Shield className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#0B2545] dark:group-hover:text-[#4895EF] transition-colors font-sans">
                  Laudo NR-12
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Geração de laudos da NR-12. Inclui segurança física, apreciação de riscos (HRN), categorização NBR 14153, não conformidades e plano de ação estruturado.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              12 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* NR-13 Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('nr13')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Hammer className="w-36 h-36 text-red-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-600/5 dark:bg-red-500/5 border border-red-500/15 rounded-2xl w-fit text-red-600 dark:text-red-400">
              <Hammer className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans">
                  Laudo NR-13
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos para vasos de pressão, caldeiras, tubulações e tanques. Inclui enquadramento de categoria por cálculo P x V, checklist de integridade e ensaios de campo.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              10 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* Máquinas Pesadas Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('heavy')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu className="w-36 h-36 text-[#A00000]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-600/5 dark:bg-red-500/5 border border-red-500/15 rounded-2xl w-fit text-red-600 dark:text-red-400">
              <Cpu className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans">
                  Máquinas Pesadas
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Equipamentos móveis de grande porte (Escavadeiras, Retroescavadeiras, Carregadeiras, etc) sob as diretrizes das NR-12, NR-11 e NR-18. Inclui ROPS/FOPS e HRN.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              18 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* Caminhão Munck Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('munck')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-36 h-36 text-[#134074]" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-[#134074]/5 dark:bg-white/5 border border-[#134074]/10 dark:border-white/10 rounded-2xl w-fit text-[#134074] dark:text-[#4895EF]">
              <Truck className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors font-sans">
                  Caminhão Munck
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos e integridade operacional específicos para caminhões com guindaste articulado veicular (Munck), incluindo chassi, estabilizadores e acessórios de içamento.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-[#134074] dark:group-hover:text-[#4895EF] transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              15 Seções
            </span>
          </div>
        </div>
        )}

        {/* Guindaste Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('guindaste')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Anchor className="w-36 h-36 text-indigo-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-2xl w-fit text-indigo-600 dark:text-[#4895EF]">
              <Anchor className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-sans">
                  Guindaste Telescópico
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos e conformidade de segurança detalhados para Guindastes de Lança Telescópica e Autopropelidos. Integra sistema de segurança operacional (LMI).
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              15 Seções
            </span>
          </div>
        </div>
        )}

        {/* Inspeção Veicular Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('vehicle')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-36 h-36 text-emerald-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-emerald-600/5 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-2xl w-fit text-emerald-600 dark:text-emerald-400">
              <Car className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-sans">
                  Inspeção Veicular
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos para carros, utilitários, frotas leves e pesadas em integridade física. Avaliação de 20 itens obrigatórios do CONTRAN, cálculo HRN e plano corretivo.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Inspeção →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              20 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* Frota Escolar Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('school_bus')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-36 h-36 text-amber-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-600/5 dark:bg-amber-500/5 border border-amber-500/15 rounded-2xl w-fit text-amber-600 dark:text-amber-400">
              <Car className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-sans">
                  Frota Escolar
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos técnicos de inspeção para veículos escolares sob o CTB (Art. 136/138) e ABNT NBR 17075:2022. Checklist completo de 17 blocos de segurança regulamentar.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Inspeção →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              17 Blocos / NBR
            </span>
          </div>
        </div>
        )}

        {/* Reclassificação de Monta Veicular Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('montacargas')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-36 h-36 text-indigo-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-indigo-600/5 dark:bg-indigo-500/5 border border-indigo-500/15 rounded-2xl w-fit text-indigo-600 dark:text-indigo-400">
              <Car className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-sans">
                  Reclassificação de Monta Veicular
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos e auditorias de reclassificação técnica de monta de veículos sinistrados (Pequena, Média ou Grande Monta) sob a Resolução CONTRAN nº 810/2020.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              9 Blocos / CONTRAN
            </span>
          </div>
        </div>
        )}

        {/* Inspeção de Playgrounds Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('playground')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-36 h-36 text-amber-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/15 rounded-2xl w-fit text-amber-600 dark:text-amber-400">
              <Shield className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-sans">
                  Laudo de Playground
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos técnicos de segurança em áreas de recreação infantil e playgrounds sob a ABNT NBR 16071 partes 1 a 7. Checklist, análise de perigo, prioridades e ART.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              18 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* Plano de PMOC Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('pmoc')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-36 h-36 text-teal-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-teal-600/5 dark:bg-teal-500/5 border border-teal-500/15 rounded-2xl w-fit text-teal-600 dark:text-teal-400">
              <Activity className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-sans">
                  Plano de PMOC
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Plano de Manutenção, Operação e Controle (Lei 13.589/2018). Inclui inventário físico, cronograma mensal de rotinas, checklist técnico sanitário de 18 itens e formulários prontos para uso.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Auditoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              18 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* ART de Manutenção Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('art_manutencao')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wrench className="w-36 h-36 text-indigo-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-indigo-600/5 dark:bg-indigo-500/5 border border-indigo-500/15 rounded-2xl w-fit text-indigo-600 dark:text-indigo-400">
              <Wrench className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-sans">
                  ART de Manutenção
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Gere o pacote completo para serviços de manutenção técnica de máquinas, climatização e equipamentos industriais: Memorial Descritivo, Checklist Pré-ART e Relatório Técnico.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Emissão →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              Completo
            </span>
          </div>
        </div>
        )}

        {/* Consultoria em Gestão de Manutenção (PCM) Card */}
        {(category === 'all' || category === 'laudos') && (
        <div 
          onClick={() => setSelected('pcm')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-36 h-36 text-amber-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-600/5 dark:bg-amber-500/5 border border-amber-500/15 rounded-2xl w-fit text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-sans">
                  Consultoria PCM
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Gere o Plano Diretor PCM completo: Diagnóstico de Maturidade ISO 55001, Cronograma PMP de 52 Semanas, Matriz FMEA de ativos e Painel de Indicadores (MTBF, MTTR, Backlog).
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Consultoria →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              Completo
            </span>
          </div>
        </div>
        )}

        {/* Cálculo de Carga Térmica HVAC Card */}
        {(category === 'all' || category === 'projetos') && (
        <div 
          onClick={() => setSelected('hvac_carga_termica')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calculator className="w-36 h-36 text-sky-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-sky-600/5 dark:bg-sky-500/5 border border-sky-500/15 rounded-2xl w-fit text-[#134074] dark:text-sky-400">
              <Calculator className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#134074] dark:group-hover:text-sky-400 transition-colors font-sans">
                  Cálculo Carga Térmica
                </h3>
                <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Ativo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Realize o cálculo de carga térmica de ambientes por fatores. Inclui 8 fontes de calor, quadro resumo, dimensionamento elétrico, requisitos PMOC e anotação de ART.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Dimensionamento →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              8 Tipos / ART
            </span>
          </div>
        </div>
        )}

      </div>

      {/* Info panel */}
      <div className="bg-[#134074]/5 dark:bg-[#4895EF]/5 border border-[#134074]/10 dark:border-[#4895EF]/10 p-5 rounded-2xl flex items-start gap-4 max-w-full">
        <Wand2 className="w-5 h-5 text-[#134074] dark:text-[#4895EF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white font-sans uppercase">Acelerador de Engenharia com Inteligência Artificial</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Ambos os geradores utilizam a API Gemini integrada para analisar dados de entrada, sugerir enquadramentos normativos, preencher checklists automáticos e redigir conclusões técnicas periciais em segundos. Faça upload de fotos em campo para que a IA realize o diagnóstico técnico visual!
          </p>
        </div>
      </div>
    </div>
  );
}
