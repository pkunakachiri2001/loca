import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    
    if (!pin?.trim()) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const user = await db.trackerUser.findUnique({
      where: { pin: pin.trim() }
    });
    
    if (user) {
      return NextResponse.json({ name: user.name });
    } else {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
