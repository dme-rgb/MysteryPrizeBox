import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatsHeaderProps {
  totalWinners: number;
}

export default function StatsHeader({ totalWinners }: StatsHeaderProps) {
  return (
    <div className="w-full bg-card border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <p className="text-lg font-medium text-foreground">
          Total Customers Receiving Rewards:
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
