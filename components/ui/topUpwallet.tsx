'use client'
import React, { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import MoolrePay from '@moolre/moolrejs'
import { TopUpModal } from '../TopUpModal'

interface TopUpWalletProps {
  className?: string;
  children?: React.ReactNode;
}

export default function TopUpWallet({ className, children }: TopUpWalletProps) {
  const { data: session } = useSession()
  const [amount, setAmount] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleTopUp = async () => {
    if (!session?.user?.email) {
      toast.error('Please login to continue')
      return;
    }

    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount')
      return;
    }

    const username = process.env.NEXT_PUBLIC_MOOLRE_USERNAME || "";
    const publicKey = process.env.NEXT_PUBLIC_MOOLRE_PK || "";
    const accountNumber = process.env.NEXT_PUBLIC_MOOLRE_ACCOUNT_NUMBER || "";

    if (!publicKey || !username || !accountNumber) {
      toast.error("Moolre payment configuration missing. Please check credentials.");
      return;
    }

    setIsLoading(true);
    try {
      const popup = new MoolrePay();
      const userId = (session.user as any)?.id || 'user';
      const reference = `wallet_${Date.now()}_${userId}`;

      await popup.checkout({
        username,
        publicKey,
        accountNumber,
        amount: amountNum,
        email: session.user.email,
        externalRef: reference,
        currency: "GHS",
        onSuccess: async (transaction: any) => {
          console.log("Moolre wallet topup callback:", transaction);
          try {
            const verifyResponse = await fetch('/api/topupWallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: amountNum,
                reference: transaction?.externalRef || reference,
              }),
            });

            if (verifyResponse.ok) {
              const data = await verifyResponse.json().catch(() => ({}));
              toast.success(data.message || 'Wallet topped up successfully!');
              setIsOpen(false);
              window.location.reload();
            } else {
              const err = await verifyResponse.json().catch(() => ({}));
              console.error('Wallet topup verification failed:', err);
              toast.error(err.message || 'Wallet topup verification failed');
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Error verifying wallet topup:', err);
            toast.error('Network error verifying wallet topup');
            setIsLoading(false);
          }
        },
        onCancel: () => {
          console.log('Moolre payment cancelled');
          toast.info('Payment cancelled');
          setIsLoading(false);
        },
        onError: (err: any) => {
          console.error('Moolre payment error:', err);
          toast.error('Error processing Moolre payment');
          setIsLoading(false);
        },
        onClose: () => {
          console.log('Moolre window closed');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Moolre setup error:', error);
      toast.error("Error initializing Moolre payment system");
      setIsLoading(false);
    }
  }

  return (
    <>
      <TopUpModal
        open={isOpen}
        amount={amount}
        onAmountChange={setAmount}
        onPay={handleTopUp}
        onClose={() => setIsOpen(false)}
        isLoading={isLoading}
      />
      {children ? (
        <div onClick={() => setIsOpen(true)} className={className}>
          {children}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={className || "flex items-center gap-2 px-4 py-3 bg-[#00caf5] transition hover:opacity-90 text-slate-900 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"}
        >
          <DollarSign size={18} />
          Top up your wallet
        </button>
      )}
    </>
  )
}