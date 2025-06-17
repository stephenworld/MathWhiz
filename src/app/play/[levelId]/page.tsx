import GameplayClient from '@/components/game/GameplayClient';
import { getLevelById } from '@/lib/levels';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';

interface PlayPageProps {
  params: {
    levelId: string;
  };
}

export default function PlayPage({ params }: PlayPageProps) {
  const level = getLevelById(params.levelId);

  if (!level) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 bg-gradient-to-br from-background to-blue-200">
      <div className="absolute top-4 left-4">
        <Link href="/levels" passHref legacyBehavior>
          <Button variant="ghost" className="text-primary hover:bg-primary/10 p-2 rounded-full">
            <HomeIcon className="h-7 w-7 mr-1" /> Back to Levels
          </Button>
        </Link>
      </div>
      <GameplayClient level={level} />
    </div>
  );
}
