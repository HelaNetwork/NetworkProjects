"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type TiltCardProps = {
    children: ReactNode;
    className?: string;
    glare?: boolean;
    intensity?: number;
};

/* Simplified Card — No 3D tilt, just a wrapper */
export function TiltCard({ children, className = "" }: TiltCardProps) {
    return (
        <div className={`relative h-full ${className}`}>
            {children}
        </div>
    );
}

/* Simplified Float — Gentle 2D floating animation only */
export function Float3D({
    children,
    className = "",
    duration = 6,
    distance = 12,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    duration?: number;
    distance?: number;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [-distance, distance, -distance],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}
