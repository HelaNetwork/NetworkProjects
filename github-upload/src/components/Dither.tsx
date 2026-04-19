import { useRef, useEffect } from 'react';

interface DitherProps {
  color?: [number, number, number];
  canvasBg?: string;
}

const Dither = ({
  color = [0.49, 0.55, 0.81],
  canvasBg = '#060618',
}: DitherProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Use lower resolution for performance + dither pixelation effect
      canvas.width = Math.floor(parent.clientWidth / 3);
      canvas.height = Math.floor(parent.clientHeight / 3);
    };

    // Bayer 4x4 dither matrix
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];

    const draw = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      // Parse background color
      const bgR = parseInt(canvasBg.slice(1, 3), 16) || 6;
      const bgG = parseInt(canvasBg.slice(3, 5), 16) || 6;
      const bgB = parseInt(canvasBg.slice(5, 7), 16) || 24;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Create flowing organic noise using sine waves
          const nx = x / w;
          const ny = y / h;

          // Multiple sine layers for organic movement
          const v1 = Math.sin(nx * 6 + time * 1.2) * Math.cos(ny * 4 + time * 0.8);
          const v2 = Math.sin(ny * 8 + time * 0.6 + nx * 3) * 0.5;
          const v3 = Math.cos(nx * 4 + ny * 5 + time * 1.5) * 0.3;
          const v4 = Math.sin((nx + ny) * 5 + time) * 0.4;

          let intensity = (v1 + v2 + v3 + v4 + 1.2) / 3.6; // Normalize to ~0-1
          intensity = Math.max(0, Math.min(1, intensity));

          // Bayer dithering
          const threshold = bayerMatrix[y % 4][x % 4] / 16;
          const dithered = intensity > threshold ? 1 : 0;

          const idx = (y * w + x) * 4;
          data[idx] = bgR + dithered * (color[0] * 255 - bgR);
          data[idx + 1] = bgG + dithered * (color[1] * 255 - bgG);
          data[idx + 2] = bgB + dithered * (color[2] * 255 - bgB);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameId);
    };
  }, [color, canvasBg]);

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
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default Dither;
