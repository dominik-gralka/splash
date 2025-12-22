import { NextRequest, NextResponse } from 'next/server';
import { submitVote } from '@/lib/game/gameState';
import { SubmitVoteRequest } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitVoteRequest = await request.json();

    const room = submitVote(body.roomId, body.voterId, body.targetId);

    return NextResponse.json({ room });
  } catch (error: unknown) {
    console.error('Error submitting vote:', error);
    const message = error instanceof Error ? error.message : 'Fehler beim Abstimmen';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
