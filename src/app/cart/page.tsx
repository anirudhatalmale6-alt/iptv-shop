"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadCart();
    setMounted(true);

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  function loadCart() {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setCartItems([]);
    }
  }

  function removeItem(id: string) {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  }

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
            <p className="text-muted mb-8 max-w-md mx-auto">
              Je hebt nog geen producten toegevoegd aan je winkelwagen. Bekijk
              onze IPTV-abonnementen en voeg er een toe.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Bekijk abonnementen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Winkelwagen</h1>
          <span className="text-muted text-sm">
            {cartItems.length}{" "}
            {cartItems.length === 1 ? "artikel" : "artikelen"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {item.productName}
                    </h3>

                    <div className="space-y-1 text-sm text-muted">
                      {item.optionName && (
                        <p>
                          <span className="font-medium text-foreground">
                            Verbinding:
                          </span>{" "}
                          {item.optionName}
                        </p>
                      )}
                      {item.playerTypeName && (
                        <p>
                          <span className="font-medium text-foreground">
                            Speler:
                          </span>{" "}
                          {item.playerTypeName}
                        </p>
                      )}
                      {item.playerMac && (
                        <p>
                          <span className="font-medium text-foreground">
                            MAC:
                          </span>{" "}
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                            {item.playerMac}
                          </code>
                        </p>
                      )}
                      {item.playerDeviceKey && (
                        <p>
                          <span className="font-medium text-foreground">
                            Device Key:
                          </span>{" "}
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                            {item.playerDeviceKey}
                          </code>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-lg font-bold text-primary-700">
                      &euro;{item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      aria-label={`Verwijder ${item.productName}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-foreground mb-6">
                Overzicht
              </h2>

              <div className="space-y-3 mb-6">
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

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Afrekenen
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full mt-3 text-primary-600 hover:text-primary-700 py-2.5 rounded-xl font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Verder winkelen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
