import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  width?: string;
  height?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: string | number;
  style?: string;
  transformOrigin?: string;
  delay?: number;
  duration?: number;
};

const DrawLine = ({
  width = '100%',
  height = '5px',
  top,
  bottom,
  left,
  right,
  rotate,
  transformOrigin = 'top left',
  style,
  delay,
  duration = 0.7,
}: Props) => {
  return (
    <motion.span
      initial={{
        opacity: 0,
        width: 0,
        height: 0,
        position: 'absolute',
        top: top ?? '',
        bottom: bottom ?? '',
        left: left ?? '',
        right: right ?? '',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: transformOrigin ?? 'left',
        zIndex: 2,
      }}
      animate={{
        opacity: 1,
        width: width,
        height: height,
        position: 'absolute',
        top: top ?? '',
        bottom: bottom ?? '',
        left: left ?? '',
        right: right ?? '',
        transform: `rotate(${rotate}deg)`,
        transition: {
          duration: duration,
          ease: 'easeInOut',
          delay: delay,
          type: 'spring',
          stiffness: 100,
          mass: 0.2,
          damping: 40,
        },
        zIndex: 2,
      }}
      exit={{
        width: '0',
        transform: `rotate(${rotate}deg)`,
        transition: { duration: duration },
      }}
      style={{
        height: height,
        zIndex: 99,
      }}
      className={`${style} bg-white`}
    ></motion.span>
  );
};

export default DrawLine;
