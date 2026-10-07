"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";
import { 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  SlidersHorizontal,
  Tag,
  Layers
} from "lucide-react";
import type { ADHOffer, ADHOffersResponse } from "@/lib/adhgroupAPIs";

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

export default function ADHGroupOffersPage() {
  const [offersData, setOffersData] = useState<ADHOffersResponse | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [searchQuery, setSearchQuery] = useState("");
  const [ispFilter, setIspFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setStatus({ kind: "loading", message: "Fetching ADH Group offers catalog..." });
    try {
      const res = await fetch("/api/adhGroup/offers", { cache: "no-store" });
      const data: ADHOffersResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to load offers");
      }
      setOffersData(data);
      setStatus({ kind: "idle" });
    } catch (err: any) {
      console.error("Fetch ADH offers error:", err);
      setStatus({ kind: "error", message: err?.message || "Failed to fetch ADH offers" });
    }
  }

  const offersList = offersData?.offers || [];

  // Available ISP choices dynamically
  const isps = useMemo(() => {
    const set = new Set<string>();
    offersList.forEach((o) => { if (o.isp) set.add(o.isp); });
    return Array.from(set);
  }, [offersList]);

  // Filtered offers list
  const filteredOffers = useMemo(() => {
    let list = [...offersList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.offerSlug?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.isp?.toLowerCase().includes(q)
      );
    }

    if (ispFilter !== "All") {
      list = list.filter((o) => o.isp?.toLowerCase() === ispFilter.toLowerCase());
    }

    if (typeFilter !== "All") {
      list = list.filter((o) => o.type?.toLowerCase() === typeFilter.toLowerCase());
    }

    return list;
  }, [offersList, searchQuery, ispFilter, typeFilter]);

  return (
    <div className="space-y-8 text-slate-900">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-base text-slate-600 font-medium">ADH Group Integration</p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            ADH Group Offers Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Offers assigned to your API Key account, filtered by key scope (e.g. Data & Airtime).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {offersData?.authMethod && (
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Auth: {offersData.authMethod}
            </span>
          )}
        </div>
      </div>

      {/* Status banner */}
      {status.kind !== "idle" && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-bold ${
            status.kind === "error"
              ? "bg-rose-100 text-rose-800 border border-rose-200"
              : status.kind === "success"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          {status.kind === "error" && <AlertCircle size={16} />}
          {status.kind === "loading" && <RefreshCw size={16} className="animate-spin" />}
          {status.kind === "success" && <CheckCircle2 size={16} />}
          {status.message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by offer name, slug, ISP or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none"
            />
          </div>

          {/* ISP Filters */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase">ISP:</span>
            {["All", ...isps].map((isp) => (
              <button
                key={isp}
                onClick={() => setIspFilter(isp)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  ispFilter.toLowerCase() === isp.toLowerCase()
                    ? "bg-white text-[#1e3a8a] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isp}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase">Type:</span>
            {["All", "Data", "Airtime"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  typeFilter.toLowerCase() === t.toLowerCase()
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Available Account Offers
            <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {filteredOffers.length}
            </span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOffers.map((offer, idx) => (
            <div
              key={offer.offerSlug || idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md hover:border-blue-200 flex flex-col justify-between"
            >
              <div>
                {/* Header badges */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{offer.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{offer.description || "ADH Group Offer"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        offer.isp?.toUpperCase() === "MTN"
                          ? "bg-amber-100 text-amber-800"
                          : offer.isp?.toUpperCase() === "TELECEL"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {offer.isp}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        offer.type?.toLowerCase() === "data"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {offer.type}
                    </span>
                  </div>
                </div>

                {/* Offer Slug */}
                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offer Slug</p>
                    <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">{offer.offerSlug}</p>
                  </div>
                  <CopyButton text={offer.offerSlug} className="text-xs text-[#1e3a8a] font-bold" />
                </div>

                {/* Volumes */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Layers size={13} />
                    Available Volumes (GB/Units):
                  </p>
                  {offer.volumes && offer.volumes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {offer.volumes.map((vol) => (
                        <span
                          key={vol}
                          className="rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-xs font-bold text-blue-900"
                        >
                          {vol} {offer.type?.toLowerCase() === "data" ? "GB" : "Units"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Flex / Variable amount</p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Scope: Account Assigned</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active
                </span>
              </div>
            </div>
          ))}

          {filteredOffers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
              <Tag size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">No offers found</p>
              <p className="text-xs text-slate-400 mt-1">
                {status.kind === "loading"
                  ? "Loading ADH Group offers catalog..."
                  : "No offers match your search or filters."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
