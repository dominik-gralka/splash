import { NextRequest, NextResponse } from 'next/server';
import { Room } from '@/lib/game/types';

// In-Memory Storage - shared across all API routes via global
let rooms: Map<string, Room>;

if (typeof global !== 'undefined') {
  // @ts-ignore
  if (!global.__gameRooms) {
    // @ts-ignore
    global.__gameRooms = new Map<string, Room>();
  }
  // @ts-ignore
  rooms = global.__gameRooms;
} else {
  rooms = new Map<string, Room>();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { room, playerId } = body;

    if (!room || !playerId) {
      return NextResponse.json(
        { error: 'Room und PlayerId erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob der Spieler der Host ist
    const player = room.players.find((p: { id: string }) => p.id === playerId);
    if (!player || !player.isHost) {
      return NextResponse.json(
        { error: 'Nur der Host kann den State synchronisieren' },
        { status: 403 }
      );
    }

    // Validiere Room-Struktur
    if (!room.id || room.id !== roomId) {
      return NextResponse.json(
        { error: 'Ungültige Room-ID' },
        { status: 400 }
      );
    }

    // Speichere/Update Room
    rooms.set(roomId, room);

    console.log(`[Sync] Room ${roomId} synchronized by host ${playerId}`);

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Error syncing room:', error);
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren' },
      { status: 500 }
    );
  }
}
