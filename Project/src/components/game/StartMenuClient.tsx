"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

export default function StartMenuClient() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/levels');
  };

  return (
    <Button
      onClick={handleStartGame}
      className="px-12 py-8 text-2xl md:text-3xl font-bold rounded-full btn-3d-accent animate-pulse-glow"
      aria-label="Start Game"
    >
      <PlayCircle className="mr-3 h-10 w-10" />
      Start Game!
    </Button>
  );
}
