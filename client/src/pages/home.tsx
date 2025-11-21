import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import MysteryBox from '@/components/MysteryBox';
import PrizeCard, { type Prize } from '@/components/PrizeCard';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import StatsHeader from '@/components/StatsHeader';
import { RotateCcw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

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
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Fetch stats
  const { data: stats } = useQuery<{ totalCustomersWithPrizes: number }>({
    queryKey: ['/api/stats'],
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
      const res = await apiRequest('POST', '/api/customers', data);
      return await res.json();
    },
    onSuccess: (data) => {
      setCustomerId(data.id);
    },
  });

  // Update customer prize mutation
  const updatePrizeMutation = useMutation({
    mutationFn: async ({
      customerId,
      prizeId,
      prizeName,
      prizeRarity,
    }: {
      customerId: string;
      prizeId: string;
      prizeName: string;
      prizeRarity: string;
    }) => {
      const res = await apiRequest('PATCH', `/api/customers/${customerId}/prize`, {
        prizeId,
        prizeName,
        prizeRarity,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  const handleFormSubmit = (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
    createCustomerMutation.mutate(data);
  };

  const handleOpen = () => {
    setIsOpening(true);

    // Select random prize
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    setCurrentPrize(randomPrize);

    // Update customer with prize
    if (customerId) {
      updatePrizeMutation.mutate({
        customerId,
        prizeId: randomPrize.id,
        prizeName: randomPrize.name,
        prizeRarity: randomPrize.rarity,
      });
    }

    // Lid opening animation
    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      setParticleTrigger((prev) => prev + 1);

      // Show prize after burst
      setTimeout(() => {
        setShowPrize(true);
        setConfettiTrigger((prev) => prev + 1);
      }, 300);
    }, 800);
  };

  const handleReset = () => {
    setCustomerId(null);
    setIsOpened(false);
    setShowPrize(false);
    setCurrentPrize(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Stats Header */}
      <StatsHeader totalWinners={stats?.totalCustomersWithPrizes || 0} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
        {!customerId ? (
          // Registration Form
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-foreground tracking-tight" data-testid="text-title">
                Mystery Box Contest
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
                Enter your details for a chance to win amazing prizes!
              </p>
            </div>
            <CustomerForm
              onSubmit={handleFormSubmit}
              isSubmitting={createCustomerMutation.isPending}
            />
          </div>
        ) : (
          // Game Screen
          <>
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-5xl font-bold text-foreground tracking-tight" data-testid="text-game-title">
                Mystery Box
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-game-subtitle">
                Click the box to reveal your prize!
              </p>
            </div>

            <div className="relative flex items-center justify-center min-h-[400px]">
              {!showPrize ? (
                <MysteryBox onOpen={handleOpen} isOpening={isOpening} isOpened={isOpened} />
              ) : currentPrize ? (
                <PrizeCard prize={currentPrize} isRevealing={showPrize} />
              ) : null}

              {/* Particle Effects */}
              <ParticleEffect
                trigger={particleTrigger > 0}
                type="burst"
                key={`burst-${particleTrigger}`}
              />
              <ParticleEffect
                trigger={confettiTrigger > 0}
                type="confetti"
                key={`confetti-${confettiTrigger}`}
              />
            </div>

            {/* Reset Button */}
            {showPrize && (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  onClick={handleReset}
                  size="lg"
                  className="gap-2 px-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90"
                  data-testid="button-try-again"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
              </div>
            )}
          </>
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
    </div>
  );
}
