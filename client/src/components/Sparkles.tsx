import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface SparklesProps {
  trigger: boolean;
  count?: number;
  scale?: number | number[];
  size?: number;
  speed?: number;
  opacity?: number;
  color?: string;
  position?: [number, number, number];
  noise?: number;
}

export default function Sparkles({
  trigger,
  count = 60,
  scale = 4,
  size = 6,
  speed = 0.4,
  opacity = 0.5,
  color = '#5ba085',
  noise = 0,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newSparkles: Sparkle[] = [];
    const duration = 1 / (speed + 0.1) * 1000;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const randomNoise = noise > 0 ? (Math.random() - 0.5) * noise : 0;
      const spreadScale = typeof scale === 'number' ? scale : scale[0];

      newSparkles.push({
        id: i,
        x: Math.cos(angle + randomNoise) * spreadScale * 100,
        y: Math.sin(angle + randomNoise) * spreadScale * 100,
        size: size + (Math.random() - 0.5) * size * 0.3,
        duration: duration,
        delay: Math.random() * 100,
      });
    }

    setSparkles(newSparkles);

    const timeout = setTimeout(() => {
      setSparkles([]);
    }, duration + 500);

    return () => clearTimeout(timeout);
  }, [trigger, count, scale, size, speed, noise]);

  if (sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute"
          style={{
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            left: '50%',
            top: '50%',
            marginLeft: `${-sparkle.size / 2}px`,
            marginTop: `${-sparkle.size / 2}px`,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: opacity,
            boxShadow: `0 0 ${sparkle.size}px ${color}`,
            animation: `sparkleShoot ${sparkle.duration}ms ease-out forwards`,
            animationDelay: `${sparkle.delay}ms`,
            // @ts-ignore
            '--tx': `${sparkle.x}px`,
            '--ty': `${sparkle.y}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkleShoot {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
