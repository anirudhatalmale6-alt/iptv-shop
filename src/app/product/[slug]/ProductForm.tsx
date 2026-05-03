"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Check, Info } from "lucide-react";
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

export default function ProductForm({
  product,
  playerTypes,
  currencySymbol,
  taxName,
  taxRate,
}: ProductFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    product.options.length > 0 ? product.options[0].id : ""
  );
  const [selectedPlayerTypeId, setSelectedPlayerTypeId] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedOption = useMemo(
    () => product.options.find((o) => o.id === selectedOptionId),
    [product.options, selectedOptionId]
  );

  const selectedPlayerType = useMemo(
    () => playerTypes.find((p) => p.id === selectedPlayerTypeId),
    [playerTypes, selectedPlayerTypeId]
  );

  const currentPrice = selectedOption
    ? selectedOption.price
    : product.price;

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
    if (!selectedPlayerType) return true;

    const newErrors: Record<string, string> = {};
    for (const field of selectedPlayerType.fields) {
      if (field.required && !fieldValues[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is verplicht`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
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

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      existing.push({ ...cartItem, id });
      localStorage.setItem("cart", JSON.stringify(existing));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // fallback
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("cart", JSON.stringify([{ ...cartItem, id }]));
      window.dispatchEvent(new Event("cart-updated"));
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Price Display */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold gradient-text">
            {currencySymbol}
            {currentPrice.toFixed(2)}
          </span>
          <span className="text-sm text-muted">
            incl. {taxRate}% {taxName}
          </span>
        </div>
      </div>

      {/* Connection Options */}
      {product.options.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Kies je verbinding
          </label>
          <div className="space-y-3">
            {product.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedOptionId === option.id
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="product-option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedOptionId === option.id
                      ? "border-primary-600 bg-primary-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOptionId === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">
                    {option.name}
                  </span>
                </div>
                <span className="font-semibold text-primary-700">
                  {currencySymbol}
                  {option.price.toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

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
        disabled={addedToCart}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
          addedToCart
            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
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
            In winkelwagen
          </>
        )}
      </button>
    </div>
  );
}
