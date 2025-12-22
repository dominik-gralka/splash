import { Room } from '@/lib/game/types';
import { useState } from 'react';
import { Skull, Shield, Eye, ArrowRight } from 'lucide-react';

interface Props {
  room: Room;
  playerId: string;
  isHost: boolean;
  onUpdate: (room: Room) => void;
}

export default function RevealPhase({ room, playerId, isHost }: Props) {
  const [advancing, setAdvancing] = useState(false);

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isImpostor = currentPlayer?.role === 'impostor';

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Runde {room.currentRound?.roundNumber}
        </h2>
        <p className="text-muted-foreground">Schau dir deine Rolle an</p>
      </div>

      {/* Card Display */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl blur-2xl ${
            isImpostor ? 'bg-destructive/50' : 'bg-crew/50'
          } animate-pulse`}></div>

          <div
            className={`relative w-64 h-96 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center p-8 border-2 ${
              isImpostor
                ? 'impostor-gradient border-destructive/50'
                : 'crew-gradient border-crew/50'
            }`}
          >
            <div className="text-white relative">
              {isImpostor ? (
                <>
                  <Skull className="w-24 h-24 mb-6 mx-auto drop-shadow-lg" strokeWidth={1.5} />
                  <h3 className="text-3xl font-bold mb-4 tracking-wider">IMPOSTOR</h3>
                  <div className="space-y-2 text-sm opacity-90">
                    <p className="flex items-center gap-2 justify-center">
                      <Eye className="w-4 h-4" />
                      Du kennst das Wort nicht!
                    </p>
                    <p>Beobachte die anderen</p>
                    <p>Bleib unauffällig</p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="w-24 h-24 mb-6 mx-auto drop-shadow-lg" strokeWidth={1.5} />
                  <h3 className="text-3xl font-bold mb-4 tracking-wider">CREW</h3>
                  <p className="text-sm mb-4 opacity-90">Dein Wort:</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <p className="text-4xl font-bold tracking-wide">{currentPlayer?.word}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-suspicious/20 border border-suspicious/50 rounded-lg p-4 text-center">
        <p className="text-suspicious-foreground font-medium flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          Merke dir deine Rolle! Die Karte wird nicht mehr angezeigt.
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
              Weiter zur Hinweisrunde
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
