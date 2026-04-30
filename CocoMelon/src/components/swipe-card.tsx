"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { UserProfile } from "@/lib/types";

interface SwipeCardProps {
  profile: UserProfile;
  onLike: () => void;
  onPass: () => void;
  isLoading?: boolean;
}

export function SwipeCard({ profile, onLike, onPass, isLoading }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onLike();
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      onPass();
    }
  }

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0, 
        rotate: x.get() > 0 ? 20 : -20,
        transition: { duration: 0.3 } 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="relative rounded-3xl overflow-hidden glass card-glow" style={{ aspectRatio: "3/4" }}>
        {/* Profile image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.imageUrl})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-dark-900/40 to-transparent" />

        {/* Like indicator */}
        <motion.div
          className="absolute top-8 right-8 px-6 py-3 rounded-xl border-3 border-cyber-green bg-cyber-green/20 text-cyber-green font-black text-2xl uppercase tracking-wider -rotate-12"
          style={{ opacity: likeOpacity }}
        >
          Like
        </motion.div>

        {/* Pass indicator */}
        <motion.div
          className="absolute top-8 left-8 px-6 py-3 rounded-xl border-3 border-red-500 bg-red-500/20 text-red-500 font-black text-2xl uppercase tracking-wider rotate-12"
          style={{ opacity: passOpacity }}
        >
          Nope
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
            <span className="text-xl text-gray-300 font-light mb-0.5">{profile.age}</span>
          </div>

          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{profile.bio}</p>

          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/30"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* ZK badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-cyber-blue">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-glow-pulse" />
            ZK Verified
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={onPass}
          disabled={isLoading}
          className="w-16 h-16 rounded-full glass border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={onLike}
          disabled={isLoading}
          className="w-20 h-20 rounded-full bg-linear-to-br from-cyber-pink to-cyber-purple flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(255,45,149,0.5)] transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <button
          disabled={isLoading}
          className="w-16 h-16 rounded-full glass border border-cyber-blue/30 flex items-center justify-center text-cyber-blue hover:bg-cyber-blue/20 hover:border-cyber-blue/50 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export function EmptySwipeState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6 animate-float">
        <svg className="w-12 h-12 text-cyber-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No more profiles</h3>
      <p className="text-gray-400 max-w-xs">
        You have seen all available profiles. Check back later for new connections.
      </p>
    </motion.div>
  );
}
