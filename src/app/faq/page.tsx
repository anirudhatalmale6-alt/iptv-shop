"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const placeholderFaqs: FaqItem[] = [
  {
    question: "Wat is IPTV?",
    answer:
      "IPTV staat voor Internet Protocol Television. Het is een manier om televisie te kijken via uw internetverbinding in plaats van via een traditionele kabel- of satellietverbinding. U krijgt toegang tot duizenden live kanalen, films en series.",
  },
  {
    question: "Welke apparaten worden ondersteund?",
    answer:
      "Onze IPTV-service werkt op vrijwel alle apparaten, waaronder Smart TV's (Samsung, LG), Android TV-boxen, Amazon Fire Stick, MAG-boxen, smartphones (iOS & Android), tablets en computers. U kunt apps zoals IPTV Smarters, TiviMate en Perfect Player gebruiken.",
  },
  {
    question: "Hoe snel is de activering?",
    answer:
      "Na betaling ontvangt u binnen enkele minuten uw inloggegevens per e-mail. De activering is volledig automatisch, zodat u direct kunt beginnen met kijken.",
  },
  {
    question: "Welke betaalmethoden accepteren jullie?",
    answer:
      "Wij accepteren betalingen via Visa, Mastercard en iDEAL. Alle betalingen worden veilig verwerkt via Stripe.",
  },
  {
    question: "Kan ik het abonnement op meerdere apparaten gebruiken?",
    answer:
      "Elk abonnement is geldig voor 1 apparaat tegelijk. Als u op meerdere apparaten wilt kijken, kunt u extra verbindingen toevoegen aan uw bestelling.",
  },
  {
    question: "Wat als ik technische problemen heb?",
    answer:
      "Ons supportteam is 24/7 beschikbaar. U kunt ons bereiken via het contactformulier of per e-mail. Wij helpen u graag met installatie, configuratie en eventuele problemen.",
  },
  {
    question: "Is er een proefperiode beschikbaar?",
    answer:
      "Wij bieden momenteel een 24-uurs proefabonnement aan zodat u onze service kunt testen voordat u een langer abonnement afsluit. Neem contact met ons op voor meer informatie.",
  },
  {
    question: "Hoe goed is de videokwaliteit?",
    answer:
      "Wij bieden streams aan in SD, HD, Full HD en waar beschikbaar in 4K kwaliteit. De kwaliteit is afhankelijk van uw internetsnelheid. Wij raden minimaal 25 Mbps aan voor de beste ervaring.",
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-50/50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground pr-4">
          {item.question}
        </span>
        <span className="shrink-0 text-primary-500">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 text-muted leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [faqs] = useState<FaqItem[]>(placeholderFaqs);

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Veelgestelde <span className="gradient-text">Vragen</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Vind snel antwoord op de meest gestelde vragen over onze
            IPTV-service.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqAccordionItem key={index} item={faq} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted mb-4">
            Staat uw vraag er niet bij?
          </p>
          <a href="/contact" className="btn-primary">
            Neem Contact Op
          </a>
        </div>
      </div>
    </section>
  );
}
