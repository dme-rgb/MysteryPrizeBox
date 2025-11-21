import { Trophy, Coins, Gem, Zap, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PrizeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Prize {
  id: string;
  name: string;
  description: string;
  rarity: PrizeRarity;
  icon: 'coins' | 'gem' | 'power' | 'trophy' | 'crown';
  amount?: number;
}

interface PrizeCardProps {
  prize: Prize;
  isRevealing: boolean;
}

const rarityConfig = {
  common: {
    color: 'bg-gray-500',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-300',
    glowColor: 'rgba(156, 163, 175, 0.3)',
  },
  rare: {
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  epic: {
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  legendary: {
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-300',
    glowColor: 'rgba(255, 215, 0, 0.5)',
  },
};

const iconMap = {
  coins: Coins,
  gem: Gem,
  power: Zap,
  trophy: Trophy,
  crown: Crown,
};

export default function PrizeCard({ prize, isRevealing }: PrizeCardProps) {
  const config = rarityConfig[prize.rarity];
  const IconComponent = iconMap[prize.icon];

  return (
    <div
      className="relative"
      style={{
        animation: isRevealing ? 'prizeReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
      }}
      data-testid={`card-prize-${prize.id}`}
    >
      <div
        className={`bg-card border-2 ${config.borderColor} rounded-lg p-8 min-w-[300px] relative overflow-hidden`}
        style={{
          animation: prize.rarity === 'legendary' || prize.rarity === 'epic' ? 'goldGlow 1.5s ease-in-out infinite' : 'none',
          boxShadow: `0 0 40px ${config.glowColor}`,
        }}
      >
        {/* Rarity Stars Background */}
        <div className="absolute top-2 right-2 flex gap-1">
          {Array.from({ length: prize.rarity === 'common' ? 1 : prize.rarity === 'rare' ? 2 : prize.rarity === 'epic' ? 3 : 4 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 fill-current ${config.textColor}`} />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${config.color} flex items-center justify-center`}>
          <IconComponent className="w-12 h-12 text-white" />
        </div>

        {/* Prize Info */}
        <div className="text-center space-y-3">
          <Badge className={`${config.color} text-white border-0 text-xs uppercase tracking-wide`}>
            {prize.rarity}
          </Badge>
          
          <h3 className="text-2xl font-bold text-foreground" data-testid={`text-prize-name-${prize.id}`}>
            {prize.name}
          </h3>
          
          {prize.amount && (
            <p className={`text-3xl font-bold ${config.textColor}`} data-testid={`text-prize-amount-${prize.id}`}>
              {prize.amount.toLocaleString()}
            </p>
          )}
          
          <p className="text-muted-foreground text-sm" data-testid={`text-prize-description-${prize.id}`}>
            {prize.description}
          </p>
        </div>

        {/* Shine effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
