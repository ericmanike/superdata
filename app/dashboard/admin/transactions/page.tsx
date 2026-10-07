"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";
import { Landmark, ArrowDownLeft, RefreshCw, Search, CheckCircle2, Clock, XCircle } from "lucide-react";

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
    <div className="space-y-6 md:space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs md:text-sm text-slate-600 font-medium">Admin Financial Control</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Landmark className="h-7 w-7 text-amber-500" />
            Wallet Top-up Transactions
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {status.kind !== "idle" && (
            <div
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
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
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Wallet Deposits
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₵{stats.totalDeposits.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {stats.successfulCount} successful deposits
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Top-ups
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Awaiting payment verification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Top-up Records
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-700">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalCount}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Transaction logs stored</p>
        </div>
      </div>

      {/* Main Transactions Log Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-xs">
        <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Audit Logs</p>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
              Wallet Deposits & Top-ups
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {filteredTransactions.length}
              </span>
            </h2>
          </div>

          {/* Controls & Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, email, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:ring-1 focus:ring-[#1e3a8a] outline-none transition"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto">
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
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ArrowDownLeft className="h-3 w-3" /> Wallet Deposit
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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

                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{tx.userName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{tx.userId}</p>
                  </div>
                  <p className="text-base font-black shrink-0 text-emerald-700">
                    +₵{tx.amount?.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-slate-600 font-medium">
                  <span>{tx.description || "Wallet Top-up"}</span>
                  <span className="text-[11px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</span>
                </div>

                <div className="pt-1">
                  <CopyButton text={tx.id} prefix="REF:" className="text-[10px] font-mono text-slate-500" />
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-500">No top-up transactions found.</p>
          )}
        </div>

        {/* Tablet & Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Customer / User</th>
                <th className="px-4 py-3">Gateway / Method</th>
                <th className="px-4 py-3">Reference ID</th>
                <th className="px-4 py-3 text-right">Amount Credited</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isSuccess = tx.status.toLowerCase() === "success";
                const isFailed = tx.status.toLowerCase() === "failed";

                return (
                  <tr key={tx.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ArrowDownLeft className="h-3 w-3" /> Top-up
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{tx.userName}</p>
                        <p className="text-xs text-slate-500">{tx.userId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {tx.phone || "MOOLRE"}
                        </p>
                        <p className="text-xs text-slate-500">{tx.description || "Wallet deposit"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <CopyButton
                        text={tx.id}
                        prefix="REF:"
                        className="text-xs font-mono font-semibold text-slate-600"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-black text-sm text-emerald-700">
                        +₵{tx.amount?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
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
