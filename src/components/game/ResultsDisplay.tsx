"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import type { GameResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Repeat, Home, Target, Zap } from 'lucide-react';
import ConfettiAnimation from './ConfettiAnimation'; // Assuming this component will be created

export default function ResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  let result: GameResult | null = null;
  if (data) {
    try {
      result = JSON.parse(decodeURIComponent(data));
    } catch (error) {
      console.error("Failed to parse game result data:", error);
    }
  }

  if (!result) {
    return (
      <Card className="w-full max-w-lg p-8 text-center shadow-2xl bg-card/90 backdrop-blur-sm rounded-xl border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-destructive">Error!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">Could not load game results. Something went wrong.</p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={() => router.push('/levels')} className="w-full sm:w-auto text-lg py-6 btn-3d">
            <Home className="mr-2 h-5 w-5" /> Back to Levels
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { levelTitle, score, problemsCorrect, problemsAttempted, timeTakenSeconds, isWin } = result;
  const accuracy = problemsAttempted > 0 ? ((problemsCorrect / problemsAttempted) * 100).toFixed(0) : 0;

  return (
    <Card className="w-full max-w-2xl p-6 md:p-10 text-center shadow-2xl relative overflow-hidden bg-card/90 backdrop-blur-sm rounded-2xl border-2 border-primary/30">
      {isWin && <ConfettiAnimation />}
      <CardHeader className="pb-4">
        <Award className={`mx-auto h-20 w-20 mb-4 ${isWin ? 'text-yellow-400' : 'text-muted-foreground/50'}`} />
        <CardTitle className={`text-4xl md:text-5xl font-headline font-bold ${isWin ? 'text-primary' : 'text-destructive'}`}>
          {isWin ? `Way to Go, Math Whiz!` : "Keep Practicing!"}
        </CardTitle>
        <CardDescription className="text-lg md:text-xl text-foreground/80 mt-2">
          You completed the '{levelTitle}' level!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-lg md:text-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
          <p><strong className="text-primary">Final Score:</strong> {score}</p>
          <p><strong className="text-primary">Correct Answers:</strong> {problemsCorrect} / {problemsAttempted}</p>
          <p><strong className="text-primary">Accuracy:</strong> {accuracy}%</p>
          {timeTakenSeconds !== undefined && (
            <p><strong className="text-primary">Time Taken:</strong> {timeTakenSeconds}s</p>
          )}
        </div>
        
        {isWin && score > (problemsAttempted / 2) && ( // Example condition for extra positive message
            <p className="text-green-600 font-semibold text-xl mt-4 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6"/> Fantastic job! You're a true Math Whiz!
            </p>
        )}
        {!isWin && (
             <p className="text-orange-600 font-semibold text-xl mt-4 flex items-center justify-center gap-2">
                <Target className="w-6 h-6"/> Every attempt makes you smarter. Don't give up!
            </p>
        )}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <Button onClick={() => router.push(`/play/${result.levelId}`)} className="w-full sm:w-auto text-lg py-6 btn-3d">
          <Repeat className="mr-2 h-5 w-5" /> Play Again
        </Button>
        <Button onClick={() => router.push('/levels')} variant="outline" className="w-full sm:w-auto text-lg py-6 border-2 border-primary hover:bg-primary/10 text-primary hover:text-primary">
          <Home className="mr-2 h-5 w-5" /> More Levels
        </Button>
      </CardFooter>
    </Card>
  );
}
