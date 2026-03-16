export default function AgentStorePage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Storefront</p>
        <h1 className="text-2xl font-bold text-slate-900">My Agent Store</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-700">
          Share your personal purchase link and let customers pay you directly.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Store link
              </p>
              <p className="font-semibold text-slate-900">
                https://hubsitedata.africa/agent/datapro
              </p>
            </div>
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Copy link
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Auto-fulfillment on
            </span>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              Custom pricing
            </span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
              Branded receipts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
