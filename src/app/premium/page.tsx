
"use client";

import { useState } from 'react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Zap, Unlock, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import ConfettiAnimation from '@/components/game/ConfettiAnimation';

export default function PremiumPage() {
  const router = useRouter();
  const { isPremium, setPremium, isLoading } = usePremiumStatus();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUpgrade = () => {
    setPremium(true);
    setShowConfetti(true);
    toast({
      title: 'Upgrade Successful! 🎉',
      description: 'You now have access to all premium levels.',
      className: 'bg-green-500 text-white border-green-600',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-blue-200">
      {showConfetti && <ConfettiAnimation />}
      <Card className="w-full max-w-lg p-6 text-center shadow-2xl bg-card/90 backdrop-blur-sm rounded-2xl border-2 border-yellow-400">
        <CardHeader>
          <Star className="mx-auto h-16 w-16 mb-4 text-yellow-400" />
          <CardTitle className="text-4xl font-headline font-bold text-primary">
            Go Premium!
          </CardTitle>
          <CardDescription className="text-xl text-foreground/80 mt-2">
            Unlock your full potential as a Math Whiz!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-left">
            <ul className="space-y-3">
                <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Access to all challenging levels.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Unlock the toughest Speed Challenges.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Prepare for advanced math concepts.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Priority support (simulated).</span>
                </li>
            </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-6">
          {isLoading ? (
             <Button disabled className="w-full text-lg py-6 btn-3d bg-yellow-500 hover:bg-yellow-600">Loading...</Button>
          ) : isPremium ? (
             <div className="text-center text-green-600 font-bold text-xl">
                <p>You are already a Premium member! 🎉</p>
                <Button onClick={() => router.push('/levels')} variant="outline" className="mt-4">Back to Levels</Button>
             </div>
          ) : (
            <Button onClick={handleUpgrade} className="w-full text-lg py-6 btn-3d-accent bg-yellow-500 hover:bg-yellow-600">
              <Unlock className="mr-2 h-6 w-6" /> Upgrade Now for $0.00
            </Button>
          )}
           <Link href="/levels" className="text-sm text-muted-foreground hover:underline mt-2">
             Maybe later
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
