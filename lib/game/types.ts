// Game Types
export type GamePhase =
  | 'lobby'           // Warten auf Spieler
  | 'reveal'          // Karten werden angezeigt
  | 'hint1'           // Erste Hinweisrunde
  | 'hint2'           // Zweite Hinweisrunde (optional)
  | 'discussion'      // Diskussionsphase
  | 'voting'          // Abstimmung
  | 'result';         // Rundenresultat

export type PlayerRole = 'crew' | 'impostor';

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  word?: string;
  isHost: boolean;
  hasSubmittedHint1?: boolean;
  hasSubmittedHint2?: boolean;
  hasVoted?: boolean;
}

export interface Hint {
  playerId: string;
  playerName: string;
  hint: string;
}

export interface Vote {
  voterId: string;
  targetId: string;
}

export interface GameRound {
  roundNumber: number;
  word: string;
  impostorIds: string[];
  hints1: Hint[];
  hints2: Hint[];
  votes: Vote[];
  eliminatedPlayerId?: string;
  crewWon?: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  currentRound?: GameRound;
  rounds: GameRound[];
  settings: {
    maxPlayers: number;
    impostorCount: number;
    useHint2: boolean;
    discussionTime: number; // Sekunden
  };
  createdAt: number;
}

export interface CreateRoomRequest {
  hostName: string;
  maxPlayers?: number;
  impostorCount?: number;
  useHint2?: boolean;
  discussionTime?: number;
}

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface SubmitHintRequest {
  roomId: string;
  playerId: string;
  hint: string;
  round: 1 | 2;
}

export interface SubmitVoteRequest {
  roomId: string;
  voterId: string;
  targetId: string;
}

export interface StartGameRequest {
  roomId: string;
  playerId: string;
}

export interface NextRoundRequest {
  roomId: string;
  playerId: string;
}
