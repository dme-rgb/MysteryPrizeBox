import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MysteryBox from '@/components/MysteryBox';
import Sparkles from '@/components/Sparkles';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import StatsHeader from '@/components/StatsHeader';
import { RotateCcw, IndianRupee, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  rewardAmount: number | null;
  isVerified: boolean;
  alreadyPlayedToday: boolean;
}

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
  const [verificationTimeLeft, setVerificationTimeLeft] = useState<number | null>(null);
  const [prizeCardSparkles, setPrizeCardSparkles] = useState(false);

  // Health check for Google Sheets
  const { data: healthData } = useQuery<{ googleSheets: boolean; message: string }>({
    queryKey: ['/api/health'],
    refetchInterval: false,
  });

  // Fetch stats
  const { data: stats } = useQuery<{ totalVerifiedRewards: number }>({
    queryKey: ['/api/stats'],
  });

  // Fetch current customer data
  const { data: customerData } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
    staleTime: Infinity, // Don't refetch automatically
  });

  // Trigger sparkles when reward card appears
  useEffect(() => {
    if (showReward) {
      setPrizeCardSparkles(true);
      const timeout = setTimeout(() => {
        setPrizeCardSparkles(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showReward]);


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
      // Only show success toast for new customers, not for existing ones
      if (!data.alreadyPlayedToday) {
        toast({
          title: "Registration Successful!",
          description: "Click the mystery box to reveal your reward!",
        });
      }
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

  // Play celebration sound effects
  const playCelebrationSounds = () => {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Box opening sound (short burst)
    const openOscillator = audioContext.createOscillator();
    const openGain = audioContext.createGain();
    openOscillator.connect(openGain);
    openGain.connect(audioContext.destination);
    openOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    openOscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    openGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    openGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    openOscillator.start(audioContext.currentTime);
    openOscillator.stop(audioContext.currentTime + 0.1);

    // Celebration chime sounds (multiple pitches)
    setTimeout(() => {
      const chimes = [800, 1000, 1200];
      chimes.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.3);
        }, index * 100);
      });
    }, 200);

    // Victory fanfare (longer tone)
    setTimeout(() => {
      const fanfare = audioContext.createOscillator();
      const fanGain = audioContext.createGain();
      fanfare.connect(fanGain);
      fanGain.connect(audioContext.destination);
      fanfare.frequency.setValueAtTime(1000, audioContext.currentTime);
      fanfare.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
      fanGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      fanGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      fanfare.start(audioContext.currentTime);
      fanfare.stop(audioContext.currentTime + 0.5);
    }, 600);
  };

  const handleOpen = () => {
    setIsOpening(true);

    // Play celebration sounds
    try {
      playCelebrationSounds();
    } catch (e) {
      // Audio context might not be available in some browsers
    }

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
    setVerificationTimeLeft(null);
  };

  // 45-second verification timeout
  useEffect(() => {
    if (!showReward || isVerified) {
      return;
    }

    setVerificationTimeLeft(45);
    
    const interval = setInterval(() => {
      setVerificationTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - reset
          handleReset();
          toast({
            title: "Time's Up!",
            description: "Verification window closed. Please try again.",
            variant: "destructive",
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showReward, isVerified]);

  const isGoogleSheetsConfigured = healthData?.googleSheets ?? true;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Total Verified Rewards Header */}
      {stats && stats.totalVerifiedRewards > 0 && (
        <div className="w-full bg-card border-b border-border py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <p className="text-lg font-medium text-foreground">
              Total Verified Cashback:
            </p>
            <Badge 
              className="bg-primary text-primary-foreground text-lg px-4 py-1 font-bold"
              data-testid="badge-total-verified"
            >
              ₹{stats.totalVerifiedRewards}
            </Badge>
          </div>
        </div>
      )}
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative bg-[#23252f] pl-[35px] pr-[35px] pt-[34px] pb-[34px]">
        {!customerId ? (
          // Registration Form
          (<div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-foreground tracking-tight" data-testid="text-title">
                Mystery Box Contest
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
                Enter your details for a chance to win!
              </p>
            </div>
            <CustomerForm
              onSubmit={handleFormSubmit}
              isSubmitting={createCustomerMutation.isPending}
            />
          </div>)
        ) : (
          // Game Screen
          (<>
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-5xl font-bold text-foreground tracking-tight" data-testid="text-game-title">
                Mystery Box
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-game-subtitle">
                {!showReward ? (customerData?.alreadyPlayedToday ? 'You have already played today. Come back tomorrow!' : 'Click the box to reveal your cashback reward!') : 'Congratulations!'}
              </p>
              {customerData?.alreadyPlayedToday && (
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle className="text-yellow-500">Already Played Today</AlertTitle>
                  <AlertDescription className="text-yellow-500/90">
                    You can enter the contest again tomorrow.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="relative flex items-center justify-center min-h-[400px]">
              {!showReward ? (
                <MysteryBox onOpen={handleOpen} isOpening={isOpening} isOpened={isOpened} disabled={customerData?.alreadyPlayedToday || false} />
              ) : rewardAmount ? (
                <div className="animate-in fade-in zoom-in duration-500">
                  {/* Sparkles for prize card */}
                  <Sparkles 
                    trigger={prizeCardSparkles} 
                    count={80} 
                    scale={5} 
                    size={7} 
                    speed={0.3} 
                    opacity={0.6} 
                    color="#5ba085"
                  />
                  <Sparkles 
                    trigger={prizeCardSparkles} 
                    count={50} 
                    scale={3.5} 
                    size={9} 
                    speed={0.2} 
                    opacity={0.4} 
                    color="#5ba085"
                    noise={0.4}
                  />
                  <div className="relative">
                    {/* Reward Card */}
                    <div className="bg-gradient-to-br from-primary/20 via-card to-primary/10 p-12 rounded-lg border-2 border-primary pt-[30px] pb-[30px] pl-[80px] pr-[80px] mt-[0px] mb-[0px]">
                      <div className="text-center space-y-6">
                        {/* Rupee Icon */}
                        <div className="flex items-center justify-center">
                          <div className="bg-primary/20 p-6 rounded-full">
                            <IndianRupee className="w-16 h-16 text-primary" />
                          </div>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="text-2xl font-medium text-muted-foreground mb-4">
                            You won
                          </p>
                          <div className="relative inline-block">
                            <p className="text-8xl font-black text-primary animate-bounce" style={{animationDuration: '1.5s'}} data-testid="text-reward-amount">
                              ₹{rewardAmount}
                            </p>
                            {/* Glow effect */}
                            <div 
                              className="absolute -inset-4 rounded-full pointer-events-none"
                              style={{
                                background: 'radial-gradient(circle, rgba(65, 136, 110, 0.6) 0%, transparent 70%)',
                                filter: 'blur(20px)',
                                animation: 'pulseGlow 2s ease-in-out infinite',
                                zIndex: -1,
                              }}
                            />
                          </div>
                          <p className="text-xl font-semibold text-muted-foreground mt-4">
                            Cashback
                          </p>
                        </div>

                        {/* Verification Status */}
                        <div className="pt-4 space-y-3">
                          {isVerified ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500 px-4 py-2 text-base" data-testid="badge-verified">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verified
                            </Badge>
                          ) : (
                            <>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500 px-4 py-2 text-base" data-testid="badge-pending">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Pending Verification
                              </Badge>
                              {verificationTimeLeft !== null && (
                                <div className="text-center">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Time Left:</p>
                                  <p className="text-3xl font-bold text-primary" data-testid="text-verification-timer">
                                    {verificationTimeLeft}s
                                  </p>
                                </div>
                              )}
                            </>
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
                    className="gap-2 px-8 py-6 text-lg font-medium bg-green-600 hover:bg-green-700 animate-pulse"
                    disabled={verifyRewardMutation.isPending}
                    data-testid="button-verify"
                  >
                    <CheckCircle className="w-5 h-5 animate-spin" style={{animationDuration: '1.5s'}} />
                    {verifyRewardMutation.isPending ? 'Verifying...' : 'Verify Reward'}
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 py-6 text-lg font-medium pt-[0px] pb-[0px] pl-[0px] pr-[0px]"
                  data-testid="button-try-again"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
              </div>
            )}
          </>)
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
