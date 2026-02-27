import type { GameState } from '../types';
import { BingoCard } from './BingoCard';
import { Button } from './ui/Button';
import { CATEGORIES } from '../data/categories';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
  onShare: () => void;
}

export function WinScreen({ game, onPlayAgain, onHome, onShare }: Props) {
  const { card, winningLine, winningWord, startedAt, completedAt, filledCount, category } = game;
  if (!card) return null;

  const winningSquareIds = new Set<string>(winningLine?.squares ?? []);
  const elapsed = startedAt && completedAt ? Math.round((completedAt - startedAt) / 60000) : 0;
  const categoryName = CATEGORIES.find(c => c.id === category)?.name ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-2">🎉</div>
        <h1 className="text-4xl font-bold text-green-700 mb-1">BINGO!</h1>
        <p className="text-gray-500 text-sm mb-4">Winning word: <strong className="text-gray-800">"{winningWord}"</strong></p>

        <BingoCard
          card={card}
          winningSquareIds={winningSquareIds}
          onSquareClick={() => {}}
        />

        <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm text-sm text-gray-600 grid grid-cols-3 gap-2">
          <div><div className="text-2xl font-bold text-gray-900">{elapsed}m</div><div>to BINGO</div></div>
          <div><div className="text-2xl font-bold text-gray-900">{filledCount}/25</div><div>squares</div></div>
          <div><div className="text-lg font-bold text-gray-900">{categoryName.split(' ')[0]}</div><div>category</div></div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="secondary" size="md" onClick={onHome} className="flex-1">🏠 Home</Button>
          <Button variant="secondary" size="md" onClick={onShare} className="flex-1">📤 Share</Button>
          <Button size="md" onClick={onPlayAgain} className="flex-1">🔄 Again</Button>
        </div>
      </div>
    </div>
  );
}
