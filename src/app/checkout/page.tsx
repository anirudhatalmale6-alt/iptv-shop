"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Lock,
  CreditCard,
  Loader2,
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  optionId?: string;
  optionName?: string;
  playerTypeId?: string;
  playerTypeName?: string;
  playerMac?: string;
  playerDeviceKey?: string;
  quantity: number;
  price: number;
}

const TAX_RATE = 0.21;
const TAX_NAME = "BTW";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setCartItems([]);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted">Laden...</div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-50 rounded-full mb-6">
              <ShoppingBag className="w-12 h-12 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Je winkelwagen is leeg
            </h1>
            <p className="text-muted mb-8">
              Voeg een product toe om af te rekenen.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all duration-300"
            >
              Bekijk abonnementen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Vul alle verplichte velden in.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Voer een geldig e-mailadres in.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          items: cartItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Er is iets misgegaan.");
      }

      if (data.url) {
        // Clear cart before redirect
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
        window.location.href = data.url;
      } else {
        throw new Error("Geen betalingslink ontvangen.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Er is iets misgegaan."
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-muted hover:text-primary-600 font-medium mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar winkelwagen
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Afrekenen</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Customer Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 mb-6">
                <h2 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Jouw gegevens
                </h2>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Volledige naam <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jan Jansen"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-foreground placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      E-mailadres <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@voorbeeld.nl"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-foreground placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Bezig met doorsturen...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Betaal met Stripe
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Veilige betaling via Stripe
              </p>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-foreground mb-6">
                Bestelling
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.productName}
                      </p>
                      {item.optionName && (
                        <p className="text-xs text-muted mt-0.5">
                          {item.optionName}
                        </p>
                      )}
                      {item.playerTypeName && (
                        <p className="text-xs text-muted">
                          {item.playerTypeName}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-sm text-foreground whitespace-nowrap">
                      &euro;{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-primary-100">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotaal</span>
                  <span className="font-medium text-foreground">
                    &euro;{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">
                    {TAX_NAME} ({(TAX_RATE * 100).toFixed(0)}%)
                  </span>
                  <span className="font-medium text-foreground">
                    &euro;{taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-primary-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">Totaal</span>
                    <span className="font-bold text-xl gradient-text">
                      &euro;{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
