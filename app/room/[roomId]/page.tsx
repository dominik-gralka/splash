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
  const [reconnecting, setReconnecting] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [sseEventCount, setSseEventCount] = useState(0);

  // Host speichert Room-State im localStorage (nur als Backup für Recovery)
  useEffect(() => {
    if (room && playerId) {
      const currentPlayer = room.players.find(p => p.id === playerId);
      if (currentPlayer?.isHost) {
        localStorage.setItem(`room_${roomId}`, JSON.stringify(room));
      }
    }
  }, [room, playerId, roomId]);

  // SSE Connection for real-time updates
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      router.push('/');
      return;
    }
    setPlayerId(storedPlayerId);

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      // Create SSE connection
      console.log(`[SSE Client] Connecting to room ${roomId}`);
      eventSource = new EventSource(`/api/rooms/${roomId}/events`);

      eventSource.onopen = () => {
        console.log(`[SSE Client] Connection opened for room ${roomId}`);
        setSseConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const updatedRoom: Room = JSON.parse(event.data);
          console.log(`[SSE Client] Received update for room ${roomId}, phase: ${updatedRoom.phase}, players: ${updatedRoom.players.length}`);
          setSseEventCount(prev => prev + 1);
          setRoom(updatedRoom);
          setError('');
          setReconnecting(false);
          setLoading(false);
        } catch (err) {
          console.error('[SSE Client] Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = async () => {
        console.log(`[SSE Client] Connection error for room ${roomId}`);
        setSseConnected(false);
        eventSource?.close();

        // Try to recover from localStorage if host
        const storedRoom = localStorage.getItem(`room_${roomId}`);
        if (storedRoom) {
          try {
            const parsedRoom: Room = JSON.parse(storedRoom);
            const isHost = parsedRoom.players.some(
              p => p.id === storedPlayerId && p.isHost
            );

            if (isHost) {
              setReconnecting(true);
              // Sync state to server
              const syncRes = await fetch(`/api/rooms/${roomId}/sync`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room: parsedRoom, playerId: storedPlayerId }),
              });

              if (syncRes.ok) {
                setRoom(parsedRoom);
                setError('');
                setReconnecting(false);
              }
            } else {
              setError('Warte auf Host...');
              setReconnecting(true);
            }
          } catch (err) {
            console.error('Recovery error:', err);
            setError('Verbindungsfehler');
          }
        } else {
          setError('Warte auf Host...');
          setReconnecting(true);
        }

        // Reconnect after 2 seconds
        reconnectTimeout = setTimeout(connect, 2000);
      };
    };

    // Initial connection
    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-foreground text-xl">Lädt...</div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    // Wenn wir reconnecten, zeige einen anderen Screen
    if (reconnecting && error === 'Warte auf Host...') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="glass rounded-2xl shadow-2xl p-8 max-w-md w-full text-center backdrop-blur-xl border border-border/50">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-suspicious text-xl mb-4">{error}</div>
            <p className="text-muted-foreground mb-4">
              Der Raum wird vom Host wiederhergestellt...
            </p>
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 transition"
            >
              Abbrechen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl shadow-2xl p-8 max-w-md w-full text-center backdrop-blur-xl border border-border/50">
          <div className="text-destructive text-xl mb-4">{error || 'Raum nicht gefunden'}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-t-2xl shadow-2xl p-6 border border-border/50 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive via-primary to-crew bg-clip-text text-transparent">
                SPLASH
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Raum: <span className="text-foreground font-mono tracking-wider">{roomId}</span></p>
              <div className="flex items-center gap-3 mt-1">
                {isHost && (
                  <p className="text-xs text-crew flex items-center gap-1">
                    <span className="w-2 h-2 bg-crew rounded-full animate-pulse"></span>
                    Host
                  </p>
                )}
                <p className={`text-xs flex items-center gap-1 ${sseConnected ? 'text-green-500' : 'text-red-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  SSE: {sseConnected ? 'Connected' : 'Disconnected'} ({sseEventCount} events)
                </p>
              </div>
            </div>
            <button
              onClick={leaveRoom}
              className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/30 transition text-sm"
            >
              Verlassen
            </button>
          </div>

          {/* Players List */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm font-medium text-foreground mb-2">
              Spieler ({room.players.length}/{room.settings.maxPlayers})
            </p>
            <div className="flex flex-wrap gap-2">
              {room.players.map((player: Player) => (
                <div
                  key={player.id}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    player.id === playerId
                      ? 'bg-primary/20 text-primary border-primary'
                      : 'bg-secondary text-secondary-foreground border-border'
                  }`}
                >
                  {player.name} {player.isHost && '👑'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="glass rounded-b-2xl shadow-2xl p-6 border border-border/50 border-t-0 backdrop-blur-xl">
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
