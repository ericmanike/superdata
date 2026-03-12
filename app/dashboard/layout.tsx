'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import React from "react";

type NavItem = {
  label: string;
  href: string;
  icon: () => React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconHome },
  { label: "Buy Data", href: "/dashboard/buy-data", icon: IconBolt },
  { label: "Wallet", href: "/dashboard/wallet", icon: IconWallet },
  { label: "Transactions", href: "/dashboard/transactions", icon: IconRows },
  { label: "My Orders", href: "/dashboard/orders", icon: IconBag },
  { label: "Premium Agent", href: "/dashboard/premium-agent", icon: IconSpark },
  { label: "Profile", href: "/dashboard/profile", icon: IconUser },
  { label: "My Agent Store", href: "/dashboard/my-agent-store", icon: IconStore },
  { label: "Admin", href: "/dashboard/admin", icon: IconShield },
  { label: "Support", href: "/dashboard/support", icon: IconLifeRing },
];

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-3 grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white">
      {children}
    </span>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M3 11 12 4l9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17 12h3v4h-3a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconRows() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="4" y="5" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="11" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="17" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6 8h12l-1 12H7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10V7a3 3 0 0 1 6 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="m4 9 3.5 3 2-5 2.5 6 2-4 2 2 2-4 2.5 2-2 8H4l-2-8 2-0.8Z" />
      <path d="M5 19.5h14v1H5z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 20c1.5-2.5 4-4 6-4s4.5 1.5 6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconStore() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 10 5.5 4h13L20 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10h14v9H5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconLifeRing() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.76 7.76 5.5 5.5M16.24 7.76l2.26-2.26M7.76 16.24 5.5 18.5M16.24 16.24l2.26 2.26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3 5 5v6c0 4.5 2.9 7.9 7 9 4.1-1.1 7-4.5 7-9V5l-7-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12.5 11 14l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M14 17v2.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V4.5A1.5 1.5 0 0 1 6 3h6.5A1.5 1.5 0 0 1 14 4.5V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 12h9m0 0-2-2m2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-300 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-slate-200 bg-[#1e3a8a] px-4 py-6 transition duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-emerald-400 via-cyan-400 to-purple-500 text-xl font-black text-slate-900">
              S
            </span>
            <div>
              <div className="text-lg font-semibold leading-tight text-white">Superdata</div>
              <div className="text-xs text-slate-100">Agent dashboard</div>
            </div>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 space-y-1 text-white text-base">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#f54a00] text-white"
                    : "text-white hover:text-white hover:underline hover:underline-offset-8 hover:decoration-cyan-100"
                }`}
              >
                <IconWrapper>
                  <Icon />
                </IconWrapper>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20">
          <div className="flex items-center">
            <IconWrapper>
              <IconLogout />
            </IconWrapper>
            Logout
          </div>
          <span className="text-xs text-slate-100">Shift+L</span>
        </button>
      </aside>

      <div className="flex flex-1 flex-col md:ml-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 md:hidden"
              onClick={() => setOpen((s) => !s)}
            >
              ☰ Dashboard
            </button>
            <div>
              <p className="text-xs text-slate-500">Welcome back</p>
              <p className="text-sm font-semibold text-slate-900">Data Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-900">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v16M4 12h16" />
              </svg>
              Top up wallet
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-300 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
