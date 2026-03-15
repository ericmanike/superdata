"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setPhone(session.user.phone || "");
    }
  }, [session]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update the NextAuth session locally
        await update({ name, phone });
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert("An error occurred while updating password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Account</p>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form onSubmit={handleUpdate} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 h-fit">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Email</label>
            <input
              value={email}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Account Role</label>
            <input
              value={session?.user?.role || "User"}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-bold uppercase tracking-wider outline-none cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1ac3f6] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="space-y-4">
          <form onSubmit={handlePasswordUpdate} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Update Password</h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full rounded-xl bg-[#1ac3f6] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Account Access</h3>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Logout</p>
              <p className="text-xs text-slate-600">End your session securely.</p>
              <button
                onClick={handleLogout}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#f54a00] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
