import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PromotionDialogProps {
  isOpen: boolean;
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

export function PromotionDialog({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-display text-center">Promote Pawn</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-4">
          {PROMOTION_PIECES.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="w-16 h-16 flex items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors"
            >
              <ChessPiece type={piece} color={color} size={56} />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
