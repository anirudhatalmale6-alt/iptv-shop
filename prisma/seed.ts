import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@iptv-shop.nl' },
    update: {},
    create: {
      email: 'admin@iptv-shop.nl',
      password: adminPassword,
      name: 'Admin',
    },
  })

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'IPTV Shop',
      seoTitle: 'IPTV Shop - Premium IPTV Abonnementen',
      seoDescription: 'De beste IPTV service met premium kwaliteit streams. Kies uw abonnement en geniet van duizenden kanalen.',
      taxEnabled: true,
      taxRate: 21,
      taxName: 'BTW',
      currency: 'EUR',
      currencySymbol: '€',
      confirmEmailText: 'Uw bestelling is bevestigd! Bedankt voor uw aankoop. Uw activatie wordt zo snel mogelijk verwerkt.',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'iptv-abonnement' },
    update: {},
    create: {
      name: 'IPTV Abonnement',
      slug: 'iptv-abonnement',
      description: 'Premium IPTV abonnement met toegang tot duizenden live kanalen, films en series in HD en 4K kwaliteit. Inclusief EPG (elektronische programmagids) en catch-up TV.',
      price: 9.99,
      active: true,
      options: {
        create: [
          { name: 'Single Connection', price: 9.99, sortOrder: 0 },
          { name: '2 Connections', price: 14.99, sortOrder: 1 },
          { name: '3 Connections', price: 19.99, sortOrder: 2 },
        ],
      },
    },
  })

  const playerTypes = [
    {
      name: 'Net IPTV',
      slug: 'net-iptv',
      fields: [
        { name: 'mac', label: 'MAC Adres', placeholder: '00:1A:79:XX:XX:XX', required: true },
      ],
      guideTitle: 'Net IPTV Installatie',
      guideText: '1. Download Net IPTV uit de App Store\n2. Open de app en noteer uw MAC adres\n3. Plaats een bestelling met uw MAC adres\n4. Na activatie verschijnen de kanalen automatisch',
      sortOrder: 0,
    },
    {
      name: 'Set IPTV',
      slug: 'set-iptv',
      fields: [
        { name: 'mac', label: 'MAC Adres', placeholder: '00:1A:79:XX:XX:XX', required: true },
      ],
      guideTitle: 'Set IPTV Installatie',
      guideText: '1. Download Set IPTV uit de App Store\n2. Open de app en noteer uw MAC adres\n3. Plaats een bestelling met uw MAC adres\n4. Na activatie verschijnen de kanalen automatisch',
      sortOrder: 1,
    },
    {
      name: 'IBO Player',
      slug: 'ibo-player',
      fields: [
        { name: 'mac', label: 'MAC Adres', placeholder: '00:1A:79:XX:XX:XX', required: true },
        { name: 'deviceKey', label: 'Device Key', placeholder: 'Voer uw device key in', required: true },
      ],
      guideTitle: 'IBO Player Installatie',
      guideText: '1. Download IBO Player uit de App Store\n2. Open de app en noteer uw MAC adres en Device Key\n3. Plaats een bestelling met beide gegevens\n4. Na activatie verschijnen de kanalen automatisch',
      sortOrder: 2,
    },
    {
      name: 'Smart IPTV',
      slug: 'smart-iptv',
      fields: [
        { name: 'mac', label: 'MAC Adres', placeholder: '00:1A:79:XX:XX:XX', required: true },
      ],
      guideTitle: 'Smart IPTV Installatie',
      guideText: '1. Download Smart IPTV uit uw TV App Store\n2. Open de app en noteer uw MAC adres\n3. De app heeft een proefperiode van 7 dagen\n4. Activatie kost €5.49 via siptv.eu/activation/\n5. Plaats een bestelling met uw MAC adres',
      sortOrder: 3,
    },
    {
      name: 'GSE Smart IPTV',
      slug: 'gse-smart-iptv',
      fields: [
        { name: 'mac', label: 'MAC Adres', placeholder: '00:1A:79:XX:XX:XX', required: true },
      ],
      guideTitle: 'GSE Smart IPTV Installatie',
      guideText: '1. Download GSE Smart IPTV uit de App Store\n2. Ga naar "Remote Playlist" via het menu\n3. Druk op het + icoon om een nieuwe M3U URL toe te voegen\n4. Voer de playlist naam in en plak de M3U link',
      sortOrder: 4,
    },
  ]

  for (const pt of playerTypes) {
    await prisma.playerType.upsert({
      where: { slug: pt.slug },
      update: {},
      create: pt,
    })
  }

  const faqItems = [
    { question: 'Wat is IPTV?', answer: 'IPTV (Internet Protocol Television) is een methode om televisie te kijken via uw internetverbinding in plaats van via een traditionele kabel- of satellietaansluiting.', sortOrder: 0 },
    { question: 'Welke apparaten worden ondersteund?', answer: 'Onze service werkt op Smart TV\'s (Samsung, LG), Android TV, Apple TV, smartphones, tablets en streaming apparaten zoals Amazon Fire Stick.', sortOrder: 1 },
    { question: 'Hoe snel wordt mijn abonnement geactiveerd?', answer: 'Na ontvangst van uw betaling wordt uw abonnement binnen 1-24 uur geactiveerd. U ontvangt een bevestigingsmail zodra de activatie is voltooid.', sortOrder: 2 },
    { question: 'Kan ik meerdere apparaten gebruiken?', answer: 'Ja, u kunt kiezen voor een abonnement met meerdere connecties. Kies bij het bestellen voor 2 of 3 connecties om op meerdere apparaten tegelijk te kijken.', sortOrder: 3 },
    { question: 'Wat is een MAC adres?', answer: 'Een MAC adres is een uniek identificatienummer van uw IPTV app. U vindt dit in de instellingen van uw IPTV applicatie.', sortOrder: 4 },
    { question: 'Welke betaalmethoden accepteren jullie?', answer: 'Wij accepteren creditcard (Visa, Mastercard), iDEAL en andere betaalmethoden via Stripe.', sortOrder: 5 },
  ]

  for (const faq of faqItems) {
    const existing = await prisma.faqItem.findFirst({ where: { question: faq.question } })
    if (!existing) {
      await prisma.faqItem.create({ data: faq })
    }
  }

  await prisma.page.upsert({
    where: { slug: 'privacy-policy' },
    update: {},
    create: {
      title: 'Privacybeleid',
      slug: 'privacy-policy',
      content: '<h2>Privacybeleid</h2><p>Wij respecteren uw privacy en verwerken uw persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).</p><h3>Welke gegevens verzamelen wij?</h3><p>Wij verzamelen uw naam, e-mailadres en apparaatgegevens (MAC adres) die nodig zijn voor de levering van onze diensten.</p><h3>Waarvoor gebruiken wij uw gegevens?</h3><p>Uw gegevens worden uitsluitend gebruikt voor het verwerken van uw bestelling en het leveren van onze IPTV dienst.</p>',
    },
  })

  await prisma.page.upsert({
    where: { slug: 'terms' },
    update: {},
    create: {
      title: 'Algemene Voorwaarden',
      slug: 'terms',
      content: '<h2>Algemene Voorwaarden</h2><p>Door gebruik te maken van onze diensten gaat u akkoord met deze algemene voorwaarden.</p><h3>Levering</h3><p>Na ontvangst van uw betaling wordt uw abonnement binnen 1-24 uur geactiveerd.</p><h3>Herroepingsrecht</h3><p>Digitale diensten zijn uitgesloten van het herroepingsrecht na activatie.</p>',
    },
  })

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
