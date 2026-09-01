/**
 * FAMBA WhatsApp Bot — Core Conversation Engine
 *
 * A finite-state machine that processes every incoming WhatsApp
 * message and decides what to reply.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    CONVERSATION STATES                      │
 * ├─────────────────────┬───────────────────────────────────────┤
 * │ WELCOME             │ Opening menu                          │
 * │ NON_INSURANCE_INFO  │ User chose services 1–4 or 6          │
 * ├─────────────────────┼───────────────────────────────────────┤
 * │ INS_VEHICLE_TYPE    │ Ask vehicle type                      │
 * │ INS_VEHICLE_REG     │ Ask registration plate                │
 * │ INS_OWNER_NAME      │ Ask owner full name                   │
 * │ INS_ID_NUMBER       │ Ask national ID number                │
 * │ INS_COVERAGE_TYPE   │ Ask coverage tier                     │
 * │ INS_CONFIRM_QUOTE   │ Show quote, ask to proceed            │
 * │ INS_PAYMENT_SENT    │ Waiting for Stripe webhook            │
 * │ INS_DELIVERY_CHOICE │ Ask self-collect or biker             │
 * │ INS_BIKER_ADDRESS   │ Ask address for biker delivery        │
 * │ DONE                │ Policy issued, session complete       │
 * └─────────────────────┴───────────────────────────────────────┘
 */

import Stripe from 'stripe';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { sendText, sendImage, sendMenu } from './sender';
import { getSession, saveSession, clearSession, SessionData } from './session';
import {
  getQuote,
  formatQuoteMessage,
  VEHICLE_TYPES,
  COVERAGE_TYPES,
  VehicleType,
  CoverageType,
} from './pricing';
import { generatePolicyQR } from './qrcode';

// ─── Stripe setup ─────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
});

const MOCK_MODE = process.env.STRIPE_MOCK_MODE === 'true';
const APP_URL   = process.env.APP_URL || 'http://localhost:3000';
const API_URL   = process.env.API_URL || 'http://localhost:5000';

// ─── Zimnat branch list ──────────────────────────────────────────────────
const ZIMNAT_BRANCHES = [
  '🏢 Harare CBD — Corner Samora & Jason Moyo',
  '🏢 Bulawayo — 9th Ave & Fort Street',
  '🏢 Mutare — Herbert Chitepo / 4th St',
  '🏢 Gweru — Robert Mugabe Way',
  '🏢 Masvingo — Hughes & Robertson Streets',
];

// ─── Entry point: process one incoming message ────────────────────────────
export async function handleIncomingMessage(
  phone: string,
  messageText: string,
): Promise<void> {
  const input = messageText.trim();
  const session = await getSession(phone);

  logger.info(`[Bot] ${phone} | state=${session.state} | msg="${input}"`);

  try {
    switch (session.state) {
      case 'WELCOME':
      case 'IDLE':
        await handleWelcome(phone, input, session.data);
        break;

      case 'NON_INSURANCE_INFO':
        // After redirecting to website, go back to welcome
        await sendWelcomeMenu(phone);
        await saveSession(phone, 'WELCOME', {});
        break;

      case 'INS_VEHICLE_TYPE':
        await handleVehicleType(phone, input, session.data);
        break;

      case 'INS_VEHICLE_REG':
        await handleVehicleReg(phone, input, session.data);
        break;

      case 'INS_OWNER_NAME':
        await handleOwnerName(phone, input, session.data);
        break;

      case 'INS_ID_NUMBER':
        await handleIdNumber(phone, input, session.data);
        break;

      case 'INS_COVERAGE_TYPE':
        await handleCoverageType(phone, input, session.data);
        break;

      case 'INS_CONFIRM_QUOTE':
        await handleConfirmQuote(phone, input, session.data);
        break;

      case 'INS_PAYMENT_SENT':
        // User texted during payment window — remind them
        await sendText(
          phone,
          `⏳ We're waiting for your payment to be confirmed.\n\nPlease complete it using the link we sent you, or reply *CANCEL* to start over.`,
        );
        if (input.toUpperCase() === 'CANCEL') {
          await clearSession(phone);
          await sendWelcomeMenu(phone);
        }
        break;

      case 'INS_DELIVERY_CHOICE':
        await handleDeliveryChoice(phone, input, session.data);
        break;

      case 'INS_BIKER_ADDRESS':
        await handleBikerAddress(phone, input, session.data);
        break;

      case 'DONE':
        await sendText(
          phone,
          `✅ Your policy is already issued! Reply *MENU* or *HI* to start a new request.`,
        );
        if (['MENU', 'HI', 'HELLO', 'START'].includes(input.toUpperCase())) {
          await clearSession(phone);
          await sendWelcomeMenu(phone);
        }
        break;

      default:
        await clearSession(phone);
        await sendWelcomeMenu(phone);
    }
  } catch (err) {
    logger.error(`[Bot] Unhandled error for ${phone}:`, err);
    await sendText(
      phone,
      `⚠️ Something went wrong on our end. Please try again in a moment.\n\nReply *MENU* to restart.`,
    );
  }
}

// ─── WELCOME MENU ─────────────────────────────────────────────────────────
async function sendWelcomeMenu(phone: string): Promise<void> {
  await sendMenu(
    phone,
    '👋 Welcome to FAMBA — Move More. Live Better!',
    [
      { number: 1, label: '🚗 Car Rental', description: 'Browse available vehicles' },
      { number: 2, label: '🚌 Bus / Charter', description: 'Group & corporate transport' },
      { number: 3, label: '👨‍✈️ Hire a Driver', description: 'Certified chauffeurs' },
      { number: 4, label: '🔧 Mechanic / Car Wash', description: 'Auto repair & cleaning' },
      { number: 5, label: '🛡️ Buy Motor Insurance', description: 'Powered by Zimnat' },
      { number: 6, label: '📦 Courier / Other', description: 'Delivery & more services' },
    ],
    'Reply with the number of your choice (e.g. "5" for insurance)',
  );
}

async function handleWelcome(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  // Accept "hi", "hello", "start", "menu" as openers
  const greetings = ['hi', 'hello', 'hey', 'start', 'menu', 'hie'];
  if (greetings.includes(input.toLowerCase()) || !input) {
    await sendWelcomeMenu(phone);
    await saveSession(phone, 'WELCOME', {});
    return;
  }

  const choice = parseInt(input, 10);

  if (choice >= 1 && choice <= 4 || choice === 6) {
    // Non-insurance — redirect to website
    const labels: Record<number, string> = {
      1: 'Car Rentals',
      2: 'Bus & Charter',
      3: 'Driver Hire',
      4: 'Mechanic & Car Wash',
      6: 'Courier & Other Services',
    };
    await sendText(
      phone,
      `Great choice! 🎉\n\n*${labels[choice]}* and all our services are available on our platform.\n\n👉 Visit: *https://famba.co.zw*\n\nYou can search, compare, and book instantly!\n\nReply *MENU* anytime to come back here.`,
    );
    await saveSession(phone, 'NON_INSURANCE_INFO', data);
  } else if (choice === 5) {
    // Insurance flow
    await sendText(
      phone,
      `🛡️ *Zimnat Motor Insurance via FAMBA*\n\nGreat! Let's get you covered in a few quick steps.\n\nFirst, what type of vehicle would you like to insure?`,
    );
    await sendMenu(phone, 'Select your vehicle type:', VEHICLE_TYPES.map((v, i) => ({ number: i + 1, label: v })));
    await saveSession(phone, 'INS_VEHICLE_TYPE', {});
  } else {
    await sendText(phone, `Please reply with a number from *1 to 6* 😊`);
    await sendWelcomeMenu(phone);
  }
}

// ─── INSURANCE STEP 1: Vehicle Type ──────────────────────────────────────
async function handleVehicleType(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  const idx = parseInt(input, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= VEHICLE_TYPES.length) {
    await sendText(phone, `Please reply with a number from 1 to ${VEHICLE_TYPES.length}.`);
    await sendMenu(phone, 'Vehicle type:', VEHICLE_TYPES.map((v, i) => ({ number: i + 1, label: v })));
    return;
  }

  const vehicleType = VEHICLE_TYPES[idx];
  const newData: SessionData = { ...data, vehicleType };

  await sendText(phone, `Got it — *${vehicleType}* ✅\n\nWhat is the vehicle's *registration plate*?\n_(e.g. ABC 1234)_`);
  await saveSession(phone, 'INS_VEHICLE_REG', newData);
}

// ─── INSURANCE STEP 2: Vehicle Reg ───────────────────────────────────────
async function handleVehicleReg(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  if (input.length < 3) {
    await sendText(phone, `That doesn't look right. Please enter the vehicle registration plate (e.g. *ABC 1234*).`);
    return;
  }

  const vehicleReg = input.toUpperCase();
  const newData: SessionData = { ...data, vehicleReg };

  await sendText(phone, `Plate: *${vehicleReg}* ✅\n\nWhat is the *full name of the vehicle owner*?`);
  await saveSession(phone, 'INS_OWNER_NAME', newData);
}

// ─── INSURANCE STEP 3: Owner Name ────────────────────────────────────────
async function handleOwnerName(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  if (input.split(' ').length < 2) {
    await sendText(phone, `Please enter your *full name* (first and last name).`);
    return;
  }

  const ownerName = input.replace(/\b\w/g, (c) => c.toUpperCase()); // Title case
  const newData: SessionData = { ...data, ownerName };

  await sendText(phone, `Name: *${ownerName}* ✅\n\nPlease provide your *national ID number*.`);
  await saveSession(phone, 'INS_ID_NUMBER', newData);
}

// ─── INSURANCE STEP 4: ID Number ─────────────────────────────────────────
async function handleIdNumber(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  if (input.length < 5) {
    await sendText(phone, `Please enter a valid national ID number.`);
    return;
  }

  const idNumber = input.toUpperCase();
  const newData: SessionData = { ...data, idNumber, phone };

  await sendText(phone, `ID: *${idNumber}* ✅\n\nAlmost there! Which coverage would you like?`);
  await sendMenu(
    phone,
    'Select coverage type:',
    COVERAGE_TYPES.map((c, i) => ({ number: i + 1, label: c.label })),
  );
  await saveSession(phone, 'INS_COVERAGE_TYPE', newData);
}

// ─── INSURANCE STEP 5: Coverage Type ─────────────────────────────────────
async function handleCoverageType(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  const idx = parseInt(input, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= COVERAGE_TYPES.length) {
    await sendText(phone, `Please reply with 1, 2, or 3.`);
    await sendMenu(
      phone,
      'Coverage type:',
      COVERAGE_TYPES.map((c, i) => ({ number: i + 1, label: c.label })),
    );
    return;
  }

  const coverageType = COVERAGE_TYPES[idx].key;
  const vehicleType  = data.vehicleType as VehicleType;
  const quote        = getQuote(vehicleType, coverageType as CoverageType);
  const newData: SessionData = { ...data, coverageType, quotedPremium: quote.annualPremium };

  const quoteMsg = formatQuoteMessage(quote);
  await sendText(phone, quoteMsg);
  await sendText(
    phone,
    `Would you like to proceed with this quote?\n\nReply *YES* to continue to payment, or *NO* to change your options.`,
  );
  await saveSession(phone, 'INS_CONFIRM_QUOTE', newData);
}

// ─── INSURANCE STEP 6: Confirm Quote ─────────────────────────────────────
async function handleConfirmQuote(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  const answer = input.toUpperCase();

  if (answer === 'NO' || answer === 'N') {
    await sendText(phone, `No problem! Let's start over. What type of vehicle would you like to insure?`);
    await sendMenu(phone, 'Vehicle type:', VEHICLE_TYPES.map((v, i) => ({ number: i + 1, label: v })));
    await saveSession(phone, 'INS_VEHICLE_TYPE', {});
    return;
  }

  if (answer !== 'YES' && answer !== 'Y') {
    await sendText(phone, `Please reply *YES* to continue or *NO* to change your quote.`);
    return;
  }

  // Create Stripe Checkout session (or mock it)
  let paymentUrl: string;
  let stripeSessionId: string;

  if (MOCK_MODE) {
    // ── MOCK MODE ── generate a fake payment link for testing
    stripeSessionId = `mock_${Date.now()}`;
    paymentUrl = `${APP_URL}/insurance/mock-pay?ref=${stripeSessionId}&amount=${data.quotedPremium}`;
    logger.info(`[Bot] MOCK payment for ${phone}: ${paymentUrl}`);
  } else {
    // ── REAL STRIPE ──
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Zimnat Motor Insurance — ${data.coverageType?.replace('_', ' ')}`,
              description: `Vehicle: ${data.vehicleReg} | Owner: ${data.ownerName}`,
            },
            unit_amount: Math.round((data.quotedPremium || 0) * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/insurance/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/insurance/cancel`,
      metadata: {
        whatsappPhone: phone,
        vehicleReg:    data.vehicleReg || '',
        ownerName:     data.ownerName  || '',
        idNumber:      data.idNumber   || '',
        vehicleType:   data.vehicleType || '',
        coverageType:  data.coverageType || '',
      },
    });
    stripeSessionId = session.id;
    paymentUrl = session.url!;
  }

  const newData: SessionData = { ...data, stripeSessionId };

  await sendText(
    phone,
    `💳 *Payment Link*\n\nPlease complete your payment of *$${data.quotedPremium} USD* using the secure link below:\n\n👉 ${paymentUrl}\n\n_The link is valid for 30 minutes._\n\nOnce paid, we'll send your QR code instantly! ✅`,
  );

  await saveSession(phone, 'INS_PAYMENT_SENT', newData);

  if (MOCK_MODE) {
    // Auto-complete in mock mode after 3 seconds for testing
    setTimeout(() => {
      completePolicyAfterPayment(phone, stripeSessionId).catch((e) =>
        logger.error('[Bot] Mock auto-complete failed:', e),
      );
    }, 3_000);
  }
}

// ─── DELIVERY CHOICE (called after payment confirmed) ─────────────────────
async function handleDeliveryChoice(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  const choice = input.trim();

  if (choice === '1' || choice.toUpperCase() === 'A' || choice.toUpperCase().includes('COLLECT')) {
    // Self-collect
    const branchList = ZIMNAT_BRANCHES.join('\n');
    const newData: SessionData = { ...data, deliveryType: 'SELF_COLLECT' };

    await sendText(
      phone,
      `🏢 *Self-Collect — Zimnat Branches*\n\nPresent your QR code at any of these branches to receive your printed cover note:\n\n${branchList}\n\n_No appointment needed. Open Mon–Fri 8am–4pm._\n\n✅ You're all set! Have a safe drive. 🚗`,
    );
    await saveSession(phone, 'DONE', newData);

  } else if (choice === '2' || choice.toUpperCase() === 'B' || choice.toUpperCase().includes('BIKER')) {
    // Biker delivery
    await sendText(
      phone,
      `🚲 *Biker Delivery*\n\nPlease send your *full delivery address* so we can dispatch a biker to you.\n\n_(e.g. 45 Samora Machel Ave, Harare CBD)_`,
    );
    await saveSession(phone, 'INS_BIKER_ADDRESS', { ...data, deliveryType: 'BIKER' });

  } else {
    await sendText(phone, `Please reply:\n*1* — 🏢 Collect at a Zimnat branch\n*2* — 🚲 Send a biker to my address`);
  }
}

async function handleBikerAddress(
  phone: string,
  input: string,
  data: SessionData,
): Promise<void> {
  if (input.length < 10) {
    await sendText(phone, `Please provide your full delivery address.`);
    return;
  }

  const newData: SessionData = { ...data, deliveryAddress: input };

  // Update the policy record
  if (data.policyId) {
    await prisma.insurancePolicy.update({
      where: { id: data.policyId },
      data: { deliveryType: 'BIKER', deliveryAddress: input },
    });
  }

  await sendText(
    phone,
    `✅ *Delivery Confirmed!*\n\nA FAMBA biker will deliver your printed cover note to:\n📍 _${input}_\n\nDelivery is usually within *2–4 hours* during business hours.\n\nWe'll notify you when the biker is on their way! 🚲\n\nThank you for choosing FAMBA & Zimnat. 💚`,
  );

  await saveSession(phone, 'DONE', newData);
}

// ─── CALLED BY STRIPE WEBHOOK (or mock) ──────────────────────────────────
/**
 * Called when Stripe confirms payment (via webhook in whatsapp.ts route).
 * Generates the QR code, saves the policy, and sends QR to user's WhatsApp.
 */
export async function completePolicyAfterPayment(
  phone: string,
  stripeSessionId: string,
): Promise<void> {
  const session = await getSession(phone);
  const data    = session.data;

  // Create the policy record
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const policy = await prisma.insurancePolicy.create({
    data: {
      phone,
      ownerName:      data.ownerName     || 'Unknown',
      idNumber:       data.idNumber      || '',
      vehicleReg:     data.vehicleReg    || '',
      vehicleType:    data.vehicleType   || '',
      coverageType:   data.coverageType  || '',
      premium:        data.quotedPremium || 0,
      paymentStatus:  'PAID',
      stripeSessionId,
      issuedAt:       new Date(),
      expiresAt,
    },
  });

  // Generate QR code
  const verifyUrl = `${API_URL}/api/whatsapp/verify-policy/${policy.policyRef}`;
  const { publicUrl, qrData } = await generatePolicyQR({
    policyRef:    policy.policyRef,
    ownerName:    policy.ownerName,
    vehicleReg:   policy.vehicleReg,
    coverageType: policy.coverageType,
    issuedAt:     policy.issuedAt!.toISOString(),
    verifyUrl,
  });

  // Save QR URL back to policy
  await prisma.insurancePolicy.update({
    where: { id: policy.id },
    data: { qrCodeUrl: publicUrl, qrCodeData: qrData },
  });

  // Send QR code image to user
  await sendText(
    phone,
    `🎉 *Payment Confirmed!* Your Zimnat Motor Insurance policy is now active.\n\n📋 *Policy Reference:* ${policy.policyRef}\n🚗 *Vehicle:* ${policy.vehicleReg}\n👤 *Owner:* ${policy.ownerName}\n📅 *Valid Until:* ${expiresAt.toLocaleDateString()}\n\nHere is your QR code — present this at any Zimnat branch to collect your cover note:`,
  );

  await sendImage(phone, publicUrl, `FAMBA Insurance — ${policy.policyRef}`);

  await sendText(
    phone,
    `How would you like to receive your printed cover note?\n\n*1* — 🏢 I'll collect at a Zimnat branch\n*2* — 🚲 Send a biker to my address`,
  );

  // Advance to delivery choice
  await saveSession(phone, 'INS_DELIVERY_CHOICE', { ...data, policyId: policy.id });
}
