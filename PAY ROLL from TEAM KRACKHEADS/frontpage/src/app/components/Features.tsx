import { motion } from 'motion/react';
import { CheckCircle2, Zap, Lock, Globe, Rocket, Shield, TrendingUp, Star } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process transactions in milliseconds with our optimized infrastructure',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500/30',
      bgColor: 'from-yellow-900/20 to-orange-900/20'
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption protects every transaction and data point',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500/30',
      bgColor: 'from-green-900/20 to-emerald-900/20'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Multi-currency support with instant conversion rates',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/30',
      bgColor: 'from-blue-900/20 to-cyan-900/20'
    },
    {
      icon: CheckCircle2,
      title: '99.9% Uptime',
      description: 'Enterprise reliability with 24/7 monitoring and support',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'from-purple-900/20 to-pink-900/20'
    },
    {
      icon: Rocket,
      title: 'Instant Payroll',
      description: 'Automated payroll processing with same-day deposit',
      color: 'from-red-500 to-pink-500',
      borderColor: 'border-red-500/30',
      bgColor: 'from-red-900/20 to-pink-900/20'
    },
    {
      icon: Shield,
      title: 'Compliance Ready',
      description: 'Automatic tax calculations and regulatory compliance',
      color: 'from-indigo-500 to-purple-500',
      borderColor: 'border-indigo-500/30',
      bgColor: 'from-indigo-900/20 to-purple-900/20'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'AI-powered insights to optimize your workforce spending',
      color: 'from-cyan-500 to-blue-500',
      borderColor: 'border-cyan-500/30',
      bgColor: 'from-cyan-900/20 to-blue-900/20'
    },
    {
      icon: Star,
      title: 'Premium Support',
      description: 'Dedicated account manager and priority assistance',
      color: 'from-amber-500 to-yellow-500',
      borderColor: 'border-amber-500/30',
      bgColor: 'from-amber-900/20 to-yellow-900/20'
    }
  ];

  return (
    <div className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative max-w-7xl mx-auto z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md rounded-full border border-cyan-400/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-cyan-200">Industry Leading Features</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Why Choose KRACKHEADS?
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Built for the modern workforce with cutting-edge technology and unmatched reliability
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index}
                className={`group relative bg-gradient-to-br ${feature.bgColor} backdrop-blur-sm rounded-2xl p-6 border-2 ${feature.borderColor} hover:border-opacity-60 transition-all duration-300 overflow-hidden`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />

                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                <div className="relative z-10">
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: '$5B+', label: 'Transactions Processed', color: 'from-green-400 to-emerald-400' },
            { value: '10K+', label: 'Active Companies', color: 'from-blue-400 to-cyan-400' },
            { value: '500K+', label: 'Employees Paid', color: 'from-purple-400 to-pink-400' },
            { value: '<1s', label: 'Average Processing', color: 'from-yellow-400 to-orange-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}