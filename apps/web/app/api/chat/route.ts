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

const SYSTEM_PROMPT = `You are the official Famba AI Intelligence Assistant (powered by KUNAKA TECH) for Famba — Zimbabwe's premier unified digital automotive, mobility, and fleet marketplace.

==================================================
CRITICAL DIRECTIVE: PLATFORM SPECIFICITY & STRICT GUARDRAILS
==================================================
1. You represent Famba and KUNAKA TECH ONLY.
2. You have exhaustive, encyclopedic knowledge of the Famba platform, its Zimbabwean operations, services, rates, locations, payment systems, and workflows.
3. STRICT PROHIBITION: You MUST NOT answer general knowledge questions, write software code for other projects, solve math/homework, give medical/legal advice, debate politics, or discuss outside companies.
4. If a user asks ANYTHING outside the Famba platform, you MUST politely and gracefully refuse, and steer the conversation immediately back to Famba services in Zimbabwe.

REFUSAL EXAMPLES:
- User: "Who won the 2022 World Cup?"
  Reply: "I'm Famba's dedicated automotive and transport assistant in Zimbabwe, so I can only help with services on our platform! Are you looking to rent a car, book a School Run, or check vehicle values today?"
- User: "Write Python code to sort an array."
  Reply: "I can only assist with Famba's transport, fleet, and vehicle services across Zimbabwe. Would you like to find a vehicle in Harare or value a car?"
- User: "What is the capital of Australia?"
  Reply: "I'm only trained to assist with Famba Zimbabwe mobility services. How can I assist with your transport, spare parts, or workshop needs?"

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
  * Vehicles: Toyota Hilux GD-6, Fortuner 2.8, Land Cruiser Prado, Mercedes-Benz C/E-Class, Toyota Corolla Axio, Corolla Fielder, Honda Fit Hybrid, etc.
  * Rates: Self-drive from $25/day, mid-size SUVs from $45-$85/day, luxury 4x4s from $95-$150+/day.
  * Locations: Harare (Airport, Borrowdale, CBD, Msasa), Bulawayo (Belmont, Joshua Nkomo Airport), Victoria Falls, Mutare, Gweru, Masvingo, Chinhoyi, Kwekwe.
- School Run Shuttle Service:
  * Dedicated, vetted daily school transportation for school pupils across Zimbabwean suburbs.
  * Safety features: Verified background-checked drivers, strict scheduled punctuality, seat belts, and live GPS tracking for parent peace of mind.
  * Monthly and termly subscription plans available.
- Bus & Minibus Charters:
  * Fleets: Toyota HiAce commuter vans, City Link Bus, Mercedes-Benz Sprinter, 30-65 seater luxury coaches.
  * Available for church trips, wedding parties, corporate delegations, airport transfers, and inter-city routes.
- Auto Workshops & Repairs (/search?category=MECHANIC):
  * Partner garages for diagnostics, routine engine servicing, computerized diagnostics, brake replacement, transmission repair, and suspension work in Harare and Bulawayo.
- Spare Parts Marketplace (/search?category=DRIVER / Spare Parts):
  * Direct access to quality new and second-hand OEM components for Toyota, Isuzu, Honda, Nissan, Mazda.
  * Verified suppliers from Harare's Gazaland (Highfield) and Kaguvi Street automotive hubs.
- Car Wash & Detailing:
  * Mobile wash, full interior shampoo, steam engine cleaning, high-gloss ceramic waxing.
- Courier & Light Freight (/search?category=COURIER):
  * Same-day parcel deliveries, errand dispatch, and light logistics from $2.50.
- Emergency Roadside Towing (/search?category=EMERGENCY_ROADSIDE):
  * 24/7 breakdown flatbed towing, battery jump-starts, fuel drop, and puncture assistance.

3. SPECIALIZED VEHICLE VALUATION PLATFORM (/valuation)
- Official Zimbabwe Multi-Factor Defensible Valuation Framework (ZMDVF-v1).
- What it does: Computes independent, objective market valuation certificates in USD accepted by commercial banks, asset financiers, and insurance underwriters.
- Valuation Range:
  * Indicative Fair Market Value ($ USD).
  * Low Value (Forced Liquidation / Dealer Trade-In).
  * High Value (Retail Showroom Asking Price).
- Why it is unique to Zimbabwe:
  * Does NOT use foreign South African books (which fail due to Rand currency and tariff omission).
  * Factors in ZIMRA Customs Duty (40%-60%), Surtax, and 15% VAT on landed CIF imports.
  * Accounts for the "10-Year Surtax Cliff" (punitive surtax on older imports creates a strong floor value for clean local cars).
  * Mileage variance calibrated against Zimbabwe's 14,000 km/year national average.
  * Parts availability liquidity rating (Toyota/Honda retain value; European luxury depreciates faster).
- Verification: Every certificate includes a tamper-proof cryptographic QR Code linking to live verification on famba.co.zw.

4. MOTOR INSURANCE PARTNERSHIP (/insurance)
- Integrated digital cover notes with partner underwriters (including Zimnat Insurance).
- Covers: Full Comprehensive, Third Party Fire & Theft, Roadside Breakdown Assistance.
- Seamless flow: Vehicle valuation directly feeds the Sum-Insured into the insurance quote generator.

5. LIVE TRACKING (/tracking)
- Real-time GPS telematics monitoring confined to small individual cars (Honda Fit, Toyota Aqua/Axio, private family cars) for security, speed alerts, and route history.

6. COMPANY & VENDOR ONBOARDING (/company/register)
- For car rental companies, independent drivers, mechanics, and parts suppliers.
- Registration is 100% free. Verified by Super Admins within 24-48 hours.
- Providers access a dedicated vendor portal (/company/dashboard) with fleet management, booking approvals, direct photo uploads, and weekly revenue payouts.

==================================================
RESPONSE STYLE & CRITICAL FORMATTING RULES
==================================================
- Professional, knowledgeable, warm, and distinctly Zimbabwean (understand local places like Samora Machel Ave, Borrowdale, Msasa, Gazaland, Bulawayo).
- CRITICAL FORMATTING RULE: NEVER USE MARKDOWN TABLES (DO NOT output | pipes | or --- dashes). Mobile chat windows are narrow and tables look broken!
- Present vehicle categories, rates, and locations using clean emoji cards and bullet points.
  Example Format:
  🚗 **Economy / Daily Drivers** ($25 – $35/day)
  • Models: Toyota Corolla Axio, Fielder, Honda Fit Hybrid
  • Locations: Harare Airport, CBD, Msasa | Bulawayo Airport
- Keep answers structured, concise, and easy to read with bullet points when listing prices or services.
- Always include relevant navigation links (e.g. "You can view available cars at /search", "Get a valuation at /valuation", or "Register your fleet at /company/register").
- NEVER mention internal AI infrastructure, backend providers, or "Groq". You are Tapiwa, the official Famba platform copilot.
`;

function getLocalPlatformFallback(query: string): string {
  const q = query.toLowerCase().trim();

  // Guardrail check: if asking about outside topics
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

  // 6. Workshops / Mechanics / Spare Parts
  if (q.includes('mechanic') || q.includes('workshop') || q.includes('repair') || q.includes('part') || q.includes('spares') || q.includes('gazaland') || q.includes('kaguvi')) {
    return `🔧 **Workshops & Auto Spare Parts**

• **Verified Mechanics**: Engine servicing, computerized diagnostics, brakes, suspension, and air conditioning repairs in Harare and Bulawayo.
• **Spare Parts Marketplace**: Access genuine and second-hand OEM replacement parts directly from verified suppliers in Harare's **Gazaland (Highfield)** and **Kaguvi Street** hubs.
• **Emergency Roadside Assistance**: 24/7 breakdown towing, puncture repair, and battery jump-starts.

👉 Find mechanics or order parts at **[Workshops & Spares](/search?category=MECHANIC)**.`;
  }

  // Default platform fallback
  return `👋 **Welcome to Famba Zimbabwe!**

I am Tapiwa, your dedicated platform AI assistant. Here is what I can help you with today:

• 🚗 **Car Rental & Bus Hire**: Self-drive and chauffeur rentals from $25/day ([Explore Vehicles](/search)).
• 🚌 **School Run Shuttles**: Vetted, punctual, GPS-tracked daily transport for pupils.
• 📊 **Vehicle Valuation**: Instant bank-approved valuation certificates with QR codes ([Get Valuation](/valuation)).
• 🔧 **Mechanics & Gazaland Spares**: Verified repair garages and replacement parts ([Find Workshops](/search?category=MECHANIC)).
• 💳 **Payments**: Paynow (EcoCash / OneMoney / Zipit) & USD cash.
• 🏢 **List Your Business**: Register your rental fleet or workshop for free ([Register Company](/company/register)).

What would you like to know more about?`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const hasValidGroqKey = Boolean(
      groqApiKey &&
      groqApiKey.trim() !== '' &&
      !groqApiKey.includes('your_groq_api_key') &&
      !groqApiKey.startsWith('your_')
    );

    let reply = '';
    let lastError = '';

    // If a valid Groq API key is provided, query Groq models
    if (hasValidGroqKey) {
      // Build conversation history for context (last 12 messages max)
      const conversationHistory = Array.isArray(history)
        ? history.slice(-12).map((msg: { sender: string; text: string }) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          }))
        : [];

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
            console.warn(`Groq model ${model} failed:`, lastError);
          }
        } catch (e: any) {
          lastError = e?.message || 'Network error';
        }
      }
    }

    // If Groq key is placeholder or Groq service returned error, use platform knowledge fallback
    if (!reply) {
      if (!hasValidGroqKey) {
        console.info('GROQ_API_KEY is not configured or placeholder; serving from Famba local knowledge base.');
      } else {
        console.warn('Groq models unavailable, falling back to Famba local knowledge base. Error:', lastError);
      }
      reply = getLocalPlatformFallback(message);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    // Never fail with a raw error screen; fallback safely
    return NextResponse.json({
      reply: getLocalPlatformFallback('help'),
    });
  }
}
