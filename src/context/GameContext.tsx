import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, CategoryId, BingoCard, WinningLine } from '../types';

const INITIAL_STATE: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

interface GameContextValue {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  startGame: (category: CategoryId, card: BingoCard) => void;
  resetGame: () => void;
  setWon: (winningLine: WinningLine, winningWord: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  function startGame(category: CategoryId, card: BingoCard) {
    setGame({
      ...INITIAL_STATE,
      status: 'playing',
      category,
      card,
      startedAt: Date.now(),
      filledCount: 1, // free space
    });
  }

  function resetGame() {
    setGame(INITIAL_STATE);
  }

  function setWon(winningLine: WinningLine, winningWord: string) {
    setGame(prev => ({
      ...prev,
      status: 'won',
      completedAt: Date.now(),
      winningLine,
      winningWord,
    }));
  }

  return (
    <GameContext.Provider value={{ game, setGame, startGame, resetGame, setWon }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
