import { useEffect, useRef, useState } from 'react';

interface ParallaxBackgroundProps {
  children: React.ReactNode;
}

export function ParallaxBackground({ children }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Calculate parallax offsets
  const offsetX = (mousePosition.x - 0.5) * 20;
  const offsetY = (mousePosition.y - 0.5) * 20;

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-retro-bg">
      {/* Grid pattern layer */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--retro-grid)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--retro-grid)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: `translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Floating shapes - layer 1 (slowest) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX * 0.5}px, ${offsetY * 0.5}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-retro-accent/5 blur-xl" />
        <div className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-retro-primary/5 blur-2xl" />
      </div>

      {/* Floating shapes - layer 2 (medium) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX * 0.8}px, ${offsetY * 0.8}px)`,
          transition: 'transform 0.12s ease-out',
        }}
      >
        <div className="absolute top-[30%] right-[20%] w-20 h-20 rotate-45 border-4 border-retro-accent/10 rounded-lg" />
        <div className="absolute bottom-[35%] left-[20%] w-16 h-16 border-4 border-retro-primary/10 rounded-full" />
      </div>

      {/* Floating shapes - layer 3 (fastest) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.08s ease-out',
        }}
      >
        <div className="absolute top-[60%] left-[70%] w-8 h-8 bg-retro-accent/10 rounded-sm" />
        <div className="absolute top-[20%] left-[60%] w-6 h-6 bg-retro-primary/15 rounded-full" />
        <div className="absolute bottom-[15%] left-[40%] w-10 h-10 rotate-12 border-2 border-retro-cream/10" />
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--retro-primary) / 0.03) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
