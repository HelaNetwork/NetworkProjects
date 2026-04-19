import { motion } from 'motion/react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  Receipt,
  Bitcoin,
  PiggyBank,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Banknote
} from 'lucide-react';

export function FloatingIcons() {
  const icons = [
    { Icon: DollarSign, color: 'text-green-400', delay: 0, x: '10%', y: '15%' },
    { Icon: CreditCard, color: 'text-blue-400', delay: 0.5, x: '85%', y: '20%' },
    { Icon: TrendingUp, color: 'text-purple-400', delay: 1, x: '15%', y: '60%' },
    { Icon: Wallet, color: 'text-cyan-400', delay: 1.5, x: '80%', y: '70%' },
    { Icon: Receipt, color: 'text-pink-400', delay: 2, x: '25%', y: '85%' },
    { Icon: Bitcoin, color: 'text-orange-400', delay: 2.5, x: '90%', y: '45%' },
    { Icon: PiggyBank, color: 'text-yellow-400', delay: 3, x: '5%', y: '40%' },
    { Icon: BarChart3, color: 'text-indigo-400', delay: 3.5, x: '70%', y: '10%' },
    { Icon: ArrowUpRight, color: 'text-emerald-400', delay: 4, x: '45%', y: '25%' },
    { Icon: ArrowDownRight, color: 'text-red-400', delay: 4.5, x: '55%', y: '80%' },
    { Icon: Coins, color: 'text-amber-400', delay: 5, x: '35%', y: '50%' },
    { Icon: Banknote, color: 'text-teal-400', delay: 5.5, x: '60%', y: '35%' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => {
        const { Icon, color, delay, x, y } = item;
        return (
          <motion.div
            key={index}
            className={`absolute ${color}`}
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8 + index,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut"
            }}
          >
            <motion.div
              animate={{
                x: [0, 20, 0],
              }}
              transition={{
                duration: 5 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-lg" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
