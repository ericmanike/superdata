"use client";
import BecomeAgent from "@/components/ui/becomeAgent";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";

export default function PremiumAgentPage() {
  const { data: session } = useSession()
  const isAgent = session?.user?.role === 'agent'

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Upgrade</p>
        <h1 className="text-2xl font-bold text-slate-900">Premium Agent</h1>
      </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 w-[80%]">
          <h2 className="text-lg font-semibold text-slate-900">
            Premium perks included
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Better prices on data packages
            </li>
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Ability to create your own store
            </li>
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Higher profit margins
            </li>
          </ul>
          <BecomeAgent className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${isAgent ? 'bg-gray-400 text-white' : 'bg-[#FFD700] text-slate-900 hover:opacity-90'}`}>
            {!isAgent && (
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.5 9.5 8 5l4 5 4-5 2.5 4.5 2.5-1.5-2 9H5l-2-9 2.5 1.5Z" />
                    <path d="M5 18h14v1H5z" />
                </svg>
            )}
            Upgrade now - ₵30
          </BecomeAgent>
        </div>
    </div>
  );
}
