"use client";

type Bundle = { id: string; network: string; size: string; price: number };

const networkColors: Record<string, string> = {
  MTN: "bg-amber-400",
  Telecel: "bg-rose-500",
  AirtelTigo: "bg-sky-500",
};

export function BundleCard({
  bundle,
  onSelect,
}: {
  bundle: Bundle;
  onSelect: (bundle: Bundle) => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-slate-900 ${
            networkColors[bundle.network] ?? "bg-slate-900"
          }`}
        >
          {bundle.network}
        </span>
        <span className="text-sm font-semibold text-[#1e3a8a]">₵{bundle.price}</span>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{bundle.size}</div>
      <button
        type="button"
        onClick={() => onSelect(bundle)}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white"
      >
        Buy now
      </button>
    </div>
  );
}
