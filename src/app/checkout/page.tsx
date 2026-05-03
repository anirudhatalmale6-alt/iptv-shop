"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Lock,
  CreditCard,
  Loader2,
  Shield,
  Tv,
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50">
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !email.trim()) {
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
          customerName: fullName,
          customerEmail: email.trim(),
          items: cartItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Er is iets misgegaan.");
      }

      if (data.url) {
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-foreground placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-muted hover:text-primary-600 font-medium mb-8 transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar winkelwagen
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">Winkelwagen</span>
          </div>
          <div className="w-12 sm:w-20 h-0.5 bg-primary-600 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">Gegevens</span>
          </div>
          <div className="w-12 sm:w-20 h-0.5 bg-gray-300 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <span className="text-sm font-medium text-gray-400 hidden sm:block">Betaling</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Customer Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="font-bold text-lg text-foreground mb-1">
                  Contactgegevens
                </h2>
                <p className="text-muted text-sm mb-6">
                  Vul je gegevens in om de bestelling af te ronden
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Voornaam <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        placeholder="Jan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Achternaam <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        placeholder="Jansen"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      E-mailadres <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="jan@voorbeeld.nl"
                    />
                    <p className="text-xs text-muted mt-1.5">
                      Je ontvangt een bevestiging en activatiegegevens op dit adres
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="font-bold text-lg text-foreground mb-1">
                  Betaalmethode
                </h2>
                <p className="text-muted text-sm mb-6">
                  Je wordt doorgestuurd naar Stripe om veilig te betalen
                </p>

                <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Card</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-sm font-bold text-[#CC0066]">iDEAL</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-sm font-bold text-blue-600">Bancontact</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-base hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Bezig met doorsturen...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Doorgaan naar betaling — &euro;{total.toFixed(2)}
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  SSL Beveiligd
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Veilige betaling
                </span>
              </div>
            </form>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24">
              <h2 className="font-bold text-lg text-foreground mb-6">
                Besteloverzicht
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <Tv className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
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
                      {item.playerMac && (
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          MAC: {item.playerMac}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-foreground whitespace-nowrap">
                      &euro;{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotaal</span>
                  <span className="text-foreground">
                    &euro;{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">
                    {TAX_NAME} ({(TAX_RATE * 100).toFixed(0)}%)
                  </span>
                  <span className="text-foreground">
                    &euro;{taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground text-base">Totaal</span>
                    <span className="font-bold text-2xl gradient-text">
                      &euro;{total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 text-right">
                    Inclusief {TAX_NAME}
                  </p>
                </div>
              </div>

              {/* Security note */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Veilig winkelen
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Alle betalingen worden verwerkt via Stripe met 256-bit SSL
                      encryptie.
                    </p>
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
