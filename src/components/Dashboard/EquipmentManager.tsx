/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EquipmentData, ClientData } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, X, Cog, Save } from 'lucide-react';

interface EquipmentManagerProps {
  equipments?: EquipmentData[];
  clients?: ClientData[];
  loading?: boolean;
  onDataChanged?: () => void;
}

export default function EquipmentManager({
  equipments: propEquipments,
  clients: propClients,
  loading: propLoading,
  onDataChanged
}: EquipmentManagerProps = {}) {
  const [equipments, setEquipments] = useState<EquipmentData[]>(propEquipments || []);
  const [clients, setClients] = useState<ClientData[]>(propClients || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEq, setCurrentEq] = useState<Partial<EquipmentData> | null>(null);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (propEquipments) setEquipments(propEquipments);
    if (propClients) setClients(propClients);
    if (propLoading !== undefined) setLoading(propLoading);
  }, [propEquipments, propClients, propLoading]);

  useEffect(() => {
    if (!propEquipments) {
      loadData();
    }
  }, [propEquipments]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        const [querySnapshot, clientsSnap] = await Promise.all([
          getDocs(collection(db, 'equipments')),
          getDocs(collection(db, 'clients'))
        ]);

        const eqArray: EquipmentData[] = [];
        querySnapshot.forEach((docSnap) => eqArray.push(docSnap.data() as EquipmentData));
        setEquipments(eqArray);

        const cliArray: ClientData[] = [];
        clientsSnap.forEach((docSnap) => cliArray.push(docSnap.data() as ClientData));
        setClients(cliArray);
      } else {
        setEquipments(mockDb.getEquipments());
        setClients(mockDb.getClients());
      }
      onDataChanged?.();
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'equipments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentEq?.type || !currentEq?.brand || !currentEq?.clientId || !currentEq?.model) {
      setError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    const eqId = currentEq.id || 'eq_' + Math.random().toString(36).substr(2, 9);
    const matchedClient = clients.find(c => c.id === currentEq.clientId);
    const saveObj: EquipmentData = {
      id: eqId,
      clientId: currentEq.clientId,
      clientName: matchedClient ? matchedClient.company : 'Cliente Desconhecido',
      type: currentEq.type,
      brand: currentEq.brand,
      model: currentEq.model,
      serialNumber: currentEq.serialNumber || 'N/A',
      year: currentEq.year || '',
      createdAt: currentEq.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      potenciaInstalada: currentEq.potenciaInstalada || ''
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout_error')), 5000)
    );

    try {
      if (isRealFirebase) {
        await Promise.race([
          setDoc(doc(db, 'equipments', eqId), saveObj),
          timeoutPromise
        ]);
      }
      mockDb.saveEquipment(saveObj);
      setModalOpen(false);
      setSuccess(currentEq.id ? 'Equipamento atualizado com sucesso!' : 'Novo equipamento cadastrado com sucesso!');
      setTimeout(() => setSuccess(null), 4500);
      loadData();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Erro de permissão ou conexão ao salvar seu ativo de engenharia.';
      if (err.message === 'timeout_error') {
        errMsg = 'A gravação de dados expirou (Timeout de 5s). O Google Firestore parece estar inacessível ou bloqueado por cookies de terceiros neste iFrame. Ative o "Modo Sandbox Offline" no menu lateral para salvar localmente sem restrições.';
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            errMsg = `Erro de Permissão (${parsed.operationType}): ${parsed.error}. Apenas engenheiros do nível 'GESTÃO' podem cadastrar ativos no Firestore.`;
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

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'equipments', id));
      } else {
        mockDb.deleteEquipment(id);
      }
      setSuccess('Equipamento removido com sucesso!');
      setTimeout(() => setSuccess(null), 4500);
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `equipments/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = equipments.filter(e => 
    e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Header operations */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">Cadastro de Ativos / Equipamentos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie máquinas pesadas, parquinhos, guindastes e centrais de HVAC</p>
        </div>
        
        <button
          onClick={() => {
            setError(null);
            setCurrentEq({
              clientId: clients[0]?.id || ''
            });
            setModalOpen(true);
          }}
          disabled={clients.length === 0}
          className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors self-start cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Ativo</span>
        </button>
      </div>

      {clients.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs font-mono">
          Nenhum cliente cadastrado. Cadastre pelo menos um cliente para criar um ativo.
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar por tipo, marca, modelo, cliente ou número de série..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Content table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
            <span>Processando dados...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhum equipamento foi cadastrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Equipamento Ativo</th>
                  <th className="p-4">Marca & Modelo</th>
                  <th className="p-4">Proprietário / Cliente</th>
                  <th className="p-4">Nº de Série / Fabricação</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {filtered.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{eq.type}</span>
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{eq.brand}</div>
                      <div className="text-xs text-slate-500 font-mono">{eq.model}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {eq.clientName}
                    </td>
                    <td className="p-4 space-y-0.5 font-mono text-xs">
                      <div className="text-slate-800 dark:text-slate-200">S/N: {eq.serialNumber}</div>
                      <div className="text-slate-400">Ano: {eq.year || 'N/D'}{eq.potenciaInstalada ? ` • Potência: ${eq.potenciaInstalada} kW` : ''}</div>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      {deleteConfirmId === eq.id ? (
                        <div className="flex items-center justify-end gap-1.5 inline-flex">
                          <span className="text-[10px] text-rose-500 font-bold font-mono uppercase">Excluir?</span>
                          <button
                            onClick={() => {
                              handleDelete(eq.id);
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
                        <>
                          <button
                            onClick={() => {
                              setError(null);
                              setCurrentEq(eq);
                              setModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:scale-105 transition-all inline-block cursor-pointer"
                            title="Editar equipamento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(eq.id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-500 hover:scale-105 transition-all inline-block cursor-pointer"
                            title="Excluir equipamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {modalOpen && currentEq && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-y-auto relative">
            
            <div className="bg-[#0B2545] text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {currentEq.id ? 'Editar Equipamento Ativo' : 'Registrar Novo Ativo de Engenharia'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div id="equipment-error-banner" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono font-bold">
                  <span className="p-1 bg-rose-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center shrink-0">!</span>
                  <div>
                    <strong className="block font-sans uppercase font-black tracking-wider text-[10px] mb-0.5">Pendência de Permissão / Conexão</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">Vincular Cliente Responsável *</label>
                <select
                  required
                  value={currentEq.clientId || ''}
                  onChange={(e) => setCurrentEq({ ...currentEq, clientId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">Tipo do Equipamento / Máquina *</label>
                <input
                  type="text"
                  required
                  value={currentEq.type || ''}
                  onChange={(e) => setCurrentEq({ ...currentEq, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                  placeholder="Ex: Guindaste Hidráulico Articulado"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Marca do Fabricante *</label>
                  <input
                    type="text"
                    required
                    value={currentEq.brand || ''}
                    onChange={(e) => setCurrentEq({ ...currentEq, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: Madal Palfinger S/A"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Modelo Técnico *</label>
                  <input
                    type="text"
                    required
                    value={currentEq.model || ''}
                    onChange={(e) => setCurrentEq({ ...currentEq, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: MD-45000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Número de Série / Chassi</label>
                  <input
                    type="text"
                    value={currentEq.serialNumber || ''}
                    onChange={(e) => setCurrentEq({ ...currentEq, serialNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                    placeholder="Ex: S/N-998811"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Ano de Fabricação</label>
                  <input
                    type="text"
                    value={currentEq.year || ''}
                    onChange={(e) => setCurrentEq({ ...currentEq, year: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: 2021"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Potência Instalada (kW)</label>
                  <input
                    type="text"
                    value={currentEq.potenciaInstalada || ''}
                    onChange={(e) => setCurrentEq({ ...currentEq, potenciaInstalada: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: 15"
                  />
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
                  <span>Salvar Equipamento</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
