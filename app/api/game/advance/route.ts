import { NextRequest, NextResponse } from 'next/server';
import { advancePhase } from '@/lib/game/gameState';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, playerId } = body;

    const room = advancePhase(roomId, playerId);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error advancing phase:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Phasenwechsel';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
