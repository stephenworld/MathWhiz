"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlayCircle, Star } from 'lucide-react';

export default function StartMenuClient() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/levels');
  };

  const handleGoPremium = () => {
    router.push('/premium');
  }

  return (
    <>
      <Button
        onClick={handleStartGame}
        className="px-12 py-8 text-2xl md:text-3xl font-bold rounded-full btn-3d-accent animate-pulse-glow"
        aria-label="Start Game"
      >
        <PlayCircle className="mr-3 h-10 w-10" />
        Start Game!
      </Button>
      <Button
        onClick={handleGoPremium}
        variant="outline"
        className="px-8 py-8 text-xl md:text-2xl font-bold rounded-full btn-3d border-2 border-primary hover:bg-primary/10 text-primary"
        aria-label="Go Premium"
      >
        <Star className="mr-3 h-8 w-8" />
        Go Premium
      </Button>
    </>
  );
}
