import { useCallback, useRef } from 'react';
import type { WinningLine } from '../types';
import { detectWordsWithAliases } from '../lib/wordDetector';
import { checkForBingo, countFilled } from '../lib/bingoChecker';

interface Options {
  setGame: React.Dispatch<React.SetStateAction<import('../types').GameState>>;
  onWin: (line: WinningLine, word: string) => void;
  onWordsDetected: (words: string[]) => void;
}

export function useBingoDetection({ setGame, onWin, onWordsDetected }: Options) {
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const onWordsRef = useRef(onWordsDetected);
  onWordsRef.current = onWordsDetected;

  const processTranscript = useCallback((transcript: string) => {
    setGame(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;

      const alreadyFilled = new Set(
        prev.card.squares.flat()
          .filter(sq => sq.isFilled)
          .map(sq => sq.word.toLowerCase())
      );

      const detected = detectWordsWithAliases(transcript, prev.card.words, alreadyFilled);
      if (detected.length === 0) return prev;

      onWordsRef.current(detected);

      const squares = prev.card.squares.map(row =>
        row.map(sq => {
          if (!sq.isFilled && detected.some(w => w.toLowerCase() === sq.word.toLowerCase())) {
            return { ...sq, isFilled: true, isAutoFilled: true, filledAt: Date.now() };
          }
          return sq;
        })
      );

      const newCard = { ...prev.card, squares };
      const winningLine = checkForBingo(newCard);

      if (winningLine) {
        const winningWord = detected[detected.length - 1];
        setTimeout(() => onWinRef.current(winningLine, winningWord), 300);
      }

      return { ...prev, card: newCard, filledCount: countFilled(newCard) };
    });
  }, [setGame]);

  return { processTranscript };
}
