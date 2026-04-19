import { useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollFloatProps {
  children: ReactNode;
  containerClassName?: string;
  textClassName?: string;
}

export default function ScrollFloat({
  children,
  containerClassName = '',
  textClassName = '',
}: ScrollFloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  const isString = typeof children === 'string';
  const words = isString ? (children as string).split(' ') : null;

  if (words) {
    return (
      <div ref={ref} className={containerClassName} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, delay: i * 0.04, type: 'spring', bounce: 0.1 }}
            className={`inline-block ${textClassName}`}
            style={{ marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  // Fallback for non-string
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ duration: 0.8, type: 'spring', bounce: 0.1 }}
      className={containerClassName}
    >
      {children}
    </motion.div>
  );
}
