import { motion } from 'motion/react';
import { cn } from '@/src/utils/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  color?: string;
}

export const ProgressBar = ({ progress, className, color = 'bg-black' }: ProgressBarProps) => {
  return (
    <div className={cn('w-full h-2 bg-gray-100 rounded-full overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn('h-full', color)}
      />
    </div>
  );
};
