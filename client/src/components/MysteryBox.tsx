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
    <div className="relative flex items-center justify-center" style={{ perspective: '1500px' }}>
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isOpening || isOpened || disabled}
        className="relative focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all disabled:cursor-not-allowed"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered && !isOpening && !isOpened ? 'scale(1.12) translateY(-8px) rotateY(5deg)' : 'scale(1)',
          transition: 'transform 0.3s ease-out',
        }}
        data-testid="button-mystery-box"
      >
        {/* 3D Box Container */}
        <div 
          className="relative"
          style={{ 
            width: '350px', 
            height: '350px',
            transformStyle: 'preserve-3d',
            transform: isOpening ? 'rotateX(10deg) rotateY(-5deg)' : 'rotateX(0deg)',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Box Base/Body */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: isOpened ? 'translateY(20px)' : 'translateY(0px)',
              transition: isOpening ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.3s ease-out',
            }}
          >
            <img
              src={boxImage}
              alt="Mystery Box Base"
              className="w-full h-full object-contain relative pointer-events-none select-none"
              style={{
                filter: isOpened ? 'brightness(0.8) saturate(0.9)' : 'brightness(1)',
                transition: 'filter 0.4s ease',
                opacity: isOpened ? 0.6 : 1,
              }}
            />
          </div>

          {/* Box Lid - Opens and rotates */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: isOpening || isOpened ? 'rotateX(-120deg) translateY(-60px) translateZ(80px)' : 'rotateX(0deg) translateY(0px)',
              transition: isOpening ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.3s ease-out',
              transformOrigin: 'center top',
            }}
          >
            <img
              src={boxImage}
              alt="Mystery Box Lid"
              className="w-full h-full object-contain relative pointer-events-none select-none"
              style={{
                filter: isOpened ? 'brightness(1.2) saturate(1.3)' : 'brightness(1)',
                transition: 'filter 0.4s ease',
              }}
            />
          </div>

          {/* Inner Glow - Light from inside */}
          {(isOpening || isOpened) && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(91, 160, 133, 0.8) 0%, rgba(91, 160, 133, 0.3) 40%, transparent 70%)',
                filter: 'blur(25px)',
                animation: 'innerGlow 0.8s ease-out',
                zIndex: 10,
              }}
            />
          )}

          {/* Magical Glow Overlay - Pulsing (before opening) */}
          {!isOpened && !isOpening && (
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

          {/* Green Energy Swirls - Rotating (before opening) */}
          {!isOpened && !isOpening && (
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

          {/* Golden Sparkles on Hover (before opening) */}
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

          {/* Opening Explosion Effect */}
          {isOpening && (
            <>
              {/* Expanding ring */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  border: '4px solid rgba(91, 160, 133, 0.9)',
                  animation: 'expandRingBox 0.7s ease-out forwards',
                  zIndex: 14,
                }}
              />
              
              {/* Shockwave */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                  animation: 'shockwave 0.6s ease-out',
                  zIndex: 12,
                }}
              />

              {/* Particle burst lines */}
              <div
                className="absolute top-0 left-1/2 w-1 h-full pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(91, 160, 133, 0.8), transparent)',
                  animation: 'burstLine 0.6s ease-out',
                  zIndex: 11,
                }}
              />
              <div
                className="absolute left-0 top-1/2 w-full h-1 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(91, 160, 133, 0.8), transparent)',
                  animation: 'burstLine 0.6s ease-out',
                  zIndex: 11,
                }}
              />
            </>
          )}

          {/* Bottom Shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
              filter: 'blur(12px)',
              zIndex: 1,
              transform: isOpened ? 'scaleY(0.5)' : 'scaleY(1)',
              transition: 'transform 0.6s ease-out',
            }}
          />
        </div>

        {/* Hover Prompt */}
        {!isOpening && !isOpened && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
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
        
        @keyframes expandRingBox {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes shockwave {
          0% {
            opacity: 0.8;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes burstLine {
          from {
            opacity: 1;
            transform: scaleY(1);
          }
          to {
            opacity: 0;
            transform: scaleY(1.2);
          }
        }

        @keyframes innerGlow {
          from {
            opacity: 0;
            filter: blur(40px);
          }
          to {
            opacity: 1;
            filter: blur(15px);
          }
        }
      `}</style>
    </div>
  );
}
