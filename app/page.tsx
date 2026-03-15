"use client";

import Link from "next/link";
import { useState } from "react";

const networks = [
  { name: "MTN", color: "from-amber-400 to-orange-500" },
  { name: "Telecel", color: "from-rose-500 to-red-500" },
  { name: "AirtelTigo", color: "from-sky-500 to-indigo-500" },
];

const features = [
  {
    title: "Instant delivery",
    desc: "Automated top-ups land in seconds with real-time status.",
  },
  {
    title: "Secure payments",
    desc: "PCI-conscious wallet funding via cards, bank, and mobile money.",
  },
  {
    title: "Smart dashboard",
    desc: "Track balances, orders, and usage across all networks.",
  },
  {
    title: "24/7 support",
    desc: "Humans on standby with live chat and callbacks.",
  },
];

const bundles = [
  { size: "1.5 GB", price: "₵8", network: "MTN" },
  { size: "3 GB", price: "₵14", network: "AirtelTigo" },
  { size: "5 GB", price: "₵22", network: "Telecel" },
  { size: "10 GB", price: "₵38", network: "MTN" },
];

const steps = [
  { title: "Create account", detail: "Sign up with email and phone." },
  { title: "Fund wallet", detail: "Load once, spend anytime." },
  { title: "Buy data instantly", detail: "Pick network, confirm, done." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-300 text-slate-900">
      <header className="mx-auto max-w-6xl rounded-2xl bg-[#1e3a8a] px-6 py-4 text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-purple-500 text-xl font-black text-slate-900">
              S
            </span>
            <div className="text-lg font-semibold tracking-tight">Superdata</div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#home" className="text-white/90 hover:text-white transition">
              Home
            </a>
          
            <a href="#pricing" className="text-white/90 hover:text-white transition">
              See Pricing
            </a>
            <Link href="/dashboard" className="text-white/90 hover:text-white transition">
              Dashboard
            </Link>
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/40 transition hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: Get Started + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:translate-y-0.5"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            >
              {menuOpen ? (
                /* X icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <nav className="mt-4 flex flex-col gap-1 border-t border-white/20 pt-4 md:hidden">
            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Pricing
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </Link>
            <div className="mt-2 border-t border-white/20 pt-3">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-full py-2.5 text-center text-sm font-semibold text-white/90 ring-1 ring-white/40 transition hover:text-white"
              >
                Login
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="home" className="mx-auto mt-6 max-w-6xl px-6 pb-16">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3a8a] ring-1 ring-white/0">
              Fast. Affordable. Always on.
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Buy Affordable Mobile Data Instantly
              </h1>
              <p className="max-w-2xl text-lg text-slate-700">
                Superdata connects to every major network so you can top-up in
                seconds, keep wallets funded, and never run out of data again.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/buy-data"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:translate-y-0.5"
              >
                Buy Data
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full px-6 py-3 text-base font-semibold text-slate-900 ring-1 ring-slate-900/20 transition hover:ring-slate-900/40"
              >
                Create Account
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {networks.map((n) => (
                <div
                  key={n.name}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div
                    className={`mb-2 inline-flex rounded-full bg-gradient-to-r ${n.color} px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-900`}
                  >
                    {n.name}
                  </div>
                  <p className="text-sm text-slate-700">
                    Full coverage with live delivery status.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Wallet balance</p>
                  <p className="text-3xl font-black text-slate-900">₵420.50</p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-[#1e3a8a]">
                  Instant payout
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Today", value: "₵182" },
                  { label: "This week", value: "₵1,240" },
                  { label: "Active orders", value: "12" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <div className="text-sm text-slate-600">{item.label}</div>
                    <div className="text-lg font-bold text-slate-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mt-20 rounded-3xl border border-slate-200 bg-white p-10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Features</h2>
              <p className="text-slate-700">
                Everything you need to keep teams and customers online.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#1e3a8a] hover:underline"
            >
              View dashboard →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 h-10 w-10 rounded-full bg-slate-100" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Bundles preview</h2>
            <p className="text-slate-700">
              Transparent pricing across every network. Build custom bundles in
              the dashboard.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>• Real-time availability &amp; instant confirmation</li>
              <li>• Volume pricing for agents and teams</li>
              <li>• Wallet-first checkout to minimize card fees</li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bundles.map((bundle) => (
              <div
                key={bundle.size + bundle.network}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <p className="text-sm text-slate-600">{bundle.network}</p>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {bundle.size}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#1e3a8a]">
                    {bundle.price}
                  </span>
                  <Link
                    href="/dashboard/buy-data"
                    className="text-sm font-semibold text-[#1e3a8a] hover:underline"
                  >
                    Buy now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-10">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-base font-bold text-[#1e3a8a]">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-purple-500 text-base font-black text-slate-900">
              S
            </span>
            <span className="font-semibold text-white">Superdata</span>
          </div>
          <div className="flex flex-wrap gap-4 text-white/80">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <a href="mailto:help@superdata.africa" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
