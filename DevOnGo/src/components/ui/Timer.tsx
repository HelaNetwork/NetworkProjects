import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { cn } from '@/src/utils/utils';

export interface TimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, className }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const controls = useAnimation();

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    controls.start({
      width: '0%',
      transition: { duration, ease: 'linear' },
    });
  }, [duration, controls]);

  return (
    <div className={cn('w-full h-1 bg-gray-100', className)}>
      <motion.div
        initial={{ width: '100%' }}
        animate={controls}
        className={cn('h-full', timeLeft <= 3 ? 'bg-red-500' : 'bg-black')}
      />
    </div>
  );
};
