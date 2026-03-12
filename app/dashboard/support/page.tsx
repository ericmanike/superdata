export default function SupportPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Help</p>
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Live chat</h2>
          <p className="mt-2 text-sm text-slate-700">
            Reach our team any time for delivery checks, wallet issues, or
            payout help.
          </p>
          <button className="mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-900">
            Start chat
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Tickets</h2>
          <p className="mt-2 text-sm text-slate-700">
            Open a ticket for audits or dispute resolution. Average response
            under 15 minutes.
          </p>
          <button className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
            Create ticket
          </button>
        </div>
      </div>
    </div>
  );
}
