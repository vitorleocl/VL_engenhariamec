/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LaudoData, ClientData, EquipmentData, LaudoStatus, ChecklistData } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, X, ClipboardCopy, Send, Save, FileText, Upload, HelpCircle, Eye, Shield, Clipboard, Printer } from 'lucide-react';
import PMOCEditor from './PMOCEditor';
import Logo from '../Logo';
import { exportToWord } from '../../lib/pdfUtils';
import signatureVitor from '../../assets/images/assinatura_vitor_1784295142175.jpg';

interface LaudoManagerProps {
  laudos?: LaudoData[];
  clients?: ClientData[];
  equipments?: EquipmentData[];
  loading?: boolean;
  onDataChanged?: () => void;
}

export default function LaudoManager({
  laudos: propLaudos,
  clients: propClients,
  equipments: propEquipments,
  loading: propLoading,
  onDataChanged
}: LaudoManagerProps = {}) {
  const [laudos, setLaudos] = useState<LaudoData[]>(propLaudos || []);
  const [clients, setClients] = useState<ClientData[]>(propClients || []);
  const [equipments, setEquipments] = useState<EquipmentData[]>(propEquipments || []);
  
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');
  const [printingLaudo, setPrintingLaudo] = useState<LaudoData | null>(null);
  const [blankSignatureLaudo, setBlankSignatureLaudo] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const getInitialPmocData = (clientId?: string) => {
    const matchedClient = clients.find(c => c.id === clientId);
    return {
      empreendimento: {
        nome: matchedClient ? matchedClient.company : '',
        endereco: matchedClient ? matchedClient.address || '' : '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        telefone: matchedClient ? matchedClient.phone || '' : '',
        email: matchedClient ? matchedClient.email || '' : '',
      },
      proprietario: {
        nomeRazao: matchedClient ? matchedClient.company : '',
        cnpj: matchedClient ? matchedClient.cnpj || '' : '',
      },
      responsavelTecnico: {
        nomeRazao: 'Vitor Leonardo Cordeiro Linhares',
        cpfCnpj: '182.229.949-01',
        enderecoCompleto: 'Recife, Pernambuco',
        responsavelTecnico: 'Vitor Leonardo Cordeiro Linhares',
        profissao: 'Engenheiro Mecânico',
        crea: '18222994-PE',
        cpf: '182.229.949-01',
        art: currentLaudo?.art || '',
      },
      ambientesClimatizados: [
        { id: 'env_1', identificacao: 'Diretoria Sede', numOcupantesFixo: '5', numOcupantesFlutuante: '15', areaM2: '45', cargaTermica: '36000 BTU/h', tagEquipamento: 'AC-DIR-01' }
      ],
      aparelhos: [
        {
          id: 'ap_1',
          tag: 'AC-DIR-01',
          marca: 'Springer Midea',
          modelo: 'Split Hi-Wall',
          capacidade: '36000 BTU/h',
          localizacao: 'Diretoria Sede',
          tipo: 'Split',
          atividades: [
            { id: 'act_1', descricao: 'Limpar e higienizar os filtros de ar (regulação sanitária)', periodicidade: 'Mensal', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' },
            { id: 'act_2', descricao: 'Substituir filtros descartáveis avariados/colmatados', periodicidade: 'Trimestral', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' },
            { id: 'act_3', descricao: 'Eliminar sujidade e biofilme nas serpentinas de resfriamento', periodicidade: 'Semestral', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' },
            { id: 'act_4', descricao: 'Limpar dreno e higienizar bandeja de condensado', periodicidade: 'Mensal', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' },
            { id: 'act_5', descricao: 'Verificar rotor, rolamentos e hélice de ventilação', periodicidade: 'Trimestral', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' },
            { id: 'act_6', descricao: 'Inspecionar contatos elétricos e ligações de comando', periodicidade: 'Semestral', statusJan: 'P', statusFev: 'P', statusMar: 'P', statusAbr: 'P', statusMai: 'P', statusJun: 'P', statusJul: 'P', statusAgo: 'P', statusSet: 'P', statusOut: 'P', statusNov: 'P', statusDez: 'P' }
          ]
        }
      ],
      finalDocumento: {
        anotacoesGerais: 'Sistema de climatização opera em conformidade com as diretrizes da ANVISA RE 09 e Portaria 3523.',
        recomendacoesRt: 'Agendar manutenções periódicas regulares e manter o livro de ocorrências atualizado mensalmente.',
        respManutencaoNome: 'Técnico de Refrigeração Residente',
        respManutencaoAssinatura: 'Assinado Eletronicamente',
        respPhNome: 'Vitor Leonardo Cordeiro Linhares',
        respPhAssinatura: 'Assinado Eletronicamente (Engenheiro Mecânico)',
      }
    };
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLaudo, setCurrentLaudo] = useState<Partial<LaudoData> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([
    'Adequação à NR-12',
    'Reclassificação de Monta',
    'PMOC (Climatização)',
    'Laudo de Brinquedos e Playgrounds',
    'Inspeção de Caminhão Munck e Guindaste',
    'Laudo de Máquinas Pesadas e Ruído'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Dynamic Risk Appreciation State variables for HRN
  const [hrnLo, setHrnLo] = useState<number>(1.0);
  const [hrnFe, setHrnFe] = useState<number>(5.0);
  const [hrnDo, setHrnDo] = useState<number>(5.0);
  const [hrnNp, setHrnNp] = useState<number>(1.0);
  const [hrnAcoesText, setHrnAcoesText] = useState<string>('');

  const getHrnScore = () => {
    return Number((hrnLo * hrnFe * hrnDo * hrnNp).toFixed(2));
  };

  const getHrnDetails = (score: number) => {
    if (score <= 1) return { label: 'Aceitável', color: 'text-green-600 bg-green-500/10 border-green-500/20', desc: 'Risco insignificante. Não requer intervenção urgente.' };
    if (score <= 5) return { label: 'Mínimo', color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20', desc: 'Muito baixo. Monitorar em manutenções programadas.' };
    if (score <= 10) return { label: 'Baixo', color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20', desc: 'Médio-baixo. Adotar proteções coletivas leves.' };
    if (score <= 50) return { label: 'Significativo', color: 'text-orange-600 bg-orange-500/10 border-orange-500/20', desc: 'Médio. Requer instalação de enclausuramentos ou travas mecânicas.' };
    if (score <= 100) return { label: 'Alto', color: 'text-red-600 bg-red-500/10 border-red-500/20', desc: 'Alto risco. Implementar intertravamentos elétricos categoria 4.' };
    if (score <= 500) return { label: 'Muito Alto', color: 'text-rose-700 bg-rose-500/10 border-rose-500/20', desc: 'Altíssimo risco. Paralisar se possível ou adequar imediatamente.' };
    return { label: 'Extremo / Crítico', color: 'text-purple-700 bg-purple-500/15 border-purple-500/30 animate-pulse', desc: 'Risco catastrófico de morte! Interdição imediata exigida conforme NR-12!' };
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const cleanCat = newCategory.trim();
    if (categories.includes(cleanCat)) {
      alert('Esta categoria já existe!');
      return;
    }

    const updated = [...categories, cleanCat];
    setCategories(updated);
    setCurrentLaudo(curr => curr ? { ...curr, categoria: cleanCat } : null);
    setNewCategory('');
    setShowAddCategory(false);

    try {
      if (isRealFirebase) {
        const catId = 'cat_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'laudo_categories', catId), { name: cleanCat, createdAt: new Date().toISOString() });
      } else {
        localStorage.setItem('laudo_categories', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error saving category to database:', err);
    }
  };
  
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : false);
  const [uploading, setUploading] = useState<string | null>(null); // 'pdf' | 'image' | 'video' | null
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (propLaudos) setLaudos(propLaudos);
    if (propClients) setClients(propClients);
    if (propEquipments) setEquipments(propEquipments);
    if (propLoading !== undefined) setLoading(propLoading);
  }, [propLaudos, propClients, propEquipments, propLoading]);

  useEffect(() => {
    if (!propLaudos) {
      loadData();
    }
  }, [propLaudos]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const [querySnapshot, clientsSnap, eqSnap, catSnap, checklistsSnap] = await Promise.all([
          getDocs(collection(db, 'laudos')),
          getDocs(collection(db, 'clients')),
          getDocs(collection(db, 'equipments')),
          getDocs(collection(db, 'laudo_categories')).catch(err => {
            console.warn('Could not load custom categories, using empty:', err);
            return { forEach: () => {} } as any;
          }),
          getDocs(collection(db, 'checklists')).catch(err => {
            console.warn('Could not load checklists, using empty:', err);
            return { forEach: () => {} } as any;
          })
        ]);

        const lArray: LaudoData[] = [];
        querySnapshot.forEach((docSnap) => lArray.push(docSnap.data() as LaudoData));
        setLaudos(lArray);

        const cliArray: ClientData[] = [];
        clientsSnap.forEach((docSnap) => cliArray.push(docSnap.data() as ClientData));
        setClients(cliArray);

        const eqArray: EquipmentData[] = [];
        eqSnap.forEach((docSnap) => eqArray.push(docSnap.data() as EquipmentData));
        setEquipments(eqArray);

        const chkArray: ChecklistData[] = [];
        checklistsSnap.forEach((docSnap) => chkArray.push(docSnap.data() as ChecklistData));
        setChecklists(chkArray);

        const catArray: string[] = [];
        catSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name) catArray.push(data.name);
        });
        if (catArray.length > 0) {
          setCategories(prev => Array.from(new Set([...prev, ...catArray])));
        }
      } else {
        setLaudos(mockDb.getLaudos());
        setClients(mockDb.getClients());
        setEquipments(mockDb.getEquipments());
        setChecklists(mockDb.getChecklists());

        // Load mock categories
        const savedCats = localStorage.getItem('laudo_categories');
        if (savedCats) {
          try {
            const parsed = JSON.parse(savedCats);
            setCategories(prev => Array.from(new Set([...prev, ...parsed])));
          } catch (_) {}
        }
      }
      onDataChanged?.();
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'laudos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentLaudo?.numero || !currentLaudo?.clientId || !currentLaudo?.equipmentId) {
      setError('Por favor, preencha todos os campos obrigatórios (*): Número do Documento, Cliente Responsável, e Ativo Tecnológico.');
      return;
    }

    setLoading(true);
    const laudoId = currentLaudo.id || 'laudo_' + Math.random().toString(36).substr(2, 9);
    const matchedClient = clients.find(c => c.id === currentLaudo.clientId);
    const matchedEq = equipments.find(eq => eq.id === currentLaudo.equipmentId);

    const isNr12 = currentLaudo.categoria?.toLowerCase().includes('nr-12') || currentLaudo.categoria?.toLowerCase().includes('nr12');
    const hrnScore = getHrnScore();
    const hrnDetails = getHrnDetails(hrnScore);
    const linkedChki = checklists.find(c => c.id === selectedChecklistId);

    const saveObj: LaudoData = {
      id: laudoId,
      numero: currentLaudo.numero,
      clientId: currentLaudo.clientId,
      clientName: matchedClient ? matchedClient.company : 'Cliente Desconhecido',
      equipmentId: currentLaudo.equipmentId,
      equipmentModel: matchedEq ? `${matchedEq.type} (${matchedEq.model})` : 'Equipamento Desconhecido',
      dateInspection: currentLaudo.dateInspection || new Date().toISOString().split('T')[0],
      rt: 'Vitor Leonardo Cordeiro Linhares',
      art: currentLaudo.art || '',
      status: currentLaudo.status || LaudoStatus.EM_ELABORACAO,
      pdfUrl: currentLaudo.pdfUrl || '',
      imageUrl: currentLaudo.imageUrl || '',
      videoUrl: currentLaudo.videoUrl || '',
      createdAt: currentLaudo.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoria: currentLaudo.categoria || 'Adequação à NR-12',
      apreciacaoRisco: isNr12 ? {
        hrnScore: hrnScore,
        classificacao: hrnDetails.label,
        loValue: hrnLo,
        feValue: hrnFe,
        doValue: hrnDo,
        npValue: hrnNp,
        acoesRecomendadas: hrnAcoesText,
        zonaPerigo: hrnDetails.desc
      } : undefined,
      pmocData: currentLaudo.categoria === 'PMOC (Climatização)' ? (currentLaudo.pmocData || getInitialPmocData(currentLaudo.clientId)) : undefined,
      linkedChecklistId: selectedChecklistId || undefined,
      linkedChecklistData: linkedChki || undefined
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout_error')), 5000)
    );

    try {
      if (isRealFirebase) {
        await Promise.race([
          setDoc(doc(db, 'laudos', laudoId), saveObj),
          timeoutPromise
        ]);
      }
      mockDb.saveLaudo(saveObj);
      setModalOpen(false);
      setSuccess('Alterações salvas com sucesso');
      setTimeout(() => setSuccess(null), 4500);
      loadLaudoAndSync();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Erro de permissão ou conexão ao salvar seu laudo de engenharia no Firestore.';
      if (err.message === 'timeout_error') {
        errMsg = 'A gravação de dados expirou (Timeout de 5s). O Google Firestore parece estar inacessível ou bloqueado por cookies de terceiros neste iFrame. Ative o "Modo Sandbox Offline" no menu lateral para salvar localmente sem restrições.';
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            errMsg = `Erro de Permissão (${parsed.operationType}): ${parsed.error}. Apenas engenheiros do nível 'GESTÃO' podem emitir laudos técnicos no Firestore.`;
          }
        } catch (_) {
          if (err.message) errMsg = err.message;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadLaudoAndSync = () => {
    loadData();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'laudos', id));
      } else {
        mockDb.deleteLaudo(id);
      }
      setSuccess('Laudo técnico removido com sucesso!');
      setTimeout(() => setSuccess(null), 4500);
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `laudos/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate file upload with visual feedback
  const handleUploadSimulate = (type: 'pdf' | 'image' | 'video') => {
    setUploading(type);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const docName = type === 'pdf' ? `/inspecoes/laudo_${Date.now()}.pdf` : type === 'image' ? `/fotos/diag_${Date.now()}.png` : `/videos/diag_${Date.now()}.mp4`;
            setCurrentLaudo(current => ({
              ...current,
              [`${type}Url`]: docName
            }));
            setUploading(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const filtered = laudos.filter(l =>
    l.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.equipmentModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.art.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold font-mono tracking-wide uppercase shadow-sm animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-100 md:text-slate-900 dark:text-white">Módulo de Gestão de Laudos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Emita laudos periciais de engenharia mecânica, anexe documentos e asocie as fardas ARTs</p>
        </div>

        <button
          onClick={() => {
            setCurrentLaudo({
              numero: `LT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              clientId: clients[0]?.id || '',
              equipmentId: equipments[0]?.id || '',
              status: LaudoStatus.EM_ELABORACAO,
              dateInspection: new Date().toISOString().split('T')[0],
              art: `PE-18222994-${Math.floor(10 + Math.random() * 89)}`,
              categoria: 'Adequação à NR-12'
            });
            setError(null);
            setHrnLo(1.0);
            setHrnFe(5.0);
            setHrnDo(5.0);
            setHrnNp(1.0);
            setHrnAcoesText('');
            setSelectedChecklistId('');
            setModalOpen(true);
          }}
          disabled={clients.length === 0 || equipments.length === 0}
          className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer self-start disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Laudo</span>
        </button>
      </div>

      {/* Constraints check and warning notices */}
      {(clients.length === 0 || equipments.length === 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs font-mono">
          Alerta: Para emitir um laudo, você precisa possuir pelo menos um Cliente e um Equipamento associado cadastrados em seus respectivos módulos.
        </div>
      )}

      {/* Search Input bar */}
      <div className="relative max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar por nº laudo, cliente, equipamento ou ART..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Table container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
            <span>Processando dados...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhum laudo mecânico localizado em sua base.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Nº Laudo / ART</th>
                  <th className="p-4">Cliente / Máquina</th>
                  <th className="p-4">Vistoria</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Arquivos</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {filtered.map((laudo) => (
                  <tr key={laudo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">{laudo.numero}</div>
                      <div className="text-xs text-slate-500 font-medium pb-1">ART: {laudo.art || 'Não declarada'}</div>
                      {laudo.categoria && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-slate-100 dark:bg-slate-900 text-[#134074] dark:text-[#4895EF] border border-[#134074]/15">
                          {laudo.categoria}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{laudo.clientName}</div>
                      <div className="text-xs text-slate-500 font-sans pb-1">{laudo.equipmentModel}</div>
                      {laudo.apreciacaoRisco && (
                        <div className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold px-2 py-0.5 rounded border border-rose-500/20">
                          <span>HRN: {laudo.apreciacaoRisco.hrnScore}</span>
                          <span>•</span>
                          <span className="uppercase">{laudo.apreciacaoRisco.classificacao}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 space-y-0.5 text-slate-600 dark:text-slate-350 text-xs">
                      <div className="font-medium font-mono">{laudo.dateInspection}</div>
                      <div className="text-[10px] text-slate-400 select-all truncate max-w-xs">{laudo.rt}</div>
                    </td>
                    <td className="p-4">
                      {laudo.status === LaudoStatus.EMITIDO ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black font-mono uppercase">
                          EMITIDO / ATIVO
                        </span>
                      ) : laudo.status === LaudoStatus.VENCIDO ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black font-mono uppercase animate-pulse">
                          VENCIDO
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono uppercase">
                          EM ELABORAÇÃO
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-y-1">
                      {laudo.pdfUrl ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#134074] dark:text-[#4895EF] hover:underline cursor-pointer">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>Pristine.pdf</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Sem PDF anexado</span>
                      )}
                      {(laudo.imageUrl || laudo.videoUrl) && (
                        <div className="flex gap-2">
                          {laudo.imageUrl && <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.5 rounded font-mono border border-slate-200/40">Foto</span>}
                          {laudo.videoUrl && <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.5 rounded font-mono border border-slate-200/40">Vídeo</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      {deleteConfirmId === laudo.id ? (
                        <div className="flex items-center justify-end gap-1.5 inline-flex">
                          <span className="text-[10px] text-rose-500 font-bold font-mono uppercase">Excluir?</span>
                          <button
                            onClick={() => {
                              handleDelete(laudo.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-black bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors cursor-pointer"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[10px] font-black bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-750 dark:text-slate-300 rounded transition-colors cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 inline-flex">
                          {laudo.categoria === 'PMOC (Climatização)' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setError(null);
                                setCurrentLaudo(laudo);
                                setModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-[#1D3557]/10 dark:hover:bg-[#1D3557]/20 rounded text-[#1D3557] dark:text-[#4895EF] hover:scale-110 transition-all inline-block cursor-pointer"
                              title="Visualizar Planilha PMOC e Imprimir"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintingLaudo(laudo);
                                  setTimeout(() => {
                                    exportToWord("print-container-laudo", `Laudo_${laudo.numero.replace(/\//g, '-')}_${laudo.clientName.replace(/\s+/g, '_')}`);
                                  }, 200);
                                }}
                                className="p-1.5 hover:bg-blue-600/10 rounded text-blue-600 dark:text-blue-400 hover:scale-110 transition-all inline-block cursor-pointer"
                                title="Exportar Laudo em Word (.doc)"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintingLaudo(laudo);
                                  setTimeout(() => {
                                    window.print();
                                  }, 150);
                                }}
                                className="p-1.5 hover:bg-[#134074]/10 dark:hover:bg-[#134074]/20 rounded text-[#134074] dark:text-[#4895EF] hover:scale-110 transition-all inline-block cursor-pointer"
                                title="Imprimir Laudo Técnico"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setError(null);
                              setCurrentLaudo(laudo);
                              if (laudo.apreciacaoRisco) {
                                setHrnLo(laudo.apreciacaoRisco.loValue);
                                setHrnFe(laudo.apreciacaoRisco.feValue);
                                setHrnDo(laudo.apreciacaoRisco.doValue);
                                setHrnNp(laudo.apreciacaoRisco.npValue);
                                setHrnAcoesText(laudo.apreciacaoRisco.acoesRecomendadas || '');
                              } else {
                                setHrnLo(1.0);
                                setHrnFe(5.0);
                                setHrnDo(5.0);
                                setHrnNp(1.0);
                                setHrnAcoesText('');
                              }
                              setSelectedChecklistId(laudo.linkedChecklistId || '');
                              setModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:scale-105 transition-all inline-block cursor-pointer"
                            title="Modificar laudo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(laudo.id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                            title="Deletar laudo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal Container */}
      {modalOpen && currentLaudo && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full shadow-2xl overflow-y-auto relative transition-all ${
            currentLaudo.categoria === 'PMOC (Climatização)' ? 'max-w-6xl' : 'max-w-2xl'
          }`}>
            
            <div className="bg-[#0B2545] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {currentLaudo.id ? 'Modificar Parâmetros de Laudo' : 'Formular Novo Laudo de Vistoria'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div id="laudo-error-banner" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono font-bold">
                  <span className="p-1 bg-rose-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center shrink-0">!</span>
                  <div>
                    <strong className="block font-sans uppercase font-black tracking-wider text-[10px] mb-0.5">Pendência de Permissão / Conexão</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {currentLaudo.categoria === 'PMOC (Climatização)' ? (
                /* Compact Top Bar for PMOC + Complete Spreadsheet Planning Editor */
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Nº ID *</label>
                      <input
                        type="text"
                        required
                        value={currentLaudo.numero || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, numero: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">ART Vinculada</label>
                      <input
                        type="text"
                        value={currentLaudo.art || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, art: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cliente Proprietário *</label>
                      <select
                        required
                        value={currentLaudo.clientId || ''}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setCurrentLaudo({ 
                            ...currentLaudo, 
                            clientId: cId, 
                            pmocData: getInitialPmocData(cId) 
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.company}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ativo Vinculado *</label>
                      <select
                        required
                        value={currentLaudo.equipmentId || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, equipmentId: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        {equipments.filter(eq => eq.clientId === currentLaudo.clientId).map(e => (
                          <option key={e.id} value={e.id}>{e.type} ({e.model})</option>
                        ))}
                        {equipments.filter(eq => eq.clientId === currentLaudo.clientId).length === 0 && (
                          <option value="">Sem ativos cadastrados</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Data da Vistoria *</label>
                      <input
                        type="date"
                        required
                        value={currentLaudo.dateInspection || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, dateInspection: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Status do Termo *</label>
                      <select
                        value={currentLaudo.status || LaudoStatus.EM_ELABORACAO}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, status: e.target.value as LaudoStatus })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded px-2.5 py-1.5 text-xs outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        <option value={LaudoStatus.EM_ELABORACAO}>Em Elaboração</option>
                        <option value={LaudoStatus.EMITIDO}>Emitido / Liberado</option>
                        <option value={LaudoStatus.VENCIDO}>Vencido</option>
                      </select>
                    </div>
                  </div>

                  {/* Complete PMOC editor */}
                  <PMOCEditor 
                    data={currentLaudo.pmocData || getInitialPmocData(currentLaudo.clientId)} 
                    onChange={(newPmocData) => setCurrentLaudo({ ...currentLaudo, pmocData: newPmocData })} 
                    clientName={clients.find(c => c.id === currentLaudo.clientId)?.company} 
                  />
                </div>
              ) : (
                /* Standard Narrow Form for non-PMOC categories */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Número Identificador *</label>
                      <input
                        type="text"
                        required
                        value={currentLaudo.numero || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, numero: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                        placeholder="Ex: LT-2026-X"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Registro ART Vinculada</label>
                      <input
                        type="text"
                        value={currentLaudo.art || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, art: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                        placeholder="Ex: PE-18222994-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Selecionar Cliente Proprietário *</label>
                      <select
                        required
                        value={currentLaudo.clientId || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, clientId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.company}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Vincular Ativo / Equipamento *</label>
                      <select
                        required
                        value={currentLaudo.equipmentId || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, equipmentId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        {equipments.filter(eq => eq.clientId === currentLaudo.clientId).map(e => (
                          <option key={e.id} value={e.id}>{e.type} ({e.model})</option>
                        ))}
                        {equipments.filter(eq => eq.clientId === currentLaudo.clientId).length === 0 && (
                          <option value="">Nenhum ativo associado a este cliente</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Data Oficial da Vistoria *</label>
                      <input
                        type="date"
                        required
                        value={currentLaudo.dateInspection || ''}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, dateInspection: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Status do Processamento *</label>
                      <select
                        value={currentLaudo.status || LaudoStatus.EM_ELABORACAO}
                        onChange={(e) => setCurrentLaudo({ ...currentLaudo, status: e.target.value as LaudoStatus })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-[#0B2545] dark:text-white cursor-pointer"
                      >
                        <option value={LaudoStatus.EM_ELABORACAO}>Em Elaboração / Vistoriado</option>
                        <option value={LaudoStatus.EMITIDO}>Emitido / Liberado</option>
                        <option value={LaudoStatus.VENCIDO}>Vencido / Expirado</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in">
                    <div className="flex justify-between items-center pb-1">
                      <label className="text-xs font-bold text-slate-400 uppercase font-mono">Tipo / Categoria de Inspeção *</label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="text-[#134074] dark:text-[#4895EF] hover:underline text-[10px] uppercase font-mono font-bold flex items-center gap-0.5"
                      >
                        {showAddCategory ? 'Selecionar de lista' : '+ Cadastrar Novo Tipo'}
                      </button>
                    </div>
                    
                    {showAddCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Ex: Reclassificação de Monta"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none text-slate-950 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase"
                        >
                          Gravar
                        </button>
                      </div>
                    ) : (
                      <select
                        value={currentLaudo.categoria || ''}
                        required
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'PMOC (Climatização)' && !currentLaudo.pmocData) {
                            setCurrentLaudo({
                              ...currentLaudo,
                              categoria: val,
                              pmocData: getInitialPmocData(currentLaudo.clientId)
                            });
                          } else {
                            setCurrentLaudo({ ...currentLaudo, categoria: val });
                          }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer select-none"
                      >
                        <option value="">Selecione um Tipo do Catálogo...</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </>
              )}

              {/* Dynamic Risk Appreciation section based on selected category (NR-12) */}
              {(currentLaudo.categoria?.toLowerCase().includes('nr-12') || currentLaudo.categoria?.toLowerCase().includes('nr12')) && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-rose-500/10 pb-2 mb-2">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold uppercase font-mono text-rose-600 tracking-wider">Apreciação Dinâmica de Riscos (ISO 12100 / HRN)</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono italic bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200/45">
                    Método HRN (Hazard Rating Number) para estimativa de perigo na máquina: 
                    <strong className="text-slate-800 dark:text-slate-200 font-mono ml-1">HRN = LO × FE × DO × NP</strong>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Probabilidade */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">Probabilidade (LO)</label>
                      <select
                        value={hrnLo}
                        onChange={(e) => setHrnLo(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none text-slate-950 dark:text-white"
                      >
                        <option value={0.03}>0.03 (Quase impossível)</option>
                        <option value={0.2}>0.20 (Altamente improvável)</option>
                        <option value={1.0}>1.00 (Improvável / Insignificante)</option>
                        <option value={1.5}>1.50 (Possível)</option>
                        <option value={2.0}>2.00 (Pouco provável)</option>
                        <option value={5.0}>5.00 (Provável)</option>
                        <option value={8.0}>8.00 (Altamente provável)</option>
                        <option value={15.0}>15.00 (Certo de acontecer)</option>
                      </select>
                    </div>

                    {/* Frequência */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">Frequência (FE)</label>
                      <select
                        value={hrnFe}
                        onChange={(e) => setHrnFe(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none text-slate-950 dark:text-white"
                      >
                        <option value={0.1}>0.10 (Infrequente / Anual)</option>
                        <option value={0.2}>0.20 (Mensal)</option>
                        <option value={1.0}>1.00 (Semanal)</option>
                        <option value={2.5}>2.50 (Diária)</option>
                        <option value={4.0}>4.00 (De hora em hora)</option>
                        <option value={5.0}>5.00 (Constante / Multi-turno)</option>
                      </select>
                    </div>

                    {/* Gravidade */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">Gravidade Dano (DO)</label>
                      <select
                        value={hrnDo}
                        onChange={(e) => setHrnDo(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none text-slate-950 dark:text-white"
                      >
                        <option value={0.1}>0.10 (Arranhão / Contusão leve)</option>
                        <option value={0.5}>0.50 (Dilaceração / Corte leve)</option>
                        <option value={1.0}>1.00 (Amputação de dedo / Fratura leve)</option>
                        <option value={2.0}>2.00 (Perda de um membro / Fratura grave)</option>
                        <option value={4.0}>4.00 (Invalidez permanente / Amputação de membros)</option>
                        <option value={15.0}>15.00 (Morte individual)</option>
                        <option value={50.0}>50.00 (Múltiplas mortes)</option>
                      </select>
                    </div>

                    {/* Pessoas Expostas */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">Expostos (NP)</label>
                      <select
                        value={hrnNp}
                        onChange={(e) => setHrnNp(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none text-slate-950 dark:text-white"
                      >
                        <option value={1.0}>1.00 (1-2 pessoas)</option>
                        <option value={2.0}>2.00 (3-7 pessoas)</option>
                        <option value={4.0}>4.00 (8-15 pessoas)</option>
                        <option value={8.0}>8.00 (16-50 pessoas)</option>
                        <option value={12.0}>12.00 (Mais de 50 pessoas)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations Widget */}
                  {(() => {
                    const score = getHrnScore();
                    const details = getHrnDetails(score);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-rose-500/10 shadow-sm">
                        {/* Gauge Score Widget */}
                        <div className="text-center md:border-r border-slate-100 dark:border-slate-800 p-2 leading-tight">
                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Pontuação HRN</span>
                          <span className="text-3xl font-black font-mono tracking-tight text-[#134074] dark:text-[#4895EF]">{score}</span>
                          <span className={`block mx-auto max-w-[140px] text-[10px] font-black uppercase tracking-wider py-1 mt-1 rounded border ${details.color}`}>
                            {details.label}
                          </span>
                        </div>

                        {/* Explanation description */}
                        <div className="col-span-1 md:col-span-2 space-y-2 text-xs">
                          <div>
                            <span className="block text-[9px] font-bold uppercase font-mono text-slate-400">Análise de Risco:</span>
                            <p className="text-slate-600 dark:text-slate-350">{details.desc}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase font-mono text-slate-400 block">Medidas de Proteção / Salvaguardas Sugeridas:</label>
                            <input
                              type="text"
                              value={hrnAcoesText}
                              onChange={(e) => setHrnAcoesText(e.target.value)}
                              placeholder="Ex: Instalar cortina de luz intertravada cat 4 e bimanual."
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded px-2.5 py-1.5 outline-none font-medium text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Connect Checklist de Vistoria Section */}
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-500/10 pb-2 mb-2">
                      <Clipboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold uppercase font-mono text-blue-600 dark:text-blue-400 tracking-wider">Conectar Checklist de Vistoria (Integração NR12)</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block">Vistoria Realizada Vinculada (Opcional)</label>
                      <select
                        value={selectedChecklistId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedChecklistId(val);
                          const chk = checklists.find(c => c.id === val);
                          if (chk) {
                            let notesText = '';
                            if (chk.questionNotes) {
                              const notes = Object.values(chk.questionNotes).filter(Boolean);
                              if (notes.length > 0) {
                                notesText = 'Observações coletadas no Checklist:\n' + notes.map(n => `- ${n}`).join('\n');
                              }
                            }
                            if (notesText && !hrnAcoesText) {
                              setHrnAcoesText(notesText);
                            }
                          }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none text-slate-950 dark:text-white cursor-pointer"
                      >
                        <option value="">Nenhum checklist vinculado...</option>
                        {checklists.filter(chk => chk.clientId === currentLaudo?.clientId).map((chk) => (
                          <option key={chk.id} value={chk.id}>
                            [{chk.type.toUpperCase()}] {new Date(chk.createdAt).toLocaleDateString('pt-BR')} - {chk.equipmentModel} ({chk.inspectorName})
                          </option>
                        ))}
                      </select>
                      
                      {selectedChecklistId && (() => {
                        const chk = checklists.find(c => c.id === selectedChecklistId);
                        if (!chk) return null;
                        
                        const okCount = Object.values(chk.questions).filter(v => v === 'OK' || v === 'C' || v === true || v === 'SIM' || v === 'APROVADO').length;
                        const nokCount = Object.values(chk.questions).filter(v => v === 'NOK' || v === 'NC' || v === false || v === 'NÃO' || v === 'REPROVADO' || v === 'RUIM').length;
                        const naCount = Object.values(chk.questions).filter(v => v === 'NA' || v === 'N.A' || v === 'N.A (NÃO SE APLICA)').length;

                        return (
                          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-sm">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span>ID Vistoria: {chk.id}</span>
                              <span>Data: {new Date(chk.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              Métricas de Conformidade Importadas:
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold">
                              <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded border border-emerald-500/10">
                                CONFORME: {okCount}
                              </div>
                              <div className="bg-rose-500/10 text-rose-600 p-2 rounded border border-rose-500/10">
                                NÃO CONFORME: {nokCount}
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-900 text-slate-500 p-2 rounded border border-slate-200/5 dark:border-slate-800">
                                N.A: {naCount}
                              </div>
                            </div>

                            {chk.questionPhotos && Object.values(chk.questionPhotos).flat().length > 0 && (
                              <div className="space-y-1.5">
                                <div className="font-bold text-slate-400 text-[10px] uppercase font-mono">Fotos Técnicas do Checklist ({Object.values(chk.questionPhotos).flat().length}):</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.values(chk.questionPhotos).flat().slice(0, 5).map((photo, pIdx) => (
                                    <img
                                      key={pIdx}
                                      src={photo}
                                      alt="Vistoria"
                                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800 hover:scale-105 transition-transform"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Identified Non-Conformities */}
                            {nokCount > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-slate-150 dark:border-slate-800">
                                <div className="font-bold text-rose-500 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                                  <span>🚨 Não-Conformidades Detectadas na Vistoria:</span>
                                </div>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {Object.entries(chk.questions)
                                    .filter(([_, val]) => val === 'NOK' || val === 'NC' || val === false || val === 'NÃO' || val === 'REPROVADO' || val === 'RUIM')
                                    .map(([qKey, _]) => {
                                      let qLabel = qKey;
                                      if (qKey.startsWith('q')) {
                                        qLabel = qKey.replace(/^q\d+_/, '').replace(/_/g, ' ').toUpperCase();
                                      }
                                      const hasNote = chk.questionNotes?.[qKey];
                                      return (
                                        <div key={qKey} className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 p-2 rounded-xl text-[11px] text-slate-700 dark:text-slate-350 space-y-1 flex flex-col justify-between">
                                          <div className="flex justify-between items-start gap-2">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">• {qLabel}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const riskDesc = `[Inconformidade: ${qLabel}]${hasNote ? ` Observação: ${hasNote}` : ''}`;
                                                if (hrnAcoesText.includes(riskDesc)) return;
                                                setHrnAcoesText(prev => prev ? `${prev}\n- ${riskDesc}` : `- ${riskDesc}`);
                                              }}
                                              className="text-[9px] bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white font-mono px-2 py-0.5 rounded-lg font-bold active:scale-95 transition-all shrink-0 cursor-pointer"
                                              title="Importar recomendação técnica"
                                            >
                                              + Vincular Laudo
                                            </button>
                                          </div>
                                          {hasNote && (
                                            <div className="text-[10px] text-slate-500 italic pl-2 border-l-2 border-rose-300 dark:border-rose-800 font-mono">
                                              {hasNote}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Uploads Panel Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono block">Enexar Arquivos de Laudo</label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* PDF Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Laudo PDF</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('pdf')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.pdfUrl ? 'Anexo pronto' : 'Drag or click'}</span>
                    </button>
                    {uploading === 'pdf' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#134074] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Foto Vistoria</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('image')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.imageUrl ? 'Imagem pronta' : 'Upload Foto'}</span>
                    </button>
                    {uploading === 'image' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#134074] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">Vídeo Ensaio</span>
                    <button
                      type="button"
                      onClick={() => handleUploadSimulate('video')}
                      disabled={!!uploading}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentLaudo.videoUrl ? 'Vídeo pronto' : 'Upload Vídeo'}</span>
                    </button>
                    {uploading === 'video' && (
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-[#134074] h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">
                  Todos os arquivos são armazenados no Firebase Cloud Storage em pastas isoladas e seguras.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#134074] hover:bg-[#0B2545] text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar laudo</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Hidden print container specifically formatted for A4 prints of Laudos Técnicos! */}
      {printingLaudo && (
        <div 
          id="print-container-laudo" 
          className="fixed inset-0 z-[99999] bg-white text-slate-950 p-12 overflow-y-auto hidden print:block space-y-8"
        >
          {/* Standardized Header block with company logo on the right */}
          <div className="flex justify-between items-center border-b pb-3 border-slate-200 mb-6">
            <div className="text-left font-mono text-[10px] text-slate-500 uppercase tracking-wider space-y-0.5">
              <div className="font-bold text-slate-900">LAUDO TÉCNICO DE ENGENHARIA</div>
              <div className="text-[8px]">REGISTRO: {printingLaudo.numero} — EMISSÃO: {new Date(printingLaudo.createdAt).toLocaleDateString('pt-BR')} — ART VINCULADA: {printingLaudo.art || 'N/A'}</div>
            </div>
            <Logo variant="print" className="h-8" />
          </div>

          {/* Title and Identification of Responsable Engineer */}
          <div className="text-center space-y-1 py-4">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {printingLaudo.categoria || 'Laudo Técnico de Conformidade'}
            </h1>
            <p className="text-xs text-slate-600 font-mono">
              Responsável Técnico: Eng. Vitor Leonardo Cordeiro Linhares • CREA-PE 18222994-PE
            </p>
          </div>

          {/* Informações Gerais (Client and Equipment) */}
          <div className="grid grid-cols-2 gap-8 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                Cliente Interessado
              </h3>
              <div className="text-sm space-y-1 leading-normal text-slate-800">
                <p className="font-bold text-slate-950">{printingLaudo.clientName}</p>
                {(() => {
                  const cli = clients.find(c => c.id === printingLaudo.clientId);
                  if (!cli) return null;
                  return (
                    <div className="space-y-0.5 text-xs text-slate-600">
                      <p>CNPJ/CPF: {cli.cnpj_cpf}</p>
                      <p>Endereço: {cli.address}</p>
                      <p>Contato: {cli.phone} | {cli.email}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                Descrição do Ativo / Objeto
              </h3>
              <div className="text-sm space-y-1 leading-normal text-slate-800">
                <p className="font-bold text-slate-950">{printingLaudo.equipmentModel}</p>
                {(() => {
                  const eq = equipments.find(e => e.id === printingLaudo.equipmentId);
                  if (!eq) return null;
                  return (
                    <div className="space-y-0.5 text-xs text-slate-600">
                      <p>Marca: {eq.brand}</p>
                      <p>Modelo: {eq.model}</p>
                      <p>Número de Série: {eq.serialNumber || 'N/A'}</p>
                      <p>Ano Fabricação: {eq.year || 'N/A'}</p>
                      {eq.potenciaInstalada && <p>Potência Instalada: {eq.potenciaInstalada} kW</p>}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Dynamic Risk Appreciation section (HRN / ISO 12100) */}
          {printingLaudo.apreciacaoRisco && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b-2 border-slate-900 pb-2 uppercase tracking-wide">
                1. Apreciação de Riscos Dinâmica (ISO 12100 / HRN)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                A avaliação de perigos foi conduzida utilizando o consagrado método internacional HRN (Hazard Rating Number), estimando quantitativamente a probabilidade de ocorrência, frequência de exposição, gravidade do dano físico e número de pessoas expostas ao perigo mecânico direto.
              </p>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Probabilidade (LO)</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">{printingLaudo.apreciacaoRisco.loValue}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Frequência (FE)</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">{printingLaudo.apreciacaoRisco.feValue}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Gravidade Dano (DO)</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">{printingLaudo.apreciacaoRisco.doValue}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Nº de Expostos (NP)</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">{printingLaudo.apreciacaoRisco.npValue}</div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Pontuação Final HRN</span>
                  <span className="text-2xl font-mono font-black">{printingLaudo.apreciacaoRisco.hrnScore}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Grau de Severidade</span>
                  <span className="text-sm font-black uppercase tracking-widest">{printingLaudo.apreciacaoRisco.classificacao}</span>
                </div>
              </div>

              {printingLaudo.apreciacaoRisco.acoesRecomendadas && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-bold text-slate-950 uppercase font-mono">Medidas de Salvaguarda Recomendadas:</h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{printingLaudo.apreciacaoRisco.acoesRecomendadas}</p>
                </div>
              )}
            </div>
          )}

          {/* Connected Checklist Section - Visualizing Checklist items, photos, and answers */}
          {printingLaudo.linkedChecklistId && (
            <div className="space-y-4 pt-4 page-break-before">
              <h2 className="text-lg font-bold border-b-2 border-slate-900 pb-2 uppercase tracking-wide">
                2. Diagnóstico e Vistorias Integradas (Checklist Conectado)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                As verificações táticas registradas sob a vistoria técnica unificada de ID <strong>{printingLaudo.linkedChecklistId}</strong> estão integradas a este laudo pericial, detalhando a conformidade dos itens normativos coletados em campo pelo engenheiro inspetor.
              </p>

              {(() => {
                const chk = checklists.find(c => c.id === printingLaudo.linkedChecklistId) || printingLaudo.linkedChecklistData;
                if (!chk) {
                  return (
                    <div className="text-xs text-slate-500 font-mono italic">
                      Checklist vinculado ID {printingLaudo.linkedChecklistId} não pôde ser carregado offline.
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                      <div>
                        <strong>Tipo de Vistoria:</strong> <span className="uppercase font-bold">{chk.type}</span>
                      </div>
                      <div>
                        <strong>Inspetor Responsável:</strong> <span>{chk.inspectorName}</span>
                      </div>
                      <div>
                        <strong>Data da Vistoria:</strong> <span>{new Date(chk.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <div>
                        <strong>Assinatura Digital de Vistoria:</strong> <span className="font-mono text-[9px] select-all break-all">{chk.digitalSignature}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-slate-200 font-mono text-[10px]">
                            <th className="p-3">Item de Verificação Normativa</th>
                            <th className="p-3 text-center w-32">Status da Inspeção</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          {Object.entries(chk.questions).map(([qKey, qValue]) => {
                            let qLabel = qKey;
                            if (qKey.startsWith('q')) {
                              qLabel = qKey.replace(/^q\d+_/, '').replace(/_/g, ' ').toUpperCase();
                            }
                            const isConforme = qValue === 'OK' || qValue === 'C' || qValue === true || qValue === 'SIM' || qValue === 'APROVADO';
                            const isNaoConforme = qValue === 'NOK' || qValue === 'NC' || qValue === false || qValue === 'NÃO' || qValue === 'REPROVADO' || qValue === 'RUIM';
                            
                            return (
                              <tr key={qKey}>
                                <td className="p-3">
                                  <div className="font-semibold text-slate-900">{qLabel}</div>
                                  {chk.questionNotes?.[qKey] && (
                                    <div className="text-[10px] text-slate-500 font-mono italic mt-1 bg-slate-50 p-1 rounded border border-slate-100">
                                      Obs: {chk.questionNotes[qKey]}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {isConforme ? (
                                    <span className="inline-block px-2.5 py-0.5 font-bold font-mono text-emerald-800 text-[10px] bg-emerald-100 rounded">CONFORME</span>
                                  ) : isNaoConforme ? (
                                    <span className="inline-block px-2.5 py-0.5 font-bold font-mono text-rose-800 text-[10px] bg-rose-100 rounded">NÃO CONFORME</span>
                                  ) : (
                                    <span className="inline-block px-2.5 py-0.5 font-bold font-mono text-slate-500 text-[10px] bg-slate-100 rounded">N/A</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {chk.questionPhotos && Object.values(chk.questionPhotos).flat().length > 0 && (
                      <div className="space-y-3 pt-2 page-break-inside-avoid">
                        <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                          2.1 Anexo Fotográfico de Evidências Técnicas
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Abaixo encontram-se registradas as fotos e as evidências técnicas capturadas in-loco durante a execução das inspeções na máquina correspondente:
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(chk.questionPhotos).map(([qKey, photos]) => {
                            const photoList = photos as string[];
                            if (!photoList || photoList.length === 0) return null;
                            let qLabel = qKey;
                            if (qKey.startsWith('q')) {
                              qLabel = qKey.replace(/^q\d+_/, '').replace(/_/g, ' ').toUpperCase();
                            }
                            return photoList.map((photo, pIdx) => (
                              <div key={`${qKey}-${pIdx}`} className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center space-y-1.5">
                                <img
                                  src={photo}
                                  alt={`Evidência ${qLabel}`}
                                  className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-sm"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="text-[9px] font-mono font-bold text-slate-600 uppercase truncate">
                                  {qLabel} ({pIdx + 1})
                                </div>
                              </div>
                            ));
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Footer signatures block */}
          <div className="pt-16 grid grid-cols-2 gap-16 items-start page-break-inside-avoid">
            <div className="space-y-2 border-t border-slate-400 pt-4 text-center flex flex-col items-center">
              <div className="h-20 flex flex-col items-center justify-center">
                {!blankSignatureLaudo ? (
                  <img 
                    src={signatureVitor} 
                    alt="Assinatura Vitor Leonardo" 
                    className="mx-auto max-h-16 object-contain mix-blend-multiply" 
                  />
                ) : (
                  <div className="w-56 h-10 border-b border-dashed border-slate-400" />
                )}
              </div>
              <h4 className="font-bold text-md text-slate-900">Vitor Leonardo Cordeiro Linhares</h4>
              <p className="text-xs text-slate-500 font-mono">Engenheiro Mecânico • CREA-PE 1822299490</p>
            </div>

            <div className="space-y-2 pt-12">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[10px] font-mono space-y-1.5 leading-normal">
                <div className="font-bold text-slate-700">CERTIFICAÇÃO DIGITAL DE INTEGRABILIDADE:</div>
                <div>Hash de Verificação: <strong className="text-slate-900">MD5:LAUDO:{printingLaudo.id.substring(0, 8)}:{printingLaudo.numero}</strong></div>
                <div>Este laudo técnico foi emitido de forma digital e cumpre integralmente com as resoluções do CONFEA/CREA-PE para Engenharia Mecânica.</div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 text-[10px] font-mono text-slate-450 print:block hidden">
            VL ENGENHARIA • Inspeções, Laudos Técnicos e Engenharia Mecânica
          </div>

          <div className="fixed bottom-6 left-48 flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-lg print:hidden z-[999999]">
            <input
              type="checkbox"
              id="blankSignatureLaudo"
              checked={blankSignatureLaudo}
              onChange={e => setBlankSignatureLaudo(e.target.checked)}
              className="rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]"
            />
            <label htmlFor="blankSignatureLaudo" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              Assinatura em Branco (Gov.br)
            </label>
          </div>

          <button 
            type="button" 
            onClick={() => setPrintingLaudo(null)}
            className="fixed bottom-6 left-6 px-4 py-2 bg-slate-900 text-white rounded font-bold text-xs font-mono uppercase tracking-wider print:hidden cursor-pointer"
          >
            Voltar ao painel
          </button>
        </div>
      )}

    </div>
  );
}
