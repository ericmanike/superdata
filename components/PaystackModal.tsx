"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  summary: { network: string; size: string; price: number } | null;
};

export function PaystackModal({ open, onClose, phone, onPhoneChange, summary }: ModalProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (open) {
      if (!(window as any).PaystackPop) {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [open]);

  if (!open || !summary) return null;

  const handlePayment = () => {
    console.log("handlePayment triggered", { 
      email: session?.user?.email, 
      phone, 
      summary, 
      paystackPopExists: !!(window as any).PaystackPop 
    });

    if (!session?.user?.email) {
      alert("Please login to purchase");
      return;
    }
    if (!phone) {
      alert("Please enter a phone number");
      return;
    }

    if (!(window as any).PaystackPop) {
      alert("Payment system is still loading. Please try again in a few seconds.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    console.log("Paystack key status:", !!paystackKey);

    if (!paystackKey) {
      alert("Payment system error: Key missing");
      return;
    }

    try {
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: session.user.email,
        amount: Math.round((summary.price + summary.price * 0.02) * 100), // GHS to pesewas + 2% tax
        currency: "GHS",
        ref: "DATA_" + Date.now(),
        callback: function (response: any) {
          console.log("Paystack callback response:", response);
          const processOrder = async () => {
            try {
              const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  network: summary.network,
                  bundleName: summary.size.slice(0, -2),
                  price: summary.price,
                  phoneNumber: phone,
                  reference: response.reference,
                }),
              });
              if (res.ok) {
                alert("Purchase successful!");
                window.location.href = "/dashboard/orders";
              } else {
                const err = await res.json();
                alert("Error: " + (err.message || "Failed to process order"));
              }
            } catch (e) {
              console.error("Order completion error:", e);
              alert("Network error processing order");
            }
          };
          processOrder();
        },
        onClose: () => {
          console.log("Paystack window closed");
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error("Paystack setup error:", err);
      alert("Error initializing payment system");
    }
  };

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

        <button 
          onClick={handlePayment}
          className="mt-4 w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white"
        >
          Pay with Paystack
        </button>
        
      </div>
    </div>
  );
}
