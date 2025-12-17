import { memo, useCallback, useMemo, useState } from 'react';
import { Square, Move, Color } from 'chess.js';
import { ChessSquare } from './ChessSquare';
import { GameState } from '@/lib/chess-engine';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  flipped?: boolean;
  squareSize?: number;
  onSquareClick: (square: Square) => void;
  onMove: (from: Square, to: Square) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard = memo(function ChessBoard({
  gameState,
  selectedSquare,
  legalMoves,
  lastMove,
  flipped = false,
  squareSize = 72,
  onSquareClick,
  onMove,
}: ChessBoardProps) {
  const [draggingFrom, setDraggingFrom] = useState<Square | null>(null);

  const board = useMemo(() => {
    const files = flipped ? [...FILES].reverse() : FILES;
    const ranks = flipped ? [...RANKS].reverse() : RANKS;
    
    const squares: {
      square: Square;
      isLight: boolean;
    }[] = [];

    for (const rank of ranks) {
      for (const file of files) {
        const square = `${file}${rank}` as Square;
        const fileIndex = FILES.indexOf(file);
        const rankIndex = RANKS.indexOf(rank);
        const isLight = (fileIndex + rankIndex) % 2 === 0;
        squares.push({ square, isLight });
      }
    }

    return squares;
  }, [flipped]);

  const boardData = useMemo(() => {
    const data: Record<Square, { type: any; color: Color } | null> = {} as any;
    const boardArray = gameState.fen.split(' ')[0].split('/');
    
    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      const rank = boardArray[rankIndex];
      let fileIndex = 0;
      
      for (const char of rank) {
        if (/[1-8]/.test(char)) {
          for (let i = 0; i < parseInt(char); i++) {
            const square = `${FILES[fileIndex]}${8 - rankIndex}` as Square;
            data[square] = null;
            fileIndex++;
          }
        } else {
          const square = `${FILES[fileIndex]}${8 - rankIndex}` as Square;
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase();
          data[square] = { type, color };
          fileIndex++;
        }
      }
    }
    
    return data;
  }, [gameState.fen]);

  const legalMoveSquares = useMemo(() => {
    return new Set(legalMoves.map((m) => m.to));
  }, [legalMoves]);

  const kingInCheckSquare = useMemo(() => {
    if (!gameState.isCheck) return null;
    
    // Find the king's position
    for (const [square, piece] of Object.entries(boardData)) {
      if (piece && piece.type === 'k' && piece.color === gameState.turn) {
        return square as Square;
      }
    }
    return null;
  }, [gameState.isCheck, gameState.turn, boardData]);

  const handleDragStart = useCallback((square: Square) => {
    setDraggingFrom(square);
    onSquareClick(square);
  }, [onSquareClick]);

  const handleDragEnd = useCallback(() => {
    setDraggingFrom(null);
  }, []);

  const handleDrop = useCallback((from: Square, to: Square) => {
    onMove(from, to);
    setDraggingFrom(null);
  }, [onMove]);

  return (
    <div 
      className="chess-board grid grid-cols-8"
      style={{ width: squareSize * 8, height: squareSize * 8 }}
    >
      {board.map(({ square, isLight }) => {
        const piece = boardData[square];
        const isSelected = square === selectedSquare;
        const isLegalMove = legalMoveSquares.has(square);
        const isLastMoveSquare = lastMove && (square === lastMove.from || square === lastMove.to);
        const isCheck = square === kingInCheckSquare;

        return (
          <ChessSquare
            key={square}
            square={square}
            piece={piece}
            isLight={isLight}
            isSelected={isSelected}
            isLegalMove={isLegalMove}
            isLastMove={!!isLastMoveSquare}
            isCheck={isCheck}
            legalMoves={legalMoves}
            squareSize={squareSize}
            onSquareClick={onSquareClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
});
