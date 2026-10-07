'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import { 
  Home, 
  Zap, 
  Wallet, 
  ShoppingBag, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Headset, 
  LogOut,
  Plus,
  Menu,
  X,
  ArrowLeft,
  PlusCircle,
  Package,
  Users,
  Landmark,
  LayoutDashboard,
  Tag
} from "lucide-react";
import TopUpWallet from "@/components/ui/topUpwallet";
import { signOut, useSession } from "next-auth/react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const userNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Buy Data", href: "/dashboard/buy-data", icon: Zap },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Premium Agent", href: "/dashboard/premium-agent", icon: Sparkles },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Support", href: "/dashboard/support", icon: Headset },
];

const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: " Manage Packages", href: "/dashboard/admin/bundles", icon: Package },
  { label: " All Orders", href: "/dashboard/admin/orders", icon: ShoppingBag },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  { label: "ADH Group Offers", href: "/dashboard/admin/adh-offers", icon: Tag },
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
  const [activeHash, setActiveHash] = useState("");

  const isAdminPage = pathname.startsWith("/dashboard/admin");
  const isAdminUser = session?.user?.role === "admin";

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      setActiveHash(`#${hash}`);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setActiveHash("");
    }
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
        className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto transform border-r border-slate-200 ${
          isAdminPage ? "bg-[#0f172a]" : "bg-[#1e3a8a]"
        } px-4 py-6 transition duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-2xl text-xl font-black ${
              isAdminPage ? "bg-amber-400 text-slate-950" : "bg-white text-slate-900"
            }`}>
              H
            </span>
            <div>
              <div className="text-xl font-semibold leading-tight text-white flex items-center gap-2">
                hubsitedata
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                  isAdminPage 
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                    : "bg-white/10 text-slate-100"
                }`}>
                  {isAdminPage ? "ADMIN PANEL" : (session?.user?.role || "User")}
                </span>
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

        {isAdminPage ? (
          /* Admin Sidebar Navigation */
          <div className="mt-8 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Admin Console
              </p>
              <nav className="space-y-1 text-white text-base">
                {adminNavItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center rounded-2xl px-3 py-3 text-base font-semibold transition ${
                        active
                          ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                          : "text-slate-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className={`mr-3 grid h-8 w-8 place-items-center rounded-xl ${
                        active ? "bg-slate-950/20 text-slate-950" : "bg-white/10 text-white"
                      }`}>
                        <Icon size={18} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t text-white border-slate-700/60">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center rounded-2xl px-3.5 py-3 text-base font-bold text-slate-100 border border-slate-400/40 hover:bg-slate-500/30 transition shadow-2xs"
              >
                <span className="mr-3 grid h-8 w-8 place-items-center rounded-xl  text-white">
                  <ArrowLeft size={18} />
                </span>
                Exit Admin Mode
              </Link>
            </div>
          </div>
        ) : (
          /* Standard User Sidebar Navigation */
          <nav className="mt-8 space-y-1 text-white text-base">
            {userNavItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-2xl px-3 py-3 text-base font-semibold transition ${
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

            {/* Admin item for admin users when in user dashboard */}
            {isAdminUser && (
              <div className="pt-3 border-t border-white/10 mt-3">
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-2xl px-3 py-3 text-base font-semibold transition bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30 ${
                    pathname === "/dashboard/admin" ? "bg-amber-500 text-slate-950" : ""
                  }`}
                >
                  <span className="mr-3 grid h-8 w-8 place-items-center rounded-xl bg-amber-400/30 text-amber-300">
                    <ShieldCheck size={18} />
                  </span>
                  Admin Panel
                </Link>
              </div>
            )}
          </nav>
        )}

        <button 
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3.5 text-base font-semibold text-white hover:bg-white/20"
        >
          <div className="flex items-center">
            <IconWrapper>
              <LogOut size={18} />
            </IconWrapper>
            Logout
          </div>
          <span className="text-sm text-slate-100">Shift+L</span>
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
              <p className="text-xs font-medium text-slate-500 line-clamp-1">
                {isAdminPage ? "Admin Workspace" : "Welcome back,"}
              </p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <p className="truncate text-base font-bold text-slate-900 max-w-[120px] sm:max-w-none">
                  {session?.user?.name || "User"}
                </p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] md:text-xs font-bold uppercase tracking-wider ${
                  isAdminPage 
                    ? "bg-amber-100 text-amber-800 border border-amber-200" 
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {session?.user?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <TopUpWallet className="flex items-center gap-2 rounded-full bg-[#00caf5] px-4 py-2.5 md:px-5 md:py-2.5 text-sm md:text-sm font-bold text-slate-900 transition hover:opacity-90 shadow-sm">
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
