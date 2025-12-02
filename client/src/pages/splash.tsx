import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import bgImage from '@assets/Gemini_Generated_Image_mnpedumnpedumnpe_1764676809813.png';
import mysteryBoxImg from '@assets/Gemini_Generated_Image_2rmhxj2rmhxj2rmh-Photoroom_1764679645336.png';

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
      <div className="relative z-0 flex flex-col items-center justify-start pt-10 gap-8 px-0">
        {/* Mystery Box Image */}
        <img 
          src={mysteryBoxImg} 
          alt="Mystery Box" 
          className="w-30 h-30 object-contain"
        />
        
        <Button
          onClick={handleClick}
          disabled={isAnimating}
          className="
            w-[70%]                /* smaller width */
            text-black font-extrabold text-lg
            py-4 px-6             /* smaller height */
            rounded-2xl
            bg-gradient-to-b from-yellow-300 to-yellow-500
            shadow-[0_6px_0_#caa335,0_10px_20px_rgba(0,0,0,0.35)]
            border border-yellow-200
            relative
            overflow-hidden
            mx-auto               /* center the button */
          "
          data-testid="button-click-to-open"
        >
          {/* Shine */}
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
