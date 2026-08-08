/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ClientData } from '../../types';
import { isRealFirebase, db } from '../../lib/firebase';
import { mockDb } from '../../lib/mockDb';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Search, ChevronDown, Check, X } from 'lucide-react';

interface ClientSelectorProps {
  onSelectClient: (client: ClientData) => void;
  selectedClientId?: string;
  clients?: ClientData[]; // Optional prop to avoid double-fetching if passed from parent
  label?: string;
  placeholder?: string;
  theme?: 'light' | 'dark' | 'auto'; // theme styling compatibility
}

export default function ClientSelector({
  onSelectClient,
  selectedClientId = '',
  clients: propClients,
  label = 'Selecionar Cliente Cadastrado',
  placeholder = 'Buscar cliente...',
  theme = 'auto'
}: ClientSelectorProps) {
  const [clients, setClients] = useState<ClientData[]>(propClients || []);
  const [loading, setLoading] = useState(!propClients);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync clients with prop if provided
  useEffect(() => {
    if (propClients) {
      setClients(propClients);
      setLoading(false);
    }
  }, [propClients]);

  // Load clients if not passed from parent
  useEffect(() => {
    if (!propClients) {
      const loadClients = async () => {
        setLoading(true);
        try {
          if (isRealFirebase) {
            const querySnapshot = await getDocs(collection(db, 'clients'));
            const clientsArray: ClientData[] = [];
            querySnapshot.forEach((docSnap) => {
              const c = docSnap.data() as ClientData;
              if (c && c.name && 
                  !c.name.toLowerCase().includes('teste') && 
                  !c.company?.toLowerCase().includes('teste') &&
                  !c.name.toLowerCase().includes('clienteteste')) {
                clientsArray.push(c);
              }
            });
            setClients(clientsArray);
          } else {
            setClients(mockDb.getClients());
          }
        } catch (e) {
          console.error("Error loading clients in ClientSelector:", e);
          // Fallback to local storage if firestore is blocked or errors
          setClients(mockDb.getClients());
        } finally {
          setLoading(false);
        }
      };
      loadClients();
    }
  }, [propClients]);

  // Set the initial selected client based on selectedClientId
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const matched = clients.find(c => c.id === selectedClientId);
      if (matched) {
        setSelectedClient(matched);
      }
    } else if (!selectedClientId) {
      setSelectedClient(null);
    }
  }, [selectedClientId, clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredClients = clients.filter(c => {
    const search = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      (c.company && c.company.toLowerCase().includes(search)) ||
      (c.cnpj_cpf && c.cnpj_cpf.includes(search))
    );
  });

  const handleSelect = (client: ClientData) => {
    setSelectedClient(client);
    onSelectClient(client);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClient(null);
    onSelectClient({
      id: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      cnpj_cpf: '',
      address: '',
      createdAt: '',
      updatedAt: ''
    });
  };

  // Determine styles based on theme
  const isDark = theme === 'dark';
  const bgInput = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-950 border-slate-800'; // Match report dark themes or dashboard
  const textInput = 'text-white';
  const dropdownBg = 'bg-slate-900 border-slate-800';
  const dropdownHover = 'hover:bg-slate-800';
  const textMuted = 'text-slate-400';

  return (
    <div className="space-y-1.5 w-full text-left" ref={dropdownRef}>
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Toggle Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`flex items-center justify-between w-full rounded-xl px-4 py-2.5 text-xs font-sans transition-all focus:outline-none border focus:border-red-500 cursor-pointer ${bgInput} ${textInput}`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Users className="h-4 w-4 text-[#4895EF] shrink-0" />
            {loading ? (
              <span className={textMuted}>Carregando clientes...</span>
            ) : selectedClient ? (
              <span className="font-semibold truncate">
                {selectedClient.company || selectedClient.name} {selectedClient.cnpj_cpf ? `(CNPJ: ${selectedClient.cnpj_cpf})` : ''}
              </span>
            ) : (
              <span className={textMuted}>Selecione um cliente cadastrado</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {selectedClient && (
              <span 
                onClick={handleClear} 
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Limpar seleção"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute z-50 left-0 right-0 mt-1.5 rounded-xl border shadow-xl p-2.5 space-y-2 max-h-60 overflow-y-auto ${dropdownBg}`}>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
              />
            </div>

            {/* List of Clients */}
            <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  Nenhum cliente cadastrado com este termo.
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = selectedClient?.id === client.id;
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelect(client)}
                      className={`flex items-center justify-between w-full text-left rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#134074]/30 border border-[#134074] text-white' 
                          : `text-slate-200 ${dropdownHover}`
                      }`}
                    >
                      <div className="truncate pr-4">
                        <p className="font-bold truncate">{client.company || client.name}</p>
                        {client.company && client.company !== client.name && (
                          <p className="text-[10px] text-slate-400 truncate">{client.name}</p>
                        )}
                        <p className="text-[9px] text-slate-500 font-mono tracking-wider truncate">
                          {client.cnpj_cpf ? `CNPJ/CPF: ${client.cnpj_cpf}` : ''}
                          {client.email ? ` • ${client.email}` : ''}
                        </p>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#4895EF] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
