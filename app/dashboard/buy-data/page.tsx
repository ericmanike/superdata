"use client";

import { bundles } from "@/app/lib/mockData";
import { BundleCard } from "@/app/components/BundleCard";
import { PaystackModal } from "@/app/components/PaystackModal";
import { useMemo, useState } from "react";

type Network = "All" | "MTN" | "Telecel" | "AirtelTigo";

export default function BuyDataPage() {
  const [phone, setPhone] = useState("");
  const [bundleId, setBundleId] = useState(bundles[0]?.id ?? "");
  const [filter, setFilter] = useState<Network>("All");
  const [showPayModal, setShowPayModal] = useState(false);

  const filteredBundles = useMemo(() => {
    if (filter === "All") return bundles;
    return bundles.filter((b) => b.network === filter);
  }, [filter]);

  const selectedBundle = bundles.find((b) => b.id === bundleId);

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Checkout</p>
        <h1 className="text-2xl font-bold text-slate-900">Buy Data</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "MTN", "Telecel", "AirtelTigo"] as Network[]).map((net) => (
          <button
            key={net}
            type="button"
            onClick={() => setFilter(net)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === net
                ? "bg-[#1e3a8a] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Available data packages</h2>
          <span className="text-sm text-slate-600">Tap a card to buy</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onSelect={(b) => {
                setBundleId(b.id);
                setShowPayModal(true);
              }}
            />
          ))}
        </div>
      </div>

      <PaystackModal
        open={showPayModal && !!selectedBundle}
        onClose={() => setShowPayModal(false)}
        phone={phone}
        onPhoneChange={setPhone}
        summary={
          selectedBundle
            ? {
                network: selectedBundle.network,
                size: selectedBundle.size,
                price: selectedBundle.price,
              }
            : null
        }
      />
    </div>
  );
}
