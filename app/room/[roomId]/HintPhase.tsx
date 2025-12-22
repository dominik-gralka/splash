import { Room } from '@/lib/game/types';
import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Hinweisrunde {roundNum}
        </h2>
        <p className="text-muted-foreground">
          Gib einen Hinweis ab (nur 1 Wort!)
        </p>
      </div>

      {/* Word Reminder (only for crew) */}
      {currentPlayer?.role === 'crew' && (
        <div className="crew-gradient text-white rounded-lg p-4 text-center border border-crew/50">
          <p className="text-sm opacity-90 mb-1">Dein Wort:</p>
          <p className="text-3xl font-bold tracking-wide">{currentPlayer.word}</p>
        </div>
      )}

      {currentPlayer?.role === 'impostor' && (
        <div className="impostor-gradient text-white rounded-lg p-4 text-center border border-destructive/50">
          <div className="flex items-center justify-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5" />
            Du bist der Impostor! Versuche nicht aufzufallen.
          </div>
        </div>
      )}

      {/* Hint Input */}
      {!hasSubmitted ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Dein Hinweis
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitHint()}
                className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-foreground placeholder:text-muted-foreground"
                placeholder="z.B. Sommer"
                maxLength={30}
                disabled={submitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nur ein einzelnes Wort! Keine Sätze oder Synonyme.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={submitHint}
            disabled={submitting || !hint.trim()}
            className="w-full crew-gradient text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Wird abgegeben...' : 'Hinweis abgeben'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-crew/20 border border-crew/50 text-crew-foreground px-4 py-3 rounded-lg">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Dein Hinweis wurde abgegeben!</span>
        </div>
      )}

      {/* Submitted Hints */}
      {hints.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Abgegebene Hinweise ({hints.length}/{room.players.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {hints.map((h, idx) => (
              <div
                key={idx}
                className="bg-secondary/50 border border-border rounded-lg p-3 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">{h.playerName}</p>
                <p className="font-bold text-foreground text-lg">{h.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting For */}
      {waitingFor.length > 0 && (
        <div className="text-center text-muted-foreground text-sm bg-secondary/30 rounded-lg p-3 border border-border">
          Warte auf: {waitingFor.map(p => p.name).join(', ')}
        </div>
      )}
    </div>
  );
}
