import { useEffect, useRef, useState, useMemo } from 'react';

interface ParallaxBackgroundProps {
  children: React.ReactNode;
}

// 8-bit pixel art shapes as CSS
const PIXEL_SHAPES = [
  // Music note
  { type: 'note', size: 24 },
  // Star
  { type: 'star', size: 16 },
  // Diamond
  { type: 'diamond', size: 20 },
  // Square
  { type: 'square', size: 12 },
  // Cross
  { type: 'cross', size: 14 },
];

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  shape: typeof PIXEL_SHAPES[0];
  layer: number; // 1-3 for parallax depth
  baseX: number;
  baseY: number;
}

export function ParallaxBackground({ children }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Generate random floating elements
  const floatingElements = useMemo<FloatingElement[]>(() => {
    const elements: FloatingElement[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const shape = PIXEL_SHAPES[Math.floor(Math.random() * PIXEL_SHAPES.length)];
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        shape,
        layer: Math.floor(Math.random() * 3) + 1,
      });
    }
    return elements;
  }, []);

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

  // Calculate parallax offsets - MORE VISIBLE movement
  const offsetX = (mousePosition.x - 0.5) * 60;
  const offsetY = (mousePosition.y - 0.5) * 60;

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* Pixel grid pattern - Layer 1 (slowest) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX * 0.2}px, ${offsetY * 0.2}px)`,
        }}
      >
        {/* Grid dots */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--pixel-border)) 2px, transparent 2px)`,
            backgroundSize: '32px 32px',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Layer 1 - Slowest parallax (furthest back) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`,
        }}
      >
        {floatingElements.filter(e => e.layer === 1).map(element => (
          <PixelShape key={element.id} element={element} opacity={0.15} />
        ))}
      </div>

      {/* Layer 2 - Medium parallax */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX * 0.6}px, ${offsetY * 0.6}px)`,
        }}
      >
        {floatingElements.filter(e => e.layer === 2).map(element => (
          <PixelShape key={element.id} element={element} opacity={0.25} />
        ))}
      </div>

      {/* Layer 3 - Fastest parallax (closest) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
        }}
      >
        {floatingElements.filter(e => e.layer === 3).map(element => (
          <PixelShape key={element.id} element={element} opacity={0.35} />
        ))}
      </div>

      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsl(var(--nes-black) / 0.05) 2px,
            hsl(var(--nes-black) / 0.05) 4px
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Individual pixel shape component
function PixelShape({ element, opacity }: { element: FloatingElement; opacity: number }) {
  const { x, y, shape } = element;
  const colors = [
    'hsl(var(--nes-orange))',
    'hsl(var(--nes-blue))',
    'hsl(var(--nes-green))',
    'hsl(var(--nes-yellow))',
  ];
  const color = colors[element.id % colors.length];

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    opacity,
  };

  switch (shape.type) {
    case 'note':
      return (
        <div style={style}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 24 24" fill={color}>
            <rect x="16" y="2" width="4" height="16" />
            <rect x="4" y="14" width="12" height="4" />
            <rect x="0" y="16" width="8" height="6" />
          </svg>
        </div>
      );
    case 'star':
      return (
        <div style={style}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 16 16" fill={color}>
            <rect x="6" y="0" width="4" height="4" />
            <rect x="2" y="4" width="4" height="4" />
            <rect x="6" y="4" width="4" height="4" />
            <rect x="10" y="4" width="4" height="4" />
            <rect x="0" y="8" width="4" height="4" />
            <rect x="6" y="8" width="4" height="4" />
            <rect x="12" y="8" width="4" height="4" />
            <rect x="6" y="12" width="4" height="4" />
          </svg>
        </div>
      );
    case 'diamond':
      return (
        <div style={style}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 20 20" fill={color}>
            <rect x="8" y="0" width="4" height="4" />
            <rect x="4" y="4" width="4" height="4" />
            <rect x="8" y="4" width="4" height="4" />
            <rect x="12" y="4" width="4" height="4" />
            <rect x="0" y="8" width="4" height="4" />
            <rect x="4" y="8" width="4" height="4" />
            <rect x="8" y="8" width="4" height="4" />
            <rect x="12" y="8" width="4" height="4" />
            <rect x="16" y="8" width="4" height="4" />
            <rect x="4" y="12" width="4" height="4" />
            <rect x="8" y="12" width="4" height="4" />
            <rect x="12" y="12" width="4" height="4" />
            <rect x="8" y="16" width="4" height="4" />
          </svg>
        </div>
      );
    case 'square':
      return (
        <div style={style}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 12 12" fill={color}>
            <rect x="0" y="0" width="12" height="12" />
          </svg>
        </div>
      );
    case 'cross':
      return (
        <div style={style}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 14 14" fill={color}>
            <rect x="4" y="0" width="6" height="4" />
            <rect x="0" y="4" width="4" height="6" />
            <rect x="4" y="4" width="6" height="6" />
            <rect x="10" y="4" width="4" height="6" />
            <rect x="4" y="10" width="6" height="4" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}
