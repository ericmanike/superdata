export default function SupportPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Help</p>
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
