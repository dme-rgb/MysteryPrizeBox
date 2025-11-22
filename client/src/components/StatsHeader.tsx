import { Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatsHeaderProps {
  totalWinners: number;
  customerVerified?: number;
  verificationTimeLeft?: number | null;
}

export default function StatsHeader({ totalWinners, customerVerified = 0, verificationTimeLeft }: StatsHeaderProps) {
  // Show customer's total prize amount when they're playing
  if (customerVerified > 0) {
    return (
      <div className="w-full bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <p className="text-lg font-medium text-foreground">
            Total Prize Won:
          </p>
          <Badge 
            className="bg-primary text-primary-foreground text-lg px-4 py-1 font-bold"
            data-testid="badge-customer-total"
          >
            ₹{customerVerified}
          </Badge>
        </div>
      </div>
    );
  }

  // Don't show header when no customer is playing
  return null;
}
