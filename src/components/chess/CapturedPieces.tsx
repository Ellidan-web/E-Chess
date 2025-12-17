import { memo } from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface CapturedPiecesProps {
  pieces: PieceSymbol[];
  color: Color;
}

const PIECE_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const CapturedPieces = memo(function CapturedPieces({
  pieces,
  color,
}: CapturedPiecesProps) {
  // Sort pieces by value
  const sortedPieces = [...pieces].sort((a, b) => {
    const orderA = PIECE_ORDER.indexOf(a);
    const orderB = PIECE_ORDER.indexOf(b);
    return orderA - orderB;
  });

  // Calculate material advantage
  const materialValue = pieces.reduce((sum, piece) => sum + PIECE_VALUES[piece], 0);

  if (pieces.length === 0) {
    return <div className="h-8" />;
  }

  return (
    <div className="flex items-center gap-0.5 h-8">
      {sortedPieces.map((piece, index) => (
        <div key={index} className="-mx-1 first:mx-0">
          <ChessPiece type={piece} color={color} size={24} />
        </div>
      ))}
      {materialValue > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          +{materialValue}
        </span>
      )}
    </div>
  );
});
