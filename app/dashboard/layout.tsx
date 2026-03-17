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
import { signOut, useSession } from "next-auth/react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Buy Data", href: "/dashboard/buy-data", icon: Zap },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Premium Agent", href: "/dashboard/premium-agent", icon: Sparkles },
  { label: "Profile", href: "/dashboard/profile", icon: User },
 /* { label: "My Agent Store", href: "/dashboard/my-agent-store", icon: Store },*/
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
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

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
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl font-black text-slate-900">
              H
            </span>
            <div>
              <div className="text-lg font-semibold leading-tight text-white">hubsitedata</div>
              <div className="text-xs text-slate-100 uppercase tracking-wider font-medium">
                {session?.user?.role || "User"}
              </div>
            </div>
          </Link>
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

        <button 
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
        >
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
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 md:hidden"
              onClick={() => setOpen((s) => !s)}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-medium text-slate-500 line-clamp-1">Welcome back,</p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <p className="truncate text-sm font-bold text-slate-900 max-w-[120px] sm:max-w-none">
                  {session?.user?.name || "User"}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {session?.user?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <TopUpWallet className="flex items-center gap-2 rounded-full bg-[#00caf5] px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-bold text-slate-900 transition hover:opacity-90 shadow-sm">
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">Top up wallet</span>
              <span className="sm:hidden">Fund</span>
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
