import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, pin } = await req.json();
    
    if (!name?.trim() || !pin?.trim()) {
      return NextResponse.json({ error: "Name and PIN are required" }, { status: 400 });
    }

    // Check if PIN already exists
    const existingPin = await db.trackerUser.findUnique({ where: { pin: pin.trim() } });
    if (existingPin) {
      return NextResponse.json({ error: "PIN is already taken" }, { status: 400 });
    }

    // Check if Name already exists
    const existingName = await db.trackerUser.findUnique({ where: { name: name.trim() } });
    if (existingName) {
      return NextResponse.json({ error: "Name is already registered" }, { status: 400 });
    }

    const user = await db.trackerUser.create({
      data: { name: name.trim(), pin: pin.trim() }
    });

    return NextResponse.json({ name: user.name });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
