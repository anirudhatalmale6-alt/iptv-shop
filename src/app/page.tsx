import Link from "next/link";
import Image from "next/image";
import { Tv, Globe, Shield, Headphones, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

const features = [
  {
    icon: Tv,
    title: "Hoge Kwaliteit",
    description: "Stream in Full HD en 4K met stabiele servers en minimale buffering.",
  },
  {
    icon: Globe,
    title: "Wereldwijd",
    description: "Toegang tot duizenden kanalen uit meer dan 50 landen wereldwijd.",
  },
  {
    icon: Shield,
    title: "Veilig & Betrouwbaar",
    description: "Beveiligde verbinding en 99.9% uptime voor ononderbroken kijkplezier.",
  },
  {
    icon: Headphones,
    title: "24/7 Ondersteuning",
    description: "Ons supportteam staat altijd voor u klaar via chat en e-mail.",
  },
];

const steps = [
  { number: "1", title: "Kies een abonnement", description: "Selecteer het plan dat bij u past." },
  { number: "2", title: "Selecteer uw speler", description: "Kies uw favoriete IPTV-app of apparaat." },
  { number: "3", title: "Voer uw MAC-adres in", description: "Vul het MAC-adres van uw apparaat in." },
  { number: "4", title: "Geniet van IPTV!", description: "Start direct met kijken naar uw favoriete content." },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        options: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  const currencySymbol = settings?.currencySymbol ?? "€";

  return (
    <>
      {/* Features Section - Top */}
      <section className="gradient-hero text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Waarom <span className="text-primary-200">IPTV Shop</span>?
            </h2>
            <p className="text-purple-100 text-lg max-w-xl mx-auto">
              Ontdek wat ons onderscheidt van de rest
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-600 mb-4">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section - Dynamic from database */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Onze <span className="gradient-text">Pakketten</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Kies het pakket dat het beste bij u past
            </p>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-muted">Geen producten beschikbaar.</p>
          ) : (
            <div className={`grid grid-cols-1 ${products.length === 2 ? 'md:grid-cols-2 max-w-3xl' : products.length >= 3 ? 'md:grid-cols-3' : 'max-w-md'} gap-8 mx-auto`}>
              {products.map((product) => {
                const lowestPrice = product.options.length > 0
                  ? Math.min(...product.options.map((o: { price: unknown }) => Number(o.price)))
                  : Number(product.price);
                const hasPopular = product.options.some((o: { popular: boolean }) => o.popular);

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className={`card p-8 text-center relative group ${hasPopular ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' : ''}`}
                  >
                    {hasPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 gradient-cta text-white text-sm font-semibold px-4 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-white" />
                          Populair
                        </span>
                      </div>
                    )}

                    {product.image ? (
                      <div className="relative w-20 h-20 mx-auto mb-5 rounded-xl overflow-hidden bg-white shadow border border-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-5 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <Tv className="w-8 h-8 text-primary-600" />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted text-sm mb-6 line-clamp-2">{product.description}</p>
                    <div className="mb-6">
                      <span className="text-sm text-muted">vanaf </span>
                      <span className="text-4xl font-bold gradient-text">
                        {currencySymbol}{lowestPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="btn-primary w-full justify-center">
                      Bekijk Opties
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Hoe <span className="gradient-text">werkt het</span>?
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              In 4 eenvoudige stappen aan de slag
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-cta text-white text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-2xl p-10 lg:p-16 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Klaar om te beginnen?
            </h2>
            <p className="text-purple-100 text-lg mb-8 max-w-lg mx-auto">
              Start vandaag nog met het beste IPTV-abonnement en geniet van
              onbeperkt entertainment.
            </p>
            <Link
              href="#products"
              className="inline-flex items-center justify-center bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary-50 transition-all duration-300 hover:shadow-lg"
            >
              Bekijk Abonnementen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
