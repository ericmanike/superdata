'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import React from "react";
import { 
  Home, 
  Zap, 
  Wallet, 
  ChartColumnDecreasing, 
  ShoppingBag, 
  Sparkles, 
  User, 
  Store, 
  ShieldCheck, 
  Headset, 
  LogOut,
  Plus,
  Menu,
  X
} from "lucide-react";
import TopUpWallet from "@/components/ui/topUpwallet";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Buy Data", href: "/dashboard/buy-data", icon: Zap },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Transactions", href: "/dashboard/transactions", icon: ChartColumnDecreasing },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Premium Agent", href: "/dashboard/premium-agent", icon: Sparkles },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "My Agent Store", href: "/dashboard/my-agent-store", icon: Store },
  { label: "Admin", href: "/dashboard/admin", icon: ShieldCheck },
  { label: "Support", href: "/dashboard/support", icon: Headset },
];

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}
function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-3 grid h-8 w-8 place-items-center rounded-xl bg-white/15 text-white">
      {children}
    </span>
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
      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto transform border-r border-slate-200 bg-[#1e3a8a] px-4 py-6 transition duration-300 md:translate-x-0 ${
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
              <X size={20} />
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
                  <Icon size={18} />
                </IconWrapper>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20">
          <div className="flex items-center">
            <IconWrapper>
              <LogOut size={18} />
            </IconWrapper>
            Logout
          </div>
          <span className="text-xs text-slate-100">Shift+L</span>
        </button>
      </aside>

      <div className="flex flex-1 flex-col md:ml-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 md:hidden"
              onClick={() => setOpen((s) => !s)}
            >
              <Menu size={18} />
              Dashboard
            </button>
            <div>
              <p className="text-xs text-slate-500">Welcome back</p>
              <p className="text-sm font-semibold text-slate-900">Data Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TopUpWallet className="inline-flex items-center gap-2 rounded-full bg-[#00caf5] px-4 py-2 text-sm font-semibold text-slate-900 cursor-pointer transition hover:opacity-90">
              <Plus size={16} strokeWidth={2.5} />
              Top up wallet
            </TopUpWallet>
          </div>
        </header>

        <main className="flex-1 bg-gray-300 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
