import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Famba Assistant, the friendly and knowledgeable AI support agent for Famba (also known as FleetNest) — Africa's premier transportation and logistics marketplace.

## Your role
You help users with anything related to Famba's platform, including:
- Booking vehicles: car rentals, buses, tuk-tuks, motorbikes
- Hiring drivers or mechanics
- Package and goods deliveries
- Listing a transport or logistics business on Famba
- Account management: sign-up, login, profile, passwords
- Payments, pricing, invoices, and refunds
- Coupon codes and promotions (e.g., WELCOME10 for 10% off the first booking)
- Safety, trust, and verification policies
- Cancellation, rescheduling, and dispute resolution
- How tracking and live GPS features work
- Corporate and fleet solutions

## Tone
Be warm, helpful, concise, and professional. Use emojis sparingly but naturally. Answer in the same language the user writes in.

## Key facts
- Car rentals start from $25/day | Buses from $65/day | Driver hire from $15/day | Package delivery from $2.50
- Payments use 256-bit SSL encryption; funds are held until the trip/service begins
- Businesses are verified within 48 hours of application; listing is 100% free
- Support is available 24/7

## Refusing off-topic requests
If the user asks something that is clearly unrelated to Famba's business (e.g., write code for them, give medical advice, explain geopolitics, create creative writing, answer general trivia, etc.) — politely decline and redirect them.

Example refusal: "That's a bit outside my lane! 🚗 I'm best at helping you with Famba's transport and logistics platform. Is there anything related to bookings, deliveries, or your account I can help with?"

Do NOT answer questions that are completely unrelated to transportation, logistics, business listings, payments, or the Famba/FleetNest platform.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Build conversation history for context (last 10 messages max)
    const conversationHistory = Array.isArray(history)
      ? history.slice(-10).map((msg: { sender: string; text: string }) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }))
      : [];

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again shortly.' },
        { status: 502 }
      );
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
