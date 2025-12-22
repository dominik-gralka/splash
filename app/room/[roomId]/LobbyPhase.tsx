import { Room } from '@/lib/game/types';
import { useState } from 'react';

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lobby</h2>
        <p className="text-gray-600">
          Warte auf weitere Spieler...
        </p>
      </div>

      {/* Game Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Spieleinstellungen</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Maximale Spieler:</span>
            <span className="font-medium">{room.settings.maxPlayers}</span>
          </div>
          <div className="flex justify-between">
            <span>Anzahl Impostors:</span>
            <span className="font-medium">{room.settings.impostorCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Zweite Hinweisrunde:</span>
            <span className="font-medium">
              {room.settings.useHint2 ? 'Ja' : 'Nein'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Diskussionszeit:</span>
            <span className="font-medium">{room.settings.discussionTime}s</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Spielregeln</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Start Button (Host only) */}
      {isHost && (
        <button
          onClick={startGame}
          disabled={starting || room.players.length < 3}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {starting
            ? 'Startet...'
            : room.players.length < 3
            ? 'Mindestens 3 Spieler erforderlich'
            : 'Spiel starten'}
        </button>
      )}

      {!isHost && (
        <div className="text-center text-gray-600">
          Warte auf den Host, um das Spiel zu starten...
        </div>
      )}
    </div>
  );
}
