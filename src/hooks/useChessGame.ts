import { useState, useCallback, useEffect, useRef } from 'react';
import { Square, Move, PieceSymbol, Color } from 'chess.js';
import { ChessEngine, GameMode, Difficulty, TimeControl, GameState, GameStatus as GameStatusType } from '@/lib/chess-engine';
import { soundManager } from '@/lib/sounds';

interface UseChessGameOptions {
  mode: GameMode;
  difficulty: Difficulty;
  timeControl: TimeControl | null;
  playerColor: Color;
}

interface UseChessGameReturn {
  gameState: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  whiteTime: number;
  blackTime: number;
  isClockRunning: boolean;
  selectSquare: (square: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  undoMove: () => void;
  redoMove: () => void;
  resetGame: () => void;
  pauseClock: () => void;
  resumeClock: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setTimeControl: (timeControl: TimeControl | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  promotionPending: { from: Square; to: Square } | null;
  confirmPromotion: (piece: PieceSymbol) => void;
  cancelPromotion: () => void;
  loadGame: (fen: string) => boolean;
  saveGame: () => { fen: string; pgn: string };
  resign: () => void;
}

const STORAGE_KEY = 'chess-game-save';

export function useChessGame(options: UseChessGameOptions): UseChessGameReturn {
  const engineRef = useRef(new ChessEngine());
  const [gameState, setGameState] = useState<GameState>(() => engineRef.current.getGameState());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);
  
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { mode, difficulty, timeControl, playerColor } = options;

  // Initialize time control
  useEffect(() => {
    if (timeControl) {
      const totalSeconds = timeControl.minutes * 60 + timeControl.seconds;
      setWhiteTime(totalSeconds);
      setBlackTime(totalSeconds);
    }
  }, [timeControl]);

  // Set difficulty
  useEffect(() => {
    engineRef.current.setDifficulty(difficulty);
  }, [difficulty]);

  // Clock management
  useEffect(() => {
    if (!timeControl) return; // no clock if no time control
    if (!isClockRunning || gameState.status !== 'playing') return;

    // Clear any existing interval
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }

    clockIntervalRef.current = setInterval(() => {
      // AI mode: only decrement the **player's clock**
      if (mode === 'ai') {
        if (gameState.turn === playerColor) {
          if (playerColor === 'w') {
            setWhiteTime((prev) => {
              const newTime = Math.max(0, prev - 0.1);
              if (newTime <= 0) {
                setTimeout(() => setIsClockRunning(false), 0);
              }
              return newTime;
            });
          } else {
            setBlackTime((prev) => {
              const newTime = Math.max(0, prev - 0.1);
              if (newTime <= 0) {
                setTimeout(() => setIsClockRunning(false), 0);
              }
              return newTime;
            });
          }
        }
      } else {
        // Two-player mode: decrement both clocks normally
        if (gameState.turn === 'w') {
          setWhiteTime((prev) => {
            const newTime = Math.max(0, prev - 0.1);
            if (newTime <= 0) {
              setTimeout(() => setIsClockRunning(false), 0);
            }
            return newTime;
          });
        } else {
          setBlackTime((prev) => {
            const newTime = Math.max(0, prev - 0.1);
            if (newTime <= 0) {
              setTimeout(() => setIsClockRunning(false), 0);
            }
            return newTime;
          });
        }
      }
    }, 100);

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    };
  }, [isClockRunning, gameState.turn, gameState.status, timeControl, mode, playerColor]);

  // Timeout detection
  useEffect(() => {
    if (!timeControl || gameState.status !== 'playing') return;

    // Check if white time ran out
    if (whiteTime <= 0) {
      setGameState(prev => ({
        ...prev,
        status: 'timeout' as GameStatusType,
        winner: 'b', // Black wins when white's time runs out
      }));
      setIsClockRunning(false);
      soundManager.play('gameEnd');
      
      // Clear interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      return;
    }

    // Check if black time ran out
    if (blackTime <= 0) {
      setGameState(prev => ({
        ...prev,
        status: 'timeout' as GameStatusType,
        winner: 'w', // White wins when black's time runs out
      }));
      setIsClockRunning(false);
      soundManager.play('gameEnd');
      
      // Clear interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    }
  }, [whiteTime, blackTime, timeControl, gameState.status]);

  // AI move
  useEffect(() => {
    if (
      mode === 'ai' &&
      gameState.status === 'playing' &&
      gameState.turn !== playerColor
    ) {
      const timeout = setTimeout(() => {
        const engine = engineRef.current;
        const aiMove = engine.getBestMove();
        if (aiMove) {
          engine.makeMove(aiMove.from, aiMove.to, aiMove.promotion);
          setLastMove({ from: aiMove.from, to: aiMove.to });
          
          // Play sound
          if (engine.isCheck()) {
            soundManager.play('check');
          } else if (aiMove.captured) {
            soundManager.play('capture');
          } else if (aiMove.san.includes('O-O')) {
            soundManager.play('castle');
          } else {
            soundManager.play('move');
          }
          
          // Add increment
          if (timeControl && timeControl.increment > 0) {
            if (gameState.turn === 'w') {
              setWhiteTime((prev) => prev + timeControl.increment);
            } else {
              setBlackTime((prev) => prev + timeControl.increment);
            }
          }
          
          const newState = engine.getGameState();
          setGameState(newState);
          
          if (newState.status !== 'playing') {
            soundManager.play('gameEnd');
            setIsClockRunning(false);
            
            // Clear interval
            if (clockIntervalRef.current) {
              clearInterval(clockIntervalRef.current);
              clockIntervalRef.current = null;
            }
          }
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [mode, gameState.status, gameState.turn, playerColor, timeControl]);

  const selectSquare = useCallback((square: Square) => {
    const engine = engineRef.current;
    const piece = engine.getPiece(square);
    
    // If game is over, don't allow selection
    if (gameState.status !== 'playing') return;
    
    // In AI mode, only allow player's color
    if (mode === 'ai' && gameState.turn !== playerColor) return;

    // If clicking on own piece, select it
    if (piece && piece.color === gameState.turn) {
      setSelectedSquare(square);
      setLegalMoves(engine.getLegalMoves(square));
      return;
    }

    // If a piece is selected and clicking on a legal move destination
    if (selectedSquare) {
      const moves = engine.getLegalMoves(selectedSquare);
      const targetMove = moves.find((m) => m.to === square);
      
      if (targetMove) {
        // Check if it's a pawn promotion
        if (targetMove.promotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }
        
        const success = engine.makeMove(selectedSquare, square);
        if (success) {
          setLastMove({ from: selectedSquare, to: square });
          
          const newState = engine.getGameState();
          const lastMoveInHistory = newState.moveHistory[newState.moveHistory.length - 1];
          
          // Play sound
          if (engine.isCheck()) {
            soundManager.play('check');
          } else if (lastMoveInHistory?.captured) {
            soundManager.play('capture');
          } else if (lastMoveInHistory?.san.includes('O-O')) {
            soundManager.play('castle');
          } else {
            soundManager.play('move');
          }
          
          // Start clock on first move
          if (timeControl && newState.moveHistory.length === 1) {
            setIsClockRunning(true);
          }
          
          // Add increment
          if (timeControl && timeControl.increment > 0) {
            if (newState.turn === 'b') {
              setWhiteTime((prev) => prev + timeControl.increment);
            } else {
              setBlackTime((prev) => prev + timeControl.increment);
            }
          }
          
          setGameState(newState);
          
          if (newState.status !== 'playing') {
            soundManager.play('gameEnd');
            setIsClockRunning(false);
            
            // Clear interval
            if (clockIntervalRef.current) {
              clearInterval(clockIntervalRef.current);
              clockIntervalRef.current = null;
            }
          }
        }
      }
      
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [selectedSquare, gameState.turn, gameState.status, mode, playerColor, timeControl]);

  const makeMove = useCallback((from: Square, to: Square, promotion?: PieceSymbol): boolean => {
    const engine = engineRef.current;
    
    if (gameState.status !== 'playing') return false;
    if (mode === 'ai' && gameState.turn !== playerColor) return false;
    
    const moves = engine.getLegalMoves(from);
    const targetMove = moves.find((m) => m.to === to);
    
    if (!targetMove) return false;
    
    // Check if promotion is needed
    if (targetMove.promotion && !promotion) {
      setPromotionPending({ from, to });
      return false;
    }
    
    const move = engine.makeMove(from, to, promotion);
    if (!move) return false;
    
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    
    // Play sound
    if (engine.isCheck()) {
      soundManager.play('check');
    } else if (move.captured) {
      soundManager.play('capture');
    } else if (move.san.includes('O-O')) {
      soundManager.play('castle');
    } else if (move.promotion) {
      soundManager.play('promote');
    } else {
      soundManager.play('move');
    }
    
    const newState = engine.getGameState();
    
    // Start clock on first move
    if (timeControl && newState.moveHistory.length === 1) {
      setIsClockRunning(true);
    }
    
    // Add increment
    if (timeControl && timeControl.increment > 0) {
      if (newState.turn === 'b') {
        setWhiteTime((prev) => prev + timeControl.increment);
      } else {
        setBlackTime((prev) => prev + timeControl.increment);
      }
    }
    
    setGameState(newState);
    
    if (newState.status !== 'playing') {
      soundManager.play('gameEnd');
      setIsClockRunning(false);
      
      // Clear interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    }
    
    return true;
  }, [gameState.status, gameState.turn, mode, playerColor, timeControl]);

  const confirmPromotion = useCallback((piece: PieceSymbol) => {
    if (!promotionPending) return;
    makeMove(promotionPending.from, promotionPending.to, piece);
    setPromotionPending(null);
  }, [promotionPending, makeMove]);

  const cancelPromotion = useCallback(() => {
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const undoMove = useCallback(() => {
    const engine = engineRef.current;
    
    // In AI mode, undo both player and AI moves
    if (mode === 'ai') {
      engine.undoMove();
      engine.undoMove();
    } else {
      engine.undoMove();
    }
    
    setGameState(engine.getGameState());
    setSelectedSquare(null);
    setLegalMoves([]);
    
    const history = engine.getMoveHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  }, [mode]);

  const redoMove = useCallback(() => {
    const engine = engineRef.current;
    engine.redoMove();
    
    if (mode === 'ai') {
      engine.redoMove();
    }
    
    setGameState(engine.getGameState());
    
    const history = engine.getMoveHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    }
  }, [mode]);

  const resetGame = useCallback(() => {
    const engine = engineRef.current;
    engine.reset();
    setGameState(engine.getGameState());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setIsClockRunning(false);
    
    // Clear interval
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
    
    if (timeControl) {
      const totalSeconds = timeControl.minutes * 60 + timeControl.seconds;
      setWhiteTime(totalSeconds);
      setBlackTime(totalSeconds);
    }
  }, [timeControl]);

  const pauseClock = useCallback(() => {
    setIsClockRunning(false);
    
    // Clear interval when pausing
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  }, []);

  const resumeClock = useCallback(() => {
    if (gameState.status === 'playing' && gameState.moveHistory.length > 0) {
      setIsClockRunning(true);
    }
  }, [gameState.status, gameState.moveHistory.length]);

  const setDifficulty = useCallback((newDifficulty: Difficulty) => {
    engineRef.current.setDifficulty(newDifficulty);
  }, []);

  const setTimeControl = useCallback((newTimeControl: TimeControl | null) => {
    if (newTimeControl) {
      const totalSeconds = newTimeControl.minutes * 60 + newTimeControl.seconds;
      setWhiteTime(totalSeconds);
      setBlackTime(totalSeconds);
    }
  }, []);

  const loadGame = useCallback((fen: string): boolean => {
    const engine = engineRef.current;
    const success = engine.loadFen(fen);
    if (success) {
      setGameState(engine.getGameState());
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(null);
      
      // Clear interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    }
    return success;
  }, []);

  const saveGame = useCallback(() => {
    const engine = engineRef.current;
    const data = {
      fen: engine.getFen(),
      pgn: engine.getPgn(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }, []);

  const resign = useCallback(() => {
    if (gameState.status !== 'playing') return;
    
    const winner: Color = gameState.turn === 'w' ? 'b' : 'w';
    setGameState((prev) => ({
      ...prev,
      status: 'resign' as GameStatusType,
      winner,
    }));
    setIsClockRunning(false);
    soundManager.play('gameEnd');
    
    // Clear interval
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  }, [gameState.status, gameState.turn]);

  return {
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
    setDifficulty,
    setTimeControl,
    canUndo: engineRef.current.canUndo(),
    canRedo: engineRef.current.canRedo(),
    promotionPending,
    confirmPromotion,
    cancelPromotion,
    loadGame,
    saveGame,
    resign,
  };
}