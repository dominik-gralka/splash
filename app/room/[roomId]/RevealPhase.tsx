import { Room } from '@/lib/game/types';
import { useState } from 'react';

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Runde {room.currentRound?.roundNumber}
        </h2>
        <p className="text-gray-600">Schau dir deine Rolle an</p>
      </div>

      {/* Card Display */}
      <div className="flex justify-center">
        <div
          className={`w-64 h-96 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center p-8 ${
            isImpostor
              ? 'bg-gradient-to-br from-red-500 to-orange-500'
              : 'bg-gradient-to-br from-green-500 to-blue-500'
          }`}
        >
          <div className="text-white">
            {isImpostor ? (
              <>
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-3xl font-bold mb-2">IMPOSTOR</h3>
                <p className="text-lg opacity-90">
                  Du kennst das Wort nicht!
                  <br />
                  Versuche nicht aufzufallen.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-3xl font-bold mb-2">CREW</h3>
                <p className="text-lg mb-4 opacity-90">Dein Wort ist:</p>
                <p className="text-4xl font-bold">{currentPlayer?.word}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-900 font-medium">
          Merke dir deine Rolle! Die Karte wird nicht mehr angezeigt.
        </p>
      </div>

      {/* Continue Button */}
      {isHost && (
        <button
          onClick={advance}
          disabled={advancing}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
        >
          {advancing ? 'Lädt...' : 'Weiter zur Hinweisrunde'}
        </button>
      )}

      {!isHost && (
        <div className="text-center text-gray-600">
          Warte auf den Host...
        </div>
      )}
    </div>
  );
}
