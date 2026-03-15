'use client'
import React from 'react'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'



declare global {
    interface Window {
        PaystackPop: {
            setup: (options: any) => {
                openIframe: () => void;
            };
        };
    }
}






interface BecomeAgentProps {
    className?: string;
    children?: React.ReactNode;
}

function BecomeAgent({ className, children }: BecomeAgentProps) {

    const { data: session } = useSession()
    const { update } = useSession()

    const loadPaystackScript = () => {
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
        try {
            if (!session?.user?.email) {
                alert('Please login to continue')
                return;
            }
            if (session?.user?.role === 'agent') {
                alert('You are already an agent')
                return;
            }

            const reference = Date.now().toString()

            const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
            if (!paystackKey) {
                throw new Error('Paystack public key not found');
            }
            if (!window.PaystackPop) {
                console.log('Paystack script not loaded');
                return;
            }

            const handler = window.PaystackPop.setup({
                key: paystackKey!,
                email: session?.user?.email!,
                currency: 'GHS',
                amount: Math.round((30 + 30 * 0.02) * 100), // Convert to kobo

                ref: reference,
                onClose: () => {

                },
                callback: function (response: any) {
                    (async () => {
                        try {
                            const verifyResponse = await fetch('/api/registerAgent', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: session?.user?.email!,
                                    reference,
                                }),
                            });

                            if (verifyResponse.ok) {
                                await update({ role: 'agent' })
                                console.log("User successfully registered as agent");
                                window.location.reload()
                            }
                        } catch (err) {
                            console.error('Error verifying payment', err);
                        }
                    })();
                },
            })

            handler.openIframe()
        } catch (error) {
            console.error(error);
            alert("Something went wrong with the purchase.");
        }

    }

    return (
        <button
            onClick={handleTopUp}
            className={className || `w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 ${session?.user?.role === 'agent' ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
             text-white rounded-lg font-semibold text-[10px] md:text-sm transition-all shadow-md hover:shadow-lg`}
            disabled={session?.user?.role === 'agent'}
            style={{ cursor: session?.user?.role === 'agent' ? 'not-allowed' : 'pointer' }}
        >
            {session?.user?.role === 'agent' 
                ? 'You are now an Agent' 
                : (children || `Upgrade to an Agent ${formatCurrency(30)}`)
            }
        </button>

    )
}

export default BecomeAgent
