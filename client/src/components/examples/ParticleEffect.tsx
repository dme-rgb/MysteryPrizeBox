import { useState } from 'react';
import ParticleEffect from '../ParticleEffect';
import { Button } from '@/components/ui/button';

export default function ParticleEffectExample() {
  const [burstTrigger, setBurstTrigger] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const triggerBurst = () => {
    setBurstTrigger(false);
    setTimeout(() => setBurstTrigger(true), 10);
  };

  const triggerConfetti = () => {
    setConfettiTrigger(false);
    setTimeout(() => setConfettiTrigger(true), 10);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background gap-6">
      <Button onClick={triggerBurst} data-testid="button-trigger-burst">
        Trigger Burst
      </Button>
      <Button onClick={triggerConfetti} data-testid="button-trigger-confetti">
        Trigger Confetti
      </Button>
      
      <ParticleEffect trigger={burstTrigger} type="burst" />
      <ParticleEffect trigger={confettiTrigger} type="confetti" />
    </div>
  );
}
