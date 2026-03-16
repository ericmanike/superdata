"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Users, MessageSquareCheck } from "lucide-react";


export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full rounded-none bg-[#1e3a8a] px-6 py-4 text-white shadow-md">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl font-black text-slate-900">
            H
          </span>
          <div className="text-lg font-semibold tracking-tight">hubsitedata</div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#home" className="text-white/90 hover:text-white transition">
            Home
          </a>
        
          <a href="#pricing" className="text-white/90 hover:text-white transition">
            See Pricing
          </a>
          <a href="https://wa.me/233531727714" target="_blank" className="text-white/90 hover:text-white transition flex items-center gap-2">
          <MessageSquareCheck/> Contact  Us
          </a> 
        <a href="https://wa.me/233531727714" target="_blank" className="text-white/90 hover:text-white transition flex items-center gap-2">
          <Users/> Community
        </a>


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
            className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold !text-slate-900 transition hover:translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile: Get Started + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold !text-slate-900 transition hover:translate-y-0.5"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            See Pricing
          </a>
          <a
            href="https://wa.me/233531727714"
            target="_blank"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <MessageSquareCheck size={18} /> Contact Us
          </a>
          <a
            href="https://wa.me/233531727714"
            target="_blank"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <Users size={18} /> Community
          </a>
          <div className="mt-2 border-t border-white/20 pt-3">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-full py-2.5 text-center text-sm font-semibold text-white/90 ring-1 ring-white/40 transition hover:text-white"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
