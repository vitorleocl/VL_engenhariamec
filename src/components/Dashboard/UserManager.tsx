/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, ClientData, UserRole } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { KeyRound, Shield, Search, X, Save, Edit2, Trash2, CheckCircle, RefreshCw } from 'lucide-react';

interface UserManagerProps {
  clients?: ClientData[];
}

export default function UserManager({ clients: propClients }: UserManagerProps = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<ClientData[]>(propClients || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (propClients) setClients(propClients);
  }, [propClients]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        // Fetch users profiles and clients list in parallel
        const [querySnapshot, clientsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          propClients ? Promise.resolve(null) : getDocs(collection(db, 'clients'))
        ]);

        const usersArray: UserProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          usersArray.push(docSnap.data() as UserProfile);
        });
        setUsers(usersArray);

        if (clientsSnap) {
          const clientsArray: ClientData[] = [];
          clientsSnap.forEach((docSnap) => {
            clientsArray.push(docSnap.data() as ClientData);
          });
          setClients(clientsArray);
        }
      } else {
        // Mock fallback if offline/no firebase configs
        const mockUsers: UserProfile[] = [
          {
            uid: 'vitor_mock_123',
            name: 'Vitor Leonardo Cordeiro Linhares',
            email: 'vitorleonardocl@gmail.com',
            role: UserRole.ADMIN,
            createdAt: new Date().toISOString()
          },
          {
            uid: 'client_mock_abc',
            name: 'João Silva (Metalúrgica)',
            email: 'joao.silva@metalurgicape.com.br',
            role: UserRole.CLIENT,
            clientId: 'c1',
            createdAt: new Date().toISOString()
          }
        ];
        setUsers(mockUsers);
        
        const mockClients: ClientData[] = [
          {
            id: 'c1',
            name: 'João Silva',
            email: 'joao.silva@metalurgicape.com.br',
            phone: '(81) 98444-2592',
            company: 'Metalúrgica PE S.A.',
            cnpj_cpf: '12.345.678/0001-90',
            address: 'Distrito Industrial, Cabo de Santo Agostinho - PE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setClients(mockClients);
      }
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUserProfile?.email || !currentUserProfile?.name || !currentUserProfile?.role) {
      setError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    const userId = currentUserProfile.uid || 'usr_' + Math.random().toString(36).substr(2, 9);
    
    // Construct valid schema values matching isValidUser in firestore.rules
    const saveObj: UserProfile = {
      uid: userId,
      name: currentUserProfile.name,
      email: currentUserProfile.email,
      role: currentUserProfile.role as UserRole,
      clientId: currentUserProfile.role === UserRole.CLIENT ? (currentUserProfile.clientId || '') : '',
      createdAt: currentUserProfile.createdAt || new Date().toISOString()
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout_error')), 5000)
    );

    try {
      if (isRealFirebase) {
        await Promise.race([
          setDoc(doc(db, 'users', userId), saveObj),
          timeoutPromise
        ]);
      } else {
        setUsers(prev => {
          const index = prev.findIndex(u => u.uid === userId);
          if (index > -1) {
            const updated = [...prev];
            updated[index] = saveObj;
            return updated;
          }
          return [...prev, saveObj];
        });
      }
      setModalOpen(false);
      setSuccess(currentUserProfile.uid ? 'Permissões do usuário atualizadas!' : 'Novo usuário convidado/cadastrado com sucesso!');
      setTimeout(() => setSuccess(null), 4500);
      loadData();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Erro de permissão ou conexão ao salvar seu usuário.';
      if (err.message === 'timeout_error') {
        errMsg = 'A gravação de dados expirou (Timeout de 5s). O Google Firestore parece estar inacessível ou bloqueado por cookies de terceiros neste iFrame. Ative o "Modo Sandbox Offline" no menu lateral para salvar localmente sem restrições.';
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            errMsg = `Erro de Permissão (${parsed.operationType}): ${parsed.error}`;
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

  const handleDelete = async (uid: string) => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        await deleteDoc(doc(db, 'users', uid));
      } else {
        setUsers(prev => prev.filter(u => u.uid !== uid));
      }
      loadData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return 'Não Vinculado';
    const found = clients.find(c => c.id === clientId);
    return found ? found.company : `Cliente ID: ${clientId}`;
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">Gerenciamento de Usuários e Acessos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Controles de credenciais e permissões para perfis de GESTÃO (Admin) e CLIENTE</p>
        </div>
        
        <button
          onClick={() => {
            setCurrentUserProfile({ role: UserRole.CLIENT });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-5 py-2.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Cadastrar Usuário / Convite</span>
        </button>
      </div>

      {/* Search and Refresh bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail corporativo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
        
        <button
          onClick={loadData}
          title="Recarregar"
          className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer text-slate-500 hover:text-[#134074] dark:hover:text-[#4895EF] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Content representation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
            <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
            <span>Processando dados de acesso...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Nenhum usuário cadastrado foi localizado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Colaborador / Usuário</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Nível de Permissão (Role)</th>
                  <th className="p-4">Empresa / Unidade Vinculada</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {filtered.map((u) => {
                  const isMaster = u.email === 'vitorleonardocl@gmail.com';
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ${isMaster ? 'bg-[#134074]' : 'bg-[#8DA9C4]'}`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isMaster && (
                                <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10 text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded">MASTER</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">UID: {u.uid.substr(0, 10)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black font-mono px-2.5 py-0.5 rounded uppercase tracking-wider ${
                          u.role === UserRole.ADMIN 
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role === UserRole.ADMIN ? 'Gestão / Admin' : 'Cliente'}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === UserRole.ADMIN ? (
                          <span className="text-slate-500 font-bold text-xs">— (Visualiza Completo)</span>
                        ) : (
                          <span className={`text-xs font-medium p-1 px-2.5 rounded-full ${u.clientId ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200' : 'bg-red-500/5 text-rose-500 font-bold border border-rose-500/10'}`}>
                            {getClientName(u.clientId)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isMaster ? (
                          <span className="text-[10px] text-slate-450 font-mono italic">Prevenção Master</span>
                        ) : deleteConfirmId === u.uid ? (
                          <div className="flex items-center justify-end gap-1.5 inline-flex">
                            <span className="text-[10px] text-rose-500 font-bold font-mono uppercase">Excluir?</span>
                            <button
                              onClick={() => {
                                handleDelete(u.uid);
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
                                setCurrentUserProfile(u);
                                setModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all inline-block cursor-pointer"
                              title="Editar Usuário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(u.uid)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all inline-block cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor invite modal */}
      {modalOpen && currentUserProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative">
            
            <div className="bg-[#0B2545] text-white p-6 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-lg font-bold">
                {currentUserProfile.uid ? 'Editar Permissões do Usuário' : 'Convidar / Cadastrar Novo Usuário'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:opacity-80 p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div id="user-error-banner" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono">
                  <span className="p-1 bg-rose-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center shrink-0">!</span>
                  <div>
                    <strong className="block font-sans uppercase font-black tracking-wider text-[10px] mb-0.5">Pendência de Permissão / Conexão</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Nome do Colaborador *</label>
                  <input
                    type="text"
                    required
                    value={currentUserProfile.name || ''}
                    onChange={(e) => setCurrentUserProfile({ ...currentUserProfile, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                    placeholder="Ex: Vitor Linhares"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">E-mail da Conta Google *</label>
                  <input
                    type="email"
                    required
                    value={currentUserProfile.email || ''}
                    onChange={(e) => setCurrentUserProfile({ ...currentUserProfile, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white font-mono"
                    placeholder="exemplo@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase font-mono">Nível de Permissão (Role) *</label>
                <select
                  value={currentUserProfile.role || ''}
                  onChange={(e) => setCurrentUserProfile({ ...currentUserProfile, role: e.target.value as UserRole, clientId: e.target.value === 'admin' ? '' : currentUserProfile.clientId })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                >
                  <option value={UserRole.CLIENT}>CLIENTE (Visualização Restrita para sua Empresa)</option>
                  <option value={UserRole.ADMIN}>GESTÃO / ADMIN (Acesso Completo aos Painéis)</option>
                </select>
              </div>

              {currentUserProfile.role === UserRole.CLIENT && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono">Empresa Mapeada / Vinculada *</label>
                  <select
                    required
                    value={currentUserProfile.clientId || ''}
                    onChange={(e) => setCurrentUserProfile({ ...currentUserProfile, clientId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-950 dark:text-white"
                  >
                    <option value="">-- Selecione uma Empresa --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 italic">Esses acessos são auditores em tempo real de acordo com as diretrizes do CREA-PE.</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#134074] hover:bg-[#0B2545] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Permissões</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
