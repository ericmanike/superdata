"use client"
import { useRouter } from "next/navigation"
type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function BuyingModal({ isOpen, onClose }: Props) {

const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"  />

      <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-center"> <strong>Important Notice !</strong>   </h3>
  
        <div className="space-y-4 text-sm">
          <p className="font-semibold text-gray-700">
           We are not responsible for any loss or damage that may occur as a result of entering a wrong phone number.
          </p>
             
          <strong> <p className="font-semibold text-gray-700">
            
            We cannot guarantee  error free systems and transactions. 
            A typical transaction can take up to 15 minutes to complete. however downtimes may some times delay transactions.
          </p></strong>
          
          
        </div>

        <div className="flex  justify-between mt-6">
          <button onClick={()=> router.push('/dashboard')}
            className="px-6 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Sure, continue
          </button>
        </div>
      </div>
    </div>
  )
}