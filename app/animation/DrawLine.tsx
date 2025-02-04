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
          duration: 1,
          ease: 'easeInOut',
          delay: delay,
        },
        zIndex: 2,
      }}
      exit={{
        width: '0',
        transform: `rotate(${rotate}deg)`,
        transition: { duration: 1 },
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
