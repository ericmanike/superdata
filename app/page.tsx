"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BadgeCheck } from "lucide-react";



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
  return (
    <div className="min-h-screen bg-gray-300 text-slate-900">
      <Navbar />

      <main id="home" className="m-auto mt-6 w-full  px-6 pb-16">
        <section className="flex flex-col items-center text-center py-10">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3a8a] ring-1 ring-white/0">
              Fast. Affordable. Always on.
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                Buy Affordable Mobile Data Instantly
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-700">
                hubsitedata connects to every major network so you can top-up in
                seconds, keep wallets funded, and never run out of data again.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard/buy-data"
                className="rounded-full bg-[#00c9f5] px-8 py-3.5 text-base font-bold text-slate-900 transition hover:translate-y-0.5 shadow-lg"
              >
                Buy Data
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full px-8 py-3.5 text-base font-bold text-slate-900 ring-2 ring-slate-900/10 transition hover:ring-slate-900/30 hover:bg-white/50"
              >
                Create Account
              </Link>
            </div>
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
            <ul className="space-y-5 text-lg font-bold text-slate-800">
              <li className="flex items-center gap-3">
                <BadgeCheck className="h-6 w-6 text-[#1e3a8a] flex-shrink-0" />
                <span>Better prices on data packages</span>
              </li>
              <li className="flex items-center gap-3">
                <BadgeCheck className="h-6 w-6 text-[#1e3a8a] flex-shrink-0" />
                <span>Ability to create your own store</span>
              </li>
              <li className="flex items-center gap-3">
                <BadgeCheck className="h-6 w-6 text-[#1e3a8a] flex-shrink-0" />
                <span>Real-time availability & instant confirmation</span>
              </li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bundles.map((bundle) => {
              const networkColors: { [key: string]: { border: string, bg: string, text: string } } = {
                'MTN': { border: 'border-l-[#FFCC00]', bg: 'bg-[#FFCC00]/5', text: 'text-[#8B7200]' },
                'AirtelTigo': { border: 'border-l-[#0072bc]', bg: 'bg-[#0072bc]/5', text: 'text-[#005a96]' },
                'Telecel': { border: 'border-l-[#E60000]', bg: 'bg-[#E60000]/5', text: 'text-[#b30000]' }
              };
              const colors = networkColors[bundle.network] || { border: 'border-l-slate-200', bg: 'bg-white', text: 'text-slate-600' };

              return (
                <div
                  key={bundle.size + bundle.network}
                  className={`rounded-2xl border border-slate-200 border-l-4 ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-md`}
                >
                  <p className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{bundle.network}</p>
                  <div className="mt-2 text-2xl font-black text-slate-900">
                    {bundle.size}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">
                      {bundle.price}
                    </span>
                    <Link
                      href="/dashboard/buy-data"
                      className={`rounded-full  px-4 py-2 text-xs font-bold text-white transition ${colors.text}`}
                    >
                      Buy now →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-10">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl bg-[#1e3a8a] p-5 shadow-lg"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-white/80">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-base font-black text-slate-900">
              H
            </span>
            <span className="font-semibold text-white">hubsitedata</span>
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
            <a href="mailto:help@hubsitedata.africa" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
