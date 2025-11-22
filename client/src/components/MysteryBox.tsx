import { useState } from 'react';
import Sparkles from './Sparkles';

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
          transform: isHovered && !isOpening && !isOpened ? 'scale(1.08) translateY(-10px)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        data-testid="button-mystery-box"
      >
        {/* 3D Gift Box Container */}
        <div 
          className="relative"
          style={{ 
            width: '300px', 
            height: '300px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Box Base (Green Cube) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '200px',
              height: '200px',
              transformStyle: 'preserve-3d',
              transform: 'translate(-50%, -50%)',
              animation: isOpening ? 'boxBaseBounce 0.8s ease-out' : 'none',
            }}
          >
            {/* Front face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #41886e 0%, #2d5f4a 100%)',
                transform: 'rotateY(0deg) translateZ(100px)',
                border: '2px solid rgba(45, 95, 74, 0.5)',
                borderRadius: '8px',
              }}
            />
            {/* Back face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #2d5f4a 0%, #1e3e31 100%)',
                transform: 'rotateY(180deg) translateZ(100px)',
                border: '2px solid rgba(30, 62, 49, 0.5)',
                borderRadius: '8px',
              }}
            />
            {/* Right face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #3a7460 0%, #2a5347 100%)',
                transform: 'rotateY(90deg) translateZ(100px)',
                border: '2px solid rgba(42, 83, 71, 0.5)',
                borderRadius: '8px',
              }}
            />
            {/* Left face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #3a7460 0%, #2a5347 100%)',
                transform: 'rotateY(-90deg) translateZ(100px)',
                border: '2px solid rgba(42, 83, 71, 0.5)',
                borderRadius: '8px',
              }}
            />
            {/* Top face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #4a9377 0%, #3a7460 100%)',
                transform: 'rotateX(90deg) translateZ(100px)',
                border: '2px solid rgba(58, 116, 96, 0.5)',
                borderRadius: '8px',
              }}
            />
            {/* Bottom face */}
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #1e3e31 0%, #152b23 100%)',
                transform: 'rotateX(-90deg) translateZ(100px)',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Horizontal Ribbon (wraps around box) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '220px',
              height: '50px',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(180deg, #ffd966 0%, #e6c24d 50%, #cca833 100%)',
                border: '2px solid #b8941f',
                borderRadius: '4px',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>

          {/* Vertical Ribbon */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '50px',
              height: '220px',
              transform: 'translate(-50%, -50%)',
              zIndex: 6,
              pointerEvents: 'none',
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                background: 'linear-gradient(90deg, #ffd966 0%, #e6c24d 50%, #cca833 100%)',
                border: '2px solid #b8941f',
                borderRadius: '4px',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>


          {/* 3D Bow on Top */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '120px',
              height: '80px',
              transform: 'translate(-50%, -50%) translateY(-100px) translateZ(110px)',
              transformStyle: 'preserve-3d',
              zIndex: 10,
              pointerEvents: 'none',
              animation: isOpening ? 'bowLift 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
            }}
          >
            {/* Bow Center Knot */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: '30px',
                height: '35px',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #ffd966 0%, #cca833 100%)',
                border: '2px solid #b8941f',
                borderRadius: '6px',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Left Bow Loop */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: '50px',
                height: '45px',
                transform: 'translate(-100%, -50%) rotateY(-25deg)',
                background: 'linear-gradient(135deg, #ffd966 0%, #e6c24d 50%, #cca833 100%)',
                border: '3px solid #b8941f',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: 'inset -2px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Right Bow Loop */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: '50px',
                height: '45px',
                transform: 'translate(50%, -50%) rotateY(25deg)',
                background: 'linear-gradient(135deg, #ffd966 0%, #e6c24d 50%, #cca833 100%)',
                border: '3px solid #b8941f',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Left Ribbon Tail */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: '25px',
                height: '40px',
                transform: 'translate(-150%, 20%) rotateZ(-35deg)',
                background: 'linear-gradient(180deg, #e6c24d 0%, #cca833 100%)',
                border: '2px solid #b8941f',
                borderRadius: '4px 4px 0 80%',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Right Ribbon Tail */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: '25px',
                height: '40px',
                transform: 'translate(250%, 20%) rotateZ(35deg)',
                background: 'linear-gradient(180deg, #e6c24d 0%, #cca833 100%)',
                border: '2px solid #b8941f',
                borderRadius: '4px 4px 80% 0',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
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

      {/* Sparkle Effects on Opening */}
      <Sparkles 
        trigger={isOpening} 
        count={60} 
        scale={4} 
        size={6} 
        speed={0.4} 
        opacity={0.5} 
        color="#5ba085"
      />
      <Sparkles 
        trigger={isOpening} 
        count={40} 
        scale={3} 
        size={8} 
        speed={0.2} 
        opacity={0.3} 
        color="#5ba085"
        noise={0.5}
      />

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

        @keyframes boxGlow {
          0%, 100% {
            opacity: 0.3;
            filter: blur(20px);
          }
          50% {
            opacity: 0.6;
            filter: blur(25px);
          }
        }

        @keyframes bowLift {
          0% {
            transform: translate(-50%, -50%) translateY(-100px) translateZ(110px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-250px) translateZ(110px) rotateZ(20deg);
            opacity: 0.3;
          }
        }

        @keyframes boxBaseBounce {
          0% {
            transform: translate(-50%, -50%) scale(1) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05) translateY(-10px);
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
