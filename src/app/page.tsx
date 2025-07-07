import StartMenuClient from '@/components/game/StartMenuClient';
import SparkleIcon from '@/components/icons/SparkleIcon'; // For decoration

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-background to-blue-200">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary-foreground bg-primary py-4 px-8 rounded-xl shadow-lg relative">
          MathWhizKids
          <SparkleIcon className="absolute -top-4 -left-4 w-10 h-10 text-accent opacity-80 transform rotate-[-15deg] float" />
          <SparkleIcon className="absolute -bottom-3 -right-5 w-12 h-12 text-accent opacity-90 transform rotate-[20deg] float" style={{ animationDelay: '0.5s' }}/>
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-foreground/80 font-body">
          Ready to become a math superstar? Let's play!
        </p>
      </header>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <StartMenuClient />
      </div>

      <footer className="absolute bottom-4 text-sm text-foreground/60">
        Built with fun and learning in mind by <b>LASU EDTECH Student</b>
      </footer>
    </div>
  );
}
