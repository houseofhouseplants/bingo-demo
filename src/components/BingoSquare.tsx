import type { BingoSquare as BingoSquareType } from '../types';

interface Props {
  square: BingoSquareType;
  isWinning: boolean;
  onClick: () => void;
}

export function BingoSquare({ square, isWinning, onClick }: Props) {
  const { word, isFilled, isAutoFilled, isFreeSpace } = square;

  let bg = 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-105';
  if (isWinning) bg = 'bg-green-500 border-green-600 text-white ring-2 ring-green-300 scale-105';
  else if (isFreeSpace) bg = 'bg-amber-100 border-amber-300 text-amber-700 cursor-default';
  else if (isFilled) bg = `bg-blue-500 border-blue-600 text-white ${isAutoFilled ? 'animate-pulse' : ''}`;

  return (
    <button
      onClick={onClick}
      disabled={isFreeSpace}
      className={`aspect-square p-1 border-2 rounded-lg transition-all duration-200 flex items-center justify-center text-center ${bg}`}
    >
      <span className={`text-[10px] sm:text-xs font-medium leading-tight break-words hyphens-auto ${isFilled && !isFreeSpace ? 'line-through opacity-90' : ''}`}>
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  );
}
