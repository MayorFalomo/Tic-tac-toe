import FadeIn from '@/app/animation/FadeIn';
import { useTheme } from '@/app/ThemeContext';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrawLine from '@/app/animation/DrawLine';

const Preload = () => {
  const { currentTheme } = useTheme();
  const [start, setStart] = useState(false);

  return (
    <FadeIn>
      <div className={`h-screen w-screen bg-black `}>
        <div className="h-full flex items-center justify-center ">
          <div className="relative flex items-center gap-[40px] text-white">
            <motion.img
              src="/SelectX.png"
              className="m-auto w-[70px] h-[70px]"
              width={70}
              height={70}
              alt="img"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.2,
                },
              }}
            />
            <motion.span
              className={`${
                currentTheme === 'light' ? 'text-brightGreen' : 'text-brightGreen'
              } text-[30px]`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.4,
                },
              }}
            >
              &{' '}
            </motion.span>
            <motion.img
              src="/SelectO.png"
              className="m-auto w-[70px] h-[70px] "
              width={70}
              height={70}
              alt="img"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.6,
                },
              }}
              onAnimationComplete={() => setStart(true)}
            />
            <AnimatePresence>
              {start && (
                <DrawLine
                  width="100%"
                  height="2px"
                  top={'45%'}
                  left="0px"
                  rotate="0"
                  delay={0.2}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default Preload;
