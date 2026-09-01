# 🚗 FAMBA — Production Readiness & Launch Roadmap

> **Move More. Live Better.**  
> Prepared by: KUNAKA TECH Development Team  
> Version: 1.0 | Status: Active

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope of Work](#2-scope-of-work-summary)
3. [Phase 1 — Fix, Complete & Polish](#3-phase-1--fix-complete--polish-weeks-12)
4. [Phase 2 — Infrastructure & Deployment](#4-phase-2--infrastructure--deployment-week-3)
5. [Phase 3 — Pre-Launch & Beta](#5-phase-3--pre-launch--beta-weeks-45)
6. [Phase 4 — Public Launch & Growth](#6-phase-4--public-launch--growth-week-6)
7. [Master Timeline](#7-master-timeline)
8. [Risk Register](#8-risk-register)
9. [Team Structure](#9-recommended-team-structure)
10. [Deployment Cost Options](#10-deployment-cost-options--decision-required)

---

## 1. Executive Summary

FAMBA is Zimbabwe's premier all-in-one smart travel, transportation, and delivery marketplace — connecting customers with verified vehicle rentals, drivers, mechanics, and courier services across Zimbabwe.

**Current infrastructure status:**

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (Next.js 14) | ✅ Deployed | Vercel — famba.co.zw |
| Domain | ✅ Active | famba.co.zw — SSL auto-managed by Vercel |
| Backend API (Express) | ✅ Deployed | Vercel — via `apps/api/vercel.json` |
| PostgreSQL Database | ⚠️ Needs production DB | Connect Neon or Render managed DB |
| Redis Cache | ⚠️ Pending | Needed for Socket.io / session store |
| Stripe Payments | ⚠️ Mock mode ON | Live keys needed |
| Cloudinary Images | ⚠️ Mock mode ON | Real credentials needed |
| Google OAuth | ⚠️ Dev credentials | Prod redirect URIs needed |
| Email (SMTP) | ⚠️ Not configured | SMTP credentials needed |
| Groq AI Chatbot | ✅ Functional | Needs PDF context injection |
| Socket.io Real-time | ⚠️ Incompatible with serverless | See Section 10 for options |

> **Remaining work:** Connect real third-party credentials, complete 4 stub API routes, complete QA, seed content, then open to the public.

---

## 2. Scope of Work Summary

| Phase | Title | Duration | Priority |
|-------|-------|----------|----------|
| Phase 1 | Fix, Complete & Polish | 2 weeks | 🔴 Critical |
| Phase 2 | Infrastructure & Services | 1 week | 🔴 Critical |
| Phase 3 | Pre-Launch & Beta | 1 week | 🟡 High |
| Phase 4 | Public Launch & Growth | Ongoing | 🟢 Planned |

---

## 3. Phase 1 — Fix, Complete & Polish (Weeks 1–2)

### 3.1 🤖 AI Chatbot — PDF Knowledge Injection

The AI assistant currently answers only from a static system prompt. The `Famba_Zimnat_Pitch.pdf` in the project root must be injected as context.

**Tasks:**
- [ ] Install `pdf-parse` in `apps/web`
- [ ] Create `apps/web/lib/pdfLoader.ts` — reads and caches PDF text at server startup
- [ ] Inject extracted content into `SYSTEM_PROMPT` in `apps/web/app/api/chat/route.ts`
- [ ] Cap injected content at ~3,000 tokens to stay within model context window
- [ ] Test: bot answers "What is FAMBA's business model?", "What markets are you targeting?"

---

### 3.2 🔌 Stub API Routes — Complete Implementations

Four route files in the Express backend are skeleton files with no handlers:

| Route File | Required Endpoints | Blocking Feature |
|------------|--------------------|-----------------|
| `categories.ts` | `GET /categories` | Category browsing, search filters |
| `contact.ts` | `POST /contact` | Contact Us form + email |
| `coupons.ts` | `POST /coupons/validate` | Checkout discount codes |
| `upload.ts` | `POST /upload`, `DELETE /upload/:id` | Listing photos, avatars, logos |

> ⚠️ Until `upload.ts` is complete with real Cloudinary, companies cannot upload listing images — making business onboarding impossible.

---

### 3.3 🔑 Third-Party Service Integration

| Service | Action Required | Where to Get Keys |
|---------|----------------|-------------------|
| Stripe | Add live keys, configure webhook endpoint | dashboard.stripe.com |
| Cloudinary | Create upload presets, set `CLOUDINARY_*` vars, disable mock mode | cloudinary.com |
| Google OAuth | Add prod redirect URI `https://famba.co.zw/auth/callback` | console.cloud.google.com |
| Google Maps | Enable Maps JS + Directions + Places APIs, restrict key to famba.co.zw | console.cloud.google.com |
| Email (SMTP) | Configure Resend.com or Gmail App Password | resend.com |
| Groq AI | Confirm `GROQ_API_KEY` in Vercel env vars | console.groq.com |
| WhatsApp | Set real Zimbabwe business number | Internal |

> 💡 **Recommendation:** Use **Resend.com** for transactional email — free tier (3,000/month), better deliverability than raw Gmail SMTP, and Nodemailer-compatible.

---

### 3.4 📧 Email Templates Required

| Template | Trigger | Recipient |
|----------|---------|-----------|
| Welcome + Email Verification | User registers | Customer |
| Booking Confirmation | Booking created | Customer + Company |
| Booking Status Update | Company approves/rejects | Customer |
| New Booking Alert | Booking received | Company |
| Password Reset | User requests reset | Customer |
| Company Verification Approved | Admin verifies | Company Owner |
| Company Verification Rejected | Admin rejects | Company Owner |
| Loyalty Points Earned | Booking completed | Customer |

---

### 3.5 🎨 UI Polish Checklist

- [ ] Mobile responsiveness at 375px, 390px, 768px, 1280px
- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty states: no listings, no bookings, no reviews, no notifications
- [ ] Error boundaries — a crash in one section must not blank the full page
- [ ] Background video has a fallback static image for slow connections
- [ ] All hover states and micro-animations working
- [ ] Favicon, Open Graph image, and Twitter Card meta tags set
- [ ] 404 page is branded with a "Go Home" CTA

---

### 3.6 🔐 Security Hardening

| Task | Priority |
|------|----------|
| Rotate all JWT secrets to 32+ character random strings | 🔴 Critical |
| Lock CORS to `https://famba.co.zw` only | 🔴 Critical |
| Enable Stripe webhook signature verification | 🔴 Critical |
| Add file type + size validation on uploads | 🔴 Critical |
| Force admin default password change on first login | 🟡 High |
| Rate limit `/auth/*` endpoints (verify active) | 🟡 High |
| Verify Helmet.js is active in Express app | 🟡 High |
| Sanitize all rich text inputs to prevent XSS | 🟡 High |

---

## 4. Phase 2 — Infrastructure & Deployment (Week 3)

### 4.1 DNS Configuration

Domain `famba.co.zw` is already pointing to Vercel. Add the following:

| Record | Name | Value | Purpose |
|--------|------|-------|---------|
| CNAME | `api` | `your-backend.vercel.app` | Backend API |
| TXT | `@` | SPF/DKIM from Resend | Email deliverability |

---

### 4.2 Vercel Environment Variables

Set these in **both** Vercel projects (web + api):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.famba.co.zw/api` |
| `NEXT_PUBLIC_APP_URL` | `https://famba.co.zw` |
| `NEXT_PUBLIC_APP_NAME` | `FAMBA` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxxxx` |
| `NEXT_PUBLIC_STRIPE_MOCK_MODE` | `false` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIza_xxxxx` |
| `GROQ_API_KEY` | `gsk_xxxxx` |
| `DATABASE_URL` | `postgresql://...` (Neon or Render) |
| `REDIS_URL` | `rediss://...` (Upstash or Render) |
| `NODE_ENV` | `production` |

---

### 4.3 Database Setup

1. Create PostgreSQL instance (see Section 10 for free vs paid options)
2. Copy `DATABASE_URL` into Vercel environment variables
3. Run: `npx prisma migrate deploy --schema=prisma/schema.prisma`
4. Run: `ts-node --esm prisma/seed.ts` (loads categories, coupons, admin account)
5. Verify connection via deployment logs

---

### 4.4 Monitoring Setup

| Tool | Purpose | Cost |
|------|---------|------|
| Sentry.io | Error tracking | Free |
| UptimeRobot | Uptime alerts (famba.co.zw + API) | Free |
| PostHog | User analytics + session replay | Free |

---

## 5. Phase 3 — Pre-Launch & Beta (Weeks 4–5)

### 5.1 Content Setup (Admin Tasks)

| Task | Owner |
|------|-------|
| Create all 8 service categories in DB | Developer / Admin |
| Create welcome coupon codes (WELCOME20, FLEET5000, FAMBA10) | Admin |
| Onboard 3–5 real transport companies with listings + photos | Business Dev |
| Write real About Us page content | Marketing |
| Publish real Terms of Service | Legal / Management |
| Publish real Privacy Policy | Legal / Management |
| Write real FAQ content | Support Team |
| Set up `support@famba.co.zw` inbox | IT / Management |
| Create FAMBA social media pages | Marketing |

---

### 5.2 End-to-End QA (Test on famba.co.zw — NOT localhost)

| # | Journey | Pass |
|---|---------|------|
| 1 | Register → verify email → login | ☐ |
| 2 | Google OAuth login | ☐ |
| 3 | Forgot password → reset → login | ☐ |
| 4 | Search listings → filter by category | ☐ |
| 5 | View listing detail, calendar, reviews | ☐ |
| 6 | Add to wishlist → appears in dashboard | ☐ |
| 7 | Create booking → pay with Stripe test card | ☐ |
| 8 | Apply coupon code at checkout | ☐ |
| 9 | Company receives booking notification + email | ☐ |
| 10 | Company approves booking → customer notified | ☐ |
| 11 | Company rejects booking → customer notified | ☐ |
| 12 | Customer submits review | ☐ |
| 13 | Company responds to review | ☐ |
| 14 | Register as company → submit for verification | ☐ |
| 15 | Admin verifies company → approval email sent | ☐ |
| 16 | Company adds listing with photos | ☐ |
| 17 | Admin approves listing → appears in search | ☐ |
| 18 | AI chatbot answers business questions from PDF | ☐ |
| 19 | Contact form → message saved + email sent | ☐ |

---

### 5.3 Pre-Launch Checklist

- [ ] All JWT secrets rotated
- [ ] CORS locked to `famba.co.zw` only
- [ ] Stripe in live mode, webhook secret configured
- [ ] Admin default password changed
- [ ] All pages have unique `<title>` and `<meta description>`
- [ ] `robots.txt` live at famba.co.zw/robots.txt
- [ ] `sitemap.xml` submitted to Google Search Console
- [ ] Terms of Service and Privacy Policy pages live with real content
- [ ] Cookie consent banner implemented
- [ ] Stripe payout bank account configured
- [ ] All 8 email templates tested — landing in inbox, not spam
- [ ] Sentry catching production errors
- [ ] UptimeRobot monitoring both URLs
- [ ] PostHog recording sessions
- [ ] Lighthouse score > 80 on mobile

---

### 5.4 Soft Beta Launch

- Invite **20–50 beta users** from your network
- Give each a `BETA20` coupon (20% off first booking)
- Share a simple feedback form (Google Forms / Typeform)
- Monitor Sentry daily during beta week
- Fix the top 5 reported issues before public launch

---

## 6. Phase 4 — Public Launch & Growth (Week 6+)

### 6.1 Launch Day

**T-48 hours:**
- Final production smoke test (top 10 QA journeys)
- Confirm all monitoring active and alerting correct emails
- Brief team on support procedures

**Launch day:**
- Publish on all social media simultaneously
- Send WhatsApp broadcasts
- Issue press release to Zimpapers, NewsDay, The Herald, TechZim
- Monitor Sentry + UptimeRobot throughout the day

---

### 6.2 Marketing Strategy (Zimbabwe-Specific)

| Channel | Action | Timeline |
|---------|--------|----------|
| WhatsApp Broadcast | 200+ contact list, weekly listing shares | Day 1 |
| Facebook / Instagram | Targeted ads — Harare, Bulawayo, Mutare | Week 1 |
| Google Ads | "car hire Zimbabwe", "bus rental Harare" | Week 2 |
| TechZim | Pitch FAMBA story to Zimbabwe's top tech blog | Pre-launch |
| Zimpapers / NewsDay | Press release on launch day | Launch day |
| University Partnerships | UZ, MSU, NUST — student discount codes | Month 2 |
| Corporate / NGO Deals | Fleet accounts for NGOs, embassies | Month 2 |
| Referral Program | Loyalty points for referring new customers | Month 1 |

---

### 6.3 🇿🇼 EcoCash / Local Payment Integration

> ⚠️ **This is the single most important growth feature for Zimbabwe.**

Stripe alone will not achieve broad uptake — credit card penetration is low, but EcoCash has **8 million+ active users**.

**Recommended:** Integrate **Paynow Zimbabwe API** (`developers.paynow.co.zw`)
- Supports EcoCash, OneMoney, ZIPIT, Telecash
- Add alongside Stripe — let users choose at checkout
- Expected impact: **2–4× increase in completed bookings**

---

### 6.4 Revenue Model Activation

| Revenue Stream | Timeline |
|---------------|----------|
| Commission per booking (% fee via Stripe) | Day 1 |
| Company subscription tiers (Basic / Pro / Enterprise) | Month 2 |
| Featured listings (paid placement in search) | Month 2 |
| Corporate fleet accounts (monthly invoice) | Month 3 |
| Promotional campaign partnerships | Month 3 |

---

### 6.5 Ongoing Operations

| Task | Frequency |
|------|-----------|
| Review Sentry error dashboard | Daily |
| Respond to `support@famba.co.zw` (< 24h SLA) | Daily |
| Review UptimeRobot alerts | As triggered |
| Database backup verification | Weekly |
| Stripe payout reconciliation | Weekly |
| PostHog analytics review | Weekly |
| `npm audit` — dependency security check | Monthly |
| Feature development sprint | Bi-weekly |

---

## 7. Master Timeline

| Week | Phase | Key Deliverables |
|------|-------|-----------------|
| Week 1 | Phase 1A | AI PDF integration, 4 stub routes, Cloudinary live |
| Week 2 | Phase 1B | Stripe live, OAuth prod, email templates, UI polish, security, QA |
| Week 3 | Phase 2 | Database connected, env vars in Vercel, monitoring live |
| Week 4 | Phase 3A | Content seeded, companies onboarded, legal pages live |
| Week 5 | Phase 3B | Soft beta (20–50 users), feedback, bug fixes |
| Week 6 | Phase 4 | Public launch — social, press release, ads |
| Month 2+ | Growth | EcoCash, subscription tiers, corporate accounts |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Stripe not approved for Zimbabwe payouts | Medium | High | Use Paynow Zimbabwe as primary; Stripe for international cards |
| Emails going to spam | High | Medium | Use Resend.com with SPF/DKIM; test via mail-tester.com |
| Socket.io broken on serverless Vercel | High | Medium | Disable temporarily or replace with Pusher free tier |
| Low initial listing inventory | High | High | Manually onboard 5+ companies before public launch |
| Backend cold starts on free tier | Medium | Medium | Upgrade if UX is unacceptable; free tiers warm up in 1–2s |
| User data breach | Low | Critical | HTTPS enforced, Prisma queries, Helmet.js, regular audits |
| Company doesn't complete verification | Medium | Medium | Auto reminder emails at 24h and 48h; admin reviews daily |

---

## 9. Recommended Team Structure

| Role | Responsibilities | When |
|------|----------------|------|
| Lead Developer (Full-Stack) | Phase 1 & 2 engineering, architecture, deployments | Now — ongoing |
| Frontend Developer | UI polish, email templates, responsiveness, SEO | Weeks 1–3 |
| DevOps / Infrastructure | DNS, env vars, monitoring, CI/CD | Week 3 |
| QA Tester | End-to-end flows, cross-browser, mobile | Weeks 2–4 |
| Project Manager | Timeline, stakeholder updates, beta coordination | Now — ongoing |
| Business Developer | Company onboarding, partnerships, corporate deals | Week 4+ |
| Marketing | Launch campaign, social ads, press release | Week 5+ |
| Customer Support | Support inbox, feedback collection | From beta |

---

## 10. Deployment Cost Options — Decision Required

The deployment infrastructure in Section 4 represents the recommended paid path for long-term stability. However, a fully viable **zero-cost alternative** exists that can sustain the platform through beta and early public launch with no financial commitment.

---

### Option A — Paid Infrastructure *(Recommended for Scale)*

**Estimated cost: $14 – $34 / month**  
**Platforms:** Render.com (backend + database + Redis)

| Service | Platform | Cost |
|---------|---------|------|
| Backend API | Render Web Service | $7/mo |
| PostgreSQL | Render Managed DB | $7/mo |
| Redis | Render Redis | $0–$10/mo |

**Advantages:**
- No cold starts — API responds instantly at all times
- Automated daily database backups
- Dedicated resources, not shared
- Better suited for 100+ concurrent users
- SLA and uptime guarantees
- Easier to scale vertically

> **Recommended when:** The platform has completed beta and is receiving consistent daily traffic from real users.

---

### Option B — Zero-Cost Infrastructure *(Recommended for MVP / Beta Phase)*

**Estimated cost: $0 / month**  
All services below have **permanent free tiers** — no trial periods, no credit card required.

| Service | Platform | Free Tier Limit |
|---------|---------|----------------|
| Frontend (Next.js) | Vercel | 100 GB bandwidth/month |
| Backend API (Express) | Vercel | 100 GB bandwidth/month |
| PostgreSQL | **Neon** (neon.tech) | 0.5 GB storage, unlimited queries |
| Redis Cache | **Upstash** (upstash.com) | 10,000 commands/day |
| Image Storage | Cloudinary | 25 GB storage + 25 GB bandwidth |
| Transactional Email | Resend.com | 3,000 emails/month |
| Error Tracking | Sentry.io | 5,000 errors/month |
| Uptime Monitoring | UptimeRobot | Unlimited monitors |
| User Analytics | PostHog | 1,000,000 events/month |
| **TOTAL** | | **$0 / month** |

**Important technical note:**  
The backend (Express API) is already configured for Vercel serverless deployment via `apps/api/vercel.json` and `apps/api/api/index.ts`. Option B requires **no re-architecture** — only `DATABASE_URL` and `REDIS_URL` need updating in the Vercel environment variables dashboard.

**Known limitation of Option B:**  
Vercel's serverless architecture does not support persistent WebSocket connections. This affects the real-time notification feature (Socket.io). Two mitigations are available:

- **(i) Disable real-time notifications during beta** — users receive email notifications instead. Minor impact for early-stage user volumes. Estimated effort: 1–2 hours.
- **(ii) Replace Socket.io with Pusher** (pusher.com) — free tier: 200,000 messages/day, 200 concurrent connections. Fully compatible with Vercel serverless. Estimated effort: 4–6 developer hours.

> **Recommended when:** The platform is in beta or early launch with fewer than 500 daily active users.

---

### Decision Summary

| Phase | Recommended Option |
|-------|--------------------|
| Beta Launch (Now) | ✅ Option B — Zero cost |
| Public Launch (Month 1) | ✅ Option B — Zero cost |
| Growth Phase (Month 3+) | Evaluate Option A based on traffic metrics |

> The development team recommends starting with **Option B immediately** to eliminate cost blockers, then migrating to Option A once the platform demonstrates consistent user activity. Migration from Option B to Option A is estimated at **4–8 developer hours with zero downtime**.

---

*Built with ❤️ in Harare, Zimbabwe — KUNAKA TECH*  
*Contact: HRmanager@kunakatech.tech | famba.co.zw*
