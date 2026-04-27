import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

const LessonCard = ({ lesson, onStart }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white border-2 border-duo-swan rounded-3xl p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="bg-duo-yellow p-4 rounded-2xl border-b-4 border-duo-yellow-dark">
          {lesson.icon}
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-bold uppercase tracking-widest ${
            lesson.difficulty === 'Beginner' ? 'text-duo-green' : 
            lesson.difficulty === 'Intermediate' ? 'text-duo-blue' : 'text-duo-red'
          }`}>
            {lesson.difficulty}
          </span>
          <h3 className="text-xl font-extrabold text-duo-eel">{lesson.title}</h3>
        </div>
      </div>
      
      <p className="text-duo-wolf text-sm leading-relaxed">
        {lesson.description}
      </p>
      
      <div className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-duo-hare">PROGRESS</span>
          <span className="text-xs font-bold text-duo-eel">{lesson.progress}%</span>
        </div>
        <ProgressBar progress={lesson.progress} color={lesson.progressColor} />
      </div>
      
      <Button 
        variant={lesson.progress === 100 ? 'tertiary' : 'primary'}
        size="full" 
        onClick={() => onStart(lesson)}
      >
        {lesson.progress === 100 ? 'Review' : 'Continue'}
      </Button>
    </motion.div>
  );
};

export default LessonCard;
