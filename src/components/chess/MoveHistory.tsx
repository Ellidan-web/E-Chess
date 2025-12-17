import { memo, useRef, useEffect } from 'react';
import { Move } from 'chess.js';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export const MoveHistory = memo(function MoveHistory({
  moves,
  currentMoveIndex,
  onMoveClick,
}: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (white, black)
  const movePairs: { number: number; white?: Move; black?: Move; whiteIndex: number; blackIndex: number }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  if (moves.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No moves yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="space-y-1 p-2">
        {movePairs.map((pair) => (
          <div key={pair.number} className="flex items-center gap-1 text-sm">
            <span className="w-8 text-muted-foreground font-medium">{pair.number}.</span>
            {pair.white && (
              <button
                onClick={() => onMoveClick?.(pair.whiteIndex)}
                className={cn(
                  'flex-1 px-2 py-1 rounded text-left hover:bg-secondary transition-colors',
                  currentMoveIndex === pair.whiteIndex && 'bg-accent font-semibold'
                )}
              >
                {pair.white.san}
              </button>
            )}
            {pair.black && (
              <button
                onClick={() => onMoveClick?.(pair.blackIndex)}
                className={cn(
                  'flex-1 px-2 py-1 rounded text-left hover:bg-secondary transition-colors',
                  currentMoveIndex === pair.blackIndex && 'bg-accent font-semibold'
                )}
              >
                {pair.black.san}
              </button>
            )}
            {!pair.black && <div className="flex-1" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
});
