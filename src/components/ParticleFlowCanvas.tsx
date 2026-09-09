import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Brain, Lightbulb, Globe2, Activity, Play, Pause, RefreshCw, Zap } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  baseRadius: number;
  color: string;
  alpha: number;
  shapeType: 'triangle' | 'circle' | 'prism';
  rotation: number;
  rotSpeed: number;
}

interface GeometricShape {
  x: number;
  y: number;
  z: number;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  color: string;
  type: 'tetrahedron' | 'octahedron' | 'ring';
}

export type ParticleMorphState = 'brain' | 'globe' | 'lightbulb' | 'flow' | 'constellation';

interface ParticleFlowCanvasProps {
  initialState?: ParticleMorphState;
  interactive?: boolean;
  density?: number;
  className?: string;
  onStateChange?: (state: ParticleMorphState) => void;
}

export default function ParticleFlowCanvas({
  initialState = 'brain',
  interactive = true,
  density = 1200,
  className = '',
  onStateChange
}: ParticleFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeShape, setActiveShape] = useState<ParticleMorphState>(initialState);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [particleCount, setParticleCount] = useState<number>(density);

  // Mouse interaction state
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
    radius: 120,
    strength: 0.15
  });

  const particlesRef = useRef<Particle[]>([]);
  const shapesRef = useRef<GeometricShape[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const rotationAngleRef = useRef({ x: 0, y: 0 });

  // Neon color palette inspired by the video (Glowing cyan, electric violet, amber gold, vivid mint, warm peach, pure white)
  const PALETTE = [
    '#2DD4BF', // Mint / Celadon Cyan
    '#38BDF8', // Sky Blue
    '#A78BFA', // Soft Electric Violet
    '#F472B6', // Pink Orchid
    '#FBBF24', // Amber Gold
    '#34D399', // Emerald
    '#FFFFFF', // Starlight White
    '#F97316'  // Peach Sunset
  ];

  // Mathematical shape coordinate generators
  const generateShapeCoordinates = (type: ParticleMorphState, index: number, total: number, width: number, height: number) => {
    const scale = Math.min(width, height) * 0.28;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    switch (type) {
      case 'brain': {
        // Dual hemisphere brain coordinate distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phiAngle = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * scale;

        const isLeft = index % 2 === 0;
        const xOffset = isLeft ? -scale * 0.35 : scale * 0.35;
        
        let px = r * Math.sin(phiAngle) * Math.cos(theta) * 0.7 + xOffset;
        let py = r * Math.sin(phiAngle) * Math.sin(theta) * 0.95;
        let pz = r * Math.cos(phiAngle) * 0.85;

        // Neural gyri wrinkles modulation
        const ripple = Math.sin(px * 0.08) * Math.cos(py * 0.08) * 16;
        px += ripple * Math.cos(theta);
        py += ripple * Math.sin(theta);

        return { x: px, y: py, z: pz };
      }

      case 'globe': {
        // Fibonacci sphere distribution
        const y = 1 - (index / (total - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * index;

        const px = Math.cos(theta) * radiusAtY * scale * 1.1;
        const py = y * scale * 1.1;
        const pz = Math.sin(theta) * radiusAtY * scale * 1.1;

        return { x: px, y: py, z: pz };
      }

      case 'lightbulb': {
        // Lightbulb geometry: top sphere + bottom cylinder neck + filament cap
        const ratio = index / total;
        if (ratio < 0.65) {
          // Bulb top globe
          const localIdx = index;
          const localTotal = total * 0.65;
          const y = 1 - (localIdx / (localTotal - 1)) * 2;
          const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
          const theta = phi * localIdx;
          return {
            x: Math.cos(theta) * radiusAtY * scale * 0.95,
            y: (y * scale * 0.95) - scale * 0.3,
            z: Math.sin(theta) * radiusAtY * scale * 0.95
          };
        } else {
          // Bulb base / screw thread
          const localIdx = index - total * 0.65;
          const angle = (localIdx * 0.25) % (Math.PI * 2);
          const t = localIdx / (total * 0.35);
          const neckR = scale * (0.45 - t * 0.15);
          return {
            x: Math.cos(angle) * neckR,
            y: scale * 0.45 + (t * scale * 0.7),
            z: Math.sin(angle) * neckR
          };
        }
      }

      case 'flow': {
        // Biomorphic fluid wave stream (matching IMG_1207.jpeg curve)
        const t = (index / total) * 4 - 2;
        const px = t * scale * 1.6;
        const py = Math.sin(t * 2.2) * (scale * 0.55) + Math.cos(t * 1.1) * (scale * 0.25);
        const pz = Math.cos(t * 3.0) * (scale * 0.5) + (Math.random() - 0.5) * 40;
        return { x: px, y: py, z: pz };
      }

      case 'constellation':
      default: {
        // Dynamic vortex swirl
        const angle = index * 0.12;
        const r = Math.sqrt(index / total) * scale * 1.4;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r * 0.7 + (Math.sin(index * 0.05) * 30);
        const pz = (Math.random() - 0.5) * scale * 0.8;
        return { x: px, y: py, z: pz };
      }
    }
  };

  // Initialize particles & floating 3D wireframe shapes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width || 800;
    const height = canvas.height || 600;

    const count = density;
    setParticleCount(count);
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const coords = generateShapeCoordinates(activeShape, i, count, width, height);
      const color = PALETTE[i % PALETTE.length];
      const shapeType = i % 3 === 0 ? 'triangle' : i % 3 === 1 ? 'circle' : 'prism';

      newParticles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        targetX: coords.x,
        targetY: coords.y,
        targetZ: coords.z,
        baseRadius: Math.random() * 2.2 + 1.2,
        color: color,
        alpha: Math.random() * 0.6 + 0.4,
        shapeType: shapeType,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04
      });
    }

    particlesRef.current = newParticles;

    // Generate floating 3D geometric shapes (tetrahedrons & rings from the video)
    const geometricShapes: GeometricShape[] = [
      { x: -width * 0.28, y: -height * 0.22, z: 80, size: 28, rotX: 0, rotY: 0, rotZ: 0, speedX: 0.015, speedY: 0.02, speedZ: 0.01, color: '#2DD4BF', type: 'tetrahedron' },
      { x: width * 0.32, y: -height * 0.18, z: -50, size: 36, rotX: 0, rotY: 0, rotZ: 0, speedX: -0.018, speedY: 0.012, speedZ: 0.02, color: '#FBBF24', type: 'tetrahedron' },
      { x: -width * 0.35, y: height * 0.24, z: 20, size: 32, rotX: 0, rotY: 0, rotZ: 0, speedX: 0.01, speedY: -0.015, speedZ: 0.015, color: '#A78BFA', type: 'tetrahedron' },
      { x: width * 0.3, y: height * 0.26, z: 60, size: 24, rotX: 0, rotY: 0, rotZ: 0, speedX: -0.02, speedY: -0.01, speedZ: -0.015, color: '#38BDF8', type: 'tetrahedron' }
    ];
    shapesRef.current = geometricShapes;

  }, [density]);

  // Update target coordinates when active shape changes
  const switchShape = (newShape: ParticleMorphState) => {
    setActiveShape(newShape);
    if (onStateChange) onStateChange(newShape);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const count = particlesRef.current.length;

    particlesRef.current.forEach((p, idx) => {
      const coords = generateShapeCoordinates(newShape, idx, count, width, height);
      p.targetX = coords.x;
      p.targetY = coords.y;
      p.targetZ = coords.z;
      // Add slight burst velocity for organic transition
      p.vx += (Math.random() - 0.5) * 4;
      p.vy += (Math.random() - 0.5) * 4;
      p.vz += (Math.random() - 0.5) * 4;
    });
  };

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Recalibrate target coordinates for new dimensions
      const count = particlesRef.current.length;
      particlesRef.current.forEach((p, idx) => {
        const coords = generateShapeCoordinates(activeShape, idx, count, rect.width, rect.height);
        p.targetX = coords.x;
        p.targetY = coords.y;
        p.targetZ = coords.z;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // FPS tracking
      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 0.5) {
        setFps(Math.round((frameCount / fpsTimer)));
        frameCount = 0;
        fpsTimer = 0;
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth background clear with subtle depth trail
      ctx.clearRect(0, 0, width, height);

      // Smooth rotation with mouse influence
      if (mouseRef.current.isHovered) {
        rotationAngleRef.current.y += (mouseRef.current.targetX * 0.8 - rotationAngleRef.current.y) * 0.04;
        rotationAngleRef.current.x += (-mouseRef.current.targetY * 0.8 - rotationAngleRef.current.x) * 0.04;
      } else {
        rotationAngleRef.current.y += 0.004; // Continuous organic spin
        rotationAngleRef.current.x *= 0.96;
      }

      const cosY = Math.cos(rotationAngleRef.current.y);
      const sinY = Math.sin(rotationAngleRef.current.y);
      const cosX = Math.cos(rotationAngleRef.current.x);
      const sinX = Math.sin(rotationAngleRef.current.x);

      // Draw and animate particles
      const particles = particlesRef.current;
      const fov = 450;

      // Sort particles by Z-depth for correct translucent layering
      const projectedList: Array<{ p: Particle; projX: number; projY: number; projScale: number; rotZ: number }> = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isPlaying) {
          // Spring physics toward target position
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dz = p.targetZ - p.z;

          p.vx = p.vx * 0.88 + dx * 0.035;
          p.vy = p.vy * 0.88 + dy * 0.035;
          p.vz = p.vz * 0.88 + dz * 0.035;

          // Mouse attraction/repulsion interaction
          if (mouseRef.current.isHovered) {
            const mdx = (p.x + centerX) - (mouseRef.current.x);
            const mdy = (p.y + centerY) - (mouseRef.current.y);
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (dist < mouseRef.current.radius) {
              const force = (1 - dist / mouseRef.current.radius) * 6;
              p.vx += (mdx / dist) * force;
              p.vy += (mdy / dist) * force;
            }
          }

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.rotation += p.rotSpeed;
        }

        // 3D rotation projection
        // 1. Rotate around Y
        const rx1 = p.x * cosY + p.z * sinY;
        const rz1 = -p.x * sinY + p.z * cosY;
        // 2. Rotate around X
        const ry2 = p.y * cosX - rz1 * sinX;
        const rz2 = p.y * sinX + rz1 * cosX;

        const projScale = fov / (fov + rz2 + 300);
        const projX = rx1 * projScale + centerX;
        const projY = ry2 * projScale + centerY;

        projectedList.push({ p, projX, projY, projScale, rotZ: rz2 });
      }

      // Sort by depth
      projectedList.sort((a, b) => b.rotZ - a.rotZ);

      // Render particles
      for (let i = 0; i < projectedList.length; i++) {
        const { p, projX, projY, projScale } = projectedList[i];
        if (projScale <= 0) continue;

        const r = Math.max(0.6, p.baseRadius * projScale);
        const alpha = Math.min(1, Math.max(0.1, p.alpha * projScale * 1.3));

        ctx.save();
        ctx.translate(projX, projY);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shapeType === 'triangle') {
          // Render glowing neon triangle / tetrahedron particle
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.4);
          ctx.lineTo(r * 1.2, r * 0.9);
          ctx.lineTo(-r * 1.2, r * 0.9);
          ctx.closePath();
          ctx.fill();
        } else if (p.shapeType === 'prism') {
          // Render crisp diamond/prism
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.3);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r * 1.3);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Circular particle with subtle soft halo
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Render floating 3D Wireframe Geometric Tetrahedrons (from video)
      const shapes = shapesRef.current;
      for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        if (isPlaying) {
          shape.rotX += shape.speedX;
          shape.rotY += shape.speedY;
          shape.rotZ += shape.speedZ;
        }

        const size = shape.size;
        // Tetrahedron 4 vertices in local coordinates
        const vertices = [
          { x: 0, y: -size, z: 0 },
          { x: -size * 0.86, y: size * 0.5, z: -size * 0.5 },
          { x: size * 0.86, y: size * 0.5, z: -size * 0.5 },
          { x: 0, y: size * 0.5, z: size }
        ];

        // Transform vertices
        const transVertices = vertices.map(v => {
          // Rotate X, Y, Z
          let x = v.x;
          let y = v.y * Math.cos(shape.rotX) - v.z * Math.sin(shape.rotX);
          let z = v.y * Math.sin(shape.rotX) + v.z * Math.cos(shape.rotX);

          let x2 = x * Math.cos(shape.rotY) + z * Math.sin(shape.rotY);
          let z2 = -x * Math.sin(shape.rotY) + z * Math.cos(shape.rotY);

          let x3 = x2 * Math.cos(shape.rotZ) - y * Math.sin(shape.rotZ);
          let y3 = x2 * Math.sin(shape.rotZ) + y * Math.cos(shape.rotZ);

          const worldX = x3 + shape.x;
          const worldY = y3 + shape.y;
          const worldZ = z2 + shape.z;

          const projScale = fov / (fov + worldZ + 300);
          return {
            px: worldX * projScale + centerX,
            py: worldY * projScale + centerY,
            scale: projScale
          };
        });

        // Draw wireframe edges with glowing neon stroke
        const edges = [
          [0, 1], [0, 2], [0, 3],
          [1, 2], [2, 3], [3, 1]
        ];

        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.75;

        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(transVertices[i].px, transVertices[i].py);
          ctx.lineTo(transVertices[j].px, transVertices[j].py);
          ctx.stroke();
        });

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, activeShape]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.targetX = (x / rect.width - 0.5) * 1.5;
    mouseRef.current.targetY = (y / rect.height - 0.5) * 1.5;
    mouseRef.current.isHovered = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovered = false;
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) - rect.width / 2;
    const clickY = (e.clientY - rect.top) - rect.height / 2;

    // Create a cosmic ripple burst on click
    particlesRef.current.forEach(p => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < 220) {
        const force = (1 - dist / 220) * 12;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.vz += (Math.random() - 0.5) * force * 2;
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
      className={`relative w-full h-full min-h-[380px] overflow-hidden rounded-[28px] select-none ${className}`}
    >
      {/* 3D Canvas */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Floating State Morph Switcher Pills (Inspired by Dala video & Spatial Studio) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
        <button
          onClick={(e) => { e.stopPropagation(); switchShape('brain'); }}
          title="Collective Brain Formation"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            activeShape === 'brain' 
              ? 'bg-teal-400 text-black shadow-md shadow-teal-400/30' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Neural Core</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); switchShape('flow'); }}
          title="Intelligent Flow Surface"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            activeShape === 'flow' 
              ? 'bg-teal-400 text-black shadow-md shadow-teal-400/30' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Intelligent Flow</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); switchShape('lightbulb'); }}
          title="Insight Lightbulb Node"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            activeShape === 'lightbulb' 
              ? 'bg-teal-400 text-black shadow-md shadow-teal-400/30' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Valuation Bulb</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); switchShape('globe'); }}
          title="Global Deal Constellation"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            activeShape === 'globe' 
              ? 'bg-teal-400 text-black shadow-md shadow-teal-400/30' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Global Matrix</span>
        </button>
      </div>

      {/* Real-time Telemetry Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{particleCount} Nodes Active</span>
          <span className="text-zinc-500">•</span>
          <span className="text-teal-300 font-semibold">{fps} FPS</span>
        </div>
      </div>

      {/* Play / Pause Toggle Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all cursor-pointer"
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
