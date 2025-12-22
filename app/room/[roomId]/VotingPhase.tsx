import { Room, Player } from '@/lib/game/types';
import { useState } from 'react';
import { Vote, CheckCircle2, AlertCircle, Users } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Vote className="w-6 h-6" />
          Abstimmung
        </h2>
        <p className="text-muted-foreground">Wähle den Impostor</p>
      </div>

      {!hasVoted ? (
        <div className="space-y-4">
          <p className="text-foreground text-center font-medium">
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
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border bg-secondary/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {player.name} {player.isHost && '👑'}
                    {player.id === playerId && ' (Du)'}
                  </span>
                  {selectedPlayer === player.id && (
                    <CheckCircle2 className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={submitVote}
            disabled={voting || !selectedPlayer}
            className="w-full impostor-gradient text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Vote className="w-5 h-5" />
            {voting ? 'Stimme ab...' : 'Abstimmen'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-crew/20 border border-crew/50 text-crew-foreground px-4 py-3 rounded-lg">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Deine Stimme wurde abgegeben!</p>
            <p className="text-sm opacity-90">Warte auf die anderen Spieler...</p>
          </div>
        </div>
      )}

      {/* Vote Progress */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Fortschritt</span>
          </div>
          <span className="text-muted-foreground">
            {votedCount}/{room.players.length}
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-crew h-2 rounded-full transition-all"
            style={{ width: `${(votedCount / room.players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Waiting For */}
      {votedCount < room.players.length && (
        <div className="text-center text-muted-foreground text-sm bg-secondary/30 rounded-lg p-3 border border-border">
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
