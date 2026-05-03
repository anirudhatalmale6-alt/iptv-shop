import Link from "next/link";
import { Tv, Globe, Shield, Headphones } from "lucide-react";

const featuredProducts = [
  {
    slug: "1-maand",
    name: "1 Maand IPTV",
    price: "14.99",
    description: "Volledige toegang tot alle kanalen voor 1 maand",
    popular: false,
  },
  {
    slug: "3-maanden",
    name: "3 Maanden IPTV",
    price: "34.99",
    description: "Bespaar met ons kwartaalabonnement",
    popular: true,
  },
  {
    slug: "12-maanden",
    name: "12 Maanden IPTV",
    price: "89.99",
    description: "Beste waarde - een vol jaar IPTV",
    popular: false,
  },
];

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

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Premium IPTV
            <br />
            <span className="text-primary-200">Onbeperkt Entertainment</span>
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Duizenden live kanalen, films en series in HD &amp; 4K kwaliteit.
            Stabiel, betrouwbaar en betaalbaar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn-primary text-lg px-8 py-4 justify-center"
            >
              Bekijk Abonnementen
            </Link>
            <Link
              href="/faq"
              className="btn-secondary !bg-white/10 !text-white !border-white/30 hover:!bg-white/20 text-lg px-8 py-4 justify-center"
            >
              Meer Informatie
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Onze <span className="gradient-text">Abonnementen</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Kies het abonnement dat het beste bij u past
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="card p-8 text-center relative group"
              >
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-cta text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Populair
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-muted text-sm mb-6">{product.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">
                    &euro;{product.price}
                  </span>
                </div>
                <span className="btn-primary w-full justify-center">
                  Bestellen
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Waarom <span className="gradient-text">IPTV Shop</span>?
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Ontdek wat ons onderscheidt van de rest
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card p-6 text-center"
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

      {/* How It Works */}
      <section className="py-16 lg:py-20">
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
              href="/products"
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
