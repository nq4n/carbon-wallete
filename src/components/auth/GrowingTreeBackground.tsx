
import React, { useEffect, useRef, useState } from "react";

type Props = {
  color?: string;
  hoverColor?: string;
  lineWidth?: number;
  speed?: number;
  density?: number;
  fade?: number;
  zIndex?: number;
  isAnimating: boolean;
};

type Branch = {
  x: number; y: number;
  angle: number;
  length: number;
  grown: number;
  life: number;
};

export default function GrowingTreeBackground({
  color = "rgba(34,139,34,0.7)",
  hoverColor = "rgba(52, 211, 153, 0.8)", // A brighter green
  lineWidth = 1.2,
  speed = 0.9,
  density = 8,
  fade = 0.06,
  zIndex = -1,
  isAnimating,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let width = (c.width = window.innerWidth);
    let height = (c.height = window.innerHeight);

    const handleResize = () => {
      width = c.width = window.innerWidth;
      height = c.height = window.innerHeight;
      ctx.fillStyle = `rgba(255,255,255,${fade})`;
      ctx.fillRect(0, 0, width, height);
    };
    window.addEventListener("resize", handleResize);

    let seed = 1337;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const branches: Branch[] = [];
    const spawnSeed = () => {
      for (let i = 0; i < density; i++) {
        const side = Math.floor(rand() * 4);
        let x, y, angle;

        switch (side) {
            case 0: // Top
                x = rand() * width;
                y = 0;
                angle = Math.PI / 2 + (rand() - 0.5) * 0.5;
                break;
            case 1: // Right
                x = width;
                y = rand() * height;
                angle = Math.PI + (rand() - 0.5) * 0.5;
                break;
            case 2: // Bottom
                x = rand() * width;
                y = height;
                angle = -Math.PI / 2 + (rand() - 0.5) * 0.5;
                break;
            case 3: // Left
            default:
                x = 0;
                y = rand() * height;
                angle = (rand() - 0.5) * 0.5;
                break;
        }

        branches.push({
          x,
          y,
          angle,
          length: height * 0.3 + rand() * height * 0.4, 
          grown: 0,
          life: 4 + (rand() * 4) | 0,
        });
      }
    };
    spawnSeed();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = `rgba(255,255,255,${fade})`;
    ctx.fillRect(0, 0, width, height);

    const step = () => {
        if (!isAnimating) {
            ctx.fillStyle = `rgba(255,255,255,${fade * 2.5})`;
            ctx.fillRect(0, 0, width, height);
            if (branches.length > 0) {
                 rafRef.current = requestAnimationFrame(step);
            } else {
                // Clear the canvas completely when animation stops
                ctx.clearRect(0, 0, width, height);
            }
            return;
        }


      ctx.fillStyle = `rgba(255,255,255,${fade * 0.5})`;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = isHovering ? hoverColor : color;
      ctx.lineWidth = lineWidth;

      const newBranches: Branch[] = [];

      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];

        const grow = Math.min(speed, b.length - b.grown);
        if (grow <= 0) continue;

        const x1 = b.x + Math.cos(b.angle) * b.grown;
        const y1 = b.y + Math.sin(b.angle) * b.grown;
        const x2 = b.x + Math.cos(b.angle) * (b.grown + grow);
        const y2 = b.y + Math.sin(b.angle) * (b.grown + grow);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        b.grown += grow;

        b.angle += (rand() - 0.5) * 0.06;

        if (b.life > 0 && rand() < 0.01) {
          const split = (spread: number) => ({
            x: x2,
            y: y2,
            angle: b.angle + spread * (0.25 + rand() * 0.25),
            length: b.length * (0.4 + rand() * 0.2),
            grown: 0,
            life: b.life - 1,
          });
          newBranches.push(split(+1), split(-1));
          b.life -= 1;
        }
      }

      ctx.stroke();

      const alive: Branch[] = [];
      for (const b of branches) {
          if (b.grown < b.length && b.x > -100 && b.x < width + 100 && b.y > -100 && b.y < height + 100) {
              alive.push(b);
          }
      }

      branches.length = 0;
      branches.push(...alive, ...newBranches);

      if (branches.length < density * 2.0 && isAnimating) {
        spawnSeed();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAnimating, color, hoverColor, lineWidth, speed, density, fade, isHovering]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none",
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 500ms ease-in-out',
      }}
    />
  );
}
