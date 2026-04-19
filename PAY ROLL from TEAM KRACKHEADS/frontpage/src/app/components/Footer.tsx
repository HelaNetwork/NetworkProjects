import { motion } from 'motion/react';
import { Mail, Phone, Twitter, Linkedin, Github, Instagram } from 'lucide-react';

export function Footer() {
  const teamMembers = [
    'Akshith Reddy Gongireddy',
    'MPS Sriram',
    'Abhishek Gupta',
    'Aniket Singh'
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-slate-300 py-16 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20 overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company Info with Team */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-6">
              KRACKHEADS
            </h3>
            <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
              Empowering organizations with innovative workforce management solutions, real-time transaction processing, and seamless payment automation.
            </p>
            
            {/* Our Team Section */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Our Team
              </h4>
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:scale-150 transition-transform"></div>
                    <span className="text-slate-300 group-hover:text-cyan-300 transition-colors font-medium">
                      {member}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Links - moved down */}
            <div className="flex gap-3 mt-8">
              {[
                { Icon: Twitter, color: 'hover:text-cyan-400', bgColor: 'hover:bg-cyan-500/20', borderColor: 'hover:border-cyan-500/50' },
                { Icon: Linkedin, color: 'hover:text-blue-400', bgColor: 'hover:bg-blue-500/20', borderColor: 'hover:border-blue-500/50' },
                { Icon: Github, color: 'hover:text-slate-300', bgColor: 'hover:bg-slate-500/20', borderColor: 'hover:border-slate-500/50' },
                { Icon: Instagram, color: 'hover:text-pink-400', bgColor: 'hover:bg-pink-500/20', borderColor: 'hover:border-pink-500/50' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center ${social.color} ${social.bgColor} ${social.borderColor} transition-all duration-300`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <social.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-bold text-white mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {['About Us', 'Features', 'Pricing', 'Contact', 'Careers', 'Blog'].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="hover:text-purple-300 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-bold text-white mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Documentation', 'API Reference', 'Status'].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="pt-8 border-t border-slate-800/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-500">
              © 2026 KRACKHEADS. All rights reserved. Built with ❤️ for the modern workforce.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <motion.a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-purple-500 hover:text-purple-300 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Mail className="w-4 h-4" />
                <span>support@krackheads.com</span>
              </motion.a>
              
              <motion.a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500 hover:text-cyan-300 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Phone className="w-4 h-4" />
                <span>1-800-KRACK-123</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
