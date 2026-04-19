import { useEffect, useRef } from 'react';

interface WavesProps {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  xGap?: number;
  yGap?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  style?: React.CSSProperties;
  className?: string;
}

class Grad {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x; this.y = y; this.z = z;
  }
  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }
}

class Noise {
  private grad3: Grad[];
  private p: number[];
  private perm: number[];
  private gradP: Grad[];

  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
      new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
      new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1),
    ];
    this.p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
      247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
      57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
      60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
      65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
      200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
      52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
      119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
      218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(seed);
  }

  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      let v: number;
      if (i & 1) v = this.p[i] ^ (seed & 255);
      else v = this.p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  perlin2(x: number, y: number) {
    let X = Math.floor(x), Y = Math.floor(y);
    x -= X; y -= Y;
    X &= 255; Y &= 255;
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

export default function Waves({
  lineColor = 'rgba(255, 255, 255, 0.15)',
  backgroundColor = 'transparent',
  waveSpeedX = 0.012,
  waveSpeedY = 0.008,
  waveAmpX = 40,
  waveAmpY = 20,
  xGap = 12,
  yGap = 36,
  friction = 0.925,
  tension = 0.012,
  maxCursorMove = 120,
  style,
  className,
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise = new Noise(Math.random());
    let animId = 0;
    let w = 0, h = 0;
    let mouseX = -1000, mouseY = -1000;

    interface Point {
      x: number;
      y: number;
      originY: number;
      wave: { x: number; y: number };
      cursor: { x: number; y: number; vx: number; vy: number };
    }

    let lines: Point[][] = [];
    let time = 0;

    function resize() {
      w = canvas!.parentElement?.offsetWidth || window.innerWidth;
      h = canvas!.parentElement?.offsetHeight || window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
      initLines();
    }

    function initLines() {
      lines = [];
      const totalLines = Math.ceil(h / yGap) + 4;
      const pointsPerLine = Math.ceil(w / xGap) + 4;
      for (let i = 0; i < totalLines; i++) {
        const pts: Point[] = [];
        for (let j = 0; j < pointsPerLine; j++) {
          pts.push({
            x: j * xGap - xGap * 2,
            y: i * yGap - yGap * 2,
            originY: i * yGap - yGap * 2,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
        lines.push(pts);
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function handleMouseLeave() {
      mouseX = -1000;
      mouseY = -1000;
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      time += 1;

      for (const pts of lines) {
        for (const p of pts) {
          // Use lower frequency noise for big, sweeping curves
          const noiseValY = noise.perlin2(
            p.x * 0.003 + time * waveSpeedX,
            p.originY * 0.005 + time * waveSpeedY * 0.5
          );
          // Add a second octave for extra waviness
          const noiseValY2 = noise.perlin2(
            p.x * 0.006 + time * waveSpeedX * 1.5 + 100,
            p.originY * 0.008 + 50
          );

          p.wave.x = 0; // keep horizontal position stable
          p.wave.y = noiseValY * waveAmpY + noiseValY2 * waveAmpY * 0.5;

          // cursor interaction
          const finalX = p.x + p.wave.x + p.cursor.x;
          const finalY = p.originY + p.wave.y + p.cursor.y;
          const dx = finalX - mouseX;
          const dy = finalY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxCursorMove) {
            const force = (1 - dist / maxCursorMove);
            const angle = Math.atan2(dy, dx);
            const targetX = Math.cos(angle) * force * maxCursorMove * 0.4;
            const targetY = Math.sin(angle) * force * maxCursorMove * 0.4;
            p.cursor.vx += (targetX - p.cursor.x) * tension;
            p.cursor.vy += (targetY - p.cursor.y) * tension;
          }
          p.cursor.vx *= friction;
          p.cursor.vy *= friction;
          p.cursor.x += p.cursor.vx;
          p.cursor.y += p.cursor.vy;
        }

        // draw smooth spline through points
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;

        for (let j = 0; j < pts.length; j++) {
          const p = pts[j];
          const px = p.x + p.wave.x + p.cursor.x;
          const py = p.originY + p.wave.y + p.cursor.y;

          if (j === 0) {
            ctx.moveTo(px, py);
          } else {
            const prev = pts[j - 1];
            const prevX = prev.x + prev.wave.x + prev.cursor.x;
            const prevY = prev.originY + prev.wave.y + prev.cursor.y;
            const midX = (prevX + px) / 2;
            const midY = (prevY + py) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [lineColor, backgroundColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap, friction, tension, maxCursorMove]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        ...style,
      }}
    />
  );
}
