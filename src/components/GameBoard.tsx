import type { GameState } from '../types';
import { BingoCard } from './BingoCard';
import { TranscriptPanel } from './TranscriptPanel';
import { GameControls } from './GameControls';
import { getClosestToWin } from '../lib/bingoChecker';
import { CATEGORIES } from '../data/categories';

interface Props {
  game: GameState;
  transcript: string;
  interimTranscript: string;
  detectedWords: string[];
  isListening: boolean;
  isSupported: boolean;
  onSquareClick: (row: number, col: number) => void;
  onToggleListening: () => void;
  onNewCard: () => void;
  onChangeCategory: () => void;
}

export function GameBoard({
  game, transcript, interimTranscript, detectedWords,
  isListening, isSupported, onSquareClick, onToggleListening, onNewCard, onChangeCategory,
}: Props) {
  const { card, winningLine, filledCount, category } = game;
  if (!card) return null;

  const winningSquareIds = new Set<string>(winningLine?.squares ?? []);
  const closest = !winningLine ? getClosestToWin(card) : null;
  const categoryName = CATEGORIES.find(c => c.id === category)?.name ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900">🎯 Bingo</span>
            <span className="ml-2 text-xs text-gray-400">{categoryName}</span>
          </div>
          <div className="flex items-center gap-2">
            {closest?.needed === 1 && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                ⚡ One away!
              </span>
            )}
            <span className="text-sm text-gray-500">{filledCount}/25</span>
          </div>
        </div>

        {/* Card */}
        <BingoCard
          card={card}
          winningSquareIds={winningSquareIds}
          onSquareClick={onSquareClick}
        />

        {/* Transcript */}
        <TranscriptPanel
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          isListening={isListening}
        />

        {/* Controls */}
        <GameControls
          isListening={isListening}
          isSupported={isSupported}
          onToggleListening={onToggleListening}
          onNewCard={onNewCard}
          onChangeCategory={onChangeCategory}
        />
      </div>
    </div>
  );
}
