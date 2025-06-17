"use client";

import type { Level, Problem, GameState, GameResult } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter }
 
from 'next/navigation';
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
  const iconProps = { className: "w-8 h-8 sm:w-10 sm:h-10 text-primary" };
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
  
  const initialProblems = useMemo(() => generateProblemsForLevel(level), [level]);

  const [gameState, setGameState] = useState<GameState>(() => ({
    currentLevel: level,
    problems: initialProblems,
    currentProblemIndex: 0,
    userAnswer: '',
    score: 0,
    lives: INITIAL_LIVES,
    timeLeft: level.timeLimitSeconds ?? -1, // -1 for no timer
    feedback: null,
    isGameOver: false,
    startTime: Date.now(),
    dynamicDifficultyFactor: 1, // Initial factor for speed challenges
  }));

  const currentProblem = gameState.problems[gameState.currentProblemIndex];

  // Timer logic
  useEffect(() => {
    if (gameState.timeLeft === -1 || gameState.isGameOver) return; // No timer or game over

    if (gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, isGameOver: true, feedback: { type: 'info', message: "Time's up!" } }));
      return;
    }

    const timerId = setInterval(() => {
      setGameState(prev => ({ ...prev, timeLeft: Math.max(0, prev.timeLeft - 1) }));
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState.timeLeft, gameState.isGameOver]);

  // Game over logic
  useEffect(() => {
    if (gameState.isGameOver) {
      const problemsAttempted = gameState.currentProblemIndex + (gameState.feedback?.type !== 'correct' && gameState.feedback !== null ? 1 : 0);
      const problemsCorrect = gameState.score;
      const timeTaken = gameState.startTime ? Math.floor((Date.now() - gameState.startTime) / 1000) : undefined;
      
      const result: GameResult = {
        levelId: level.id,
        levelTitle: level.title,
        score: gameState.score,
        problemsAttempted: problemsAttempted,
        problemsCorrect: problemsCorrect,
        timeTakenSeconds: timeTaken,
        isWin: gameState.lives > 0 && (gameState.timeLeft > 0 || gameState.timeLeft === -1) && gameState.currentProblemIndex >= level.problemCount -1 && gameState.feedback?.type === 'correct',
      };

      // Short delay before navigating to results page
      setTimeout(() => {
         router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`);
      }, 2000);
    }
  }, [gameState.isGameOver, gameState, level, router]);


  const handleAnswerSubmit = useCallback(() => {
    if (gameState.isGameOver || !currentProblem) return;

    const answerNum = parseInt(gameState.userAnswer, 10);
    if (isNaN(answerNum)) {
      setGameState(prev => ({ ...prev, feedback: { type: 'info', message: "Please enter a number." }}));
      toast({ title: "Invalid Input", description: "Please enter a valid number.", variant: "destructive" });
      return;
    }

    const isCorrect = checkAnswer(currentProblem.answer, answerNum);
    let newScore = gameState.score;
    let newLives = gameState.lives;
    let newFeedback: GameState['feedback'];
    let newProblemIndex = gameState.currentProblemIndex;
    let newDynamicDifficultyFactor = gameState.dynamicDifficultyFactor;

    if (isCorrect) {
      newScore += 1;
      newFeedback = { type: 'correct', message: "Correct! Great job!" };
      toast({ title: "Correct!", description: "Awesome work!", className: "bg-green-500 text-white" });
      if (level.isSpeedChallenge) {
        // Example: increase difficulty by 5% for fast correct answer
        newDynamicDifficultyFactor = Math.min(2.0, newDynamicDifficultyFactor * 1.05); 
      }
    } else {
      newLives -= 1;
      newFeedback = { type: 'incorrect', message: `Not quite! The answer was ${currentProblem.answer}.` };
      toast({ title: "Incorrect", description: `The correct answer was ${currentProblem.answer}. Keep trying!`, variant: "destructive" });
       if (level.isSpeedChallenge) {
        // Example: decrease difficulty by 10% for incorrect answer
        newDynamicDifficultyFactor = Math.max(0.5, newDynamicDifficultyFactor * 0.9);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      score: newScore,
      lives: newLives,
      feedback: newFeedback,
      userAnswer: '',
      dynamicDifficultyFactor: newDynamicDifficultyFactor,
    }));

    // Move to next problem or end game
    setTimeout(() => {
      if (newLives <= 0) {
        setGameState(prev => ({ ...prev, isGameOver: true, feedback: { type: 'info', message: "Game Over! Better luck next time." } }));
      } else if (gameState.currentProblemIndex >= level.problemCount - 1 && isCorrect) { // Check if it was the last problem AND correct
        setGameState(prev => ({ ...prev, isGameOver: true, feedback: { type: 'correct', message: level.rewardMessage || "You completed the level!" } }));
      } else if (gameState.currentProblemIndex < level.problemCount -1) { // If not last problem, move to next
        const nextProblem = level.isSpeedChallenge ? generateProblem(level, newDynamicDifficultyFactor) : gameState.problems[newProblemIndex + 1];
        const updatedProblems = [...gameState.problems];
        if (level.isSpeedChallenge) {
            updatedProblems[newProblemIndex + 1] = nextProblem;
        }

        setGameState(prev => ({
            ...prev,
            currentProblemIndex: prev.currentProblemIndex + 1,
            problems: updatedProblems,
            feedback: null, // Clear feedback for next problem
        }));

      } else if (gameState.currentProblemIndex >= level.problemCount -1 && !isCorrect) { // Last problem but incorrect
         // Player might be stuck on last problem with lives left. Option to end or retry.
         // For now, if lives > 0, they can try again or it will be game over if they run out of lives.
         // This logic means they have to get the last problem correct to "win".
         // If lives run out on the last problem, it's game over.
         // If they already got it wrong and this is the timeout, it's still game over (from lives <=0 check)
      }
    }, 1500); // Delay to show feedback

  }, [gameState, currentProblem, level, router, toast]);

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
  
  if (!currentProblem) {
    // This should ideally not happen if isGameOver is handled correctly.
    return (
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader><CardTitle>Loading Problem...</CardTitle></CardHeader>
        <CardContent><p>Please wait.</p></CardContent>
      </Card>
    );
  }

  const progressPercentage = (gameState.currentProblemIndex / level.problemCount) * 100;

  return (
    <Card className="w-full max-w-xl p-4 sm:p-6 md:p-8 shadow-2xl bg-card/90 backdrop-blur-sm rounded-2xl border-2 border-primary/30">
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

        <div className="bg-primary/10 p-6 sm:p-8 rounded-xl text-center shadow-inner">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground bg-primary py-4 px-2 rounded-lg flex items-center justify-center gap-3 sm:gap-4 select-none" aria-live="polite">
            <span>{currentProblem.num1}</span>
            {getOperatorIcon(currentProblem.operator)}
            <span>{currentProblem.num2}</span>
            <span className="text-foreground/50">= ?</span>
          </p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="space-y-4">
          <Input
            type="number" // Changed to number for better mobile UX
            pattern="\d*" // Allow only digits
            value={gameState.userAnswer}
            onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
            placeholder="Your Answer"
            className="text-2xl sm:text-3xl h-16 sm:h-20 text-center rounded-lg focus:ring-2 focus:ring-accent shadow-md"
            aria-label="Enter your answer"
            disabled={!!gameState.feedback || gameState.isGameOver}
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full text-xl sm:text-2xl py-6 sm:py-7 rounded-lg btn-3d-accent"
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
