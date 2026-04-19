import { useRef, useEffect, useCallback } from 'react';

interface LetterGlitchProps {
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
}

const LetterGlitch = ({
  glitchSpeed = 95,
  centerVignette = true,
  outerVignette = true,
  smooth = true,
}: LetterGlitchProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const gridRef = useRef<{ char: string; color: string; opacity: number; targetOpacity: number }[]>([]);
  const dimsRef = useRef<{ cols: number; rows: number; fontSize: number; charWidth: number; lineHeight: number }>({
    cols: 0, rows: 0, fontSize: 0, charWidth: 0, lineHeight: 0,
  });

  // Dense charset like the ReactBits version — includes uppercase, digits, symbols, brackets, punctuation
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?!/\\~`\'\"';

  // Color palette matching the ReactBits reference — greens, cyans, and whites
  const colors = [
    '#22c55e', // green-500
    '#4ade80', // green-400
    '#16a34a', // green-600
    '#a3e635', // lime-400
    '#34d399', // emerald-400
    '#2dd4bf', // teal-400
    '#ffffff', // white (occasional bright flash)
    '#86efac', // green-300
    '#bbf7d0', // green-200
  ];

  const randomChar = () => charset[Math.floor(Math.random() * charset.length)];
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dense packing: small font, tight spacing to fill screen with characters
    const fontSize = 14;
    const charWidth = fontSize * 0.65; // monospace char width approximation
    const lineHeight = fontSize * 1.15;

    const cols = Math.ceil(canvas.width / charWidth);
    const rows = Math.ceil(canvas.height / lineHeight);

    dimsRef.current = { cols, rows, fontSize, charWidth, lineHeight };

    const grid: typeof gridRef.current = [];
    for (let i = 0; i < cols * rows; i++) {
      const baseOpacity = Math.random();
      grid.push({
        char: randomChar(),
        color: randomColor(),
        opacity: baseOpacity * 0.6,
        targetOpacity: baseOpacity * 0.6,
      });
    }
    gridRef.current = grid;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initGrid();
    };

    // Main draw loop
    let lastTime = 0;
    const interval = Math.max(16, 120 - glitchSpeed); // Higher speed = less delay between frames

    const draw = (timestamp: number) => {
      if (timestamp - lastTime < interval) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      const { cols, rows, fontSize, charWidth, lineHeight } = dimsRef.current;
      const grid = gridRef.current;
      if (!grid.length) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Clear with solid black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px "Courier New", "Consolas", monospace`;
      ctx.textBaseline = 'top';

      // Glitch: randomly mutate characters each frame  
      // Higher glitchSpeed = more chars change per frame
      const glitchRate = glitchSpeed / 100;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const cell = grid[idx];
          if (!cell) continue;

          // Randomly change character and color
          if (Math.random() < glitchRate * 0.15) {
            cell.char = randomChar();
            cell.color = randomColor();
            cell.targetOpacity = Math.random() * 0.85 + 0.05;
          }

          // Smooth or instant opacity
          if (smooth) {
            cell.opacity += (cell.targetOpacity - cell.opacity) * 0.08;
          } else {
            cell.opacity = cell.targetOpacity;
          }

          // Draw the character
          ctx.fillStyle = cell.color;
          ctx.globalAlpha = cell.opacity;
          ctx.fillText(cell.char, col * charWidth, row * lineHeight);
        }
      }

      ctx.globalAlpha = 1;

      // Apply vignettes
      if (centerVignette) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = Math.max(canvas.width, canvas.height) * 0.45;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(0,0,0,0.7)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (outerVignette) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = Math.max(canvas.width, canvas.height) * 0.7;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(0,0,0,0.0)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [glitchSpeed, centerVignette, outerVignette, smooth, initGrid]);

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
      }}
    />
  );
};

export default LetterGlitch;
