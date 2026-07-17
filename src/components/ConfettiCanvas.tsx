import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  active: boolean;
  onComplete?: () => void;
}

export default function ConfettiCanvas({ active, onComplete }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#00E676', '#38BDF8', '#FBBF24', '#EC4899', '#A855F7', '#FF5722'];
    const particleCount = 120;
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - 20,
        radius: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
      });
    }

    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      let allInvisible = true;
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        // Fade out as duration approaches end
        if (elapsed > duration - 1500) {
          p.opacity = Math.max(0, 1 - (elapsed - (duration - 1500)) / 1500);
        }

        if (p.opacity > 0) {
          allInvisible = false;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        
        // Draw elegant diamond confetti shape
        ctx.beginPath();
        ctx.moveTo(0, -p.radius);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      if (!allInvisible) {
        animationFrameId = requestAnimationFrame(render);
      } else if (onComplete) {
        onComplete();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
