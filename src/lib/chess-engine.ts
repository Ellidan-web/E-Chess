import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'pvp' | 'ai';
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout';

export interface TimeControl {
  minutes: number;
  seconds: number;
  increment: number;
}

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  moveHistory: Move[];
  capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] };
  status: GameStatus;
  winner: Color | null;
}

export interface EvaluationResult {
  score: number;
  bestMove: Move | null;
  depth: number;
}

export interface AIProgress {
  depth: number;
  evaluatedNodes: number;
  currentMove: string;
  elapsedTime: number;
  bestMoveSoFar: Move | null;
}

// Piece values for evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Position tables for more sophisticated evaluation
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  5, 10, 10, 10, 10, 10, 10, 5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 0, 5, 5, 0, 0, 0,
];

const QUEEN_TABLE = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -5, 0, 5, 5, 5, 5, 0, -5,
  0, 0, 5, 5, 5, 5, 0, -5,
  -10, 5, 5, 5, 5, 5, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const KING_MIDDLE_TABLE = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

const KING_END_TABLE = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -30, 0, 0, 0, 0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50,
];

const POSITION_TABLES: Record<PieceSymbol, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_MIDDLE_TABLE,
};

// Web Worker code as string to create Blob
const WORKER_CODE = `
  const PIECE_VALUES = ${JSON.stringify(PIECE_VALUES)};
  const POSITION_TABLES = ${JSON.stringify(POSITION_TABLES)};

  function evaluateBoard(chess) {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -Infinity : Infinity;
    }
    if (chess.isDraw() || chess.isStalemate()) {
      return 0;
    }

    let score = 0;
    const board = chess.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceValue = PIECE_VALUES[piece.type];
          const positionTable = POSITION_TABLES[piece.type];
          const positionIndex = piece.color === 'w' ? i * 8 + j : (7 - i) * 8 + j;
          const positionValue = positionTable[positionIndex];

          if (piece.color === 'w') {
            score += pieceValue + positionValue;
          } else {
            score -= pieceValue + positionValue;
          }
        }
      }
    }

    // Add mobility bonus
    const moves = chess.moves().length;
    score += chess.turn() === 'w' ? moves * 5 : -moves * 5;

    return score;
  }

  function minimax(chess, depth, alpha, beta, isMaximizing, maxTime, startTime) {
    if (Date.now() - startTime > maxTime) {
      throw new Error('Timeout');
    }
    
    if (depth === 0 || chess.isGameOver()) {
      return evaluateBoard(chess);
    }

    const moves = chess.moves();
    
    // Order moves for better alpha-beta pruning
    moves.sort((a, b) => {
      // Prioritize captures and checks
      const aIsCapture = a.includes('x');
      const bIsCapture = b.includes('x');
      const aIsCheck = a.includes('+') || a.includes('#');
      const bIsCheck = b.includes('+') || b.includes('#');
      
      if (aIsCapture && !bIsCapture) return -1;
      if (!aIsCapture && bIsCapture) return 1;
      if (aIsCheck && !bIsCheck) return -1;
      if (!aIsCheck && bIsCheck) return 1;
      return 0;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, false, maxTime, startTime);
        chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, true, maxTime, startTime);
        chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function iterativeDeepening(chess, maxDepth, randomness, maxTime) {
    const startTime = Date.now();
    const moves = chess.moves({ verbose: true });
    
    if (moves.length === 0) return null;
    
    // Random move chance based on difficulty
    if (Math.random() < randomness) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const isMaximizing = chess.turn() === 'w';
    let bestMove = moves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Start with depth 1 and go deeper as time allows
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
      let currentBestMove = moves[0];
      let currentBestValue = isMaximizing ? -Infinity : Infinity;

      try {
        for (const move of moves) {
          chess.move(move);
          const value = minimax(chess, currentDepth - 1, -Infinity, Infinity, !isMaximizing, maxTime, startTime);
          chess.undo();

          if (isMaximizing) {
            if (value > currentBestValue) {
              currentBestValue = value;
              currentBestMove = move;
            }
          } else {
            if (value < currentBestValue) {
              currentBestValue = value;
              currentBestMove = move;
            }
          }

          // Check time after each move evaluation
          if (Date.now() - startTime > maxTime * 0.8) {
            throw new Error('Running out of time');
          }
        }

        // Only update if we completed this depth successfully
        bestMove = currentBestMove;
        bestValue = currentBestValue;

        // Send progress update
        self.postMessage({
          type: 'progress',
          depth: currentDepth,
          bestMove: bestMove
        });

      } catch (error) {
        // Timeout or error - use the best result from previous depth
        break;
      }

      // Check if we have time for another depth
      if (Date.now() - startTime > maxTime * 0.6) {
        break;
      }
    }

    return bestMove;
  }

  self.onmessage = (e) => {
    const { fen, maxDepth, randomness, timeout } = e.data;
    
    const chess = new Chess(fen);
    const startTime = Date.now();
    
    try {
      const bestMove = iterativeDeepening(chess, maxDepth, randomness, timeout);
      self.postMessage({
        type: 'result',
        bestMove,
        elapsedTime: Date.now() - startTime
      });
    } catch (error) {
      // Fallback: return a quick move if calculation fails
      const moves = chess.moves({ verbose: true });
      const quickMove = moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
      self.postMessage({
        type: 'result',
        bestMove: quickMove,
        elapsedTime: Date.now() - startTime,
        error: error.message
      });
    }
  };
`;

export class ChessEngine {
  private chess: Chess;
  private difficulty: Difficulty;
  private moveHistoryStack: string[];
  private redoStack: string[];
  private worker: Worker | null = null;
  private isWorkerInitialized: boolean = false;
  private calculationAbortController: AbortController | null = null;

  // AI progress tracking
  private aiProgressCallback: ((progress: AIProgress) => void) | null = null;
  private evaluatedNodes: number = 0;
  private calculationStartTime: number = 0;

  constructor() {
    this.chess = new Chess();
    this.difficulty = 'medium';
    this.moveHistoryStack = [];
    this.redoStack = [];
  }

  // Initialize worker lazily
  private ensureWorker(): Worker | null {
    if (typeof Worker === 'undefined') {
      return null;
    }

    if (!this.isWorkerInitialized || !this.worker) {
      try {
        const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.isWorkerInitialized = true;

        // Set up progress listener
        this.worker.onmessage = (e) => {
          if (e.data.type === 'progress' && this.aiProgressCallback) {
            this.aiProgressCallback({
              depth: e.data.depth,
              evaluatedNodes: this.evaluatedNodes,
              currentMove: e.data.bestMove ? `${e.data.bestMove.from}-${e.data.bestMove.to}` : '',
              elapsedTime: Date.now() - this.calculationStartTime,
              bestMoveSoFar: e.data.bestMove
            });
          }
        };
      } catch (error) {
        console.warn('Web Worker initialization failed:', error);
        this.worker = null;
      }
    }

    return this.worker;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  reset(): void {
    this.chess.reset();
    this.moveHistoryStack = [];
    this.redoStack = [];
    this.stopCalculation();
  }

  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.moveHistoryStack = [];
      this.redoStack = [];
      this.stopCalculation();
      return true;
    } catch {
      return false;
    }
  }

  getFen(): string {
    return this.chess.fen();
  }

  getTurn(): Color {
    return this.chess.turn();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isCheck(): boolean {
    return this.chess.isCheck();
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  isDraw(): boolean {
    return this.chess.isDraw();
  }

  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  getLegalMoves(square?: Square): Move[] {
    return this.chess.moves({ square, verbose: true });
  }

  makeMove(from: Square, to: Square, promotion?: PieceSymbol): Move | null {
    try {
      this.moveHistoryStack.push(this.chess.fen());
      this.redoStack = [];
      this.stopCalculation();
      
      const move = this.chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });
      
      if (!move) {
        this.moveHistoryStack.pop();
        return null;
      }
      
      return move;
    } catch {
      this.moveHistoryStack.pop();
      return null;
    }
  }

  undoMove(): Move | null {
    if (this.moveHistoryStack.length === 0) return null;
    this.stopCalculation();
    
    const currentFen = this.chess.fen();
    const previousFen = this.moveHistoryStack.pop()!;
    this.redoStack.push(currentFen);
    
    const lastMove = this.chess.history({ verbose: true }).pop() || null;
    this.chess.load(previousFen);
    
    return lastMove;
  }

  redoMove(): boolean {
    if (this.redoStack.length === 0) return false;
    this.stopCalculation();
    
    const nextFen = this.redoStack.pop()!;
    this.moveHistoryStack.push(this.chess.fen());
    this.chess.load(nextFen);
    
    return true;
  }

  canUndo(): boolean {
    return this.moveHistoryStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getMoveHistory(): Move[] {
    return this.chess.history({ verbose: true });
  }

  getBoard(): ({ type: PieceSymbol; color: Color } | null)[][] {
    return this.chess.board();
  }

  getPiece(square: Square): { type: PieceSymbol; color: Color } | null {
    return this.chess.get(square);
  }

  getKingSquare(color: Color): Square | null {
    const board = this.chess.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.type === 'k' && piece.color === color) {
          const file = String.fromCharCode(97 + j);
          const rank = 8 - i;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }

  getCapturedPieces(): { white: PieceSymbol[]; black: PieceSymbol[] } {
    const history = this.chess.history({ verbose: true });
    const captured: { white: PieceSymbol[]; black: PieceSymbol[] } = {
      white: [],
      black: [],
    };

    for (const move of history) {
      if (move.captured) {
        if (move.color === 'w') {
          captured.black.push(move.captured);
        } else {
          captured.white.push(move.captured);
        }
      }
    }

    return captured;
  }

  getGameState(): GameState {
    let status: GameStatus = 'playing';
    let winner: Color | null = null;

    if (this.isCheckmate()) {
      status = 'checkmate';
      winner = this.getTurn() === 'w' ? 'b' : 'w';
    } else if (this.isStalemate()) {
      status = 'stalemate';
    } else if (this.isDraw()) {
      status = 'draw';
    }

    return {
      fen: this.getFen(),
      turn: this.getTurn(),
      isCheck: this.isCheck(),
      isCheckmate: this.isCheckmate(),
      isStalemate: this.isStalemate(),
      isDraw: this.isDraw(),
      moveHistory: this.getMoveHistory(),
      capturedPieces: this.getCapturedPieces(),
      status,
      winner,
    };
  }

  // AI Configuration
  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'beginner': return 2;
      case 'easy': return 3;
      case 'medium': return 5;  // Will use iterative deepening up to 5
      case 'hard': return 7;    // Will use iterative deepening up to 7
      default: return 4;
    }
  }

  private getRandomnessFactor(): number {
    switch (this.difficulty) {
      case 'beginner': return 0.3;
      case 'easy': return 0.1;
      case 'medium': return 0.02;
      case 'hard': return 0;
      default: return 0.02;
    }
  }

  private getTimeLimit(): number {
    switch (this.difficulty) {
      case 'beginner': return 2000;    // 2 seconds
      case 'easy': return 3000;        // 3 seconds
      case 'medium': return 5000;      // 5 seconds
      case 'hard': return 8000;        // 8 seconds
      default: return 4000;
    }
  }

  // Board evaluation
  private evaluateBoard(): number {
    if (this.isCheckmate()) {
      return this.getTurn() === 'w' ? -Infinity : Infinity;
    }
    if (this.isDraw() || this.isStalemate()) {
      return 0;
    }

    let score = 0;
    const board = this.chess.board();

    // Determine if it's endgame for king evaluation
    const totalPieces = board.flat().filter(p => p && p.type !== 'k').length;
    const isEndgame = totalPieces <= 10;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceValue = PIECE_VALUES[piece.type];
          
          // Use appropriate king table for game phase
          let positionTable = POSITION_TABLES[piece.type];
          if (piece.type === 'k' && isEndgame) {
            positionTable = KING_END_TABLE;
          }
          
          const positionIndex = piece.color === 'w' ? i * 8 + j : (7 - i) * 8 + j;
          const positionValue = positionTable[positionIndex];

          if (piece.color === 'w') {
            score += pieceValue + positionValue;
          } else {
            score -= pieceValue + positionValue;
          }
        }
      }
    }

    // Add mobility bonus
    const moves = this.chess.moves().length;
    score += this.getTurn() === 'w' ? moves * 2 : -moves * 2;

    return score;
  }

  // AI Calculation Control
  setAIProgressCallback(callback: (progress: AIProgress) => void): void {
    this.aiProgressCallback = callback;
  }

  stopCalculation(): void {
    if (this.calculationAbortController) {
      this.calculationAbortController.abort();
      this.calculationAbortController = null;
    }
    
    if (this.worker) {
      this.worker.terminate();
      this.isWorkerInitialized = false;
      this.worker = null;
    }
    
    this.evaluatedNodes = 0;
  }

  // Main AI method - ASYNC VERSION
  async getBestMoveAsync(): Promise<Move | null> {
    this.stopCalculation();
    
    const moves = this.chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Quick return for trivial positions
    if (moves.length === 1) {
      return moves[0];
    }

    const randomness = this.getRandomnessFactor();
    
    // Random move chance (only for easier difficulties)
    if (Math.random() < randomness) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Use worker for medium/hard, sync for beginner/easy
    const worker = this.ensureWorker();
    const maxDepth = this.getSearchDepth();
    const timeLimit = this.getTimeLimit();

    // For beginner/easy, use quick sync calculation
    if (this.difficulty === 'beginner' || this.difficulty === 'easy' || !worker) {
      return this.getBestMoveSync(timeLimit);
    }

    // For medium/hard, use worker with iterative deepening
    return new Promise((resolve) => {
      this.calculationStartTime = Date.now();
      this.calculationAbortController = new AbortController();
      
      const timeoutId = setTimeout(() => {
        this.stopCalculation();
        // Return quick move on timeout
        resolve(this.getQuickBestMove());
      }, timeLimit + 1000); // Extra second grace period

      const workerHandler = (e: MessageEvent) => {
        clearTimeout(timeoutId);
        
        if (e.data.type === 'result') {
          this.stopCalculation();
          
          if (e.data.bestMove) {
            resolve(e.data.bestMove);
          } else {
            // Fallback to quick move
            resolve(this.getQuickBestMove());
          }
        }
      };

      worker.addEventListener('message', workerHandler);
      
      worker.postMessage({
        fen: this.chess.fen(),
        maxDepth,
        randomness: 0, // Already handled
        timeout: timeLimit
      });
    });
  }

  // SYNC version with optimizations
  private getBestMoveSync(timeLimit: number): Move | null {
    const startTime = Date.now();
    const moves = this.chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = this.getTurn() === 'w';
    const maxDepth = Math.min(this.getSearchDepth(), 4); // Cap depth for sync
    
    let bestMove = moves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Iterative deepening with time management
    for (let depth = 1; depth <= maxDepth; depth++) {
      let currentBestMove = moves[0];
      let currentBestValue = isMaximizing ? -Infinity : Infinity;

      // Simple move ordering
      const orderedMoves = [...moves].sort((a, b) => {
        const aIsCapture = a.captured ? 1 : 0;
        const bIsCapture = b.captured ? 1 : 0;
        return bIsCapture - aIsCapture;
      });

      for (const move of orderedMoves) {
        // Check time
        if (Date.now() - startTime > timeLimit * 0.8) {
          return bestMove; // Return best from previous depth
        }

        this.chess.move(move);
        const value = this.quickMinimax(depth - 1, -Infinity, Infinity, !isMaximizing, startTime, timeLimit);
        this.chess.undo();

        if (isMaximizing) {
          if (value > currentBestValue) {
            currentBestValue = value;
            currentBestMove = move;
          }
        } else {
          if (value < currentBestValue) {
            currentBestValue = value;
            currentBestMove = move;
          }
        }
      }

      bestMove = currentBestMove;
      bestValue = currentBestValue;

      // Check if we have time for another depth
      if (Date.now() - startTime > timeLimit * 0.6) {
        break;
      }
    }

    return bestMove;
  }

  private quickMinimax(
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    startTime: number,
    timeLimit: number
  ): number {
    // Time check
    if (Date.now() - startTime > timeLimit) {
      return this.evaluateBoard();
    }

    if (depth === 0 || this.isGameOver()) {
      return this.evaluateBoard();
    }

    const moves = this.chess.moves();
    if (moves.length === 0) {
      return this.evaluateBoard();
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        this.chess.move(move);
        const evaluation = this.quickMinimax(depth - 1, alpha, beta, false, startTime, timeLimit);
        this.chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        this.chess.move(move);
        const evaluation = this.quickMinimax(depth - 1, alpha, beta, true, startTime, timeLimit);
        this.chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private getQuickBestMove(): Move | null {
    const moves = this.chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = this.getTurn() === 'w';
    let bestMove = moves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Quick 1-ply evaluation
    for (const move of moves) {
      this.chess.move(move);
      const value = this.evaluateBoard();
      this.chess.undo();

      if (isMaximizing) {
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      } else {
        if (value < bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  // Legacy sync method (for backward compatibility)
  getBestMove(): Move | null {
    console.warn('getBestMove() is synchronous and may freeze UI. Use getBestMoveAsync() instead.');
    return this.getBestMoveSync(3000);
  }

  // Evaluation
  evaluate(): EvaluationResult {
    return {
      score: this.evaluateBoard(),
      bestMove: this.getQuickBestMove(),
      depth: this.getSearchDepth(),
    };
  }

  // Analysis methods
  analyzeMove(move: Move): 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
    const currentFen = this.chess.fen();
    
    this.chess.undo();
    const bestMove = this.getQuickBestMove();
    const bestMoveValue = this.evaluateMoveValue(bestMove);
    
    this.chess.move(move);
    const actualMoveValue = this.evaluateMoveValue(move);
    
    this.chess.load(currentFen);
    
    const diff = Math.abs(bestMoveValue - actualMoveValue);
    
    if (diff < 10) return 'best';
    if (diff < 50) return 'good';
    if (diff < 100) return 'inaccuracy';
    if (diff < 200) return 'mistake';
    return 'blunder';
  }

  private evaluateMoveValue(move: Move | null): number {
    if (!move) return 0;
    this.chess.move(move);
    const value = this.evaluateBoard();
    this.chess.undo();
    return value;
  }

  // PGN methods
  getPgn(): string {
    return this.chess.pgn();
  }

  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      this.moveHistoryStack = [];
      this.redoStack = [];
      this.stopCalculation();
      return true;
    } catch {
      return false;
    }
  }

  // Cleanup
  destroy(): void {
    this.stopCalculation();
  }
}

export const chessEngine = new ChessEngine();
