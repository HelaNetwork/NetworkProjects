import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white min-h-[90vh] flex items-center">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-gradient"></div>
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Next-Gen Workforce Platform</span>
          </motion.div>

          <motion.h1 
            className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              KRACKHEADS
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl text-purple-200 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Experience the future of workforce management with 
            <span className="text-cyan-300 font-semibold"> real-time transactions</span>,
            <span className="text-pink-300 font-semibold"> automated payroll</span>, and
            <span className="text-purple-300 font-semibold"> seamless collaboration</span>
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300 font-medium">10,000+ Companies</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-300 font-medium">$5B+ Processed</span>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-400/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-300 font-medium">99.9% Uptime</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full font-semibold text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const el = document.getElementById('login-panel');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/employer-login';
                }
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Scroll to Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
