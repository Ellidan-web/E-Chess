import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EvaluationBarProps {
  score: number; // Centipawns, positive = white advantage
  height?: number;
  orientation?: 'vertical' | 'horizontal';
}

export const EvaluationBar = memo(function EvaluationBar({
  score,
  height = 400,
  orientation = 'vertical',
}: EvaluationBarProps) {
  const whitePercent = useMemo(() => {
    // Convert centipawn score to percentage
    // Use a sigmoid-like function for smooth scaling
    const normalized = Math.tanh(score / 1000);
    return ((normalized + 1) / 2) * 100;
  }, [score]);

  const displayScore = useMemo(() => {
    if (Math.abs(score) > 9000) {
      return score > 0 ? 'M' : '-M';
    }
    const pawns = score / 100;
    if (pawns >= 0) {
      return `+${pawns.toFixed(1)}`;
    }
    return pawns.toFixed(1);
  }, [score]);

  if (orientation === 'horizontal') {
    return (
      <div className="relative w-full h-6 rounded overflow-hidden bg-[hsl(var(--evaluation-black))]">
        <div
          className="absolute left-0 top-0 h-full bg-[hsl(var(--evaluation-white))] transition-all duration-300"
          style={{ width: `${whitePercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-xs font-bold',
              whitePercent > 50 ? 'text-[hsl(var(--evaluation-black))]' : 'text-[hsl(var(--evaluation-white))]'
            )}
          >
            {displayScore}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-6 rounded overflow-hidden bg-[hsl(var(--evaluation-white))]"
      style={{ height }}
    >
      <div
        className="absolute left-0 bottom-0 w-full bg-[hsl(var(--evaluation-black))] transition-all duration-300"
        style={{ height: `${100 - whitePercent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'text-[10px] font-bold writing-vertical rotate-180',
            whitePercent > 50 ? 'text-[hsl(var(--evaluation-black))]' : 'text-[hsl(var(--evaluation-white))]'
          )}
          style={{ writingMode: 'vertical-rl' }}
        >
          {displayScore}
        </span>
      </div>
    </div>
  );
});
