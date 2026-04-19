import { useRef, type ReactNode } from 'react';
import { motion, useInView, type UseInViewOptions } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: number;
  wordAnimationEnd?: any;
  delay?: number;
  duration?: number;
  stagger?: number;
  viewport?: UseInViewOptions;
}

export default function ScrollReveal({
  children,
  className = '',
  baseOpacity = 0.1,
  enableBlur = true,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 0,
  delay = 0,
  duration = 0.6,
  stagger = 0.05,
  viewport = { once: true, margin: '-20%' },
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewport);

  const isString = typeof children === 'string';
  const words = isString ? (children as string).split(' ') : null;

  if (words) {
    return (
      <div ref={ref} className={`flex flex-wrap ${containerClassName}`} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ 
              opacity: baseOpacity, 
              rotate: baseRotation,
              filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
              y: 20
            }}
            animate={isInView ? {
              opacity: 1,
              rotate: rotationEnd,
              filter: enableBlur ? 'blur(0px)' : 'none',
              y: 0
            } : {}}
            transition={{
              duration: duration,
              delay: delay + (i * stagger),
              ease: [0.16, 1, 0.3, 1] // Custom snappy ease
            }}
            className={`inline-block whitespace-pre ${textClassName} ${className}`}
            style={{ marginRight: '0.25em', display: 'inline-block' }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  // Fallback for non-string elements (like groups of HTML)
  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: baseOpacity, 
        rotate: baseRotation,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
        y: 20
      }}
      animate={isInView ? {
        opacity: 1,
        rotate: rotationEnd,
        filter: enableBlur ? 'blur(0px)' : 'none',
        y: 0
      } : {}}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`${containerClassName} ${className}`}
    >
      {children}
    </motion.div>
  );
}
