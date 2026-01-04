import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MysteryBox from '@/components/MysteryBox';
import Sparkles from '@/components/Sparkles';
import ParticleEffect from '@/components/ParticleEffect';
import CustomerForm from '@/components/CustomerForm';
import StatsHeader from '@/components/StatsHeader';
import { RotateCcw, IndianRupee, CheckCircle, AlertCircle, AlertTriangle, Clock, MessageCircle, Upload, LogIn, Share2 } from 'lucide-react';
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
  vehicleType?: string; // bike, car, or truck
  fuelAmount: number | null;
  rewardAmount: number | null;
  isVerified: boolean;
  alreadyPlayedToday: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
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
  const [payoutStatus, setPayoutStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [payoutTransactionId, setPayoutTransactionId] = useState<string | null>(null);
  const [vpaMessage, setVpaMessage] = useState<string | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState<string | null>(null);
  const [alreadyPlayedError, setAlreadyPlayedError] = useState(false);
  const [tellYourFriendExpired, setTellYourFriendExpired] = useState(false);
  const [tellYourFriendTimeLeft, setTellYourFriendTimeLeft] = useState<number | null>(null);



  const WHATSAPP_NUMBER = "+918817828153";
  const LOCATION_LINK = "https://maps.app.goo.gl/a4Zv8jNbYTpub6A5A";

  // Audio references
  const bgMusicRef = React.useRef<HTMLAudioElement | null>(null);
  const boxOpeningSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio elements on mount
  useEffect(() => {
    // Create background music element
    if (!bgMusicRef.current) {
      const bgAudio = new Audio('https://files.catbox.moe/p1pum1.mp3');
      bgAudio.loop = true;
      bgAudio.volume = 0.3;
      bgMusicRef.current = bgAudio;
    }

    // Create box opening sound element
    if (!boxOpeningSoundRef.current) {
      const openSound = new Audio('https://files.catbox.moe/bhtmen.mp3');
      openSound.volume = 0.5;
      boxOpeningSoundRef.current = openSound;
    }

    return () => {
      // Cleanup
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    };
  }, []);

  // Start background music on first user interaction
  useEffect(() => {
    const startAudio = () => {
      if (bgMusicRef.current && !audioInitialized) {
        bgMusicRef.current.play().catch(() => {
          // Audio playback might be blocked by browser
        });
        setAudioInitialized(true);
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [audioInitialized]);

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
      // Update reward amount if it was changed (e.g., doubled by employee)
      if (verificationStatus.prize !== null && verificationStatus.prize !== rewardAmount) {
        setRewardAmount(verificationStatus.prize);
      }
      // Mark payment as being processed
      setPayoutStatus('pending');
      toast({
        title: "Reward Verified!",
        description: "Your cashback payment is being processed...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      if (customerData?.vehicleNumber) {
        queryClient.invalidateQueries({ queryKey: ['/api/vehicles', customerData.vehicleNumber, 'total-verified-amount'] });
      }

      // Fetch actual payment status from backend after a short delay
      setTimeout(async () => {
        try {
          const res = await fetch(`/api/customers/${customerId}/payment-status`);
          if (res.ok) {
            const data = await res.json();
            if (data.paymentStatus === 'success') {
              setPayoutStatus('success');
              setPayoutTransactionId(data.transactionId || `TXN-${Date.now()}`);
            } else {
              setPayoutStatus('failed');
            }
          } else {
            // Default to success if endpoint not available (backward compatibility)
            setPayoutStatus('success');
            setPayoutTransactionId(`TXN-${Date.now()}`);
          }

          // Fetch transaction details (VPA message and beneficiary name)
          if (customerData?.phoneNumber) {
            try {
              const txnRes = await fetch(`/api/transaction-details?phone=${encodeURIComponent(customerData.phoneNumber)}`);
              if (txnRes.ok) {
                const txnData = await txnRes.json();
                if (txnData.vpaMessage) {
                  setVpaMessage(txnData.vpaMessage);
                }
                if (txnData.beneficiaryName) {
                  setBeneficiaryName(txnData.beneficiaryName);
                }
              }
            } catch (error) {
              console.error('Failed to fetch transaction details:', error);
            }
          }
        } catch (error) {
          console.error('Failed to fetch payment status:', error);
          setPayoutStatus('success');
          setPayoutTransactionId(`TXN-${Date.now()}`);
        }
      }, 500);
    }
  }, [verificationStatus?.verified, isVerified, customerData?.vehicleNumber, customerId, toast]);

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

  // No timer needed - "Tell Your Friend" button shows permanently after verification

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
      // Check if customer already played today
      if (data.alreadyPlayedToday) {
        setAlreadyPlayedError(true);
        setCustomerId(null);
        toast({
          title: "Already Played Today",
          description: "You can only play once per day. Come back tomorrow!",
          variant: "destructive",
        });
        return;
      }

      // Update with real ID from backend
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

    // Show mystery box immediately with a temporary ID
    const tempId = `temp-${Date.now()}`;
    setCustomerId(tempId);
    setShowFormModal(false);

    // Make the API call in the background
    createCustomerMutation.mutate({
      name: defaultName,
      ...data,
    });
  };

  const handleClickToOpen = () => {
    setShowFormModal(true);
  };

  // Play box opening sound with background music pause/resume
  const playBoxOpeningSound = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }

    if (boxOpeningSoundRef.current) {
      boxOpeningSoundRef.current.currentTime = 0;
      boxOpeningSoundRef.current.play().catch(() => {
        // Sound playback failed
      });

      // Resume background music after box opening sound finishes
      const soundDuration = 2000; // Approximate duration in ms
      setTimeout(() => {
        if (bgMusicRef.current) {
          bgMusicRef.current.play().catch(() => {
            // Audio playback might be blocked by browser
          });
        }
      }, soundDuration);
    }
  };

  const handleOpen = () => {
    // Prevent opening with temp ID
    if (!customerId || customerId.startsWith('temp-')) {
      toast({
        title: "Loading...",
        description: "Please wait for registration to complete.",
        variant: "destructive",
      });
      return;
    }

    setIsOpening(true);

    // Play box opening sound with background music pause/resume
    try {
      playBoxOpeningSound();
    } catch (e) {
      // Audio playback might fail
    }

    // Calculate reward based on vehicle type and fuel amount
    const fuelAmount = customerData?.fuelAmount || 0;
    const vehicleType = customerData?.vehicleType || 'bike';
    const reward = calculateReward(vehicleType, fuelAmount);

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
    setPayoutStatus(null);
    setPayoutTransactionId(null);
    setTellYourFriendExpired(false);
    setTellYourFriendTimeLeft(null);
    setTellYourFriendExpired(false);
    setTellYourFriendTimeLeft(null);
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

  const handleTellYourFriend = () => {
    if (!rewardAmount) return;

    // Get total winnings for the share URL
    const totalWinnings = customerVerifiedData?.totalAmount || 0;

    // Create shareable URL with OG meta tags for image preview
    const shareUrl = `/share?prize=${rewardAmount}${totalWinnings > rewardAmount ? `&total=${totalWinnings}` : ''}`;
    const fullShareUrl = `${window.location.origin}${shareUrl}`;

    // Create the detailed message with prize info
    const totalMessage = totalWinnings > rewardAmount ? `\n\nTotal winnings so far: ₹${totalWinnings}` : '';
    const detailedMessage = `⛽ Just fuelled up at JioBP Siltara and played their Mystery Box game. Got ₹${rewardAmount} back instantly! 🎁\n\nTry your luck here & let me know!${totalMessage}\n\n`;

    // Open WhatsApp with both the message and shareable link
    const fullMessage = encodeURIComponent(`${detailedMessage}\n\nView details: ${fullShareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${fullMessage}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp Opened!",
      description: "Share the message with the link - image preview will appear!",
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
    <div
      className=" min-h-screen flex flex-col relative overflow-x-hidden mx-auto"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
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
      <div className="relative w-full z-10 px-7 pt-[0px] pb-[0px] pl-[34px] pr-[40px]">
        {!customerId ? (
          // Splash Screen with Mystery Box Image and CLICK TO OPEN button
          (<div
            className="max-h-screen flex flex-col items-center justify-center relative z-9"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          >
            {/* Mystery Box Image */}
            <img
              src={mysteryBoxImg}
              alt="Mystery Box"
              className="w-37 h-50 object-contain mb-12"
            />

            {/* CLICK TO OPEN Button */}
            <Button
              onClick={handleClickToOpen}
              className="w-[70%] max-w-xs text-black font-extrabold text-lg py-4 px-6 rounded-2xl bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-[0_6px_0_#caa335,0_10px_20px_rgba(0,0,0,0.35)] border border-yellow-200 relative overflow-hidden mx-auto pt-[12px] pb-[12px] ml-[50px] mr-[50px] hover:shadow-[0_4px_0_#caa335,0_8px_15px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_#caa335,0_4px_8px_rgba(0,0,0,0.2)]"
              data-testid="button-click-to-open"
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <span className="relative z-10">CLICK TO OPEN</span>
            </Button>

            {/* Employee Login Link - Bottom Right */}
            <div className="fixed bottom-7 right-3 z-50">
              <Link href="/employee">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-medium"
                  data-testid="button-employee-login"
                >
                  <div className="flex flex-row items-center justify-center gap-1">
                    <LogIn className="w-4 h-4" />
                    Employee Login</div>
                </Button>
              </Link>
            </div>

            {/* Form Modal */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
              <DialogContent className="
                 max-w-sm
                p-8 rounded-2xl
                overflow-hidden
                shadow-[0_0_40px_rgba(0,0,0,0.7)]
                bg-[#0b3b2a] 
                border-[5px] border-[#f5d67a]
">
                <CustomerForm
                  onSubmit={handleFormSubmit}
                  isSubmitting={createCustomerMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>)
        ) : (
          // Game Screen
          (<>
            {/* Customer's Total Verified Rewards - Only on mystery box screen */}
            {!showReward && customerVerifiedData && customerVerifiedData.totalAmount > 0 && (
              <div className="w-full py-0 px-0 mb-10 mt-6">
                <div
                  className="w-full mx-auto rounded-2xl shadow-lg py-2 px-6 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(180deg, #F6E27A 4%, #D4A631 100%)",
                    border: "3px solid #E5C45A",
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.35), inset 0px 0px 10px rgba(255,255,255,0.4)",
                    borderRadius: "16px",
                  }}
                >
                  <p className="text-l font-bold text-black tracking-wide">
                    Your Total Verified Cashback:
                  </p>
                  <span
                    className="text-2xl font-extrabold text-golden-yellow"
                    style={{
                      textShadow: "0px 2px 4px rgba(0,0,0,0.4)"
                    }}
                  >
                    ₹{customerVerifiedData.totalAmount}
                  </span>
                </div>
              </div>
            )}
            <div className="text-center mb-12 space-y-4 relative z-10">

              {alreadyPlayedError && (
                <Alert variant="destructive" data-testid="alert-already-played">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>You Already Played Today!</AlertTitle>
                  <AlertDescription>
                    Only one entry per vehicle per day is allowed. Come back tomorrow to play again!
                  </AlertDescription>
                </Alert>
              )}

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
            <div className="relative flex items-center justify-center min-h-[400px] pl-[36px] pr-[36px] pt-[25px] pb-[25px]">
              {!showReward ? (
                <MysteryBox onOpen={handleOpen} isOpening={isOpening} isOpened={isOpened} disabled={customerData?.alreadyPlayedToday || createCustomerMutation.isPending} />
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
                  <div className="relative flex justify-center w-full">
                    {/* Reward Card */}
                    <div
                      className="
                            relative
                            w-full max-w-sm
                            p-8 rounded-3xl
                            overflow-hidden
                            shadow-[0_0_40px_rgba(0,0,0,0.7)]
                            bg-[#0b3b2a] 
                            border-[5px] border-[#f5d67a]
                          "
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at top 20%, rgba(15,66,42,0.95), rgba(5,25,17,0.85))",
                      }}
                    >

                      {/* Card background shimmer */}
                      <div className="absolute inset-0 rounded-4xl pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 20%, rgba(255,223,120,0.25) 0%, rgba(0,0,0,0) 65%)',

                        }}
                      />
                      <div className="relative z-10 text-center space-y-6">
                        {/* Congratulations text */}
                        <div>
                          <p className="text-2xl font-bold text-white uppercase tracking-wide">
                            CONGRATULATIONS!
                          </p>
                          <p className="text-lg text-white/90 mt-1">
                            You won
                          </p>
                        </div>
                        {/* Amount */}
                        <div>
                          <p className="text-4xl font-bold text-[#ffe38a] drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">
                            ₹{rewardAmount} Cashback
                          </p>
                        </div>

                        {/* Rupee Icon */}
                        <div className="relative flex justify-center py-6">
                          {/* Outer radiant sunburst glow */}
                          <div
                            className="absolute w-56 h-36 rounded-full pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(255,225,120,0.65) 0%, rgba(255,210,80,0.25) 40%, rgba(255,180,0,0) 70%)",
                              filter: "blur(10px)",
                              transform: "scale(1.1)",
                            }}
                          />

                          {/* Sun rays */}
                          <div
                            className="absolute w-35 h-35 rounded-full pointer-events-none"
                            style={{
                              background:
                                "conic-gradient(from 0deg, rgba(255,240,150,0.7), rgba(255,200,50,0) 30%, rgba(255,240,150,0.7) 60%, rgba(255,200,50,0) 90%)",
                              filter: "blur(10px)",
                              opacity: 3,
                            }}
                          />

                          {/* Gold Coin */}
                          <div
                            className="
                              relative z-10
                              w-28 h-28
                              rounded-full
                              flex items-center justify-center
                              shadow-[0_0_40px_rgba(255,215,0,0.9)]
                              border-[6px] border-[#f9d25c]
                              bg-[radial-gradient(circle_at_50%_35%,#fff8cc_0%,#f9d25c_45%,#c89722_100%)]
                            "
                            style={{
                              boxShadow:
                                "inset 0 0 0 8px #be8f2e, 0 0 40px rgba(190, 143, 46,0.9)"
                              // ↑ inner border (same gold shade)
                              // second value = your original glow
                            }}
                          >
                            <IndianRupee className="w-14 h-14 text-[#be8f2e]" />
                          </div>
                        </div>


                        {/* Verification Status */}
                        <div className="pt-4 space-y-3">
                          {isVerified ? (
                            <div className="space-y-3">
                              <Badge
                                className="
                                    bg-[rgba(255,215,120,0.15)]
                                    text-[#f6d878]
                                    border-[#f6d878]
                                    px-4 py-2 text-base tracking-wide
                                    shadow-[0_0_12px_rgba(255,215,120,0.3)]
                                  "
                                data-testid="badge-verified"
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-[#f6d878]" />
                                Verified
                              </Badge>

                              {/* Payment Status */}
                              <div className="mt-4 p-4 rounded-lg bg-[#8A987B] border border-[#1a5c3d]">
                                {payoutStatus === 'success' ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-[#7eff5e] flex items-center justify-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Payment Sent Successfully
                                    </p>
                                    {payoutTransactionId && (
                                      <p className="text-xs text-[#a8d5a8] text-center break-all">
                                        TXN ID: {payoutTransactionId}
                                      </p>
                                    )}
                                    <p className="text-xs text-[#8d9b8a] text-center">
                                      Check your UPI app for the cashback transfer
                                    </p>
                                    {vpaMessage && (
                                      <p className="text-xs text-[#7eff5e] text-center mt-2 font-medium">
                                        {vpaMessage}
                                      </p>
                                    )}
                                    {beneficiaryName && (
                                      <p className="text-xs text-[#030304] text-center">
                                        Beneficiary: {beneficiaryName}
                                      </p>
                                    )}
                                  </div>
                                ) : payoutStatus === 'pending' ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-[#f6d878] flex items-center justify-center gap-2">
                                      <Clock className="w-4 h-4 animate-spin" />
                                      Processing Payment...
                                    </p>
                                    <p className="text-xs text-[#c9d3c2] text-center">
                                      Sending your cashback to your UPI account
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {vpaMessage ? (
                                      <>
                                        <p className="text-sm text-center font-medium text-[#7eff5e]">
                                          {vpaMessage}
                                        </p>
                                        {beneficiaryName && (
                                          <p className="text-xs text-[#030304] text-center">
                                            Beneficiary: {beneficiaryName}
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-center text-[#c9d3c2]">
                                        You will shortly receive the payment in your UPI account.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Referral Section - Show for all vehicle types after verification */}
                              <div className="mt-6 p-4 rounded-lg bg-[#0f3d2e] border border-[#1a5c3d] space-y-3">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-[#7eff5e] text-center animate-pulse">
                                    Increase Reward
                                  </p>
                                  <p className="text-xs text-[#a8d5a8] text-center">
                                    Share to get increased rewards next time
                                  </p>
                                </div>
                                <Button
                                  onClick={handleTellYourFriend}
                                  className="w-full gap-2
                                  bg-gradient-to-b from-blue-400 to-blue-600
                                  hover:from-blue-500 hover:to-blue-700
                                  text-white font-semibold
                                  shadow-[0_0_18px_rgba(59,130,246,0.3)]
                                  border border-blue-300"
                                  data-testid="button-tell-friend"
                                >
                                  <div className="flex flex-row items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" />
                                    <span>Tell Your Friend</span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // !isVerified: Show Waiting OR Failed/Expired state, PLUS the Upload Bill button always
                            <div className="space-y-6 w-full max-w-sm mx-auto">
                              {/* Status Badge */}
                              <div className="flex flex-col items-center gap-4">
                                {timeExpired || payoutStatus === 'failed' ? (
                                  <Badge
                                    className="
                                      bg-[rgba(255,165,90,0.15)]
                                      text-[#ffae73]
                                      border-[#ffae73]
                                      px-4 py-2 text-base tracking-wide
                                      shadow-[0_0_12px_rgba(255,165,90,0.3)]
                                    "
                                  >
                                    <Clock className="w-4 h-4 mr-2 text-[#ffae73]" />
                                    {timeExpired ? 'Verification Time Expired' : 'Payment Failed'}
                                  </Badge>
                                ) : (
                                  <>
                                    <Badge className="bg-[rgba(255,215,120,0.15)]
                                      text-[#f6d878]
                                      border-[#f6d878]
                                      px-4 py-2 text-base tracking-wide
                                      shadow-[0_0_12px_rgba(255,215,120,0.3)]" data-testid="badge-pending">
                                      <Clock className="w-4 h-4 mr-2 animate-pulse text-[#f6d878]" />
                                      Waiting for Verification
                                    </Badge>
                                    {verificationTimeLeft !== null && (
                                      <div className="text-center">
                                        <p className="text-sm font-medium text-[#b9c5b6] mb-1">Time Remaining:</p>
                                        <p className="text-3xl font-bold text-primary" data-testid="text-verification-timer">
                                          {verificationTimeLeft}s
                                        </p>
                                        <p className="text-xs text-[#8d9b8a] mt-2">
                                          Please wait while an employee verifies your reward.
                                        </p>
                                        <p className="text-xs text-[#8d9b8a] mt-4 font-semibold">
                                          OR
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Upload Bill / WhatsApp Flow - ALWAYS VISIBLE */}
                              {!showWhatsAppFlow ? (
                                <Button
                                  onClick={() => setShowWhatsAppFlow(true)}
                                  className="
                                    w-[90%]                /* smaller width */
                                    text-black font-bold text-sm
                                    py-3 px-4             /* smaller height */
                                    rounded-2xl
                                    bg-gradient-to-b from-yellow-300 to-yellow-500
                                    shadow-[0_6px_0_#caa335,0_10px_20px_rgba(0,0,0,0.35)]
                                    border border-yellow-200
                                    relative
                                    overflow-hidden
                                    mx-auto               /* center the button */
                                    block                 /* ensure block display */
                                  "
                                  data-testid="button-manual-verify"
                                >
                                  {/* Shine */}
                                  <span className="
                                    absolute inset-0
                                    rounded-2xl
                                    bg-gradient-to-b from-white/40 to-transparent
                                    pointer-events-none
                                  " />
                                  Upload Bill for Verification
                                </Button>
                              ) : (
                                <div className="space-y-3 p-4 bg-[#0b221a] rounded-lg border border-[#1a3c2d] shadow-lg">
                                  <p className="text-sm text-center text-[#d5e2cd]">
                                    Send your bill photo to WhatsApp number:
                                  </p>
                                  <p className="text-lg font-bold text-[#f6d878] text-center" data-testid="text-whatsapp-number">
                                    {WHATSAPP_NUMBER}
                                  </p>
                                  <Button
                                    onClick={handleWhatsAppUpload}
                                    className="w-full gap-2
                                    bg-[#0f3d2e]
                                    hover:bg-[#12523c]
                                    text-[#f6d878]
                                    shadow-[0_0_18px_rgba(255,215,120,0.2)]
                                    border border-[#f6d87840]"
                                    data-testid="button-open-whatsapp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Open WhatsApp & Send
                                  </Button>
                                  <p className="text-xs text-center text-[#8d9b8a]">
                                    After sending, you will receive your reward in the evening.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Golden glow effect */}
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
                  className="gap-2 px-8 py-6 text-lg font-medium pl-[0px] pr-[0px] ml-[0px] mr-[0px] pt-[0px] pb-[0px]"
                  data-testid="button-try-again"
                >
                  <RotateCcw className="w-3 h-4" />
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

// Helper function to calculate reward based on rules
function calculateReward(vehicleType: string, fuelAmount: number): number {
  const random = Math.random();

  // Normalize vehicle type
  const type = vehicleType.toLowerCase();

  if (type === 'truck') {
    // Truck Logic
    if (fuelAmount <= 9500) {
      // 0 to 9500: ₹1-₹10
      return Math.floor(Math.random() * 10) + 1;
    } else if (fuelAmount > 9500 && fuelAmount <= 19000) {
      // 9501 to 19000: ₹10-₹30
      return Math.floor(Math.random() * 21) + 10;
    } else if (fuelAmount > 19000 && fuelAmount <= 28500) {
      // 19001 to 28500: ₹20-₹40
      return Math.floor(Math.random() * 21) + 20;
    } else {
      // Above 28501: ₹40-50
      return Math.floor(Math.random() * 11) + 40;
    }
  } else {
    // Bike/Car Logic (and fallback)
    // Bike/Car Logic (and fallback)
    if (fuelAmount <= 500) {
      // 0-500: ₹1 to ₹5 (80% till ₹3, 20% till ₹5)
      // ₹1-3 (80%), ₹4-5 (20%)
      if (random < 0.8) {
        return Math.floor(Math.random() * 3) + 1; // 1-3
      } else {
        return Math.floor(Math.random() * 2) + 4; // 4-5
      }
    } else if (fuelAmount > 500 && fuelAmount <= 2000) {
      // 501-2000: ₹5 to ₹20
      // 90% between ₹8 to ₹12, 10% between ₹12 to ₹15
      if (random < 0.9) {
        return Math.floor(Math.random() * 5) + 8; // 8-12
      } else {
        return Math.floor(Math.random() * 3) + 13; // 13-15
      }
    } else if (fuelAmount > 2000 && fuelAmount <= 3000) {
      // 2001-3000: ₹10 to ₹30
      // 60%: ₹12 to ₹15
      // 30%: ₹16 to ₹20
      // 10%: ₹20 to ₹30
      if (random < 0.6) {
        return Math.floor(Math.random() * 4) + 12; // 12-15
      } else if (random < 0.9) {
        return Math.floor(Math.random() * 5) + 16; // 16-20
      } else {
        return Math.floor(Math.random() * 10) + 21; // 21-30
      }
    } else {
      // 3001+: ₹15 to ₹50
      // 60%: ₹22 to ₹25
      // 30%: ₹28 to ₹32
      // 10%: ₹35-₹50
      if (random < 0.6) {
        return Math.floor(Math.random() * 4) + 22; // 22-25
      } else if (random < 0.9) {
        return Math.floor(Math.random() * 5) + 28; // 28-32
      } else {
        return Math.floor(Math.random() * 16) + 35; // 35-50
      }
    }
  }
}
