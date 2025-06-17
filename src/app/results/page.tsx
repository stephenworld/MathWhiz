import ResultsDisplay from '@/components/game/ResultsDisplay';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-blue-200">
      <Suspense fallback={<LoadingResults />}>
        <ResultsDisplay />
      </Suspense>
    </div>
  );
}

function LoadingResults() {
  return (
    <Card className="w-full max-w-lg p-8 text-center shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Calculating Results...</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-muted-foreground">Please wait a moment!</p>
      </CardContent>
    </Card>
  );
}
