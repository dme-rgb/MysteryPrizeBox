import { useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';

interface MysteryBoxProps {
  onOpen: () => void;
  isOpening: boolean;
  isOpened: boolean;
}

export default function MysteryBox({ onOpen, isOpening, isOpened }: MysteryBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1000px' }}>
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isOpening || isOpened}
        className="relative focus:outline-none focus:ring-4 focus:ring-primary/50 rounded-lg transition-transform disabled:cursor-not-allowed"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered && !isOpening && !isOpened ? 'scale(1.05)' : 'scale(1)',
        }}
        data-testid="button-mystery-box"
      >
        {/* Box Container */}
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            width: '280px',
            height: '280px',
          }}
        >
          {/* Box Lid */}
          <div
            className="absolute inset-x-0 top-0 h-20 rounded-t-lg transition-all duration-800"
            style={{
              background: 'linear-gradient(135deg, #5ba085 0%, #41886e 50%, #2d5f4a 100%)',
              transformOrigin: 'bottom',
              transformStyle: 'preserve-3d',
              animation: isOpening ? 'lidOpen 0.8s ease-out forwards' : isOpened ? 'none' : 'boxGlow 1.5s ease-in-out infinite',
              transform: isOpened ? 'rotateX(-120deg) translateY(-80px) translateZ(40px)' : 'rotateX(0deg)',
              boxShadow: isOpened ? 'none' : '0 4px 20px rgba(65, 136, 110, 0.3)',
            }}
          >
            {/* Lid Top Face */}
            <div className="absolute inset-0 rounded-t-lg border-2 border-[#2d5f4a] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#ffd700]" />
            </div>
            
            {/* Lid Front Face */}
            <div
              className="absolute bottom-0 left-0 right-0 h-6"
              style={{
                background: 'linear-gradient(180deg, #2d5f4a 0%, #1a3d2e 100%)',
                transformOrigin: 'top',
                transform: 'rotateX(-90deg)',
              }}
            />
          </div>

          {/* Box Body */}
          <div
            className="absolute inset-x-0 bottom-0 rounded-b-lg"
            style={{
              height: '200px',
              background: 'linear-gradient(135deg, #5ba085 0%, #41886e 50%, #2d5f4a 100%)',
              transformStyle: 'preserve-3d',
              border: '2px solid #2d5f4a',
              animation: !isOpened ? 'boxGlow 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {/* Lock/Clasp */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#d4af37] rounded-lg flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-[#2d5f4a]" />
            </div>

            {/* Decorative Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#ffd700] opacity-50" />
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#ffd700] opacity-50" />

            {/* Bottom shadow */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full"
              style={{
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Side Faces for 3D effect */}
          <div
            className="absolute top-20 left-0 h-[200px] w-8"
            style={{
              background: 'linear-gradient(90deg, #2d5f4a 0%, #1a3d2e 100%)',
              transformOrigin: 'right',
              transform: 'rotateY(-90deg)',
            }}
          />
          <div
            className="absolute top-20 right-0 h-[200px] w-8"
            style={{
              background: 'linear-gradient(90deg, #1a3d2e 0%, #2d5f4a 100%)',
              transformOrigin: 'left',
              transform: 'rotateY(90deg)',
            }}
          />
        </div>

        {/* Hover Prompt */}
        {!isOpening && !isOpened && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Click to Open
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
