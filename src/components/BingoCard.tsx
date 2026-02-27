import type { BingoCard as BingoCardType } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningSquareIds: Set<string>;
  onSquareClick: (row: number, col: number) => void;
}

export function BingoCard({ card, winningSquareIds, onSquareClick }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1 w-full">
      {card.squares.flat().map(square => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinning={winningSquareIds.has(square.id)}
          onClick={() => onSquareClick(square.row, square.col)}
        />
      ))}
    </div>
  );
}
