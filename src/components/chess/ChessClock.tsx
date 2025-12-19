import { memo } from 'react';
import { Color } from 'chess.js';
import { cn } from '@/lib/utils';

interface ChessClockProps {
  whiteTime: number;
  blackTime: number;
  turn: Color;
  isRunning: boolean;
  flipped?: boolean;
  isAiMode?: boolean; // optional flag to hide AI clock
  playerColor?: Color; // player color in AI mode
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);

  if (seconds < 10) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const ChessClock = memo(function ChessClock({
  whiteTime,
  blackTime,
  turn,
  isRunning,
  flipped = false,
  isAiMode = false,
  playerColor,
}: ChessClockProps) {
  // In AI mode, only show the player's clock
  if (isAiMode && playerColor) {
    const playerTime = playerColor === 'w' ? whiteTime : blackTime;
    const isPlayerTurn = turn === playerColor;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-muted-foreground mb-1">
          Your Clock
        </div>
        <ClockDisplay
          time={playerTime}
          color={playerColor}
          isActive={isPlayerTurn && isRunning}
          isLow={playerTime < 30}
        />
      </div>
    );
  }

  // Normal mode (PVP) - show both clocks
  const topTime = flipped ? whiteTime : blackTime;
  const bottomTime = flipped ? blackTime : whiteTime;
  const topColor: Color = flipped ? 'w' : 'b';
  const bottomColor: Color = flipped ? 'b' : 'w';

  return (
    <div className="flex flex-col gap-2">
      <ClockDisplay
        time={topTime}
        color={topColor}
        isActive={turn === topColor && isRunning}
        isLow={topTime < 30}
      />
      <ClockDisplay
        time={bottomTime}
        color={bottomColor}
        isActive={turn === bottomColor && isRunning}
        isLow={bottomTime < 30}
      />
    </div>
  );
});

interface ClockDisplayProps {
  time: number;
  color: Color;
  isActive: boolean;
  isLow: boolean;
}

function ClockDisplay({ time, color, isActive, isLow }: ClockDisplayProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg font-mono text-2xl font-semibold transition-all',
        color === 'w' ? 'bg-card text-card-foreground' : 'bg-primary text-primary-foreground',
        isActive && 'ring-2 ring-accent shadow-lg',
        isLow && time > 0 && 'animate-pulse text-destructive'
      )}
    >
      {formatTime(time)}
    </div>
  );
}
