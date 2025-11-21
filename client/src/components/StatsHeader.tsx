import { Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatsHeaderProps {
  totalWinners: number;
  customerVerified?: number;
  verificationTimeLeft?: number | null;
}

export default function StatsHeader({ totalWinners, customerVerified = 0, verificationTimeLeft }: StatsHeaderProps) {
  // Don't show any header when customer is playing (customerVerified > 0)
  if (customerVerified > 0) {
    return null;
  }

  // Show total verified rewards when no customer is playing (registration screen)
  return (
    <div className="w-full bg-card border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <p className="text-lg font-medium text-foreground">
          Total Verified Rewards:
        </p>
        <Badge 
          className="bg-primary text-primary-foreground text-lg px-4 py-1 font-bold"
          data-testid="badge-total-winners"
        >
          {totalWinners}
        </Badge>
      </div>
    </div>
  );
}
