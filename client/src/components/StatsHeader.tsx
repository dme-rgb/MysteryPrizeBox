import { Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatsHeaderProps {
  totalWinners: number;
  customerVerified?: number;
  verificationTimeLeft?: number | null;
}

export default function StatsHeader({ totalWinners, customerVerified = 0, verificationTimeLeft }: StatsHeaderProps) {
  return (
    <div className="w-full bg-card border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Total Verified Rewards */}
        <div className="flex items-center justify-center gap-3">
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

        {/* Right: Customer Verified Amount + Timer */}
        {customerVerified > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Verified Rewards</p>
              <p className="text-2xl font-bold text-primary">₹{customerVerified}</p>
            </div>
            {(verificationTimeLeft ?? null) !== null && verificationTimeLeft && verificationTimeLeft > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg border border-yellow-500/30">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {verificationTimeLeft}s
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
