import { useState, useEffect } from 'react';
import PrizeCard from '../PrizeCard';

export default function PrizeCardExample() {
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    setIsRevealing(true);
  }, []);

  const prize = {
    id: '1',
    name: 'Golden Crown',
    description: 'A legendary prize worthy of royalty!',
    rarity: 'legendary' as const,
    icon: 'crown' as const,
    amount: 10000,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <PrizeCard prize={prize} isRevealing={isRevealing} />
    </div>
  );
}
