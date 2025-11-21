import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  delay: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  type: 'burst' | 'confetti';
}

export default function ParticleEffect({ trigger, type }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = [];
    const count = type === 'burst' ? 30 : 50;
    const colors = type === 'burst' 
      ? ['#ffd700', '#5ba085', '#41886e', '#ffffff']
      : ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = type === 'burst' ? 100 + Math.random() * 100 : 50;
      
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        tx: Math.cos(angle) * velocity,
        ty: type === 'burst' ? Math.sin(angle) * velocity : Math.random() * 100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 200,
      });
    }

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [trigger, type]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            width: type === 'burst' ? '8px' : '12px',
            height: type === 'burst' ? '8px' : '12px',
            backgroundColor: particle.color,
            borderRadius: type === 'burst' ? '50%' : '2px',
            left: '50%',
            top: '50%',
            // @ts-ignore
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`,
            animation: type === 'burst' 
              ? `particleBurst 1s ease-out forwards`
              : `confettiFall 2s ease-out forwards`,
            animationDelay: `${particle.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
