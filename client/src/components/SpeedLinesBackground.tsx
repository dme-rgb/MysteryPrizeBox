export default function SpeedLinesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e]">
      {/* Speed lines radiating from center */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.6)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.7)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </linearGradient>
        </defs>

        {/* Green speed lines */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const length = 1200;
          const endX = 600 + Math.cos(angle) * length;
          const endY = 400 + Math.sin(angle) * length;
          return (
            <line
              key={`green-${i}`}
              x1="600"
              y1="400"
              x2={endX}
              y2={endY}
              stroke="url(#greenGradient)"
              strokeWidth="2"
              opacity="0.4"
              className="animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          );
        })}

        {/* Golden speed lines */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 + 15) * (Math.PI / 180);
          const length = 1200;
          const endX = 600 + Math.cos(angle) * length;
          const endY = 400 + Math.sin(angle) * length;
          return (
            <line
              key={`gold-${i}`}
              x1="600"
              y1="400"
              x2={endX}
              y2={endY}
              stroke="url(#goldGradient)"
              strokeWidth="1.5"
              opacity="0.3"
              className="animate-pulse"
              style={{
                animationDelay: `${i * 0.1 + 0.05}s`,
              }}
            />
          );
        })}
      </svg>

      {/* Central glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
    </div>
  );
}
