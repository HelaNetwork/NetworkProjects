import { motion } from 'motion/react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '@/src/utils/utils';

interface QuestionCardProps {
  question: string;
  options: string[];
  onSelect: (index: number) => void;
  selectedIdx?: number;
  correctIdx?: number;
  isLocked?: boolean;
}

export const QuestionCard = ({
  question,
  options,
  onSelect,
  selectedIdx,
  correctIdx,
  isLocked,
}: QuestionCardProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">{question}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = correctIdx === idx;
          const isWrong = isSelected && !isCorrect && correctIdx !== undefined;

          return (
            <motion.button
              key={idx}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              onClick={() => !isLocked && onSelect(idx)}
              className={cn(
                'p-6 text-left rounded-xl border-2 transition-all min-h-[100px] flex items-center justify-between group',
                !isLocked ? 'hover:border-black border-gray-100' : '',
                isSelected && !isLocked && 'bg-black text-white border-black',
                isCorrect && isLocked && 'bg-green-500 text-white border-green-500',
                isWrong && isLocked && 'bg-red-500 text-white border-red-500',
                isLocked && !isSelected && !isCorrect && 'opacity-50 grayscale'
              )}
            >
              <span className="text-lg font-medium">{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
