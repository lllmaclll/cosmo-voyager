
import React, { useMemo } from 'react';

const StarField: React.FC = () => {
  const stars = useMemo(() => {
    // Reduced star count from 200 to 120 for performance
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
      {/* Nebula / Galaxy Background Layer - Optimized Gradients */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)',
        }}
      />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            //@ts-ignore - custom CSS variable
            '--duration': `${star.duration}s`,
            // Remove box-shadow from individual stars for performance, use brighter color instead
            backgroundColor: 'white'
          }}
        />
      ))}
      
      {/* Vignette - Simpler gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,#000000_100%)] opacity-80" />
    </div>
  );
};

export default StarField;