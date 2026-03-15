"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Problem with order",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ ...formData, message: "" });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Failed to send ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Help</p>
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Need help?</h2>
              <p className="mt-2 text-sm text-emerald-800">
                Reach our team any time for delivery checks, wallet issues, or
                payout help.
              </p>
            </div>
            <a 
              href="https://wa.me/233531727714" 
              target="_blank"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-md shadow-emerald-200"
            >
              Start chat
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 leading-none">Support Hours</h2>
            <p className="mt-4 text-sm text-slate-600">
              Our team is available to assist you during the following times:
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Mon - Fri</span>
                <span className="font-bold text-slate-900">8:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Sat - Sun</span>
                <span className="font-bold text-slate-900">9:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
            <p className="text-sm text-slate-600">Fill out the form below and we'll get back to you shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-[#00c9f5] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-[#00c9f5] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-[#00c9f5] focus:outline-none"
              >
                <option>Problem with order</option>
                <option>Wallet/Payment issue</option>
                <option>Data bundle not received</option>
                <option>General inquiry</option>
                <option>Feedback/Suggestion</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
              <textarea
                required
                rows={4}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-[#00c9f5] focus:outline-none"
              />
            </div>

            <button
              disabled={loading || success}
              type="submit"
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-slate-900 transition-all ${
                success 
                ? "bg-emerald-500 text-white" 
                : "bg-[#00c9f5] hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Message sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
