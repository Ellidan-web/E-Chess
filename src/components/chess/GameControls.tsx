import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  RotateCw,
  RefreshCw,
  Pause,
  Play,
  Save,
  Volume2,
  VolumeX,
  FlipVertical,
  Flag,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GameControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  isClockRunning: boolean;
  isSoundEnabled: boolean;
  isGameOver: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onPauseClock: () => void;
  onResumeClock: () => void;
  onSave: () => void;
  onToggleSound: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
}

export const GameControls = memo(function GameControls({
  canUndo,
  canRedo,
  isClockRunning,
  isSoundEnabled,
  isGameOver,
  onUndo,
  onRedo,
  onReset,
  onPauseClock,
  onResumeClock,
  onSave,
  onToggleSound,
  onResign,
  onFlipBoard,
}: GameControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onFlipBoard}>
            <FlipVertical className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Flip Board</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={isClockRunning ? onPauseClock : onResumeClock}
          >
            {isClockRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isClockRunning ? 'Pause' : 'Resume'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onToggleSound}>
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isSoundEnabled ? 'Mute' : 'Unmute'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save Game</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onResign}
            disabled={isGameOver}
            className="text-destructive hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Resign</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New Game</TooltipContent>
      </Tooltip>
    </div>
  );
});
