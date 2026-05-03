'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Betaling Niet Voltooid
          </h1>
          <p className="text-gray-600 mb-6">
            Uw bestelling is niet verwerkt. Er is geen betaling in rekening gebracht.
          </p>
          <div className="space-y-3">
            <Link
              href="/cart"
              className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Opnieuw Proberen
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-6 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all"
            >
              Terug naar Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
