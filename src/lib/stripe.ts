import Stripe from 'stripe'

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return new Stripe(key)
}

export function getStripePublicKey(): string {
  const key = process.env.STRIPE_PUBLIC_KEY
  if (!key) {
    throw new Error('STRIPE_PUBLIC_KEY is not set in environment variables')
  }
  return key
}
