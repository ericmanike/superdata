"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";
import type { Order } from "@/lib/mockData";

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setStatus({ kind: "loading", message: "Fetching orders data..." });
    try {
      const data = await api<Order[]>("/api/orders");
      setOrders(data);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load orders" });
    }
  }

  const filteredOrders = useMemo(() => {
    if (!orderSearch) return orders;
    const lower = orderSearch.toLowerCase();
    return orders.filter(o => 
      o.phone?.toLowerCase().includes(lower) || 
      o.transactionId?.toLowerCase().includes(lower) ||
      o.network?.toLowerCase().includes(lower) ||
      o.bundle?.toLowerCase().includes(lower) ||
      o.status?.toLowerCase().includes(lower)
    );
  }, [orders, orderSearch]);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatusId(orderId);
    try {
      await api(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev: any[]) =>
        prev.map((o: any) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to update status" });
    } finally {
      setUpdatingStatusId(null);
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
      await fetchOrders();
      setStatus({ kind: "success", message: "Order retry initiated" });
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
      await fetchOrders();
      setStatus({ kind: "success", message: "Order deleted successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message });
    }
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base text-slate-600">Admin Control</p>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">All Orders</p>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              All System Orders
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {orders.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders (phone, ID, network)..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none min-w-[260px]"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="grid gap-3 grid-cols-1">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300"
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
                {order.transactionId?.toLowerCase().startsWith("paid") && (
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
          {filteredOrders.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              No orders found matching your search.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
