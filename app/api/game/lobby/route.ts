import { NextRequest, NextResponse } from 'next/server';
import { backToLobby } from '@/lib/game/gameState';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, playerId } = body;

    const room = backToLobby(roomId, playerId);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error returning to lobby:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Zurückkehren zur Lobby';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
