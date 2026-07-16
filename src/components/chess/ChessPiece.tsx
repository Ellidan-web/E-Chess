import { memo } from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size?: number;
  isDragging?: boolean;
}

// SVG chess pieces - professional styled
const ChessPieceSVGs: Record<PieceSymbol, (color: string) => React.ReactNode> = {
  k: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Base */}
        <path d="M 25 85 Q 20 80 20 70 L 20 50 Q 20 40 30 35 L 70 35 Qimport { memo } from 'react';
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
}); 80 40 80 50 L 80 70 Q 80 80 75 85 Z"/>
        {/* Shaft */}
        <rect x="40" y="25" width="20" height="15" fill={color} stroke="#000" strokeWidth="1.5"/>
        {/* Cross on top */}
        <line x1="35" y1="20" x2="65" y2="20" stroke={color} strokeWidth="4"/>
        <line x1="50" y1="10" x2="50" y2="25" stroke={color} strokeWidth="4"/>
        {/* Crown point */}
        <polygon points="50,5 45,15 55,15" fill={color} stroke="#000" strokeWidth="1.5"/>
      </g>
    </svg>
  ),
  
  q: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Base */}
        <path d="M 25 85 Q 20 80 20 70 L 20 50 Q 20 40 30 35 L 70 35 Q 80 40 80 50 L 80 70 Q 80 80 75 85 Z"/>
        {/* Crown */}
        <path d="M 30 35 L 35 15 L 42 25 L 50 10 L 58 25 L 65 15 L 70 35" fill={color} stroke="#000" strokeWidth="1.5"/>
        {/* Crown points */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={30 + i * 10} cy="12" r="2.5" fill={color} stroke="#000" strokeWidth="1"/>
        ))}
      </g>
    </svg>
  ),
  
  r: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Base */}
        <path d="M 25 85 Q 20 80 20 70 L 20 35 L 80 35 L 80 70 Q 80 80 75 85 Z"/>
        {/* Crenellations */}
        <rect x="20" y="20" width="15" height="15" fill={color} stroke="#000" strokeWidth="1.5"/>
        <rect x="42" y="15" width="16" height="20" fill={color} stroke="#000" strokeWidth="1.5"/>
        <rect x="65" y="20" width="15" height="15" fill={color} stroke="#000" strokeWidth="1.5"/>
      </g>
    </svg>
  ),
  
  b: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Base */}
        <path d="M 30 85 Q 25 80 25 70 L 25 50 Q 25 40 35 35 L 65 35 Q 75 40 75 50 L 75 70 Q 75 80 70 85 Z"/>
        {/* Mitre shape */}
        <path d="M 40 35 L 50 15 L 60 35" fill={color} stroke="#000" strokeWidth="1.5"/>
        {/* Slit */}
        <line x1="50" y1="20" x2="50" y2="33" stroke="#000" strokeWidth="2"/>
        {/* Point at top */}
        <circle cx="50" cy="12" r="3" fill={color} stroke="#000" strokeWidth="1.5"/>
      </g>
    </svg>
  ),
  
  n: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Neck and head */}
        <path d="M 30 70 L 30 85 Q 25 80 25 70 L 30 55 Q 35 40 50 30 Q 65 40 70 55 L 75 70 Q 75 80 70 85 L 70 70 Q 70 50 50 40 Q 35 48 30 70" fill={color} stroke="#000" strokeWidth="1.5"/>
        {/* Ear */}
        <path d="M 55 35 Q 65 30 68 38 Q 65 35 60 37" fill={color} stroke="#000" strokeWidth="1"/>
        {/* Eye */}
        <circle cx="60" cy="42" r="2.5" fill="#000"/>
      </g>
    </svg>
  ),
  
  p: (color: string) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        {/* Head */}
        <circle cx="50" cy="30" r="12" fill={color} stroke="#000" strokeWidth="1.5"/>
        {/* Neck */}
        <rect x="45" y="40" width="10" height="8" fill={color} stroke="#000" strokeWidth="1"/>
        {/* Base */}
        <path d="M 35 48 L 30 85 Q 25 80 25 70 L 25 50 Q 25 48 30 48 L 70 48 Q 75 48 75 50 L 75 70 Q 75 80 70 85 L 65 48 Z" fill={color} stroke="#000" strokeWidth="1.5"/>
      </g>
    </svg>
  ),
};

export const ChessPiece = memo(function ChessPiece({
  type,
  color,
  size = 64,
  isDragging = false,
}: ChessPieceProps) {
  const pieceColor = color === 'w' ? '#ffffff' : '#000000';
  
  return (
    <div
      className={`chess-piece select-none ${isDragging ? 'chess-piece-dragging' : ''}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))',
      }}
    >
      {ChessPieceSVGs[type](pieceColor)}
    </div>
  );
});
