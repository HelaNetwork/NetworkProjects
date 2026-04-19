import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Spark {
  id: number;
  x: number;
  y: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
}

export default function ClickSpark({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 0.4
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    const newSpark = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
    
    setSparks(current => [...current, newSpark]);
    
    setTimeout(() => {
      setSparks(current => current.filter(s => s.id !== newSpark.id));
    }, duration * 1000);
  }, [duration]);

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [handleGlobalClick]);

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
      <AnimatePresence>
        {sparks.map(spark => (
          <div key={spark.id} style={{ position: 'absolute', left: spark.x, top: spark.y }}>
            {Array.from({ length: sparkCount }).map((_, i) => {
              const angle = (i * (360 / sparkCount)) * (Math.PI / 180);
              const tx = Math.cos(angle) * sparkRadius;
              const ty = Math.sin(angle) * sparkRadius;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 1, 
                    opacity: 1,
                    rotate: (i * (360 / sparkCount))
                  }}
                  animate={{ 
                    x: tx, 
                    y: ty, 
                    scale: 0, 
                    opacity: 0
                  }}
                  transition={{ 
                    duration: duration, 
                    ease: "easeOut" 
                  }}
                  style={{
                    position: 'absolute',
                    top: -sparkSize / 2,
                    left: -2,
                    width: 4,
                    height: sparkSize,
                    backgroundColor: sparkColor,
                    borderRadius: 2,
                    transformOrigin: '50% 100%'
                  }}
                />
              );
            })}
            
            {/* Center flash */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: duration * 0.5, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 8,
                height: 8,
                backgroundColor: sparkColor,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${sparkColor}`
              }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
