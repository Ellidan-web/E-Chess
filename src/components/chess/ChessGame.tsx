import { useState, useCallback, useEffect } from 'react';
import { Color } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { GameMode, Difficulty, TimeControl } from '@/lib/chess-engine';
import { soundManager } from '@/lib/sounds';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { CapturedPieces } from './CapturedPieces';
import { EvaluationBar } from './EvaluationBar';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { PromotionDialog } from './PromotionDialog';
import { NewGameDialog } from './NewGameDialog';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface GameOptions {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: Color;
  timeControl: TimeControl | null;
}

export function ChessGame() {
  const [gameOptions, setGameOptions] = useState<GameOptions>({
    mode: 'ai',
    difficulty: 'medium',
    playerColor: 'w',
    timeControl: { minutes: 10, seconds: 0, increment: 0 },
  });
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(true);
  const [isBoardFlipped, setIsBoardFlipped] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [evaluation, setEvaluation] = useState(0);

  const {
    gameState,
    selectedSquare,
    legalMoves,
    lastMove,
    whiteTime,
    blackTime,
    isClockRunning,
    selectSquare,
    makeMove,
    undoMove,
    redoMove,
    resetGame,
    pauseClock,
    resumeClock,
    canUndo,
    canRedo,
    promotionPending,
    confirmPromotion,
    cancelPromotion,
    saveGame,
    resign,
  } = useChessGame({
    mode: gameOptions.mode,
    difficulty: gameOptions.difficulty,
    timeControl: gameOptions.timeControl,
    playerColor: gameOptions.playerColor,
  });

  // Update evaluation based on captured pieces (simplified)
  useEffect(() => {
    const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900 };
    let score = 0;
    
    gameState.capturedPieces.black.forEach((p) => {
      score += pieceValues[p] || 0;
    });
    gameState.capturedPieces.white.forEach((p) => {
      score -= pieceValues[p] || 0;
    });
    
    setEvaluation(score);
  }, [gameState.capturedPieces]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleStartGame = useCallback((options: GameOptions) => {
    setGameOptions(options);
    setIsBoardFlipped(options.playerColor === 'b');
    resetGame();
  }, [resetGame]);

  const handleSave = useCallback(() => {
    const data = saveGame();
    toast.success('Game saved!', {
      description: 'Your game has been saved to local storage.',
    });
    console.log('Saved game:', data);
  }, [saveGame]);

  const handleToggleSound = useCallback(() => {
    const newEnabled = !isSoundEnabled;
    setIsSoundEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
    toast(newEnabled ? 'Sound enabled' : 'Sound disabled');
  }, [isSoundEnabled]);

  const handleFlipBoard = useCallback(() => {
    setIsBoardFlipped((prev) => !prev);
  }, []);

  const handleMove = useCallback((from: any, to: any) => {
    makeMove(from, to);
  }, [makeMove]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            E-Chess
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewGameDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Game
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Chess Board Section */}
          <div className="flex flex-col gap-4">
            {/* Top Player Info */}
            <div className="flex items-center justify-between">
              <CapturedPieces
                pieces={isBoardFlipped ? gameState.capturedPieces.black : gameState.capturedPieces.white}
                color={isBoardFlipped ? 'b' : 'w'}
              />
              {/* Only show clock in PvP mode or for opponent in AI mode */}
              {gameOptions.timeControl && (
                <ChessClock
                  whiteTime={whiteTime}
                  blackTime={blackTime}
                  turn={gameState.turn}
                  isRunning={isClockRunning}
                  flipped={isBoardFlipped}
                  isAiMode={gameOptions.mode === 'ai'}
                  playerColor={gameOptions.playerColor}
                />
              )}
            </div>

            {/* Game Status */}
            <GameStatus
              status={gameState.status}
              turn={gameState.turn}
              winner={gameState.winner}
              isCheck={gameState.isCheck}
            />

            {/* Chess Board */}
            <div className="flex items-center">
              {/* Desktop Evaluation Bar - now placed to the LEFT of the board */}
              <div className="hidden lg:block mr-4">
                <EvaluationBar score={evaluation} height={576} />
              </div>
              
              <ChessBoard
                gameState={gameState}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                flipped={isBoardFlipped}
                squareSize={72}
                onSquareClick={selectSquare}
                onMove={handleMove}
              />
            </div>

            {/* Bottom Player Info - Only show in PvP mode */}
            {gameOptions.mode === 'pvp' && (
              <div className="flex items-center justify-between">
                <CapturedPieces
                  pieces={isBoardFlipped ? gameState.capturedPieces.white : gameState.capturedPieces.black}
                  color={isBoardFlipped ? 'w' : 'b'}
                />
              </div>
            )}

            {/* Mobile Evaluation */}
            <div className="lg:hidden">
              <EvaluationBar score={evaluation} orientation="horizontal" />
            </div>

            {/* Controls */}
            <GameControls
              canUndo={canUndo}
              canRedo={canRedo}
              isClockRunning={isClockRunning}
              isSoundEnabled={isSoundEnabled}
              isGameOver={gameState.status !== 'playing'}
              onUndo={undoMove}
              onRedo={redoMove}
              onReset={() => setIsNewGameDialogOpen(true)}
              onPauseClock={pauseClock}
              onResumeClock={resumeClock}
              onSave={handleSave}
              onToggleSound={handleToggleSound}
              onResign={() => {
                resign();
                toast('You resigned!', { description: `${gameState.turn === 'w' ? 'Black' : 'White'} wins by resignation.` });
              }}
              onFlipBoard={handleFlipBoard}
            />
          </div>

          {/* Side Panel */}
          <Card className="w-full lg:w-80 h-[400px] lg:h-[576px] p-4">
            <h2 className="font-display font-semibold text-lg mb-3">Move History</h2>
            <div className="h-[calc(100%-2rem)]">
              <MoveHistory
                moves={gameState.moveHistory}
                currentMoveIndex={gameState.moveHistory.length - 1}
              />
            </div>
          </Card>
        </div>
      </main>

      {/* Dialogs */}
      <PromotionDialog
        isOpen={!!promotionPending}
        color={gameState.turn}
        onSelect={confirmPromotion}
        onCancel={cancelPromotion}
      />

      <NewGameDialog
        isOpen={isNewGameDialogOpen}
        onClose={() => setIsNewGameDialogOpen(false)}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
