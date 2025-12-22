import { Room } from '@/lib/game/types';
import { useState, useEffect } from 'react';
import { MessageCircle, Timer, ArrowRight } from 'lucide-react';

interface Props {
  room: Room;
  playerId: string;
  isHost: boolean;
  onUpdate: (room: Room) => void;
}

export default function DiscussionPhase({ room, playerId, isHost }: Props) {
  const [timeLeft, setTimeLeft] = useState(room.settings.discussionTime);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const advance = async () => {
    setAdvancing(true);
    try {
      await fetch('/api/game/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId }),
      });
    } catch (err) {
      console.error('Error advancing:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const hints1 = room.currentRound?.hints1 || [];
  const hints2 = room.currentRound?.hints2 || [];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Diskussion
        </h2>
        <p className="text-muted-foreground">Besprecht die Hinweise</p>
      </div>

      {/* Timer */}
      <div className="relative">
        <div className={`rounded-lg p-6 text-center border ${
          timeLeft > 30
            ? 'bg-primary/10 border-primary/50'
            : 'bg-destructive/10 border-destructive/50'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Verbleibende Zeit</p>
          </div>
          <p className={`text-6xl font-bold ${
            timeLeft > 30 ? 'text-foreground' : 'text-destructive'
          }`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* All Hints */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-3">Hinweise Runde 1</h3>
          <div className="grid grid-cols-2 gap-2">
            {hints1.map((h, idx) => (
              <div
                key={idx}
                className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">{h.playerName}</p>
                <p className="font-bold text-primary text-lg">{h.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {hints2.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Hinweise Runde 2</h3>
            <div className="grid grid-cols-2 gap-2">
              {hints2.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-crew/10 border border-crew/30 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">{h.playerName}</p>
                  <p className="font-bold text-crew text-lg">{h.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-suspicious/20 border border-suspicious/50 rounded-lg p-4 text-center">
        <p className="text-suspicious-foreground">
          Diskutiert, wer der Impostor sein könnte!
          <br />
          Achtet auf unpassende oder vage Hinweise.
        </p>
      </div>

      {/* Continue Button */}
      {isHost && (
        <button
          onClick={advance}
          disabled={advancing}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {advancing ? 'Lädt...' : (
            <>
              Zur Abstimmung
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      )}

      {!isHost && (
        <div className="text-center text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border">
          Warte auf den Host...
        </div>
      )}
    </div>
  );
}
