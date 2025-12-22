import { Room, Player, GameRound, CreateRoomRequest, Hint, Vote } from './types';
import { getRandomWord } from './words';

// In-Memory Storage für Räume
// WICHTIG: In serverless Umgebungen (Vercel) wird dieser State bei jedem Cold Start zurückgesetzt!
// Für Production empfohlen: Vercel KV oder eine Datenbank verwenden
// Für self-hosted: `next start` verwenden (kein serverless)
let rooms: Map<string, Room>;

// Singleton Pattern - verhindert multiple Instanzen
if (typeof global !== 'undefined') {
  // @ts-ignore - global augmentation
  if (!global.__gameRooms) {
    // @ts-ignore
    global.__gameRooms = new Map<string, Room>();
  }
  // @ts-ignore
  rooms = global.__gameRooms;
} else {
  rooms = new Map<string, Room>();
}

// Debugging: Logge State-Änderungen
if (process.env.NODE_ENV === 'development') {
  console.log(`[GameState] Initialized with ${rooms.size} rooms`);
}

// Hilfsfunktion: Generiere Raum-ID
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Hilfsfunktion: Generiere Spieler-ID
function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Hilfsfunktion: Wähle zufällige Impostors
function selectImpostors(players: Player[], count: number): string[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(p => p.id);
}

// Raum erstellen
export function createRoom(request: CreateRoomRequest): Room {
  const roomId = generateRoomId();
  const playerId = generatePlayerId();

  const room: Room = {
    id: roomId,
    hostId: playerId,
    players: [{
      id: playerId,
      name: request.hostName,
      isHost: true,
    }],
    phase: 'lobby',
    rounds: [],
    settings: {
      maxPlayers: request.maxPlayers || 10,
      impostorCount: request.impostorCount || 1,
      useHint2: request.useHint2 ?? true,
      discussionTime: request.discussionTime || 60,
    },
    createdAt: Date.now(),
  };

  rooms.set(roomId, room);
  return room;
}

// Raum abrufen
export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

// Spieler beitreten
export function joinRoom(roomId: string, playerName: string): { room: Room; playerId: string } | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  if (room.phase !== 'lobby') {
    throw new Error('Spiel hat bereits begonnen');
  }

  if (room.players.length >= room.settings.maxPlayers) {
    throw new Error('Raum ist voll');
  }

  const playerId = generatePlayerId();
  const player: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
  };

  room.players.push(player);
  return { room, playerId };
}

// Spieler entfernen
export function removePlayer(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.players = room.players.filter(p => p.id !== playerId);

  // Wenn Raum leer ist, lösche ihn
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }

  // Wenn Host geht, neuen Host bestimmen
  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  return room;
}

// Spiel starten
export function startGame(roomId: string, playerId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');

  if (room.hostId !== playerId) {
    throw new Error('Nur der Host kann das Spiel starten');
  }

  if (room.players.length < 3) {
    throw new Error('Mindestens 3 Spieler erforderlich');
  }

  // Neue Runde starten
  startNewRound(room);

  return room;
}

// Neue Runde starten
function startNewRound(room: Room): void {
  const word = getRandomWord();
  const impostorIds = selectImpostors(room.players, room.settings.impostorCount);

  // Rollen zuweisen
  room.players.forEach(player => {
    player.role = impostorIds.includes(player.id) ? 'impostor' : 'crew';
    player.word = player.role === 'crew' ? word : undefined;
    player.hasSubmittedHint1 = false;
    player.hasSubmittedHint2 = false;
    player.hasVoted = false;
  });

  const round: GameRound = {
    roundNumber: room.rounds.length + 1,
    word,
    impostorIds,
    hints1: [],
    hints2: [],
    votes: [],
  };

  room.currentRound = round;
  room.phase = 'reveal';
}

// Hinweis abgeben
export function submitHint(
  roomId: string,
  playerId: string,
  hint: string,
  roundNum: 1 | 2
): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');
  if (!room.currentRound) throw new Error('Keine aktive Runde');

  const expectedPhase = roundNum === 1 ? 'hint1' : 'hint2';
  if (room.phase !== expectedPhase) {
    throw new Error(`Falsche Phase: erwartet ${expectedPhase}, ist ${room.phase}`);
  }

  const player = room.players.find(p => p.id === playerId);
  if (!player) throw new Error('Spieler nicht gefunden');

  const hintObj: Hint = {
    playerId,
    playerName: player.name,
    hint: hint.trim(),
  };

  if (roundNum === 1) {
    if (player.hasSubmittedHint1) {
      throw new Error('Hinweis bereits abgegeben');
    }
    room.currentRound.hints1.push(hintObj);
    player.hasSubmittedHint1 = true;
  } else {
    if (player.hasSubmittedHint2) {
      throw new Error('Hinweis bereits abgegeben');
    }
    room.currentRound.hints2.push(hintObj);
    player.hasSubmittedHint2 = true;
  }

  // Prüfen ob alle Hinweise abgegeben wurden
  checkHintPhaseComplete(room, roundNum);

  return room;
}

function checkHintPhaseComplete(room: Room, roundNum: 1 | 2): void {
  const allSubmitted = room.players.every(p =>
    roundNum === 1 ? p.hasSubmittedHint1 : p.hasSubmittedHint2
  );

  if (allSubmitted) {
    if (roundNum === 1 && room.settings.useHint2) {
      room.phase = 'hint2';
    } else {
      room.phase = 'discussion';
    }
  }
}

// Phase manuell wechseln
export function advancePhase(roomId: string, playerId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');

  if (room.hostId !== playerId) {
    throw new Error('Nur der Host kann die Phase wechseln');
  }

  switch (room.phase) {
    case 'reveal':
      room.phase = 'hint1';
      break;
    case 'hint1':
      room.phase = room.settings.useHint2 ? 'hint2' : 'discussion';
      break;
    case 'hint2':
      room.phase = 'discussion';
      break;
    case 'discussion':
      room.phase = 'voting';
      break;
    case 'voting':
      // Kann nicht manuell gewechselt werden
      break;
  }

  return room;
}

// Abstimmung abgeben
export function submitVote(roomId: string, voterId: string, targetId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');
  if (!room.currentRound) throw new Error('Keine aktive Runde');

  if (room.phase !== 'voting') {
    throw new Error('Nicht in der Abstimmungsphase');
  }

  const voter = room.players.find(p => p.id === voterId);
  if (!voter) throw new Error('Spieler nicht gefunden');
  if (voter.hasVoted) throw new Error('Bereits abgestimmt');

  const target = room.players.find(p => p.id === targetId);
  if (!target) throw new Error('Ziel-Spieler nicht gefunden');

  room.currentRound.votes.push({ voterId, targetId });
  voter.hasVoted = true;

  // Prüfen ob alle abgestimmt haben
  if (room.players.every(p => p.hasVoted)) {
    evaluateVotes(room);
  }

  return room;
}

function evaluateVotes(room: Room): void {
  if (!room.currentRound) return;

  // Stimmen zählen
  const voteCounts = new Map<string, number>();
  room.currentRound.votes.forEach(vote => {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
  });

  // Höchste Stimmzahl finden
  let maxVotes = 0;
  let eliminatedId: string | undefined;
  let tieCount = 0;

  voteCounts.forEach((count, playerId) => {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedId = playerId;
      tieCount = 1;
    } else if (count === maxVotes) {
      tieCount++;
    }
  });

  // Bei Gleichstand: Impostor gewinnt
  if (tieCount > 1) {
    room.currentRound.crewWon = false;
    room.currentRound.eliminatedPlayerId = undefined;
  } else if (eliminatedId) {
    room.currentRound.eliminatedPlayerId = eliminatedId;

    // War es ein Impostor?
    const wasImpostor = room.currentRound.impostorIds.includes(eliminatedId);
    room.currentRound.crewWon = wasImpostor;
  }

  room.phase = 'result';
}

// Nächste Runde starten
export function nextRound(roomId: string, playerId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');

  if (room.hostId !== playerId) {
    throw new Error('Nur der Host kann die nächste Runde starten');
  }

  if (room.phase !== 'result') {
    throw new Error('Nicht in der Ergebnisphase');
  }

  // Aktuelle Runde zu Historie hinzufügen
  if (room.currentRound) {
    room.rounds.push(room.currentRound);
  }

  // Neue Runde starten
  startNewRound(room);

  return room;
}

// Zurück zur Lobby
export function backToLobby(roomId: string, playerId: string): Room {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Raum nicht gefunden');

  if (room.hostId !== playerId) {
    throw new Error('Nur der Host kann zur Lobby zurückkehren');
  }

  room.phase = 'lobby';
  room.currentRound = undefined;

  // Spieler-Rollen zurücksetzen
  room.players.forEach(p => {
    p.role = undefined;
    p.word = undefined;
    p.hasSubmittedHint1 = false;
    p.hasSubmittedHint2 = false;
    p.hasVoted = false;
  });

  return room;
}

// Alte Räume aufräumen (alle 1 Stunde)
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 Stunde

  for (const [roomId, room] of rooms.entries()) {
    if (now - room.createdAt > maxAge) {
      rooms.delete(roomId);
    }
  }
}, 15 * 60 * 1000); // Alle 15 Minuten prüfen
