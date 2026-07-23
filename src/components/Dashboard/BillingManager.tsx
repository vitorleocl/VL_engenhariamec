/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Search, 
  FileText, 
  Landmark, 
  ArrowUpRight, 
  Percent, 
  Briefcase, 
  Building2, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { isRealFirebase, db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { Proposal } from "./PricingModule";

interface BillingManagerProps {
  clients?: any[];
}

export default function BillingManager({ clients = [] }: BillingManagerProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "pagos" | "pendentes">("todos");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load proposals from Firestore and/or LocalStorage
  const loadProposals = async () => {
    setLoading(true);
    let localProposals: Proposal[] = [];
    const saved = localStorage.getItem("vitor_engmec_pricing_proposals");
    if (saved) {
      try {
        localProposals = JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse history", err);
      }
    }

    if (isRealFirebase) {
      try {
        const querySnapshot = await getDocs(collection(db, "proposals"));
        const firestoreProposals: Proposal[] = [];
        querySnapshot.forEach(doc => {
          firestoreProposals.push(doc.data() as Proposal);
        });

        // Merge keeping Firestore as source of truth
        const mergedMap = new Map<string, Proposal>();
        localProposals.forEach(p => mergedMap.set(p.id, p));
        firestoreProposals.forEach(p => mergedMap.set(p.id, p));

        const merged = Array.from(mergedMap.values()).sort((a, b) => b.id.localeCompare(a.id));
        setProposals(merged);
        localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(merged));
      } catch (err) {
        console.error("Failed to fetch proposals from Firestore:", err);
        setProposals(localProposals);
      }
    } else {
      setProposals(localProposals);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Handle paid status check change
  const handleTogglePaid = async (proposalId: string, currentPaid: boolean) => {
    setUpdatingId(proposalId);
    try {
      const updatedList = proposals.map(p => {
        if (p.id === proposalId) {
          return { ...p, paid: !currentPaid };
        }
        return p;
      });

      setProposals(updatedList);
      localStorage.setItem("vitor_engmec_pricing_proposals", JSON.stringify(updatedList));

      const updatedProposal = updatedList.find(p => p.id === proposalId);
      if (updatedProposal) {
        if (isRealFirebase) {
          await setDoc(doc(db, "proposals", proposalId), updatedProposal);
        }
      }
    } catch (err) {
      console.error("Error updating paid status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Get approved proposals
  const approvedProposals = proposals.filter(p => p.status === "aprovado");

  // Calculations for Financial Health (Saúde Financeira)
  const totalBilled = approvedProposals.reduce((sum, p) => sum + (p.pricingInfo?.totalGeral || 0), 0);
  const totalReceived = approvedProposals.filter(p => p.paid).reduce((sum, p) => sum + (p.pricingInfo?.totalGeral || 0), 0);
  const totalPending = approvedProposals.filter(p => !p.paid).reduce((sum, p) => sum + (p.pricingInfo?.totalGeral || 0), 0);

  // Conversion rate (Approved / Total)
  const totalCreated = proposals.length;
  const conversionRate = totalCreated > 0 ? (approvedProposals.length / totalCreated) * 100 : 0;

  // Formatting Currency
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Filter approved proposals based on search and sub-status
  const filteredProposals = approvedProposals.filter(p => {
    const matchesSearch = 
      p.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "todos") return matchesSearch;
    if (statusFilter === "pagos") return matchesSearch && p.paid;
    if (statusFilter === "pendentes") return matchesSearch && !p.paid;
    return matchesSearch;
  });

  // Monthly billing aggregation for Recharts BarChart
  const getMonthlyChartData = () => {
    const monthlyMap = new Map<string, { name: string; Pago: number; Pendente: number }>();
    
    // Sort oldest first to display sequentially
    const sortedApproved = [...approvedProposals].sort((a, b) => {
      const dateA = a.signedAt || a.id.split("-").slice(1, 3).join("-") || "";
      const dateB = b.signedAt || b.id.split("-").slice(1, 3).join("-") || "";
      return dateA.localeCompare(dateB);
    });

    sortedApproved.forEach(p => {
      let monthYear = "S/D";
      if (p.signedAt) {
        const dateObj = new Date(p.signedAt);
        if (!isNaN(dateObj.getTime())) {
          monthYear = dateObj.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
        }
      } else {
        // Fallback from ID format (e.g., PROP-2026-001)
        const match = p.id.match(/PROP-(\d{4})-\d+/);
        if (match) {
          monthYear = `Anual ${match[1]}`;
        }
      }

      const current = monthlyMap.get(monthYear) || { name: monthYear, Pago: 0, Pendente: 0 };
      const val = p.pricingInfo?.totalGeral || 0;
      if (p.paid) {
        current.Pago += val;
      } else {
        current.Pendente += val;
      }
      monthlyMap.set(monthYear, current);
    });

    const data = Array.from(monthlyMap.values());
    if (data.length === 0) {
      return [{ name: "Sem Dados", Pago: 0, Pendente: 0 }];
    }
    return data;
  };

  // Distribution chart data
  const getPieChartData = () => {
    return [
      { name: "Recebido (Pago)", value: totalReceived, color: "#10b981" },
      { name: "Pendente", value: totalPending, color: "#f59e0b" }
    ];
  };

  const monthlyData = getMonthlyChartData();
  const pieData = getPieChartData();

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header with Title and landmark */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner mb-2.5">
            <span className="p-1 bg-[#0B2545] text-white rounded-lg">
              <Landmark className="w-4 h-4" />
            </span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#134074] dark:text-[#4895EF] font-extrabold pr-2">Módulo Financeiro</span>
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">Faturamento &amp; Saúde Financeira</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitore a saúde financeira da VL Engenharia, controle pagamentos de orçamentos aprovados e veja projeções de receita.
          </p>
        </div>
        
        <button
          onClick={loadProposals}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider font-mono uppercase transition-all shadow-sm cursor-pointer"
        >
          Atualizar Dados
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#134074] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-black">Carregando métricas financeiras...</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Faturado */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Billed (Approved)</span>
                <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Faturado Geral</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{formatBRL(totalBilled)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span>{approvedProposals.length} orçamentos aprovados</span>
              </p>
            </div>

            {/* Card 2: Total Recebido */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Received</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-emerald-500 uppercase">Recebido (Quitado)</p>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{formatBRL(totalReceived)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none">
                {totalBilled > 0 ? ((totalReceived / totalBilled) * 100).toFixed(1) : 0}% do total já foi recebido
              </p>
            </div>

            {/* Card 3: Total Pendente */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Payment</span>
                <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-amber-500 uppercase">A Receber (Em Aberto)</p>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 truncate">{formatBRL(totalPending)}</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none">
                {approvedProposals.filter(p => !p.paid).length} cobranças em aberto no sistema
              </p>
            </div>

            {/* Card 4: Taxa de Conversão */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Conversion rate</span>
                <span className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                  <Percent className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-purple-500 uppercase">Orçamentos Fechados</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{conversionRate.toFixed(1)}%</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none">
                Total de {totalCreated} orçamentos elaborados
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bar chart - Monthly Billing */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left">
              <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-[#134074]" />
                <span>Fluxo Mensal de Faturamento</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `R$ ${value / 1000}k`} 
                    />
                    <Tooltip 
                      formatter={(value) => [formatBRL(value as number), ""]}
                      contentStyle={{ background: "#1e293b", color: "#f8fafc", borderRadius: "12px", border: "none", fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="Pago" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Recebido" />
                    <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="A Receber" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doughnut Chart - Paid vs Pending Distribution */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  <span>Distribuição de Receitas</span>
                </h4>
                {totalBilled === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-mono">
                    Nenhum orçamento aprovado para rateio
                  </div>
                ) : (
                  <div className="h-44 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatBRL(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center leading-tight">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Total Geral</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                        {formatBRL(totalBilled)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Recebido</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {totalBilled > 0 ? ((totalReceived / totalBilled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-500">Pendente</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {totalBilled > 0 ? ((totalPending / totalBilled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Approved Proposals Table / Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">Carteira de Cobranças (Aprovados)</h3>
                <p className="text-xs text-slate-500">Consulte o status individual de cada orçamento assinado e mude o status de pagamento.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar cliente ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-sans text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#134074] w-48"
                  />
                </div>

                {/* Filters */}
                <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-950">
                  <button
                    onClick={() => setStatusFilter("todos")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer ${
                      statusFilter === "todos"
                        ? "bg-[#0B2545] text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStatusFilter("pagos")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer ${
                      statusFilter === "pagos"
                        ? "bg-emerald-500 text-white"
                        : "text-slate-500 hover:text-emerald-500"
                    }`}
                  >
                    Pagos
                  </button>
                  <button
                    onClick={() => setStatusFilter("pendentes")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer ${
                      statusFilter === "pendentes"
                        ? "bg-amber-500 text-white"
                        : "text-slate-500 hover:text-amber-500"
                    }`}
                  >
                    Pendentes
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredProposals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  Nenhum orçamento aprovado encontrado para os filtros selecionados.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      <th className="py-3 px-4 font-black">Orçamento ID</th>
                      <th className="py-3 px-4 font-black">Empresa Cliente</th>
                      <th className="py-3 px-4 font-black">Contato / Responsável</th>
                      <th className="py-3 px-4 font-black">Data Aprovação</th>
                      <th className="py-3 px-4 font-black">Valor Total</th>
                      <th className="py-3 px-4 font-black text-center">Status Pagamento</th>
                      <th className="py-3 px-4 font-black text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredProposals.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{p.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{p.clientCompany}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          <p className="font-medium">{p.clientName}</p>
                          <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">{p.clientEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {p.signedAt 
                                ? new Date(p.signedAt).toLocaleDateString("pt-BR") 
                                : "N/D"
                              }
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-slate-100">
                          {formatBRL(p.pricingInfo?.totalGeral || 0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            <button
                              onClick={() => handleTogglePaid(p.id, !!p.paid)}
                              disabled={updatingId === p.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black uppercase transition-all border shrink-0 cursor-pointer ${
                                p.paid 
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${p.paid ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                              <span>{p.paid ? "PACO (QUITADO)" : "PENDENTE"}</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedProposal(p)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-150 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Ver Resumo"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Summary Modal */}
          {selectedProposal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 text-left space-y-6 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#0B2545] text-white rounded-lg">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-black">Resumo de Escopo</p>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Orçamento {selectedProposal.id}</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProposal(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                {/* Scope list */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-black">Cliente</p>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedProposal.clientCompany}</p>
                      <p className="text-[11px] text-slate-500">Responsável: {selectedProposal.clientName} ({selectedProposal.clientEmail})</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-black">Serviços Contratados</p>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedProposal.services?.map((svc) => (
                        <div key={svc.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{svc.name}</span>
                            <span className="font-mono text-slate-500 font-bold">{formatBRL(svc.basePrice)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{svc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-black">Condição de Pagamento</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
                      {selectedProposal.pricingInfo?.paymentTerms || "À vista"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Valor Total:</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {formatBRL(selectedProposal.pricingInfo?.totalGeral || 0)}
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      handleTogglePaid(selectedProposal.id, !!selectedProposal.paid);
                      setSelectedProposal(prev => prev ? { ...prev, paid: !prev.paid } : null);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedProposal.paid 
                        ? "bg-amber-500 text-white" 
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    Marcar como {selectedProposal.paid ? "Pendente" : "Pago"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
