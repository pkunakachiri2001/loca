# FAMBA Platform Architecture & Design Report

> **Move More. Live Better.**  
> *A comprehensive analysis of the FAMBA Smart Transportation & Delivery Platform.*

---

## 1. Architecture Overview

FAMBA is structured as a robust, modern monorepo, separating the frontend web client from the backend API, allowing for high scalability and clear separation of concerns.

### Frontend Architecture (apps/web)
- **Framework:** Next.js 14 utilizing the modern App Router paradigm (`app/` directory).
- **Language:** TypeScript for type-safe code.
- **State Management:** Zustand (global state) combined with React Query for asynchronous server state.
- **Styling:** Tailwind CSS integrated with Framer Motion for micro-animations and smooth transitions.
- **UI Components:** Customized shadcn/ui components ensuring an accessible and consistent design system.

### Backend Architecture (apps/api)
- **Runtime & Framework:** Node.js powered by Express.js, written in TypeScript.
- **Database:** PostgreSQL 16 managed via Prisma ORM for type-safe database queries and migrations.
- **Real-Time Communication:** Socket.io for instantaneous notifications (e.g., booking updates).
- **Authentication:** JWT (JSON Web Tokens) with a dual-token (access + refresh) mechanism, and Google OAuth integration.
- **Payments:** Stripe SDK integration with a built-in mock mode for testing environments.
- **Media & Email:** Cloudinary for image hosting and Nodemailer for SMTP email communications.

### Deployment & DevOps
- **Containerization:** Docker & Docker Compose setup (`docker-compose.yml`) for seamless full-stack local development.
- **Production Hosting:** Designed to be deployed on Render (Web Service for API, Static/Next.js for Frontend) with the live site currently accessible at **famba.co.zw**.

---

## 2. Available Pages & Routing Structure

Based on a comprehensive deep-scan of the Next.js App Router (`apps/web/app` and `apps/tracker/src/app`), the application serves the following exhaustive list of nested routes:

### 🌐 Main Public Routes
- `/` - Main landing page (Hero sections, Global Video Background, CTAs)
- `/search` - Advanced search and filtering interface for all listings
- `/listing/[slug]` - Detailed view for individual vehicles, drivers, or services
- `/contact`, `/help`, `/about` - Customer support, FAQs, and company info
- **Legal & Safety:** `/privacy`, `/terms`, `/cookies`, `/safety`, `/cancellation`, `/insurance`

### 🔒 Authentication (`/auth`)
- `/auth/login` - User and company login portal
- `/auth/register` - New user account creation
- `/auth/forgot-password` - Password recovery flow

### 👤 Customer Dashboard (`/dashboard`)
- `/dashboard` - Main customer overview
- `/dashboard/bookings` - Management of past and upcoming trips/services
- `/dashboard/loyalty` - Loyalty points and rewards tracking
- `/dashboard/notifications` - Real-time alerts and messages
- `/dashboard/profile` - User settings and preferences
- `/dashboard/wishlist` - Saved vehicles and favorite services

### 🏢 Company Portal (`/company`)
- `/company/register` - Onboarding for new service providers/fleet owners
- `/company/dashboard` - Main company portal overview
- `/company/analytics` - Insights on views, clicks, and conversions
- `/company/bookings` - Manage incoming customer requests (accept/reject)
- `/company/listings` - Table view of all fleet vehicles/services
- `/company/listings/new` - Form to create a new vehicle or service listing
- `/company/revenue` - Financial tracking, payouts, and earnings
- `/company/settings` - Business profile and operational settings

### 🛡️ Super-Admin Panel (`/admin`)
- `/admin` - Main administrative overview and platform health
- `/admin/bookings` - Platform-wide booking oversight
- `/admin/companies` - Verify and manage registered companies
- `/admin/coupons` - Create and manage promotional discount codes
- `/admin/listings` - Approve, reject, or suspend vehicle listings
- `/admin/payments` - Track Stripe transactions and financial flow
- `/admin/reviews` - Moderate customer reviews and ratings
- `/admin/users` - Global user management and access control

### 📍 Tracker Application (`apps/tracker`)
- `/` - Dedicated standalone application for live GPS tracking of ongoing rides and deliveries

### 🛡️ Other Specialized Routes
- `/insurance/dashboard` - Specialized dashboard for insurance partners
- `/tracking` - Public or customer-facing live tracking interface

---

## 3. Design Aesthetics & Color Palette

FAMBA implements a highly premium, modern, and dynamic aesthetic to build trust and drive conversions.

### Color Palette
The primary theme revolves around a **Vibrant Emerald Teal** combined with **Soft Mint** and **Dark Navy**. 

- **Primary Colors (Famba Teal):** 
  - Base: `#008767` (Emerald Teal) - Used for primary buttons, active links, and brand accents.
  - Hover/Light: `#00A884` & `#007358`
- **Backgrounds (Mint & White):** 
  - Main Background: `#FAFCFB` (Off-white)
  - Surface Containers: `#FFFFFF` (Pure White) and `#E6F4F1` (Soft Mint)
- **Typography & Dark Elements (Navy/Charcoal):**
  - Primary Text: `#0B192C` (Deep Navy)
  - Secondary/Muted Text: `#475569` and `#64748B` (Slate)
- **Accents (Copper/Gold):** 
  - Linear gradients `#E8A547` to `#F5D78A` are used for premium badges and glowing effects.

### UI / UX Patterns
- **Typography:** Uses a modern font stack: *Plus Jakarta Sans* (Body/Display), *Space Grotesk* (Headings), and *DM Sans*.
- **Glassmorphism:** Cards and floating elements utilize `backdrop-filter: blur(16px)` with semi-transparent backgrounds (`rgba(255, 255, 255, 0.95)`).
- **Shadows & Glows:** Custom box-shadows like `glow-copper` (`0 0 40px rgba(232, 165, 71, 0.25)`) and deep, soft card shadows.
- **Micro-Animations:** Accordion animations, fade-ins, hover translations (`transform: translateY(-4px)`), and shimmer effects on loading states.
- **Global Video Background:** The root layout includes a `<GlobalVideoBackground />` component for a highly immersive first impression.

---

## 4. Functionality & Connectivity

The platform is fully interconnected, providing a seamless loop between customers, service providers, and administrators.

### Core Functionality
- **Multi-Service Booking:** Customers can seamlessly book car rentals, buses, drivers, mechanics, or emergency roadside assistance.
- **Real-Time Data:** Availability calendars are synced in real-time. Socket.io pushes booking status updates instantly to users.
- **GPS Tracking:** Architecture is in place for live tracking of courier vehicles and rides.
- **Payments & Loyalty:** Secure checkout via Stripe (with mock capability) and a built-in loyalty rewards program.
- **Communication:** Features a direct WhatsApp booking integration and in-app contact messaging.

### Connectivity State
- The frontend Next.js app securely communicates with the Express backend via REST API calls, authenticated using Bearer JWT tokens.
- Cross-Origin Resource Sharing (CORS) and strict rate limiting (100 req/15min) secure the API endpoints.
- Database connectivity is managed efficiently by Prisma, ensuring high performance for search queries and concurrent booking transactions.
- Live deployment connects all these moving parts reliably at **famba.co.zw**.
