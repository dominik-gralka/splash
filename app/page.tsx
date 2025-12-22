'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Fingerprint, AlertCircle } from 'lucide-react';

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

      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);
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

      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);
      router.push(`/room/${data.room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-background/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-destructive/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <Fingerprint className="w-20 h-20 text-destructive mb-4 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-destructive/20 blur-xl"></div>
          </div>
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-destructive via-primary to-crew bg-clip-text text-transparent">
            SPLASH
          </h1>
          <p className="text-muted-foreground text-lg">
            Wer ist der Impostor?
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-border/50">
          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Dein Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-foreground placeholder:text-muted-foreground"
                placeholder="Max Mustermann"
                maxLength={20}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Create Room Button */}
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full crew-gradient text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              {loading ? 'Lädt...' : 'Neuen Raum erstellen'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">oder</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-2">
              <label htmlFor="roomId" className="block text-sm font-medium text-foreground">
                Raum-ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition uppercase text-foreground placeholder:text-muted-foreground tracking-widest"
                placeholder="ABC123"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={loading}
              className="w-full bg-background border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Raum beitreten
            </button>
          </div>

          {/* Rules Link */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Neu bei Splash?{' '}
              <button
                onClick={() => alert('Regeln: Crew-Mitglieder bekommen ein Wort, der Impostor nicht. Alle geben Hinweise (1 Wort). Am Ende wird abgestimmt, wer der Impostor ist.')}
                className="text-primary hover:underline font-medium"
              >
                Spielregeln ansehen
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            3-10 Spieler • Private Räume • Mehrere Runden
          </p>
        </div>
      </div>
    </div>
  );
}
