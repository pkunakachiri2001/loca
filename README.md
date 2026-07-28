# FAMBA 🚗

> **Move More. Live Better.**

FAMBA is Zimbabwe's premier all-in-one smart travel, transportation, and delivery platform — connecting customers with verified vehicle rentals, drivers, mechanics, and courier services across Zimbabwe.

[![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](https://docker.com)

---

## 🌟 Features

### For Customers
- 🔍 Search & filter 8 service categories
- 📅 Real-time availability calendar
- 💳 Secure online payments (Stripe + Mock mode)
- ❤️ Wishlist & saved listings
- ⭐ Verified reviews & ratings
- 🎁 Loyalty rewards program
- 📍 GPS directions & live tracking architecture
- 🔔 Real-time notifications (Socket.io)
- 💬 WhatsApp booking button
- 🎫 Promo codes & discounts

### For Companies
- 🏢 Company registration & verification
- 🚗 Unlimited listing management
- 📊 Revenue dashboard & analytics
- 📆 Availability calendar management
- ✅ Accept/reject bookings
- ⭐ Reviews management
- 📱 Real-time booking notifications

### For Admins
- 🛡️ Full platform oversight
- ✅ Company verification workflow
- 🚗 Listing approvals
- 📊 Platform-wide analytics
- 👥 User management
- 💰 Payment monitoring
- 🏷️ Category & coupon management

### Services Supported
| Service | Description |
|---------|-------------|
| 🚗 Car Rentals | Self-drive vehicles |
| 🚌 Bus Rentals | Charters & corporate |
| 👨‍✈️ Professional Drivers | Certified chauffeurs |
| 🔧 Mechanics | Auto repair & diagnostics |
| 🚿 Car Wash | Detailing & cleaning |
| 🏪 Vehicle Dealers | Buy & sell vehicles |
| 📦 Courier Vehicles | Delivery & cargo |
| 🚨 Emergency Roadside | 24/7 breakdown assist |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | TailwindCSS, Framer Motion |
| **State** | Zustand + React Query |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Auth** | JWT (access + refresh) + Google OAuth |
| **Payments** | Stripe SDK + Mock mode |
| **Real-time** | Socket.io |
| **Email** | Nodemailer (SMTP) |
| **Images** | Cloudinary + local fallback |
| **Container** | Docker + Docker Compose |

---

## 📁 Project Structure

```
fleetnest/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── search/       # Search & filter
│   │   │   ├── listing/      # Listing detail
│   │   │   ├── auth/         # Login & register
│   │   │   ├── dashboard/    # Customer dashboard
│   │   │   ├── company/      # Company portal
│   │   │   └── admin/        # Admin panel
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   ├── landing/      # Home page sections
│   │   │   ├── dashboard/    # Customer widgets
│   │   │   ├── company/      # Company widgets
│   │   │   ├── admin/        # Admin widgets
│   │   │   └── ui/           # shadcn primitives
│   │   ├── lib/              # API client, utils
│   │   ├── store/            # Zustand stores
│   │   └── hooks/            # Custom React hooks
│   │
│   └── api/                  # Express backend
│       └── src/
│           ├── index.ts      # Server entry
│           ├── app.ts        # Express app
│           ├── config/       # DB, Logger, JWT
│           ├── middleware/   # Auth, error handlers
│           ├── routes/       # All API routes
│           ├── services/     # Email, etc.
│           └── socket/       # Socket.io
│
├── prisma/
│   ├── schema.prisma         # Complete DB schema
│   └── seed.ts               # Demo data seeder
│
├── docker-compose.yml        # Full stack compose
├── .env.example              # Environment template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 8
- PostgreSQL 16 (or Docker)
- Redis (or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/fleetnest.git
cd fleetnest

# Install all dependencies (monorepo)
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

**Minimum required for demo** (mock payments, local images):
```env
DATABASE_URL=postgresql://fleetnest_user:fleetnest_pass@localhost:5432/fleetnest_db
JWT_ACCESS_SECRET=any-random-secret-string
JWT_REFRESH_SECRET=another-random-secret
STRIPE_MOCK_MODE=true
CLOUDINARY_MOCK_MODE=true
```

### 3. Start Database (Docker)

```bash
# Start only PostgreSQL and Redis
docker-compose up postgres redis -d
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start both API and Web concurrently
npm run dev

# Or separately:
npm run dev:api   # API on http://localhost:5000
npm run dev:web   # Web on http://localhost:3000
```

### 6. Access the App

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Main application |
| http://localhost:5000/api | REST API |
| http://localhost:5000/api/health | Health check |

**Demo accounts** (all passwords: `Password123!`):
| Role | Email |
|------|-------|
| Admin | admin@fleetnest.com |
| Company Owner | harare.motors@fleetnest.com |
| Customer | john.doe@example.com |

---

## 🐳 Docker (Full Stack)

```bash
# Copy and configure env
cp .env.example .env

# Start everything
docker-compose up -d

# Wait for health checks, then seed
docker-compose exec api npm run db:seed

# View logs
docker-compose logs -f api
```

---

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
Authorization: Bearer <access_token>
```

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register account | None |
| POST | `/auth/login` | Login | None |
| POST | `/auth/refresh` | Refresh token | Cookie |
| POST | `/auth/forgot-password` | Request reset | None |
| GET | `/auth/me` | My profile | ✅ |
| GET | `/listings` | Search listings | Optional |
| GET | `/listings/:id` | Listing detail | Optional |
| POST | `/listings` | Create listing | Company |
| POST | `/bookings` | Create booking | Customer |
| PUT | `/bookings/:id/status` | Update status | Company |
| POST | `/payments/mock` | Mock payment | Customer |
| POST | `/reviews` | Submit review | Customer |
| GET | `/admin/stats` | Platform stats | Admin |
| PUT | `/admin/companies/:id/verify` | Verify company | Admin |

### Response Format
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 12,
    "totalPages": 9
  }
}
```

---

## 🎫 Promo Codes (Demo)

| Code | Discount | Minimum |
|------|----------|---------|
| `WELCOME20` | 20% off | $10 |
| `FLEET5000` | $5 off | $50 |
| `LUXURY30` | 30% off | $80 |

---

## ☁️ Render Deployment

### API Deployment (Web Service)

1. Connect your GitHub repo to Render
2. Create **Web Service** for `apps/api`
3. Set:
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start`
   - **Environment**: Node.js 20
4. Add all environment variables from `.env.example`
5. Create a **PostgreSQL** database on Render
6. Set `DATABASE_URL` to the Render PostgreSQL connection string

### Web Deployment (Static / Next.js)

1. Create **Web Service** for `apps/web`
2. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add `NEXT_PUBLIC_API_URL` pointing to your API service

### One-Click Deploy Script
```bash
# After deployment, run migrations and seed
npx prisma migrate deploy --schema=prisma/schema.prisma
ts-node --esm prisma/seed.ts
```

---

## 🗄️ Database Schema (Summary)

```
User            → id, email, password, role, status, loyaltyPoints
Company         → id, ownerId, name, status, categories[], rating
Listing         → id, companyId, title, category, pricePerDay, features[]
Booking         → id, userId, listingId, status, totalAmount, couponCode
Payment         → id, bookingId, amount, method, status, stripePaymentIntentId
Review          → id, userId, listingId, rating, comment, response
WishlistItem    → id, userId, listingId
Notification    → id, userId, type, title, isRead
Coupon          → id, code, type, value, usageLimit
LoyaltyTransaction → id, userId, points, bookingId
Category        → id, name, slug, category (enum)
Availability    → id, listingId, date, isBlocked
ContactMessage  → id, name, email, subject, message
```

---

## 🔒 Security

- JWT access tokens (15 min) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- CORS with allowlist
- Rate limiting (100 req/15min, strict on auth)
- Helmet.js security headers
- Input validation (express-validator + Zod)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (helmet + sanitization)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 🏆 About FAMBA

FAMBA is built as an investor-ready all-in-one transportation & delivery marketplace by KUNAKA TECH. The platform is designed to scale across Zimbabwe.

**Contact**: HRmanager@kunakatech.tech | **WhatsApp**: +91 7796787966

---

*Built with ❤️ in Harare, Zimbabwe*
