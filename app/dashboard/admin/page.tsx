"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  RefreshCw,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Zap
} from "lucide-react";
import type { Bundle, Order, User as MockUser } from "@/lib/mockData";

type User = MockUser & { role?: 'user' | 'agent' | 'admin' | 'moderator' };
type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dakaziBalance, setDakaziBalance] = useState<any>(null);
  const [adhBalance, setAdhBalance] = useState<any>(null);
  const [activeProvider, setActiveProvider] = useState<"dakazina" | "adhGroup">("dakazina");
  const [updatingProvider, setUpdatingProvider] = useState<boolean>(false);

  useEffect(() => {
    refreshAll();
    balance();
    fetchActiveProvider();
  }, []);

  async function fetchActiveProvider() {
    try {
      const res = await fetch("/api/admin/provider", { cache: "no-store" });
      const data = await res.json();
      if (data?.activeProvider) {
        setActiveProvider(data.activeProvider === "dakazi" ? "dakazina" : data.activeProvider);
      }
    } catch (err) {
      console.error("Error fetching active provider:", err);
    }
  }

  async function handleProviderChange(newProvider: "dakazina" | "adhGroup") {
    if (newProvider === activeProvider || updatingProvider) return;
    setUpdatingProvider(true);
    setStatus({ kind: "loading", message: `Switching active provider to ${newProvider === "dakazina" ? "Dakazina" : "ADH Group"}...` });
    try {
      const res = await fetch("/api/admin/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: newProvider }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveProvider(newProvider);
        setStatus({
          kind: "success",
          message: `Active provider set to ${newProvider === "dakazina" ? "Dakazina API" : "ADH Group API"}`,
        });
      } else {
        setStatus({
          kind: "error",
          message: data.message || "Failed to update active provider",
        });
      }
    } catch (err: any) {
      setStatus({
        kind: "error",
        message: err?.message || "Error updating provider",
      });
    } finally {
      setUpdatingProvider(false);
    }
  }

  async function refreshAll() {
    setStatus({ kind: "loading", message: "Updating overview data..." });
    try {
      const [usersData, bundlesData, ordersData] = await Promise.all([
        api<User[]>("/api/users").catch(() => []),
        api<any[]>("/api/bundles").catch(() => []),
        api<Order[]>("/api/orders").catch(() => []),
      ]);

      setUsers(usersData);
      setBundles(bundlesData);
      setOrders(ordersData);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Admin refresh error:", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load overview data" });
    }
  }

  const balance = async () => {
    try {
      const resDakazi = await fetch(`/api/testingDakazi`, { cache: "no-store" });
      const dataDakazi = await resDakazi.json();
      setDakaziBalance(dataDakazi);
    } catch (err) {
      console.error("Error fetching Dakazi balance:", err);
    }

    try {
      const resAdh = await fetch(`/api/adhGroupBalance`, { cache: "no-store" });
      const dataAdh = await resAdh.json();
      setAdhBalance(dataAdh);
    } catch (err) {
      console.error("Error fetching ADH balance:", err);
    }
  };

  const adminWallet = users.find(u => u.id === session?.user?.id)?.walletBalance?.toFixed(2) || "0.00";
  const pendingOrdersCount = orders.filter((o) => o.status !== "Delivered").length;
  const totalVolumeOrders = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base text-slate-600 font-medium">Admin Control</p>
          <h1 className="text-3xl font-bold text-slate-900">Operations Console</h1>
        </div>
        {status.kind !== "idle" && (
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
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
      </div>

      {/* Main Dashboard Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-purple-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">{users.length}</p>
            <p className="text-[11px] text-purple-700 font-bold mt-2 flex items-center gap-1">
              Manage Users &rarr;
            </p>
          </div>
        </Link>

        {/* Active Bundles */}
        <Link
          href="/dashboard/admin/bundles"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-amber-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bundles</p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">{bundles.length}</p>
            <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
              Manage Packages &rarr;
            </p>
          </div>
        </Link>

        {/* Total Orders */}
        <Link
          href="/dashboard/admin/orders"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-blue-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">{orders.length}</p>
            <p className="text-[11px] text-blue-700 font-bold mt-2 flex items-center gap-1">
              View Orders &rarr;
            </p>
          </div>
        </Link>

        {/* Pending Fulfillment */}
        <Link
          href="/dashboard/admin/orders"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-rose-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Orders</p>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">{pendingOrdersCount}</p>
            <p className="text-[11px] text-rose-700 font-bold mt-2 flex items-center gap-1">
              Process Orders &rarr;
            </p>
          </div>
        </Link>
      </div>

      {/* Second Row: System Overview & Active Provider */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Financial Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Financials</p>
                <h2 className="text-xl font-bold text-slate-900">System Overview</h2>
              </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Admin Wallet Balance</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">₵{adminWallet}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Available Funds</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Revenue Volume</p>
                <p className="text-3xl font-black text-slate-900 mt-1">₵{totalVolumeOrders.toFixed(2)}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Total Processed</p>
              </div>
            </div>
          </div>
        </section>

        {/* API Provider Balances & Active Switcher */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">API Balances</p>
                <h2 className="text-xl font-bold text-slate-900">Active Provider</h2>
              </div>
              <Link href="/dashboard/admin/adh-offers" className="text-xs font-semibold text-blue-600 hover:underline">
                ADH Catalog &rarr;
              </Link>
            </header>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Dakazina Card */}
              <button
                type="button"
                disabled={updatingProvider}
                onClick={() => handleProviderChange("dakazina")}
                className={`text-left group cursor-pointer rounded-xl border p-4 transition ${
                  activeProvider === "dakazina"
                    ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Dakazina API</span>
                  {activeProvider === "dakazina" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-600">Select</span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  ₵{dakaziBalance?.AccountBalance?.["Wallet Balance"] || "0.00"}
                </p>
              </button>

              {/* ADH Group Card */}
              <button
                type="button"
                disabled={updatingProvider}
                onClick={() => handleProviderChange("adhGroup")}
                className={`text-left group cursor-pointer rounded-xl border p-4 transition ${
                  activeProvider === "adhGroup"
                    ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">ADH Group API</span>
                  {activeProvider === "adhGroup" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-600">Select</span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  ₵{adhBalance?.balance !== undefined ? Number(adhBalance.balance).toFixed(2) : "0.00"}
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Selected Provider:</span>
            <span className="font-semibold text-slate-700">{activeProvider === "dakazina" ? "Dakazina API" : "ADH Group API"}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

