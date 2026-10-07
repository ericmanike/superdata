"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { Bundle, Network as MockNetwork } from "@/lib/mockData";

type Network = MockNetwork;
type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

const networks: Network[] = ["MTN", "Telecel", "AirtelTigo"];

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminBundlesPage() {
  const { data: session } = useSession();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [inventoryFilter, setInventoryFilter] = useState<Network | "All">("All");
  const [audienceFilter, setAudienceFilter] = useState<"All" | "user" | "agent">("All");

  const [bundleForm, setBundleForm] = useState({
    network: "MTN" as Network,
    size: "1 GB",
    price: 5,
    audience: "user" as "user" | "agent"
  });

  const [editingBundle, setEditingBundle] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    network: "MTN" as Network,
    size: "",
    price: 0,
    audience: "user" as "user" | "agent"
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  async function fetchBundles() {
    setStatus({ kind: "loading", message: "Fetching data bundles..." });
    try {
      const data = await api<any[]>("/api/bundles");
      setBundles(data);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Failed to load bundles:", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load packages" });
    }
  }

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

  async function handleCreateBundle(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading", message: "Creating bundle..." });
    try {
      await api<Bundle>("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundleForm),
      });
      await fetchBundles();
      setBundleForm({
        network: "MTN",
        size: "",
        price: 0,
        audience: "user"
      });
      setStatus({ kind: "success", message: "Bundle created successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  async function handleEditBundle(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBundle) return;
    setStatus({ kind: "loading", message: "Updating bundle..." });
    try {
      await api(`/api/bundles/${editingBundle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      await fetchBundles();
      setEditingBundle(null);
      setStatus({ kind: "success", message: "Bundle updated successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to update bundle" });
    }
  }

  async function deleteBundle(bundleId: string) {
    if (!confirm("Delete this bundle?")) return;
    setStatus({ kind: "loading", message: "Deleting bundle..." });
    try {
      await api(`/api/bundles/${bundleId}`, { method: "DELETE" });
      await fetchBundles();
      setStatus({ kind: "success", message: "Bundle deleted" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base text-slate-600">Admin Control</p>
          <h1 className="text-3xl font-bold text-slate-900">Packages & Inventory</h1>
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

      {/* Create Bundle Form (Top Card) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">New Package</p>
            <h2 className="text-xl font-semibold">Create Bundle</h2>
          </div>
          <button
            onClick={fetchBundles}
            className="text-xs font-semibold text-[#1e3a8a] hover:underline"
          >
            Refresh
          </button>
        </header>
        <form onSubmit={handleCreateBundle} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Network</label>
            <select
              value={bundleForm.network}
              onChange={(e) =>
                setBundleForm((f) => ({ ...f, network: e.target.value as Network }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
            >
              {networks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 font-semibold">Size</label>
            <input
              value={bundleForm.size}
              onChange={(e) => setBundleForm((f) => ({ ...f, size: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
            >
              <option value="user">Regular Users</option>
              <option value="agent">Premium Agents</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#162b64] shadow-sm"
            >
              Add Bundle
            </button>
          </div>
        </form>
      </section>

      {/* Packages Inventory Table (Bottom Section) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Inventory</p>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Active Data Packages
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {normalizedBundles.length}
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100">
                {(["All", "user", "agent"] as const).map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setAudienceFilter(aud)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      audienceFilter === aud
                        ? "bg-white text-purple-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {aud === "All" ? "All" : aud.charAt(0).toUpperCase() + aud.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 border border-slate-100">
                {(["All", ...networks] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => setInventoryFilter(net)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      inventoryFilter === net
                        ? "bg-white text-[#1e3a8a] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </header>

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
                          b.network === "MTN"
                            ? "bg-amber-100 text-amber-800"
                            : b.network === "Telecel"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {b.network}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900">{b.size}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-slate-700">₵{b.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          b.audience === "agent"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {b.audience === "agent" ? "Agent" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingBundle(b);
                            setEditForm({
                              network: b.network,
                              size: b.size,
                              price: b.price,
                              audience: b.audience,
                            });
                          }}
                          className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-[#1e3a8a] transition hover:bg-blue-50 hover:border-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBundle(b.id)}
                          className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
                        >
                          Delete
                        </button>
                      </div>
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
        </section>

      {/* Edit Modal */}
      {editingBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">Bundles</p>
                <h3 className="text-xl font-bold text-slate-900">Edit Package</h3>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-bold" 
                onClick={() => setEditingBundle(null)}
              >
                &times;
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleEditBundle}>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Network</label>
                <select
                  value={editForm.network}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, network: e.target.value as Network }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
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
                  value={editForm.size}
                  onChange={(e) => setEditForm((f) => ({ ...f, size: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
                  placeholder="e.g. 5 GB"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
                  placeholder="8.30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Audience</label>
                <select
                  value={editForm.audience}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, audience: e.target.value as any }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
                >
                  <option value="user">Regular Users</option>
                  <option value="agent">Premium Agents</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBundle(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status.kind === "loading"}
                  className="flex-1 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#162b64] disabled:opacity-50"
                >
                  {status.kind === "loading" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
