'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: number; // grayscale 0-255
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── Resize ──
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w, h };

      // Rebuild particles on resize
      initParticles(w, h);
    };

    // ── Init particle field ──
    const initParticles = (w: number, h: number) => {
      const particles: Particle[] = [];
      const count = Math.floor((w * h) / 4500); // density based on screen area
      const capped = Math.min(count, 350);

      for (let i = 0; i < capped; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const shade = Math.floor(Math.random() * 120 + 135); // 135-255 range (silver to white)
        const size = Math.random() * 2 + 0.5;
        const baseAlpha = Math.random() * 0.35 + 0.08;

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size,
          alpha: baseAlpha,
          baseAlpha,
          color: shade,
        });
      }

      particlesRef.current = particles;
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    // ── Scroll offset tracking ──
    let scrollY = window.scrollY;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Config ──
    const INTERACTION_RADIUS = 150;
    const PUSH_FORCE = 8;
    const RETURN_SPEED = 0.03;
    const FRICTION = 0.92;
    const NEIGHBOR_DIST = 100;
    const LINE_ALPHA = 0.06;

    // ── Animation Loop ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Distance from cursor
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // ── Cursor interaction: push particles away ──
        if (dist < INTERACTION_RADIUS && dist > 0) {
          const force = (1 - dist / INTERACTION_RADIUS) * PUSH_FORCE;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;

          // Brighten near cursor
          p.alpha = Math.min(p.baseAlpha + (1 - dist / INTERACTION_RADIUS) * 0.5, 0.9);
        } else {
          // Fade back to base
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // ── Return to origin (soft spring) ──
        const homeX = p.originX - p.x;
        const homeY = p.originY - p.y;
        p.vx += homeX * RETURN_SPEED;
        p.vy += homeY * RETURN_SPEED;

        // ── Gentle ambient drift ──
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        // ── Apply friction ──
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // ── Update position ──
        p.x += p.vx;
        p.y += p.vy;

        // ── Draw particle dot ──
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.color}, ${p.color}, ${p.alpha})`;
        ctx.fill();

        // ── Draw connection lines to nearby particles ──
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ndx = p.x - p2.x;
          const ndy = p.y - p2.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

          if (ndist < NEIGHBOR_DIST) {
            const lineAlpha = (1 - ndist / NEIGHBOR_DIST) * LINE_ALPHA;

            // Lines brighten near cursor
            const midX = (p.x + p2.x) / 2;
            const midY = (p.y + p2.y) / 2;
            const cursorDist = Math.sqrt((mx - midX) ** 2 + (my - midY) ** 2);
            const cursorBoost = cursorDist < INTERACTION_RADIUS
              ? (1 - cursorDist / INTERACTION_RADIUS) * 0.15
              : 0;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(200, 200, 210, ${lineAlpha + cursorBoost})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
