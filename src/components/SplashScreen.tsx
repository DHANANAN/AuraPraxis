import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.2 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute w-[600px] h-[600px] bg-gold-rich/20 rounded-full blur-[120px]"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-64 h-64 relative flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* The "J" */}
                <motion.path
                  d="M100 40 V140 C100 160 80 160 70 150"
                  fill="none"
                  stroke="#F4EBD0"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
                
                {/* The "D" - Viper Flow */}
                <motion.path
                  d="M85 60 C160 60 160 140 85 140"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="viper-path"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
                />

                {/* Viper Head Detail */}
                <motion.circle
                  cx="85"
                  cy="60"
                  r="4"
                  fill="#D4AF37"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 3 }}
                />
              </svg>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-8 text-center"
            >
              <h1 className="text-4xl font-black tracking-[0.4em] text-white uppercase mb-2">
                AURAPRAXIS
              </h1>
              <p className="text-xs font-bold tracking-[0.6em] text-gold-rich uppercase opacity-60">
                Elite Legal Intelligence
              </p>
            </motion.div>
          </div>

          {/* Loading Bar */}
          <div className="absolute bottom-20 w-64 h-[2px] bg-white/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut', delay: 0.5 }}
              className="w-full h-full bg-gradient-to-r from-transparent via-gold-rich to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
