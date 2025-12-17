import { memo } from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size?: number;
  isDragging?: boolean;
}

const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export const ChessPiece = memo(function ChessPiece({
  type,
  color,
  size = 64,
  isDragging = false,
}: ChessPieceProps) {
  return (
    <div
      className={`chess-piece select-none ${isDragging ? 'chess-piece-dragging' : ''}`}
      style={{
        fontSize: size * 0.8,
        lineHeight: 1,
        color: color === 'w' ? '#fff' : '#1a1a1a',
        textShadow: color === 'w' 
          ? '0 2px 4px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.8)' 
          : '0 2px 4px rgba(0,0,0,0.3)',
        WebkitTextStroke: color === 'w' ? '1px rgba(0,0,0,0.3)' : '1px rgba(255,255,255,0.1)',
      }}
    >
      {PIECE_UNICODE[color][type]}
    </div>
  );
});
