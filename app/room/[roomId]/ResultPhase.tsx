import { Room } from '@/lib/game/types';
import { useState } from 'react';
import { Trophy, Skull, Eye, RotateCcw, Home } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Rundenresultat
        </h2>
      </div>

      {/* Result Banner */}
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl blur-2xl ${
          crewWon ? 'bg-crew/50' : 'bg-destructive/50'
        } animate-pulse`}></div>

        <div
          className={`relative rounded-2xl p-8 text-center border-2 ${
            crewWon
              ? 'crew-gradient border-crew/50'
              : 'impostor-gradient border-destructive/50'
          }`}
        >
          <div className="text-white">
            {crewWon ? (
              <Trophy className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
            ) : (
              <Skull className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
            )}
            <h3 className="text-4xl font-bold mb-2 tracking-wider">
              {crewWon ? 'CREW GEWINNT!' : 'IMPOSTOR GEWINNT!'}
            </h3>
            <p className="text-lg opacity-90">
              {eliminatedPlayer
                ? `${eliminatedPlayer.name} wurde eliminiert`
                : 'Gleichstand - niemand wurde eliminiert'}
            </p>
          </div>
        </div>
      </div>

      {/* The Truth */}
      <div className="bg-secondary/50 border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Die Wahrheit
          </h3>
        </div>

        <div className="space-y-3">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <p className="text-primary font-medium mb-2">Das Wort war:</p>
            <p className="text-3xl font-bold text-foreground">
              {currentRound.word}
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium mb-2">
              {impostorPlayers.length > 1 ? 'Die Impostors waren:' : 'Der Impostor war:'}
            </p>
            <p className="text-xl font-bold text-foreground flex items-center justify-center gap-2 flex-wrap">
              {impostorPlayers.map((p, idx) => (
                <span key={p.id} className="inline-flex items-center gap-1">
                  <Skull className="w-4 h-4 text-destructive" />
                  {p.name}{idx < impostorPlayers.length - 1 && ','}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Vote Results */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">Abstimmungsergebnis</h3>
        <div className="space-y-2">
          {room.players.map(player => {
            const votes = voteCounts.get(player.id) || 0;
            const wasEliminated = player.id === currentRound.eliminatedPlayerId;
            const wasImpostor = currentRound.impostorIds.includes(player.id);

            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg border ${
                  wasEliminated
                    ? wasImpostor
                      ? 'bg-crew/10 border-crew'
                      : 'bg-destructive/10 border-destructive'
                    : 'bg-background border-border'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    {wasImpostor && <Skull className="w-4 h-4 text-destructive" />}
                    {player.name}
                    {wasEliminated && ' (Eliminiert)'}
                  </span>
                  <span className="text-muted-foreground">
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
        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">
            Bisherige Runden ({room.rounds.length})
          </h3>
          <div className="space-y-2">
            {room.rounds.map((round, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                <span className="text-muted-foreground">Runde {round.roundNumber}</span>
                <span
                  className={`font-medium ${
                    round.crewWon ? 'text-crew' : 'text-destructive'
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
            className="w-full crew-gradient text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {loading ? 'Lädt...' : 'Nächste Runde starten'}
          </button>

          <button
            onClick={backToLobby}
            disabled={loading}
            className="w-full bg-background border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Zurück zur Lobby
          </button>
        </div>
      )}

      {!isHost && (
        <div className="text-center text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border">
          Warte auf den Host...
        </div>
      )}
    </div>
  );
}
