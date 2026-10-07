"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Users, 
  UserCheck, 
  Shield, 
  Wallet, 
  Search, 
  Loader2, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  RefreshCw,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import type { User as MockUser } from "@/lib/mockData";

type User = MockUser & { 
  _id?: string;
  role?: 'user' | 'agent' | 'admin' | 'moderator';
  createdAt?: string;
};

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "agent" | "admin">("all");
  const [sortBy, setSortBy] = useState<"newest" | "balance-high" | "balance-low" | "name">("newest");
  
  const [topUpAmounts, setTopUpAmounts] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "user" as 'user' | 'agent' | 'admin',
    walletBalance: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setStatus({ kind: "loading", message: "Loading user directory..." });
    try {
      const data = await api<any[]>("/api/users");
      const list = data.map(u => ({
        id: u._id?.toString() || u.id,
        _id: u._id?.toString() || u.id,
        name: u.name || "Unnamed User",
        email: u.email || "",
        phone: u.phone || "N/A",
        role: u.role || "user",
        walletBalance: typeof u.walletBalance === "number" ? u.walletBalance : 0,
        createdAt: u.createdAt
      }));
      setUsers(list);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setStatus({ kind: "error", message: err?.message ?? "Failed to load user directory" });
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const regularUsers = users.filter(u => !u.role || u.role === "user").length;
    const agentsCount = users.filter(u => u.role === "agent").length;
    const adminsCount = users.filter(u => u.role === "admin").length;
    const totalWalletBalance = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

    return { totalUsers, regularUsers, agentsCount, adminsCount, totalWalletBalance };
  }, [users]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filter by Search Query
    if (userSearch.trim()) {
      const lower = userSearch.toLowerCase().trim();
      result = result.filter(u => 
        u.name.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower) || 
        u.phone?.toLowerCase().includes(lower) ||
        u.id?.toLowerCase().includes(lower)
      );
    }

    // Filter by Role
    if (roleFilter !== "all") {
      result = result.filter(u => (u.role || "user") === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "balance-high") return (b.walletBalance || 0) - (a.walletBalance || 0);
      if (sortBy === "balance-low") return (a.walletBalance || 0) - (b.walletBalance || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // Default order from API (Newest)
    });

    return result;
  }, [users, userSearch, roleFilter, sortBy]);

  // Handle Quick Top Up
  async function handleTopUp(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }
    setUpdatingId(userId);
    setStatus({ kind: "loading", message: "Processing wallet top-up..." });
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
      await fetchUsers();
      setStatus({ kind: "success", message: `Successfully added ₵${amount.toFixed(2)} to wallet` });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to top up balance" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Handle Quick Role Change
  async function handleRoleChange(userId: string, newRole: 'user' | 'agent' | 'admin') {
    setUpdatingId(userId);
    setStatus({ kind: "loading", message: "Updating user role..." });
    try {
      await api("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setStatus({ kind: "success", message: `User role updated to ${newRole.toUpperCase()}` });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to update role" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Handle Edit User Modal Save
  async function handleSaveEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingId(editingUser.id);
    setStatus({ kind: "loading", message: "Saving user modifications..." });
    try {
      await api("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editForm.name,
          phone: editForm.phone,
          role: editForm.role,
          walletBalance: editForm.walletBalance,
        }),
      });
      await fetchUsers();
      setEditingUser(null);
      setStatus({ kind: "success", message: "User account updated successfully" });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to update user account" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete User
  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    setUpdatingId(userId);
    setStatus({ kind: "loading", message: "Deleting user account..." });
    try {
      await api("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await fetchUsers();
      setStatus({ kind: "success", message: `User ${userName} deleted` });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message || "Failed to delete user" });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management Console</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw size={14} className={status.kind === "loading" ? "animate-spin" : ""} />
            Refresh Directory
          </button>
          {status.kind !== "idle" && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${
                status.kind === "error"
                  ? "bg-rose-100 text-rose-700"
                  : status.kind === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status.kind === "success" && <CheckCircle2 size={14} />}
              {status.kind === "error" && <AlertCircle size={14} />}
              {status.kind === "loading" && <Loader2 size={14} className="animate-spin" />}
              {status.message}
            </div>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
  
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Regular Users</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{metrics.regularUsers}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-bold">Agents</span>
            <UserCheck size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{metrics.agentsCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Admins</span>
            <Shield size={18} className="text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">{metrics.adminsCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Total User Balances</span>
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">₵{metrics.totalWalletBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or user ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            {(["all", "user", "agent", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  roleFilter === r
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r === "all" ? "All Roles" : r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-[#1e3a8a] outline-none"
            >
              <option value="newest">Sort by Newest</option>
              <option value="balance-high">Highest Balance First</option>
              <option value="balance-low">Lowest Balance First</option>
              <option value="name">Alphabetical (Name)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            User Accounts
            <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {filteredUsers.length} of {users.length}
            </span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Card Header: User info & Role Selector */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{u.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400 font-mono mt-0.5">{u.id}</p>
                  </div>

                  {/* Inline Role Selector Dropdown */}
                  <select
                    value={u.role || "user"}
                    disabled={updatingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider cursor-pointer focus:outline-none ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : u.role === "agent"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* User Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Email:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[190px]">{u.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-800">{u.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="font-semibold text-slate-400">Wallet Balance:</span>
                    <span className="font-black text-emerald-600 text-sm">
                      ₵{(u.walletBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {/* Top Up Form */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Top-up (GHS)"
                    value={topUpAmounts[u.id] || ""}
                    onChange={(e) => setTopUpAmounts(prev => ({ ...prev, [u.id]: e.target.value }))}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:border-[#1e3a8a] outline-none"
                  />
                  <button
                    onClick={() => handleTopUp(u.id, parseFloat(topUpAmounts[u.id]))}
                    disabled={updatingId === u.id}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs disabled:opacity-50"
                  >
                    <PlusCircle size={14} />
                    Fund
                  </button>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setEditForm({
                        name: u.name,
                        phone: u.phone || "",
                        role: (u.role as any) || "user",
                        walletBalance: u.walletBalance || 0
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Edit3 size={13} />
                    Edit Account
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    disabled={updatingId === u.id}
                    className="flex items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    title="Delete User Account"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
              <Users size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or role filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Manage Users</p>
                <h3 className="text-xl font-bold text-slate-900">Edit User Account</h3>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-bold" 
                onClick={() => setEditingUser(null)}
              >
                &times;
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSaveEditUser}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Phone Number</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Account Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value as any }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
                >
                  <option value="user">Regular User</option>
                  <option value="agent">Premium Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Wallet Balance (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.walletBalance}
                  onChange={(e) => setEditForm(f => ({ ...f, walletBalance: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:border-[#1e3a8a] outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === editingUser.id}
                  className="flex-1 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#162b64] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingId === editingUser.id && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
