"use client";

import { BundleCard } from "@/components/BundleCard";
import { PaystackModal } from "@/components/PaystackModal";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type Network = "All" | "MTN" | "Telecel" | "AirtelTigo";

export default function BuyDataPage() {
  const { data: session } = useSession();
  const [bundles, setBundles] = useState<any[]>([]);
  const [phone, setPhone] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [filter, setFilter] = useState<Network>("All");
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    fetch("/api/bundles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBundles(data);
          if (data.length > 0) setBundleId(data[0].id);
        } else {
          console.error("Bundles API did not return an array:", data);
          setBundles([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching bundles:", err);
        setBundles([]);
      });
  }, []);

  const filteredBundles = useMemo(() => {
    let list = Array.isArray(bundles) ? bundles : [];
    
    // Filter by audience (role)
    const role = session?.user?.role || 'user';
    if (role === 'agent') {
      list = list.filter(b => b.audience === 'agent');
    } else if (role !== 'admin') {
      // Regular users only see 'user' bundles
      list = list.filter(b => b.audience === 'user' || !b.audience);
    }
    // Note: Admins see everything

    if (filter === "All") return list;
    return list.filter((b) => b.network === filter);
  }, [filter, bundles, session]);

  const selectedBundle = Array.isArray(bundles) ? bundles.find((b) => b.id === bundleId) : null;

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
          {filteredBundles.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-500 font-medium">No bundles found for this category.</p>
            </div>
          )}
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
