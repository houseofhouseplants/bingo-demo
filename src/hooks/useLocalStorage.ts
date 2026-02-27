import { useEffect } from 'react';
import type { GameState } from '../types';

const KEY = 'meeting-bingo-game';

export function saveGame(state: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full or unavailable */ }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    // Only restore active games
    return state.status === 'playing' ? state : null;
  } catch {
    return null;
  }
}

export function clearGame() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function usePersistGame(game: GameState) {
  useEffect(() => {
    if (game.status === 'playing') {
      saveGame(game);
    } else {
      clearGame();
    }
  }, [game]);
}
