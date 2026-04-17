import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, color = 'bg-duo-green' }) => {
  return (
    <div className="w-full bg-duo-swan h-4 rounded-full overflow-hidden relative border-b-2 border-slate-300">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color} progress-bar-fill relative`}
      >
        {/* Subtle highlight effect */}
        <div className="absolute top-1 left-2 right-2 h-1 bg-white opacity-20 rounded-full" />
      </motion.div>
    </div>
  );
};

export default ProgressBar;
