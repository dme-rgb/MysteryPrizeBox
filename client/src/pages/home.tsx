import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MysteryBox from '@/components/MysteryBox';
import Sparkles from '@/components/Sparkles';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import StatsHeader from '@/components/StatsHeader';
import BackgroundStars from '@/components/BackgroundStars';
import { RotateCcw, IndianRupee, CheckCircle, AlertCircle, AlertTriangle, Clock, MessageCircle, Upload, LogIn } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
// @ts-ignore - canvas-confetti doesn't have TypeScript types but works fine
import confetti from 'canvas-confetti';

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
  const [timeExpired, setTimeExpired] = useState(false);
  const [showWhatsAppFlow, setShowWhatsAppFlow] = useState(false);

  const WHATSAPP_NUMBER = "+918817828153";

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

  // Fetch customer's total verified cashback
  const { data: customerVerifiedData } = useQuery<{ totalAmount: number }>({
    queryKey: ['/api/vehicles', customerData?.vehicleNumber, 'total-verified-amount'],
    enabled: !!customerData?.vehicleNumber,
    staleTime: 0, // Always fresh when invalidated
  });

  // Poll for verification status every 2 seconds while waiting (continue polling even after timeout for a short grace period)
  const { data: verificationStatus } = useQuery<{ verified: boolean; vehicleNumber: string; prize: number | null }>({
    queryKey: ['/api/customers/verification-status', customerData?.vehicleNumber],
    enabled: !!customerData?.vehicleNumber && showReward && !isVerified,
    refetchInterval: 2000,
  });

  // Update verification status when polling returns verified
  useEffect(() => {
    if (verificationStatus?.verified && !isVerified) {
      setIsVerified(true);
      setTimeExpired(false);
      setShowWhatsAppFlow(false);
      toast({
        title: "Reward Verified!",
        description: "Your reward has been verified. You will shortly receive the payment link.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      if (customerData?.vehicleNumber) {
        queryClient.invalidateQueries({ queryKey: ['/api/vehicles', customerData.vehicleNumber, 'total-verified-amount'] });
      }
    }
  }, [verificationStatus?.verified, isVerified, customerData?.vehicleNumber, toast]);

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

  // Trigger confetti when prize card appears
  useEffect(() => {
    if (showReward) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffd700', '#B4FF64', '#ffffff']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffd700', '#B4FF64', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
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
      if (customerData?.vehicleNumber) {
        queryClient.invalidateQueries({ queryKey: ['/api/vehicles', customerData.vehicleNumber, 'total-verified-amount'] });
      }
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

  const handleFormSubmit = (data: { phoneNumber: string; vehicleNumber: string }) => {
    // Generate a default name based on phone number for backend compatibility
    const defaultName = `Customer-${data.phoneNumber.slice(-4)}`;
    createCustomerMutation.mutate({
      name: defaultName,
      ...data,
    });
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

      // Show reward after all celebration animations complete
      setTimeout(() => {
        setShowReward(true);
        setConfettiTrigger((prev) => prev + 1);
      }, 1200);
    }, 1600);
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
    setTimeExpired(false);
    setShowWhatsAppFlow(false);
  };

  const handleWhatsAppUpload = () => {
    if (!customerData) return;
    
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const message = `Vehicle Number: ${customerData.vehicleNumber}%0ATimestamp: ${timestamp}%0A%0APlease find my bill photo attached for verification.`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setShowWhatsAppFlow(false);
    toast({
      title: "WhatsApp Opened",
      description: "Please upload your bill photo and send the message. You will receive your reward in the evening.",
    });
  };

  // 45-second verification timeout
  useEffect(() => {
    if (!showReward || isVerified || timeExpired) {
      return;
    }

    setVerificationTimeLeft(45);
    
    const interval = setInterval(() => {
      setVerificationTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showReward, isVerified, timeExpired]);

  const isGoogleSheetsConfigured = healthData?.googleSheets ?? true;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Animated Background Stars */}
      <BackgroundStars />
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
      <div className="relative z-10 pt-8 pb-4 px-8">
        {!customerId ? (
          // Registration Form
          (<div className="space-y-8 text-center relative z-10 mt-[200px] mb-[200px]">
            <div className="space-y-4">
              <h1 
                className="text-6xl font-black text-white tracking-tight" 
                data-testid="text-title"
                style={{
                  animation: 'neonPulse 1s ease-in-out infinite',
                  textShadow: `
                    0 0 2px rgba(255, 255, 255, 0.2),
                    0 0 1px rgba(180, 255, 100, 0.1)
                  `,
                }}
              >
               FEUL RUSH
              </h1>
            </div>
            <CustomerForm
              onSubmit={handleFormSubmit}
              isSubmitting={createCustomerMutation.isPending}
            />
            
            {/* Employee Login Link - Bottom Right (Home Screen Only) */}
            <div className="fixed bottom-8 right-8 z-50">
              <Link href="/employee">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 text-xs font-medium"
                  data-testid="button-employee-login"
                >
                  <LogIn className="w-4 h-4" />
                  Employee Login
                </Button>
              </Link>
            </div>
          </div>)
        ) : (
          // Game Screen
          (<>
            {/* Customer's Total Verified Rewards - Only on mystery box screen */}
            {!showReward && customerVerifiedData && customerVerifiedData.totalAmount > 0 && (
              <div className="w-full bg-card border-b border-border py-4 px-6 -m-8 mb-8 ml-[0px] mr-[0px]">
                <div className="flex items-center justify-center gap-3">
                  <p className="text-lg font-medium text-foreground">
                    Your Total Verified Cashback:
                  </p>
                  <Badge 
                    className="bg-primary text-primary-foreground text-lg px-4 py-1 font-bold"
                    data-testid="badge-total-verified"
                  >
                    ₹{customerVerifiedData.totalAmount}
                  </Badge>
                </div>
              </div>
            )}
            <div className="text-center mb-12 space-y-4 relative z-10">
              <h1 
                className="text-6xl font-black text-white tracking-tight" 
                data-testid="text-game-title"
                style={{
                  animation: 'neonPulse 2s ease-in-out infinite',
                  textShadow: `
                    0 0 8px rgba(255, 255, 255, 0.2),
                    0 0 12px rgba(180, 255, 100, 0.1)
                  `,
                }}
              >
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
                <div 
                  className="relative"
                  style={{
                    animation: 'prizeCardEmerge 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* Sparkles for prize card */}
                  <Sparkles 
                    trigger={prizeCardSparkles} 
                    count={80} 
                    scale={5} 
                    size={7} 
                    speed={0.3} 
                    opacity={0.6} 
                    color="#B4FF64"
                  />
                  <Sparkles 
                    trigger={prizeCardSparkles} 
                    count={50} 
                    scale={3.5} 
                    size={9} 
                    speed={0.2} 
                    opacity={0.4} 
                    color="#B4FF64"
                    noise={0.4}
                  />
                  <div className="relative">
                    {/* Reward Card */}
                    <div className="bg-gradient-to-br from-primary/20 via-card to-primary/10 p-12 rounded-lg pt-[30px] pb-[30px] pl-[80px] pr-[80px] mt-[0px] mb-[0px]">
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
                            <p className="text-8xl font-black text-primary" data-testid="text-reward-amount">
                              ₹{rewardAmount}
                            </p>
                            {/* Glow effect */}
                            <div 
                              className="absolute -inset-4 rounded-full pointer-events-none"
                              style={{
                                background: 'radial-gradient(circle, rgba(63, 166, 130, 0.7) 0%, transparent 70%)',
                                filter: 'blur(20px)',
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
                            <div className="space-y-3">
                              <Badge className="bg-green-500/20 text-green-500 border-green-500 px-4 py-2 text-base" data-testid="badge-verified">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verified
                              </Badge>
                              <p className="text-sm text-muted-foreground text-center">
                                You will shortly receive the payment link.
                              </p>
                            </div>
                          ) : timeExpired ? (
                            <div className="space-y-3">
                              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500 px-4 py-2 text-base" data-testid="badge-time-expired">
                                <Clock className="w-4 h-4 mr-2" />
                                Verification Time Expired
                              </Badge>
                              {!showWhatsAppFlow ? (
                                <Button
                                  onClick={() => setShowWhatsAppFlow(true)}
                                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                  data-testid="button-manual-verify"
                                >
                                  <Upload className="w-4 h-4" />
                                  Upload Bill for Verification
                                </Button>
                              ) : (
                                <div className="space-y-3 p-4 bg-card rounded-lg border">
                                  <p className="text-sm text-foreground text-center">
                                    Send your bill photo to WhatsApp number:
                                  </p>
                                  <p className="text-lg font-bold text-primary text-center" data-testid="text-whatsapp-number">
                                    {WHATSAPP_NUMBER}
                                  </p>
                                  <Button
                                    onClick={handleWhatsAppUpload}
                                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                    data-testid="button-open-whatsapp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Open WhatsApp & Send
                                  </Button>
                                  <p className="text-xs text-muted-foreground text-center">
                                    After sending, you will receive your reward in the evening.
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500 px-4 py-2 text-base" data-testid="badge-pending">
                                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                Waiting for Verification
                              </Badge>
                              {verificationTimeLeft !== null && (
                                <div className="text-center">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Time Remaining:</p>
                                  <p className="text-3xl font-bold text-primary" data-testid="text-verification-timer">
                                    {verificationTimeLeft}s
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Please wait while an employee verifies your reward.
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
                        background: 'radial-gradient(circle, rgba(63, 166, 130, 0.4) 0%, transparent 70%)',
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
            {showReward && (isVerified || timeExpired) && (
              <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          </>)
        )}

        {/* Decorative Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(63, 166, 130, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
