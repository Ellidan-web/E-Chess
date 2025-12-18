import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  squareSize: initialSquareSize = 72,
  onSquareClick,
  onMove,
}: ChessBoardProps) {
  const [draggingFrom, setDraggingFrom] = useState<Square | null>(null);
  const [responsiveSquareSize, setResponsiveSquareSize] = useState(initialSquareSize);
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate responsive square size based on screen width and height
  useEffect(() => {
    const calculateSquareSize = () => {
      if (typeof window === 'undefined') return initialSquareSize;
      
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Calculate based on the smaller dimension to ensure board fits both ways
      const availableWidth = screenWidth;
      const availableHeight = screenHeight;
      
      // Use 92% of available space for better margins
      const maxBoardWidth = Math.min(availableWidth * 0.92, availableHeight * 0.92);
      const calculatedSize = Math.floor(maxBoardWidth / 8);
      
      // Set minimum and maximum sizes
      const minSize = 36; // Minimum 36px for touch targets
      const maxSize = 80; // Maximum 80px for larger screens
      
      return Math.max(minSize, Math.min(calculatedSize, maxSize));
    };

    const handleResize = () => {
      setResponsiveSquareSize(calculateSquareSize());
    };

    // Calculate initial size
    handleResize();
    
    // Add resize listener with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResizeDebounced = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', handleResizeDebounced);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResizeDebounced);
      clearTimeout(resizeTimeout);
    };
  }, [initialSquareSize]);

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
    <div className="w-full h-full min-h-[300px] p-2 sm:p-4">
      <div 
  ref={boardRef}
  className="chess-board grid grid-cols-8 bg-gray-800 rounded-lg overflow-hidden shadow-xl mx-auto"
  style={{ 
    width: `${responsiveSquareSize * 8}px`,
    height: `${responsiveSquareSize * 8}px`,
    aspectRatio: '1/1',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 32px)',
    transform: 'translateX(-8px)' // 👈 MOVE LEFT (adjust value)
  }}
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
              squareSize={responsiveSquareSize}
              onSquareClick={onSquareClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          );
        })}
      </div>
    </div>
  );
});
