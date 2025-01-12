import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  x1: number;
  y1: number;
  x2: number;
  y2: number; // Ending y coordinate
  strokeColor?: string; // Color of the line
};

const SvgLine = ({ x1, y1, x2, y2, strokeColor = 'black' }: Props) => {
  return (
    <svg style={{ position: 'absolute', zIndex: 99 }}>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth="5"
        initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
        animate={{ strokeDashoffset: 0 }}
        exit={{ strokeDashoffset: 1000 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  );
};

export default SvgLine;
