import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MysteryBox from '@/components/MysteryBox';
import PrizeCard, { type Prize } from '@/components/PrizeCard';
import ParticleEffect from '@/components/ParticleEffect';
import { RotateCcw } from 'lucide-react';

const prizes: Prize[] = [
  {
    id: '1',
    name: 'Gold Coins',
    description: 'A handful of shiny gold coins!',
    rarity: 'common',
    icon: 'coins',
    amount: 100,
  },
  {
    id: '2',
    name: 'Silver Coins',
    description: 'Some valuable silver coins.',
    rarity: 'common',
    icon: 'coins',
    amount: 250,
  },
  {
    id: '3',
    name: 'Rare Gem',
    description: 'A beautiful rare gemstone.',
    rarity: 'rare',
    icon: 'gem',
    amount: 500,
  },
  {
    id: '4',
    name: 'Power Crystal',
    description: 'Crackling with mysterious energy!',
    rarity: 'rare',
    icon: 'power',
    amount: 750,
  },
  {
    id: '5',
    name: 'Epic Diamond',
    description: 'A stunning epic diamond!',
    rarity: 'epic',
    icon: 'gem',
    amount: 2000,
  },
  {
    id: '6',
    name: 'Champion Trophy',
    description: 'Proof of your incredible luck!',
    rarity: 'epic',
    icon: 'trophy',
    amount: 3000,
  },
  {
    id: '7',
    name: 'Golden Crown',
    description: 'A legendary prize worthy of royalty!',
    rarity: 'legendary',
    icon: 'crown',
    amount: 10000,
  },
  {
    id: '8',
    name: 'Mega Power Boost',
    description: 'Ultimate power surges through you!',
    rarity: 'legendary',
    icon: 'power',
    amount: 15000,
  },
];

export default function Home() {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const handleOpen = () => {
    setIsOpening(true);
    
    // Select random prize
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    setCurrentPrize(randomPrize);

    // Lid opening animation
    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      setParticleTrigger(prev => prev + 1);
      
      // Show prize after burst
      setTimeout(() => {
        setShowPrize(true);
        setConfettiTrigger(prev => prev + 1);
      }, 300);
    }, 800);
  };

  const handleReset = () => {
    setIsOpened(false);
    setShowPrize(false);
    setCurrentPrize(null);
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl font-bold text-foreground tracking-tight" data-testid="text-title">
          Mystery Box
        </h1>
        <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
          Click the box to reveal your prize!
        </p>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-[400px]">
        {!showPrize ? (
          <MysteryBox 
            onOpen={handleOpen} 
            isOpening={isOpening} 
            isOpened={isOpened} 
          />
        ) : currentPrize ? (
          <PrizeCard prize={currentPrize} isRevealing={showPrize} />
        ) : null}

        {/* Particle Effects */}
        <ParticleEffect trigger={particleTrigger > 0} type="burst" key={`burst-${particleTrigger}`} />
        <ParticleEffect trigger={confettiTrigger > 0} type="confetti" key={`confetti-${confettiTrigger}`} />
      </div>

      {/* Reset Button */}
      {showPrize && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={handleReset}
            size="lg"
            className="gap-2 px-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90"
            data-testid="button-open-another"
          >
            <RotateCcw className="w-5 h-5" />
            Open Another Box
          </Button>
        </div>
      )}

      {/* Decorative Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(65, 136, 110, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>
    </div>
  );
}
