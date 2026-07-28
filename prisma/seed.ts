/**
 * FleetNest — Prisma Seed Script
 * Seeds the database with realistic demo data for development and investor demos.
 */

import { PrismaClient, UserRole, CompanyStatus, ListingStatus, ServiceCategory, FuelType, TransmissionType, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FleetNest seed...\n');

  // ──────────────────────────────────────────────
  // 1. CLEAR EXISTING DATA (safe reset)
  // ──────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.company.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // ──────────────────────────────────────────────
  // 2. CATEGORIES
  // ──────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Car Rentals', slug: 'car-rentals', description: 'Self-drive car hire for any occasion', icon: 'car', category: ServiceCategory.CAR_RENTAL, sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Bus Rentals', slug: 'bus-rentals', description: 'Chartered buses for groups and events', icon: 'bus', category: ServiceCategory.BUS_RENTAL, sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Professional Drivers', slug: 'drivers', description: 'Certified drivers for hire', icon: 'user-tie', category: ServiceCategory.DRIVER, sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Mechanics', slug: 'mechanics', description: 'Auto repair and maintenance services', icon: 'wrench', category: ServiceCategory.MECHANIC, sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Car Wash', slug: 'car-wash', description: 'Professional car cleaning services', icon: 'droplets', category: ServiceCategory.CAR_WASH, sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Vehicle Dealers', slug: 'vehicle-dealers', description: 'Buy and sell new & used vehicles', icon: 'store', category: ServiceCategory.VEHICLE_DEALER, sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Courier Vehicles', slug: 'courier', description: 'Delivery vans and cargo vehicles', icon: 'package', category: ServiceCategory.COURIER, sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Emergency Roadside', slug: 'emergency', description: '24/7 roadside assistance and towing', icon: 'triangle-alert', category: ServiceCategory.EMERGENCY_ROADSIDE, sortOrder: 8 } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // ──────────────────────────────────────────────
  // 3. USERS
  // ──────────────────────────────────────────────
  const hashedPass = await bcrypt.hash('Password123!', 12);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@famba.co.zw',
      password: hashedPass,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      loyaltyPoints: 0,
    },
  });

  // Company owners
  const owner1 = await prisma.user.create({
    data: {
      email: 'harare.motors@famba.co.zw',
      password: hashedPass,
      firstName: 'Farai',
      lastName: 'Moyo',
      phone: '+263771234567',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'speedyrides@famba.co.zw',
      password: hashedPass,
      firstName: 'Tendai',
      lastName: 'Ndlovu',
      phone: '+263719876543',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      email: 'cleanwheels@famba.co.zw',
      password: hashedPass,
      firstName: 'Chiedza',
      lastName: 'Mutasa',
      phone: '+263735678901',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner4 = await prisma.user.create({
    data: {
      email: 'roadmaster@famba.co.zw',
      password: hashedPass,
      firstName: 'Tinashe',
      lastName: 'Chikwanha',
      phone: '+263773456789',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  // Customers
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: hashedPass,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+263771122334',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        loyaltyPoints: 450,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.chen@example.com',
        password: hashedPass,
        firstName: 'Sarah',
        lastName: 'Chen',
        phone: '+263719988776',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        loyaltyPoints: 1200,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.sibanda@example.com',
        password: hashedPass,
        firstName: 'Mike',
        lastName: 'Sibanda',
        phone: '+263735544332',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        loyaltyPoints: 890,
      },
    }),
  ]);

  console.log(`✅ Created ${4 + customers.length + 1} users`);

  // ──────────────────────────────────────────────
  // 4. COMPANIES
  // ──────────────────────────────────────────────
  // ──────────────────────────────────────────────
  // 4. COMPANIES (Localized to Zimbabwe)
  // ──────────────────────────────────────────────
  const company1 = await prisma.company.create({
    data: {
      ownerId: owner1.id,
      name: 'Harare Executive Motors',
      slug: 'harare-executive-motors',
      description: 'Harare Executive Motors is the premier vehicle rental service in Harare, Zimbabwe. Offering a fleet of over 50 premium sedans, SUVs, and luxury 4x4 vehicles for corporate and leisure travel.',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=400&fit=crop',
      email: 'info@harareexecutive.co.zw',
      phone: '+263772123456',
      whatsappNumber: '+263772123456',
      address: '45 Samora Machel Avenue, CBD',
      city: 'Harare',
      state: 'Harare Metropolitan',
      country: 'ZW',
      latitude: -17.8292,
      longitude: 31.0522,
      website: 'https://harareexecutive.co.zw',
      businessRegNo: 'ZW-123456',
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.8,
      totalReviews: 127,
      totalBookings: 342,
      totalRevenue: 245000,
      categories: [ServiceCategory.CAR_RENTAL, ServiceCategory.DRIVER],
    },
  });

  const company2 = await prisma.company.create({
    data: {
      ownerId: owner2.id,
      name: 'Victoria Falls & Safari Transport',
      slug: 'victoria-falls-safari-transport',
      description: 'Specialists in luxury 4x4 safaris, airport transfers, and group charters across Victoria Falls, Hwange, and Matabeleland. Operating a modern fleet of 20+ overland cruisers and luxury coaches.',
      logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1200&h=400&fit=crop',
      email: 'bookings@vicfallssafaris.co.zw',
      phone: '+263778987654',
      whatsappNumber: '+263778987654',
      address: '12 Livingstone Way',
      city: 'Victoria Falls',
      state: 'Matabeleland North',
      country: 'ZW',
      latitude: -17.9244,
      longitude: 25.8354,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.9,
      totalReviews: 89,
      totalBookings: 215,
      totalRevenue: 185000,
      categories: [ServiceCategory.BUS_RENTAL, ServiceCategory.CAR_RENTAL],
    },
  });

  const company3 = await prisma.company.create({
    data: {
      ownerId: owner3.id,
      name: 'Bulawayo Express Auto Spa',
      slug: 'bulawayo-express-auto-spa',
      description: 'Premium car wash, valet, and mobile auto detailing in Bulawayo. Ceramic coatings, interior steam cleaning, and paint restoration.',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      email: 'hello@bulawayoautospa.co.zw',
      phone: '+263712345678',
      whatsappNumber: '+263712345678',
      address: '88 Robert Mugabe Way',
      city: 'Bulawayo',
      state: 'Bulawayo Metropolitan',
      country: 'ZW',
      latitude: -20.1569,
      longitude: 28.5823,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.9,
      totalReviews: 203,
      totalBookings: 1240,
      totalRevenue: 95000,
      categories: [ServiceCategory.CAR_WASH],
    },
  });

  const company4 = await prisma.company.create({
    data: {
      ownerId: owner4.id,
      name: 'Mutare Auto Masters & Roadside',
      slug: 'mutare-auto-masters',
      description: 'Certified auto mechanics and 24/7 emergency roadside towing across Manicaland, Mutare, and Bvumba routes.',
      logo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&h=200&fit=crop',
      email: 'service@mutareautomasters.co.zw',
      phone: '+263773456789',
      whatsappNumber: '+263773456789',
      address: '15 Main Street',
      city: 'Mutare',
      state: 'Manicaland',
      country: 'ZW',
      latitude: -18.9707,
      longitude: 32.6709,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.7,
      totalReviews: 156,
      totalBookings: 780,
      totalRevenue: 120000,
      categories: [ServiceCategory.MECHANIC, ServiceCategory.EMERGENCY_ROADSIDE],
    },
  });

  console.log(`✅ Created 4 companies`);

  // ──────────────────────────────────────────────
  // 5. LISTINGS
  // ──────────────────────────────────────────────

  // Company 1 listings: Car Rentals
  const listing1 = await prisma.listing.create({
    data: {
      companyId: company1.id,
      title: 'Toyota Camry 2023 — Business Class',
      slug: 'toyota-camry-2023-business-class',
      description: 'Step into comfort with our 2023 Toyota Camry. This executive sedan is perfect for business travel, airport pickups, and special occasions. Features leather seats, a premium sound system, and advanced safety features.',
      category: ServiceCategory.CAR_RENTAL,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Pearl White',
      seatingCapacity: 5,
      luggageCapacity: 3,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      mileage: 15000,
      engineSize: '2.5L',
      pricePerDay: 50,
      pricePerHour: 10,
      minimumDays: 1,
      deposit: 60,
      currency: 'USD',
      city: 'Harare',
      state: 'Harare Metropolitan',
      country: 'ZW',
      latitude: -17.8292,
      longitude: 31.0522,
      pickupAddress: '45 Samora Machel Avenue, CBD',
      deliveryAvailable: true,
      features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Backup Camera', 'USB Ports', 'Sunroof'],
      tags: ['luxury', 'sedan', 'executive', 'business', 'harare'],
      rating: 4.9,
      totalReviews: 45,
      totalBookings: 89,
      viewCount: 1240,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop', alt: 'Toyota Camry front view', isPrimary: true, order: 0 },
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop', alt: 'Toyota Camry interior', isPrimary: false, order: 1 },
      { listingId: listing1.id, url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop', alt: 'Toyota Camry side view', isPrimary: false, order: 2 },
    ],
  });

  const listing2 = await prisma.listing.create({
    data: {
      companyId: company1.id,
      title: 'Toyota Land Cruiser V8 — Premium Safari SUV',
      slug: 'toyota-land-cruiser-v8-premium-suv',
      description: 'The iconic Land Cruiser V8 — built for every terrain across Zimbabwe. Ideal for executive travel, safari game drives, and Victoria Falls expeditions. Powered for comfort and tough roads.',
      category: ServiceCategory.CAR_RENTAL,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2022,
      color: 'Midnight Black',
      seatingCapacity: 8,
      luggageCapacity: 5,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      mileage: 28000,
      engineSize: '4.5L V8',
      pricePerDay: 120,
      pricePerHour: 20,
      minimumDays: 1,
      deposit: 150,
      currency: 'USD',
      city: 'Harare',
      state: 'Harare Metropolitan',
      country: 'ZW',
      latitude: -17.8292,
      longitude: 31.0522,
      pickupAddress: '45 Samora Machel Avenue, CBD',
      deliveryAvailable: true,
      features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Leather Seats', 'Sunroof', 'DVD Entertainment', 'Rear AC'],
      tags: ['suv', 'luxury', 'landcruiser', 'v8', 'safari', 'harare'],
      rating: 4.8,
      totalReviews: 32,
      totalBookings: 67,
      viewCount: 980,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing2.id, url: 'https://images.unsplash.com/photo-1625231338679-3f3a3def75b4?w=800&h=600&fit=crop', alt: 'Land Cruiser front', isPrimary: true, order: 0 },
      { listingId: listing2.id, url: 'https://images.unsplash.com/photo-1605559424843-9073c6223120?w=800&h=600&fit=crop', alt: 'Land Cruiser interior', isPrimary: false, order: 1 },
    ],
  });

  // Company 2 listings: Bus Rentals
  const listing3 = await prisma.listing.create({
    data: {
      companyId: company2.id,
      title: 'Toyota Hiace 14-Seater Minibus',
      slug: 'toyota-hiace-14-seater-minibus',
      description: 'Perfect for small groups, Victoria Falls tours, corporate outings, and airport transfers in Matabeleland. Air-conditioned and professionally driven.',
      category: ServiceCategory.BUS_RENTAL,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      make: 'Toyota',
      model: 'Hiace',
      year: 2022,
      color: 'Silver',
      seatingCapacity: 14,
      luggageCapacity: 8,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.MANUAL,
      mileage: 45000,
      pricePerDay: 85,
      pricePerHour: 15,
      minimumDays: 1,
      deposit: 50,
      currency: 'USD',
      city: 'Victoria Falls',
      state: 'Matabeleland North',
      country: 'ZW',
      latitude: -17.9244,
      longitude: 25.8354,
      pickupAddress: '12 Livingstone Way, Victoria Falls',
      deliveryAvailable: true,
      features: ['Air Conditioning', 'PA System', 'USB Charging', 'Reclining Seats', 'Tinted Windows'],
      tags: ['minibus', 'hiace', 'group', 'tour', 'vicfalls'],
      rating: 4.7,
      totalReviews: 28,
      totalBookings: 95,
      viewCount: 756,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing3.id, url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop', alt: 'Toyota Hiace bus', isPrimary: true, order: 0 },
    ],
  });

  const listing4 = await prisma.listing.create({
    data: {
      companyId: company2.id,
      title: 'Luxury 54-Seater Coach — Inter-City Tours',
      slug: 'luxury-54-seater-coach-events-tours',
      description: 'Travel in luxury across Zimbabwe (Harare - Bulawayo - Vic Falls routes). Equipped with WiFi, TV screens, reclining seats, onboard toilet, and climate control.',
      category: ServiceCategory.BUS_RENTAL,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      make: 'Scania',
      model: 'Touring',
      year: 2021,
      color: 'Navy Blue',
      seatingCapacity: 54,
      luggageCapacity: 30,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      pricePerDay: 250,
      minimumDays: 1,
      deposit: 100,
      currency: 'USD',
      city: 'Bulawayo',
      state: 'Bulawayo Metropolitan',
      country: 'ZW',
      latitude: -20.1569,
      longitude: 28.5823,
      deliveryAvailable: true,
      features: ['WiFi', 'Air Conditioning', 'Entertainment Screens', 'Reclining Seats', 'Onboard Toilet', 'USB Charging', 'PA System', 'Reading Lights'],
      amenities: ['WiFi', 'Entertainment System', 'Onboard Restroom', 'Climate Control'],
      tags: ['coach', 'luxury', 'tour', 'bulawayo', 'harare'],
      rating: 4.6,
      totalReviews: 19,
      totalBookings: 42,
      viewCount: 512,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing4.id, url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop', alt: 'Luxury coach exterior', isPrimary: true, order: 0 },
    ],
  });

  // Company 3 listings: Car Wash
  const listing5 = await prisma.listing.create({
    data: {
      companyId: company3.id,
      title: 'Full Detail & Ceramic Coating Package',
      slug: 'full-detail-ceramic-coating-package',
      description: 'Our signature auto detailing package includes exterior wash & wax, interior deep clean, engine bay cleaning, and ceramic paint protection in Bulawayo.',
      category: ServiceCategory.CAR_WASH,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      pricePerDay: 35,
      pricePerHour: 10,
      minimumDays: 1,
      currency: 'USD',
      city: 'Bulawayo',
      state: 'Bulawayo Metropolitan',
      country: 'ZW',
      latitude: -20.1569,
      longitude: 28.5823,
      pickupAddress: '88 Robert Mugabe Way, Bulawayo',
      deliveryAvailable: true,
      features: ['Ceramic Coating', 'Interior Deep Clean', 'Engine Bay Cleaning', 'Paint Correction', 'Leather Conditioning'],
      tags: ['detail', 'ceramic', 'coating', 'bulawayo'],
      rating: 4.9,
      totalReviews: 87,
      totalBookings: 435,
      viewCount: 2100,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing5.id, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', alt: 'Car detailing service', isPrimary: true, order: 0 },
    ],
  });

  // Company 4 listings: Mechanic
  const listing6 = await prisma.listing.create({
    data: {
      companyId: company4.id,
      title: 'Full Vehicle Service & Diagnostics',
      slug: 'full-vehicle-service-diagnostics',
      description: 'Comprehensive auto service including oil change, filter replacement, brake overhaul, and computer diagnostics in Mutare and Manicaland routes.',
      category: ServiceCategory.MECHANIC,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      pricePerDay: 30,
      pricePerHour: 10,
      minimumDays: 1,
      currency: 'USD',
      city: 'Mutare',
      state: 'Manicaland',
      country: 'ZW',
      latitude: -18.9707,
      longitude: 32.6709,
      pickupAddress: '15 Main Street, Mutare',
      deliveryAvailable: true,
      features: ['OBD Diagnostics', 'Oil & Filter Change', 'Brake Service', 'Tire Rotation', 'Battery Testing', 'AC Service', 'Wheel Alignment'],
      tags: ['mechanic', 'service', 'repair', 'diagnostics', 'maintenance'],
      rating: 4.7,
      totalReviews: 62,
      totalBookings: 280,
      viewCount: 890,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      { listingId: listing6.id, url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop', alt: 'Auto mechanic service', isPrimary: true, order: 0 },
    ],
  });

  console.log(`✅ Created 6 listings with images`);

  // ──────────────────────────────────────────────
  // 6. COUPONS / PROMO CODES
  // ──────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME20',
        description: '20% off your first booking',
        type: CouponType.PERCENTAGE,
        value: 20,
        minBookingAmount: 10000,
        maxDiscount: 15000,
        usageLimit: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FLEET5000',
        description: '$5 off bookings above $50',
        type: CouponType.FIXED_AMOUNT,
        value: 5,
        minBookingAmount: 50,
        usageLimit: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'LUXURY30',
        description: '30% off luxury vehicle rentals',
        type: CouponType.PERCENTAGE,
        value: 30,
        minBookingAmount: 80000,
        maxDiscount: 30000,
        usageLimit: 200,
        isActive: true,
        applicableCategories: [ServiceCategory.CAR_RENTAL],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created 3 promo codes');

  // ──────────────────────────────────────────────
  // 7. SAMPLE BOOKINGS
  // ──────────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      userId: customers[0].id,
      listingId: listing1.id,
      companyId: company1.id,
      status: 'COMPLETED',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      durationDays: 3,
      baseAmount: 135,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 135,
      currency: 'USD',
      pickupLocation: '15 Samora Machel Avenue, Harare CBD',
      dropoffLocation: 'Robert Gabriel Mugabe International Airport, Harare',
      confirmedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: customers[0].id,
      amount: 135,
      currency: 'USD',
      method: 'MOCK',
      status: 'COMPLETED',
      transactionRef: 'TXN-MOCK-001',
      paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Review for booking1
  await prisma.review.create({
    data: {
      userId: customers[0].id,
      listingId: listing1.id,
      companyId: company1.id,
      bookingId: booking1.id,
      rating: 5,
      comment: 'Absolutely fantastic experience! The Toyota Camry was spotless, fuel was full, and it was delivered on time. Harare Executive Motors is top-notch. Will definitely book again!',
      response: 'Thank you so much, John! We are delighted you had a wonderful experience. Looking forward to serving you again!',
      respondedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: customers[1].id,
      listingId: listing3.id,
      companyId: company2.id,
      status: 'CONFIRMED',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      durationDays: 1,
      baseAmount: 180,
      discountAmount: 36,
      couponCode: 'WELCOME20',
      taxAmount: 0,
      totalAmount: 144,
      currency: 'USD',
      specialRequests: 'Please have the bus at our hotel lobby by 7:30 AM.',
      guestCount: 12,
      confirmedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      userId: customers[1].id,
      amount: 144,
      currency: 'USD',
      method: 'MOCK',
      status: 'COMPLETED',
      transactionRef: 'TXN-MOCK-002',
      paidAt: new Date(),
    },
  });

  console.log('✅ Created sample bookings, payments, and reviews');

  // ──────────────────────────────────────────────
  // 8. WISHLIST ITEMS
  // ──────────────────────────────────────────────
  await prisma.wishlistItem.createMany({
    data: [
      { userId: customers[0].id, listingId: listing2.id },
      { userId: customers[0].id, listingId: listing3.id },
      { userId: customers[1].id, listingId: listing1.id },
      { userId: customers[2].id, listingId: listing5.id },
    ],
  });

  // ──────────────────────────────────────────────
  // 9. NOTIFICATIONS
  // ──────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: customers[0].id,
        type: 'BOOKING_COMPLETED',
        title: 'Booking Completed',
        message: 'Your booking for Toyota Camry 2023 has been completed. We hope you enjoyed the ride! Please leave a review.',
        link: `/dashboard/bookings/${booking1.id}`,
        isRead: false,
        metadata: { bookingId: booking1.id },
      },
      {
        userId: customers[1].id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed!',
        message: 'Great news! Your Toyota Hiace 14-Seater booking has been confirmed. Your trip starts in 3 days.',
        link: `/dashboard/bookings/${booking2.id}`,
        isRead: false,
        metadata: { bookingId: booking2.id },
      },
      {
        userId: owner1.id,
        type: 'COMPANY_VERIFIED',
        title: 'Company Verified ✓',
        message: 'Congratulations! Harare Executive Motors has been verified. Your listings are now live on Famba.',
        isRead: true,
      },
    ],
  });

  // ──────────────────────────────────────────────
  // 10. LOYALTY TRANSACTIONS
  // ──────────────────────────────────────────────
  await prisma.loyaltyTransaction.createMany({
    data: [
      { userId: customers[0].id, points: 450, description: 'Earned from completed booking', bookingId: booking1.id },
      { userId: customers[1].id, points: 1200, description: 'Welcome bonus + bookings' },
      { userId: customers[2].id, points: 890, description: 'Earned from completed bookings' },
    ],
  });

  console.log('✅ Created wishlist items, notifications, and loyalty transactions');

  console.log('\n🎉 Famba seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin login:    admin@famba.co.zw');
  console.log('🔑 Password:       Password123!');
  console.log('👤 Customer login: john.doe@example.com');
  console.log('🏢 Company login:  harare.motors@famba.co.zw');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
