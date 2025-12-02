import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import bgImage from '@assets/Gemini_Generated_Image_mnpedumnpedumnpe_1764676809813.png';

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
    <div 
      className="min-h-screen flex flex-col items-center justify-start pt-10 relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* Main Content */}
      <div className="relative z-0 flex flex-col items-center justify-start pt-10 gap-12 px-0">
        <Button
          onClick={handleClick}
          disabled={isAnimating}
          className="
            w-full
            text-black font-extrabold text-xl
            py-5 px-8
            rounded-2xl
            bg-gradient-to-b from-yellow-300 to-yellow-500
            shadow-[0_8px_0_#caa335,0_12px_25px_rgba(0,0,0,0.4)]
            border border-yellow-200
            relative
            overflow-hidden
          "
          data-testid="button-click-to-open"
        >
          {/* Top glossy shine */}
          <span className="
            absolute inset-0
            rounded-2xl
            bg-gradient-to-b from-white/40 to-transparent
            pointer-events-none
          " />

          <span className="relative z-10">CLICK TO OPEN</span>
        </Button>

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
