import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
};

const FadeIn: React.FC<Props> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
