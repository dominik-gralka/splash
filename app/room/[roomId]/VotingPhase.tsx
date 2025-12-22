import { Room, Player } from '@/lib/game/types';
import { useState } from 'react';

interface Props {
  room: Room;
  playerId: string;
  onUpdate: (room: Room) => void;
}

export default function VotingPhase({ room, playerId }: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasVoted = currentPlayer?.hasVoted;

  const submitVote = async () => {
    if (!selectedPlayer) {
      setError('Bitte wähle einen Spieler');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const res = await fetch('/api/game/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          voterId: playerId,
          targetId: selectedPlayer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Abstimmen');
      }

      setSelectedPlayer('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setVoting(false);
    }
  };

  const votedCount = room.players.filter(p => p.hasVoted).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Abstimmung</h2>
        <p className="text-gray-600">Wähle den Impostor</p>
      </div>

      {!hasVoted ? (
        <div className="space-y-4">
          <p className="text-gray-700 text-center">
            Wähle den Spieler, den du für den Impostor hältst:
          </p>

          {/* Player Selection */}
          <div className="grid grid-cols-1 gap-2">
            {room.players.map((player: Player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPlayer === player.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {player.name} {player.isHost && '👑'}
                    {player.id === playerId && ' (Du)'}
                  </span>
                  {selectedPlayer === player.id && (
                    <span className="text-purple-600">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={submitVote}
            disabled={voting || !selectedPlayer}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? 'Stimme ab...' : 'Abstimmen'}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-900 font-medium mb-2">
            ✓ Deine Stimme wurde abgegeben!
          </p>
          <p className="text-green-800 text-sm">
            Warte auf die anderen Spieler...
          </p>
        </div>
      )}

      {/* Vote Progress */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">Fortschritt</span>
          <span className="text-gray-600">
            {votedCount}/{room.players.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${(votedCount / room.players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Waiting For */}
      {votedCount < room.players.length && (
        <div className="text-center text-gray-600 text-sm">
          Warte auf:{' '}
          {room.players
            .filter(p => !p.hasVoted)
            .map(p => p.name)
            .join(', ')}
        </div>
      )}
    </div>
  );
}
