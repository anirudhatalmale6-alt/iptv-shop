import Link from "next/link";

export default function Footer() {
  return (
    <footer className="gradient-border-top bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">IPTV Shop</h3>
            <p className="text-muted text-sm leading-relaxed">
              Premium IPTV-abonnementen met hoge kwaliteit streams, wereldwijde
              dekking en betrouwbare service. Geniet van duizenden kanalen op elk
              apparaat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Snelle Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/faq", label: "Veelgestelde Vragen" },
                { href: "/contact", label: "Contact" },
                { href: "/page/privacy-policy", label: "Privacybeleid" },
                { href: "/page/terms-of-service", label: "Algemene Voorwaarden" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted text-sm hover:text-primary-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Betaalmethoden
            </h4>
            <p className="text-muted text-sm leading-relaxed mb-3">
              Veilig betalen via Stripe
            </p>
            <div className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", "iDEAL"].map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-100"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-primary-100 text-center">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} IPTV Shop. Alle rechten
            voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
