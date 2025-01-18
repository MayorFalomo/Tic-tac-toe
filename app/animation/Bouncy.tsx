import { motion } from 'framer-motion';
import React from 'react';

const Bouncy = ({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 12,
        mass: 1.2,
        velocity: 2,
      }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Bouncy;
