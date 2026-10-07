"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";
import { Landmark, ArrowDownLeft, RefreshCw, Search, Clock } from "lucide-react";

type TransactionItem = {
  id: string;
  userId: string;
  userName: string;
  network: string;
  phone: string;
  bundle: string;
  amount: number;
  status: string;
  date: string;
  type: string;
  paymentMethod?: string;
  description?: string;
};

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.message ?? detail?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "pending" | "failed">("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setStatus({ kind: "loading", message: "Fetching wallet transaction logs..." });
    try {
      const data = await api<TransactionItem[]>("/api/transactions");
      setTransactions(data);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Failed to load transactions:", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load transactions" });
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Status Filter
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter) return false;

      // Search
      if (!search) return true;
      const lower = search.toLowerCase();
      return (
        t.id?.toLowerCase().includes(lower) ||
        t.userId?.toLowerCase().includes(lower) ||
        t.userName?.toLowerCase().includes(lower) ||
        t.description?.toLowerCase().includes(lower) ||
        t.phone?.toLowerCase().includes(lower)
      );
    });
  }, [transactions, search, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalDeposits = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    transactions.forEach((t) => {
      const s = t.status.toLowerCase();
      if (s === "success" || s === "delivered") {
        totalDeposits += t.amount || 0;
        successfulCount++;
      } else if (s === "pending") {
        pendingCount++;
      } else if (s === "failed") {
        failedCount++;
      }
    });

    return {
      totalDeposits,
      successfulCount,
      pendingCount,
      failedCount,
      totalCount: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 md:space-y-8 text-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-slate-600 font-medium">Admin Financial Control</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2.5 truncate">
            <Landmark className="h-7 w-7 text-amber-500 shrink-0" />
            <span className="truncate">Wallet Top-up Transactions</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {status.kind !== "idle" && (
            <div
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold max-w-[200px] truncate ${
                status.kind === "error"
                  ? "bg-rose-100 text-rose-700"
                  : status.kind === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status.message}
            </div>
          )}
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Wallet Deposits
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 truncate">
            ₵{stats.totalDeposits.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">
            {stats.successfulCount} successful deposits
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Top-ups
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 truncate">{stats.pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">Awaiting verification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs sm:col-span-2 lg:col-span-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Top-up Records
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-700 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 truncate">{stats.totalCount}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">Logs stored in database</p>
        </div>
      </div>

      {/* Main Transactions Log Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-xs min-w-0 max-w-full overflow-hidden">
        <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Audit Logs</p>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 truncate">
              Wallet Deposits & Top-ups
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 shrink-0">
                {filteredTransactions.length}
              </span>
            </h2>
          </div>

          {/* Controls & Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 max-w-full">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:ring-1 focus:ring-[#1e3a8a] outline-none transition"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto max-w-full">
              {(["all", "success", "pending", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Mobile View: Cards */}
        <div className="space-y-3 md:hidden">
          {filteredTransactions.map((tx) => {
            const isSuccess = tx.status.toLowerCase() === "success";
            const isFailed = tx.status.toLowerCase() === "failed";

            return (
              <div
                key={tx.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2.5 shadow-2xs min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    <ArrowDownLeft className="h-3 w-3" /> Wallet Deposit
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isSuccess
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : isFailed
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm truncate">{tx.userName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{tx.userId}</p>
                  </div>
                  <p className="text-base font-black shrink-0 text-emerald-700">
                    +₵{tx.amount?.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-slate-600 font-medium text-[11px] gap-2">
                  <span className="truncate">{tx.description || "Wallet Top-up"}</span>
                  <span className="text-slate-400 shrink-0">{new Date(tx.date).toLocaleDateString()}</span>
                </div>

                <div className="pt-1 min-w-0 overflow-hidden">
                  <CopyButton text={tx.id} prefix="REF:" className="text-[10px] font-mono text-slate-500 max-w-full truncate" />
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-500">No top-up transactions found.</p>
          )}
        </div>

        {/* Tablet & Desktop View: Responsive Horizontally Scrollable Table */}
        <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs min-w-0">
          <table className="w-full min-w-[950px] text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5 whitespace-nowrap w-[110px]">Type</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Customer / User</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[220px]">Gateway / Method</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[260px]">Reference ID</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap w-[140px]">Amount Credited</th>
                <th className="px-4 py-3.5 whitespace-nowrap w-[180px]">Date</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap w-[110px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isSuccess = tx.status.toLowerCase() === "success";
                const isFailed = tx.status.toLowerCase() === "failed";

                return (
                  <tr key={tx.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ArrowDownLeft className="h-3 w-3" /> Top-up
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-[180px]">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{tx.userName}</p>
                        <p className="text-xs text-slate-500 truncate">{tx.userId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-[220px]">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {tx.phone || "MOOLRE"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{tx.description || "Wallet deposit"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-[260px]">
                      <div className="min-w-0">
                        <CopyButton
                          text={tx.id}
                          prefix="REF:"
                          className="text-xs font-mono font-semibold text-slate-600 truncate max-w-full"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="font-black text-sm text-emerald-700">
                        +₵{tx.amount?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          isSuccess
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : isFailed
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    No top-up transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
