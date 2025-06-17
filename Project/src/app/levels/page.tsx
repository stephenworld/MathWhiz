
import LevelSelector from '@/components/game/LevelSelector';
import { LEVELS } from '@/lib/levels';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LevelSelectionPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background to-blue-200">
      <header className="w-full max-w-4xl mb-8 text-center relative">
        <Link href="/">
          <Button variant="ghost" className="absolute left-0 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/10 p-2 rounded-full">
            <ArrowLeft className="h-8 w-8" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
          Choose Your Challenge!
        </h1>
        <p className="mt-3 text-lg md:text-xl text-foreground/80">
          Pick a level to start your math adventure.
        </p>
      </header>
      <LevelSelector levels={LEVELS} />
       <footer className="mt-12 text-sm text-foreground/60">
        Each level unlocks new math powers!
      </footer>
    </div>
  );
}
