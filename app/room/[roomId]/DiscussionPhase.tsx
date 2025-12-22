import { Room } from '@/lib/game/types';
import { useState, useEffect } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Diskussion</h2>
        <p className="text-gray-600">Besprecht die Hinweise</p>
      </div>

      {/* Timer */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-center">
        <p className="text-white text-sm mb-2">Verbleibende Zeit</p>
        <p className="text-white text-6xl font-bold">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
      </div>

      {/* All Hints */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Hinweise Runde 1</h3>
          <div className="grid grid-cols-2 gap-2">
            {hints1.map((h, idx) => (
              <div
                key={idx}
                className="bg-blue-100 rounded-lg p-3 text-center"
              >
                <p className="text-sm text-blue-600">{h.playerName}</p>
                <p className="font-bold text-blue-800 text-lg">{h.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {hints2.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Hinweise Runde 2</h3>
            <div className="grid grid-cols-2 gap-2">
              {hints2.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-purple-100 rounded-lg p-3 text-center"
                >
                  <p className="text-sm text-purple-600">{h.playerName}</p>
                  <p className="font-bold text-purple-800 text-lg">{h.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-900 text-center">
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
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
        >
          {advancing ? 'Lädt...' : 'Zur Abstimmung'}
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
