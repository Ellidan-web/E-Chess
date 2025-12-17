import { memo, useCallback, DragEvent } from 'react';
import { Square, Move, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { cn } from '@/lib/utils';

interface ChessSquareProps {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  legalMoves: Move[];
  squareSize: number;
  onSquareClick: (square: Square) => void;
  onDragStart: (square: Square) => void;
  onDragEnd: () => void;
  onDrop: (from: Square, to: Square) => void;
}

export const ChessSquare = memo(function ChessSquare({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  legalMoves,
  squareSize,
  onSquareClick,
  onDragStart,
  onDragEnd,
  onDrop,
}: ChessSquareProps) {
  const isCapture = isLegalMove && piece !== null;

  const handleClick = useCallback(() => {
    onSquareClick(square);
  }, [square, onSquareClick]);

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      if (piece) {
        e.dataTransfer.setData('square', square);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(square);
      }
    },
    [piece, square, onDragStart]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const fromSquare = e.dataTransfer.getData('square') as Square;
      if (fromSquare && fromSquare !== square) {
        onDrop(fromSquare, square);
      }
    },
    [square, onDrop]
  );

  const handleDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center transition-colors duration-150',
        isLight ? 'chess-square-light' : 'chess-square-dark',
        isSelected && 'chess-square-highlight',
        isLastMove && !isSelected && !isCheck && 'chess-square-last-move',
        isCheck && 'chess-square-check animate-check',
        isLegalMove && !isCapture && 'chess-square-move',
        isLegalMove && isCapture && 'chess-square-move chess-square-capture'
      )}
      style={{ width: squareSize, height: squareSize }}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {piece && (
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <ChessPiece type={piece.type} color={piece.color} size={squareSize} />
        </div>
      )}
      
      {/* File labels (a-h) on bottom rank */}
      {square[1] === '1' && (
        <span
          className={cn(
            'absolute bottom-0.5 right-1 text-xs font-medium opacity-60',
            isLight ? 'text-[hsl(var(--square-dark))]' : 'text-[hsl(var(--square-light))]'
          )}
        >
          {square[0]}
        </span>
      )}
      
      {/* Rank labels (1-8) on a-file */}
      {square[0] === 'a' && (
        <span
          className={cn(
            'absolute top-0.5 left-1 text-xs font-medium opacity-60',
            isLight ? 'text-[hsl(var(--square-dark))]' : 'text-[hsl(var(--square-light))]'
          )}
        >
          {square[1]}
        </span>
      )}
    </div>
  );
});
