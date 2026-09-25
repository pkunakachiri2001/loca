import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const updates = await db.trackerUpdate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(updates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { author, content, type } = body;
    
    if (!author || !content || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const update = await db.trackerUpdate.create({
      data: { author, content, type }
    });

    return NextResponse.json(update);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}
