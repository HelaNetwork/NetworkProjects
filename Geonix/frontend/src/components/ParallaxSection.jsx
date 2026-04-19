import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxSection({ 
  children, 
  speed = 50, 
  fade = false,
  className = '' 
}) {
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);
  const opacity = fade 
    ? useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.3])
    : 1;

  return (
    <motion.div 
      style={{ y, opacity }} 
      className={className}
    >
      {children}
    </motion.div>
  );
}