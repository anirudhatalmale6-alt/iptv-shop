"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Check, Info, Star } from "lucide-react";
import ImageSlider from "@/components/ImageSlider";

interface PlayerField {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
}

interface PlayerTypeData {
  id: string;
  name: string;
  slug: string;
  fields: PlayerField[];
  guideTitle: string | null;
  guideText: string | null;
  guideImages: string[];
}

interface ProductOptionData {
  id: string;
  name: string;
  price: number;
  screens: number;
  duration: number;
  popular: boolean;
  sortOrder: number;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  price: number;
  options: ProductOptionData[];
}

interface ProductFormProps {
  product: ProductData;
  playerTypes: PlayerTypeData[];
  currencySymbol: string;
  taxName: string;
  taxRate: number;
}

const DURATION_LABELS: Record<number, { name: string; desc: string }> = {
  1: { name: "1 Maand", desc: "Volledige toegang voor 1 maand" },
  3: { name: "3 Maanden", desc: "Bespaar met ons kwartaalabonnement" },
  12: { name: "12 Maanden", desc: "Beste waarde - een vol jaar IPTV" },
};

export default function ProductForm({
  product,
  playerTypes,
  currencySymbol,
  taxName,
  taxRate,
}: ProductFormProps) {
  const screenCounts = useMemo(() => {
    const counts = [...new Set(product.options.map((o) => o.screens))].sort();
    return counts.length > 0 ? counts : [1];
  }, [product.options]);

  const [selectedScreens, setSelectedScreens] = useState(screenCounts[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedPlayerTypeId, setSelectedPlayerTypeId] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredOptions = useMemo(
    () =>
      product.options
        .filter((o) => o.screens === selectedScreens)
        .sort((a, b) => a.duration - b.duration),
    [product.options, selectedScreens]
  );

  const selectedOption = useMemo(
    () => product.options.find((o) => o.id === selectedOptionId),
    [product.options, selectedOptionId]
  );

  const selectedPlayerType = useMemo(
    () => playerTypes.find((p) => p.id === selectedPlayerTypeId),
    [playerTypes, selectedPlayerTypeId]
  );

  const currentPrice = selectedOption ? selectedOption.price : product.price;

  const handleScreenChange = (screens: number) => {
    setSelectedScreens(screens);
    setSelectedOptionId("");
  };

  const handlePlayerTypeChange = (playerTypeId: string) => {
    setSelectedPlayerTypeId(playerTypeId);
    setFieldValues({});
    setErrors({});
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedOptionId) {
      return false;
    }

    if (selectedPlayerType) {
      for (const field of selectedPlayerType.fields) {
        if (field.required && !fieldValues[field.name]?.trim()) {
          newErrors[field.name] = `${field.label} is verplicht`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!selectedOptionId) return;
    if (!validateFields()) return;

    const cartItem = {
      productId: product.id,
      productName: product.name,
      optionId: selectedOption?.id,
      optionName: selectedOption?.name,
      playerTypeId: selectedPlayerType?.id,
      playerTypeName: selectedPlayerType?.name,
      playerMac: fieldValues["mac"] || fieldValues["mac_address"] || undefined,
      playerDeviceKey:
        fieldValues["device_key"] || fieldValues["deviceKey"] || undefined,
      quantity: 1,
      price: currentPrice,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      existing.push({ ...cartItem, id });
      localStorage.setItem("cart", JSON.stringify(existing));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("cart", JSON.stringify([{ ...cartItem, id }]));
      window.dispatchEvent(new Event("cart-updated"));
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="space-y-10">
      {/* Screen Toggle */}
      {screenCounts.length > 1 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1.5">
            {screenCounts.map((count) => (
              <button
                key={count}
                onClick={() => handleScreenChange(count)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedScreens === count
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {count === 1 ? "1 Scherm" : `${count} Schermen`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {filteredOptions.map((option) => {
          const label = DURATION_LABELS[option.duration] || {
            name: option.name,
            desc: "",
          };
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary-500 bg-primary-50/50 shadow-lg shadow-purple-500/10 -translate-y-1"
                  : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md">
                    <Star className="w-3 h-3 fill-white" />
                    Populair
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {label.name}
                </h3>
                <p className="text-xs text-muted mb-4">{label.desc}</p>

                <div className="mb-5">
                  <span className="text-3xl font-bold gradient-text">
                    {currencySymbol}
                    {option.price.toFixed(2)}
                  </span>
                  {option.duration > 1 && (
                    <p className="text-xs text-muted mt-1">
                      {currencySymbol}
                      {(option.price / option.duration).toFixed(2)} / maand
                    </p>
                  )}
                </div>

                <div
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isSelected ? "Geselecteerd" : "Selecteer"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        incl. {taxRate}% {taxName}
      </p>

      {/* Player Type Selection */}
      {playerTypes.length > 0 && (
        <div>
          <label
            htmlFor="player-type"
            className="block text-sm font-semibold text-foreground mb-3"
          >
            Kies je speler type
          </label>
          <select
            id="player-type"
            value={selectedPlayerTypeId}
            onChange={(e) => handlePlayerTypeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">-- Selecteer speler type --</option>
            {playerTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic Player Fields */}
      {selectedPlayerType && selectedPlayerType.fields.length > 0 && (
        <div className="space-y-4 p-5 bg-primary-50/50 rounded-xl border border-primary-100">
          <h4 className="text-sm font-semibold text-primary-800 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {selectedPlayerType.name} gegevens
          </h4>
          {selectedPlayerType.fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={`field-${field.name}`}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                id={`field-${field.name}`}
                type="text"
                placeholder={field.placeholder}
                value={fieldValues[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-foreground placeholder:text-gray-400 outline-none transition-all duration-200 ${
                  errors[field.name]
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                }`}
              />
              {errors[field.name] && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Player Setup Guide */}
      {selectedPlayerType &&
        (selectedPlayerType.guideTitle || selectedPlayerType.guideText) && (
          <div className="p-5 bg-white rounded-2xl border border-primary-100 shadow-lg">
            {selectedPlayerType.guideTitle && (
              <h4 className="text-lg font-bold text-foreground mb-3">
                {selectedPlayerType.guideTitle}
              </h4>
            )}
            {selectedPlayerType.guideText && (
              <div
                className="text-sm text-muted leading-relaxed prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{
                  __html: selectedPlayerType.guideText,
                }}
              />
            )}
            {selectedPlayerType.guideImages.length > 0 && (
              <ImageSlider
                images={selectedPlayerType.guideImages}
                alt={`${selectedPlayerType.name} setup guide`}
                autoPlay={false}
              />
            )}
          </div>
        )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={addedToCart || !selectedOptionId}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
          addedToCart
            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
            : !selectedOptionId
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
        }`}
      >
        {addedToCart ? (
          <>
            <Check className="w-6 h-6" />
            Toegevoegd aan winkelwagen!
          </>
        ) : (
          <>
            <ShoppingCart className="w-6 h-6" />
            {selectedOption
              ? `Bestellen — ${currencySymbol}${currentPrice.toFixed(2)}`
              : "Kies eerst een abonnement"}
          </>
        )}
      </button>
    </div>
  );
}
