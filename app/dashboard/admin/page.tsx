"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import CopyButton from "@/components/ui/CopyButton";
import type { Bundle, Network as MockNetwork, Order, Transaction, User as MockUser, Wallet } from "@/lib/mockData";

// Extended types for the app from API
type Network = MockNetwork;
type User = MockUser & { role?: 'user' | 'agent' | 'admin' | 'moderator' };

const networkColors: Record<string, string> = {
  MTN: "bg-amber-400",
  Telecel: "bg-rose-500",
  AirtelTigo: "bg-sky-500",
};

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

interface IBundle {
  _id: string;
  network: Network;
  name: string;
  price: number;
  audience: "user" | "agent";
}

const networks: Network[] = ["MTN", "Telecel", "AirtelTigo"];

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dakaziBalance, setDakaziBalance] = useState<any>(null);
  const [inventoryFilter, setInventoryFilter] = useState<Network | "All">("All");
  const [audienceFilter, setAudienceFilter] = useState<"All" | "user" | "agent">("All");
  const [topUpAmounts, setTopUpAmounts] = useState<Record<string, string>>({});
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showBundles, setShowBundles] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const lower = userSearch.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lower) || 
      u.email.toLowerCase().includes(lower) || 
      u.phone?.toLowerCase().includes(lower) ||
      u.id?.toLowerCase().includes(lower)
    );
  }, [users, userSearch]);

  const filteredOrders = useMemo(() => {
    if (!orderSearch) return orders;
    const lower = orderSearch.toLowerCase();
    return orders.filter(o => 
      o.phone?.toLowerCase().includes(lower) || 
      o.transactionId?.toLowerCase().includes(lower) ||
      o.network?.toLowerCase().includes(lower) ||
      o.bundle?.toLowerCase().includes(lower)
    );
  }, [orders, orderSearch]);


  const normalizedBundles = useMemo(() => {
    if (!Array.isArray(bundles)) return [];
    let list = bundles.map((b: any) => ({
      id: b._id?.toString() || b.id || Math.random().toString(),
      network: b.network,
      size: b.name || b.size || "Unknown Size",
      price: b.price || 0,
      audience: b.audience || "user"
    }));

    if (inventoryFilter !== "All") {
      list = list.filter(b => b.network === inventoryFilter);
    }
    if (audienceFilter !== "All") {
      list = list.filter(b => b.audience === audienceFilter);
    }
    return list;
  }, [bundles, inventoryFilter, audienceFilter]);

  const [bundleForm, setBundleForm] = useState({
    network: "MTN" as Network,
    size: "1 GB",
    price: 5,
    audience: "user" as "user" | "agent"
  });

  useEffect(() => {
    refreshAll();
    balance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshAll() {
    setStatus({ kind: "loading", message: "Updating operations data..." });
    try {
      console.log("Admin: Refreshing all data...");
      const [usersData, bundlesData, ordersData, txData, walletsData] = await Promise.all([
        api<User[]>("/api/users").catch(e => { console.error("Users API failed:", e); return []; }),
        api<any[]>("/api/bundles"), // Don't catch here, let it bubble to show error if bundles fail
        api<Order[]>("/api/orders").catch(e => { console.error("Orders API failed:", e); return []; }),
        api<Transaction[]>("/api/transactions").catch(e => { console.error("TX API failed:", e); return []; }),
        api<Wallet[]>("/api/wallets").catch(e => { console.error("Wallets API failed:", e); return []; }),
      ]);

      console.log("Admin: Data received", {
        users: usersData.length,
        bundles: bundlesData.length,
        orders: ordersData.length
      });

      setUsers(usersData);
      setBundles(bundlesData);
      setOrders(ordersData);
      setTransactions(txData);
      setWallets(walletsData);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Admin: Refresh failed", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load dashboard data" });
    }
  }

  async function handleCreateBundle(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading", message: "Creating bundle..." });
    try {
      await api<Bundle>("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundleForm),
      });
      await refreshAll();
      setBundleForm({
        network: "MTN",
        size: "",
        price: 0,
        audience: "user"
      });
      setStatus({ kind: "success", message: "Bundle created" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setStatus({ kind: "loading", message: "Deleting user..." });
    try {
      await api("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await refreshAll();
      setStatus({ kind: "success", message: "User deleted" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function promoteToAgent(userId: string) {
    if (status.kind === "loading" || promotingId) return;
    setPromotingId(userId);
    setStatus({ kind: "loading", message: "Promoting user..." });
    try {
      await api("/api/makeAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await refreshAll();
      setStatus({ kind: "success", message: "User promoted to agent" });
    } catch (err: any) {
      console.error("Promote to agent error:", err);
      setStatus({ kind: "error", message: err?.message || "Failed to promote user" });
    } finally {
      setPromotingId(null);
    }
  }

  async function handleTopUp(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setStatus({ kind: "loading", message: "Topping up wallet..." });
    try {
      await api("/api/adminTopUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      setTopUpAmounts(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      await refreshAll();
      setStatus({ kind: "success", message: "Wallet topped up successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }


  async function deleteBundle(bundleId: string) {
    if (!confirm("Delete this bundle?")) return;
    setStatus({ kind: "loading", message: "Deleting bundle..." });
    try {
      await api(`/api/bundles/${bundleId}`, { method: "DELETE" });
      await refreshAll();
      setStatus({ kind: "success", message: "Bundle deleted" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setStatus({ kind: "loading", message: "Deleting order..." });
    try {
      await api(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      await refreshAll();
      setStatus({ kind: "success", message: "Order deleted successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function retryOrder(orderId: string) {
    if (!confirm("Retry this order? This will re-attempt fulfillment with Dakazi.")) return;
    setStatus({ kind: "loading", message: "Retrying order..." });
    try {
      await api(`/api/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      await refreshAll();
      setStatus({ kind: "success", message: "Order retry initiated" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatusId(orderId);
    try {
      await api(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      // Optimistically update local state without a full reload
      setOrders((prev: any[]) =>
        prev.map((o: any) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to update status" });
    } finally {
      setUpdatingStatusId(null);
    }
  }

  const balance = async () => {
    const response = await fetch(`/api/testingDakazi`, {
      method: "GET",
      next: { revalidate: 0 } // Ensure it's not cached too aggressively
    })
    const data = await response.json()
    console.log("  Data from Dakazi API ", data)
    setDakaziBalance(data)
  }



  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base text-slate-600">Admin control</p>
          <h1 className="text-3xl font-bold text-slate-900">Operations console</h1>
        </div>
        {status.kind !== "idle" && (
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${status.kind === "error"
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

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Bundles</p>
              <h2 className="text-xl font-semibold">Create bundle</h2>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              Refresh
            </button>
          </header>
          <form className="space-y-3" onSubmit={handleCreateBundle}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Network</label>
              <select
                value={bundleForm.network}
                onChange={(e) =>
                  setBundleForm((f) => ({ ...f, network: e.target.value as Network }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base"
              >
                {networks.map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Size</label>
              <input
                value={bundleForm.size}
                onChange={(e) => setBundleForm((f) => ({ ...f, size: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base"
                placeholder="e.g. 5 GB"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Price (GHS)</label>
              <input
                type="number"
                step="0.01"
                value={bundleForm.price}
                onChange={(e) => setBundleForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base"
                placeholder="8.30"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Audience</label>
              <select
                value={bundleForm.audience}
                onChange={(e) =>
                  setBundleForm((f) => ({ ...f, audience: e.target.value as any }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base"
              >
                <option value="user">Regular Users</option>
                <option value="agent">Premium Agents</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#1e3a8a] 
              px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#162b64]"
            >
              Add bundle
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Stats</p>
              <h2 className="text-xl font-semibold">Snapshot</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Admin Wallet
              </p>
              <p className="text-xl font-black text-emerald-600">
                ₵{users.find(u => u.id === session?.user?.id)?.walletBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Users", value: users.length },
              { label: "Bundles", value: bundles.length },
              { label: "Orders", value: orders.length },
              { label: "Pending", value: orders.filter((o) => o.status !== "Delivered").length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm">
          <header className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-blue-600 font-bold">API Provider</p>
              <h2 className="text-lg font-semibold text-blue-900 leading-none">Dakazina</h2>
            </div>
            {/* <button
              onClick={balance}
              className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-200 transition-colors"
            >
              Sync
            </button> */}
          </header>
          <div className="mt-8">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600">₵</span>
              <span className="text-4xl font-black text-blue-900 tracking-tight">
                {dakaziBalance?.AccountBalance?.["Wallet Balance"] || "0.00"}
              </span>
            </div>

          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Active data packages
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {normalizedBundles.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showBundles && (
              <>
            <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100">
              {(["All", "user", "agent"] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    audienceFilter === aud
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {aud === "All" ? "All Audience" : aud.charAt(0).toUpperCase() + aud.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100">
              {(["All", ...networks] as const).map((net) => (
                <button
                  key={net}
                  onClick={() => setInventoryFilter(net)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    inventoryFilter === net
                      ? "bg-white text-[#1e3a8a] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
            <button
              onClick={refreshAll}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Update list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
              </>
            )}
            <button
              onClick={() => setShowBundles((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showBundles ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
              {showBundles ? "Hide" : "Show"}
            </button>
          </div>
        </header>

        {showBundles && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Bundle Name</th>
                <th className="px-4 py-3 text-right">Price (GHS)</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {normalizedBundles.map((b: any) => (
                <tr key={b.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        b.network === "MTN" ? "bg-amber-100 text-amber-800" : 
                        b.network === "Telecel" ? "bg-rose-100 text-rose-700" : 
                        "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {b.network}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{b.size}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-700">₵{b.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      b.audience === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.audience === 'agent' ? 'Agent' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => deleteBundle(b.id)}
                      className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {normalizedBundles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                    No bundles found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Inventory & Fulfillment</p>
            <h2 className="text-xl font-semibold">All orders
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{orders.length}</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none min-w-[200px]"
              />
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              Reload
            </button>
            <button
              onClick={() => setShowOrders((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showOrders ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
              {showOrders ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {showOrders && (
        <div className="mt-3 grid gap-3 grid-cols-1">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-900 text-base">
                    {order.network} • {order.bundle}
                  </span>
                  <select
                    value={order.status.toLowerCase()}
                    disabled={updatingStatusId === order.id}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-opacity focus:outline-none ${
                      updatingStatusId === order.id ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      order.status.toLowerCase() === "delivered"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : order.status.toLowerCase() === "processing" || order.status.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-rose-100 text-rose-700 border-rose-200"
                    }`}
                  >
                    <option value="delivered">Delivered</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  {updatingStatusId === order.id && (
                    <span className="text-[10px] text-slate-400 animate-pulse">Saving…</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-600 text-base">
                  <p className="font-medium">{order.phone}</p>
                  <p>₵{order.amount}</p>
                  <p className="text-sm text-slate-400">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="mt-1">
                  <CopyButton
                    text={order.transactionId}
                    prefix="ID:"
                    className="text-[10px] font-bold text-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {order.transactionId?.toLowerCase().startsWith('paid') && (
                  <button
                    onClick={() => retryOrder(order.id)}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50"
                  >
                    Retry Order
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  Delete Order
                </button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              No orders found.
            </p>
          )}
        </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Directory</p>
            <h2 className="text-xl font-semibold">All users
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{users.length}</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none min-w-[200px]"
              />
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              Update list
            </button>
            <button
              onClick={() => setShowUsers((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showUsers ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
              {showUsers ? "Hide" : "Show"}
            </button>
          </div>
        </header>
        {showUsers && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{u.name}</h3>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'agent' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{u.id}</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#1e3a8a] shadow-xs">
                  ₵{u.walletBalance?.toFixed?.(2) ?? u.walletBalance}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-400">Email:</span>
                  {u.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-400">Phone:</span>
                  {u.phone}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={topUpAmounts[u.id] || ""}
                    onChange={(e) => setTopUpAmounts(prev => ({ ...prev, [u.id]: e.target.value }))}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
                  />
                  <button
                    onClick={() => handleTopUp(u.id, parseFloat(topUpAmounts[u.id]))}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Top up
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="flex-1 rounded-lg bg-white border border-rose-200 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Delete user
                  </button>
                  <button
                    onClick={() => promoteToAgent(u.id)}
                    disabled={status.kind === "loading" || promotingId !== null || u.role === 'agent' || u.role === 'admin'}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                      u.role === 'agent' || u.role === 'admin' 
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300" 
                        : "bg-[#1e3a8a] text-white hover:bg-[#162b64] shadow-sm active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {promotingId === u.id && <Loader2 className="h-3 w-3 animate-spin" />}
                    {u.role === 'agent' ? "Already Agent" : "Promote to agent"}
                  </button>
                </div>
              </div>

            </div>
          ))}
          {users.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              No users registered yet.
            </p>
          )}
        </div>
        )}
      </section>
      <details className="mt-8 opacity-20 hover:opacity-100">
        <summary className="cursor-pointer text-[10px] text-slate-400">Debug Console</summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] text-emerald-400">
          {JSON.stringify({ bundlesCount: bundles.length, usersCount: users.length, status }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
