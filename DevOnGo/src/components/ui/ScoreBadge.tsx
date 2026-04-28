import { motion } from 'motion/react';
import { cn } from '@/src/utils/utils';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
  animate?: boolean;
}

export const ScoreBadge = ({ score, label = 'XP', className, animate = true }: ScoreBadgeProps) => {
  return (
    <motion.div
      key={score}
      initial={animate ? { scale: 1.2, y: -10 } : {}}
      animate={animate ? { scale: 1, y: 0 } : {}}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm',
        className
      )}
    >
      <span>{score.toLocaleString()}</span>
      <span className="text-[10px] uppercase opacity-60 tracking-wider">{label}</span>
    </motion.div>
  );
};
