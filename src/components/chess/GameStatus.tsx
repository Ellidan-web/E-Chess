import { memo } from 'react';
import { Color } from 'chess.js';
import { GameStatus as GameStatusType } from '@/lib/chess-engine';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  status: GameStatusType;
  turn: Color;
  winner: Color | null;
  isCheck: boolean;
}

export const GameStatus = memo(function GameStatus({
  status,
  turn,
  winner,
  isCheck,
}: GameStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'checkmate':
        return `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins!`;
      case 'stalemate':
        return 'Stalemate - Draw';
      case 'draw':
        return 'Draw';
      case 'timeout':
        return `Time out! ${winner === 'w' ? 'White' : 'Black'} wins!`;
        case 'resign':
  return `${winner === 'w' ? 'White' : 'Black'} wins by resignation!`;
      case 'playing':
        if (isCheck) {
          return `${turn === 'w' ? 'White' : 'Black'} is in check!`;
        }
        return `${turn === 'w' ? 'White' : 'Black'} to move`;
    }
  };

  const isGameOver = status !== 'playing';

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg text-center font-medium transition-all',
        isGameOver && 'bg-accent text-accent-foreground animate-scale-in',
        isCheck && !isGameOver && 'bg-destructive/10 text-destructive',
        !isCheck && !isGameOver && 'bg-secondary text-secondary-foreground'
      )}
    >
      {getStatusText()}
    </div>
  );
});
