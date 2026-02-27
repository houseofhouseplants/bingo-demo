import { useState, useCallback } from 'react';
import type { CategoryId } from './types';
import { useGame } from './context/GameContext';
import { generateCard } from './lib/cardGenerator';
import { checkForBingo, countFilled } from './lib/bingoChecker';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';
import { ToastContainer } from './components/ui/Toast';
import type { Toast } from './types';

type Screen = 'landing' | 'category' | 'game' | 'win';

export default function App() {
  const { game, setGame, startGame, resetGame, setWon } = useGame();
  const [screen, setScreen] = useState<Screen>('landing');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Speech state (wired in Phase 3 — stubs for now)
  const isSupported = false;
  const isListening = false;
  const transcript = '';
  const interimTranscript = '';
  const detectedWords: string[] = [];

  const handleStart = () => setScreen('category');

  const handleCategorySelect = (categoryId: CategoryId) => {
    const card = generateCard(categoryId);
    startGame(categoryId, card);
    setScreen('game');
  };

  const handleSquareClick = useCallback((row: number, col: number) => {
    setGame(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;
      const squares = prev.card.squares.map(r =>
        r.map(sq => sq.row === row && sq.col === col && !sq.isFreeSpace
          ? { ...sq, isFilled: !sq.isFilled, filledAt: Date.now() }
          : sq
        )
      );
      const newCard = { ...prev.card, squares };
      const winningLine = checkForBingo(newCard);
      if (winningLine) {
        const winningWord = newCard.squares[row][col].word;
        setTimeout(() => { setWon(winningLine, winningWord); setScreen('win'); }, 300);
      }
      return { ...prev, card: newCard, filledCount: countFilled(newCard) };
    });
  }, [setGame, setWon]);

  const handleToggleListening = () => { /* wired in Phase 3 */ };

  const handleNewCard = () => {
    if (game.category) {
      const card = generateCard(game.category);
      startGame(game.category, card);
    }
  };

  const handleShare = () => {
    const { winningWord, filledCount, completedAt, startedAt, category } = game;
    const elapsed = startedAt && completedAt ? Math.round((completedAt - startedAt) / 60000) : 0;
    const text = `🎯 I got BINGO in ${elapsed} minutes!\nCategory: ${category}\nWinning word: "${winningWord}"\n${filledCount}/25 squares filled\n\nPlay Meeting Bingo: ${window.location.href}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    addToast('Result copied to clipboard!');
  };

  const addToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <>
      {screen === 'landing' && <LandingPage onStart={handleStart} />}
      {screen === 'category' && <CategorySelect onSelect={handleCategorySelect} onBack={() => setScreen('landing')} />}
      {screen === 'game' && (
        <GameBoard
          game={game}
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          isListening={isListening}
          isSupported={isSupported}
          onSquareClick={handleSquareClick}
          onToggleListening={handleToggleListening}
          onNewCard={handleNewCard}
        />
      )}
      {screen === 'win' && (
        <WinScreen
          game={game}
          onPlayAgain={() => setScreen('category')}
          onHome={() => { resetGame(); setScreen('landing'); }}
          onShare={handleShare}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
