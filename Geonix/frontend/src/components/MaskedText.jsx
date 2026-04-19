import React from 'react';
import { motion } from 'framer-motion';

export default function MaskedText({ 
  text, 
  size = 'text-5xl', 
  className = '',
  gradient = 'linear-gradient(135deg, #F97316 0%, #C084FC 50%, #A855F7 100%)',
  animate = true
}) {
  return (
    <motion.h2
      className={`${size} font-bold ${className}`}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      whileInView={animate ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{
        background: gradient,
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: animate ? 'gradientShift 4s ease infinite' : 'none',
      }}
    >
      {text}
    </motion.h2>
  );
}