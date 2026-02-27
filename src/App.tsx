import { useState, useCallback, useEffect } from 'react';
import type { CategoryId, Toast, WinningLine } from './types';
import { useGame } from './context/GameContext';
import { generateCard } from './lib/cardGenerator';
import { checkForBingo, countFilled } from './lib/bingoChecker';
import { shareResult } from './lib/shareUtils';
import { usePersistGame, loadGame } from './hooks/useLocalStorage';
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

  // Restore in-progress game on load
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setGame(saved);
      setScreen('game');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist game state on every change
  usePersistGame(game);

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

  const handleMicAllow = () => { setShowMicPrompt(false); startListening(); };
  const handleMicDeny = () => { setShowMicPrompt(false); setMicDenied(true); };

  const handleNewCard = () => {
    if (game.category) {
      const card = generateCard(game.category);
      startGame(game.category, card);
      setDetectedWords([]);
    }
  };

  const handleShare = async () => {
    const result = await shareResult(game);
    if (result === 'copied') addToast('Result copied to clipboard!');
    if (result === 'error') addToast('Could not share — try screenshotting instead.');
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
