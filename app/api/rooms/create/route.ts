import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/game/gameState';
import { CreateRoomRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomRequest = await request.json();

    if (!body.hostName || body.hostName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name erforderlich' },
        { status: 400 }
      );
    }

    const room = createRoom(body);

    return NextResponse.json({
      room,
      playerId: room.players[0].id,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Raums' },
      { status: 500 }
    );
  }
}
