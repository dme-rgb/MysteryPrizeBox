import { useState, type CSSProperties } from "react";
import boxImage from "@assets/box.png";
import LidImage from "@assets/lid.png";
import Sparkles from "./Sparkles";

interface MysteryBoxProps {
  onOpen: () => void;
  isOpening: boolean;
  isOpened: boolean;
  disabled?: boolean;
}

export default function MysteryBox({
  onOpen,
  isOpening,
  isOpened,
  disabled = false,
}: MysteryBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ perspective: "1500px" }}
    >
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isOpening || isOpened || disabled}
        className="relative focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all disabled:cursor-not-allowed"
        style={{
          transformStyle: "preserve-3d",
          transform:
            isHovered && !isOpening && !isOpened
              ? "scale(1.12) translateY(-8px) rotateY(5deg)"
              : "scale(1)",
          transition: "transform 0.3s ease-out",
        }}
        data-testid="button-mystery-box"
      >
        {/* Aura Ring - Breathing Effect */}

        {/* 3D Box Container */}
        <div
          className="relative"
          style={{
            width: "350px",
            height: "350px",
            transformStyle: "preserve-3d",
            transform: isOpening
              ? "rotateX(10deg) rotateY(-5deg)"
              : "rotateX(0deg)",
            transition: "transform 0.1s ease-out",
            animation:
              !isOpening && !isOpened
                ? "boxBounce 2s ease-in-out infinite"
                : "none",
          }}
        >
          {/* Box Base/Body */}
          <div className="relative w-[350px] h-[370px] flex items-center justify-center">
            {!isOpened && !isOpening && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: "250px",
                  height: "100px",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  border: "10px solid rgba(180, 255, 100, 0.3)",
                  borderRadius: "100%",

                  animation: "breathingRing 2s ease-in-out infinite",
                  zIndex: 3,
                }}
              />
            )}
            {/* Box Base */}
            <div
              className="absolute bottom-0 w-full h-full flex items-center justify-center z-10 pointer-events-none"
              style={{
                animation: isOpening ? "boxBaseBounce 0.8s ease-out" : "none",
              }}
            >
              <img
                src={boxImage}
                alt="Mystery Box Base"
                className="w-full h-full object-contain drop-shadow-2xl select-none"
                style={{
                  filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))",
                  opacity: isOpened ? 0.6 : 1,
                  transition: "opacity 0.4s ease",
                }}
              />
            </div>

            {/* Box Lid */}
            <div
              className="absolute top-0 w-full h-full flex items-center justify-center z-20 pointer-events-none"
              style={{
                transformOrigin: "top right",
                transformStyle: "preserve-3d",
                animation: isOpening
                  ? "lidFlip 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "none",
              }}
            >
              <img
                src={LidImage}
                alt="Mystery Box Lid"
                className="w-full h-full object-contain drop-shadow-2xl select-none"
                style={{
                  filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))",
                  transform: "translateY(-82px)",
                }}
              />
            </div>
          </div>

          {/* Inner Glow - Light from inside */}
          {(isOpening || isOpened) && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(180, 255, 100, 0.3) 0%, rgba(180, 255, 100, 0.1) 40%, transparent 70%)",
                filter: "blur(25px)",
                animation: "innerGlow 0.8s ease-out",
                zIndex: 10,
              }}
            />
          )}

          {/* Magical Glow Overlay - Pulsing (before opening) */}
          {!isOpened && !isOpening && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(180, 255, 100, 0.15) 0%, transparent 60%)",
                filter: "blur(20px)",

                animation: "boxGlow 1.5s ease-in-out infinite",
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
                  background:
                    "radial-gradient(circle, transparent 80%, rgba(180, 255, 100, 0.1) 50%, transparent 70%)",
                  animation: "spin 8s linear infinite",
                  zIndex: 8,
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, transparent 45%, rgba(140, 235, 80, 0.12) 55%, transparent 65%)",
                  animation: "spin 6s linear infinite reverse",
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
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 50%)",
                filter: "blur(15px)",
                animation: "pulseGlow 1s ease-in-out infinite",
                zIndex: 9,
              }}
            />
          )}

          {/* Opening Explosion Effect */}
          {isOpening && (
            <>
              

              {/* Swirling Magical Threads */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`thread-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "4px",
                    height: "80px",
                    background: `linear-gradient(to bottom, rgba(180, 255, 100, 0.9), rgba(255, 215, 0, 0.5), transparent)`,
                    borderRadius: "3px",
                    transformOrigin: "top center",
                    animation: "swirlThread 2.2s ease-out",
                    animationDelay: `${i * 0.1}s`,
                    transform: `rotate(${i * 30}deg)`,
                    zIndex: 14,
                    boxShadow: "0 0 6px rgba(180, 255, 100, 0.5)",
                  }}
                />
              ))}
            </>
          )}

          {/* Bottom Shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
              filter: "blur(12px)",
              zIndex: 1,
              transform: isOpened ? "scaleY(0.5)" : "scaleY(1)",
              transition: "transform 0.6s ease-out",
            }}
          />
        </div>

        {/* Hover Prompt */}
        {!isOpening && !isOpened && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
            <p
              className="text-base font-medium text-foreground animate-pulse"
              data-testid="text-click-prompt"
            >
              Click to Open
            </p>
          </div>
        )}
      </button>

      {/* Sparkle Effects on Opening */}
      <Sparkles
        trigger={isOpening}
        count={60}
        scale={2.2}
        size={6}
        speed={0.4}
        opacity={0.5}
        color="#B4FF64"
      />
      <Sparkles
        trigger={isOpening}
        count={40}
        scale={1.8}
        size={8}
        speed={0.2}
        opacity={0.3}
        color="#B4FF64"
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

        @keyframes lidFlip {
          0% {
            transform: translateY(-20px) translateX(0) rotateX(0) rotateZ(0);
            z-index: 20;
          }
          100% {
            transform: translateY(-100px) translateX(-50px) rotateX(-70deg) rotateZ(-15deg);
            z-index: 100;
          }
        }

        @keyframes boxBaseBounce {
          0% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            transform: scale(1) translateY(20px);
          }
        }

        @keyframes magicalBurstUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(0.5);
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-280px) scale(1.8);
          }
        }

        @keyframes swirlThread {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) rotate(0deg) scale(0);
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-140px) rotate(1080deg) scale(1.2);
          }
        }

        @keyframes coinFly-0 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(220px) translateY(-260px) rotate(720deg) scale(1.3); }
        }
        @keyframes coinFly-1 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(120px) translateY(-300px) rotate(840deg) scale(1.3); }
        }
        @keyframes coinFly-2 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(-120px) translateY(-300px) rotate(960deg) scale(1.3); }
        }
        @keyframes coinFly-3 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(-220px) translateY(-260px) rotate(1080deg) scale(1.3); }
        }
        @keyframes coinFly-4 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(-120px) translateY(-150px) rotate(1200deg) scale(1.3); }
        }
        @keyframes coinFly-5 {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) rotate(120deg) scale(1); }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) translateX(120px) translateY(-150px) rotate(1320deg) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
