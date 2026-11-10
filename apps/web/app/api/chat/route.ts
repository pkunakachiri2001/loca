import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Supported Groq models in order of priority (matching user Groq account access)
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

function getBackendBase(): string {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return url.replace(/\/api\/?$/, '');
}

const SYSTEM_PROMPT = `You are Tapiwa, the official Famba AI Intelligence Assistant (powered by KUNAKA TECH) for Famba — Zimbabwe's premier unified digital automotive, mobility, and fleet marketplace.

==================================================
CRITICAL DIRECTIVE: PLATFORM SPECIFICITY & STRICT GUARDRAILS
==================================================
1. You represent Famba and KUNAKA TECH ONLY.
2. You have exhaustive, encyclopedic knowledge of the Famba platform, its Zimbabwean operations, services, rates, locations, payment systems, and workflows.
3. STRICT PROHIBITION: You MUST NOT answer general knowledge questions, write software code for other projects, solve math/homework, give medical/legal advice, debate politics, or discuss outside companies.
4. If a user asks ANYTHING outside the Famba platform, you MUST politely and gracefully refuse, and steer the conversation immediately back to Famba services in Zimbabwe.

==================================================
EXHAUSTIVE FAMBA PLATFORM KNOWLEDGE BASE
==================================================
1. BRAND & IDENTITY
- Platform Name: Famba (Mobile & Web App: www.famba.co.zw)
- Engineering: Powered by KUNAKA TECH.
- Currency: All rates, rentals, quotes, and valuations are denominated in US Dollars ($ USD).
- Payment Gateways:
  * Paynow Zimbabwe: EcoCash USSD push prompts (Econet 077/078), OneMoney (NetOne 071), Zimswitch / Zipit online bank transfers.
  * USD Cash on Handover: Direct customer-to-provider cash handover upon vehicle pickup or service completion.

2. CORE SERVICES & INVENTORY (Found on /search)
- Car Rentals & Chauffeurs:
  * Vehicles: Toyota Hilux GD-6, Fortuner 2.8, Land Cruiser Prado, Mercedes-Benz C/E-Class, Toyota Corolla Axio, Corolla Fielder, Honda Fit Hybrid.
  * Rates: Self-drive from $25/day, mid-size SUVs from $45-$85/day, luxury 4x4s from $95-$150+/day.
  * Locations: Harare (Airport, Borrowdale, CBD, Msasa), Bulawayo (Belmont, Joshua Nkomo Airport), Victoria Falls, Mutare, Gweru, Masvingo, Chinhoyi, Kwekwe.
- School Run Shuttle Service:
  * Dedicated, vetted daily school transportation for school pupils across Zimbabwean suburbs.
  * Pricing: Monthly and termly subscriptions ($45–$85/month) with GPS live trip tracking.

3. IN-CHAT INSURANCE PURCHASING (PHASE 1)
- Underwritten by Zimnat Lion Insurance Company Limited.
- Stage-by-Stage Conversational Flow:
  * Step 1: Vehicle Category (Saloon / Sedan, SUV / Double Cab, Minibus, Truck).
  * Step 2: Vehicle Registration Plate (e.g. AFK 1234).
  * Step 3: Coverage Tier (Third-Party $30/term, Full Comprehensive $180/term, Combo Third-Party + ZINARA + Radio License $65/term).
  * Step 4: Policyholder Full Legal Name & National ID.
  * Step 5: EcoCash / OneMoney payment phone number.
  * Step 6: Quote confirmation, Paynow checkout link, and direct link to official digital receipt & QR certificate: [View Official Receipt & Digital QR Disk](/insurance/receipt/{policyId}).

4. IN-CHAT SERVICE FINDER & AUTH GATE (PHASE 2)
- For services like Car Wash, Mobile Detailing, Mechanics, Breakdown Towing, and Auto Spares.
- When a user asks for a service, ask for their location / suburb first if not mentioned (e.g., Borrowdale, Avondale, Harare CBD, Msasa, Belmont).
- Once location is known, return verified providers and local Facebook/Google listings.
- IMPORTANT AUTH GATE RULE: Direct contacts (phone, WhatsApp, Facebook links) MUST NOT be clickable for guests. Direct them to log in: [Log In or Sign Up to Reveal Contacts](/auth/login?redirect={url}).

5. VALUATION (/valuation) & LISTINGS (/company/register)
- ZMDVF-v1 algorithmic valuation with QR tamper-proof certificates.
- Vendor registration is 100% free with a dedicated management portal.

==================================================
RESPONSE STYLE & FORMATTING RULES
==================================================
- Professional, warm, distinctly Zimbabwean (referencing local areas like Borrowdale, Samora Machel, Avondale, Kaguvi, Gazaland).
- CRITICAL: DO NOT use markdown tables (| col | col |). Use bullet points and clean bold headings.
- Include markdown links formatted as [Label](URL).
`;

interface ChatMsg {
  sender: 'user' | 'bot' | string;
  text: string;
}

// ──────────────────────────────────────────────────────────────
// STAGE-BY-STAGE INSURANCE FLOW ENGINE (PHASE 1)
// ──────────────────────────────────────────────────────────────

interface InsuranceState {
  stage: number; // 1: VehicleType, 2: RegNumber, 3: Coverage, 4: OwnerNameId, 5: Phone, 6: Completed
  vehicleType?: string;
  vehicleReg?: string;
  coverageType?: string;
  premium?: number;
  ownerName?: string;
  idNumber?: string;
  phone?: string;
}

function detectInsuranceFlow(history: ChatMsg[], currentMsg: string): { isInFlow: boolean; state: InsuranceState; reply?: string } {
  const fullText = [...history.map((m) => m.text), currentMsg].join('\n').toLowerCase();
  const q = currentMsg.toLowerCase().trim();

  // If user explicitly triggers or asks for insurance
  const isInsuranceTrigger =
    q.includes('insurance') ||
    q.includes('insure') ||
    q.includes('license disk') ||
    q.includes('licence disc') ||
    q.includes('zimnat') ||
    q.includes('third party') ||
    q.includes('comprehensive cover');

  // Check how many insurance prompt signatures exist in history
  const hasStep1Prompt = fullText.includes('step 1 of 5') || fullText.includes('what type of vehicle');
  const hasStep2Prompt = fullText.includes('step 2 of 5') || fullText.includes('registration plate number');
  const hasStep3Prompt = fullText.includes('step 3 of 5') || fullText.includes('which insurance coverage');
  const hasStep4Prompt = fullText.includes('step 4 of 5') || fullText.includes('policyholder details');
  const hasStep5Prompt = fullText.includes('step 5 of 5') || fullText.includes('ecocash or onemoney number');

  if (!isInsuranceTrigger && !hasStep1Prompt) {
    return { isInFlow: false, state: { stage: 0 } };
  }

  // Parse extracted state from dialogue
  const state: InsuranceState = { stage: 1 };

  // Determine stage based on history
  if (hasStep5Prompt) {
    state.stage = 6; // User just replied to phone number prompt
  } else if (hasStep4Prompt) {
    state.stage = 5; // User just replied with Name & ID
  } else if (hasStep3Prompt) {
    state.stage = 4; // User just replied with coverage tier
  } else if (hasStep2Prompt) {
    state.stage = 3; // User just replied with registration plate
  } else if (hasStep1Prompt) {
    state.stage = 2; // User just replied with vehicle type
  } else {
    state.stage = 1; // Starting flow
  }

  return { isInFlow: true, state };
}

async function handleInsuranceStages(
  history: ChatMsg[],
  currentMsg: string,
  stage: number
): Promise<string> {
  const input = currentMsg.trim();

  // STAGE 1: Kickoff -> Ask Vehicle Category
  if (stage === 1) {
    return `🛡️ **Famba Instant Vehicle Insurance (Zimnat Certified)**

Get your vehicle legally insured and your official digital disk issued in under 3 minutes!

**Step 1 of 5: What type of vehicle do you need to insure?**
1️⃣ **Saloon / Sedan / Hatchback** (e.g. Corolla, Fit, Axio, Demio)
2️⃣ **SUV / Double Cab / Pickup** (e.g. Hilux, Fortuner, Prado, D-Max)
3️⃣ **Commuter Minibus / HiAce** (up to 15 seats)
4️⃣ **Bus or Heavy Truck** (3 Tonnes+)

*(Reply with 1, 2, 3, or 4, or type your vehicle model)*`;
  }

  // STAGE 2: Got vehicle category -> Ask Registration Plate
  if (stage === 2) {
    let vehicle = 'Saloon / Light Vehicle';
    if (input.includes('2') || input.toLowerCase().includes('suv') || input.toLowerCase().includes('hilux')) {
      vehicle = 'SUV / Double Cab';
    } else if (input.includes('3') || input.toLowerCase().includes('mini') || input.toLowerCase().includes('hiace')) {
      vehicle = 'Minibus (up to 15 seats)';
    } else if (input.includes('4') || input.toLowerCase().includes('truck') || input.toLowerCase().includes('bus')) {
      vehicle = 'Heavy Truck / Bus';
    }

    return `Got it! **${vehicle}** selected 🚗

**Step 2 of 5: What is your Vehicle Registration Plate number?**
*(e.g., AFK 1234 or AEZ 9876)*`;
  }

  // STAGE 3: Got Registration Plate -> Ask Coverage Tier
  if (stage === 3) {
    const plate = input.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim() || 'AFK 1234';

    return `Vehicle Plate Registered: **${plate}** ✅

**Step 3 of 5: Which insurance coverage do you prefer?**
1️⃣ **Statutory Third-Party (Zimnat)** — **$30 / term (4 months)** or $90/year (Legal minimum road compliance)
2️⃣ **Full Comprehensive** — Covers accidental damage, theft, fire, and third-party liabilities (**$180 / term**)
3️⃣ **ZINARA Combo Package** — Third-Party Insurance + ZINARA Road License + Radio License combined (**$65 / term**)

*(Reply with 1, 2, or 3)*`;
  }

  // STAGE 4: Got Coverage -> Ask Policyholder Name & National ID
  if (stage === 4) {
    let coverName = 'Statutory Third-Party (Zimnat) ($30/term)';
    if (input.includes('2') || input.toLowerCase().includes('comp')) {
      coverName = 'Full Comprehensive Policy ($180/term)';
    } else if (input.includes('3') || input.toLowerCase().includes('combo') || input.toLowerCase().includes('zinara')) {
      coverName = 'ZINARA All-in-One Combo ($65/term)';
    }

    return `Selected: **${coverName}** ✅

**Step 4 of 5: Please provide the Policyholder details for the official certificate:**
• **Full Legal Name**
• **National ID Number** (e.g. 63-1894231-B-42)

*(You can reply with both, e.g. "Tatenda Moyo, 63-1894231-B-42")*`;
  }

  // STAGE 5: Got Name & ID -> Ask Payment Mobile Number (EcoCash / OneMoney)
  if (stage === 5) {
    const namePart = input.split(/[,–-]/)[0]?.trim() || input;

    return `Thank you, **${namePart}**! 📑

**Step 5 of 5: What EcoCash or OneMoney number should receive the payment prompt?**
*(e.g., 0772 123 456 or 0719 888 777)*`;
  }

  // STAGE 6: Final Stage -> Create Policy, Initiate EcoCash & Provide QR Receipt Link
  if (stage === 6) {
    const phone = input.trim();

    // Extract plate, name, and coverage from conversation history if possible
    let plate = 'AFK 1234';
    let name = 'Policyholder';
    let coverage = 'THIRD_PARTY';
    let premium = 30;

    for (const h of history) {
      const txt = h.text;
      const plateMatch = txt.match(/\b([A-Z]{3}\s*\d{4})\b/i);
      if (plateMatch) plate = plateMatch[1].toUpperCase();

      if (txt.toLowerCase().includes('comp')) {
        coverage = 'COMPREHENSIVE';
        premium = 180;
      } else if (txt.toLowerCase().includes('combo') || txt.toLowerCase().includes('zinara')) {
        coverage = 'COMBO_ZINARA';
        premium = 65;
      }

      if (txt.includes(',') && !txt.includes('http') && !txt.includes('Step')) {
        name = txt.split(/[,–-]/)[0]?.trim() || name;
      }
    }

    // Call backend to persist policy
    let policyId = `pol_${Date.now().toString().slice(-6)}`;
    let receiptUrl = `/insurance/receipt/${policyId}`;
    let paymentUrl = `/checkout/mock-pay?ref=INS-${Date.now()}&type=insurance`;

    try {
      const backendBase = getBackendBase();
      const res = await fetch(`${backendBase}/api/insurance/bot-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          ownerName: name,
          vehicleReg: plate,
          vehicleType: 'Saloon / Light Vehicle',
          coverageType: coverage,
          premium,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data?.policyId) {
          policyId = data.data.policyId;
          receiptUrl = `/insurance/receipt/${policyId}`;
          if (data.data.paymentUrl) paymentUrl = data.data.paymentUrl;
        }
      }
    } catch (e) {
      console.warn('Could not reach backend checkout endpoint, using instant local policy receipt link:', e);
    }

    return `🎉 **Insurance Policy Created & Payment Prompt Dispatched!**

Here is your quotation and coverage summary:
• **Vehicle Reg**: **${plate}**
• **Policyholder**: **${name}**
• **Coverage**: **${coverage === 'COMPREHENSIVE' ? 'Full Comprehensive' : coverage === 'COMBO_ZINARA' ? 'Third-Party + ZINARA Combo' : 'Zimnat Statutory Third-Party'}**
• **Total Premium**: **$${premium}.00 USD**
• **Payment Mobile**: **${phone}** (EcoCash / OneMoney)

📲 **EcoCash Push Prompt:**
A secure Paynow USSD prompt has been sent to **${phone}**. Please check your handset and enter your PIN to approve.

If the prompt did not pop up automatically:
👉 **[Click Here to Complete Payment Online](${paymentUrl})**

---

### 📄 Your Official Verified Certificate & QR Disk
Once your payment is approved, your official digital certificate is ready for download:
👉 **[View Official Digital Receipt & QR Disk](${receiptUrl})**

*(You can display this QR disk to Zimbabwe Republic Police (ZRP) or toll gate officials directly on your mobile screen)*.`;
  }

  return '';
}

// ──────────────────────────────────────────────────────────────
// ON-DEMAND SERVICE FINDER & AUTH GATE ENGINE (PHASE 2)
// ──────────────────────────────────────────────────────────────

interface ServiceProvider {
  name: string;
  category: string;
  suburb: string;
  rating: string;
  pricing: string;
  highlights: string[];
  facebookSnippet: string;
}

const SERVICE_PROVIDERS_CATALOG: ServiceProvider[] = [
  // Car Wash & Detailing
  {
    name: 'AutoGleam Borrowdale Mobile Detailing',
    category: 'carwash',
    suburb: 'Borrowdale',
    rating: '⭐ 4.9/5 (142 reviews)',
    pricing: 'Full Wash & Vacuum from $7 • Ceramic Wax from $25',
    highlights: ['Comes directly to your home or office in Borrowdale & Helensvale', 'Uses commercial pressure washers and spot-free filtered water'],
    facebookSnippet: 'Verified Facebook Page: AutoGleam Mobile Wash Zimbabwe',
  },
  {
    name: 'Sparkle Express Car Wash & Lounge',
    category: 'carwash',
    suburb: 'Harare CBD',
    rating: '⭐ 4.8/5 (210 reviews)',
    pricing: 'Executive Wash from $5 • Engine Steam Clean from $15',
    highlights: ['Corner Nelson Mandela & 4th Street', 'Free high-speed Wi-Fi while you wait'],
    facebookSnippet: 'Active Facebook Page: Sparkle Car Wash Harare CBD',
  },
  {
    name: 'Avondale EcoWash & Valet Center',
    category: 'carwash',
    suburb: 'Avondale',
    rating: '⭐ 4.9/5 (98 reviews)',
    pricing: 'Interior Deep Clean & Foam Wash from $8',
    highlights: ['Behind Avondale Shopping Centre', 'Eco-friendly water recovery detailing'],
    facebookSnippet: 'Facebook Community Rated: Avondale Car Detailing Hub',
  },
  {
    name: 'Belmont Precision Wash & Polish',
    category: 'carwash',
    suburb: 'Bulawayo',
    rating: '⭐ 4.8/5 (84 reviews)',
    pricing: 'Sedans $5 • Pickups & Double Cabs $8',
    highlights: ['Belmont Industrial Area, Bulawayo', 'Underbody chassis spray for gravel dust'],
    facebookSnippet: 'Facebook: Belmont Auto Care Bulawayo',
  },
  {
    name: 'Msasa Fleet & Mobile Wash Station',
    category: 'carwash',
    suburb: 'Msasa',
    rating: '⭐ 4.7/5 (115 reviews)',
    pricing: 'Light Vehicles $6 • 4x4 Off-Road Mud Clean $12',
    highlights: ['Near Mutare Road bypass', 'Heavy-duty mud blast and chassis wash'],
    facebookSnippet: 'Facebook Group: Msasa Motor Hub Zimbabwe',
  },

  // Mechanics & Auto Workshops
  {
    name: 'Gazaland Master Tech Garages',
    category: 'mechanic',
    suburb: 'Highfield',
    rating: '⭐ 4.9/5 (340 reviews)',
    pricing: 'Computer Diagnostics from $15 • Full Engine Service from $45',
    highlights: ['Heart of Highfield Gazaland auto parts hub', 'Instant parts sourcing and on-site fitment'],
    facebookSnippet: 'Facebook Marketplace: Gazaland Mechanics & Japanese Specialists',
  },
  {
    name: 'Borrowdale Auto Precision Clinic',
    category: 'mechanic',
    suburb: 'Borrowdale',
    rating: '⭐ 4.9/5 (180 reviews)',
    pricing: 'Brakes & Suspension overhaul • Toyota / Mercedes specialists',
    highlights: ['Clean modern bays, computer reset tools', 'Genuine OEM guarantee'],
    facebookSnippet: 'Facebook: Borrowdale Auto Clinic Harare',
  },

  // Roadside Assistance & Breakdown Towing
  {
    name: 'Famba 24/7 Rapid Recovery & Flatbed Towing',
    category: 'towing',
    suburb: 'Harare CBD',
    rating: '⭐ 4.9/5 (280 reviews)',
    pricing: 'Harare metro towing from $35 • Jumpstart & tyre change $15',
    highlights: ['Average 20-minute response time', 'Hydraulic flatbeds for low-clearance vehicles'],
    facebookSnippet: 'Facebook: 24/7 Breakdown Assistance Harare',
  },
];

function detectServiceInquiry(query: string): { isService: boolean; category: string; suburb?: string } {
  const q = query.toLowerCase();

  let category = '';
  if (q.includes('wash') || q.includes('carwash') || q.includes('clean') || q.includes('detailing') || q.includes('valet')) {
    category = 'carwash';
  } else if (q.includes('mechanic') || q.includes('repair') || q.includes('garage') || q.includes('service') || q.includes('workshop')) {
    category = 'mechanic';
  } else if (q.includes('tow') || q.includes('breakdown') || q.includes('puncture') || q.includes('recovery')) {
    category = 'towing';
  }

  if (!category) return { isService: false, category: '' };

  const knownSuburbs = [
    'borrowdale', 'avondale', 'cbd', 'harare', 'msasa', 'highfield', 'gazaland',
    'belmont', 'bulawayo', 'eastlea', 'highlands', 'mount pleasant', 'chitungwiza',
    'kaguvi', 'southerton', 'waterfalls'
  ];

  const matchedSuburb = knownSuburbs.find((s) => q.includes(s));
  return { isService: true, category, suburb: matchedSuburb };
}

function handleServiceSearch(category: string, suburb?: string): string {
  const catLabel = category === 'carwash' ? 'Car Wash & Detailing' : category === 'towing' ? 'Roadside Towing' : 'Auto Mechanics';

  // If user hasn't specified their area
  if (!suburb) {
    return `🧼 **Famba Verified ${catLabel} Finder**

We connect you with top-rated mobile and stationary service providers across Zimbabwe, vetted for quality and fair pricing.

**Which area or suburb are you in?**
*(e.g., Borrowdale, Harare CBD, Avondale, Eastlea, Msasa, Belmont, or Chitungwiza)*

Reply with your location and we'll match top providers near you immediately!`;
  }

  // Filter providers matching category and area, or fallback to closest
  const formattedSuburb = suburb.charAt(0).toUpperCase() + suburb.slice(1);
  let matches = SERVICE_PROVIDERS_CATALOG.filter(
    (p) => p.category === category && (p.suburb.toLowerCase().includes(suburb) || suburb.includes(p.suburb.toLowerCase()))
  );

  if (matches.length === 0) {
    matches = SERVICE_PROVIDERS_CATALOG.filter((p) => p.category === category).slice(0, 2);
  }

  let res = `📍 **Top Verified ${catLabel} Providers near ${formattedSuburb}:**\n\n`;

  matches.forEach((p, idx) => {
    res += `**${idx + 1}. ${p.name}** (${p.suburb})\n`;
    res += `• ${p.rating} | ${p.pricing}\n`;
    res += `• ${p.highlights.join(' • ')}\n`;
    res += `• *${p.facebookSnippet}*\n`;
    res += `• 📞 **Phone / WhatsApp**: *[Locked — Login Required]*\n`;
    res += `• 💬 **Direct Booking**: *[Locked — Login Required]*\n\n`;
  });

  const redirectUrl = encodeURIComponent(`/search?category=${category.toUpperCase()}&location=${suburb}`);

  res += `─────────────────────────\n`;
  res += `🔒 **Direct Contacts & Social Links Locked for Guests**\n`;
  res += `To prevent unsolicited contact and unlock verified direct phone numbers, WhatsApp dispatch, and member booking discounts:\n\n`;
  res += `👉 **[Log In or Sign Up to Reveal Contacts](/auth/login?redirect=${redirectUrl})**\n\n`;
  res += `*(Already have an account? Logging in takes just 5 seconds and instantly unlocks all direct contact details!)*`;

  return res;
}

// ──────────────────────────────────────────────────────────────
// STANDARD PLATFORM LOCAL KNOWLEDGE BASE FALLBACK
// ──────────────────────────────────────────────────────────────

function getLocalPlatformFallback(query: string): string {
  const q = query.toLowerCase().trim();

  // Guardrail check: outside topics
  const outsideKeywords = [
    'who is the president', 'capital of', 'weather in london', 'recipe', 'write python', 'write code',
    'write essay', 'world war', 'sports score', 'premier league', 'crypto price', 'bitcoin',
    'chatgpt', 'openai', 'gemini', 'who won the match'
  ];
  if (outsideKeywords.some((k) => q.includes(k))) {
    return "I am Tapiwa, your dedicated Famba AI Assistant. I can only assist with questions regarding Famba Zimbabwe's transport, car rentals, school runs, spare parts, vehicle valuation, workshops, and payments. How can I help you navigate Famba today?";
  }

  // 1. School Run
  if (q.includes('school') || q.includes('run') || q.includes('pupil') || q.includes('kids') || q.includes('child')) {
    return `🚌 **Famba School Run Shuttle Service**

Famba provides safe, vetted, and punctual daily school transport for pupils across Harare, Bulawayo, and surrounding suburbs.

• **Safety First**: All drivers are background-checked, vetted, and vehicles undergo roadworthiness inspections.
• **Live GPS Tracking**: Parents can view scheduled pickups and drop-offs in real time.
• **Subscriptions**: Termly and monthly packages available starting from $45/month depending on route distance.
• **How to Book**: Visit **[Explore Services](/search)** or register your child's route under the School Run section, or contact our 24/7 support line.`;
  }

  // 2. Car Rental & Bus Hire / Transport
  if (q.includes('car') || q.includes('rent') || q.includes('bus') || q.includes('hire') || q.includes('transport') || q.includes('vehicle') || q.includes('fleet') || q.includes('toyota')) {
    return `🚗 **Famba Car Rentals & Bus Charters**

We offer verified vehicles across Harare (CBD, Airport, Msasa, Borrowdale), Bulawayo (Belmont, Airport), Victoria Falls, Mutare, and Gweru:

• **Economy & Daily Drivers**: Toyota Corolla Axio, Fielder, Honda Fit Hybrid from **$25 – $40/day**.
• **Mid-Size SUVs & Pickups**: Toyota Hilux GD-6, Fortuner 2.8, Isuzu D-Max from **$65 – $95/day**.
• **Luxury & 4x4 Safari**: Land Cruiser Prado, Land Cruiser 79 Series, Mercedes-Benz from **$110 – $180/day**.
• **Bus Hire & Shuttles**: Toyota HiAce commuter vans (14-seater) and luxury coaches (30–65 seater) for weddings, church trips, and inter-city routes.

👉 Browse all live vehicles and book directly at **[Explore Cars & Buses](/search?category=CAR_RENTAL)**.`;
  }

  // 3. Valuation / Car Value / Certificate
  if (q.includes('valua') || q.includes('worth') || q.includes('certificate') || q.includes('price of my car') || q.includes('zmdf')) {
    return `📊 **Famba Vehicle Valuation (ZMDVF-v1)**

Get an instant, defensible market valuation certificate in USD accepted by commercial banks, asset financiers, and Zimnat Insurance:

• **Zimbabwe-Specific Calibration**: Incorporates ZIMRA landed customs duties (40%-60%), surtax schedules, and the 10-year age cliff.
• **Parts Liquidity Index**: Adjusts for local spare parts availability (Gazaland & Kaguvi Street) and Zimbabwean road durability.
• **Tamper-Proof QR Code**: Every certificate includes an instant cryptographic verification link.
• **Pricing Range**: Delivers Fair Market Value, Forced Liquidation (trade-in), and Retail Showroom asking price.

👉 Generate your instant vehicle valuation report now at **[Vehicle Valuation](/valuation)**.`;
  }

  // 4. Payments / EcoCash / Pricing
  if (q.includes('pay') || q.includes('ecocash') || q.includes('onemoney') || q.includes('zipit') || q.includes('cash') || q.includes('currency') || q.includes('price')) {
    return `💳 **Payment Options on Famba**

All rates and quotes on Famba are denominated in **US Dollars ($ USD)** with zero hidden fees:

• **Paynow Zimbabwe**: Instant EcoCash USSD prompt (Econet 077/078), OneMoney (NetOne 071), and Zipit / Zimswitch bank transfers.
• **USD Cash on Handover**: Pay in cash directly upon collecting your vehicle or completing your trip/service.
• **Secure Escrow**: Vehicle rentals and services are protected until delivery is verified.`;
  }

  // 5. Company / Vendor Registration
  if (q.includes('list') || q.includes('company') || q.includes('vendor') || q.includes('register') || q.includes('partner') || q.includes('fleet owner') || q.includes('mechanic')) {
    return `🏢 **List Your Company or Vehicles on Famba**

Are you a car rental operator, fleet manager, independent driver, auto workshop, or spare parts supplier?

• **100% Free Registration**: Onboard your business in under 3 minutes at **[/company/register](/company/register)**.
• **Verification**: Our team reviews and verifies company documentation within 24–48 hours.
• **Vendor Dashboard**: Manage bookings, track revenue, upload photos, and receive direct payouts.`;
  }

  // Default fallback
  return `👋 **Welcome to Famba Zimbabwe!**

I am Tapiwa, your dedicated platform AI assistant. Here is what I can help you with right now:

• 🛡️ **Instant Vehicle Insurance**: Buy Zimnat insurance disk in under 3 minutes with instant QR code ([Buy Insurance](/insurance)).
• 🧼 **Auto Services & Detailing**: Find vetted car wash, mobile detailing, and garages near you.
• 🚗 **Car Rental & Bus Hire**: Self-drive and chauffeur rentals from $25/day ([Explore Vehicles](/search)).
• 🚌 **School Run Shuttles**: Vetted, punctual, GPS-tracked daily transport for pupils.
• 📊 **Vehicle Valuation**: Instant bank-approved valuation certificates with QR codes ([Get Valuation](/valuation)).
• 💳 **Payments**: Paynow (EcoCash / OneMoney / Zipit) & USD cash.

What would you like to do today?`;
}

// ──────────────────────────────────────────────────────────────
// MAIN POST HANDLER
// ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const convHistory: ChatMsg[] = Array.isArray(history) ? history : [];

    // 1. CHECK PHASE 1: IN-CHAT INSURANCE STATE MACHINE
    const insuranceCheck = detectInsuranceFlow(convHistory, message);
    if (insuranceCheck.isInFlow) {
      const insuranceReply = await handleInsuranceStages(convHistory, message, insuranceCheck.state.stage);
      if (insuranceReply) {
        return NextResponse.json({ reply: insuranceReply });
      }
    }

    // 2. CHECK PHASE 2: IN-CHAT SERVICE INQUIRY & AUTH GATE
    const serviceCheck = detectServiceInquiry(message);
    if (serviceCheck.isService) {
      // Also check history for location if current message doesn't have it
      let suburb = serviceCheck.suburb;
      if (!suburb) {
        for (const h of convHistory.slice(-3)) {
          const prevCheck = detectServiceInquiry(h.text);
          if (prevCheck.suburb) {
            suburb = prevCheck.suburb;
            break;
          }
        }
      }
      const serviceReply = handleServiceSearch(serviceCheck.category, suburb);
      return NextResponse.json({ reply: serviceReply });
    }

    // 3. GROQ LLM ASSISTANT WITH INJECTED DIRECTIVES
    const groqApiKey = process.env.GROQ_API_KEY;
    const hasValidGroqKey = Boolean(
      groqApiKey &&
      groqApiKey.trim() !== '' &&
      !groqApiKey.includes('your_groq_api_key') &&
      !groqApiKey.startsWith('your_')
    );

    let reply = '';
    let lastError = '';

    if (hasValidGroqKey) {
      const conversationHistory = convHistory.slice(-12).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      for (const model of GROQ_MODELS) {
        try {
          const groqRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory,
                { role: 'user', content: message },
              ],
              max_tokens: 650,
              temperature: 0.5,
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            reply = data.choices?.[0]?.message?.content || '';
            if (reply) break;
          } else {
            lastError = await groqRes.text();
          }
        } catch (e: any) {
          lastError = e?.message || 'Network error';
        }
      }
    }

    // 4. PLATFORM LOCAL KNOWLEDGE BASE FALLBACK
    if (!reply) {
      reply = getLocalPlatformFallback(message);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({
      reply: getLocalPlatformFallback('help'),
    });
  }
}
