"use client";

import { motion } from "framer-motion";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
  amount?: number;
};

const directions = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
  amount = 0.15,
}: ScrollRevealProps) {
  const { x, y } = directions[direction];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealStagger({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
  amount = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function ScrollRevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
