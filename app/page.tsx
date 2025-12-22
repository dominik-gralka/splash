'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createRoom = async () => {
    if (!name.trim()) {
      setError('Bitte gib deinen Namen ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen des Raums');
      }

      // Speichere Spieler-ID im localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);

      // Navigiere zum Raum
      router.push(`/room/${data.room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!name.trim()) {
      setError('Bitte gib deinen Namen ein');
      return;
    }

    if (!roomId.trim()) {
      setError('Bitte gib die Raum-ID ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomId.toUpperCase(),
          playerName: name
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Beitreten');
      }

      // Speichere Spieler-ID im localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);

      // Navigiere zum Raum
      router.push(`/room/${data.room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Splash
          </h1>
          <p className="text-gray-600">
            Das Impostor-Kartenspiel
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Dein Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createRoom()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
              placeholder="Max Mustermann"
              maxLength={20}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Create Room Button */}
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Lädt...' : 'Neuen Raum erstellen'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">oder</span>
            </div>
          </div>

          {/* Join Room */}
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              Raum-ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition uppercase text-gray-800"
              placeholder="ABC123"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            onClick={joinRoom}
            disabled={loading}
            className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Raum beitreten
          </button>
        </div>

        {/* Rules Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Neu bei Splash?{' '}
            <button
              onClick={() => alert('Regeln: Crew-Mitglieder bekommen ein Wort, der Impostor nicht. Alle geben Hinweise (1 Wort). Am Ende wird abgestimmt, wer der Impostor ist.')}
              className="text-purple-600 hover:underline font-medium"
            >
              Spielregeln ansehen
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
