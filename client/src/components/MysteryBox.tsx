import { useState } from 'react';
import boxImage from '@assets/download_1763703442522-removebg-preview_1763722762444.png';

interface MysteryBoxProps {
  onOpen: () => void;
  isOpening: boolean;
  isOpened: boolean;
  disabled?: boolean;
}

export default function MysteryBox({ onOpen, isOpening, isOpened, disabled = false }: MysteryBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1200px' }}>
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isOpening || isOpened || disabled}
        className="relative focus:outline-none focus:ring-4 focus:ring-primary/50 rounded-lg transition-all disabled:cursor-not-allowed"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered && !isOpening && !isOpened ? 'scale(1.08) translateY(-5px)' : 'scale(1)',
          transition: 'transform 0.3s ease-out',
        }}
        data-testid="button-mystery-box"
      >
        {/* Main Box Image */}
        <div className="relative" style={{ width: '350px', height: '350px' }}>
          <img
            src={boxImage}
            alt="Mystery Box"
            className="w-full h-full object-contain relative z-10 pointer-events-none select-none"
            style={{
              filter: isOpened ? 'brightness(1.3) saturate(1.2)' : 'brightness(1)',
              transition: 'filter 0.3s ease',
              animation: isOpening ? 'lidOpen 0.8s ease-out forwards' : 'none',
              transformStyle: 'preserve-3d',
              transform: isOpened ? 'rotateX(-15deg) translateY(-30px)' : 'rotateX(0deg)',
            }}
          />

          {/* Magical Glow Overlay - Pulsing */}
          {!isOpened && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(91, 160, 133, 0.4) 0%, transparent 60%)',
                filter: 'blur(20px)',
                animation: 'boxGlow 1.5s ease-in-out infinite',
                zIndex: 5,
              }}
            />
          )}

          {/* Green Energy Swirls - Rotating */}
          {!isOpened && (
            <>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, transparent 80%, rgba(91, 160, 133, 0.2) 50%, transparent 70%)',
                  animation: 'spin 8s linear infinite',
                  zIndex: 8,
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, transparent 45%, rgba(65, 136, 110, 0.3) 55%, transparent 65%)',
                  animation: 'spin 6s linear infinite reverse',
                  zIndex: 7,
                }}
              />
            </>
          )}

          {/* Golden Sparkles on Hover */}
          {isHovered && !isOpening && !isOpened && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                filter: 'blur(15px)',
                animation: 'pulseGlow 1s ease-in-out infinite',
                zIndex: 9,
              }}
            />
          )}

          {/* Opening Burst Effect */}
          {isOpening && (
            <>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(91, 160, 133, 0.6) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  animation: 'pulseGlow 0.5s ease-out',
                  zIndex: 15,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  border: '3px solid rgba(91, 160, 133, 0.8)',
                  animation: 'expandRing 0.6s ease-out',
                  zIndex: 14,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 60%)',
                  filter: 'blur(20px)',
                  animation: 'intensePulse 0.5s ease-out',
                  zIndex: 13,
                }}
              />
            </>
          )}

          {/* Bottom Shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
              filter: 'blur(12px)',
              zIndex: 1,
            }}
          />
        </div>

        {/* Hover Prompt */}
        {!isOpening && !isOpened && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <p className="text-base font-medium text-foreground animate-pulse" data-testid="text-click-prompt">
              Click to Open
            </p>
          </div>
        )}
      </button>

      {/* Additional CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes expandRing {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes intensePulse {
          0% {
            opacity: 0.6;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.4;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
