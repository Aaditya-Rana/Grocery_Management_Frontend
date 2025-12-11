import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background with Vibrant Gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 -z-20" />

      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-linear-to-br from-primary/40 to-secondary/40 rounded-full blur-[120px] opacity-40 -z-10"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-linear-to-br from-pink-400 to-purple-500 rounded-full blur-[120px] opacity-40 -z-10"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-[40%] left-[50%] w-[40%] h-[40%] bg-linear-to-br from-yellow-400 to-orange-500 rounded-full blur-[100px] opacity-30 -z-10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Enhanced Glass Panel with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30"></div>

        {/* Main Card */}
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 -z-10"></div>

          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{subtitle}</p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
