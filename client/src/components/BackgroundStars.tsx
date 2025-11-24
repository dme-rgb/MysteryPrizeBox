import { useEffect, useState } from 'react';

interface Line {
  id: number;
  y: number;
  width: number;
  opacity: number;
  duration: number;
}

export default function BackgroundStars() {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const lineCount = 30;
    const newLines: Line[] = [];
    
    for (let i = 0; i < lineCount; i++) {
      newLines.push({
        id: i,
        y: (i / lineCount) * 100,
        width: 100 + (i * 2),
        opacity: 0.3 + (i / lineCount) * 0.7,
        duration: 2 + (i / lineCount) * 1,
      });
    }
    
    setLines(newLines);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Highway tunnel effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #001a00 0%, #000a00 50%, #001a00 100%)',
        }}
      />
      
      {/* Center road */}
      <div
        className="absolute left-1/2 top-0 h-full pointer-events-none"
        style={{
          width: '2px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, transparent 0%, #00FF00 50%, transparent 100%)',
          filter: 'blur(1px)',
          opacity: 0.6,
        }}
      />

      {/* Animated racing lines */}
      {lines.map((line) => (
        <div
          key={line.id}
          className="absolute left-1/2 pointer-events-none"
          style={{
            width: `${line.width}%`,
            height: '2px',
            top: `${line.y}%`,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, transparent 0%, #00FF00 50%, transparent 100%)',
            opacity: line.opacity,
            filter: 'blur(1px)',
            animation: `highwayRush ${line.duration}s linear infinite`,
            animationDelay: `${(line.id / lines.length) * line.duration}s`,
          }}
        />
      ))}

      {/* Left side glow */}
      <div
        className="absolute left-0 top-0 w-1/4 h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0, 255, 0, 0.1) 0%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Right side glow */}
      <div
        className="absolute right-0 top-0 w-1/4 h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(0, 255, 0, 0.1) 0%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}
