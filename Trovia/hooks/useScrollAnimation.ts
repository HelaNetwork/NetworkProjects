'use client';

import { useEffect, useRef } from 'react';

/**
 * Reveal animation hook — LOOPS on every scroll.
 * Adds `.in-view` when entering viewport, REMOVES it when leaving.
 * So every time you scroll past = animation replays.
 */
export function useReveal(delay: number = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
        } else {
          // Remove class when out of view — this is what makes it LOOP
          el.classList.remove('in-view');
          // Reset transition delay so it replays cleanly
          if (delay > 0) {
            el.style.transitionDelay = `${delay}ms`;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

/**
 * Stagger-reveal hook — LOOPS. Children reset and re-animate on every scroll pass.
 */
export function useStaggerReveal(staggerMs: number = 120) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const items = el.querySelectorAll('[data-item]');

        if (entry.isIntersecting) {
          el.classList.add('in-view');
          items.forEach((item, i) => {
            const htmlItem = item as HTMLElement;
            htmlItem.style.transitionDelay = `${i * staggerMs}ms`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                htmlItem.classList.add('item-visible');
              });
            });
          });
        } else {
          // RESET everything when out of view — loop!
          el.classList.remove('in-view');
          items.forEach((item) => {
            const htmlItem = item as HTMLElement;
            htmlItem.classList.remove('item-visible');
            htmlItem.style.transitionDelay = '0ms';
          });
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerMs]);

  return ref;
}

/**
 * Parallax hook — element translates on scroll at a given speed factor.
 */
export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const viewH = window.innerHeight;
          const centerOffset = rect.top + rect.height / 2 - viewH / 2;
          el.style.transform = `translate3d(0, ${centerOffset * speed}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return ref;
}

/**
 * Counter animation — counts up when entering, resets when leaving. Loops!
 */
export function useCountUp(targetValue: string, duration: number = 1500) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animationId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');

          const isNum = !isNaN(Number(targetValue));
          if (!isNum) return;

          const end = parseFloat(targetValue);
          const hasDecimal = targetValue.includes('.');
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            el.textContent = hasDecimal ? current.toFixed(1) : Math.round(current).toString();
            if (progress < 1) {
              animationId = requestAnimationFrame(tick);
            } else {
              el.textContent = targetValue;
            }
          };

          animationId = requestAnimationFrame(tick);
        } else {
          // Reset to 0 when out of view — will count up again on re-entry
          el.classList.remove('in-view');
          if (animationId) cancelAnimationFrame(animationId);
          const isNum = !isNaN(Number(targetValue));
          if (isNum) el.textContent = '0';
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [targetValue, duration]);

  return ref;
}

// Legacy export for other pages
export function useScrollAnimation() {
  return useReveal(0);
}
