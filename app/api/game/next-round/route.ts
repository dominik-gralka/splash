import { NextRequest, NextResponse } from 'next/server';
import { nextRound } from '@/lib/game/gameState';
import { NextRoundRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: NextRoundRequest = await request.json();

    const room = nextRound(body.roomId, body.playerId);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error starting next round:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Starten der nächsten Runde';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
