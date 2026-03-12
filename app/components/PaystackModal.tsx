"use client";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  summary: { network: string; size: string; price: number } | null;
};

export function PaystackModal({ open, onClose, phone, onPhoneChange, summary }: ModalProps) {
  if (!open || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Pay with Paystack</p>
            <h3 className="text-xl font-bold text-slate-900">Confirm purchase</h3>
          </div>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Network</span>
            <span className="font-semibold text-slate-900">{summary.network}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Bundle</span>
            <span className="font-semibold text-slate-900">{summary.size}</span>
          </div>
          <div className="space-y-1">
            <label className="text-slate-600">Phone</label>
            <input
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="024 123 4567"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>₵{summary.price}</span>
          </div>
        </div>

        <button className="mt-4 w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white">
          Pay with Paystack
        </button>
        <p className="mt-2 text-xs text-slate-500">
          You will be redirected to Paystack to complete this payment securely.
        </p>
      </div>
    </div>
  );
}
