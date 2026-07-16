/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  Cog, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  User as UserIcon, 
  Shield, 
  KeyRound, 
  AlertCircle,
  Layers,
  Sparkles,
  Calculator
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ClientManager from './ClientManager';
import EquipmentManager from './EquipmentManager';
import LaudoManager from './LaudoManager';
import ChecklistManager from './ChecklistManager';
import ClientPortal from './ClientPortal';
import UserManager from './UserManager';
import LaudoGenerators from './LaudoGenerators';
import PricingModule from './PricingModule';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  isRealFirebase,
  onModeChange,
  setRealFirebaseEnabled,
  onFirebaseUnreachableChange,
  db
} from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { mockDb } from '../../lib/mockDb';
import { ClientData, EquipmentData, LaudoData, ChecklistData } from '../../types';

type SystemRole = 'admin' | 'client';

export default function DashboardMain() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [realFirebase, setRealFirebase] = useState(isRealFirebase);
  const [firebaseUnreachable, setFirebaseUnreachable] = useState(false);

  const [role, setRole] = useState<SystemRole>('admin');
  const [activeTab, setActiveTab] = useState<'indicators' | 'clients' | 'equipments' | 'laudos' | 'checklists' | 'users' | 'portal' | 'laudos_indep' | 'pricing'>('indicators');

  // Shared high-performance real-time cached states
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [laudos, setLaudos] = useState<LaudoData[]>([]);
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  // Trigger cache refresh for offline sandbox actions
  const handleDataChanged = () => {
    if (!realFirebase) {
      setClients(mockDb.getClients());
      setEquipments(mockDb.getEquipments());
      setLaudos(mockDb.getLaudos());
      setChecklists(mockDb.getChecklists());
    }
  };

  // Monitor Auth state changes and Base mode alterations
  useEffect(() => {
    const unsubscribeMode = onModeChange((enabled) => {
      setRealFirebase(enabled);
      if (!enabled) {
        setBypassAuth(true);
        setAuthLoading(false);
        setRole('admin');
        setActiveTab('indicators');
      } else {
        setBypassAuth(false);
        if (!auth.currentUser) {
          setCurrentUser(null);
        }
      }
    });

    const unsubscribeUnreachable = onFirebaseUnreachableChange((unreachable) => {
      setFirebaseUnreachable(unreachable);
      if (unreachable) {
        setAuthLoading(false);
      }
    });

    if (!isRealFirebase) {
      setBypassAuth(true);
      setAuthLoading(false);
      return () => {
        unsubscribeMode();
        unsubscribeUnreachable();
      };
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        setBypassAuth(false);
        
        // Vitor Leonardo gets assigned admin; other addresses map to clients
        if (user.email === 'vitorleonardocl@gmail.com') {
          setRole('admin');
          setActiveTab('indicators');
        } else {
          setRole('client');
          setActiveTab('portal');
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMode();
      unsubscribeUnreachable();
    };
  }, [realFirebase]);

  // High-performance real-time cached synchronization via onSnapshot
  useEffect(() => {
    if (!realFirebase) {
      // Offline Sandbox Mode: load instantly from localStorage/mockDb
      setClients(mockDb.getClients());
      setEquipments(mockDb.getEquipments());
      setLaudos(mockDb.getLaudos());
      setChecklists(mockDb.getChecklists());
      setGlobalLoading(false);
      return;
    }

    if (currentUser || bypassAuth) {
      setGlobalLoading(true);
      const dbInstance = db;
      if (!dbInstance) {
        setGlobalLoading(false);
        return;
      }

      let loaded = { clients: false, equipments: false, laudos: false, checklists: false };
      const checkLoaded = (key: keyof typeof loaded) => {
        loaded[key] = true;
        if (loaded.clients && loaded.equipments && loaded.laudos && loaded.checklists) {
          setGlobalLoading(false);
        }
      };

      const unsubClients = onSnapshot(collection(dbInstance, 'clients'), (snap) => {
        const arr: ClientData[] = [];
        snap.forEach(d => arr.push(d.data() as ClientData));
        setClients(arr);
        checkLoaded('clients');
      }, (err) => {
        console.warn("Error listening to clients:", err);
        checkLoaded('clients');
      });

      const unsubEquipments = onSnapshot(collection(dbInstance, 'equipments'), (snap) => {
        const arr: EquipmentData[] = [];
        snap.forEach(d => arr.push(d.data() as EquipmentData));
        setEquipments(arr);
        checkLoaded('equipments');
      }, (err) => {
        console.warn("Error listening to equipments:", err);
        checkLoaded('equipments');
      });

      const unsubLaudos = onSnapshot(collection(dbInstance, 'laudos'), (snap) => {
        const arr: LaudoData[] = [];
        snap.forEach(d => arr.push(d.data() as LaudoData));
        setLaudos(arr);
        checkLoaded('laudos');
      }, (err) => {
        console.warn("Error listening to laudos:", err);
        checkLoaded('laudos');
      });

      const unsubChecklists = onSnapshot(collection(dbInstance, 'checklists'), (snap) => {
        const arr: ChecklistData[] = [];
        snap.forEach(d => arr.push(d.data() as ChecklistData));
        setChecklists(arr);
        checkLoaded('checklists');
      }, (err) => {
        console.warn("Error listening to checklists:", err);
        checkLoaded('checklists');
      });

      // Absolute safety timeout fallback to make sure UI is never blocked if Firestore hangs
      const safetyTimer = setTimeout(() => {
        setGlobalLoading(false);
      }, 3000);

      return () => {
        unsubClients();
        unsubEquipments();
        unsubLaudos();
        unsubChecklists();
        clearTimeout(safetyTimer);
      };
    } else {
      setGlobalLoading(false);
    }
  }, [realFirebase, currentUser, bypassAuth]);

  // Google Authentication trigger
  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar autenticação com o Google.');
    }
  };

  // Sign out trigger
  const handleSignOut = async () => {
    try {
      if (isRealFirebase) {
        await logoutUser();
      }
      setCurrentUser(null);
      setBypassAuth(false);
      setRole('admin');
      setActiveTab('indicators');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Authing spinner loader
  if (authLoading) {
    return (
      <section id="restricted-area" className="py-24 bg-slate-100 dark:bg-slate-950 min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-10 h-10 border-4 border-[#134074] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-black">Conectando ao sistema seguro...</p>
          <div className="pt-6">
            <button
              onClick={() => setRealFirebaseEnabled(false)}
              className="text-xs text-[#134074] dark:text-[#4895EF] border border-[#134074]/30 dark:border-[#4895EF]/30 hover:bg-[#134074]/10 px-4 py-2 rounded-xl font-bold font-mono tracking-wide uppercase transition-all cursor-pointer"
            >
              Forçar Modo Sandbox Offline
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Not logged in or bypassed: show premium custom authentication page
  if (!currentUser && !bypassAuth && isRealFirebase) {
    return (
      <section id="restricted-area" className="py-16 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors duration-300 scroll-mt-16 flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-8 text-center font-sans">
            
            {/* Custom security badge header */}
            <div className="inline-flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-950 rounded-2xl mx-auto shadow-inner">
              <span className="p-2 bg-[#0B2545] text-white rounded-xl shadow-md">
                <KeyRound className="w-5 h-5" />
              </span>
              <div className="text-left px-2 leading-none">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#134074] dark:text-[#4895EF] font-bold">Autenticação</span>
                <p className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider font-sans leading-none pt-0.5">Área Restrita</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">Acesso ao Acervo Técnico</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans px-2">
                Área de acesso restrito para o Engenheiro Responsável Vitor Leonardo e empresas conveniadas sob as normas e diretrizes do CREA-PE e LGPD.
              </p>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-left text-xs leading-relaxed font-mono">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              {/* Google Sign-in primary action */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#0B2545] hover:bg-[#134074] text-white p-3.5 rounded-xl text-xs font-black font-mono uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all cursor-pointer font-sans"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Entrar com o Google</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
              <Shield className="w-3.5 h-3.5 text-[#134074]" />
              <span>Painel Auditado em Conformidade com a LGPD</span>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="restricted-area" className="py-16 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors duration-300 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Master layout block */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Mobile Navigation Header (visible only on mobile/tablet) */}
          <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
            {/* Compact User Info and Logout */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div className="leading-tight text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {currentUser?.displayName || currentUser?.email || 'Vitor Leonardo C.'}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">Cargo: {role === 'admin' ? 'ADMIN' : 'CLIENTE'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Small Sandbox toggle */}
                <button
                  onClick={() => setRealFirebaseEnabled(!realFirebase)}
                  className="text-[8px] font-extrabold font-mono uppercase bg-[#134074]/10 dark:bg-[#4895EF]/10 text-[#134074] dark:text-[#4895EF] border border-[#134074]/30 dark:border-[#4895EF]/30 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  {realFirebase ? 'Firestore' : 'Local'}
                </button>
                
                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 pb-1 scrollbar-none snap-x">
              {role === 'admin' ? (
                <>
                  <button
                    onClick={() => setActiveTab('indicators')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'indicators'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Indicadores</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'clients'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Clientes</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('equipments')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'equipments'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <Cog className="w-3.5 h-3.5" />
                    <span>Ativos</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('laudos_indep')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 border border-emerald-500/20 ${
                      activeTab === 'laudos_indep'
                        ? 'bg-[#0B2545] text-white border-emerald-500'
                        : 'bg-emerald-500/5 text-slate-600 dark:text-emerald-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Geradores IA</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('checklists')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'checklists'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Checklists</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'users'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Contas</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                      activeTab === 'pricing'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Precificação</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveTab('portal')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all snap-start shrink-0 ${
                    activeTab === 'portal'
                      ? 'bg-[#0B2545] text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Portal do Cliente</span>
                </button>
              )}
            </div>
          </div>

          {/* Dashboard Lateral Navigation Rail */}
          <div className="hidden lg:flex lg:col-span-3 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex-col justify-between">
            
            <div className="space-y-6">
              {/* Authenticated identity card */}
              <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div className="max-w-[70%] text-left">
                    <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">LOGADO COM SUCESSO</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={currentUser?.displayName || currentUser?.email || 'Vitor Leonardo C.'}>
                      {currentUser?.displayName || currentUser?.email || (role === 'admin' ? 'Vitor Leonardo C.' : 'Metalúrgica PE S.A.')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center justify-center gap-1 text-[10px] font-mono tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded">
                    <UserIcon className="w-3 h-3 text-[#134074]" />
                    <span>Cargo: {role === 'admin' ? 'ENGENHEIRO (ADMIN)' : 'CLIENTE'}</span>
                  </div>

                  {/* Environment Switcher */}
                  <div className="space-y-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-black block leading-none mb-1">Operando em:</span>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[10px] font-bold ${realFirebase ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {realFirebase ? 'Google Firestore' : 'Sandbox (Offline)'}
                      </span>
                      <button
                        onClick={() => setRealFirebaseEnabled(!realFirebase)}
                        className="text-[9px] font-extrabold font-mono uppercase bg-[#134074]/10 dark:bg-[#4895EF]/10 text-[#134074] dark:text-[#4895EF] border border-[#134074]/30 dark:border-[#4895EF]/30 px-1.5 py-0.5 rounded hover:bg-[#134074]/20 cursor-pointer"
                        title="Alternar entre banco Firestore em Nuvem ou Local"
                      >
                        Trocar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs groups according to roles permissioning */}
              <div className="space-y-1">
                {role === 'admin' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('indicators')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'indicators' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 shrink-0" />
                      <span>Painel Indicadores</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'clients' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Clientes</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('equipments')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'equipments' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <Cog className="w-4 h-4 shrink-0" />
                      <span>Ativos / Equipamentos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('laudos_indep')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-emerald-500/20 bg-emerald-500/5 ${
                        activeTab === 'laudos_indep' 
                          ? 'bg-[#0B2545] text-white border-emerald-500' 
                          : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-emerald-500 dark:hover:text-emerald-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span className="flex items-center gap-1.5">
                        <span className="font-sans">Geradores com IA</span>
                        <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-mono font-black animate-pulse">IA</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('checklists')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'checklists' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 shrink-0" />
                      <span>Checklists Vistorias</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'users' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <KeyRound className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="flex items-center gap-1.5">
                        <span>Contas / Acessos</span>
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 py-0.2 rounded font-mono font-black animate-pulse">NOVO</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('pricing')}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'pricing' 
                          ? 'bg-[#0B2545] text-white' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      <Calculator className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span className="flex items-center gap-1.5">
                        <span>Precificação Inteligente</span>
                        <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-mono font-black animate-pulse">NOVO</span>
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveTab('portal')}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'portal' 
                        ? 'bg-[#0B2545] text-white' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Portal do Cliente</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logout control action */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer font-mono"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Conta</span>
              </button>
            </div>

          </div>

          {/* Core Content Area */}
          <div className="col-span-1 lg:col-span-9 p-4 md:p-10 text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900 scrollbar-thin">
            <div className="animate-fade-in max-w-full">
              
              {realFirebase && firebaseUnreachable && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-850 dark:text-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono shadow-sm">
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong className="block font-sans uppercase font-black text-[10px] tracking-wide mb-0.5">Nuvem Firebase Inacessível</strong>
                      <span className="font-sans text-slate-600 dark:text-slate-300">
                        O Firebase foi bloqueado pelo iFrame do navegador (comum devido a bloqueio de Cookies de Terceiros). Clique ao lado para alternar para o <strong>Modo Sandbox Offline</strong> e operar instantaneamente com salvamento local instantâneo!
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setRealFirebaseEnabled(false)}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all font-sans cursor-pointer uppercase text-[9px] tracking-wider whitespace-nowrap shadow-md"
                  >
                    Ativar Sandbox Offline
                  </button>
                </div>
              )}

              {activeTab === 'indicators' && role === 'admin' && (
                <AdminDashboard 
                  clients={clients} 
                  laudos={laudos} 
                  checklists={checklists} 
                  equipments={equipments} 
                  loading={globalLoading} 
                />
              )}
              {activeTab === 'clients' && role === 'admin' && (
                <ClientManager 
                  clients={clients} 
                  loading={globalLoading} 
                  onDataChanged={handleDataChanged} 
                />
              )}
              {activeTab === 'equipments' && role === 'admin' && (
                <EquipmentManager 
                  equipments={equipments} 
                  clients={clients} 
                  loading={globalLoading} 
                  onDataChanged={handleDataChanged} 
                />
              )}
              {activeTab === 'laudos' && role === 'admin' && (
                <LaudoManager 
                  laudos={laudos} 
                  clients={clients} 
                  equipments={equipments} 
                  loading={globalLoading} 
                  onDataChanged={handleDataChanged} 
                />
              )}
              {activeTab === 'laudos_indep' && role === 'admin' && (
                <LaudoGenerators clients={clients} />
              )}
              {activeTab === 'checklists' && role === 'admin' && (
                <ChecklistManager 
                  checklists={checklists} 
                  clients={clients} 
                  equipments={equipments} 
                  loading={globalLoading} 
                  onDataChanged={handleDataChanged} 
                />
              )}
              {activeTab === 'users' && role === 'admin' && (
                <UserManager 
                  clients={clients} 
                />
              )}
              {activeTab === 'pricing' && role === 'admin' && (
                <PricingModule clients={clients} />
              )}
              {activeTab === 'portal' && (
                <ClientPortal 
                  clients={clients} 
                  laudos={laudos} 
                  checklists={checklists} 
                  equipments={equipments} 
                  loading={globalLoading} 
                />
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
