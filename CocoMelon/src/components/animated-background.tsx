"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Radial glow from top */}
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,45,149,0.08) 0%, transparent 70%)",
          top: "10%",
          left: "5%",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)",
          top: "40%",
          right: "10%",
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(176,38,255,0.06) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
        }}
        animate={{
          x: [0, 60, -20, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-cyber-pink/20 to-transparent animate-[scan-line_8s_linear_infinite]" />
    </div>
  );
}
