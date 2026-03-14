import {
  PrismaClient,
  PropertyType,
  PropertyStatus,
  Role,
  BookingStatus,
  PaymentStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Smart Properties Malawi seed...');

  // ─── Clear existing data ────────────────────────────────────────────────────
  await prisma.receipt.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // ─── Hash passwords ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ─── Create Users ────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartproperties.mw',
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Yusuf',
          lastName: 'Raja',
          phone: '+265991234001',
          bio: 'Property manager at Smart Properties Malawi',
        },
      },
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: 'tenant@smartproperties.mw',
      passwordHash,
      role: Role.TENANT,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Twareeq',
          lastName: 'Hassan',
          phone: '+265881234002',
          bio: 'Looking for a comfortable home in Lilongwe',
        },
      },
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'john@smartproperties.mw',
      passwordHash,
      role: Role.TENANT,
      isVerified: true,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Phiri',
          phone: '+265991234003',
        },
      },
    },
  });

  console.log('👤 Created 3 users (1 admin, 2 tenants)');

  // ─── Create Properties ───────────────────────────────────────────────────────
  const propertyData = [
    {
      title: 'Luxury 3-Bedroom Villa with Lake View',
      description:
        'A stunning villa with panoramic views of Lake Malawi. Features a private pool, manicured gardens, and lake access. Perfect for a relaxing getaway or business retreat.',
      pricePerNight: 150000,
      city: 'Mangochi',
      address: 'Cape Maclear, Monkey Bay Road',
      region: 'Southern Region',
      country: 'Malawi',
      type: PropertyType.VILLA,
      bedrooms: 3,
      bathrooms: 2,
      isFurnished: true,
      hasWiFi: true,
      hasPool: true,
      hasParking: true,
      hasGarden: true,
      hasSecurity: true,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      title: 'Modern 2-Bedroom Apartment in Area 10',
      description:
        "A contemporary apartment in the heart of Lilongwe's Area 10. Walking distance to Capital City Mall, restaurants, and government offices. Fully furnished with high-speed WiFi.",
      pricePerNight: 85000,
      city: 'Lilongwe',
      address: 'Plot 1234, Area 10',
      region: 'Central Region',
      country: 'Malawi',
      type: PropertyType.APARTMENT,
      bedrooms: 2,
      bathrooms: 2,
      isFurnished: true,
      hasWiFi: true,
      hasPool: false,
      hasParking: true,
      hasGarden: false,
      hasSecurity: true,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      title: 'Cozy Family House in Blantyre',
      description:
        'A warm and spacious family home in the commercial hub of Malawi. Close to Chichiri Shopping Centre, Soche Hill, and quality schools. Ideal for families relocating to Blantyre.',
      pricePerNight: 65000,
      city: 'Blantyre',
      address: 'Naperi Avenue, Chirimba',
      region: 'Southern Region',
      country: 'Malawi',
      type: PropertyType.HOUSE,
      bedrooms: 3,
      bathrooms: 2,
      isFurnished: false,
      hasWiFi: true,
      hasPool: false,
      hasParking: true,
      hasGarden: true,
      hasSecurity: false,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      title: 'Historic Townhouse near UNIMA Campus',
      description:
        'Charming townhouse adjacent to the University of Malawi main campus. Perfect for academics, visiting lecturers, and students. Includes a study room and quick walk to Zomba town.',
      pricePerNight: 55000,
      city: 'Zomba',
      address: 'Chancellor College Road',
      region: 'Southern Region',
      country: 'Malawi',
      type: PropertyType.HOUSE,
      bedrooms: 4,
      bathrooms: 3,
      isFurnished: true,
      hasWiFi: true,
      hasPool: false,
      hasParking: true,
      hasGarden: true,
      hasSecurity: false,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      title: 'Executive Studio in Mzuzu City Centre',
      description:
        'A smart studio apartment in the main commercial district of Mzuzu. Ideal for business travellers and professionals. Fully self-contained with air conditioning and high-speed internet.',
      pricePerNight: 45000,
      city: 'Mzuzu',
      address: 'Katoto Road, City Centre',
      region: 'Northern Region',
      country: 'Malawi',
      type: PropertyType.APARTMENT,
      bedrooms: 1,
      bathrooms: 1,
      isFurnished: true,
      hasWiFi: true,
      hasPool: false,
      hasParking: false,
      hasGarden: false,
      hasSecurity: true,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      title: 'Lakeside Cottage in Salima',
      description:
        'A peaceful cottage steps from the shores of Lake Malawi in Salima. Features a deck overlooking the water, braai area, and beach access. Great for holidays and long weekends.',
      pricePerNight: 75000,
      city: 'Salima',
      address: 'Lakeview Drive, Senga Bay',
      region: 'Central Region',
      country: 'Malawi',
      type: PropertyType.VILLA,
      bedrooms: 2,
      bathrooms: 1,
      isFurnished: true,
      hasWiFi: false,
      hasPool: false,
      hasParking: true,
      hasGarden: true,
      hasSecurity: false,
      status: PropertyStatus.AVAILABLE,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
      ],
    },
  ];

  const createdProperties = [];
  for (const data of propertyData) {
    const { images, ...propData } = data;
    const property = await prisma.property.create({
      data: {
        ...propData,
        ownerId: adminUser.id,
        images: {
          create: images.map((url, i) => ({
            url,
            publicId: `seed-image-${i}`,
            secureUrl: url,
          })),
        },
      },
    });
    createdProperties.push(property);
  }

  console.log(`🏠 Created ${createdProperties.length} properties`);

  // ─── Create Sample Booking + Payment ─────────────────────────────────────────
  const sampleProperty = createdProperties[0];
  const checkIn = new Date('2026-04-10');
  const checkOut = new Date('2026-04-15');
  const nights = 5;
  const totalCost = Number(sampleProperty.pricePerNight) * nights;

  const booking = await prisma.booking.create({
    data: {
      tenantId: tenant1.id,
      propertyId: sampleProperty.id,
      checkIn,
      checkOut,
      nights,
      totalCost,
      status: BookingStatus.CONFIRMED,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant1.id,
      bookingId: booking.id,
      amount: totalCost,
      currency: 'MWK',
      status: PaymentStatus.SUCCESSFUL,
      reference: `SPM-DEMO-${Date.now()}`,
      provider: 'PAYCHANGU',
      paidAt: new Date(),
    },
  });

  // Create invoice and receipt
  await prisma.invoice.create({
    data: {
      paymentId: payment.id,
      number: `INV-${Date.now()}`,
      amount: totalCost,
      currency: 'MWK',
      generatedAt: new Date(),
    },
  });

  await prisma.receipt.create({
    data: {
      paymentId: payment.id,
      number: `RCP-${Date.now()}`,
      amount: totalCost,
      currency: 'MWK',
      generatedAt: new Date(),
    },
  });

  console.log(
    '💳 Created 1 sample confirmed booking with payment, invoice, and receipt',
  );

  // ─── Create Sample Review ────────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      tenantId: tenant1.id,
      propertyId: sampleProperty.id,
      rating: 5,
      cleanliness: 5,
      comfort: 5,
      location: 4,
      value: 4,
      comment:
        'Absolutely stunning villa! The lake view is breathtaking and the pool was perfect. Highly recommend for a family vacation in Malawi.',
    },
  });

  await prisma.review.create({
    data: {
      tenantId: tenant2.id,
      propertyId: createdProperties[1].id,
      rating: 4,
      cleanliness: 4,
      comfort: 5,
      location: 5,
      value: 4,
      comment:
        'Great apartment in a central area. Very convenient for business. Fast WiFi and secure parking.',
    },
  });

  console.log('⭐  Created 2 sample reviews');

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────────');
  console.log('Demo Accounts:');
  console.log('  Admin:  admin@smartproperties.mw   / Password123!');
  console.log('  Tenant: tenant@smartproperties.mw  / Password123!');
  console.log('  Tenant: john@smartproperties.mw    / Password123!');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
