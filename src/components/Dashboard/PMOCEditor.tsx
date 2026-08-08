import React, { useState } from 'react';
import { PMOCData, PMAirEnvironment, PMOCAppliance, PMOCActivity } from '../../types';
import { 
  Plus, 
  Trash2, 
  Shield, 
  Calendar, 
  Users, 
  Cpu, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  ChevronRight, 
  Settings, 
  Printer, 
  Download,
  Building,
  Wrench,
  Sparkles,
  Info
} from 'lucide-react';

interface PMOCEditorProps {
  data: PMOCData;
  onChange: (newData: PMOCData) => void;
  clientName?: string;
}

const DEFAULT_ACTIVITIES = [
  { id: 'act_1', descricao: 'Limpar e higienizar os filtros de ar (regulação sanitária)', periodicidade: 'Mensal' },
  { id: 'act_2', descricao: 'Substituir filtros descartáveis avariados/colmatados', periodicidade: 'Trimestral' },
  { id: 'act_3', descricao: 'Eliminar sujidade e biofilme nas serpentinas de resfriamento', periodicidade: 'Semestral' },
  { id: 'act_4', descricao: 'Limpar dreno e higienizar bandeja de condensado', periodicidade: 'Mensal' },
  { id: 'act_5', descricao: 'Verificar rotor, rolamentos e hélice de ventilação', periodicidade: 'Trimestral' },
  { id: 'act_6', descricao: 'Inspecionar contatos elétricos e ligações de comando', periodicidade: 'Semestral' },
  { id: 'act_7', descricao: 'Testar sensores de temperatura e calibração de termostato', periodicidade: 'Trimestral' },
  { id: 'act_8', descricao: 'Verificar estanqueidade do circuito de gás refrigerante', periodicidade: 'Semestral' }
];

export default function PMOCEditor({ data, onChange, clientName }: PMOCEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('dados_iniciais');

  // Safety checks to ensure our state never crashes on incomplete objects
  const safeData: PMOCData = {
    empreendimento: {
      nome: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      telefone: '',
      email: '',
      ...data?.empreendimento
    },
    proprietario: {
      nomeRazao: clientName || '',
      cnpj: '',
      ...data?.proprietario
    },
    responsavelTecnico: {
      nomeRazao: '',
      cpfCnpj: '',
      enderecoCompleto: '',
      responsavelTecnico: '',
      profissao: 'Engenheiro Mecânico',
      crea: '',
      cpf: '',
      art: '',
      ...data?.responsavelTecnico
    },
    ambientesClimatizados: data?.ambientesClimatizados || [],
    aparelhos: data?.aparelhos || [],
    finalDocumento: {
      anotacoesGerais: '',
      recomendacoesRt: '',
      respManutencaoNome: '',
      respManutencaoAssinatura: '',
      respPhNome: '',
      respPhAssinatura: '',
      ...data?.finalDocumento
    }
  };

  // Helper helper helper to bubble up state updates
  const updateData = (updater: (prev: PMOCData) => PMOCData) => {
    const updated = updater(safeData);
    onChange(updated);
  };

  // Add environment
  const handleAddEnvironment = () => {
    const newEnv: PMAirEnvironment = {
      id: `env_${Date.now()}`,
      identificacao: 'Novo Ambiente',
      numOcupantesFixo: '2',
      numOcupantesFlutuante: '10',
      areaM2: '20',
      cargaTermica: '12000 BTU/h',
      tagEquipamento: `EQ-${Math.floor(10 + Math.random() * 90)}`
    };
    updateData(prev => ({
      ...prev,
      ambientesClimatizados: [...(prev.ambientesClimatizados || []), newEnv]
    }));
  };

  // Change environment
  const handleEnvChange = (id: string, field: keyof PMAirEnvironment, value: string) => {
    updateData(prev => ({
      ...prev,
      ambientesClimatizados: (prev.ambientesClimatizados || []).map(env => 
        env.id === id ? { ...env, [field]: value } : env
      )
    }));
  };

  // Remove environment
  const handleRemoveEnv = (id: string) => {
    updateData(prev => ({
      ...prev,
      ambientesClimatizados: (prev.ambientesClimatizados || []).filter(env => env.id !== id)
    }));
  };

  // Add Appliance
  const handleAddAppliance = () => {
    const nextNum = (safeData.aparelhos?.length || 0) + 1;
    const padNum = String(nextNum).padStart(2, '0');
    
    // Auto populate activities with default status 'P' (Planned)
    const initialActivities: PMOCActivity[] = DEFAULT_ACTIVITIES.map((act, index) => ({
      id: `act_${Date.now()}_${index}`,
      descricao: act.descricao,
      periodicidade: act.periodicidade,
      statusJan: 'P',
      statusFev: 'P',
      statusMar: 'P',
      statusAbr: 'P',
      statusMai: 'P',
      statusJun: 'P',
      statusJul: 'P',
      statusAgo: 'P',
      statusSet: 'P',
      statusOut: 'P',
      statusNov: 'P',
      statusDez: 'P'
    }));

    const newAp: PMOCAppliance = {
      id: `ap_${Date.now()}`,
      tag: `AR-${padNum}`,
      marca: 'Midea Carrier',
      modelo: 'Split Inverter',
      capacidade: '12000 BTU/h',
      localizacao: 'Escritório',
      tipo: 'Split Hi-Wall',
      atividades: initialActivities
    };

    updateData(prev => ({
      ...prev,
      aparelhos: [...(prev.aparelhos || []), newAp]
    }));

    setActiveTab(`aparelho_${newAp.id}`);
  };

  // Remove Appliance
  const handleRemoveAppliance = (id: string) => {
    if ((safeData.aparelhos || []).length <= 1) {
      alert('O PMOC precisa ter pelo menos 1 aparelho de ar-condicionado cadastrado.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta aba e todos os seus agendamentos?')) {
      const updatedAparelhos = safeData.aparelhos.filter(ap => ap.id !== id);
      updateData(prev => ({
        ...prev,
        aparelhos: updatedAparelhos
      }));
      setActiveTab('dados_iniciais');
    }
  };

  // Update Appliance field
  const handleApplianceChange = (id: string, field: keyof Omit<PMOCAppliance, 'id' | 'atividades'>, value: string) => {
    updateData(prev => ({
      ...prev,
      aparelhos: (prev.aparelhos || []).map(ap => 
        ap.id === id ? { ...ap, [field]: value } : ap
      )
    }));
  };

  // Cycle status: P (Planned) -> E (Executed) -> X (Cancel/NoExec) -> - (Not applicable)
  const cycleStatus = (appId: string, actId: string, monthField: keyof Omit<PMOCActivity, 'id' | 'descricao' | 'periodicidade'>) => {
    const statusCycle = ['P', 'E', 'X', '-'];
    
    updateData(prev => {
      const parentAp = prev.aparelhos?.find(ap => ap.id === appId);
      if (!parentAp) return prev;

      const updatedAp = {
        ...parentAp,
        atividades: (parentAp.atividades || []).map(act => {
          if (act.id !== actId) return act;
          const currentVal = act[monthField] || 'P';
          const nextIndex = (statusCycle.indexOf(currentVal) + 1) % statusCycle.length;
          return {
            ...act,
            [monthField]: statusCycle[nextIndex]
          };
        })
      };

      return {
        ...prev,
        aparelhos: prev.aparelhos.map(ap => ap.id === appId ? updatedAp : ap)
      };
    });
  };

  // Bulk set status for an appliance
  const bulkSetStatus = (appId: string, status: string) => {
    updateData(prev => {
      const parentAp = prev.aparelhos?.find(ap => ap.id === appId);
      if (!parentAp) return prev;

      const updatedAp = {
        ...parentAp,
        atividades: (parentAp.atividades || []).map(act => ({
          ...act,
          statusJan: status,
          statusFev: status,
          statusMar: status,
          statusAbr: status,
          statusMai: status,
          statusJun: status,
          statusJul: status,
          statusAgo: status,
          statusSet: status,
          statusOut: status,
          statusNov: status,
          statusDez: status
        }))
      };

      return {
        ...prev,
        aparelhos: prev.aparelhos.map(ap => ap.id === appId ? updatedAp : ap)
      };
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 space-y-6">
      
      {/* 1. SEAMLESS DYNAMIC TAB NAVIGATION BAR */}
      <div className="bg-slate-100/85 dark:bg-slate-950/40 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-widest px-2 mb-2 block">
          FLUXO DE FORMULÁRIO PMOC:
        </label>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-track-slate-800">
          
          {/* TAB: Dados Iniciais */}
          <button
            type="button"
            onClick={() => setActiveTab('dados_iniciais')}
            className={`px-4.5 py-3 text-xs font-bold font-mono tracking-wide uppercase rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'dados_iniciais'
                ? 'bg-[#134074] text-white shadow shadow-[#134074]/35 scale-102'
                : 'bg-white dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-sky-500 shrink-0" />
            <span>1. Dados Iniciais</span>
          </button>

          {/* DYNAMIC TAB PER APPLIANCE */}
          {safeData.aparelhos?.map((ap, index) => {
            const tabId = `aparelho_${ap.id}`;
            const isSelected = activeTab === tabId;
            return (
              <button
                key={ap.id}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`px-4.5 py-3 text-xs font-bold font-mono tracking-wide uppercase rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#102A43] text-white border border-[#134074] shadow scale-102'
                    : 'bg-white dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Aparelho {String(index + 1).padStart(2, '0')} ({ap.tag || 'Sem TAG'})</span>
              </button>
            );
          })}

          {/* ADD APPLIANCE INTERACTIVE TAB BTN */}
          <button
            type="button"
            onClick={handleAddAppliance}
            className="px-3.5 py-3 text-xs font-bold font-mono tracking-wider uppercase rounded-xl shrink-0 cursor-pointer bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 flex items-center gap-1 transition-all"
            title="Adicionar Novo Aparelho na Próxima Aba"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>+ Adicionar</span>
          </button>

          {/* TAB: Documento Consolidado */}
          <button
            type="button"
            onClick={() => setActiveTab('documento')}
            className={`px-4.5 py-3 text-xs font-bold font-mono tracking-wide uppercase rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 ml-auto ${
              activeTab === 'documento'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-600/35 scale-102 font-heavy'
                : 'bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-950/40 hover:bg-emerald-100/50'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>2. Documento de Saída</span>
          </button>

        </div>
      </div>

      {/* ======================= TAB COMPONENT 1: DADOS INICIAIS ======================= */}
      {activeTab === 'dados_iniciais' && (
        <div className="space-y-6">
          
          {/* Card: Empreendimento */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-[#134074] dark:text-[#4895EF] border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>DADOS DO EMPREENDIMENTO (Sede / Local das Instalações)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Nome do Local (Edifício / Entidade ou Filial) *</label>
                <input
                  type="text"
                  required
                  value={safeData.empreendimento.nome}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, nome: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Condomínio Edifício Trade Center - Sede Recife"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Telefone Geral</label>
                <input
                  type="text"
                  value={safeData.empreendimento.telefone}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, telefone: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: (81) 3224-5566"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Logradouro / Endereço</label>
                <input
                  type="text"
                  value={safeData.empreendimento.endereco}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, endereco: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Av. Governador Agamenon Magalhães"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Número</label>
                <input
                  type="text"
                  value={safeData.empreendimento.numero}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, numero: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: 1205"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Complemento</label>
                <input
                  type="text"
                  value={safeData.empreendimento.complemento}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, complemento: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Bloco A - Salas 10 e 11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Bairro</label>
                <input
                  type="text"
                  value={safeData.empreendimento.bairro}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, bairro: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Derby"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Cidade</label>
                <input
                  type="text"
                  value={safeData.empreendimento.cidade}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, cidade: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-semibold"
                  placeholder="Ex: Recife"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Estado (UF)</label>
                <input
                  type="text"
                  value={safeData.empreendimento.uf}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, uf: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-mono uppercase"
                  placeholder="Ex: PE"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">E-mail Administrativo</label>
                <input
                  type="email"
                  value={safeData.empreendimento.email}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    empreendimento: { ...prev.empreendimento, email: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: adm@condominio.com"
                />
              </div>
            </div>
          </div>

          {/* Card: Proprietario */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-[#134074] dark:text-[#4895EF] border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>DADOS DO PROPRIETÁRIO / LOCATÁRIO DO CONTRATO</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Razão Social OU Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={safeData.proprietario.nomeRazao}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    proprietario: { ...prev.proprietario, nomeRazao: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-medium"
                  placeholder="Ex: Refriservice Soluções S/A"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">CNPJ / CPF do Proprietário *</label>
                <input
                  type="text"
                  required
                  value={safeData.proprietario.cnpj}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    proprietario: { ...prev.proprietario, cnpj: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-mono"
                  placeholder="Ex: 00.334.445/0001-90"
                />
              </div>
            </div>
          </div>

          {/* Card: Responsável Técnico */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>RESPONSÁVEL TÉCNICO ENGENHARIA (Co-assinatura do Laudo)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Nome Profissional do RT *</label>
                <input
                  type="text"
                  required
                  value={safeData.responsavelTecnico.responsavelTecnico}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    responsavelTecnico: { ...prev.responsavelTecnico, responsavelTecnico: e.target.value, nomeRazao: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Vitor Leonardo C. Linhares"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Registro Profissional CREA / UF *</label>
                <input
                  type="text"
                  required
                  value={safeData.responsavelTecnico.crea}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    responsavelTecnico: { ...prev.responsavelTecnico, crea: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-mono"
                  placeholder="Ex: 18222994-PE"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Especialidade / Título Profissional</label>
                <input
                  type="text"
                  value={safeData.responsavelTecnico.profissao}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    responsavelTecnico: { ...prev.responsavelTecnico, profissao: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Engenheiro Mecânico"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Endereço Profissional</label>
                <input
                  type="text"
                  value={safeData.responsavelTecnico.enderecoCompleto}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    responsavelTecnico: { ...prev.responsavelTecnico, enderecoCompleto: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Recife - PE"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Número ART Vinculada</label>
                <input
                  type="text"
                  value={safeData.responsavelTecnico.art}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    responsavelTecnico: { ...prev.responsavelTecnico, art: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white font-mono"
                  placeholder="Ex: ART2026112"
                />
              </div>
            </div>
          </div>

          {/* Card: Ambientes Climatizados table - Perfect context under initial data */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <h4 className="text-xs font-black uppercase font-mono tracking-wide text-[#134074] dark:text-[#4895EF] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>RELAÇÃO DOS AMBIENTES CLIMATIZADOS INTERNOS</span>
              </h4>
              <button
                type="button"
                onClick={handleAddEnvironment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wide uppercase cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Ambiente</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
              Mapeie todos os ambientes e cômodos atendidos pelo sistema de ventilação artificial para verificação de limites sanitários.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-widest text-[#134074] dark:text-[#4895EF] font-mono">
                    <th className="p-3">Compartimento / Célula de Trabalho</th>
                    <th className="p-3 w-32 text-center">Ocupantes Fixos</th>
                    <th className="p-3 w-32 text-center">Ocupantes Flutuantes</th>
                    <th className="p-3 w-32 text-center">Área (M²)</th>
                    <th className="p-3 w-40 text-center">Carga Térmica</th>
                    <th className="p-3 w-40 text-center">TAG de Máquina</th>
                    <th className="p-3 text-right w-16">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900">
                  {safeData.ambientesClimatizados?.map((env) => (
                    <tr key={env.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="text"
                          value={env.identificacao}
                          onChange={(e) => handleEnvChange(env.id, 'identificacao', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2.5 py-1.5 rounded text-xs outline-none text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="number"
                          value={env.numOcupantesFixo}
                          onChange={(e) => handleEnvChange(env.id, 'numOcupantesFixo', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2 py-1.5 rounded text-xs outline-none font-mono text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="number"
                          value={env.numOcupantesFlutuante}
                          onChange={(e) => handleEnvChange(env.id, 'numOcupantesFlutuante', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2 py-1.5 rounded text-xs outline-none font-mono text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="number"
                          value={env.areaM2}
                          onChange={(e) => handleEnvChange(env.id, 'areaM2', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2 py-1.5 rounded text-xs outline-none font-mono text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="text"
                          value={env.cargaTermica}
                          onChange={(e) => handleEnvChange(env.id, 'cargaTermica', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2 py-1.5 rounded text-xs outline-none text-slate-900 dark:text-white"
                          placeholder="Ex: 18000 BTU/h"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800/40">
                        <input
                          type="text"
                          value={env.tagEquipamento}
                          onChange={(e) => handleEnvChange(env.id, 'tagEquipamento', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-750 px-2 py-1.5 rounded text-xs outline-none font-mono uppercase text-slate-900 dark:text-white"
                          placeholder="Ex: AR-01"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveEnv(env.id)}
                          className="p-1.5 text-slate-350 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Remover este ambiente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!safeData.ambientesClimatizados || safeData.ambientesClimatizados.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono italic">
                        Nenhum ambiente adicionado. Clique no botão "+ Adicionar Ambiente" acima para iniciar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB COMPONENT 2: DYNAMIC REPEATABLE APPLIANCES ======================= */}
      {activeTab.startsWith('aparelho_') && (() => {
        const activeAppId = activeTab.replace('aparelho_', '');
        const ap = safeData.aparelhos?.find(a => a.id === activeAppId);
        
        if (!ap) {
          return (
            <div className="py-12 text-center text-slate-400 italic bg-white dark:bg-slate-850 rounded-2xl border border-slate-150 p-6">
              Aparelho pesquisado não encontrado. Por favor, selecione outra aba ou crie um novo aparelho.
            </div>
          );
        }

        return (
          <div className="space-y-6">
            
            {/* Technical Specifications form fields for active device */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#134074] dark:text-[#4895EF] font-mono">
                      PLANO INDIVIDUAL DO EQUIPAMENTO: {ap.tag || 'Sem Tag'}
                    </h4>
                    <p className="text-[10.5px] text-slate-400 font-sans uppercase">
                      Configure as especificações e o diário de manutenções periódicas
                    </p>
                  </div>
                </div>

                {/* Excluir/Trash active device */}
                <button
                  type="button"
                  onClick={() => handleRemoveAppliance(ap.id)}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 dark:hover:bg-rose-950/25 border border-rose-200/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wide cursor-pointer transition-all flex items-center gap-1.5"
                  title="Apagar este aparelho permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Aba</span>
                </button>
              </div>

              {/* Form entries for this machine */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">TAG / Código de Identificação *</label>
                  <input
                    type="text"
                    required
                    value={ap.tag}
                    onChange={(e) => handleApplianceChange(ap.id, 'tag', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs outline-none font-mono uppercase text-slate-900 dark:text-white font-heavy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={ap.marca}
                    onChange={(e) => handleApplianceChange(ap.id, 'marca', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                    placeholder="Ex: Midea Carrier"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Capacidade Térmica</label>
                  <input
                    type="text"
                    value={ap.capacidade}
                    onChange={(e) => handleApplianceChange(ap.id, 'capacidade', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs outline-none font-mono text-slate-900 dark:text-white"
                    placeholder="Ex: 12000 BTU/h"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Localização Física</label>
                  <input
                    type="text"
                    value={ap.localizacao}
                    onChange={(e) => handleApplianceChange(ap.id, 'localizacao', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                    placeholder="Ex: Auditório"
                  />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Tipo de Equipamento</label>
                  <input
                    type="text"
                    value={ap.tipo}
                    onChange={(e) => handleApplianceChange(ap.id, 'tipo', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-900 dark:text-white"
                    placeholder="Ex: Split Hi-Wall"
                  />
                </div>
              </div>

              {/* Matrix Instruction Panel */}
              <div className="bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10 dark:border-amber-900/30 p-3 rounded-xl text-[10.5px] font-mono text-slate-500 dark:text-slate-405 flex gap-2 items-start">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Legenda de Lançamentos de Manutenção:</strong> Clique diretamente sobre os quadradinhos correspondentes aos meses abaixo para ciclar a situação operacional da manutenção periódica programada recomendada:
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[9.5px]">P (Planejado)</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[9.5px]">E (Executado)</span>
                    <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[9.5px]">X (Cancelado)</span>
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded text-[9.5px]">- (Não se Aplica)</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Matrix Sheet */}
              <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
                
                {/* Header operations for quick actions */}
                <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 p-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">
                    CRONOGRAMA DE PLANEJAMENTO E EXECUÇÃO (MÊS A MÊS)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bulkSetStatus(ap.id, 'E')}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    >
                      Tudo Executado (E)
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkSetStatus(ap.id, 'P')}
                      className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/15 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    >
                      Tudo Planejado (P)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[9px] font-mono text-center text-slate-450">
                        <th className="p-3 text-left w-64 text-slate-700 dark:text-slate-300 font-sans text-xs">Rotina / Atividade de Manutenção Corrente</th>
                        <th className="p-2 border-r border-[#0000000a] text-center w-16">Per.</th>
                        <th className="p-1">JAN</th>
                        <th className="p-1">FEV</th>
                        <th className="p-1">MAR</th>
                        <th className="p-1">ABR</th>
                        <th className="p-1">MAI</th>
                        <th className="p-1">JUN</th>
                        <th className="p-1">JUL</th>
                        <th className="p-1">AGO</th>
                        <th className="p-1">SET</th>
                        <th className="p-1">OUT</th>
                        <th className="p-1">NOV</th>
                        <th className="p-1">DEZ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900">
                      {(ap.atividades || []).map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all font-sans">
                          <td className="p-3 border-r border-slate-100 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200" title={act.descricao}>
                            {act.descricao}
                          </td>
                          <td className="p-2 border-r border-slate-100 dark:border-slate-800 text-center text-slate-400 uppercase font-mono text-[10px]">
                            {act.periodicidade}
                          </td>
                          {(['statusJan', 'statusFev', 'statusMar', 'statusAbr', 'statusMai', 'statusJun', 'statusJul', 'statusAgo', 'statusSet', 'statusOut', 'statusNov', 'statusDez'] as const).map((monthField) => {
                            const val = act[monthField] || '-';
                            let badgeColors = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400';
                            if (val === 'E') badgeColors = 'bg-emerald-500 border-emerald-600 text-white font-black';
                            if (val === 'P') badgeColors = 'bg-blue-500 border-blue-600 text-white font-black';
                            if (val === 'X') badgeColors = 'bg-rose-500 border-rose-600 text-white font-semibold';
                            
                            return (
                              <td key={monthField} className="p-1 text-center border-r border-slate-100 dark:border-slate-800/50">
                                <button
                                  type="button"
                                  onClick={() => cycleStatus(ap.id, act.id, monthField)}
                                  className={`w-6.5 h-6.5 rounded flex items-center justify-center text-[10px] font-mono border shadow-sm hover:scale-115 active:scale-95 transition-all text-center mx-auto cursor-pointer ${badgeColors}`}
                                >
                                  {val}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ======================= TAB COMPONENT 3: DOCUMENTO DE COMPLETUDE & CONSOLIDAÇÃO ======================= */}
      {activeTab === 'documento' && (
        <div className="space-y-6 animate-fade-in">

          {/* Configuration and Signatures Setup */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>PARECER CONCLUSIVO E ASSINATURAS DO DOCUMENTO</span>
            </h4>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">Anotações Gerais (Ocorrências sanitárias, etc.)</label>
                <textarea
                  value={safeData.finalDocumento.anotacoesGerais}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    finalDocumento: { ...prev.finalDocumento, anotacoesGerais: e.target.value }
                  }))}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Não foram encontrados pontos críticos de acúmulo de sujidades... A qualidade e controle do ar foram consideradas excelentes."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">Recomendações e Diretrizes de Ação Técnicas do RT</label>
                <textarea
                  value={safeData.finalDocumento.recomendacoesRt}
                  onChange={(e) => updateData(prev => ({
                    ...prev,
                    finalDocumento: { ...prev.finalDocumento, recomendacoesRt: e.target.value }
                  }))}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-slate-900 dark:text-white"
                  placeholder="Ex: Seguir rigorosamente o cronograma de troca de filtros sintéticos de poliéster descartáveis e manter lavagem periódicas das serpentinas."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="text-[9px] font-black uppercase font-mono text-[#134074] dark:text-[#4895EF] tracking-wider block">RESPONSÁVEL TÉCNICO MANUTENÇÃO (Engenheiro RE)</span>
                  <input
                    type="text"
                    value={safeData.finalDocumento.respManutencaoNome}
                    onChange={(e) => updateData(prev => ({
                      ...prev,
                      finalDocumento: { ...prev.finalDocumento, respManutencaoNome: e.target.value }
                    }))}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 outline-none font-medium text-xs text-slate-900 dark:text-white"
                    placeholder="Nome do Engenheiro / Inspetor Responsável"
                  />
                  <input
                    type="text"
                    value={safeData.finalDocumento.respManutencaoAssinatura}
                    onChange={(e) => updateData(prev => ({
                      ...prev,
                      finalDocumento: { ...prev.finalDocumento, respManutencaoAssinatura: e.target.value }
                    }))}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1 outline-none text-[11px] text-slate-400 font-mono"
                    placeholder="Registro / Certificação (Ex: CREA-PE Assinatura Eletrônica)"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="text-[9px] font-black uppercase font-mono text-emerald-600 dark:text-emerald-400 tracking-wider block">RESPONSÁVEL ASSINATURA FÍSICO-QUÍMICA (Qualidade Biológica)</span>
                  <input
                    type="text"
                    value={safeData.finalDocumento.respPhNome}
                    onChange={(e) => updateData(prev => ({
                      ...prev,
                      finalDocumento: { ...prev.finalDocumento, respPhNome: e.target.value }
                    }))}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 outline-none font-medium text-xs text-slate-900 dark:text-white"
                    placeholder="Nome do Químico / Biólogo / Sanitarista"
                  />
                  <input
                    type="text"
                    value={safeData.finalDocumento.respPhAssinatura}
                    onChange={(e) => updateData(prev => ({
                      ...prev,
                      finalDocumento: { ...prev.finalDocumento, respPhAssinatura: e.target.value }
                    }))}
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1 outline-none text-[11px] text-slate-400 font-mono"
                    placeholder="Registro / Profissional (Ex: CRQ-041913/PE)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Information banner on PDF rendering */}
          <div className="bg-gradient-to-r from-[#1D3557] to-[#134074] text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-white/10 rounded-xl text-sky-300">
                <Printer className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider">PREVISÃO CONSOLIDADA DOS LAUDOS E PLANILHAS</h5>
                <p className="text-[11px] text-slate-300 leading-normal max-w-2xl font-sans">
                  Abaixo está o relatório PMOC unificado, estruturado para impressão padrão A4 (com quebras automáticas). Clique em <strong>"Imprimir PMOC Completo"</strong> ou use <strong>Ctrl + P</strong> para emitir o relatório técnico definitivo para a Vigilância Sanitária em formato PDF.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider uppercase shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow shadow-emerald-700/40"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir PMOC Completo</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* SPREADSHEET CONSOLIDATED RENDERER CONTAINER */}
          {/* ========================================================================= */}
          <div className="bg-white text-slate-950 p-6 md:p-8 border border-slate-300 shadow-xl rounded-2xl overflow-x-auto space-y-6 max-w-full font-serif leading-tight">
            
            {/* Sheet Banner Header exactly like standard published spreadsheet */}
            <div className="border border-black flex justify-between items-stretch">
              <div className="p-4 border-r border-black flex flex-col justify-center items-center text-center w-56 font-sans">
                <div className="text-xl font-bold tracking-tight text-slate-950">VL ENGENHARIA</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#134074] mt-0.5">Laudos Técnicos & PMOC</div>
              </div>
              <div className="p-4 border-r border-black flex-1 text-center flex flex-col justify-center">
                <div className="text-xs md:text-sm font-black uppercase tracking-tight text-slate-950 text-wrap leading-tight">
                  SISTEMA DE CONTROLE SANITÁRIO - PMOC (PORTARIA MINISTÉRIO DA SAÚDE Nº 3.523)
                </div>
                <div className="text-[9.5px] uppercase font-bold text-slate-550 mt-1 font-mono">
                  Sincronizado via Formulário e Planilhas de Controle Técnico
                </div>
              </div>
              <div className="p-3 flex flex-col justify-center text-right w-48 text-[9px] font-mono font-medium">
                <div>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                <div>A.R.T Engenheiro: {safeData.responsavelTecnico.art || 'Constante no Laudo'}</div>
              </div>
            </div>

            {/* Sec 1: Dados do Empreendimento */}
            <div className="border border-black overflow-hidden font-sans">
              <div className="bg-slate-100 font-extrabold p-1.5 uppercase font-mono text-[9.5px] border-b border-black tracking-wider text-slate-800">
                1. DADOS DO EMPREENDIMENTO CLIMATIZADO (Local da Instalação)
              </div>
              <div className="grid grid-cols-2 text-[10.5px] border-b border-black">
                <div className="p-2 border-r border-black">
                  <strong>Nome (Edifício/Entidade):</strong> {safeData.empreendimento.nome || 'Não Indicado'}
                </div>
                <div className="p-2">
                  <strong>Telefone Comercial:</strong> {safeData.empreendimento.telefone || 'Não Informado'}
                </div>
              </div>
              <div className="grid grid-cols-2 text-[10.5px] border-b border-black">
                <div className="p-2 border-r border-black">
                  <strong>Bairro:</strong> {safeData.empreendimento.bairro || 'Sem Informação'}
                </div>
                <div className="p-2">
                  <strong>Endereço Completo:</strong> {safeData.empreendimento.endereco || 'Ver Laudos principais'}, nº {safeData.empreendimento.numero || ''} {safeData.empreendimento.complemento ? `(${safeData.empreendimento.complemento})` : ''}
                </div>
              </div>
              <div className="grid grid-cols-3 text-[10.5px]">
                <div className="p-2 border-r border-black font-semibold">
                  <strong>Cidade:</strong> {safeData.empreendimento.cidade || 'Recife'}
                </div>
                <div className="p-2 border-r border-black font-mono">
                  <strong>Estado (UF):</strong> {safeData.empreendimento.uf || 'PE'}
                </div>
                <div className="p-2">
                  <strong>E-mail de Contato:</strong> {safeData.empreendimento.email || 'Não Cadastrado'}
                </div>
              </div>
            </div>

            {/* Sec 2: Proprietário */}
            <div className="border border-black overflow-hidden font-sans">
              <div className="bg-slate-100 font-extrabold p-1.5 uppercase font-mono text-[9.5px] border-b border-black tracking-wider text-slate-800">
                2. IDENTIFICAÇÃO DO PROPRIETÁRIO / LOCATÁRIO DO CONTRATO
              </div>
              <div className="grid grid-cols-2 text-[10.5px]">
                <div className="p-2 border-r border-black">
                  <strong>Nome / Razão Social:</strong> {safeData.proprietario.nomeRazao || 'Não Indicado'}
                </div>
                <div className="p-2">
                  <strong>Inscrição CNPJ / CPF:</strong> {safeData.proprietario.cnpj || 'Sob-registro'}
                </div>
              </div>
            </div>

            {/* Sec 3: Responsável Técnico */}
            <div className="border border-black overflow-hidden font-sans">
              <div className="bg-slate-100 font-extrabold p-1.5 uppercase font-mono text-[9.5px] border-b border-black tracking-wider text-slate-800">
                3. ENGENHEIRO TÉCNICO MECÂNICO CONCEDENTE
              </div>
              <div className="grid grid-cols-2 text-[10.5px] border-b border-black">
                <div className="p-2 border-r border-black">
                  <strong>Responsável Técnico (RT):</strong> {safeData.responsavelTecnico.responsavelTecnico || 'Vitor Leonardo C. Linhares'}
                </div>
                <div className="p-2">
                  <strong>Habilitação / Profissão:</strong> {safeData.responsavelTecnico.profissao || 'Engenheiro Mecânico'}
                </div>
              </div>
              <div className="grid grid-cols-3 text-[10.5px]">
                <div className="p-2 border-r border-black">
                  <strong>CREA / Visto Profissional PE:</strong> {safeData.responsavelTecnico.crea || 'N/A'}
                </div>
                <div className="p-2 border-r border-black">
                  <strong>Número de A.R.T correspondente:</strong> {safeData.responsavelTecnico.art || 'Consignado'}
                </div>
                <div className="p-2">
                  <strong>Local / Cidade de Atuação:</strong> {safeData.responsavelTecnico.enderecoCompleto || 'Recife, PE'}
                </div>
              </div>
            </div>

            {/* Sec 4: Relação de ambientes climatizados registrados */}
            <div className="border border-black font-sans">
              <div className="bg-slate-100 font-extrabold p-1.5 uppercase font-mono text-[9.5px] border-b border-black tracking-wider text-slate-800">
                4. RELAÇÃO DOS COMPARTIMENTOS AMBIENTAIS CLIMATIZADOS INTERNOS
              </div>
              <table className="w-full text-[10.5px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-black font-bold uppercase text-[8.5px] font-mono text-center">
                    <th className="p-2 text-left border-r border-black">Identificação do Compartimento</th>
                    <th className="p-2 border-r border-black w-24">Ocupantes Fixos</th>
                    <th className="p-2 border-r border-black w-24">Ocupantes Flutuantes</th>
                    <th className="p-2 border-r border-black w-24">Área Interna (M²)</th>
                    <th className="p-2 border-r border-black w-28">Capacidade Térmica</th>
                    <th className="p-2 w-28">Máquina Atendida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-center text-slate-900">
                  {safeData.ambientesClimatizados?.map((env) => (
                    <tr key={env.id} className="text-[10px]">
                      <td className="p-2 text-left border-r border-black font-medium">{env.identificacao}</td>
                      <td className="p-2 border-r border-black font-mono">{env.numOcupantesFixo}</td>
                      <td className="p-2 border-r border-black font-mono">{env.numOcupantesFlutuante}</td>
                      <td className="p-2 border-r border-black font-mono">{env.areaM2} m²</td>
                      <td className="p-2 border-r border-black">{env.cargaTermica}</td>
                      <td className="p-2 font-mono uppercase font-bold">{env.tagEquipamento}</td>
                    </tr>
                  ))}
                  {(!safeData.ambientesClimatizados || safeData.ambientesClimatizados.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center italic text-slate-400">Nenhum compartimento inserido neste PMOC</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CSS Print helper: Page breaker */}
            <div className="print:page-break-before py-3" />

            {/* Sec 5: LOOP CONSOLIDADO DE TODOS OS APARELHOS NO RELATÓRIO TÉCNICO */}
            <div className="space-y-6">
              {safeData.aparelhos?.map((ap, idx) => (
                <div key={ap.id} className="border border-black font-sans overflow-hidden bg-white">
                  
                  {/* Custom Header for each item */}
                  <div className="bg-slate-100 font-extrabold p-2 uppercase font-mono text-[9.5px] border-b border-black tracking-wider flex justify-between tracking-tight text-slate-900">
                    <span>APARELHO {String(idx + 1).padStart(2, '0')} - FICHA PROGRAMADA DE MANUTENÇÃO PERIÓDICA</span>
                    <span>TAG CENTRAL: {ap.tag || 'SOB-REGISTRO'}</span>
                  </div>

                  {/* Appliance details row */}
                  <div className="grid grid-cols-4 text-[10.5px] border-b border-black bg-slate-50">
                    <div className="p-2 border-r border-black">
                      <strong>Equipamento:</strong> {ap.tipo || 'Split Hi-Wall'}
                    </div>
                    <div className="p-2 border-r border-black">
                      <strong>Marca do Equipamento:</strong> {ap.marca || 'Carrier'}
                    </div>
                    <div className="p-2 border-r border-black">
                      <strong>Capacidade Nominal:</strong> {ap.capacidade || '18000 BTU/h'}
                    </div>
                    <div className="p-2">
                      <strong>Localização no Empreendimento:</strong> {ap.localizacao || 'Área Comum'}
                    </div>
                  </div>

                  {/* Activities list for this printer ready page */}
                  <table className="w-full text-[9px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black font-bold uppercase text-[8px] font-mono text-center">
                        <th className="p-2 text-left font-sans text-[10px]">Rotinas Periódicas de Inspeção Sanitária e Física</th>
                        <th className="p-1 border-r border-l border-black w-14">Per.</th>
                        <th className="p-1 border-r border-black w-8">JAN</th>
                        <th className="p-1 border-r border-black w-8">FEV</th>
                        <th className="p-1 border-r border-black w-8">MAR</th>
                        <th className="p-1 border-r border-black w-8">ABR</th>
                        <th className="p-1 border-r border-black w-8">MAI</th>
                        <th className="p-1 border-r border-black w-8">JUN</th>
                        <th className="p-1 border-r border-black w-8">JUL</th>
                        <th className="p-1 border-r border-black w-8">AGO</th>
                        <th className="p-1 border-r border-black w-8">SET</th>
                        <th className="p-1 border-r border-black w-8">OUT</th>
                        <th className="p-1 border-r border-black w-8">NOV</th>
                        <th className="p-1 w-8">DEZ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-center font-sans">
                      {(ap.atividades || []).map((act) => (
                        <tr key={act.id} className="text-slate-900">
                          <td className="p-2 text-left border-r border-black font-medium">{act.descricao}</td>
                          <td className="p-1 border-r border-black text-[#555] uppercase font-mono text-[8.5px]">{act.periodicidade}</td>
                          
                          {(['statusJan', 'statusFev', 'statusMar', 'statusAbr', 'statusMai', 'statusJun', 'statusJul', 'statusAgo', 'statusSet', 'statusOut', 'statusNov', 'statusDez'] as const).map((mKey) => (
                            <td key={mKey} className="p-1 font-mono font-bold border-r border-slate-300">
                              {act[mKey] === 'E' && <span className="text-emerald-700 bg-emerald-100 px-1 rounded-sm border border-emerald-300 font-extrabold text-[8.5px]">E</span>}
                              {act[mKey] === 'P' && <span className="text-blue-700 bg-blue-100 px-1 rounded-sm border border-blue-300 font-extrabold text-[8.5px]">P</span>}
                              {act[mKey] === 'X' && <span className="text-red-700 bg-red-100 px-1 rounded-sm border border-red-350 text-[8.5px]">X</span>}
                              {act[mKey] === '-' && <span className="text-slate-400 font-normal text-[8px]">-</span>}
                              {!act[mKey] && <span className="text-slate-400">-</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Sec 6: Notas de Rodapé e Assinaturas */}
            <div className="border border-black font-sans rounded-xl overflow-hidden print:page-break-before">
              <div className="bg-slate-100 font-extrabold p-2 uppercase font-mono text-[9.5px] border-b border-black tracking-wider text-slate-800">
                6. PARECER CONCLUSIVO E TERMO DE COMPROMISSO SANITÁRIO DO RESPONSÁVEL TÉCNICO
              </div>
              <div className="p-3.5 space-y-4 text-[10px] leading-relaxed">
                <div>
                  <strong>Ocorrências, Notas e Diário Geral do Sistema de Ar Condicionado:</strong>
                  <p className="p-2.5 border border-slate-300 rounded bg-slate-50 mt-1 italic text-slate-800 font-serif leading-tight">
                    {safeData.finalDocumento.anotacoesGerais || 'Não constam ocorrências críticas ambientais no período avaliado. Todas as máquinas estão em perfeita conformidade sanitária.'}
                  </p>
                </div>

                <div>
                  <strong>Dúbias / Recomendações Críticas do Corpo Técnico Operacional do RT:</strong>
                  <p className="p-2.5 border border-slate-300 rounded bg-slate-50 mt-1 italic text-slate-800 font-serif leading-tight">
                    {safeData.finalDocumento.recomendacoesRt || 'Manter a substituição sistemática dos eixos de filtros descartáveis a cada 3 meses e monitoria integrada dos índices de dióxido de carbono.'}
                  </p>
                </div>

                {/* Duas assinaturas do laudo */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-slate-900">
                  <div className="space-y-3">
                    <div className="border-b border-black pb-2 mx-auto max-w-[280px]">
                      <span className="font-serif italic text-blue-905 font-bold tracking-wide block">
                        {safeData.finalDocumento.respManutencaoAssinatura || 'Concedente de Manutenção'}
                      </span>
                    </div>
                    <div>
                      <strong className="block text-xs">{safeData.finalDocumento.respManutencaoNome || 'Vitor Leonardo C. Linhares'}</strong>
                      <span className="text-[9px] text-slate-500 font-mono">RESPONSÁVEL OPERACIONAL DO PLANO (CREA / REG)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-b border-black pb-2 mx-auto max-w-[280px]">
                      <span className="font-serif italic text-blue-905 font-bold tracking-wide block">
                        {safeData.finalDocumento.respPhAssinatura || 'Laudo Operacional PH'}
                      </span>
                    </div>
                    <div>
                      <strong className="block text-xs">{safeData.finalDocumento.respPhNome || 'PH Especialista em Qualidade Biológica'}</strong>
                      <span className="text-[9px] text-slate-500 font-mono">RESPONSÁVEL ANALÍTICO FÍSICO-QUÍMICO (CRQ)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
