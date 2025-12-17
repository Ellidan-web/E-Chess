import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'pvp' | 'ai';
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout' | 'resign';

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

const POSITION_TABLES: Record<PieceSymbol, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_MIDDLE_TABLE,
};

export class ChessEngine {
  private chess: Chess;
  private difficulty: Difficulty;
  private moveHistoryStack: string[];
  private redoStack: string[];

  constructor() {
    this.chess = new Chess();
    this.difficulty = 'medium';
    this.moveHistoryStack = [];
    this.redoStack = [];
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
  }

  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.moveHistoryStack = [];
      this.redoStack = [];
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
    
    const currentFen = this.chess.fen();
    const previousFen = this.moveHistoryStack.pop()!;
    this.redoStack.push(currentFen);
    
    const lastMove = this.chess.history({ verbose: true }).pop() || null;
    this.chess.load(previousFen);
    
    return lastMove;
  }

  redoMove(): boolean {
    if (this.redoStack.length === 0) return false;
    
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

  // AI Methods
  private evaluateBoard(): number {
    if (this.isCheckmate()) {
      return this.getTurn() === 'w' ? -Infinity : Infinity;
    }
    if (this.isDraw() || this.isStalemate()) {
      return 0;
    }

    let score = 0;
    const board = this.chess.board();

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
    const moves = this.chess.moves().length;
    score += this.getTurn() === 'w' ? moves * 5 : -moves * 5;

    return score;
  }

  private minimax(
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0 || this.isGameOver()) {
      return this.evaluateBoard();
    }

    const moves = this.chess.moves();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        this.chess.move(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, false);
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
        const evaluation = this.minimax(depth - 1, alpha, beta, true);
        this.chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'beginner':
        return 1;
      case 'easy':
        return 2;
      case 'medium':
        return 3;
      case 'hard':
        return 4;
      default:
        return 3;
    }
  }

  private getRandomnessFactor(): number {
    switch (this.difficulty) {
      case 'beginner':
        return 0.4;
      case 'easy':
        return 0.2;
      case 'medium':
        return 0.05;
      case 'hard':
        return 0;
      default:
        return 0.05;
    }
  }

  getBestMove(): Move | null {
    const moves = this.chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = this.getTurn() === 'w';
    const depth = this.getSearchDepth();
    const randomness = this.getRandomnessFactor();

    // Random move chance based on difficulty
    if (Math.random() < randomness) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestMove = moves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      this.chess.move(move);
      const value = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
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

  evaluate(): EvaluationResult {
    return {
      score: this.evaluateBoard(),
      bestMove: this.getBestMove(),
      depth: this.getSearchDepth(),
    };
  }

  // Analysis methods
  analyzeMove(move: Move): 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
    // Save current state
    const currentFen = this.chess.fen();
    
    // Go back before the move
    this.chess.undo();
    
    // Get evaluation before move
    const bestMove = this.getBestMove();
    const bestMoveValue = this.evaluateMoveValue(bestMove);
    
    // Redo the actual move
    this.chess.move(move);
    const actualMoveValue = this.evaluateMoveValue(move);
    
    // Restore state
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

  getPgn(): string {
    return this.chess.pgn();
  }

  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      this.moveHistoryStack = [];
      this.redoStack = [];
      return true;
    } catch {
      return false;
    }
  }
}

export const chessEngine = new ChessEngine();
