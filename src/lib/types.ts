export type MathOperator = '+' | '-' | '*' | '/';
export type OperationSymbol = '+' | '-' | '×' | '÷';

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  operator: MathOperator;
  operationSymbol: OperationSymbol;
  answer: number;
  questionText: string;
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-5 stars
  operators: MathOperator[];
  numberRange: [number, number]; // min and max for operands
  problemCount: number;
  timeLimitSeconds?: number; // Optional: for timed levels
  rewardMessage?: string;
  isSpeedChallenge?: boolean; // Indicates if this level uses adaptive speed logic
}

export interface GameState {
  currentLevel: Level | null;
  problems: Problem[];
  currentProblemIndex: number;
  userAnswer: string;
  score: number;
  lives: number;
  timeLeft: number; // in seconds
  feedback: { type: 'correct' | 'incorrect' | 'info'; message: string } | null;
  isGameOver: boolean;
  startTime: number | null; // Timestamp for speed calculation
  dynamicDifficultyFactor: number; // For adaptive speed challenges (0.0 to 1.0+)
}

export interface GameResult {
  levelId: string;
  levelTitle: string;
  score: number;
  problemsAttempted: number;
  problemsCorrect: number;
  timeTakenSeconds?: number;
  isWin: boolean;
}
