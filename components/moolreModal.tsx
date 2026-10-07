"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import MoolrePay from "@moolre/moolrejs";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  summary: { network: string; size: string; price: number } | null;
};

export function MoolreModal({ open, onClose, phone, onPhoneChange, summary }: ModalProps) {
  const { data: session } = useSession();
  const [isPaying, setIsPaying] = useState(false);

  if (!open || !summary) return null;

  const handlePayment = async () => {
    if (!session?.user?.email) {
      toast.error("Please login to purchase");
      return;
    }
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }

    const username = process.env.NEXT_PUBLIC_MOOLRE_USERNAME || process.env.MOOLRE_USERNAME || "";
    const publicKey = process.env.NEXT_PUBLIC_MOOLRE_PK || process.env.NEXT_PUBLIC_MOOLRE_PUBLIC_KEY || process.env.MOOLRE_PK || "";
    const accountNumber = process.env.NEXT_PUBLIC_MOOLRE_ACCOUNT_NUMBER || process.env.MOOLRE_ACCOUNT_NUMBER || "";

    if (!publicKey || !username || !accountNumber) {
      toast.error("Moolre payment configuration missing. Please check credentials.");
      return;
    }

    setIsPaying(true);
    try {
      const popup = new MoolrePay();
      const reference = "MOOLRE_" + Date.now();

      await popup.checkout({
        username,
        publicKey,
        accountNumber,
        amount: summary.price,
        email: session.user.email,
        externalRef: reference,
        currency: "GHS",
        onSuccess: async (transaction: any) => {
          console.log("Moolre callback response:", transaction);
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                network: summary.network,
                bundleName: summary.size.replace(/GB$/i, "").trim(),
                price: summary.price,
                phoneNumber: phone,
                reference: transaction?.externalRef || reference,
                paymentMethod: "moolre",
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
        },
        onCancel: () => {
          console.log("Moolre payment cancelled");
          toast.info("Payment cancelled");
          setIsPaying(false);
        },
        onError: (err: any) => {
          console.error("Moolre payment error:", err);
          toast.error("Error initializing or completing Moolre payment");
          setIsPaying(false);
        },
        onClose: () => {
          console.log("Moolre window closed");
          setIsPaying(false);
        },
      });
    } catch (err) {
      console.error("Moolre setup error:", err);
      toast.error("Error initializing Moolre payment system");
      setIsPaying(false);
    }
  };

  const handleWalletPayment = async () => {
    if (isPaying) return;
    setIsPaying(true);
    try {
      const res = await fetch("/api/walletPurchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: summary.network,
          bundleName: summary.size.replaceAll("GB", ""),
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Select your payment method</p>
            <h3 className="text-xl font-bold text-slate-900">Confirm purchase</h3>
          </div>
          <button className="text-slate-500 hover:text-slate-800 text-xl font-bold" onClick={onClose}>
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
            className="mt-4 w-full flex items-center justify-center max-w-md mx-auto rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400 group hover:bg-[#1b337a] transition-colors"
          >
            {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with Momo
          </button>
          <button
            onClick={handleWalletPayment}
            disabled={isPaying}
            className="mt-4 w-full flex items-center justify-center max-w-md mx-auto rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400 hover:bg-[#1b337a] transition-colors"
          >
            {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoolreModal;