import { NextRequest, NextResponse } from 'next/server';
import { getRoom, removePlayer } from '@/lib/game/gameState';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Raum nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error getting room:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Raums' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Spieler-ID erforderlich' },
        { status: 400 }
      );
    }

    const room = removePlayer(roomId, playerId);

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error removing player:', error);
    return NextResponse.json(
      { error: 'Fehler beim Entfernen des Spielers' },
      { status: 500 }
    );
  }
}
