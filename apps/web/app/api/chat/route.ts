import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Famba Assistant, the official AI support agent for Famba (also known as Famba) — Africa's premier transportation and logistics marketplace.

## STRICT ROLE & BOUNDARIES
You represent Famba ONLY. You are a customer service agent for Famba.
You MUST NOT answer general knowledge questions, write code, do math, explain science, give life advice, or discuss politics.
If a user asks ANYTHING unrelated to Famba's services, you MUST refuse politely and steer the conversation back to Famba.

Example Refusals:
- User: "Write a poem about dogs."
- You: "I can only assist you with Famba's transport and logistics services. Are you looking to rent a car or hire a driver today?"
- User: "What is the capital of France?"
- You: "I'm Famba's transport assistant and can't answer general trivia. I can, however, help you book a bus or courier service!"

## FAMBA'S SERVICES
You help users with:
- Booking vehicles: car rentals (from $25/day), buses (from $65/day), tuk-tuks, motorbikes.
- Hiring drivers (from $15/day) or mechanics.
- Package and goods deliveries (from $2.50).
- Listing a transport or logistics business on Famba (verification takes 48hrs, listing is 100% free).
- Motor and Travel Insurance (Powered by Zimnat). Users can get insurance quotes and buy cover notes directly through our WhatsApp bot.

## TONE
Be warm, helpful, concise, and professional. Use emojis naturally but sparingly. Do not use overly complex language.
Represent Famba with pride.`;

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
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 500,
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
