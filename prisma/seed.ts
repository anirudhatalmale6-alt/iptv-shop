import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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

  let product = await prisma.product.findUnique({ where: { slug: 'iptv-abonnement' } })
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'IPTV Abonnement',
        slug: 'iptv-abonnement',
        description: 'Premium IPTV abonnement met toegang tot duizenden live kanalen, films en series in HD en 4K kwaliteit. Inclusief EPG (elektronische programmagids) en catch-up TV.',
        price: 14.99,
        active: true,
      },
    })
  }

  // Delete old options and create new pricing matrix
  await prisma.productOption.deleteMany({ where: { productId: product.id } })
  await prisma.productOption.createMany({
    data: [
      // 1 Screen options
      { productId: product.id, name: '1 Maand IPTV', price: 14.99, screens: 1, duration: 1, popular: false, sortOrder: 0 },
      { productId: product.id, name: '3 Maanden IPTV', price: 34.99, screens: 1, duration: 3, popular: true, sortOrder: 1 },
      { productId: product.id, name: '12 Maanden IPTV', price: 89.99, screens: 1, duration: 12, popular: false, sortOrder: 2 },
      // 2 Screens options
      { productId: product.id, name: '1 Maand IPTV - 2 Schermen', price: 19.99, screens: 2, duration: 1, popular: false, sortOrder: 3 },
      { productId: product.id, name: '3 Maanden IPTV - 2 Schermen', price: 49.99, screens: 2, duration: 3, popular: true, sortOrder: 4 },
      { productId: product.id, name: '12 Maanden IPTV - 2 Schermen', price: 119.99, screens: 2, duration: 12, popular: false, sortOrder: 5 },
      // 3 Screens options
      { productId: product.id, name: '1 Maand IPTV - 3 Schermen', price: 24.99, screens: 3, duration: 1, popular: false, sortOrder: 6 },
      { productId: product.id, name: '3 Maanden IPTV - 3 Schermen', price: 64.99, screens: 3, duration: 3, popular: true, sortOrder: 7 },
      { productId: product.id, name: '12 Maanden IPTV - 3 Schermen', price: 149.99, screens: 3, duration: 12, popular: false, sortOrder: 8 },
    ],
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

  const departments = [
    { name: 'Speler Problemen', sortOrder: 0 },
    { name: 'Betaling Problemen', sortOrder: 1 },
    { name: 'Verlenging', sortOrder: 2 },
    { name: 'Boekhouding', sortOrder: 3 },
    { name: 'Technische Ondersteuning', sortOrder: 4 },
    { name: 'Overig', sortOrder: 5 },
  ]

  for (const dept of departments) {
    const existing = await prisma.contactDepartment.findFirst({ where: { name: dept.name } })
    if (!existing) {
      await prisma.contactDepartment.create({ data: dept })
    }
  }

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
