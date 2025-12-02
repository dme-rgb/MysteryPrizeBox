import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import BackgroundStars from '@/components/BackgroundStars';

export default function Splash() {
  const [, setLocation] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setLocation('/home');
    }, 600);
  };

  return (
    <div className="w-screen min-h-screen bg-background flex flex-col items-center justify-start pt-10 relative overflow-hidden">

      {/* Animated Background Stars */}
      <BackgroundStars />

      {/* Main Content */}
      <div className="relative z-0 flex flex-col items-center justify-start pt-10 gap-12 px-0">
        {/* Mystery Box Card Container */}
        <div
          className={`relative w-full max-w-sm transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Card Border - Green with gold accent */}
          <div className="bg-gradient-to-b from-green-700 to-green-900 rounded-3xl p-1 border-4 border-yellow-500/70 shadow-2xl">
            <div className="bg-gradient-to-b from-green-800 to-green-950 rounded-3xl p-8 space-y-8">
              {/* Title */}
              <div className="text-center space-y-2">
                
                
              </div>

              {/* Mystery Box Image/Illustration - Using emoji as placeholder */}
              

              {/* Click to Open Button */}
              <Button
                onClick={handleClick}
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg py-6 rounded-lg shadow-lg border-2 border-yellow-600 transition-all duration-300"
                data-testid="button-click-to-open"
              >
                CLICK TO OPEN
              </Button>
            </div>
          </div>
        </div>
      </div>

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

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
