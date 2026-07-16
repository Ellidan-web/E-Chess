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
        color: color === 'w' ? '#ffffff' : '#000000',
        textShadow: color === 'w' 
          ? '2px 2px 4px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8)' 
          : '2px 2px 4px rgba(255,255,255,0.6), 0 0 2px rgba(255,255,255,0.8)',
        WebkitTextStroke: color === 'w' ? '1.5px rgba(0,0,0,0.5)' : '1.5px rgba(255,255,255,0.5)',
      }}
    >
      {PIECE_UNICODE[color][type]}
    </div>
  );
});
