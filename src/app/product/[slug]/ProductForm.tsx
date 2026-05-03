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

const DURATION_LABELS: Record<number, string> = {
  1: "1 Maand",
  3: "3 Maanden",
  6: "6 Maanden",
  12: "12 Maanden",
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
    if (!selectedOptionId) return false;
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
      playerDeviceKey: fieldValues["device_key"] || fieldValues["deviceKey"] || undefined,
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
    <div className="space-y-5">
      {/* Screen Toggle */}
      {screenCounts.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Aantal schermen</label>
          <div className="flex gap-2">
            {screenCounts.map((count) => (
              <button
                key={count}
                onClick={() => handleScreenChange(count)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  selectedScreens === count
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {count === 1 ? "1 Scherm" : `${count} Schermen`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration Options - Radio style list */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Kies looptijd</label>
        <div className="space-y-2">
          {filteredOptions.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const label = DURATION_LABELS[option.duration] || option.name;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-purple-500" : "border-gray-300"
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    {option.duration > 1 && (
                      <span className="text-xs text-muted ml-2">
                        ({currencySymbol}{(option.price / option.duration).toFixed(2)}/mnd)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {option.popular && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Populair
                    </span>
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {currencySymbol}{option.price.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-1.5">incl. {taxRate}% {taxName}</p>
      </div>

      {/* Player Type */}
      {playerTypes.length > 0 && (
        <div>
          <label htmlFor="player-type" className="block text-sm font-semibold text-foreground mb-2">
            Kies je speler type
          </label>
          <select
            id="player-type"
            value={selectedPlayerTypeId}
            onChange={(e) => handlePlayerTypeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all appearance-none cursor-pointer text-sm"
          >
            <option value="">-- Selecteer speler type --</option>
            {playerTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic Player Fields */}
      {selectedPlayerType && selectedPlayerType.fields.length > 0 && (
        <div className="space-y-3 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
          <h4 className="text-sm font-semibold text-primary-800 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {selectedPlayerType.name} gegevens
          </h4>
          {selectedPlayerType.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-foreground mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                id={`field-${field.name}`}
                type="text"
                placeholder={field.placeholder}
                value={fieldValues[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white text-foreground placeholder:text-gray-400 outline-none transition-all text-sm ${
                  errors[field.name]
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-primary-500"
                }`}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Player Setup Guide */}
      {selectedPlayerType && (selectedPlayerType.guideTitle || selectedPlayerType.guideText) && (
        <div className="p-4 bg-white rounded-xl border border-primary-100 shadow-sm">
          {selectedPlayerType.guideTitle && (
            <h4 className="text-sm font-bold text-foreground mb-2">{selectedPlayerType.guideTitle}</h4>
          )}
          {selectedPlayerType.guideText && (
            <div
              className="text-xs text-muted leading-relaxed prose prose-sm max-w-none mb-3"
              dangerouslySetInnerHTML={{ __html: selectedPlayerType.guideText }}
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

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={addedToCart || !selectedOptionId}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
          addedToCart
            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
            : !selectedOptionId
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
        }`}
      >
        {addedToCart ? (
          <>
            <Check className="w-5 h-5" />
            Toegevoegd aan winkelwagen!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {selectedOption
              ? `Bestellen — ${currencySymbol}${currentPrice.toFixed(2)}`
              : "Kies eerst een abonnement"}
          </>
        )}
      </button>
    </div>
  );
}
