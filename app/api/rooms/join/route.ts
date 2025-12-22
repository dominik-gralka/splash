import { NextRequest, NextResponse } from 'next/server';
import { joinRoom } from '@/lib/game/gameState';
import { JoinRoomRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: JoinRoomRequest = await request.json();

    if (!body.roomId || !body.playerName || body.playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Raum-ID und Name erforderlich' },
        { status: 400 }
      );
    }

    const result = joinRoom(body.roomId, body.playerName);

    if (!result) {
      return NextResponse.json(
        { error: 'Raum nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      room: result.room,
      playerId: result.playerId,
    });
  } catch (error: unknown) {
    console.error('Error joining room:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Beitreten';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
