import { Room } from '@/lib/game/types';
import { useState } from 'react';
import { Settings, Play, Users2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  room: Room;
  playerId: string;
  isHost: boolean;
  onUpdate: (room: Room) => void;
}

export default function LobbyPhase({ room, playerId, isHost }: Props) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const startGame = async () => {
    setStarting(true);
    setError('');

    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Starten');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Starten');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Lobby</h2>
        <p className="text-muted-foreground">
          Warte auf weitere Spieler...
        </p>
      </div>

      {/* Game Settings */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Spieleinstellungen</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              <span>Maximale Spieler:</span>
            </div>
            <span className="font-medium text-foreground">{room.settings.maxPlayers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="ml-6">Anzahl Impostors:</span>
            <span className="font-medium text-destructive">{room.settings.impostorCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="ml-6">Zweite Hinweisrunde:</span>
            <span className="font-medium text-foreground">
              {room.settings.useHint2 ? 'Ja' : 'Nein'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Diskussionszeit:</span>
            </div>
            <span className="font-medium text-foreground">{room.settings.discussionTime}s</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="font-semibold text-primary mb-2">Spielregeln</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Crew-Mitglieder bekommen ein Wort</li>
          <li>Impostors bekommen kein Wort</li>
          <li>Alle geben Hinweise (nur 1 Wort!)</li>
          <li>Nach der Diskussion wird abgestimmt</li>
          <li>Ziel der Crew: Impostor entlarven</li>
          <li>Ziel des Impostors: Nicht entlarvt werden</li>
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Start Button (Host only) */}
      {isHost && (
        <button
          onClick={startGame}
          disabled={starting || room.players.length < 3}
          className="w-full crew-gradient text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {starting
            ? 'Startet...'
            : room.players.length < 3
            ? 'Mindestens 3 Spieler erforderlich'
            : 'Spiel starten'}
        </button>
      )}

      {!isHost && (
        <div className="text-center text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border">
          Warte auf den Host, um das Spiel zu starten...
        </div>
      )}
    </div>
  );
}
