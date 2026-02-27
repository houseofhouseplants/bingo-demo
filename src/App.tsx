import { useState, useCallback } from 'react';
import type { CategoryId, Toast, WinningLine } from './types';
import { useGame } from './context/GameContext';
import { generateCard } from './lib/cardGenerator';
import { checkForBingo, countFilled } from './lib/bingoChecker';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useBingoDetection } from './hooks/useBingoDetection';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';
import { MicPermission } from './components/MicPermission';
import { ToastContainer } from './components/ui/Toast';

type Screen = 'landing' | 'category' | 'game' | 'win';

export default function App() {
  const { game, setGame, startGame, resetGame, setWon } = useGame();
  const [screen, setScreen] = useState<Screen>('landing');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  const addToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
  }, []);

  const handleWin = useCallback((line: WinningLine, word: string) => {
    setWon(line, word);
    setScreen('win');
  }, [setWon]);

  const { processTranscript } = useBingoDetection({
    setGame,
    onWin: handleWin,
    onWordsDetected: useCallback((words: string[]) => {
      setDetectedWords(prev => [...prev, ...words]);
      words.forEach(w => addToast(`"${w}" detected!`));
    }, [addToast]),
  });

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition(processTranscript);

  const handleStart = () => setScreen('category');

  const handleCategorySelect = (categoryId: CategoryId) => {
    const card = generateCard(categoryId);
    startGame(categoryId, card);
    setDetectedWords([]);
    setScreen('game');
    // Show mic prompt if supported and not yet denied
    if (isSupported && !micDenied && !isListening) {
      setShowMicPrompt(true);
    }
  };

  const handleSquareClick = useCallback((row: number, col: number) => {
    setGame(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;
      const squares = prev.card.squares.map(r =>
        r.map(sq =>
          sq.row === row && sq.col === col && !sq.isFreeSpace
            ? { ...sq, isFilled: !sq.isFilled, filledAt: Date.now() }
            : sq
        )
      );
      const newCard = { ...prev.card, squares };
      const winningLine = checkForBingo(newCard);
      if (winningLine) {
        const word = newCard.squares[row][col].word;
        setTimeout(() => handleWin(winningLine, word), 300);
      }
      return { ...prev, card: newCard, filledCount: countFilled(newCard) };
    });
  }, [setGame, handleWin]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else if (isSupported) {
      setShowMicPrompt(true);
    }
  };

  const handleMicAllow = () => {
    setShowMicPrompt(false);
    startListening();
  };

  const handleMicDeny = () => {
    setShowMicPrompt(false);
    setMicDenied(true);
  };

  const handleNewCard = () => {
    if (game.category) {
      const card = generateCard(game.category);
      startGame(game.category, card);
      setDetectedWords([]);
    }
  };

  const handleShare = () => {
    const { winningWord, filledCount, completedAt, startedAt, category } = game;
    const elapsed = startedAt && completedAt ? Math.round((completedAt - startedAt) / 60000) : 0;
    const text = `🎯 I got BINGO in ${elapsed} minutes!\nCategory: ${category}\nWinning word: "${winningWord}"\n${filledCount}/25 squares filled\n\nPlay Meeting Bingo: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      addToast('Result copied to clipboard!');
    }
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <>
      {screen === 'landing' && <LandingPage onStart={handleStart} />}
      {screen === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={() => setScreen('landing')} />
      )}
      {screen === 'game' && (
        <GameBoard
          game={game}
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          isListening={isListening}
          isSupported={isSupported && !micDenied}
          onSquareClick={handleSquareClick}
          onToggleListening={handleToggleListening}
          onNewCard={handleNewCard}
        />
      )}
      {screen === 'win' && (
        <WinScreen
          game={game}
          onPlayAgain={() => { stopListening(); setScreen('category'); }}
          onHome={() => { stopListening(); resetGame(); setScreen('landing'); }}
          onShare={handleShare}
        />
      )}
      {showMicPrompt && <MicPermission onAllow={handleMicAllow} onDeny={handleMicDeny} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
