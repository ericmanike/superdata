"use client";

type Bundle = { id: string; network: string; size: string; price: number };

const networkColors: Record<string, string> = {
  MTN: "bg-amber-400",
  Telecel: "bg-rose-500",
  AirtelTigo: "bg-sky-500",
};

import { Check } from "lucide-react";

export function BundleCard({
  bundle,
  onSelect,
}: {
  bundle: Bundle;
  onSelect: (bundle: Bundle) => void;
}) {
  return (
    <div 
      onClick={() => {
        console.log("Card clicked:", bundle);
        onSelect(bundle);
      }}
      className="flex flex-col justify-between rounded-[10px] border border-slate-200 bg-white p-6 min-h-[220px] shadow-sm transition-shadow hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            bundle.network === "MTN" ? "text-slate-900" : "text-white"
          } ${
            networkColors[bundle.network] ?? "bg-slate-900"
          }`}
        >
          {bundle.network}
        </span>
        <span className="text-sm font-semibold text-[#1e3a8a]">₵{bundle.price}</span>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">{bundle.size}</div>
        <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md mt-1">
          <Check size={10} strokeWidth={3} />
          <span>None expire</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Button clicked:", bundle);
          onSelect(bundle);
        }}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white"
      >
        Buy now
      </button>
    </div>
  );
}
