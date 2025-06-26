"use client";

import type { Level } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarIcon from '@/components/icons/StarIcon';
import { Lightbulb, Zap, TimerIcon, Lock, Crown } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { isPremium, isLoading } = usePremiumStatus();

  const handleSelectLevel = (level: Level) => {
    if (level.requiresPremium && !isPremium) {
      router.push('/premium');
    } else {
      router.push(`/play/${level.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
        {levels.map((level) => (
          <Card key={level.id} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
      {levels.map((level) => {
        const isLocked = level.requiresPremium && !isPremium;

        return (
          <Card
            key={level.id}
            className={`flex flex-col justify-between transform transition-all duration-300 bg-card/90 backdrop-blur-sm border-2 rounded-xl overflow-hidden ${isLocked ? 'border-yellow-500/50' : 'border-primary/30 hover:scale-105 hover:shadow-2xl cursor-pointer'}`}
            onClick={() => handleSelectLevel(level)}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleSelectLevel(level)}
            role="button"
            aria-label={`Select level: ${level.title}${isLocked ? ' (Premium Required)' : ''}`}
          >
            <CardHeader className="pb-3 relative">
              {isLocked && <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1"><Crown className="w-3 h-3"/>PREMIUM</div>}
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
                  {isLocked ? <Lock className="w-5 h-5 text-yellow-500" /> : getIconForLevel(level)} {level.title}
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
                className={`w-full text-lg py-6 ${isLocked ? 'btn-3d bg-yellow-500 hover:bg-yellow-600' : 'btn-3d'}`}
                aria-label={isLocked ? `Unlock ${level.title}` : `Play ${level.title}`}
              >
                {isLocked ? 'Unlock Now' : 'Play Now'}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  );
}
