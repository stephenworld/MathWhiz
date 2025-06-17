
"use client";

import type { Level, Problem, GameState, GameResult } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateProblem, checkAnswer, generateProblemsForLevel } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Heart, HelpCircle, Info, Timer } from 'lucide-react';
import PlusIcon from '@/components/icons/PlusIcon';
import MinusIcon from '@/components/icons/MinusIcon';
import MultiplyIcon from '@/components/icons/MultiplyIcon';
import DivideIcon from '@/components/icons/DivideIcon';
import SparkleIcon from '@/components/icons/SparkleIcon';
import { useToast } from '@/hooks/use-toast';

interface GameplayClientProps {
  level: Level;
}

const INITIAL_LIVES = 3;

const getOperatorIcon = (operator: Problem['operator']) => {
  const iconProps = { className: "w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground" };
  switch (operator) {
    case '+': return <PlusIcon {...iconProps} />;
    case '-': return <MinusIcon {...iconProps} />;
    case '*': return <MultiplyIcon {...iconProps} />;
    case '/': return <DivideIcon {...iconProps} />;
    default: return <HelpCircle {...iconProps} />;
  }
};

export default function GameplayClient({ level }: GameplayClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: level,
    problems: [], // Initialize with empty problems
    currentProblemIndex: 0,
    userAnswer: '',
    score: 0,
    lives: INITIAL_LIVES,
    timeLeft: level.timeLimitSeconds ?? -1,
    feedback: null,
    isGameOver: false,
    startTime: null, // Will be set when problems are loaded client-side
    dynamicDifficultyFactor: 1,
  });
  const [clientReady, setClientReady] = useState(false);

  // Effect to generate problems on the client after mount
  useEffect(() => {
    setClientReady(true);
    const problems = generateProblemsForLevel(level);
    setGameState(prev => ({
      ...prev,
      problems: problems,
      startTime: Date.now(), // Set start time when problems are actually ready
    }));
  }, [level]); // Re-generate if level prop changes

  const currentProblem = gameState.problems[gameState.currentProblemIndex];

  // Timer logic
  useEffect(() => {
    if (!clientReady || gameState.timeLeft === -1 || gameState.isGameOver || !gameState.startTime) return;

    if (gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, isGameOver: true, feedback: { type: 'info', message: "Time's up!" } }));
      return;
    }

    const timerId = setInterval(() => {
      setGameState(prev => ({ ...prev, timeLeft: Math.max(0, prev.timeLeft - 1) }));
    }, 1000);

    return () => clearInterval(timerId);
  }, [clientReady, gameState.timeLeft, gameState.isGameOver, gameState.startTime]);

  // Game over logic
  useEffect(() => {
    if (!clientReady || !gameState.isGameOver || !gameState.startTime) return;
    
    const problemsAttempted = gameState.currentProblemIndex + (gameState.feedback?.type !== 'correct' && gameState.feedback !== null ? 1 : 0);
    const problemsCorrect = gameState.score;
    const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);
      
    const result: GameResult = {
        levelId: level.id,
        levelTitle: level.title,
        score: gameState.score,
        problemsAttempted: problemsAttempted,
        problemsCorrect: problemsCorrect,
        timeTakenSeconds: timeTaken,
        isWin: gameState.lives > 0 && (gameState.timeLeft > 0 || gameState.timeLeft === -1) && gameState.currentProblemIndex >= level.problemCount -1 && gameState.feedback?.type === 'correct',
    };

    setTimeout(() => {
        router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`);
    }, 2000);
  }, [clientReady, gameState.isGameOver, gameState.score, gameState.lives, gameState.timeLeft, gameState.currentProblemIndex, gameState.feedback, gameState.startTime, level, router]);


  const handleAnswerSubmit = useCallback(() => {
    if (!clientReady || gameState.isGameOver || !currentProblem) return;

    const answerNum = parseInt(gameState.userAnswer, 10);
    if (isNaN(answerNum)) {
      setGameState(prev => ({ ...prev, feedback: { type: 'info', message: "Please enter a number." }}));
      toast({ title: "Invalid Input", description: "Please enter a valid number.", variant: "destructive" });
      return;
    }

    const isCorrect = checkAnswer(currentProblem.answer, answerNum);
    let newScore = gameState.score;
    let newLives = gameState.lives;
    let immediateFeedback: GameState['feedback'];
    let newDynamicDifficultyFactor = gameState.dynamicDifficultyFactor;

    if (isCorrect) {
      newScore += 1;
      immediateFeedback = { type: 'correct', message: "Correct! Great job!" };
      toast({ title: "Correct!", description: "Awesome work!", className: "bg-green-500 text-white" });
      if (level.isSpeedChallenge) {
        newDynamicDifficultyFactor = Math.min(2.0, gameState.dynamicDifficultyFactor * 1.05); 
      }
    } else {
      newLives -= 1;
      immediateFeedback = { type: 'incorrect', message: `Not quite! The answer was ${currentProblem.answer}.` };
      toast({ title: "Incorrect", description: `The correct answer was ${currentProblem.answer}. Keep trying!`, variant: "destructive" });
       if (level.isSpeedChallenge) {
        newDynamicDifficultyFactor = Math.max(0.5, gameState.dynamicDifficultyFactor * 0.9);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      score: newScore,
      lives: newLives,
      feedback: immediateFeedback,
      userAnswer: '',
      dynamicDifficultyFactor: newDynamicDifficultyFactor,
    }));

    setTimeout(() => {
      setGameState(prev => {
        // Use 'prev' from functional update to ensure latest state
        if (prev.lives <= 0) {
          return { ...prev, isGameOver: true, feedback: { type: 'info', message: "Game Over! Better luck next time." } };
        }
        if (prev.currentProblemIndex >= level.problemCount - 1 && isCorrect) {
          return { ...prev, isGameOver: true, feedback: { type: 'correct', message: level.rewardMessage || "You completed the level!" } };
        }
        if (prev.currentProblemIndex < level.problemCount - 1) {
          const nextProblemValue = level.isSpeedChallenge ? generateProblem(level, prev.dynamicDifficultyFactor) : prev.problems[prev.currentProblemIndex + 1];
          const updatedProblemsList = [...prev.problems];
          if (level.isSpeedChallenge) {
            if (prev.currentProblemIndex + 1 < updatedProblemsList.length) {
              updatedProblemsList[prev.currentProblemIndex + 1] = nextProblemValue;
            } else {
              updatedProblemsList.push(nextProblemValue);
            }
          }
          return {
            ...prev,
            currentProblemIndex: prev.currentProblemIndex + 1,
            problems: level.isSpeedChallenge ? updatedProblemsList : prev.problems,
            feedback: null, // Clear feedback for next problem
          };
        }
        return prev; // No change if none of the conditions met
      });
    }, 1500);

  }, [clientReady, gameState, currentProblem, level, router, toast, checkAnswer, generateProblem]);


  if (!clientReady || !currentProblem) {
    return (
      <Card className="w-full max-w-xl p-6 md:p-8 shadow-xl bg-card rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl sm:text-4xl font-headline text-primary">{level.title}</CardTitle>
          <CardDescription className="text-base sm:text-lg text-foreground/80">{level.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <div role="status" className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-20 bg-muted/70 rounded-lg w-full animate-pulse delay-75"></div>
            <div className="h-14 bg-muted rounded-lg w-full animate-pulse delay-150"></div>
            <div className="h-12 bg-muted rounded-lg w-full animate-pulse delay-200"></div>
            <span className="sr-only">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState.isGameOver && gameState.feedback) {
    const isWin = gameState.lives > 0 && (gameState.timeLeft > 0 || gameState.timeLeft === -1);
    return (
      <Card className="w-full max-w-md p-6 text-center shadow-2xl bg-card/90 backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className={`text-4xl font-bold ${isWin ? 'text-green-500' : 'text-destructive'}`}>
            {isWin ? "Victory!" : "Game Over!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-4">{gameState.feedback.message}</p>
          {isWin && <SparkleIcon className="w-20 h-20 text-yellow-400 mx-auto animate-ping" />}
          <p className="text-lg mt-4">Score: {gameState.score}</p>
          <p className="text-muted-foreground mt-2">Redirecting to results...</p>
        </CardContent>
      </Card>
    );
  }
  
  const progressPercentage = (gameState.currentProblemIndex / level.problemCount) * 100;

  return (
    <Card className="w-full max-w-xl p-6 md:p-8 shadow-xl bg-card rounded-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl sm:text-4xl font-headline text-primary">{level.title}</CardTitle>
        <CardDescription className="text-base sm:text-lg text-foreground/80">{level.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-between items-center text-lg font-semibold">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-6 h-6" /> Score: {gameState.score}
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <Heart className="w-6 h-6" /> Lives: {gameState.lives}
          </div>
          {gameState.timeLeft !== -1 && (
            <div className={`flex items-center gap-2 ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
              <Timer className="w-6 h-6" /> Time: {gameState.timeLeft}s
            </div>
          )}
        </div>

        <div className="my-4">
          <Progress value={progressPercentage} aria-label={`${progressPercentage.toFixed(0)}% complete`} className="w-full h-4 rounded-full" />
          <p className="text-sm text-muted-foreground text-center mt-1">Problem {gameState.currentProblemIndex + 1} of {level.problemCount}</p>
        </div>

        <div className="bg-muted/40 p-4 sm:p-6 rounded-xl text-center shadow-inner">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-secondary-foreground bg-secondary py-4 px-2 rounded-lg flex items-center justify-center gap-3 sm:gap-4 select-none" aria-live="polite">
            <span>{currentProblem.num1}</span>
            {getOperatorIcon(currentProblem.operator)}
            <span>{currentProblem.num2}</span>
            <span>=</span>
            <span className="text-muted-foreground ml-2">?</span>
          </p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="space-y-4">
          <Input
            type="number"
            pattern="\d*"
            value={gameState.userAnswer}
            onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
            placeholder="Your Answer"
            className="text-2xl h-12 text-center rounded-lg focus:ring-2 focus:ring-accent shadow-md"
            aria-label="Enter your answer"
            disabled={!!gameState.feedback || gameState.isGameOver}
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full text-xl py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            disabled={!!gameState.feedback || gameState.isGameOver || !gameState.userAnswer}
            aria-label="Submit Answer"
          >
            Submit
          </Button>
        </form>

        {gameState.feedback && (
          <div className={`mt-4 p-4 rounded-md text-center text-lg font-medium flex items-center justify-center gap-2
            ${gameState.feedback.type === 'correct' ? 'bg-green-100 text-green-700' : ''}
            ${gameState.feedback.type === 'incorrect' ? 'bg-red-100 text-red-700' : ''}
            ${gameState.feedback.type === 'info' ? 'bg-blue-100 text-blue-700' : ''}
          `}>
            {gameState.feedback.type === 'correct' && <CheckCircle className="w-6 h-6" />}
            {gameState.feedback.type === 'incorrect' && <AlertCircle className="w-6 h-6" />}
            {gameState.feedback.type === 'info' && <Info className="w-6 h-6" />}
            {gameState.feedback.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

