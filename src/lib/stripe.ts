import Stripe from 'stripe'
import { prisma } from './prisma'

export async function getStripe() {
  const settings = await prisma.siteSettings.findFirst()
  const key = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe secret key is not configured. Go to Admin > Settings > Stripe to add your key.')
  }
  return new Stripe(key)
}

export async function getStripePublicKey(): Promise<string> {
  const settings = await prisma.siteSettings.findFirst()
  const key = settings?.stripePublicKey || process.env.STRIPE_PUBLIC_KEY
  if (!key) {
    throw new Error('Stripe public key is not configured. Go to Admin > Settings > Stripe to add your key.')
  }
  return key
}
