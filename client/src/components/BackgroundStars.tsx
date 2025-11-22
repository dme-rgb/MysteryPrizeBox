import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function BackgroundStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starCount = 100;
    const newStars: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      });
    }
    
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.size > 2 ? '#F4D03F' : '#FFFFFF',
            boxShadow: star.size > 2 
              ? '0 0 4px #F4D03F, 0 0 8px #F4D03F' 
              : '0 0 2px #FFFFFF',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
