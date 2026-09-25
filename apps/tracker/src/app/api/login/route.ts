import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    
    // Format: "1234:Pkunaka,5678:Loca,9999:Tendai"
    const pinsEnv = process.env.TEAM_PINS || "1234:Pkunaka,5678:Loca";
    
    const users = pinsEnv.split(',').map(pair => {
      const [p, n] = pair.split(':');
      return { pin: p?.trim(), name: n?.trim() };
    });

    const user = users.find(u => u.pin === pin);
    
    if (user) {
      return NextResponse.json({ name: user.name });
    } else {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
