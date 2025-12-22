import { Room } from '@/lib/game/types';
import { useState } from 'react';

interface Props {
  room: Room;
  playerId: string;
  isHost: boolean;
  onUpdate: (room: Room) => void;
}

export default function ResultPhase({ room, playerId, isHost }: Props) {
  const [loading, setLoading] = useState(false);

  const currentRound = room.currentRound;
  if (!currentRound) return null;

  const crewWon = currentRound.crewWon;
  const eliminatedPlayer = room.players.find(
    p => p.id === currentRound.eliminatedPlayerId
  );

  const impostorPlayers = room.players.filter(p =>
    currentRound.impostorIds.includes(p.id)
  );

  const nextRound = async () => {
    setLoading(true);
    try {
      await fetch('/api/game/next-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId }),
      });
    } catch (err) {
      console.error('Error starting next round:', err);
    } finally {
      setLoading(false);
    }
  };

  const backToLobby = async () => {
    setLoading(true);
    try {
      await fetch('/api/game/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId }),
      });
    } catch (err) {
      console.error('Error returning to lobby:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stimmen zählen
  const voteCounts = new Map<string, number>();
  currentRound.votes.forEach(vote => {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Rundenresultat
        </h2>
      </div>

      {/* Result Banner */}
      <div
        className={`rounded-2xl p-8 text-center ${
          crewWon
            ? 'bg-gradient-to-br from-green-400 to-blue-500'
            : 'bg-gradient-to-br from-red-400 to-orange-500'
        }`}
      >
        <div className="text-6xl mb-4">{crewWon ? '✓' : '✗'}</div>
        <h3 className="text-3xl font-bold text-white mb-2">
          {crewWon ? 'Crew gewinnt!' : 'Impostor gewinnt!'}
        </h3>
        <p className="text-white text-lg">
          {eliminatedPlayer
            ? `${eliminatedPlayer.name} wurde eliminiert`
            : 'Gleichstand - niemand wurde eliminiert'}
        </p>
      </div>

      {/* The Truth */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">
          Die Wahrheit
        </h3>

        <div className="space-y-3">
          <div className="bg-blue-100 rounded-lg p-4">
            <p className="text-blue-900 font-medium mb-2">Das Wort war:</p>
            <p className="text-3xl font-bold text-blue-800 text-center">
              {currentRound.word}
            </p>
          </div>

          <div className="bg-red-100 rounded-lg p-4">
            <p className="text-red-900 font-medium mb-2">
              {impostorPlayers.length > 1 ? 'Die Impostors waren:' : 'Der Impostor war:'}
            </p>
            <p className="text-xl font-bold text-red-800 text-center">
              {impostorPlayers.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Vote Results */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Abstimmungsergebnis</h3>
        <div className="space-y-2">
          {room.players.map(player => {
            const votes = voteCounts.get(player.id) || 0;
            const wasEliminated = player.id === currentRound.eliminatedPlayerId;
            const wasImpostor = currentRound.impostorIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg ${
                  wasEliminated
                    ? wasImpostor
                      ? 'bg-green-100 border-2 border-green-400'
                      : 'bg-red-100 border-2 border-red-400'
                    : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {player.name}
                    {wasImpostor && ' 🎭'}
                    {wasEliminated && ' (Eliminiert)'}
                  </span>
                  <span className="text-gray-600">
                    {votes} {votes === 1 ? 'Stimme' : 'Stimmen'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Round History */}
      {room.rounds.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            Bisherige Runden ({room.rounds.length})
          </h3>
          <div className="space-y-2">
            {room.rounds.map((round, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Runde {round.roundNumber}</span>
                <span
                  className={`font-medium ${
                    round.crewWon ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {round.crewWon ? 'Crew' : 'Impostor'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isHost && (
        <div className="space-y-3">
          <button
            onClick={nextRound}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Lädt...' : 'Nächste Runde starten'}
          </button>

          <button
            onClick={backToLobby}
            disabled={loading}
            className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            Zurück zur Lobby
          </button>
        </div>
      )}

      {!isHost && (
        <div className="text-center text-gray-600">
          Warte auf den Host...
        </div>
      )}
    </div>
  );
}
