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
      email: 'admin@fleetnest.com',
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
      email: 'lagos.motors@fleetnest.com',
      password: hashedPass,
      firstName: 'Chukwuemeka',
      lastName: 'Okafor',
      phone: '+2348012345678',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'speedyrides@fleetnest.com',
      password: hashedPass,
      firstName: 'Amara',
      lastName: 'Diallo',
      phone: '+2347098765432',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      email: 'cleanwheels@fleetnest.com',
      password: hashedPass,
      firstName: 'Fatima',
      lastName: 'Bello',
      phone: '+2348056789012',
      role: UserRole.COMPANY_OWNER,
      isEmailVerified: true,
    },
  });

  const owner4 = await prisma.user.create({
    data: {
      email: 'roadmaster@fleetnest.com',
      password: hashedPass,
      firstName: 'Kwame',
      lastName: 'Asante',
      phone: '+2349034567890',
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
        phone: '+2348011223344',
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
        phone: '+2347099887766',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        loyaltyPoints: 1200,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.adeyemi@example.com',
        password: hashedPass,
        firstName: 'Mike',
        lastName: 'Adeyemi',
        phone: '+2348055443322',
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
  const company1 = await prisma.company.create({
    data: {
      ownerId: owner1.id,
      name: 'Lagos Premier Motors',
      slug: 'lagos-premier-motors',
      description: 'Lagos Premier Motors is the leading car rental company in Lagos, offering a fleet of over 50 premium vehicles. We specialize in luxury sedans, SUVs, and executive cars for corporate and leisure travel.',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=400&fit=crop',
      email: 'info@lagospremiermotors.com',
      phone: '+2348012345678',
      whatsappNumber: '+2348012345678',
      address: '15 Marina Street, Lagos Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.4541,
      longitude: 3.3947,
      website: 'https://lagospremiermotors.com',
      businessRegNo: 'RC-123456',
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.8,
      totalReviews: 127,
      totalBookings: 342,
      totalRevenue: 8750000,
      categories: [ServiceCategory.CAR_RENTAL, ServiceCategory.DRIVER],
    },
  });

  const company2 = await prisma.company.create({
    data: {
      ownerId: owner2.id,
      name: 'Speedy Rides Transport',
      slug: 'speedy-rides-transport',
      description: 'Your trusted transport partner for bus charters, event transportation, and school runs across Nigeria. We operate a modern fleet of 20+ buses ranging from 14-seater minibuses to 70-seater luxury coaches.',
      logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1200&h=400&fit=crop',
      email: 'bookings@speedyrides.ng',
      phone: '+2347098765432',
      whatsappNumber: '+2347098765432',
      address: '7 Airport Road, Ikeja',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.5804,
      longitude: 3.3212,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.6,
      totalReviews: 89,
      totalBookings: 215,
      totalRevenue: 5200000,
      categories: [ServiceCategory.BUS_RENTAL, ServiceCategory.COURIER],
    },
  });

  const company3 = await prisma.company.create({
    data: {
      ownerId: owner3.id,
      name: 'Clean Wheels Auto Spa',
      slug: 'clean-wheels-auto-spa',
      description: 'Premium car wash and detailing services in Abuja. We offer interior/exterior cleaning, ceramic coating, paint protection, and full detailing packages for all vehicle types.',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      email: 'hello@cleanwheels.ng',
      phone: '+2348056789012',
      whatsappNumber: '+2348056789012',
      address: '23 Wuse Zone 5',
      city: 'Abuja',
      state: 'FCT',
      country: 'NG',
      latitude: 9.0765,
      longitude: 7.3986,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.9,
      totalReviews: 203,
      totalBookings: 1240,
      totalRevenue: 3100000,
      categories: [ServiceCategory.CAR_WASH],
    },
  });

  const company4 = await prisma.company.create({
    data: {
      ownerId: owner4.id,
      name: 'Road Master Mechanics',
      slug: 'road-master-mechanics',
      description: 'Certified auto mechanics serving Port Harcourt and environs. We handle all types of vehicle repairs, servicing, diagnostics, and emergency roadside assistance 24/7.',
      logo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&h=200&fit=crop',
      email: 'service@roadmaster.ng',
      phone: '+2349034567890',
      whatsappNumber: '+2349034567890',
      address: '45 Trans-Amadi Industrial Layout',
      city: 'Port Harcourt',
      state: 'Rivers',
      country: 'NG',
      latitude: 4.8156,
      longitude: 7.0498,
      status: CompanyStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      rating: 4.7,
      totalReviews: 156,
      totalBookings: 780,
      totalRevenue: 4500000,
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
      pricePerDay: 45000,
      pricePerHour: 8000,
      minimumDays: 1,
      deposit: 50000,
      currency: 'NGN',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.4541,
      longitude: 3.3947,
      pickupAddress: '15 Marina Street, Lagos Island',
      deliveryAvailable: true,
      features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Backup Camera', 'USB Ports', 'Sunroof'],
      tags: ['luxury', 'sedan', 'executive', 'business', 'airport'],
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
      title: 'Toyota Land Cruiser V8 — Premium SUV',
      slug: 'toyota-land-cruiser-v8-premium-suv',
      description: 'The iconic Land Cruiser V8 — built for every terrain. Ideal for executive travel, off-road adventures, and large group outings. Our well-maintained fleet ensures you travel in power and style.',
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
      pricePerDay: 85000,
      pricePerHour: 15000,
      minimumDays: 1,
      deposit: 100000,
      currency: 'NGN',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.4541,
      longitude: 3.3947,
      pickupAddress: '15 Marina Street, Lagos Island',
      deliveryAvailable: true,
      features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Leather Seats', 'Sunroof', 'DVD Entertainment', 'Rear AC'],
      tags: ['suv', 'luxury', 'landcruiser', 'v8', 'executive', 'off-road'],
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
      description: 'Perfect for small groups, corporate outings, and airport transfers. Our air-conditioned Toyota Hiace minibuses are professionally maintained and driven by experienced chauffeurs.',
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
      pricePerDay: 65000,
      pricePerHour: 12000,
      minimumDays: 1,
      deposit: 30000,
      currency: 'NGN',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.5804,
      longitude: 3.3212,
      pickupAddress: '7 Airport Road, Ikeja',
      deliveryAvailable: true,
      features: ['Air Conditioning', 'PA System', 'USB Charging', 'Reclining Seats', 'Tinted Windows'],
      tags: ['minibus', 'hiace', 'group', 'corporate', 'airport transfer'],
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
      title: 'Luxury 54-Seater Coach — Events & Tours',
      slug: 'luxury-54-seater-coach-events-tours',
      description: 'Travel in style with our state-of-the-art 54-seater luxury coach. Equipped with WiFi, entertainment screens, reclining seats, and an onboard toilet. Ideal for long-distance trips, weddings, and corporate events.',
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
      pricePerDay: 180000,
      minimumDays: 1,
      deposit: 50000,
      currency: 'NGN',
      city: 'Lagos',
      state: 'Lagos',
      country: 'NG',
      latitude: 6.5804,
      longitude: 3.3212,
      deliveryAvailable: true,
      features: ['WiFi', 'Air Conditioning', 'Entertainment Screens', 'Reclining Seats', 'Onboard Toilet', 'USB Charging', 'PA System', 'Reading Lights'],
      amenities: ['WiFi', 'Entertainment System', 'Onboard Restroom', 'Climate Control'],
      tags: ['coach', 'luxury', 'event', 'wedding', 'tour', 'long-distance'],
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
      description: 'Our signature detailing package includes exterior wash & wax, interior deep clean, engine bay cleaning, and professional ceramic coating application. Your car will look showroom-new.',
      category: ServiceCategory.CAR_WASH,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      pricePerDay: 35000,
      pricePerHour: 8000,
      minimumDays: 1,
      currency: 'NGN',
      city: 'Abuja',
      state: 'FCT',
      country: 'NG',
      latitude: 9.0765,
      longitude: 7.3986,
      pickupAddress: '23 Wuse Zone 5, Abuja',
      deliveryAvailable: true,
      features: ['Ceramic Coating', 'Interior Deep Clean', 'Engine Bay Cleaning', 'Paint Correction', 'Leather Conditioning', 'Odour Elimination'],
      tags: ['detail', 'ceramic', 'coating', 'premium', 'protection'],
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
      description: 'Comprehensive vehicle service including oil change, filter replacement, brake inspection, tire rotation, and full OBD-II computer diagnostics. We service all makes and models.',
      category: ServiceCategory.MECHANIC,
      status: ListingStatus.ACTIVE,
      approvedAt: new Date(),
      approvedBy: admin.id,
      pricePerDay: 25000,
      pricePerHour: 5000,
      minimumDays: 1,
      currency: 'NGN',
      city: 'Port Harcourt',
      state: 'Rivers',
      country: 'NG',
      latitude: 4.8156,
      longitude: 7.0498,
      pickupAddress: '45 Trans-Amadi Industrial Layout, PH',
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
        description: '₦5,000 off bookings above ₦50,000',
        type: CouponType.FIXED_AMOUNT,
        value: 5000,
        minBookingAmount: 50000,
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
      baseAmount: 135000,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 135000,
      currency: 'NGN',
      pickupLocation: '15 Marina Street, Lagos Island',
      dropoffLocation: 'Murtala Mohammed Airport, Lagos',
      confirmedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: customers[0].id,
      amount: 135000,
      currency: 'NGN',
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
      comment: 'Absolutely fantastic experience! The Toyota Camry was spotless, fuel was full, and it was delivered on time. Lagos Premier Motors is top-notch. Will definitely book again!',
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
      baseAmount: 65000,
      discountAmount: 13000,
      couponCode: 'WELCOME20',
      taxAmount: 0,
      totalAmount: 52000,
      currency: 'NGN',
      specialRequests: 'Please have the bus at our hotel lobby by 7:30 AM.',
      guestCount: 12,
      confirmedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      userId: customers[1].id,
      amount: 52000,
      currency: 'NGN',
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
        message: 'Congratulations! Lagos Premier Motors has been verified. Your listings are now live on FleetNest.',
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

  console.log('\n🎉 FleetNest seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin login:    admin@fleetnest.com');
  console.log('🔑 Password:       Password123!');
  console.log('👤 Customer login: john.doe@example.com');
  console.log('🏢 Company login:  lagos.motors@fleetnest.com');
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
