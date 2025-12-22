import { Room } from '@/lib/game/types';
import { useState } from 'react';

interface Props {
  room: Room;
  playerId: string;
  roundNum: 1 | 2;
  onUpdate: (room: Room) => void;
}

export default function HintPhase({ room, playerId, roundNum }: Props) {
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasSubmitted = roundNum === 1
    ? currentPlayer?.hasSubmittedHint1
    : currentPlayer?.hasSubmittedHint2;

  const hints = roundNum === 1
    ? room.currentRound?.hints1 || []
    : room.currentRound?.hints2 || [];

  const submitHint = async () => {
    if (!hint.trim()) {
      setError('Bitte gib einen Hinweis ein');
      return;
    }

    if (hint.trim().split(/\s+/).length > 1) {
      setError('Nur ein einzelnes Wort erlaubt!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          playerId,
          hint: hint.trim(),
          round: roundNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Abgeben');
      }

      setHint('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  const waitingFor = room.players.filter(p =>
    roundNum === 1 ? !p.hasSubmittedHint1 : !p.hasSubmittedHint2
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Hinweisrunde {roundNum}
        </h2>
        <p className="text-gray-600">
          Gib einen Hinweis ab (nur 1 Wort!)
        </p>
      </div>

      {/* Word Reminder (only for crew) */}
      {currentPlayer?.role === 'crew' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-900">
            Dein Wort: <span className="font-bold text-xl">{currentPlayer.word}</span>
          </p>
        </div>
      )}

      {currentPlayer?.role === 'impostor' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-900 font-medium">
            Du bist der Impostor! Versuche nicht aufzufallen.
          </p>
        </div>
      )}

      {/* Hint Input */}
      {!hasSubmitted ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dein Hinweis
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitHint()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
              placeholder="z.B. Sommer"
              maxLength={30}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nur ein einzelnes Wort! Keine Sätze oder Synonyme.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={submitHint}
            disabled={submitting || !hint.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Wird abgegeben...' : 'Hinweis abgeben'}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-900 font-medium">
            ✓ Dein Hinweis wurde abgegeben!
          </p>
        </div>
      )}

      {/* Submitted Hints */}
      {hints.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            Abgegebene Hinweise ({hints.length}/{room.players.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {hints.map((h, idx) => (
              <div
                key={idx}
                className="bg-gray-100 rounded-lg p-3 text-center"
              >
                <p className="text-sm text-gray-600">{h.playerName}</p>
                <p className="font-bold text-gray-800 text-lg">{h.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting For */}
      {waitingFor.length > 0 && (
        <div className="text-center text-gray-600 text-sm">
          Warte auf: {waitingFor.map(p => p.name).join(', ')}
        </div>
      )}
    </div>
  );
}
