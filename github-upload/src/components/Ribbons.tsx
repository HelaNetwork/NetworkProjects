import { useRef, useEffect } from "react";

interface RibbonProps {
  color?: string;
  speed?: number;
  opacity?: number;
}

export default function Ribbons({ color = "#4F46E5", speed = 1, opacity = 0.5 }: RibbonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let time = 0;
    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction parameters
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Rendering loop simulating a flowing ribbon using overlapping sine waves
    const render = () => {
      time += 0.01 * speed;
      ctx.clearRect(0, 0, width, height);

      // Draw multiple overlapping trails to create the "Ribbon" look
      for (let trail = 0; trail < 3; trail++) {
        ctx.beginPath();
        
        // The ribbon is drawn across the width of the screen
        for (let x = 0; x < width; x += 10) {
          // Complex mathematical wave generation combining sine functions based on time, x-position, and mouse interaction
          const yWave1 = Math.sin(x * 0.005 + time + trail * 0.5) * 150;
          const yWave2 = Math.cos(x * 0.008 - time * 1.2) * 50;
          
          // Determine base Y position (centered vertically)
          const baseY = height / 2;
          
          // Interactive pull towards mouse cursor (weak effect)
          const distX = mouseX - x;
          const distY = mouseY - baseY;
          const distance = Math.sqrt(distX * distX + distY * distY);
          const pull = Math.max(0, 1 - distance / 500); // 500px radius of influence
          
          const yOffset = (mouseY - baseY) * pull * 0.2;
          
          const finalY = baseY + yWave1 + yWave2 + yOffset + (trail * 40);

          if (x === 0) {
            ctx.moveTo(x, finalY);
          } else {
            ctx.lineTo(x, finalY);
          }
        }

        // Stroke styling
        ctx.strokeStyle = color;
        // Vary opacity and width per trail to give depth
        ctx.globalAlpha = opacity * (1 - trail * 0.2);
        ctx.lineWidth = 40 - trail * 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  );
}
