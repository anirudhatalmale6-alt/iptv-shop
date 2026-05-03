import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductForm from "./ProductForm";
import ProductGallery from "./ProductGallery";

interface PlayerField {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product niet gevonden" };
  return {
    title: `${product.name} | IPTV Shop`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, playerTypes, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        options: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.playerType.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  if (!product) notFound();

  const currencySymbol = settings?.currencySymbol ?? "€";
  const taxName = settings?.taxName ?? "BTW";
  const taxRate = settings?.taxRate ? Number(settings.taxRate) : 21;

  const allImages: string[] = [];
  if (product.image) allImages.push(product.image);
  if (product.images) {
    for (const img of product.images) {
      if (!allImages.includes(img)) allImages.push(img);
    }
  }

  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: product.image,
    price: Number(product.price),
    options: product.options.map((o: { id: string; name: string; price: unknown; screens: number; duration: number; popular: boolean; sortOrder: number }) => ({
      id: o.id,
      name: o.name,
      price: Number(o.price),
      screens: o.screens,
      duration: o.duration,
      popular: o.popular,
      sortOrder: o.sortOrder,
    })),
  };

  const playerTypesData = playerTypes.map((pt: { id: string; name: string; slug: string; fields: unknown; guideTitle: string | null; guideText: string | null; guideImages: string[] }) => ({
    id: pt.id,
    name: pt.name,
    slug: pt.slug,
    fields: (pt.fields as PlayerField[]) || [],
    guideTitle: pt.guideTitle,
    guideText: pt.guideText,
    guideImages: pt.guideImages,
  }));

  const descriptionLines = product.description
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-primary-600 font-medium mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar overzicht
        </Link>

        {/* Two-column layout: Gallery | Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Left: Image Gallery */}
          <ProductGallery images={allImages} productName={product.name} />

          {/* Right: Product Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold gradient-text">
                {currencySymbol}{Number(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-muted">incl. {taxRate}% {taxName}</span>
            </div>

            <div className="mb-6">
              {descriptionLines.map((line: string, idx: number) => {
                const isBullet = line.startsWith("-") || line.startsWith("•");
                if (isBullet) {
                  const text = line.replace(/^[-•]\s*/, "");
                  const isBold = text.includes("\n") === false && text.split(" ").length <= 4;
                  return (
                    <div key={idx} className="flex items-start gap-2 py-1">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className={`text-sm ${isBold ? "font-semibold text-foreground" : "text-muted"}`}>
                        {text}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-sm text-muted leading-relaxed mb-1">
                    {line}
                  </p>
                );
              })}
            </div>

            {/* Pricing & Options Form */}
            <ProductForm
              product={productData}
              playerTypes={playerTypesData}
              currencySymbol={currencySymbol}
              taxName={taxName}
              taxRate={taxRate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
