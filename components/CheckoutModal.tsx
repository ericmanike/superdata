"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast , ToastContainer } from "react-toastify";
import { Loader2,  Wallet } from "lucide-react";
import MoolrePay from "@moolre/moolrejs";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  summary: { network: string; size: string; price: number } | null;
};

export function CheckoutModal({ open, onClose, phone, onPhoneChange, summary }: ModalProps) {
  const { data: session } = useSession();
  const [isPaying, setIsPaying] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

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

  const validateCheckout = async () => {
    if (!session?.user?.email) {
      toast.error("Please login to purchase");
      return false;
    }
    if (!phone) {
      toast.error("Please enter a phone number");
      return false;
    }
  
    return true;
  };

  const handleMoolrePayment = async () => {

     if (!validateCheckout()) return; 
       setIsCheckingEligibility(true);
     const result =   await  fetch("/api/adhGroup/validate-recipient",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        offerSlug: "mtn_data_bundle",
      }),
    })
    const Finalresult = await result.json();

    if(!Finalresult?.results?.[0].eligible){
      toast.error(Finalresult?.results?.[0].reason || "This number is not eligible for this offer,please check the number or try another number");
      setIsCheckingEligibility(false);
        return 
      }
       setIsCheckingEligibility(false);
     




    const username = process.env.NEXT_PUBLIC_MOOLRE_USERNAME || "";
    const publicKey = process.env.NEXT_PUBLIC_MOOLRE_PK || "";
    const accountNumber = process.env.NEXT_PUBLIC_MOOLRE_ACCOUNT_NUMBER || "";

    if (!publicKey || !username || !accountNumber) {
      toast.error("Moolre payment configuration missing. Please check credentials.");
      return;
    }

    setIsPaying(true);
    setActiveMethod("moolre");
    try {
      const popup = new MoolrePay();
      const reference = "MOOLRE_" + Date.now();

      await popup.checkout({
        username,
        publicKey,
        accountNumber,
        amount: summary.price,
        email: session!.user!.email!,
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
              setActiveMethod(null);
            }
          } catch (e) {
            console.error("Order completion error:", e);
            toast.error("Network error processing order");
            setIsPaying(false);
            setActiveMethod(null);
          }
        },
        onCancel: () => {
          console.log("Moolre payment cancelled");
          toast.info("Payment cancelled");
          setIsPaying(false);
          setActiveMethod(null);
        },
        onError: (err: any) => {
          console.error("Moolre payment error:", err);
          toast.error("Error initializing or completing Moolre payment");
          setIsPaying(false);
          setActiveMethod(null);
        },
        onClose: () => {
          console.log("Moolre window closed");
          setIsPaying(false);
          setActiveMethod(null);
        },
      });
    } catch (err) {
      console.error("Moolre setup error:", err);
      toast.error("Error initializing Moolre payment system");
      setIsPaying(false);
      setActiveMethod(null);
    }
  };

 

  const handleWalletPayment = async () => {
    if (!validateCheckout() || isPaying) return;
      setIsCheckingEligibility(true);
         const result =   await  fetch("/api/adhGroup/validate-recipient",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        offerSlug: "mtn_data_bundle",
      }),
    })
    const Finalresult = await result.json();

    if(!Finalresult?.results?.[0].eligible){
      toast.error(Finalresult?.results?.[0].reason || "This number is not eligible for this offer,please check the number or try another number");
      setIsCheckingEligibility(false);
        return 
      }
       setIsCheckingEligibility(false);

    setIsPaying(true);
    setActiveMethod("wallet");
    try {
      const res = await fetch("/api/walletPurchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: summary.network,
          bundleName: summary.size.replace(/GB$/i, "").trim(),
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
        setActiveMethod(null);
      }
    } catch (e) {
      console.error("Wallet payment error:", e);
      toast.error("Network error processing wallet payment");
      setIsPaying(false);
      setActiveMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
       <ToastContainer  hideProgressBar={true} theme="colored" autoClose={10000} position="top-center"/>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Checkout Summary</h3>
            <p className="text-sm text-slate-500">Confirm details & select payment method</p>
          </div>
          <button
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl font-bold transition-colors"
            onClick={onClose}
            disabled={isPaying}
          >
            ×
          </button>
        </div>

        {/* Order Details Card */}
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Network</span>
            <span className="font-semibold text-slate-900">{summary.network}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Bundle Package</span>
            <span className="font-semibold text-slate-900">{summary.size}</span>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Recipient Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="024 123 4567"
              disabled={isPaying}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-2 ring-transparent transition focus:border-blue-600 focus:ring-blue-100 disabled:bg-slate-100"
            />
            {isCheckingEligibility && <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <span className="text-xs text-slate-500">Checking validity....</span></div> }
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 text-base font-bold text-slate-900">
            <span>Total Price</span>
            <span className="text-lg text-blue-900">₵{summary.price}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="mt-5 space-y-2.5">
         

{/*
          <button
            onClick={handleMoolrePayment}
            disabled={isPaying}
            className="w-full flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-yellow-400" />
              <span>Pay with Moolre</span>
            </div>
            {isPaying && activeMethod === "moolre" ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">Momo</span>
            )}
          </button>
          */}

        

          <button
            onClick={handleWalletPayment}
            disabled={isPaying}
            className="w-full flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span>Pay with Wallet</span>
            </div>
            {isPaying && activeMethod === "wallet" ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            ) : (
              <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded-md border border-emerald-200">Balance</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
