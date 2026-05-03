import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductForm from "./ProductForm";

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

  if (!product) {
    return { title: "Product niet gevonden" };
  }

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

  if (!product) {
    notFound();
  }

  const currencySymbol = settings?.currencySymbol ?? "€";
  const taxName = settings?.taxName ?? "BTW";
  const taxRate = settings?.taxRate ? Number(settings.taxRate) : 21;

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-primary-600 font-medium mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar overzicht
        </Link>

        {/* Product Header */}
        <div className="text-center mb-10">
          {product.image && (
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden bg-white shadow-lg border border-primary-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-3"
                sizes="128px"
                priority
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Onze <span className="gradient-text">Abonnementen</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {product.description}
          </p>
        </div>

        {/* Interactive Form */}
        <ProductForm
          product={productData}
          playerTypes={playerTypesData}
          currencySymbol={currencySymbol}
          taxName={taxName}
          taxRate={taxRate}
        />
      </div>
    </div>
  );
}
