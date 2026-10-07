'use client'
import React from 'react'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

import { toast } from 'react-toastify'

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

    const handleUpgrade = async () => {
        if (!session?.user?.email) {
            toast.error('Please login to continue');
            return;
        }

        try {
            const response = await fetch('/api/registerAgent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session.user.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Failed to upgrade to agent');
                return;
            }

            toast.success(data.message || 'Successfully upgraded to agent!');
            if (update) {
                await update({ role: 'agent' });
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error upgrading to agent:', error);
            toast.error('An error occurred while upgrading to agent');
        }
    }

    return (
        <button
            onClick={handleUpgrade}
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
