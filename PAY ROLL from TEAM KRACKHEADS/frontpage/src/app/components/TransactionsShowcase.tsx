import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Users, Clock, CheckCircle2, Star } from 'lucide-react';

export function TransactionsShowcase() {
  const transactions = [
    { 
      company: 'TechCorp Inc.', 
      amount: '$127,450', 
      type: 'Payroll Processed',
      time: '2 mins ago',
      status: 'completed',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      company: 'Design Studio', 
      amount: '$84,230', 
      type: 'Employee Payment',
      time: '5 mins ago',
      status: 'completed',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      company: 'StartUp Labs', 
      amount: '$156,890', 
      type: 'Bulk Transfer',
      time: '12 mins ago',
      status: 'processing',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      company: 'Global Finance', 
      amount: '$243,670', 
      type: 'Payroll Processed',
      time: '18 mins ago',
      status: 'completed',
      icon: CheckCircle2,
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director at TechCorp',
      content: 'WorkConnect transformed our payroll process. What used to take hours now takes minutes!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'CEO at StartUp Labs',
      content: 'The real-time transaction tracking gives us complete visibility into our workforce spending.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Finance Manager',
      content: 'Bank-grade security with lightning-fast processing. Best workforce platform we\'ve used!',
      rating: 5,
      avatar: '👩‍💻'
    },
  ];

  return (
    <div className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Live Transactions Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-full border border-green-400/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-300">Live Transactions</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Real-Time Processing
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Watch transactions flow through our platform in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transactions.map((transaction, index) => {
              const Icon = transaction.icon;
              return (
                <motion.div
                  key={index}
                  className="relative bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 overflow-hidden group hover:border-slate-600 transition-all duration-300"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${transaction.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        className={`w-12 h-12 bg-gradient-to-br ${transaction.color} rounded-xl flex items-center justify-center`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>

                    <h3 className="text-white font-bold mb-1">{transaction.company}</h3>
                    <p className="text-slate-400 text-sm mb-3">{transaction.type}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{transaction.amount}</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {transaction.time}
                      </span>
                    </div>
                  </div>

                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent"
                    whileHover={{
                      borderColor: transaction.color.includes('green') ? 'rgba(34, 197, 94, 0.5)' :
                                  transaction.color.includes('blue') ? 'rgba(59, 130, 246, 0.5)' :
                                  transaction.color.includes('purple') ? 'rgba(168, 85, 247, 0.5)' :
                                  'rgba(251, 146, 60, 0.5)',
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full border border-yellow-400/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-300">Loved by Teams Worldwide</span>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
