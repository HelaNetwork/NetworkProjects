import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

const Quiz = ({ questions, onFinish, onCorrect, onWrong }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      onCorrect?.();
    } else {
      onWrong?.();
    }
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      onFinish(score + (selectedOption === currentQuestion.answer ? 1 : 0));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-black text-duo-eel text-center">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.answer;
              
              let styles = "bg-white border-2 border-duo-swan hover:bg-duo-swan/20";
              if (showFeedback) {
                if (isCorrect) styles = "bg-duo-green/10 border-duo-green text-duo-green-dark";
                else if (isSelected) styles = "bg-duo-red/10 border-duo-red text-duo-red-dark";
              } else if (isSelected) {
                styles = "bg-duo-blue/10 border-duo-blue text-duo-blue-dark";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`p-4 rounded-2xl text-left font-bold transition-all ${styles} flex items-center justify-between`}
                >
                  {option}
                  {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {!showFeedback ? (
              <Button 
                size="full" 
                disabled={selectedOption === null}
                onClick={handleCheck}
              >
                Check Answer
              </Button>
            ) : (
              <Button size="full" variant={selectedOption === currentQuestion.answer ? 'primary' : 'danger'} onClick={handleContinue}>
                Continue
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
