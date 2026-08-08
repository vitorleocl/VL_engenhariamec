import { useState, useEffect } from 'react';
import { Shield, Cpu, Sparkles, Wand2, Truck, FileText, ArrowRight, Car, Layers, Wrench, Activity, BarChart3, Calculator, Hammer, Anchor, Trash2, Search, Clock, ChevronDown, ChevronUp, CheckCircle, Info, Flame } from 'lucide-react';
import { ClientData, EquipmentData } from '../../types';
import LaudoNR12Indep from './LaudoNR12Indep';
import LaudoNR13Indep from './LaudoNR13Indep';
import LaudoFireSafetyIndep from './LaudoFireSafetyIndep';
import LaudoMaquinasPesadasIndep from './LaudoMaquinasPesadasIndep';
import LaudoCaminhaoMunckIndep from './LaudoCaminhaoMunckIndep';
import LaudoGuindasteIndep from './LaudoGuindasteIndep';
import LaudoInspecaoVeicularIndep from './LaudoInspecaoVeicularIndep';
import LaudoMontaVeicularIndep from './LaudoMontaVeicularIndep';
import LaudoAvaliacaoSinistroVeicularIndep from './LaudoAvaliacaoSinistroVeicularIndep';
import LaudoPlaygroundIndep from './LaudoPlaygroundIndep';
import LaudoPMOCIndep from './LaudoPMOCIndep';
import LaudoArtManutencaoIndep from './LaudoArtManutencaoIndep';
import LaudoPCMIndep from './LaudoPCMIndep';
import LaudoCargaTermicaIndep from './LaudoCargaTermicaIndep';
import LaudoFrotaEscolarIndep from './LaudoFrotaEscolarIndep';
import LaudoTemplateEditor from './LaudoTemplateEditor';
import { getGeneratorLaudos, deleteGeneratorLaudo, SavedGeneratorLaudo, getLocalList, subscribeToGeneratorLaudos, extractLaudoNumber } from '../../lib/generatorStorage';

function getLaudoTypeBadge(type: string) {
  switch (type) {
    case 'nr12': return { label: 'NR-12 (Segurança)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'nr13': return { label: 'NR-13 (Caldeiras/Vasos)', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    case 'heavy': return { label: 'Máquinas Pesadas', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    case 'munck': return { label: 'Caminhão Munck', color: 'bg-[#134074]/10 text-[#134074] dark:text-sky-400 border-[#134074]/20' };
    case 'guindaste': return { label: 'Guindaste Telescópico', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
    case 'vehicle': return { label: 'Inspeção Veicular', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    case 'sinistro_veicular': return { label: 'Avaliação de Sinistro', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    case 'montacargas': return { label: 'Reclassificação de Monta', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' };
    case 'playground': return { label: 'Playground', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'pmoc': return { label: 'PMOC (Climatização)', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
    case 'art_manutencao': return { label: 'ART de Manutenção', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
    case 'pcm': return { label: 'Plano PCM', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'hvac_carga_termica': return { label: 'Carga Térmica HVAC', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' };
    case 'school_bus': return { label: 'Frota Escolar', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'ppci_avcb_clcb': return { label: 'Incêndio (PPCI/AVCB/CLCB)', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    case 'fire_safety': return { label: 'Incêndio (PPCI/AVCB/CLCB)', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    default: return { label: (type || 'GERADOR').toUpperCase(), color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
  }
}

interface LaudoGeneratorsProps {
  clients?: ClientData[];
  equipments?: EquipmentData[];
}

export default function LaudoGenerators({ clients, equipments }: LaudoGeneratorsProps = {}) {
  const [selected, setSelected] = useState<'none' | 'nr12' | 'nr13' | 'heavy' | 'munck' | 'guindaste' | 'vehicle' | 'montacargas' | 'playground' | 'pmoc' | 'art_manutencao' | 'pcm' | 'hvac_carga_termica' | 'school_bus' | 'sinistro_veicular' | 'fire_safety' | 'ppci_avcb_clcb' | 'template_editor'>('none');
  const [prefilled, setPrefilled] = useState(false);
  const [category, setCategory] = useState<'all' | 'laudos' | 'projetos'>('all');

  // Saved reports state initialized instantly from local cache
  const [savedLaudos, setSavedLaudos] = useState<SavedGeneratorLaudo[]>(() => getLocalList());
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [selectedSavedData, setSelectedSavedData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Layout navigation, examples collapse, and card search query
  const [activeSubTab, setActiveSubTab] = useState<'generators' | 'history'>('generators');
  const [showExamples, setShowExamples] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    getGeneratorLaudos().then(list => {
      if (isMounted) setSavedLaudos(list);
    }).catch(err => console.error("Erro ao carregar laudos salvos:", err));

    // Live subscription
    const unsubscribe = subscribeToGeneratorLaudos((updatedList) => {
      if (isMounted) {
        setSavedLaudos(updatedList);
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [selected]);

  const handleEditSaved = (laudo: SavedGeneratorLaudo) => {
    setSelectedSavedId(laudo.id);
    setSelectedSavedData(laudo.formData);
    setPrefilled(false);
    setSelected(laudo.type as any);
  };

  const handleDeleteSaved = async (laudo: SavedGeneratorLaudo) => {
    try {
      const num = extractLaudoNumber(laudo.formData);
      await deleteGeneratorLaudo(laudo.id, num);
      setSavedLaudos(prev => prev.filter(l => {
        const itemNum = extractLaudoNumber(l.formData);
        if (l.id === laudo.id) return false;
        if (num && itemNum && num.toLowerCase() === itemNum.toLowerCase()) return false;
        return true;
      }));
      setDeletingId(null);
    } catch (err) {
      console.error("Erro ao excluir laudo:", err);
    }
  };

  const selectPrefilled = (type: 'heavy' | 'munck' | 'guindaste' | 'vehicle' | 'montacargas' | 'playground' | 'pmoc' | 'art_manutencao' | 'pcm' | 'hvac_carga_termica' | 'school_bus' | 'nr13' | 'sinistro_veicular') => {
    setPrefilled(true);
    setSelected(type);
  };

  const handleBackToGenerators = () => {
    setSelected('none');
    setPrefilled(false);
    setSelectedSavedId(null);
    setSelectedSavedData(null);
  };

  const renderActiveGenerator = () => {
    if (selected === 'none') return null;

    const TEMPLATE_ID_MAP: Record<string, string> = {
      'nr12': 'tpl_nr12_maquinas',
      'heavy': 'tpl_maquinas_pesadas',
      'munck': 'tpl_caminhao_munck',
      'guindaste': 'tpl_guindaste_ind',
      'vehicle': 'tpl_inspecao_veicular',
      'montacargas': 'tpl_montacargas',
      'sinistro_veicular': 'tpl_sinistro_veicular',
      'playground': 'tpl_playground_parques',
      'pmoc': 'tpl_pmoc_hvac',
      'art_manutencao': 'tpl_art_manutencao',
      'pcm': 'tpl_pcm_manutencao',
      'hvac_carga_termica': 'tpl_carga_termica',
      'school_bus': 'tpl_frota_escolar',
      'nr13': 'tpl_nr13_vasos',
      'fire_safety': 'tpl_fire_safety',
      'ppci_avcb_clcb': 'tpl_fire_safety',
      'template_editor': 'tpl_sinistro_veicular'
    };

    const targetTemplateId = TEMPLATE_ID_MAP[selected] || 'tpl_sinistro_veicular';

    return (
      <LaudoTemplateEditor
        clients={clients}
        equipments={equipments}
        initialTemplateId={targetTemplateId}
        initialSavedData={selectedSavedData}
        onBack={handleBackToGenerators}
      />
    );
  };

  if (selected !== 'none') {
    return (
      <div className="w-full space-y-6 animate-fade-in text-left">
        {renderActiveGenerator()}
      </div>
    );
  }

  const matchesSearch = (title: string, desc: string) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  };

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

      {/* BANNER PROMINENTE: MÓDULO DE TEMPLATES EDITÁVEIS & BANCO DE LAUDOS */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Novo Módulo Modular & Editável</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Editor de Templates Modulares & Banco de Laudos-Modelo
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Monte laudos personalizados escolhendo e reordenando seções, com substituição automática de dados de clientes e editor de texto livre embutido.
          </p>
        </div>
        <button
          onClick={() => setSelected('template_editor')}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>Abrir Editor de Templates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Switcher Principal */}
      <div className="flex gap-2.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('generators')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'generators'
              ? 'bg-[#0B2545] text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4 text-indigo-500" />
          <span>Central de Geradores (IA)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-[#0B2545] text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Histórico de Laudos</span>
          {savedLaudos.length > 0 && (
            <span className="flex h-4.5 w-4.5 bg-emerald-500 text-[10px] font-black text-white rounded-full items-center justify-center font-mono animate-pulse">
              {savedLaudos.length}
            </span>
          )}
        </button>
      </div>

      {/* COLLAPSIBLE DEMO EXAMPLES SECTION */}
      {activeSubTab === 'generators' && (
        <div className="space-y-4">
          <div className="bg-[#134074]/5 dark:bg-white/5 border border-[#134074]/10 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Visualizar Laudos Técnicos de Exemplo</h4>
                <p className="text-[10px] text-slate-500">Explore formatos de laudos reais pré-preenchidos (Caminhão Munck, PMOC, etc.) para teste.</p>
              </div>
            </div>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase cursor-pointer transition-all"
            >
              <span>{showExamples ? 'Ocultar Modelos' : 'Mostrar Modelos'}</span>
              {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showExamples && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden animate-fade-in">
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
          )}
        </div>
      )}

      {/* Saved Reports (History Tab) */}
      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono">
                  Histórico de Laudos Salvos ({savedLaudos.length})
                </h3>
                <p className="text-[10px] text-slate-500 font-sans">
                  Seus relatórios e auditorias preenchidos e salvos na nuvem do sistema.
                </p>
              </div>
            </div>

            {/* Mobile / Search trigger */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar no histórico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-[#134074] outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {savedLaudos.length === 0 ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full w-fit mx-auto text-slate-400">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Nenhum Laudo Salvo</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Você ainda não possui nenhum laudo técnico arquivado. Preencha e salve um laudo em qualquer gerador para ver seu histórico aqui.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('generators')}
                className="px-4 py-2 bg-[#0B2545] hover:bg-[#134074] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Iniciar Novo Laudo
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* MOBILE CARDS VIEW (visible on small screens) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {savedLaudos
                  .filter(l => !searchQuery || l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || l.equipmentModel.toLowerCase().includes(searchQuery.toLowerCase()) || l.type.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((laudo) => {
                    const badge = getLaudoTypeBadge(laudo.type);
                    return (
                      <div key={laudo.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase tracking-wider ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(laudo.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{laudo.clientName}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{laudo.equipmentModel}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-end gap-2">
                          {deletingId === laudo.id ? (
                            <div className="flex items-center gap-1.5 animate-pulse">
                              <span className="text-[10px] text-red-500 font-bold uppercase">Excluir?</span>
                              <button
                                onClick={() => handleDeleteSaved(laudo)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditSaved(laudo)}
                                className="px-3 py-1.5 bg-[#134074] hover:bg-[#134074]/90 text-white font-bold font-mono tracking-wider text-[10px] uppercase rounded-xl cursor-pointer transition-all"
                              >
                                Abrir / Editar
                              </button>
                              <button
                                onClick={() => setDeletingId(laudo.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-xl cursor-pointer transition-all"
                                title="Excluir do Acervo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>

              {/* DESKTOP TABLE VIEW (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono tracking-wider uppercase text-[10px]">
                      <th className="py-2.5">Tipo de Laudo</th>
                      <th className="py-2.5">Cliente / Empresa</th>
                      <th className="py-2.5">Equipamento / Detalhes</th>
                      <th className="py-2.5">Data de Emissão</th>
                      <th className="py-2.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                    {savedLaudos
                      .filter(l => !searchQuery || l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || l.equipmentModel.toLowerCase().includes(searchQuery.toLowerCase()) || l.type.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((laudo) => {
                        const badge = getLaudoTypeBadge(laudo.type);
                        return (
                          <tr key={laudo.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                              <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{laudo.clientName}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400">{laudo.equipmentModel}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(laudo.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {deletingId === laudo.id ? (
                                  <div className="flex items-center gap-1.5 animate-pulse">
                                    <span className="text-[10px] text-red-500 font-bold uppercase mr-1">Excluir?</span>
                                    <button
                                      onClick={() => handleDeleteSaved(laudo)}
                                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all"
                                    >
                                      Sim
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(null)}
                                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all"
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditSaved(laudo)}
                                      className="px-3 py-1.5 bg-[#134074]/10 hover:bg-[#134074]/20 text-[#134074] dark:text-sky-400 font-bold font-mono tracking-wider text-[10px] uppercase rounded-lg cursor-pointer transition-all"
                                    >
                                      Abrir / Editar
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(laudo.id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-lg cursor-pointer transition-all"
                                      title="Excluir do Acervo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category selection and search bar (Generators Tab only) */}
      {activeSubTab === 'generators' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          {/* Submenu de Categorias */}
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => setCategory('all')}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                category === 'all' 
                  ? 'text-[#134074] dark:text-sky-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Todos os Sistemas</span>
              {category === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCategory('laudos')}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                category === 'laudos' 
                  ? 'text-[#134074] dark:text-sky-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Laudos & Auditorias</span>
              {category === 'laudos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCategory('projetos')}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                category === 'projetos' 
                  ? 'text-[#134074] dark:text-sky-400 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-500" />
              <span>Projetos & Dimensionamentos</span>
              <span className="text-[8px] bg-sky-500 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">NOVO</span>
              {category === 'projetos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134074] dark:bg-sky-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs md:max-w-sm mb-1.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar gerador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-[#134074] font-sans outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Grid of generators */}
      {activeSubTab === 'generators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        
        {/* GERADOR DE LAUDOS DE INCÊNDIO (PPCI / AVCB / CLCB) CARD */}
        {(category === 'all' || category === 'laudos') && matchesSearch('Laudos de Incêndio (PPCI / AVCB / CLCB)', 'Orquestrador inteligente de laudos de segurança contra incêndio: Pré-Projeto PPCI, Vistoria para AVCB e CLCB com análise de normas estaduais IT/NT.') && (
        <div 
          onClick={() => setSelected('fire_safety')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-red-500/30 dark:border-red-500/30 p-8 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Flame className="w-36 h-36 text-red-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl w-fit text-red-500">
              <Flame className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-500 transition-colors font-sans">
                  Incêndio (PPCI / AVCB / CLCB)
                </h3>
                <span className="text-[9px] bg-red-600 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">NOVO</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Orquestrador de Laudos de Segurança Contra Incêndio: Levantamento Pré-Projeto PPCI, Vistoria para AVCB e Licença CLCB com aplicação automática das IT/NT estaduais.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-red-500 group-hover:text-red-400 transition-colors flex items-center gap-1">
              Gerar Laudo com IA →
            </span>
            <span className="text-[10px] bg-red-500/10 text-red-400 font-mono font-bold px-2.5 py-1 rounded border border-red-500/20">
              PPCI • AVCB • CLCB
            </span>
          </div>
        </div>
        )}

        {/* NR-12 Card */}
        {(category === 'all' || category === 'laudos') && matchesSearch('Laudo NR-12', 'Geração de laudos da NR-12. Inclui segurança física, apreciação de riscos (HRN), categorização NBR 14153, não conformidades e plano de ação estruturado.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Laudo NR-13', 'Laudos para vasos de pressão, caldeiras, tubulações e tanques. Inclui enquadramento de categoria por cálculo P x V, checklist de integridade e ensaios de campo.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Máquinas Pesadas', 'Equipamentos móveis de grande porte (Escavadeiras, Retroescavadeiras, Carregadeiras, etc) sob as diretrizes das NR-12, NR-11 e NR-18. Inclui ROPS/FOPS e HRN.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Caminhão Munck', 'Laudos e integridade operacional específicos para caminhões com guindaste articulado veicular (Munck), incluindo chassi, estabilizadores e acessórios de içamento.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Guindaste Telescópico', 'Laudos e conformidade de segurança detalhados para Guindastes de Lança Telescópica e Autopropelidos. Integra sistema de segurança operacional (LMI).') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Inspeção Veicular', 'Laudos para carros, utilitários, frotas leves e pesadas em integridade física. Avaliação de 20 itens obrigatórios do CONTRAN, cálculo HRN e plano corretivo.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Frota Escolar', 'Laudos técnicos de inspeção para veículos escolares sob o CTB (Art. 136/138) e ABNT NBR 17075:2022. Checklist completo de 17 blocos de segurança regulamentar.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Reclassificação de Monta Veicular', 'Laudos e auditorias de reclassificação técnica de monta de veículos sinistrados (Pequena, Média ou Grande Monta) sob a Resolução CONTRAN nº 810/2020.') && (
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

        {/* Avaliação de Sinistro Veicular Card */}
        {(category === 'all' || category === 'laudos') && matchesSearch('Avaliação de Sinistro Veicular', 'Laudos de avaliação e perícia de colisões/sinistros mecânicos e estruturais. Inclui checklist de 31 itens, enquadramento de monta legal, álbum de fotos por categorias e IA inteligente de danos.') && (
        <div 
          onClick={() => setSelected('sinistro_veicular')}
          className="group relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-36 h-36 text-red-600" />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-red-600/5 dark:bg-red-500/5 border border-red-500/15 rounded-2xl w-fit text-red-600 dark:text-red-400">
              <Car className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans">
                  Avaliação de Sinistro Veicular
                </h3>
                <span className="text-[8px] bg-red-600 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase animate-pulse">NOVO IA</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Laudos de avaliação e perícia de colisões/sinistros mecânicos e estruturais. Inclui checklist de 31 itens, enquadramento de monta legal, álbum de fotos por categorias e IA inteligente de danos.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              Iniciar Perícia →
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono font-bold px-2.5 py-1 rounded text-slate-500">
              31 Requisitos
            </span>
          </div>
        </div>
        )}

        {/* Inspeção de Playgrounds Card */}
        {(category === 'all' || category === 'laudos') && matchesSearch('Laudo de Playground', 'Laudos técnicos de segurança em áreas de recreação infantil e playgrounds sob a ABNT NBR 16071 partes 1 a 7. Checklist, análise de perigo, prioridades e ART.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Plano de PMOC', 'Plano de Manutenção, Operação e Controle (Lei 13.589/2018). Inclui inventário físico, cronograma mensal de rotinas, checklist técnico sanitário de 18 itens e formulários prontos para uso.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('ART de Manutenção', 'Gere o pacote completo para serviços de manutenção técnica de máquinas, climatização e equipamentos industriais: Memorial Descritivo, Checklist Pré-ART e Relatório Técnico.') && (
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
        {(category === 'all' || category === 'laudos') && matchesSearch('Consultoria PCM', 'Gere o Plano Diretor PCM completo: Diagnóstico de Maturidade ISO 55001, Cronograma PMP de 52 Semanas, Matriz FMEA de ativos e Painel de Indicadores (MTBF, MTTR, Backlog).') && (
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
        {(category === 'all' || category === 'projetos') && matchesSearch('Cálculo Carga Térmica', 'Realize o cálculo de carga térmica de ambientes por fatores. Inclui 8 fontes de calor, quadro resumo, dimensionamento elétrico, requisitos PMOC e anotação de ART.') && (
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
      )}

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
