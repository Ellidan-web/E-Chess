import { useState } from 'react';
import { Color } from 'chess.js';
import { GameMode, Difficulty, TimeControl } from '@/lib/chess-engine';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (options: {
    mode: GameMode;
    difficulty: Difficulty;
    playerColor: Color;
    timeControl: TimeControl | null;
  }) => void;
}

const TIME_PRESETS: { label: string; value: TimeControl }[] = [
  { label: '1 min', value: { minutes: 1, seconds: 0, increment: 0 } },
  { label: '3 min', value: { minutes: 3, seconds: 0, increment: 0 } },
  { label: '5 min', value: { minutes: 5, seconds: 0, increment: 0 } },
  { label: '10 min', value: { minutes: 10, seconds: 0, increment: 0 } },
  { label: '15 | 10', value: { minutes: 15, seconds: 0, increment: 10 } },
  { label: '30 min', value: { minutes: 30, seconds: 0, increment: 0 } },
];

export function NewGameDialog({ isOpen, onClose, onStartGame }: NewGameDialogProps) {
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [useTimer, setUseTimer] = useState(true);
  const [timeControl, setTimeControl] = useState<TimeControl>({ minutes: 10, seconds: 0, increment: 0 });
  const [customTime, setCustomTime] = useState(false);

  const handleStart = () => {
    onStartGame({
      mode,
      difficulty,
      playerColor,
      timeControl: useTimer ? timeControl : null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-display text-2xl">New Game</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as GameMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">vs Computer</TabsTrigger>
            <TabsTrigger value="pvp">Two Players</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Play as</Label>
              <div className="flex gap-2">
                <Button
                  variant={playerColor === 'w' ? 'default' : 'outline'}
                  onClick={() => setPlayerColor('w')}
                  className="flex-1"
                >
                  White
                </Button>
                <Button
                  variant={playerColor === 'b' ? 'default' : 'outline'}
                  onClick={() => setPlayerColor('b')}
                  className="flex-1"
                >
                  Black
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pvp" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Play against a friend on the same device. White moves first.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label>Use Timer</Label>
            <Switch checked={useTimer} onCheckedChange={setUseTimer} />
          </div>

          {useTimer && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {TIME_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={
                      !customTime &&
                      timeControl.minutes === preset.value.minutes &&
                      timeControl.increment === preset.value.increment
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => {
                      setCustomTime(false);
                      setTimeControl(preset.value);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={customTime} onCheckedChange={setCustomTime} />
                <Label>Custom Time</Label>
              </div>

              {customTime && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Minutes</Label>
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={timeControl.minutes}
                      onChange={(e) =>
                        setTimeControl((tc) => ({ ...tc, minutes: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Seconds</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={timeControl.seconds}
                      onChange={(e) =>
                        setTimeControl((tc) => ({ ...tc, seconds: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Increment</Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={timeControl.increment}
                      onChange={(e) =>
                        setTimeControl((tc) => ({ ...tc, increment: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
