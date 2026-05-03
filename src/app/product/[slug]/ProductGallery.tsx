"use client";

import { useState } from "react";
import Image from "next/image";
import { Tv } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="sticky top-24">
        <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center border border-gray-200">
          <Tv className="w-24 h-24 text-primary-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24">
      <div className="flex gap-4">
        {/* Thumbnails column */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
          <Image
            src={images[selectedIndex]}
            alt={productName}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
