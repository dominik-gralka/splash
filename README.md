# Splash - Das Impostor-Kartenspiel

Ein Online-Multiplayer-Spiel für 3-10 Spieler, bei dem die Crew versucht, den Impostor zu entlarven.

## Spielregeln

### Ziel
- **Crew**: Den Impostor entlarven
- **Impostor**: Nicht entlarvt werden

### Spielablauf

1. **Lobby**: Spieler treten dem Raum bei und warten auf den Start
2. **Kartenvergabe**:
   - Crew-Mitglieder erhalten ein geheimes Wort
   - Der Impostor erhält kein Wort
3. **Hinweisrunde 1**: Jeder Spieler gibt einen 1-Wort-Hinweis ab
4. **Hinweisrunde 2** (optional): Zweite Runde mit Hinweisen
5. **Diskussion**: Spieler diskutieren, wer der Impostor sein könnte
6. **Abstimmung**: Alle stimmen gleichzeitig ab
7. **Auflösung**:
   - Crew gewinnt, wenn der Impostor eliminiert wurde
   - Impostor gewinnt, wenn jemand anderes eliminiert wurde oder Gleichstand

### Regeln
- Nur ein einzelnes Wort als Hinweis erlaubt
- Keine Synonyme oder Sätze
- Das Wort selbst darf nicht genannt werden
- Bei Gleichstand gewinnt der Impostor

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Sprache**: TypeScript
- **State Management**: In-Memory (serverless-kompatibel)

## Features

- ✅ Private Räume mit 6-stelligen Codes
- ✅ Echtzeit-Updates via Polling
- ✅ Mehrere Runden spielbar
- ✅ Responsive Design
- ✅ Konfigurierbare Spieleinstellungen
- ✅ Rundenhistorie

## Development

```bash
# Installation
npm install

# Development Server starten
npm run dev

# Build für Produktion
npm run build

# Production Server starten
npm start
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000).

## Deployment auf Vercel

1. Repository zu GitHub pushen
2. Bei [Vercel](https://vercel.com) anmelden
3. Neues Projekt erstellen und Repository auswählen
4. Deploy-Button klicken

Vercel erkennt automatisch Next.js und konfiguriert alles richtig.

### Umgebungsvariablen

Keine Umgebungsvariablen erforderlich - die App läuft out-of-the-box.

## Projektstruktur

```
splash/
├── app/
│   ├── api/              # API Routes
│   │   ├── game/         # Game Actions
│   │   └── rooms/        # Room Management
│   ├── room/[roomId]/    # Game Room Pages & Components
│   ├── layout.tsx        # Root Layout
│   └── page.tsx          # Landing Page
├── lib/
│   └── game/             # Game Logic
│       ├── types.ts      # TypeScript Types
│       ├── words.ts      # Wortliste
│       └── gameState.ts  # State Management
└── public/               # Static Assets
```

## API Endpoints

- `POST /api/rooms/create` - Neuen Raum erstellen
- `POST /api/rooms/join` - Raum beitreten
- `GET /api/rooms/[roomId]` - Raum-Status abrufen
- `DELETE /api/rooms/[roomId]` - Raum verlassen
- `POST /api/game/start` - Spiel starten
- `POST /api/game/hint` - Hinweis abgeben
- `POST /api/game/vote` - Abstimmen
- `POST /api/game/advance` - Phase voranschreiten
- `POST /api/game/next-round` - Nächste Runde starten
- `POST /api/game/lobby` - Zurück zur Lobby

## Hinweise

- Räume werden nach 1 Stunde Inaktivität automatisch gelöscht
- Alle Daten werden im Server-Memory gespeichert (kein Persistence)
- Optimiert für Desktop und Mobile

## Lizenz

MIT
