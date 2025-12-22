import { NextRequest, NextResponse } from 'next/server';
import { submitHint } from '@/lib/game/gameState';
import { SubmitHintRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitHintRequest = await request.json();

    if (!body.hint || body.hint.trim().length === 0) {
      return NextResponse.json(
        { error: 'Hinweis erforderlich' },
        { status: 400 }
      );
    }

    // Nur ein einzelnes Wort erlauben
    const trimmedHint = body.hint.trim();
    if (trimmedHint.split(/\s+/).length > 1) {
      return NextResponse.json(
        { error: 'Nur ein einzelnes Wort erlaubt' },
        { status: 400 }
      );
    }

    const room = submitHint(body.roomId, body.playerId, trimmedHint, body.round);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error submitting hint:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Abgeben des Hinweises';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
