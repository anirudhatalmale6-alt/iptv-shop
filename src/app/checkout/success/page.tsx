'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useEffect, Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  useEffect(() => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bestelling Bevestigd!
          </h1>
          <p className="text-gray-600 mb-4">
            Betaling succesvol. U ontvangt binnenkort een bevestigingsmail.
          </p>
          {orderNumber && (
            <div className="bg-purple-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">Bestelnummer</p>
              <p className="text-lg font-mono font-bold text-purple-700">{orderNumber}</p>
            </div>
          )}
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Terug naar Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
