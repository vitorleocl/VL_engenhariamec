/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LaudoData, ChecklistData, EquipmentData, ClientData, LaudoStatus } from '../../types';
import { isRealFirebase, db, handleFirestoreError, OperationType, auth } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FileText, Printer, CheckCircle, Clock, AlertTriangle, ShieldAlert, FileSearch, Building } from 'lucide-react';

interface ClientPortalProps {
  associatedClientId?: string; // Loaded from the user's Auth profile
  clients?: ClientData[];
  laudos?: LaudoData[];
  checklists?: ChecklistData[];
  equipments?: EquipmentData[];
  loading?: boolean;
}

export default function ClientPortal({
  associatedClientId,
  clients: propClients,
  laudos: propLaudos,
  checklists: propChecklists,
  equipments: propEquipments,
  loading: propLoading
}: ClientPortalProps) {
  const [laudos, setLaudos] = useState<LaudoData[]>([]);
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientData | null>(null);
  
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : false);
  const [activeTab, setActiveTab] = useState<'laudos' | 'checklists' | 'equipments'>('laudos');

  // If no clientId is assigned, default to the first mock client 'c1' so they can see data during local preview immediately!
  const targetId = associatedClientId || 'c1';

  useEffect(() => {
    if (propLaudos && propChecklists && propEquipments && propClients) {
      setLaudos(propLaudos.filter(l => l.clientId === targetId));
      setChecklists(propChecklists.filter(c => c.clientId === targetId));
      setEquipments(propEquipments.filter(e => e.clientId === targetId));
      const profile = propClients.find(c => c.id === targetId) || null;
      setClientProfile(profile);
      if (propLoading !== undefined) setLoading(propLoading);
    }
  }, [targetId, propLaudos, propChecklists, propEquipments, propClients, propLoading]);

  useEffect(() => {
    if (!propLaudos) {
      loadPortalData();
    }
  }, [targetId, propLaudos]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      if (isRealFirebase) {
        // Query only matching documents belonging to this client ID in parallel for high performance!
        const laudosQuery = query(collection(db, 'laudos'), where('clientId', '==', targetId));
        const chkQuery = query(collection(db, 'checklists'), where('clientId', '==', targetId));
        const eqQuery = query(collection(db, 'equipments'), where('clientId', '==', targetId));

        const [laudosSnap, chkSnap, eqSnap, clientsSnap] = await Promise.all([
          getDocs(laudosQuery),
          getDocs(chkQuery),
          getDocs(eqQuery),
          getDocs(collection(db, 'clients'))
        ]);

        const lArray: LaudoData[] = [];
        laudosSnap.forEach(d => lArray.push(d.data() as LaudoData));
        setLaudos(lArray);

        const cArray: ChecklistData[] = [];
        chkSnap.forEach(d => cArray.push(d.data() as ChecklistData));
        setChecklists(cArray);

        const eArray: EquipmentData[] = [];
        eqSnap.forEach(d => eArray.push(d.data() as EquipmentData));
        setEquipments(eArray);

        clientsSnap.forEach(d => {
          const cData = d.data() as ClientData;
          if (cData.id === targetId) setClientProfile(cData);
        });
      } else {
        setLaudos(mockDb.getLaudos().filter(l => l.clientId === targetId));
        setChecklists(mockDb.getChecklists().filter(c => c.clientId === targetId));
        setEquipments(mockDb.getEquipments().filter(e => e.clientId === targetId));
        
        const matchedCli = mockDb.getClients().find(c => c.id === targetId);
        if (matchedCli) setClientProfile(matchedCli);
      }
    } catch (e) {
      if (isRealFirebase) {
        handleFirestoreError(e, OperationType.LIST, `clients/${targetId}/dashboard`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Client header information */}
      {clientProfile && (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] text-white p-6 md:p-8 rounded-3xl border border-[#0B2545]/10 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-white/10 rounded-2xl block">
              <Building className="w-6 h-6 text-[#8DA9C4]" />
            </span>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#8DA9C4] font-bold">Portal do Cliente</span>
              <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight">{clientProfile.company}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/15 text-xs text-slate-100 font-mono">
            <div><strong>Representante:</strong> {clientProfile.name}</div>
            <div><strong>CNPJ / CPF:</strong> {clientProfile.cnpj_cpf}</div>
            <div><strong>Contato:</strong> {clientProfile.phone || clientProfile.email}</div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {(['laudos', 'checklists', 'equipments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-5 text-xs uppercase font-bold tracking-wider relative transition-all cursor-pointer ${
              activeTab === tab 
                ? 'text-[#134074] dark:text-[#4895EF]' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab === 'laudos' ? 'Meus Laudos' : tab === 'checklists' ? 'Checklists Anexados' : 'Equipamentos Cadastrados'}</span>
            {activeTab === tab && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#134074] dark:bg-[#4895EF]" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2 animate-pulse">
          <span className="w-5 h-5 border-2 border-[#134074] border-t-transparent rounded-full animate-spin" />
          <span>Buscando seu acervo seguro...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          
          {/* TAB: LAUDOS */}
          {activeTab === 'laudos' && (
            laudos.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">Nenhum laudo emitido para sua empresa até o momento.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Nº Documento / ART</th>
                      <th className="p-4">Equipamento Ativo</th>
                      <th className="p-4">Inspetor Técnico</th>
                      <th className="p-4">Validade</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300 font-sans">
                    {laudos.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                        <td className="p-4">
                          <div className="font-bold font-mono text-slate-950 dark:text-white">{l.numero}</div>
                          <div className="text-[10px] text-slate-400 font-medium">ART: {l.art}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{l.equipmentModel}</td>
                        <td className="p-4 text-xs font-medium text-slate-500">{l.rt}</td>
                        <td className="p-4">
                          {l.status === LaudoStatus.EMITIDO ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-black font-mono">
                              <CheckCircle className="w-4 h-4" />
                              <span>CONVENIADO</span>
                            </div>
                          ) : l.status === LaudoStatus.VENCIDO ? (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-black font-mono animate-pulse">
                              <AlertTriangle className="w-4 h-4" />
                              <span>VENCIDO</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-black font-mono">
                              <Clock className="w-4 h-4" />
                              <span>EM ELABORAÇÃO</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {l.pdfUrl ? (
                            <a
                              href={l.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#134074] hover:bg-[#0B2545] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>DOWNLOAD PDF</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Disponível em breve</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* TAB: CHECKLISTS */}
          {activeTab === 'checklists' && (
            checklists.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">Nenhuma ficha de vistoria técnica arquivada para seus ativos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Vistoria Regulamentar</th>
                      <th className="p-4">Ativo de Inspeção</th>
                      <th className="p-4">Data Vistoriada</th>
                      <th className="p-4">Assinatura Digital</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300 font-sans">
                    {checklists.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px] font-black font-mono border border-slate-200/40">
                            {c.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{c.equipmentModel}</td>
                        <td className="p-4 text-xs font-mono text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-mono select-all bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-slate-400 max-w-xs truncate block" title={c.digitalSignature}>
                            {c.digitalSignature}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1 hover:border-[#134074] hover:text-[#134074] text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border border-slate-200 dark:border-slate-705 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>VISUALIZAR</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* TAB: EQUIPMENTS */}
          {activeTab === 'equipments' && (
            equipments.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">Não há frotas ou maquinários cadastrados no portal do cliente.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Dispositivo Ativo</th>
                      <th className="p-4">Marca Coberta</th>
                      <th className="p-4">Modelo</th>
                      <th className="p-4">Nº de Série / Fabricação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300 font-sans">
                    {equipments.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                        <td className="p-4 font-bold text-slate-950 dark:text-white">{e.type}</td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{e.brand}</td>
                        <td className="p-4 font-mono text-xs">{e.model}</td>
                        <td className="p-4 space-y-0.5 text-xs font-mono">
                          <div>S/N: {e.serialNumber}</div>
                          <div className="text-slate-400">Ano: {e.year}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}
