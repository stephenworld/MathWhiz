
"use client";

import type { Level, Problem, GameState, GameResult } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateProblem, checkAnswer, generateProblemsForLevel } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Heart, HelpCircle, Info, Timer, Hourglass, Lock, Crown } from 'lucide-react';
import PlusIcon from '@/components/icons/PlusIcon';
import MinusIcon from '@/components/icons/MinusIcon';
import MultiplyIcon from '@/components/icons/MultiplyIcon';
import DivideIcon from '@/components/icons/DivideIcon';
import SparkleIcon from '@/components/icons/SparkleIcon';
import { useToast } from '@/hooks/use-toast';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface GameplayClientProps {
  level: Level;
}

const INITIAL_LIVES = 3;

const getOperatorIcon = (operator: Problem['operator']) => {
  const iconProps = { className: "w-10 h-10 text-secondary-foreground" };
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
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: level,
    problems: [],
    currentProblemIndex: 0,
    userAnswer: '',
    score: 0,
    lives: INITIAL_LIVES,
    timeLeft: level.timeLimitSeconds ?? -1,
    questionTimeLeft: level.timePerQuestionSeconds ?? -1,
    feedback: null,
    isGameOver: false,
    startTime: null,
    dynamicDifficultyFactor: 1,
  });
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
    // Problem generation moved to a separate effect to wait for premium check
  }, []);
  
  useEffect(() => {
    if (clientReady && !isPremiumLoading && (!level.requiresPremium || isPremium)) {
      const problems = generateProblemsForLevel(level);
      setGameState(prev => ({
        ...prev,
        problems: problems,
        startTime: Date.now(),
        questionTimeLeft: level.timePerQuestionSeconds ?? -1,
      }));
    }
  }, [clientReady, level, isPremium, isPremiumLoading]);


  const currentProblem = gameState.problems[gameState.currentProblemIndex];

  // Overall Level Timer logic
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

  // Per-Question Timer Logic
  useEffect(() => {
    if (!clientReady || gameState.questionTimeLeft === -1 || gameState.isGameOver || !currentProblem || gameState.feedback) return;

    if (gameState.questionTimeLeft === 0) {
      handleQuestionTimeUp();
      return;
    }

    const questionTimerId = setInterval(() => {
      setGameState(prev => ({ ...prev, questionTimeLeft: Math.max(0, prev.questionTimeLeft - 1) }));
    }, 1000);

    return () => clearInterval(questionTimerId);
  }, [clientReady, gameState.questionTimeLeft, gameState.isGameOver, currentProblem, gameState.feedback]);


  // Game over logic
  useEffect(() => {
    if (!clientReady || !gameState.isGameOver || !gameState.startTime) return;
    
    const isWin = gameState.lives > 0 && (gameState.timeLeft > 0 || gameState.timeLeft === -1) && gameState.currentProblemIndex >= level.problemCount - 1 && gameState.feedback?.type === 'correct';
    
    let problemsAttempted;
    if (isWin) {
      problemsAttempted = level.problemCount;
    } else if (gameState.feedback?.message === "Time's up!") { // Overall level timer ran out
      problemsAttempted = gameState.currentProblemIndex;
    } else { // Lost all lives, or got final question wrong, or question timer ran out
      problemsAttempted = gameState.currentProblemIndex + 1;
    }
    
    const problemsCorrect = gameState.score;
    const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);
      
    const result: GameResult = {
        levelId: level.id,
        levelTitle: level.title,
        score: gameState.score,
        problemsAttempted: problemsAttempted,
        problemsCorrect: problemsCorrect,
        timeTakenSeconds: timeTaken,
        isWin: isWin,
    };

    setTimeout(() => {
        router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`);
    }, 2000);
  }, [clientReady, gameState.isGameOver, gameState.score, gameState.lives, gameState.timeLeft, gameState.currentProblemIndex, gameState.feedback, gameState.startTime, level, router]);


  const proceedToNextState = useCallback((isCorrect: boolean | null, newScore: number, newLives: number, feedbackMessage: string, feedbackType: 'correct' | 'incorrect' | 'info') => {
    setGameState(prev => ({
      ...prev,
      score: newScore,
      lives: newLives,
      feedback: { type: feedbackType, message: feedbackMessage },
      userAnswer: '',
    }));

    setTimeout(() => {
      setGameState(prev => {
        if (prev.lives <= 0) {
          return { ...prev, isGameOver: true, feedback: { type: 'info', message: "Game Over! Better luck next time." } };
        }
        if (prev.currentProblemIndex >= level.problemCount - 1 && (isCorrect === null || isCorrect)) { // isCorrect can be null for time up on last question
          return { ...prev, isGameOver: true, feedback: { type: isCorrect ? 'correct' : 'info', message: isCorrect ? (level.rewardMessage || "You completed the level!") : feedbackMessage } };
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
            feedback: null,
            questionTimeLeft: level.timePerQuestionSeconds ?? -1, // Reset question timer
          };
        }
        // If it's the last problem and it was incorrect (or time up) but lives > 0
        if (prev.currentProblemIndex >= level.problemCount - 1 && !isCorrect && prev.lives > 0) {
             return { ...prev, isGameOver: true, feedback: { type: 'info', message: "Game Over! You ran out of questions or made a mistake on the last one." } };
        }
        return prev;
      });
    }, 1500);
  }, [level]);

  const handleQuestionTimeUp = useCallback(() => {
    if (!clientReady || gameState.isGameOver || !currentProblem || gameState.feedback) return;

    toast({ title: "Time's Up!", description: `The correct answer was ${currentProblem.answer}.`, variant: "destructive" });
    let newDynamicDifficultyFactor = gameState.dynamicDifficultyFactor;
    if (level.isSpeedChallenge) {
      newDynamicDifficultyFactor = Math.max(0.5, gameState.dynamicDifficultyFactor * 0.9);
    }
    setGameState(prev => ({...prev, dynamicDifficultyFactor: newDynamicDifficultyFactor})); // Update difficulty factor before calling proceed
    proceedToNextState(false, gameState.score, gameState.lives - 1, `Time's up! The answer was ${currentProblem.answer}.`, 'incorrect');
  }, [clientReady, gameState, currentProblem, level, toast, proceedToNextState]);


  const handleAnswerSubmit = useCallback(() => {
    if (!clientReady || gameState.isGameOver || !currentProblem || gameState.feedback) return;

    const answerNum = parseInt(gameState.userAnswer, 10);
    if (isNaN(answerNum)) {
      setGameState(prev => ({ ...prev, feedback: { type: 'info', message: "Please enter a number." }}));
      toast({ title: "Invalid Input", description: "Please enter a valid number.", variant: "destructive" });
      return;
    }

    const isCorrect = checkAnswer(currentProblem.answer, answerNum);
    let newScore = gameState.score;
    let newLives = gameState.lives;
    let feedbackMessage: string;
    let feedbackType: 'correct' | 'incorrect';
    let newDynamicDifficultyFactor = gameState.dynamicDifficultyFactor;

    if (isCorrect) {
      newScore += 1;
      feedbackMessage = "Correct! Great job!";
      feedbackType = 'correct';
      toast({ title: "Correct!", description: "Awesome work!", className: "bg-green-500 text-white" });
      if (level.isSpeedChallenge) {
        newDynamicDifficultyFactor = Math.min(2.0, gameState.dynamicDifficultyFactor * 1.05); 
      }
    } else {
      newLives -= 1;
      feedbackMessage = `Not quite! The answer was ${currentProblem.answer}.`;
      feedbackType = 'incorrect';
      toast({ title: "Incorrect", description: `The correct answer was ${currentProblem.answer}. Keep trying!`, variant: "destructive" });
       if (level.isSpeedChallenge) {
        newDynamicDifficultyFactor = Math.max(0.5, gameState.dynamicDifficultyFactor * 0.9);
      }
    }
    setGameState(prev => ({...prev, dynamicDifficultyFactor: newDynamicDifficultyFactor})); // Update difficulty factor
    proceedToNextState(isCorrect, newScore, newLives, feedbackMessage, feedbackType);

  }, [clientReady, gameState, currentProblem, level, toast, proceedToNextState]);


  if (isPremiumLoading || !clientReady) {
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
            <span className="sr-only">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLocked = level.requiresPremium && !isPremium;
  if (isLocked) {
    return (
       <Card className="w-full max-w-md p-6 text-center shadow-2xl bg-card/90 backdrop-blur-sm rounded-xl border-2 border-yellow-400">
        <CardHeader>
          <Lock className="mx-auto h-16 w-16 mb-4 text-yellow-500"/>
          <CardTitle className="text-3xl font-bold text-primary">Level Locked!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">This is a premium level. Upgrade to play!</p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={() => router.push('/premium')} className="w-full text-lg py-6 btn-3d-accent bg-yellow-500 hover:bg-yellow-600">
            <Crown className="mr-2 h-5 w-5" /> Go Premium
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentProblem) {
    // This state can happen briefly while problems are being generated.
    return (
      <Card className="w-full max-w-xl p-6 md:p-8 shadow-xl bg-card rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl sm:text-4xl font-headline text-primary">{level.title}</CardTitle>
          <CardDescription className="text-base sm:text-lg text-foreground/80">{level.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Generating problems...</p>
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
    <Card className="w-full max-w-xl p-4 sm:p-6 shadow-xl bg-card rounded-2xl">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">{level.title}</CardTitle>
        <CardDescription className="text-sm sm:text-base text-foreground/80">{level.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-base sm:text-lg font-semibold">
          <div className="flex items-center gap-1 sm:gap-2 text-primary">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Score: {gameState.score}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-red-500">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" /> Lives: {gameState.lives}
          </div>
          {gameState.timeLeft !== -1 && (
            <div className={`flex items-center gap-1 sm:gap-2 ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
              <Timer className="w-5 h-5 sm:w-6 sm:h-6" /> Level: {gameState.timeLeft}s
            </div>
          )}
           {gameState.questionTimeLeft !== -1 && (
            <div className={`col-span-2 sm:col-span-1 sm:justify-self-end flex items-center gap-1 sm:gap-2 ${gameState.questionTimeLeft < (level.timePerQuestionSeconds ?? 10) / 2  ? 'text-orange-500' : 'text-blue-500'} ${gameState.questionTimeLeft < 5 ? 'animate-pulse' : ''}`}>
              <Hourglass className="w-5 h-5 sm:w-6 sm:h-6" /> Question: {gameState.questionTimeLeft}s
            </div>
          )}
        </div>

        <div className="my-3">
          <Progress value={progressPercentage} aria-label={`${progressPercentage.toFixed(0)}% complete`} className="w-full h-3 sm:h-4 rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">Problem {gameState.currentProblemIndex + 1} of {level.problemCount}</p>
        </div>

        <div className="bg-muted/40 p-4 sm:p-6 rounded-xl text-center shadow-inner">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-secondary-foreground bg-secondary py-4 px-2 rounded-lg flex items-center justify-center gap-3 sm:gap-4 select-none" aria-live="polite">
            <span>{currentProblem.num1}</span>
            {getOperatorIcon(currentProblem.operator)}
            <span>{currentProblem.num2}</span>
            <span>=</span>
            <span className="text-muted-foreground ml-1 sm:ml-2">?</span>
          </p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="space-y-4">
          <Input
            type="number"
            pattern="\d*"
            value={gameState.userAnswer}
            onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
            placeholder="Your Answer"
            className="text-2xl sm:text-3xl h-12 sm:h-14 text-center rounded-lg focus:ring-2 focus:ring-accent shadow-sm"
            aria-label="Enter your answer"
            disabled={!!gameState.feedback || gameState.isGameOver}
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full text-xl sm:text-2xl py-3 sm:py-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground btn-3d"
            disabled={!!gameState.feedback || gameState.isGameOver || !gameState.userAnswer}
            aria-label="Submit Answer"
          >
            Submit
          </Button>
        </form>

        {gameState.feedback && (
          <div className={`mt-3 p-3 rounded-md text-center text-base sm:text-lg font-medium flex items-center justify-center gap-2
            ${gameState.feedback.type === 'correct' ? 'bg-green-100 text-green-700' : ''}
            ${gameState.feedback.type === 'incorrect' ? 'bg-red-100 text-red-700' : ''}
            ${gameState.feedback.type === 'info' ? 'bg-blue-100 text-blue-700' : ''}
          `}>
            {gameState.feedback.type === 'correct' && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            {gameState.feedback.type === 'incorrect' && <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            {gameState.feedback.type === 'info' && <Info className="w-5 h-5 sm:w-6 sm:h-6" />}
            {gameState.feedback.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
