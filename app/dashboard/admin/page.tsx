"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Bundle, Network, Order, Transaction, User, Wallet } from "@/lib/mockData";

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

  const normalizedBundles = useMemo(() => {
    if (!Array.isArray(bundles)) return [];
    return bundles.map((b: any) => ({
      id: b._id?.toString() || b.id || Math.random().toString(),
      network: b.network,
      size: b.name || b.size || "Unknown Size",
      price: b.price || 0,
      audience: b.audience || "user"
    }));
  }, [bundles]);

  const [bundleForm, setBundleForm] = useState({ 
    network: "MTN" as Network, 
    size: "1 GB", 
    price: 5,
    audience: "user" as "user" | "agent"
  });

  useEffect(() => {
    refreshAll();
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

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">Admin control</p>
          <h1 className="text-2xl font-bold text-slate-900">Operations console</h1>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Bundles</p>
              <h2 className="text-lg font-semibold">Create bundle</h2>
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
              <label className="text-xs font-semibold text-slate-600">Network</label>
              <select
                value={bundleForm.network}
                onChange={(e) =>
                  setBundleForm((f) => ({ ...f, network: e.target.value as Network }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                {networks.map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Size</label>
              <input
                value={bundleForm.size}
                onChange={(e) => setBundleForm((f) => ({ ...f, size: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="e.g. 5 GB"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Audience</label>
              <select
                value={bundleForm.audience}
                onChange={(e) =>
                  setBundleForm((f) => ({ ...f, audience: e.target.value as any }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="user">Regular Users</option>
                <option value="agent">Premium Agents</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#162b64]"
            >
              Add bundle
            </button>
          </form>

        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Stats</p>
              <h2 className="text-lg font-semibold">Snapshot</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                My Balance
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
              { label: "Pending orders", value: orders.filter((o) => o.status !== "Delivered").length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs font-semibold text-slate-600">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Active data packages
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {normalizedBundles.length}
                </span>
              </h2>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              Update list
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {normalizedBundles.map((b: any) => (
              <div
                key={b.id}
                className="flex flex-col justify-between rounded-[10px] border border-slate-200 bg-white p-6 min-h-[220px] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      b.network === "MTN" ? "text-slate-900" : "text-white"
                    } ${
                      networkColors[b.network] ?? "bg-slate-900"
                    }`}
                  >
                    {b.network}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1e3a8a]">₵{b.price}</p>
                    <span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      b.audience === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.audience === 'agent' ? 'Agent' : 'User'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900">{b.size}</div>
                  <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md mt-1">
                    <Check size={10} strokeWidth={3} />
                    <span>None expire</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteBundle(b.id)}
                  className="mt-4 w-full rounded-xl bg-white border border-rose-100 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
                >
                  Delete Package
                </button>
              </div>
            ))}
            {normalizedBundles.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-slate-500">
                No bundles created yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Accounts</p>
              <h2 className="text-lg font-semibold">Wallet balances</h2>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              Refresh
            </button>
          </header>
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {wallets.map((w) => {
              const owner = users.find((u) => u.id === w.userId);
              return (
                <div
                  key={w.userId}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">{owner?.name ?? "Unknown user"}</p>
                    <p className="text-xs text-slate-600">
                      {owner?.phone ?? "N/A"} · {owner?.email ?? w.userId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">
                      ₵{w.balance.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Updated {new Date(w.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {wallets.length === 0 && (
              <p className="text-sm text-slate-600">No wallet records yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Inventory & Fulfillment</p>
            <h2 className="text-lg font-semibold">All orders</h2>
          </div>
          <button
            onClick={refreshAll}
            className="text-xs font-semibold text-[#1e3a8a] hover:underline"
          >
            Reload
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {order.network} • {order.bundle}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    order.status === "Delivered"
                      ? "text-emerald-700"
                      : order.status === "Processing" || order.status === "Pending"
                        ? "text-amber-700"
                        : "text-rose-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">{order.phone}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-700">
                <span>₵{order.amount}</span>
                <span>{new Date(order.date).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              No orders found.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Directory</p>
            <h2 className="text-lg font-semibold">All users</h2>
          </div>
          <button
            onClick={refreshAll}
            className="text-xs font-semibold text-[#1e3a8a] hover:underline"
          >
            Update list
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{u.name}</h3>
                  <p className="text-xs text-slate-500">{u.id}</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#1e3a8a] shadow-xs">
                  ₵{u.walletBalance?.toFixed?.(2) ?? u.walletBalance}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-400">Email:</span>
                  {u.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-400">Phone:</span>
                  {u.phone}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => deleteUser(u.id)}
                  className="flex-1 rounded-lg bg-white border border-rose-200 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete user
                </button>
                <button 
                  onClick={() => promoteToAgent(u.id)}
                  className="flex-1 rounded-lg bg-[#1e3a8a] py-1.5 text-[11px] font-semibold text-white hover:bg-[#162b64]"
                >
                  Promote to agent
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              No users registered yet.
            </p>
          )}
        </div>
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
