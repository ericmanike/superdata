export default function PremiumAgentPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Upgrade</p>
        <h1 className="text-2xl font-bold text-slate-900">Premium Agent</h1>
      </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-md">
          <h2 className="text-lg font-semibold text-slate-900">
            Premium perks included
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Higher wallet limits and faster settlements</li>
            <li>• Priority delivery pipeline during peak hours</li>
            <li>• Dedicated account manager</li>
            <li>• White-label storefront for your customers</li>
          </ul>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.5 9.5 8 5l4 5 4-5 2.5 4.5 2.5-1.5-2 9H5l-2-9 2.5 1.5Z" />
              <path d="M5 18h14v1H5z" />
            </svg>
            Upgrade now
          </button>
        </div>
    </div>
  );
}
