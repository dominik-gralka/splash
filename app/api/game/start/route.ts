import { NextRequest, NextResponse } from 'next/server';
import { startGame } from '@/lib/game/gameState';
import { StartGameRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: StartGameRequest = await request.json();

    const room = startGame(body.roomId, body.playerId);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error starting game:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Starten des Spiels';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
