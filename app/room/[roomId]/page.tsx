'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Room, Player } from '@/lib/game/types';

// Phase Components
import LobbyPhase from './LobbyPhase';
import RevealPhase from './RevealPhase';
import HintPhase from './HintPhase';
import DiscussionPhase from './DiscussionPhase';
import VotingPhase from './VotingPhase';
import ResultPhase from './ResultPhase';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Polling für Updates
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      router.push('/');
      return;
    }
    setPlayerId(storedPlayerId);

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Raum nicht gefunden');
        }

        setRoom(data.room);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1000); // Update jede Sekunde

    return () => clearInterval(interval);
  }, [roomId, router]);

  const leaveRoom = async () => {
    try {
      await fetch(`/api/rooms/${roomId}?playerId=${playerId}`, {
        method: 'DELETE',
      });
      router.push('/');
    } catch (err) {
      console.error('Error leaving room:', err);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-xl mb-4">{error || 'Raum nicht gefunden'}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Splash
              </h1>
              <p className="text-gray-600 text-sm mt-1">Raum: {roomId}</p>
            </div>
            <button
              onClick={leaveRoom}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
            >
              Verlassen
            </button>
          </div>

          {/* Players List */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Spieler ({room.players.length}/{room.settings.maxPlayers})
            </p>
            <div className="flex flex-wrap gap-2">
              {room.players.map((player: Player) => (
                <div
                  key={player.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    player.id === playerId
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {player.name} {player.isHost && '👑'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6">
          {room.phase === 'lobby' && (
            <LobbyPhase
              room={room}
              playerId={playerId}
              isHost={isHost}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'reveal' && (
            <RevealPhase
              room={room}
              playerId={playerId}
              isHost={isHost}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'hint1' && (
            <HintPhase
              room={room}
              playerId={playerId}
              roundNum={1}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'hint2' && (
            <HintPhase
              room={room}
              playerId={playerId}
              roundNum={2}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'discussion' && (
            <DiscussionPhase
              room={room}
              playerId={playerId}
              isHost={isHost}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'voting' && (
            <VotingPhase
              room={room}
              playerId={playerId}
              onUpdate={setRoom}
            />
          )}

          {room.phase === 'result' && (
            <ResultPhase
              room={room}
              playerId={playerId}
              isHost={isHost}
              onUpdate={setRoom}
            />
          )}
        </div>
      </div>
    </div>
  );
}
