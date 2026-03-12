"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("Data Agent");
  const [phone, setPhone] = useState("024 123 4567");
  const [email, setEmail] = useState("agent@superdata.africa");

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Account</p>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-[#1ac3f6] px-4 py-3 text-sm font-semibold text-slate-900"
          >
            Save changes
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Security</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Update password</p>
              <p className="text-xs text-slate-600">
                We’ll send a confirmation email to {email}.
              </p>
              <button className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                Send reset link
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Two-factor</p>
              <p className="text-xs text-slate-600">
                Add SMS verification for payouts and wallet actions.
              </p>
              <button className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-900/20">
                Enable 2FA
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Logout</p>
              <p className="text-xs text-slate-600">End your session securely.</p>
              <Link
                href="/logout"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg  bg-[#f54a00] px-4 py-2 text-sm font-semibold text-white"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
