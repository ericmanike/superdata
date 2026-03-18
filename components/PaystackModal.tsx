"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
type ModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  summary: { network: string; size: string; price: number } | null;
};

export function PaystackModal({ open, onClose, phone, onPhoneChange, summary }: ModalProps) {
  const { data: session } = useSession();
  const [isPaying, setIsPaying] = useState(false);

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
      toast.error("Please login to purchase");
      return;
    }
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!(window as any).PaystackPop) {
      toast.info("Payment system is still loading. Please try again in a few seconds.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    console.log("Paystack key status:", !!paystackKey);

    if (!paystackKey) {
      toast.error("Payment system error: Key missing");
      return;
    }

    setIsPaying(true);
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
                toast.success("Purchase successful!");
                window.location.href = "/dashboard/orders";
              } else {
                const err = await res.json();
                toast.error("Error: " + (err.message || "Failed to process order"));
                setIsPaying(false);
              }
            } catch (e) {
              console.error("Order completion error:", e);
              toast.error("Network error processing order");
              setIsPaying(false);
            }
          };
          processOrder();
        },
        onClose: () => {
          console.log("Paystack window closed");
          setIsPaying(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error("Paystack setup error:", err);
      toast.error("Error initializing payment system");
      setIsPaying(false);
    }
  };

const handleWalletPayment = async() => {
  if (isPaying) return;
  setIsPaying(true);
  try {
    const res = await fetch("/api/walletPurchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network: summary.network,
        bundleName: summary.size.slice(0, -2),
        price: summary.price,
        phoneNumber: phone,
        reference: Date.now(),
      }),
    });
    if (res.ok) {
      toast.success("Purchase successful!");
      window.location.href = "/dashboard/orders";
    } else {
      const err = await res.json();
      toast.error("Error: " + (err.message || "Failed to process order"));
      setIsPaying(false);
    }
  } catch (e) {
    console.error("Wallet payment error:", e);
    toast.error("Network error processing wallet payment");
    setIsPaying(false);
  }
}









  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Select your payment method   </p>
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
        <div className="w-full">
        <button 
          onClick={handlePayment}
          disabled={isPaying}
          className="mt-4 w-full flex items-center justify-center max-w-md mx-auto rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400 group"
        >
          {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay with Paystack
        </button>
        <button 
          onClick={handleWalletPayment}
          disabled={isPaying}
          className="mt-4 w-full flex items-center justify-center max-w-md mx-auto rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
        >
          {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay with wallet
        </button>
        </div>
      </div>
    </div>
  );
}
