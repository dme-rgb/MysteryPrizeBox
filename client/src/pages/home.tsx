import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MysteryBox from '@/components/MysteryBox';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import StatsHeader from '@/components/StatsHeader';
import { RotateCcw, IndianRupee, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Health check for Google Sheets
  const { data: healthData } = useQuery<{ googleSheets: boolean; message: string }>({
    queryKey: ['/api/health'],
    refetchInterval: false,
  });

  // Fetch stats
  const { data: stats } = useQuery<{ totalVerifiedRewards: number }>({
    queryKey: ['/api/stats'],
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to register');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      setCustomerId(data.id);
      toast({
        title: "Registration Successful!",
        description: "Click the mystery box to reveal your reward!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update reward mutation
  const updateRewardMutation = useMutation({
    mutationFn: async ({ customerId, rewardAmount }: { customerId: string; rewardAmount: number }) => {
      const res = await fetch(`/api/customers/${customerId}/reward`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardAmount }),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update reward');
      }

      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify reward mutation
  const verifyRewardMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await fetch(`/api/customers/${customerId}/verify`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to verify reward');
      }

      return await res.json();
    },
    onSuccess: () => {
      setIsVerified(true);
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Reward Verified!",
        description: "Your cashback has been confirmed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
    createCustomerMutation.mutate(data);
  };

  const handleOpen = () => {
    setIsOpening(true);

    // Generate random reward amount (1-5 rupees)
    const reward = Math.floor(Math.random() * 5) + 1;
    setRewardAmount(reward);

    // Update customer with reward
    if (customerId) {
      updateRewardMutation.mutate({
        customerId,
        rewardAmount: reward,
      });
    }

    // Lid opening animation
    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      setParticleTrigger((prev) => prev + 1);

      // Show reward after burst
      setTimeout(() => {
        setShowReward(true);
        setConfettiTrigger((prev) => prev + 1);
      }, 300);
    }, 800);
  };

  const handleVerify = () => {
    if (customerId) {
      verifyRewardMutation.mutate(customerId);
    }
  };

  const handleReset = () => {
    setCustomerId(null);
    setIsOpened(false);
    setShowReward(false);
    setRewardAmount(null);
    setIsVerified(false);
  };

  const isGoogleSheetsConfigured = healthData?.googleSheets ?? true;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Stats Header */}
      <StatsHeader totalWinners={stats?.totalVerifiedRewards || 0} />

      {/* Google Sheets Setup Banner */}
      {!isGoogleSheetsConfigured && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Google Sheets Not Configured</AlertTitle>
          <AlertDescription className="text-yellow-500/90 text-xs">
            To use this contest, please set up Google Sheets integration. See{" "}
            <code className="bg-yellow-500/20 px-1 py-0.5 rounded text-xs">GOOGLE_SHEETS_SETUP.md</code> for instructions.
          </AlertDescription>
        </Alert>
      )}

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
                Enter your details for a chance to win 1-5 rupees cashback!
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
                {!showReward ? 'Click the box to reveal your cashback reward!' : 'Congratulations!'}
              </p>
            </div>

            <div className="relative flex items-center justify-center min-h-[400px]">
              {!showReward ? (
                <MysteryBox onOpen={handleOpen} isOpening={isOpening} isOpened={isOpened} />
              ) : rewardAmount ? (
                <div className="animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    {/* Reward Card */}
                    <div className="bg-gradient-to-br from-primary/20 via-card to-primary/10 p-12 rounded-lg border-2 border-primary shadow-2xl">
                      <div className="text-center space-y-6">
                        {/* Rupee Icon */}
                        <div className="flex items-center justify-center">
                          <div className="bg-primary/20 p-6 rounded-full">
                            <IndianRupee className="w-16 h-16 text-primary" />
                          </div>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="text-2xl font-medium text-muted-foreground mb-2">
                            You won
                          </p>
                          <p className="text-7xl font-bold text-primary" data-testid="text-reward-amount">
                            ₹{rewardAmount}
                          </p>
                          <p className="text-xl text-muted-foreground mt-2">
                            Cashback
                          </p>
                        </div>

                        {/* Verification Status */}
                        <div className="pt-4">
                          {isVerified ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500 px-4 py-2 text-base" data-testid="badge-verified">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500 px-4 py-2 text-base" data-testid="badge-pending">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Pending Verification
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Golden glow effect */}
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(65, 136, 110, 0.3) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        transform: 'scale(1.2)',
                      }}
                    />
                  </div>
                </div>
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

            {/* Action Buttons */}
            {showReward && (
              <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!isVerified && (
                  <Button
                    onClick={handleVerify}
                    size="lg"
                    className="gap-2 px-8 py-6 text-lg font-medium bg-green-600 hover:bg-green-700"
                    disabled={verifyRewardMutation.isPending}
                    data-testid="button-verify"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {verifyRewardMutation.isPending ? 'Verifying...' : 'Verify Reward'}
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 py-6 text-lg font-medium"
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
