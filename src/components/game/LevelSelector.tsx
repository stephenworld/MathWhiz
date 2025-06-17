"use client";

import type { Level } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarIcon from '@/components/icons/StarIcon';
import { Lightbulb, Zap, TimerIcon } from 'lucide-react';

interface LevelSelectorProps {
  levels: Level[];
}

const getIconForLevel = (level: Level) => {
  if (level.isSpeedChallenge) return <Zap className="w-5 h-5 text-accent" />;
  if (level.timeLimitSeconds) return <TimerIcon className="w-5 h-5 text-primary" />;
  return <Lightbulb className="w-5 h-5 text-yellow-500" />;
}

export default function LevelSelector({ levels }: LevelSelectorProps) {
  const router = useRouter();

  const handleSelectLevel = (levelId: string) => {
    router.push(`/play/${levelId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
      {levels.map((level) => (
        <Card 
          key={level.id} 
          className="flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-xl overflow-hidden"
          onClick={() => handleSelectLevel(level.id)}
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleSelectLevel(level.id)}
          role="button"
          aria-label={`Select level: ${level.title}`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
                {getIconForLevel(level)} {level.title}
              </CardTitle>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < level.difficulty} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
            </div>
            <CardDescription className="text-sm text-foreground/70 h-12 overflow-hidden">
              {level.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Problems: {level.problemCount}</p>
              {level.timeLimitSeconds && <p>Time: {level.timeLimitSeconds / 60} min</p>}
              <p>Operations: {level.operators.join(', ')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-lg py-6 btn-3d"
              aria-label={`Play ${level.title}`}
            >
              Play Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
