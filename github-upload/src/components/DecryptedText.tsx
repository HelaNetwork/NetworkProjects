import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'click';
  [key: string]: any;
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLSpanElement>(null);
  const iterationRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() =>
    useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter(c => c !== ' ')
      : characters.split(''),
    [useOriginalCharsOnly, text, characters]);

  const getRandomChar = useCallback(() =>
    availableChars[Math.floor(Math.random() * availableChars.length)],
    [availableChars]);

  const shuffleText = useCallback((revealed: Set<number>) => {
    return text.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (revealed.has(i)) return text[i];
      return getRandomChar();
    }).join('');
  }, [text, getRandomChar]);

  const getRevealOrder = useCallback(() => {
    const indices = text.split('').map((_, i) => i).filter(i => text[i] !== ' ');
    if (revealDirection === 'end') return indices.reverse();
    if (revealDirection === 'center') {
      const mid = Math.floor(indices.length / 2);
      const result: number[] = [];
      let left = mid - 1, right = mid;
      while (left >= 0 || right < indices.length) {
        if (right < indices.length) result.push(indices[right++]);
        if (left >= 0) result.push(indices[left--]);
      }
      return result;
    }
    return indices;
  }, [text, revealDirection]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterationRef.current = 0;
    const revealed = new Set<number>();
    const order = sequential ? getRevealOrder() : [];
    let pointer = 0;

    intervalRef.current = setInterval(() => {
      iterationRef.current++;
      if (sequential) {
        const charsPerTick = Math.max(1, Math.floor(text.length / (maxIterations * 2)));
        for (let i = 0; i < charsPerTick && pointer < order.length; i++) {
          revealed.add(order[pointer++]);
        }
        setRevealedIndices(new Set(revealed));
        setDisplayText(shuffleText(revealed));
        if (pointer >= order.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayText(text);
          setIsAnimating(false);
          setHasAnimated(true);
        }
      } else {
        if (iterationRef.current >= maxIterations) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayText(text);
          setIsAnimating(false);
          setHasAnimated(true);
        } else {
          setDisplayText(shuffleText(revealed));
        }
      }
    }, speed);
  }, [isAnimating, sequential, getRevealOrder, maxIterations, speed, shuffleText, text]);

  // View-based trigger
  useEffect(() => {
    if (animateOn !== 'view' || hasAnimated) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startAnimation();
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, startAnimation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleHover = () => {
    if (animateOn === 'hover') startAnimation();
  };

  return (
    <motion.span
      ref={containerRef}
      className={parentClassName}
      onMouseEnter={handleHover}
      onClick={animateOn === 'click' ? startAnimation : undefined}
      {...props}
    >
      <span aria-hidden="true" className={className}>
        {displayText.split('').map((char, i) => {
          const isRevealed = revealedIndices.has(i) || (!isAnimating && hasAnimated);
          return (
            <span
              key={i}
              className={isRevealed ? '' : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
