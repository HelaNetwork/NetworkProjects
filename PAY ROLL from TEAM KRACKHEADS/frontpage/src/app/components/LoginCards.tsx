import { motion } from 'framer-motion';
import { Building2, Users, Shield, TrendingUp, ArrowRight, Sparkles, Zap, Lock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FloatingIcons } from './FloatingIcons';
import { login } from "../api";
import React, { useState } from "react";
import { data, useNavigate } from "react-router-dom";



export function LoginCards() {

  const navigate = useNavigate();


  const handleLogin = async (role: "admin" | "employee") => {
    try {
      // const email = prompt("Enter Email");
      // const password = prompt("Enter Password");

      // if (!email || !password) return;

      // const data = await login(email, password);

      // localStorage.setItem("token", data.access_token);
      if (role === "admin") {
        navigate("/employer-login");
      } else {
        navigate("/employee-login");
      }

    } catch (error) {
      alert("Invalid credentials");
    }
  };


  return (
    <div id="login-panel" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
      {/* Floating transaction icons */}
      <FloatingIcons />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.5, 1],
          x: [0, -100, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />


      <div className="relative max-w-7xl mx-auto z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-full border border-purple-400/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-purple-200">Secure Portal Access</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Choose Your Portal
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Access your dedicated workspace with tailored tools and real-time transaction management
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Employer Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border-2 border-purple-500/30 hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md">
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  background: [
                    'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                    'linear-gradient(to bottom right, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                    'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Sparkle effect */}
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full filter blur-2xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />

              <div className="relative p-8 sm:p-10">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/50"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Building2 className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-4xl font-bold mb-4 text-white">
                  Employer Portal
                </h3>

                <p className="text-purple-200 mb-8 text-lg leading-relaxed">
                  Manage payroll, track transactions, and optimize workforce operations with AI-powered insights
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    { icon: Shield, text: 'Advanced employee management', color: 'purple' },
                    { icon: TrendingUp, text: 'Real-time transaction analytics', color: 'pink' },
                    { icon: Zap, text: 'Automated payroll processing', color: 'cyan' },
                    { icon: Lock, text: 'Bank-grade security', color: 'indigo' }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center flex-shrink-0 border border-${item.color}-400/30`}>
                        <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                      </div>
                      <span className="text-purple-100 pt-1">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white py-7 text-lg group/btn relative overflow-hidden shadow-2xl shadow-purple-500/50"
                    onClick={() => handleLogin("admin")}

                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Login as Employer
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Employee Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md">
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  background: [
                    'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
                    'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2))',
                    'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Sparkle effect */}
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-300/20 to-transparent rounded-full filter blur-2xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />

              <div className="relative p-8 sm:p-10">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/50"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-4xl font-bold mb-4 text-white">
                  Employee Portal
                </h3>

                <p className="text-cyan-200 mb-8 text-lg leading-relaxed">
                  Access your earnings, track payments, and manage your work schedule all in one place
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    { icon: Shield, text: 'Personal dashboard & profile', color: 'cyan' },
                    { icon: TrendingUp, text: 'Earnings & payment tracking', color: 'blue' },
                    { icon: Zap, text: 'Instant transaction history', color: 'indigo' },
                    { icon: Lock, text: 'Secure document access', color: 'teal' }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center flex-shrink-0 border border-${item.color}-400/30`}>
                        <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                      </div>
                      <span className="text-cyan-100 pt-1">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-700 text-white py-7 text-lg group/btn relative overflow-hidden shadow-2xl shadow-cyan-500/50"
                    onClick={() => handleLogin("employee")}

                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Login as Employee
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-purple-200 mb-4 text-lg">
            Don't have an account yet?
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="border-2 border-purple-400/50 bg-purple-500/10 backdrop-blur-md hover:bg-purple-500/20 hover:border-purple-400 text-white px-8 py-6 text-lg"
              onClick={() => alert('Sign up clicked - implement your registration flow here')}


            >
              <span className="flex items-center gap-2">
                Create New Account
                <Sparkles className="w-5 h-5" />
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
