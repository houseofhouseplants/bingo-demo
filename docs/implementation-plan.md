# Meeting Bingo — Implementation Plan

**Synthesized from**: PRD v1.0 · Architecture v1.0 · UXR v1.0
**Target**: 90-minute MVP
**Stack**: React 18 + TypeScript · Vite · Tailwind CSS · Web Speech API · Vercel

---

## Stack & Constraints

| Decision | Choice |
|----------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Speech | Web Speech API (browser-native, free, local) |
| State | `useState` + `useContext` + `localStorage` |
| Animation | CSS + `canvas-confetti` |
| Hosting | Vercel (free tier) |
| Backend | None |
| Auth | None |

**Hard scope boundary**: No multiplayer, no accounts, no backend, no sound by default.

---

## Phase 1 — Foundation (20 min)

### 1.1 Project Scaffold

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.2 Files to Create

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/data/categories.ts` | 3 buzzword packs (40+ words each) |
| `src/context/GameContext.tsx` | Global game state |

### 1.3 Core Types

Define these interfaces (full signatures in architecture doc):

- `CategoryId` — `'agile' | 'corporate' | 'tech'`
- `BingoSquare` — `id`, `word`, `isFilled`, `isAutoFilled`, `isFreeSpace`, `filledAt`, `row`, `col`
- `BingoCard` — `squares: BingoSquare[][]` (5×5), `words: string[]`
- `GameStatus` — `'idle' | 'setup' | 'playing' | 'won'`
- `GameState` — full game state including `card`, `status`, `isListening`, `winningLine`
- `WinningLine` — `type`, `index`, `squares[]`
- `SpeechRecognitionState` — `isSupported`, `isListening`, `transcript`, `error`
- `Toast` — `id`, `message`, `type`

### 1.4 Buzzword Data

Three categories, each with 40+ words in `src/data/categories.ts`:
- **Agile & Scrum** 🏃 — sprint, backlog, standup, velocity, blocker, story points, epic…
- **Corporate Speak** 💼 — synergy, leverage, circle back, take offline, ROI, paradigm shift…
- **Tech & Engineering** 💻 — API, cloud, microservices, kubernetes, CI/CD, observability…

**AC**: Each category produces no duplicate words on a single card.

---

## Phase 2 — Core Game (30 min)

### 2.1 Logic Modules

**`src/lib/cardGenerator.ts`**
- `generateCard(categoryId)` — Fisher-Yates shuffle → pick 24 words → build 5×5 grid
- Center square (row 2, col 2) is always `FREE`, pre-filled
- Returns `BingoCard` with flat `words[]` list for efficient detection

**`src/lib/bingoChecker.ts`**
- `checkForBingo(card)` — checks 5 rows + 5 columns + 2 diagonals → returns first `WinningLine` or `null`
- `countFilled(card)` — count of filled squares
- `getClosestToWin(card)` — returns `{ needed, line }` for "one away" UI hint

### 2.2 Components

Build in this order:

| Component | Route/Screen | P0? |
|-----------|-------------|-----|
| `LandingPage.tsx` | Welcome screen | P0 |
| `CategorySelect.tsx` | 3 category cards with previews | P0 |
| `BingoCard.tsx` | 5×5 grid container | P0 |
| `BingoSquare.tsx` | Individual square with states | P0 |
| `GameBoard.tsx` | Main game container + header | P0 |
| `GameControls.tsx` | New card / listening toggle | P0 |
| `WinScreen.tsx` | Win celebration + stats | P0 |
| `TranscriptPanel.tsx` | Live transcript + detected words | P0 |
| `ui/Button.tsx` | Shared button | P0 |
| `ui/Toast.tsx` | Word-detected notifications | P1 |

### 2.3 Square States

| State | Visual |
|-------|--------|
| Default | White, gray border |
| Hover | Light blue border, scale 1.05 |
| Filled (manual) | Blue bg, white text, strikethrough |
| Auto-filled | Blue bg + pulse animation |
| Free space | Amber bg, ⭐ FREE, no click |
| Winning square | Green bg, ring highlight |

### 2.4 App Navigation

Screen flow managed by `useState<Screen>` in `App.tsx`:

```
landing → category → game → win
                ↑____________|  (play again)
```

### 2.5 Key UX Moments to Nail in This Phase

**Near-BINGO tension** (from UXR): When 1 square away from a winning line, show "⚡ One away!" indicator and pulse the near-complete row/column. This is the peak engagement moment — users start actively listening for specific words.

---

## Phase 3 — Speech Recognition (25 min)

### 3.1 Hook: `useSpeechRecognition.ts`

Config:
```ts
recognition.continuous = true;     // Don't stop after silence
recognition.interimResults = true;  // Show partial results
recognition.lang = 'en-US';
```

Behaviours:
- Auto-restart on `onend` if `isListening` is still `true`
- Expose `startListening(onResult?)`, `stopListening()`, `resetTranscript()`
- Handle `onerror` gracefully — set error state, set `isListening: false`

### 3.2 Hook: `useBingoDetection.ts`

Connects speech output to game state:
1. Receives final transcript segment from `useSpeechRecognition`
2. Calls `detectWordsWithAliases(transcript, cardWords, alreadyFilled)`
3. For each detected word: find matching square, set `isFilled = true`, `isAutoFilled = true`
4. Call `checkForBingo` after each fill
5. Trigger toast notification per detected word

### 3.3 Word Detector: `src/lib/wordDetector.ts`

- `detectWords()` — case-insensitive word-boundary regex for single words; substring match for phrases
- `detectWordsWithAliases()` — extends with `WORD_ALIASES` map (CI/CD → "cicd", ROI → "return on investment", etc.)
- Normalize: lowercase, smart quotes → straight quotes

### 3.4 Microphone Permission UX

**Critical trust moment** (from UXR): Show privacy message *before* the browser prompt:

> "🎤 Meeting Bingo listens for buzzwords using your microphone. Audio is processed locally on your device — it's never recorded or sent anywhere."

**AC**: If permission denied, fall back silently to manual-only mode. Do not show error. Show "Manual mode" indicator instead of "Listening".

### 3.5 TranscriptPanel Component

- Pulsing red dot when listening, gray when paused
- Show last ~100 chars of transcript (final only)
- Italic gray for interim transcript
- Detected word chips: `✨ sprint`, `✨ backlog` (last 5)

**AC**: Auto-fill animation plays within 500ms of word spoken.

---

## Phase 4 — Polish & Deploy (15 min)

### 4.1 Win Celebration

- `canvas-confetti` fires on BINGO detection
- Winning line squares get green ring highlight
- "🎉 BINGO!" prominently displayed
- **No sound by default** (user is in a meeting)
- Show stats: time elapsed, winning word, squares filled, category

**UXR note**: The celebration must feel earned but discreet. Confetti yes, airhorn no.

### 4.2 Share Functionality (`src/lib/shareUtils.ts`)

Priority order:
1. `navigator.share()` — native share sheet on mobile
2. `navigator.clipboard.writeText()` — copy text summary to clipboard
3. Fallback: display text in a selectable textarea

Share text format:
```
🎯 I got BINGO in 22 minutes!
Category: Agile & Scrum
Winning word: "Scope Creep"
12/24 squares filled

Play Meeting Bingo: [URL]
```

**AC**: Share works with Slack, Teams, Discord paste.

### 4.3 localStorage Persistence

Save/restore `GameState` on every update. Key: `meeting-bingo-game`.
Auto-restore in-progress game on page reload.

### 4.4 Deploy to Vercel

```bash
npx vercel --prod
```

Set output dir to `dist`. No env vars required.

---

## Project File Structure

```
meeting-bingo/
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Screen routing
│   ├── components/
│   │   ├── LandingPage.tsx
│   │   ├── CategorySelect.tsx
│   │   ├── GameBoard.tsx
│   │   ├── BingoCard.tsx
│   │   ├── BingoSquare.tsx
│   │   ├── TranscriptPanel.tsx
│   │   ├── WinScreen.tsx
│   │   ├── GameControls.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts
│   │   ├── useGame.ts
│   │   ├── useBingoDetection.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── cardGenerator.ts
│   │   ├── wordDetector.ts
│   │   ├── bingoChecker.ts
│   │   └── shareUtils.ts
│   ├── data/
│   │   └── categories.ts
│   ├── types/
│   │   └── index.ts
│   └── context/
│       └── GameContext.tsx
└── ...config files
```

---

## Acceptance Criteria Checklist

### P0 — Must ship

- [ ] App loads in < 2 seconds
- [ ] 3 category packs, 40+ words each
- [ ] 5×5 card generates with 24 unique words + FREE center
- [ ] Manual tap toggles filled state (can undo)
- [ ] BINGO detected for all 12 winning lines (5 rows, 5 cols, 2 diagonals)
- [ ] Web Speech API transcribes continuously without stopping
- [ ] Buzzwords auto-fill squares within 500ms of detection
- [ ] Privacy message shown before microphone permission
- [ ] Graceful fallback to manual mode if mic denied/unavailable
- [ ] Win celebration with confetti + winning line highlight
- [ ] Share result copies formatted text to clipboard
- [ ] Works on Chrome (desktop + mobile) — primary target

### P1 — Should ship

- [ ] "One away" indicator for near-bingo lines
- [ ] Toast notifications for detected words
- [ ] Game state persists across page refresh (localStorage)
- [ ] Mobile responsive layout
- [ ] Counter showing X/24 squares filled
- [ ] Native share sheet on mobile

### P2 — Nice to have

- [ ] Word aliases (CI/CD → "ci cd", ROI → "return on investment")
- [ ] Interim transcript display (italic gray)
- [ ] "New card" regeneration before game starts
- [ ] Firefox manual-only mode with clear messaging

---

## Risk Log

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Web Speech API not available | Low | Feature detect on load; render manual-only UI if `!SpeechRecognition` |
| Poor transcription accuracy | Medium | Manual tap always available; word aliases for common variants |
| Mic permission denied | Medium | Graceful fallback; never show error state, just switch to manual mode |
| Workshop time overrun | Medium | P1/P2 features are droppable; P0 checklist is the hard floor |
| Audio not captured from speaker | Medium | User education; position phone near speaker |

---

## Definition of Done

A shippable MVP satisfies:
1. All P0 acceptance criteria above
2. End-to-end flow: landing → category → game → auto-fill → BINGO → share
3. No crashes on Chrome desktop and Chrome mobile
4. Deployed to `*.vercel.app` URL
