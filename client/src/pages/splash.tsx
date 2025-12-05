import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MysteryBox from '@/components/MysteryBox';
import Sparkles from '@/components/Sparkles';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import { RotateCcw, IndianRupee, CheckCircle, AlertCircle, AlertTriangle, Clock, MessageCircle, Upload, LogIn } from 'lucide-react';
import { Link } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import bgImage from '@assets/Gemini_Generated_Image_mnpedumnpedumnpe_1764676809813.png';
import mysteryBoxImg from '@assets/Gemini_Generated_Image_2rmhxj2rmhxj2rmh-Photoroom_1764679645336.png';
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

export default function Splash() {
  const { toast } = useToast();
  const [showFormModal, setShowFormModal] = useState(false);
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

  const isGoogleSheetsConfigured = healthData?.googleSheets ?? false;

  // Fetch stats
  const { data: stats } = useQuery<{ totalVerifiedRewards: number }>({
    queryKey: ['/api/stats'],
  });

  // Fetch current customer data
  const { data: customerData } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
    staleTime: Infinity,
  });

  // Fetch customer's total verified cashback
  const { data: customerVerifiedData } = useQuery<{ totalAmount: number }>({
    queryKey: ['/api/vehicles', customerData?.vehicleNumber, 'total-verified-amount'],
    enabled: !!customerData?.vehicleNumber,
    staleTime: 0,
  });

  // Poll for verification status
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

   
  useEffect(() => {
    if (showReward && !isVerified && !timeExpired) {
      const timer = setInterval(() => {
        setVerificationTimeLeft(prev => {
          if (prev === null) return 45;
          if (prev <= 1) {
            setTimeExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showReward, isVerified, timeExpired]);

  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return response.json();
    },
    onSuccess: (data) => {
      setCustomerId(data.id);
      setShowFormModal(false);
      toast({
        title: "Welcome to FUEL RUSH!",
        description: "Click the mystery box to reveal your reward!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enter contest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: { name: string; phoneNumber: string; vehicleNumber: string }) => {
    createCustomerMutation.mutate(data);
  };

  const handleOpen = () => {
    if (isOpened || isOpening) return;
    setIsOpening(true);
    setIsOpened(true);
    setParticleTrigger(prev => prev + 1);

    setTimeout(() => {
      setShowReward(true);
      setPrizeCardSparkles(true);
      setConfettiTrigger(prev => prev + 1);

      const randomReward = Math.floor(Math.random() * 5) + 1;
      fetch(`/api/customers/${customerId}/reward`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardAmount: randomReward })
      })
        .then(res => res.json())
        .then(data => {
          setRewardAmount(data.rewardAmount);
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        })
        .catch(error => {
          console.error('Error getting reward:', error);
          toast({
            title: "Error",
            description: "Failed to process your reward. Please try again.",
            variant: "destructive",
          });
        });
    }, 1200);
  };

  const handleReset = () => {
    setIsOpening(false);
    setIsOpened(false);
    setRewardAmount(null);
    setIsVerified(false);
    setShowReward(false);
    setVerificationTimeLeft(null);
    setTimeExpired(false);
    setShowWhatsAppFlow(false);
  };

  const handleWhatsAppUpload = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi, I want to upload my bill for verification`, '_blank');
  };

  // If no customerId, show splash with form modal
  if (!customerId) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-start pt-10 relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {!isGoogleSheetsConfigured && (
          <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-500/10 border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-500">Google Sheets Not Configured</AlertTitle>
            <AlertDescription className="text-yellow-500/90 text-xs">
              To use this contest, please set up Google Sheets integration.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative z-0 flex flex-col items-center justify-start gap-8 px-0 pt-[0px] pb-[0px]">
          <img 
            src={mysteryBoxImg} 
            alt="Mystery Box" 
            className="w-30 h-30 object-contain"
          />
          
          <Button
            onClick={() => setShowFormModal(true)}
            className="w-[70%] text-black font-extrabold text-lg py-4 px-6 rounded-2xl bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-[0_6px_0_#caa335,0_10px_20px_rgba(0,0,0,0.35)] border border-yellow-200 relative overflow-hidden mx-auto pt-[12px] pb-[12px] ml-[50px] mr-[50px]"
            data-testid="button-click-to-open"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
            <span className="relative z-10">CLICK TO OPEN</span>
          </Button>

          {/* Employee Login Link */}
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
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(63, 166, 130, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        {/* Registration Modal */}
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
          <DialogContent className="max-w-sm border-yellow-400 bg-gradient-to-br from-green-900 to-green-950">
            <CustomerForm
              onSubmit={handleFormSubmit}
              isSubmitting={createCustomerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If customerId exists, show mystery box and game screen
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start pt-10 relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      <div className="relative z-10 px-8 pt-[0px] pb-[0px] pl-[23px] pr-[23px]">
        {!showReward && customerVerifiedData && customerVerifiedData.totalAmount > 0 && (
          <div className="w-full bg-card border-b border-border py-4 px-6 -m-8 mb-8">
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
              <div className="relative flex justify-center w-full">
                <div className="relative w-full max-w-sm p-8 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)] bg-[#0b3b2a] border-[5px] border-[#f5d67a]"
                  style={{
                    backgroundImage: "radial-gradient(circle at top 20%, rgba(15,66,42,0.95), rgba(5,25,17,0.85))",
                  }}
                >
                  <div className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 60%)',
                    }}
                  />
                  <div className="relative z-10 text-center space-y-6">
                    <div>
                      <p className="text-2xl font-bold text-white mb-1">
                        CONGRATULATIONS!
                      </p>
                      <p className="text-lg text-white/90">
                        You won
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-4">
                      <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 p-4 rounded-full shadow-lg border-4 border-yellow-200">
                        <IndianRupee className="w-16 h-16 text-yellow-900" />
                      </div>
                    </div>

                    <div>
                      <p className="text-5xl font-black text-yellow-300" data-testid="text-reward-amount">
                        ₹{rewardAmount}
                      </p>
                      <p className="text-xl font-semibold text-white mt-2">
                        Cashback
                      </p>
                    </div>

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

                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    transform: 'scale(1.2)',
                  }}
                />
              </div>
            </div>
          ) : null}

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

        {showReward && (isVerified || timeExpired) && (
          <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 justify-center">
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-6 text-lg font-medium pl-[0px] pr-[0px] ml-[0px] mr-[0px] pt-[0px] pb-[0px]"
              data-testid="button-try-again"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </Button>
          </div>
        )}
      </div>

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
  );
}
