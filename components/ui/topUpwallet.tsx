'use client'
import React, { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { TopUpModal } from '../TopUpModal'

interface TopUpWalletProps {
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

export default function TopUpWallet({ className, children }: TopUpWalletProps) {
  const { data: session } = useSession()
  const [amount, setAmount] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadPaystackScript = () => {
    if (window.PaystackPop) return;
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
  }

  useEffect(() => {
    loadPaystackScript()
  }, [])

  const handleTopUp = () => {
    if (!session) {
      alert('Please login to continue')
      return;
    }

    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount')
      return;
    }

    setIsLoading(true);
    try {
      const reference = Date.now().toString()
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

      if (!paystackKey) {
        console.error('Paystack public key not found')
        alert('Payment system configuration missing. Please contact support.')
        setIsLoading(false);
        return;
      }

      if (!window.PaystackPop) {
        console.error('Paystack script not loaded');
        alert('Payment gateway is still loading. Please wait a moment.')
        setIsLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: session?.user?.email!,
        currency: 'GHS',
        amount: Math.round((amountNum + (amountNum * 0.02)) * 100), // Convert to pesewas (GHS)
        ref: reference,
        onClose: () => {
          console.log('Payment closed');
          setIsLoading(false);
        },
        callback: function (response: any) {
          (async () => {
            try {
              const verifyResponse = await fetch('/api/topupWallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: session?.user?.email!,
                  amount: amountNum,
                  reference,
                }),
              });

              if (verifyResponse.ok) {
                console.log('Payment verified');
                window.location.reload();
              } else {
                console.error('Payment verification failed');
                alert('Payment verification failed. Please contact support.');
                setIsLoading(false);
              }
            } catch (err) {
              console.error('Error verifying payment', err);
              setIsLoading(false);
            }
          })();
        },
      })

      handler.openIframe()
      // Keep state true until one of the callbacks is fired
    } catch (error) {
      console.error(error);
      alert("Something went wrong with the payment process.");
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