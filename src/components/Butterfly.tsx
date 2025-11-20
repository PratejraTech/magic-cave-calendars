import React from 'react';
import { motion } from 'framer-motion';

interface ButterflyProps {
  onAnimationComplete?: () => void;
}

export const Butterfly: React.FC<ButterflyProps> = ({ onAnimationComplete }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      onAnimationComplete={onAnimationComplete}
      style={{
        width: 100,
        height: 100,
        position: 'absolute',
        top: '50%',
        left: '50%',
        x: '-50%',
        y: '-50%',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        <motion.path
          d="M 50,50 m -25,-10 a 25,25 0 1,0 50,0"
          fill="#ff69b4"
          animate={{
            d: [
              'M 50,50 m -25,-10 a 25,25 0 1,0 50,0',
              'M 50,50 m -40,-10 a 40,25 0 1,0 80,0',
              'M 50,50 m -25,-10 a 25,25 0 1,0 50,0',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.path
          d="M 50,50 m -25,10 a 25,25 0 1,0 50,0"
          fill="#ff69b4"
          animate={{
            d: [
              'M 50,50 m -25,10 a 25,25 0 1,0 50,0',
              'M 50,50 m -40,10 a 40,25 0 1,0 80,0',
              'M 50,50 m -25,10 a 25,25 0 1,0 50,0',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </motion.div>
  );
};
